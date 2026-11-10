import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  initializeFirestore,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  writeBatch,
  setLogLevel
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Subject, Lecture, StudyResource, ArticleItem, VideoItem, CollegeInfoData, TickerItem } from '../types';
import { COLLEGE_INFO, SUBJECTS_DATA, DEFAULT_ARTICLES, DEFAULT_VIDEOS, STUDY_RESOURCES } from '../data/academicContent';

import { getAuth } from 'firebase/auth';

// Silence verbose connection notices
setLogLevel('error');

// Initialize Firebase with direct forced long polling for 100% reliable connection in iframe/proxy environments
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const FIRESTORE_DATABASE_ID =
  (firebaseConfig as any).firestoreDatabaseId || 'ai-studio-fbb922c0-8b2e-4e61-a574-1d9176292ec7';

export const db = initializeFirestore(
  app,
  { experimentalForceLongPolling: true },
  FIRESTORE_DATABASE_ID
);
export const auth = getAuth(app);

// Types for Admin & Dynamic Site Config
export interface SectionVisibility {
  newsTicker: boolean;
  heroSection: boolean;
  heroStats: boolean;
  heroButtons: boolean;
  telegramCard: boolean;
  collegeInfoSection: boolean;
  subjectsSection: boolean;
  scheduleSection: boolean;
  resourcesSection: boolean;
  articlesSection: boolean;
  videosSection: boolean;
  gpaCalculator: boolean;
  pomodoroTimer: boolean;
  announcementsBanner: boolean;
  contactFooter: boolean;
  pwaInstallPrompt: boolean;
}

export interface ButtonConfig {
  id: string;
  label: string;
  link: string;
  type: 'primary' | 'secondary' | 'outline' | 'telegram';
  visible: boolean;
}

export interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  badge: string;
  link?: string;
  visible: boolean;
  createdAt: string;
}

export interface MediaItem {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'pdf' | 'video' | 'logo';
  size?: string;
  category?: string;
  visible: boolean;
  createdAt: string;
}

