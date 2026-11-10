// Google Drive Free Storage Service for "دليلك الجامعي"
// 15GB Cloud Storage Architecture via Google Drive API (OAuth 2.0)
import { auth, db } from './firebase';
import {
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy
} from 'firebase/firestore';

export interface DriveFileItem {
  id: string;
  fileId: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  sizeFormatted: string;
  previewUrl: string;
  downloadUrl: string;
  thumbnailUrl?: string;
  category: 'video' | 'pdf' | 'image' | 'other';
  subject?: string;
  uploadedAt: string;
  uploadedBy?: string;
}

export interface DriveStorageQuota {
  limitBytes: number;
  usageBytes: number;
  usageInDriveBytes: number;
  usageInDriveTrashBytes: number;
  limitFormatted: string;
  usageFormatted: string;
  freeFormatted: string;
  percentUsed: number;
}

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
const APP_FOLDER_NAME = 'دليلك الجامعي - الوسائط والمحاضرات';

let cachedAccessToken: string | null = null;
let isSigningIn = false;
let cachedFolderId: string | null = null;

// Helper to format bytes to KB, MB, GB
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 بايت';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['بايت', 'كيلوبايت', 'ميجابايت', 'جيجابايت', 'تيرابايت'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export class GoogleDriveService {
  /**
   * Initialize listener for Google auth state and token retention
   */
  static initAuth(
    onSuccess?: (user: User, token: string) => void,
    onFailure?: () => void
  ) {
    return onAuthStateChanged(auth, async (user) => {
      if (user && cachedAccessToken) {
        if (onSuccess) onSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onFailure) onFailure();
      }
    });
  }

  /**
   * Check if currently connected with a valid access token
   */
  static isConnected(): boolean {
    return Boolean(cachedAccessToken);
  }

  static getAccessToken(): string | null {
    return cachedAccessToken;
  }

  /**
   * Connect and authorize Google Drive using popup
   */
  static async connectGoogleDrive(): Promise<{ user: User; accessToken: string }> {
    try {
      isSigningIn = true;
      const provider = new GoogleAuthProvider();
      SCOPES.forEach((s) => provider.addScope(s));
      provider.setCustomParameters({ prompt: 'consent' });

      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);

      if (!credential?.accessToken) {
        throw new Error('لم يتم استلام رمز المصادقة من Google Drive');
      }

      cachedAccessToken = credential.accessToken;
      return { user: result.user, accessToken: cachedAccessToken };
    } catch (error: any) {
      console.error('Google Drive Auth Error:', error);
      throw error;
    } finally {
      isSigningIn = false;
    }
  }

  /**
   * Sign out and clear cached token
   */
  static async disconnect(): Promise<void> {
    try {
      await auth.signOut();
    } finally {
      cachedAccessToken = null;
      cachedFolderId = null;
    }
  }

  /**
   * Get or create dedicated folder in user's Drive
   */
  static async getOrCreateAppFolder(token: string): Promise<string> {
    if (cachedFolderId) return cachedFolderId;

    // Search for existing folder
    const searchRes = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=name='${encodeURIComponent(
        APP_FOLDER_NAME
      )}' and mimeType='application/vnd.google-apps.folder' and trashed=false&fields=files(id,name)`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    if (searchRes.ok) {
      const data = await searchRes.json();
      if (data.files && data.files.length > 0) {
        cachedFolderId = data.files[0].id;
        return cachedFolderId!;
      }
    }

    // Create folder
    const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: APP_FOLDER_NAME,
        mimeType: 'application/vnd.google-apps.folder'
      })
    });

    if (!createRes.ok) {
      throw new Error('فشل إنشاء مجلد دليلك الجامعي على Google Drive');
    }

    const folderData = await createRes.json();
    cachedFolderId = folderData.id;
    return cachedFolderId!;
  }

  /**
   * Upload file to Google Drive (Multipart upload)
   * And set permission to "anyone with link can view" so students don't need Google logins
   */
  static async uploadFile({
    file,
    category,
    subject
  }: {
    file: File;
    category: 'video' | 'pdf' | 'image' | 'other';
    subject?: string;
  }): Promise<DriveFileItem> {
    const token = cachedAccessToken;
    if (!token) {
      throw new Error('يرجى تسجيل الدخول إلى Google Drive أولاً');
    }

    const folderId = await this.getOrCreateAppFolder(token);

    // 1. Prepare Multipart Body
    const metadata = {
      name: file.name,
      parents: [folderId],
      description: `تم الرفع عبر منصة دليلك الجامعي • القسم: ${category}`
    };

    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const metadataPart = `${delimiter}Content-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(
      metadata
    )}`;

    const fileReader = new FileReader();
    const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
      fileReader.onload = () => resolve(fileReader.result as ArrayBuffer);
      fileReader.onerror = reject;
      fileReader.readAsArrayBuffer(file);
    });

    const fileType = file.type || 'application/octet-stream';
    const mediaPartHeader = `${delimiter}Content-Type: ${fileType}\r\n\r\n`;

    const enc = new TextEncoder();
    const part1 = enc.encode(metadataPart);
    const part2 = enc.encode(mediaPartHeader);
    const part4 = enc.encode(closeDelimiter);

    const fullLength = part1.byteLength + part2.byteLength + arrayBuffer.byteLength + part4.byteLength;
    const combined = new Uint8Array(fullLength);

    combined.set(part1, 0);
    combined.set(part2, part1.byteLength);
    combined.set(new Uint8Array(arrayBuffer), part1.byteLength + part2.byteLength);
    combined.set(part4, part1.byteLength + part2.byteLength + arrayBuffer.byteLength);

    // 2. Upload to Drive API
    const uploadRes = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,size,webViewLink,webContentLink,thumbnailLink',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': `multipart/related; boundary=${boundary}`
        },
        body: combined
      }
    );

    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      throw new Error(`فشل رفع الملف إلى Google Drive: ${errText}`);
    }

    const uploaded = await uploadRes.json();
    const fileId = uploaded.id;

    // 3. Make file public for all students (No login required to view)
    try {
      await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          role: 'reader',
          type: 'anyone'
        })
      });
    } catch (permErr) {
      console.warn('Could not set public permission on Drive file:', permErr);
    }

    // Direct links
    const previewUrl = `https://drive.google.com/file/d/${fileId}/preview`;
    const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
    const thumbnailUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;

    const driveItem: DriveFileItem = {
      id: `drive_${fileId}`,
      fileId,
      name: file.name,
      mimeType: fileType,
      sizeBytes: file.size,
      sizeFormatted: formatBytes(file.size),
      previewUrl,
      downloadUrl,
      thumbnailUrl,
      category,
      subject: subject || 'عام',
      uploadedAt: new Date().toISOString(),
      uploadedBy: auth.currentUser?.email || 'مسؤول المنصة'
    };

    // 4. Save metadata record to Firestore
    try {
      await setDoc(doc(db, 'drive_files', driveItem.id), driveItem);
    } catch (fsErr) {
      console.warn('Saved to Drive but failed Firestore sync:', fsErr);
    }

    return driveItem;
  }

  /**
   * Fetch all files saved in Firestore
   */
  static async getFiles(): Promise<DriveFileItem[]> {
    try {
      const q = query(collection(db, 'drive_files'), orderBy('uploadedAt', 'desc'));
      const snap = await getDocs(q);
      const items: DriveFileItem[] = [];
      snap.forEach((d) => items.push(d.data() as DriveFileItem));
      return items;
    } catch {
      // Fallback if index is building or empty
      const snap = await getDocs(collection(db, 'drive_files'));
      const items: DriveFileItem[] = [];
      snap.forEach((d) => items.push(d.data() as DriveFileItem));
      return items;
    }
  }

  /**
   * Delete a file from Google Drive and Firestore
   */
  static async deleteFile(item: DriveFileItem): Promise<void> {
    const token = cachedAccessToken;
    if (token) {
      try {
        await fetch(`https://www.googleapis.com/drive/v3/files/${item.fileId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (e) {
        console.warn('Could not delete from Drive directly:', e);
      }
    }

    // Remove from Firestore
    await deleteDoc(doc(db, 'drive_files', item.id));
  }

  /**
   * Fetch storage quota details (15GB free tier stats)
   */
  static async getStorageQuota(): Promise<DriveStorageQuota | null> {
    const token = cachedAccessToken;
    if (!token) return null;

    try {
      const res = await fetch(
        'https://www.googleapis.com/drive/v3/about?fields=storageQuota',
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (!res.ok) return null;
      const data = await res.json();
      const quota = data.storageQuota;

      const limit = parseInt(quota.limit || '16106127360', 10); // default 15GB in bytes
      const usage = parseInt(quota.usage || '0', 10);
      const usageInDrive = parseInt(quota.usageInDrive || '0', 10);
      const usageInDriveTrash = parseInt(quota.usageInDriveTrash || '0', 10);

      const free = Math.max(0, limit - usage);
      const percentUsed = Math.min(100, Math.round((usage / (limit || 1)) * 100));

      return {
        limitBytes: limit,
        usageBytes: usage,
        usageInDriveBytes: usageInDrive,
        usageInDriveTrashBytes: usageInDriveTrash,
        limitFormatted: formatBytes(limit),
        usageFormatted: formatBytes(usage),
        freeFormatted: formatBytes(free),
        percentUsed
      };
    } catch {
      return null;
    }
  }
}