export interface AdminLogItem {
  id: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface SiteConfig {
  siteTitle: string;
  siteSubtitle: string;
  heroTitle: string;
  heroSubtitle: string;
  heroBadgeText: string;
  heroPrimaryBtnText: string;
  heroPrimaryBtnLink: string;
  telegramBotName: string;
  telegramBotLink: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  footerCopyright: string;
  footerAboutText: string;
  siteLogoUrl: string;
  heroBgUrl: string;
  primaryColor: string; // hex or tailwind class
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  sectionVisibility: SectionVisibility;
  buttons: ButtonConfig[];
  tickerSpeed?: 'slow' | 'normal' | 'fast';
  tickerTitle?: string;
}

export const DEFAULT_TICKER_ITEMS: TickerItem[] = [
  {
    id: 'ticker-1',
    text: 'مرحباً بكم في منصة دليلك الجامعي الأكاديمية الشاملة لكليتنا',
    badge: 'ترحيب',
    link: 'main',
    visible: true,
    order: 1,
    createdAt: new Date().toISOString()
  },
  {
    id: 'ticker-2',
    text: 'تم إطلاق ميزة التقويم الشهري التفاعلي الجديد في قسم الجدول الدراسي',
    badge: 'جديد',
    link: 'schedule',
    visible: true,
    order: 2,
    createdAt: new Date().toISOString()
  },
  {
    id: 'ticker-3',
    text: 'يمكنك الآن تفعيل الإشعارات اللحظية للتذكير بمواعيد المحاضرات الأكاديمية والامتحانات',
    badge: 'تنبيه',
    link: 'schedule',
    visible: true,
    order: 3,
    createdAt: new Date().toISOString()
  },
  {
    id: 'ticker-4',
    text: 'انضم إلى بوت وقناة التلجرام الرسمية للحصول على أحدث الملخصات والمراجع والمحاضرات',
    badge: 'هام',
    link: 'http://t.me/Daleelak_AlJamaei_bot',
    visible: true,
    order: 4,
    createdAt: new Date().toISOString()
  }
];

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  siteTitle: 'دليلك الجامعي',
  siteSubtitle: 'جامعتك في جيبك',
  heroTitle: 'ابدأ رحلتك الأكاديمية بذكاء وتنظيم',
  heroSubtitle: 'منصة أكاديمية كاملة لمتابعة الجداول والكتب والملخصات وتنبيهات المحاضرات الفورية مع ربط التلجرام.',
  heroBadgeText: 'مرحباً بك، طالب الكلية',
  heroPrimaryBtnText: 'دخول للوحة الرئيسية',
  heroPrimaryBtnLink: 'main',
  telegramBotName: '@Daleelak_AlJamaei_bot',
  telegramBotLink: 'http://t.me/Daleelak_AlJamaei_bot',
  contactEmail: 'contact@daleelak-jamei.edu',
  contactPhone: '+966 50 000 0000',
  contactAddress: 'مبنى المجمع الأكاديمي الرئيسي - قاعة 101',
  footerCopyright: 'جميع الحقوق محفوظة © ' + new Date().getFullYear() + ' - دليلك الجامعي',
  footerAboutText: 'منصة أكاديمية شاملة ومصممة خصيصاً لمساعدة الطلاب الجامعيين في تنقيح المواد والأكاديميا وإدارة المحاضرات بمرونة عالية.',
  siteLogoUrl: '',
  heroBgUrl: '',
  primaryColor: '#2563eb', // blue-600
  seoTitle: 'دليلك الجامعي - جامعتك في جيبك',
  seoDescription: 'دليل رقمي شامل للطلاب الجامعيين لتنظيم المحاضرات وتصفح المواد والمصادر.',
  seoKeywords: 'جامعة, محاضرات, طب, تشريح, وظائف أعضاء, كيمياء حيوية, جدول دراسي, GPA',
  tickerSpeed: 'fast',
  tickerTitle: 'شريط الأخبار والتنبيهات',
  sectionVisibility: {
    newsTicker: true,
    heroSection: true,
    heroStats: true,
    heroButtons: true,
    telegramCard: true,
    collegeInfoSection: true,
    subjectsSection: true,
    scheduleSection: true,
    resourcesSection: true,
    articlesSection: true,
    videosSection: true,
    gpaCalculator: true,
    pomodoroTimer: true,
    announcementsBanner: true,
    contactFooter: true,
    pwaInstallPrompt: true,
  },
  buttons: [
    { id: 'btn-enter', label: 'دخول اللوحة', link: 'main', type: 'primary', visible: true },
    { id: 'btn-telegram', label: 'بوت التلجرام', link: 'http://t.me/Daleelak_AlJamaei_bot', type: 'telegram', visible: true },
    { id: 'btn-gpa', label: 'حاسبة المعدل GPA', link: 'gpa', type: 'secondary', visible: true },
    { id: 'btn-pomodoro', label: 'مؤقت التركيز', link: 'pomodoro', type: 'secondary', visible: true },
  ]
};

const SITE_CONFIG_DOC_ID = 'general';
const COLLEGE_INFO_DOC_ID = 'about_college';
const LOCAL_STORAGE_SITE_CONFIG_KEY = 'daleelak_site_config_v2';

function getCachedSiteConfig(): SiteConfig {
  if (typeof window === 'undefined') return DEFAULT_SITE_CONFIG;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_SITE_CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_SITE_CONFIG,
        ...parsed,
        sectionVisibility: {
          ...DEFAULT_SITE_CONFIG.sectionVisibility,
          ...(parsed.sectionVisibility || {})
        }
      };
    }
  } catch {
    // Ignore JSON error
  }
  return DEFAULT_SITE_CONFIG;
}

function saveCachedSiteConfig(config: SiteConfig): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_SITE_CONFIG_KEY, JSON.stringify(config));
    window.dispatchEvent(new CustomEvent('daleelak-site-config-updated', { detail: config }));
  } catch (e) {
    console.warn('Failed saving site config to localStorage:', e);
  }
}

export class FirebaseService {
  // 1. Subscribe to Site Config Real-time Updates with Instant Local Cache
  static subscribeSiteConfig(callback: (config: SiteConfig) => void): () => void {
    // Deliver instantly from local cache
    const initialCached = getCachedSiteConfig();
    callback(initialCached);

    // Listen to local update events across components
    const handleLocalUpdate = (e: Event) => {
      const customEvt = e as CustomEvent<SiteConfig>;
      if (customEvt.detail) {
        callback(customEvt.detail);
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('daleelak-site-config-updated', handleLocalUpdate);
    }

    const docRef = doc(db, 'site_config', SITE_CONFIG_DOC_ID);
    const unsubFirestore = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as Partial<SiteConfig>;
        const merged: SiteConfig = {
          ...DEFAULT_SITE_CONFIG,
          ...data,
          sectionVisibility: {
            ...DEFAULT_SITE_CONFIG.sectionVisibility,
            ...(data.sectionVisibility || {})
          }
        };
        saveCachedSiteConfig(merged);
        callback(merged);
      } else {
        // Initialize default config in firestore
        setDoc(docRef, DEFAULT_SITE_CONFIG).catch(() => {});
        callback(DEFAULT_SITE_CONFIG);
      }
    }, (error) => {
      console.warn('Firestore site_config snapshot error, fallback to cache:', error);
      callback(getCachedSiteConfig());
    });

    return () => {
      unsubFirestore();
      if (typeof window !== 'undefined') {
        window.removeEventListener('daleelak-site-config-updated', handleLocalUpdate);
      }
    };
  }

  // 2. Save / Update Site Config with Instant UI Propagation & Safe Timeout
  static async updateSiteConfig(partialConfig: Partial<SiteConfig>): Promise<void> {
    const current = getCachedSiteConfig();
    const updated: SiteConfig = {
      ...current,
      ...partialConfig,
      sectionVisibility: {
        ...current.sectionVisibility,
        ...(partialConfig.sectionVisibility || {})
      }
    };

    // 1. Immediately apply to local cache & active UI
    saveCachedSiteConfig(updated);

    // 2. Write to Firestore with safe timeout so the UI never hangs
    try {
      const docRef = doc(db, 'site_config', SITE_CONFIG_DOC_ID);
      await Promise.race([
        setDoc(docRef, updated, { merge: true }),
        new Promise((resolve) => setTimeout(resolve, 5000))
      ]);
      
      // Async non-blocking log
      this.addAdminLog('تحديث بيانات الموقع', 'تم تعديل الإعدادات العامة ونصوص الموقع').catch(() => {});
    } catch (err) {
      console.warn('Network sync for site config:', err);
    }
  }

  // 3. Toggle Individual Section Visibility Switch
  static async toggleSectionVisibility(sectionKey: keyof SectionVisibility, value: boolean): Promise<void> {
    const current = getCachedSiteConfig();
    const updatedVisibility = {
      ...current.sectionVisibility,
      [sectionKey]: value
    };
    await this.updateSiteConfig({ sectionVisibility: updatedVisibility });
    this.addAdminLog('تغيير حالة ظهور قسم', `تم تغيير قسم ${sectionKey} إلى ${value ? 'تفعيل ON' : 'إخفاء OFF'}`).catch(() => {});
  }

  // 4. Articles Management
  static subscribeArticles(callback: (articles: ArticleItem[]) => void): () => void {
    const colRef = collection(db, 'articles');
    return onSnapshot(colRef, (snapshot) => {
      const articles: ArticleItem[] = [];
      snapshot.forEach(docSnap => {
        articles.push({ id: docSnap.id, ...docSnap.data() } as ArticleItem);
      });
      articles.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      if (articles.length === 0) {
        callback(DEFAULT_ARTICLES);
      } else {
        callback(articles);
      }
    }, (err) => {
      console.warn('Articles snapshot error, fallback to defaults:', err);
      callback(DEFAULT_ARTICLES);
    });
  }

  static async addArticle(item: Omit<ArticleItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const colRef = collection(db, 'articles');
    const now = new Date().toISOString();
    const docRef = await addDoc(colRef, {
      ...item,
      createdAt: now,
      updatedAt: now
    });
    await this.addAdminLog('إضافة مقال جديد', `عنوان المقال: ${item.title} (${item.status})`);
    return docRef.id;
  }

  static async updateArticle(id: string, partial: Partial<ArticleItem>): Promise<void> {
    const docRef = doc(db, 'articles', id);
    await updateDoc(docRef, {
      ...partial,
      updatedAt: new Date().toISOString()
    });
    await this.addAdminLog('تحديث مقال', `معرف المقال: ${id}`);
  }

  static async deleteArticle(id: string): Promise<void> {
    const docRef = doc(db, 'articles', id);
    await deleteDoc(docRef);
    await this.addAdminLog('حذف مقال', `معرف المقال: ${id}`);
  }

  // 5. Video Management
  static subscribeVideos(callback: (videos: VideoItem[]) => void): () => void {
    const colRef = collection(db, 'videos');
    return onSnapshot(colRef, (snapshot) => {
      const videos: VideoItem[] = [];
      snapshot.forEach(docSnap => {
        videos.push({ id: docSnap.id, ...docSnap.data() } as VideoItem);
      });
      videos.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      if (videos.length === 0) {
        callback(DEFAULT_VIDEOS);
      } else {
        callback(videos);
      }
    }, (err) => {
      console.warn('Videos snapshot error, fallback to defaults:', err);
      callback(DEFAULT_VIDEOS);
    });
  }

  static async addVideo(item: Omit<VideoItem, 'id' | 'createdAt'>): Promise<string> {
    const colRef = collection(db, 'videos');
    const docRef = await addDoc(colRef, {
      ...item,
      createdAt: new Date().toISOString()
    });
    await this.addAdminLog('إضافة فيديو جديد', `عنوان الفيديو: ${item.title}`);
    return docRef.id;
  }

  static async seedDefaultArticlesAndVideos(): Promise<void> {
    const colArt = collection(db, 'articles');
    for (const art of DEFAULT_ARTICLES) {
      await addDoc(colArt, {
        title: art.title,
        subtitle: art.subtitle || '',
        category: art.category || 'عام',
        status: art.status,
        author: art.author || 'هيئة الإرشاد الأكاديمي',
        coverImage: art.coverImage || '',
        content: art.content,
        createdAt: art.createdAt || new Date().toISOString(),
        updatedAt: art.updatedAt || new Date().toISOString()
      });
    }
    const colVid = collection(db, 'videos');
    for (const vid of DEFAULT_VIDEOS) {
      await addDoc(colVid, {
        title: vid.title,
        description: vid.description || '',
        videoUrl: vid.videoUrl,
        thumbnailUrl: vid.thumbnailUrl || '',
        duration: vid.duration || '00:00',
        order: vid.order || 1,
        visible: vid.visible !== false,
        fileType: vid.fileType || 'video/mp4',
        createdAt: vid.createdAt || new Date().toISOString()
      });
    }
    await this.addAdminLog('استيراد البيانات النموذجية', 'تم استيراد المقالات والفيديوهات الأكاديمية بنجاح');
  }

  static async updateVideo(id: string, partial: Partial<VideoItem>): Promise<void> {
    const docRef = doc(db, 'videos', id);
    await updateDoc(docRef, partial);
    await this.addAdminLog('تحديث فيديو', `معرف الفيديو: ${id}`);
  }

  static async deleteVideo(id: string): Promise<void> {
    const docRef = doc(db, 'videos', id);
    await deleteDoc(docRef);
    await this.addAdminLog('حذف فيديو', `معرف الفيديو: ${id}`);
  }

  // 6. About College Section Info
  static subscribeCollegeInfo(callback: (data: CollegeInfoData) => void): () => void {
    const docRef = doc(db, 'college_info', COLLEGE_INFO_DOC_ID);
    return onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as CollegeInfoData;
        callback({
          title: data.title || COLLEGE_INFO.title,
          tagline: data.tagline || COLLEGE_INFO.tagline,
          image: data.image || COLLEGE_INFO.image,
          overview: data.overview || COLLEGE_INFO.overview,
          creditSystem: data.creditSystem || COLLEGE_INFO.creditSystem,
          survivalTips: data.survivalTips && data.survivalTips.length > 0
            ? data.survivalTips
            : COLLEGE_INFO.survivalTips.map((t, idx) => ({ id: 'tip-' + idx, ...t })),
          customSections: data.customSections || []
        });
      } else {
        const initialDefault: CollegeInfoData = {
          title: COLLEGE_INFO.title,
          tagline: COLLEGE_INFO.tagline,
          image: COLLEGE_INFO.image,
          overview: COLLEGE_INFO.overview,
          creditSystem: COLLEGE_INFO.creditSystem,
          survivalTips: COLLEGE_INFO.survivalTips.map((t, idx) => ({ id: 'tip-' + idx, ...t })),
          customSections: []
        };
        setDoc(docRef, initialDefault);
        callback(initialDefault);
      }
    }, (err) => {
      console.warn('College info snapshot error:', err);
      callback({
        title: COLLEGE_INFO.title,
        tagline: COLLEGE_INFO.tagline,
        image: COLLEGE_INFO.image,
        overview: COLLEGE_INFO.overview,
        creditSystem: COLLEGE_INFO.creditSystem,
        survivalTips: COLLEGE_INFO.survivalTips.map((t, idx) => ({ id: 'tip-' + idx, ...t })),
        customSections: []
      });
    });
  }

  static async updateCollegeInfo(data: Partial<CollegeInfoData>): Promise<void> {
    const docRef = doc(db, 'college_info', COLLEGE_INFO_DOC_ID);
    await setDoc(docRef, data, { merge: true });
    await this.addAdminLog('تحديث قسم الكلية', 'تم تعديل ومعالجة معلومات عن الكلية');
  }

  // 7. Academic Subjects Data
  static subscribeSubjects(callback: (subjects: Subject[]) => void): () => void {
    const colRef = collection(db, 'subjects_data');
    return onSnapshot(colRef, (snapshot) => {
      if (!snapshot.empty) {
        const subjects: Subject[] = [];
        snapshot.forEach(docSnap => {
          subjects.push({ id: docSnap.id, ...docSnap.data() } as Subject);
        });
        callback(subjects);
      } else {
        // Populate default subjects if empty
        SUBJECTS_DATA.forEach(async (sub) => {
          const docRef = doc(db, 'subjects_data', sub.id);
          await setDoc(docRef, sub);
        });
        callback(SUBJECTS_DATA);
      }
    }, (err) => {
      console.warn('Subjects snapshot error:', err);
      callback(SUBJECTS_DATA);
    });
  }

  static async addSubject(sub: Subject): Promise<void> {
    const docRef = doc(db, 'subjects_data', sub.id);
    await setDoc(docRef, sub);
    await this.addAdminLog('إضافة مادة أكاديمية', `اسم المادة: ${sub.nameAr}`);
  }

  static async updateSubject(id: string, partial: Partial<Subject>): Promise<void> {
    const docRef = doc(db, 'subjects_data', id);
    await updateDoc(docRef, partial);
    await this.addAdminLog('تحديث مادة أكاديمية', `معرف المادة: ${id}`);
  }

  static async deleteSubject(id: string): Promise<void> {
    const docRef = doc(db, 'subjects_data', id);
    await deleteDoc(docRef);
    await this.addAdminLog('حذف مادة أكاديمية', `معرف المادة: ${id}`);
  }

  // 8. Announcements & Ads Manager
  static subscribeAnnouncements(callback: (items: AnnouncementItem[]) => void): () => void {
    const colRef = collection(db, 'announcements');
    return onSnapshot(colRef, (snapshot) => {
      const items: AnnouncementItem[] = [];
      snapshot.forEach(docSnap => {
        items.push({ id: docSnap.id, ...docSnap.data() } as AnnouncementItem);
      });
      callback(items);
    }, (err) => {
      console.warn('Announcements snapshot error:', err);
      callback([]);
    });
  }

  static async addAnnouncement(item: Omit<AnnouncementItem, 'id' | 'createdAt'>): Promise<void> {
    const colRef = collection(db, 'announcements');
    await addDoc(colRef, {
      ...item,
      createdAt: new Date().toISOString()
    });
    await this.addAdminLog('إضافة إعلان/تنبيه جديد', `عنوان: ${item.title}`);
  }

  static async updateAnnouncement(id: string, partial: Partial<AnnouncementItem>): Promise<void> {
    const docRef = doc(db, 'announcements', id);
    await updateDoc(docRef, partial);
    await this.addAdminLog('تحديث إعلان', `معرف الإعلان: ${id}`);
  }

  static async deleteAnnouncement(id: string): Promise<void> {
    const docRef = doc(db, 'announcements', id);
    await deleteDoc(docRef);
    await this.addAdminLog('حذف إعلان', `معرف الإعلان: ${id}`);
  }

  // 9. Media & Assets Manager
  static subscribeMedia(callback: (items: MediaItem[]) => void): () => void {
    const colRef = collection(db, 'media');
    return onSnapshot(colRef, (snapshot) => {
      const items: MediaItem[] = [];
      snapshot.forEach(docSnap => {
        items.push({ id: docSnap.id, ...docSnap.data() } as MediaItem);
      });
      callback(items);
    }, (err) => {
      console.warn('Media snapshot error:', err);
      callback([]);
    });
  }

  static async addMedia(item: Omit<MediaItem, 'id' | 'createdAt'>): Promise<void> {
    const colRef = collection(db, 'media');
    await addDoc(colRef, {
      ...item,
      createdAt: new Date().toISOString()
    });
    await this.addAdminLog('إضافة ملف ميديا', `اسم: ${item.name} (${item.type})`);
  }

  static async updateMedia(id: string, partial: Partial<MediaItem>): Promise<void> {
    const docRef = doc(db, 'media', id);
    await updateDoc(docRef, partial);
    await this.addAdminLog('تحديث ملف ميديا', `معرف الملف: ${id}`);
  }

  static async deleteMedia(id: string): Promise<void> {
    const docRef = doc(db, 'media', id);
    await deleteDoc(docRef);
    await this.addAdminLog('حذف ملف ميديا', `معرف الملف: ${id}`);
  }

  // 10. Admin Action Audit Logs
  static subscribeAdminLogs(callback: (logs: AdminLogItem[]) => void): () => void {
    const colRef = collection(db, 'admin_logs');
    return onSnapshot(colRef, (snapshot) => {
      const logs: AdminLogItem[] = [];
      snapshot.forEach(docSnap => {
        logs.push({ id: docSnap.id, ...docSnap.data() } as AdminLogItem);
      });
      // Sort newest first
      logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      callback(logs.slice(0, 50));
    }, (err) => {
      console.warn('Admin logs snapshot error:', err);
      callback([]);
    });
  }

  static async addAdminLog(action: string, details: string): Promise<void> {
    try {
      const colRef = collection(db, 'admin_logs');
      await addDoc(colRef, {
        action,
        details,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error('Error writing admin log:', err);
    }
  }

  // 11. News Ticker (شريط الأخبار المتحرك)
  static subscribeTicker(callback: (items: TickerItem[]) => void): () => void {
    const colRef = collection(db, 'ticker_items');
    return onSnapshot(colRef, (snapshot) => {
      if (!snapshot.empty) {
        const items: TickerItem[] = [];
        snapshot.forEach(docSnap => {
          items.push({ id: docSnap.id, ...docSnap.data() } as TickerItem);
        });
        items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        callback(items);
      } else {
        // If empty in Firestore, populate default ticker items and return them
        DEFAULT_TICKER_ITEMS.forEach(async (item) => {
          try {
            const docRef = doc(db, 'ticker_items', item.id);
            await setDoc(docRef, item);
          } catch (e) {
            console.warn('Error populating default ticker item:', e);
          }
        });
        callback(DEFAULT_TICKER_ITEMS);
      }
    }, (err) => {
      console.warn('Ticker snapshot error, fallback to defaults:', err);
      callback(DEFAULT_TICKER_ITEMS);
    });
  }

  static async addTickerItem(item: Omit<TickerItem, 'id' | 'createdAt'>): Promise<string> {
    const colRef = collection(db, 'ticker_items');
    const docRef = await addDoc(colRef, {
      ...item,
      createdAt: new Date().toISOString()
    });
    await this.addAdminLog('إضافة خبر للشريط المتحرك', `نص الخبر: ${item.text.slice(0, 40)}...`);
    return docRef.id;
  }

  static async updateTickerItem(id: string, partial: Partial<TickerItem>): Promise<void> {
    const docRef = doc(db, 'ticker_items', id);
    await updateDoc(docRef, partial);
    await this.addAdminLog('تحديث خبر في الشريط المتحرك', `معرف الخبر: ${id}`);
  }

  static async deleteTickerItem(id: string): Promise<void> {
    const docRef = doc(db, 'ticker_items', id);
    await deleteDoc(docRef);
    await this.addAdminLog('حذف خبر من الشريط المتحرك', `معرف الخبر: ${id}`);
  }

  static async seedDefaultTickerItems(): Promise<void> {
    for (const item of DEFAULT_TICKER_ITEMS) {
      const docRef = doc(db, 'ticker_items', item.id);
      await setDoc(docRef, item);
    }
    await this.addAdminLog('استعادة شريط الأخبار الافتراضي', 'تم استرجاع الأخبار النموذجية لشريط الأخبار');
  }

  // 12. Dynamic Study Resources & Digital Library (مصادر الدراسة والمكتبة الرقمية)
  static subscribeStudyResources(callback: (resources: StudyResource[]) => void): () => void {
    const colRef = collection(db, 'study_resources');
    return onSnapshot(colRef, (snapshot) => {
      if (!snapshot.empty) {
        const resources: StudyResource[] = [];
        snapshot.forEach(docSnap => {
          const data = docSnap.data();
          resources.push({
            id: docSnap.id,
            title: data.title || '',
            description: data.description || '',
            link: data.link || data.url || '',
            url: data.url || data.link || '',
            subjectId: data.subjectId || 'general',
            subjectTag: data.subjectTag || data.subjectId || '',
            category: data.category || 'book',
            icon: data.icon || 'BookOpen',
            isExternal: data.isExternal !== false,
            isActive: data.isActive !== false,
            order: data.order ?? 0,
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: data.updatedAt || new Date().toISOString()
          } as StudyResource);
        });
        resources.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        callback(resources);
      } else {
        // If empty in Firestore, populate default study resources
        STUDY_RESOURCES.forEach(async (res, idx) => {
          try {
            const docRef = doc(db, 'study_resources', res.id);
            await setDoc(docRef, {
              title: res.title,
              description: res.description,
              link: res.link,
              url: res.link,
              subjectId: res.subjectId,
              subjectTag: res.subjectId,
              category: res.category,
              icon: res.icon || 'BookOpen',
              isExternal: res.isExternal !== false,
              isActive: true,
              order: idx + 1,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            });
          } catch (e) {
            console.warn('Error seeding study resource:', e);
          }
        });
        callback(STUDY_RESOURCES);
      }
    }, (err) => {
      console.warn('Study resources snapshot error, fallback to defaults:', err);
      callback(STUDY_RESOURCES);
    });
  }

  static async addStudyResource(item: Omit<StudyResource, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const colRef = collection(db, 'study_resources');
    const now = new Date().toISOString();
    const docRef = await addDoc(colRef, {
      title: item.title.trim(),
      description: item.description.trim(),
      link: item.link || item.url || '',
      url: item.url || item.link || '',
      subjectId: item.subjectId || 'general',
      subjectTag: item.subjectTag || item.subjectId || '',
      category: item.category || 'book',
      icon: item.icon || 'BookOpen',
      isExternal: item.isExternal !== false,
      isActive: item.isActive !== false,
      order: item.order ?? 0,
      createdAt: now,
      updatedAt: now
    });
    await this.addAdminLog('إضافة مصدر دراسي جديد', `اسم المصدر: ${item.title}`);
    return docRef.id;
  }

  static async updateStudyResource(id: string, partial: Partial<StudyResource>): Promise<void> {
    const docRef = doc(db, 'study_resources', id);
    const updatePayload: any = {
      ...partial,
      updatedAt: new Date().toISOString()
    };
    if (partial.url && !partial.link) updatePayload.link = partial.url;
    if (partial.link && !partial.url) updatePayload.url = partial.link;
    if (partial.subjectId && !partial.subjectTag) updatePayload.subjectTag = partial.subjectId;
    if (partial.subjectTag && !partial.subjectId) updatePayload.subjectId = partial.subjectTag;

    await updateDoc(docRef, updatePayload);
    await this.addAdminLog('تحديث مصدر دراسي', `معرف المصدر: ${id} (${partial.title || ''})`);
  }

  static async deleteStudyResource(id: string): Promise<void> {
    const docRef = doc(db, 'study_resources', id);
    await deleteDoc(docRef);
    await this.addAdminLog('حذف مصدر دراسي', `معرف المصدر: ${id}`);
  }

  static async seedDefaultStudyResources(): Promise<void> {
    for (let idx = 0; idx < STUDY_RESOURCES.length; idx++) {
      const res = STUDY_RESOURCES[idx];
      const docRef = doc(db, 'study_resources', res.id);
      await setDoc(docRef, {
        title: res.title,
        description: res.description,
        link: res.link,
        url: res.link,
        subjectId: res.subjectId,
        subjectTag: res.subjectId,
        category: res.category,
        icon: res.icon || 'BookOpen',
        isExternal: true,
        isActive: true,
        order: idx + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, { merge: true });
    }
    await this.addAdminLog('استعادة المصادر النموذجية', 'تم استرجاع المصادر الدراسية الافتراضية');
  }

  // 13. Full Backup JSON Export & Import
  static async exportFullData(): Promise<string> {
    const docRef = doc(db, 'site_config', SITE_CONFIG_DOC_ID);
    const snap = await getDoc(docRef);
    const siteConfigData = snap.exists() ? snap.data() : DEFAULT_SITE_CONFIG;

    const annSnap = await getDocs(collection(db, 'announcements'));
    const annData = annSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    const mediaSnap = await getDocs(collection(db, 'media'));
    const mediaData = mediaSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    const artSnap = await getDocs(collection(db, 'articles'));
    const artData = artSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    const vidSnap = await getDocs(collection(db, 'videos'));
    const vidData = vidSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    const tickSnap = await getDocs(collection(db, 'ticker_items'));
    const tickData = tickSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    const resSnap = await getDocs(collection(db, 'study_resources'));
    const resData = resSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    const backupPayload = {
      exportedAt: new Date().toISOString(),
      siteConfig: siteConfigData,
      announcements: annData,
      media: mediaData,
      articles: artData,
      videos: vidData,
      tickerItems: tickData,
      studyResources: resData
    };

    return JSON.stringify(backupPayload, null, 2);
  }

  static async importFullData(jsonString: string): Promise<{ success: boolean; stats: Record<string, number>; errors: string[] }> {
    const errors: string[] = [];
    const stats: Record<string, number> = {
      siteConfig: 0,
      articles: 0,
      videos: 0,
      tickerItems: 0,
      announcements: 0,
      media: 0,
      studyResources: 0
    };

    let parsed: any;
    try {
      parsed = JSON.parse(jsonString);
    } catch (e: any) {
      throw new Error('الملف المرفق غير صالح، يرجى التأكد من اختيار ملف JSON صحيح.');
    }

    if (!parsed || typeof parsed !== 'object') {
      throw new Error('بيانات النسخة الاحتياطية فارغة أو غير متوافقة.');
    }

    // 1. Restore Site Config
    if (parsed.siteConfig && typeof parsed.siteConfig === 'object') {
      try {
        await this.updateSiteConfig(parsed.siteConfig);
        stats.siteConfig = 1;
      } catch (err: any) {
        errors.push(`فشل استعادة الإعدادات العامة: ${err.message}`);
      }
    }

    // Helper for safe batch processing (Firestore limit is 500 writes per batch)
    const restoreCollection = async (
      collectionName: string,
      items: any[],
      statKey: string
    ) => {
      if (!Array.isArray(items) || items.length === 0) return;

      const BATCH_SIZE = 400;
      for (let i = 0; i < items.length; i += BATCH_SIZE) {
        const chunk = items.slice(i, i + BATCH_SIZE);
        const batch = writeBatch(db);

        for (const item of chunk) {
          if (!item || typeof item !== 'object') continue;
          const { id, ...data } = item;
          if (id) {
            const docRef = doc(db, collectionName, String(id));
            batch.set(docRef, data, { merge: true });
          } else {
            const docRef = doc(collection(db, collectionName));
            batch.set(docRef, data, { merge: true });
          }
        }

        try {
          await batch.commit();
          stats[statKey] += chunk.length;
        } catch (err: any) {
          errors.push(`فشل استعادة دفعة من ${collectionName}: ${err.message}`);
        }
      }
    };

    // 2. Restore Articles
    if (Array.isArray(parsed.articles)) {
      await restoreCollection('articles', parsed.articles, 'articles');
    }

    // 3. Restore Videos
    if (Array.isArray(parsed.videos)) {
      await restoreCollection('videos', parsed.videos, 'videos');
    }

    // 4. Restore Ticker Items
    if (Array.isArray(parsed.tickerItems)) {
      await restoreCollection('ticker_items', parsed.tickerItems, 'tickerItems');
    }

    // 5. Restore Announcements
    if (Array.isArray(parsed.announcements)) {
      await restoreCollection('announcements', parsed.announcements, 'announcements');
    }

    // 6. Restore Media
    if (Array.isArray(parsed.media)) {
      await restoreCollection('media', parsed.media, 'media');
    }

    // 7. Restore Study Resources
    if (Array.isArray(parsed.studyResources)) {
      await restoreCollection('study_resources', parsed.studyResources, 'studyResources');
    }

    await this.addAdminLog(
      'استعادة نسخة احتياطية شاملة',
      `تم استرجاع: ${stats.articles} مقال، ${stats.videos} فيديو، ${stats.studyResources} مصدر دراسي، ${stats.tickerItems} خبر، إعدادات: ${stats.siteConfig}`
    );

    return {
      success: errors.length === 0,
      stats,
      errors
    };
  }
}

