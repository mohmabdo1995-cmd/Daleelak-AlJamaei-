import React, { useState, useEffect } from 'react';
import {
  Cloud,
  HardDrive,
  UploadCloud,
  FileText,
  Film,
  Image as ImageIcon,
  Check,
  Trash2,
  ExternalLink,
  Copy,
  AlertCircle,
  RefreshCw,
  LogOut,
  Sparkles,
  Layers,
  Eye
} from 'lucide-react';
import { GoogleDriveService, DriveFileItem, DriveStorageQuota } from '../../services/googleDrive';
import { Modal } from '../common/Modal';
import { FirebaseService } from '../../services/firebase';

interface GoogleDriveStorageManagerProps {
  onNotify?: (msg: string, type: 'success' | 'error') => void;
}

export const GoogleDriveStorageManager: React.FC<GoogleDriveStorageManagerProps> = ({ onNotify }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [quota, setQuota] = useState<DriveStorageQuota | null>(null);
  const [files, setFiles] = useState<DriveFileItem[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);

  // Upload Form State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadCategory, setUploadCategory] = useState<'video' | 'pdf' | 'image' | 'other'>('video');
  const [uploadSubject, setUploadSubject] = useState('عام');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [syncToVideoLibrary, setSyncToVideoLibrary] = useState(true);

  // Actions State
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<DriveFileItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<DriveFileItem | null>(null);

  useEffect(() => {
    // Check initial auth
    const unsubscribe = GoogleDriveService.initAuth(
      (user) => {
        setIsConnected(true);
        setCurrentUserEmail(user.email);
        loadQuotaAndFiles();
      },
      () => {
        setIsConnected(false);
        setCurrentUserEmail(null);
      }
    );

    // Initial files load from Firestore (always available even if not currently logged into Drive)
    loadFilesFromFirestore();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const loadQuotaAndFiles = async () => {
    setIsLoadingFiles(true);
    try {
      const quotaData = await GoogleDriveService.getStorageQuota();
      if (quotaData) setQuota(quotaData);

      const items = await GoogleDriveService.getFiles();
      setFiles(items);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const loadFilesFromFirestore = async () => {
    try {
      const items = await GoogleDriveService.getFiles();
      setFiles(items);
    } catch (e) {
      console.error(e);
    }
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const { user } = await GoogleDriveService.connectGoogleDrive();
      setIsConnected(true);
      setCurrentUserEmail(user.email);
      if (onNotify) onNotify('تم ربط حساب Google Drive بنجاح!', 'success');
      await loadQuotaAndFiles();
    } catch (err: any) {
      if (onNotify) onNotify(err.message || 'فشل الاتصال بـ Google Drive', 'error');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    await GoogleDriveService.disconnect();
    setIsConnected(false);
    setCurrentUserEmail(null);
    setQuota(null);
    if (onNotify) onNotify('تم قطع الاتصال بحساب Google Drive', 'success');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);

      // Guess category
      if (file.type.startsWith('video/')) setUploadCategory('video');
      else if (file.type === 'application/pdf') setUploadCategory('pdf');
      else if (file.type.startsWith('image/')) setUploadCategory('image');
      else setUploadCategory('other');
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    if (!isConnected) {
      if (onNotify) onNotify('يرجى ربط حساب Google Drive أولاً للمتابعة', 'error');
      return;
    }

    setIsUploading(true);
    setUploadProgress('جاري رفع الملف إلى Google Drive وتوليد الروابط العامة...');

    try {
      const uploadedItem = await GoogleDriveService.uploadFile({
        file: selectedFile,
        category: uploadCategory,
        subject: uploadSubject
      });

      // If requested, synchronize to Public Video Library in Firebase
      if (uploadCategory === 'video' && syncToVideoLibrary) {
        setUploadProgress('جاري النشر في مكتبة الشروحات المرئية للطلاب...');
        await FirebaseService.addVideo({
          title: uploadedItem.name.replace(/\.[^/.]+$/, ''),
          videoUrl: uploadedItem.previewUrl,
          description: `محاضرة مرئية مرفوعة عبر Google Drive • المادة: ${uploadSubject}`,
          order: 999,
          visible: true,
          thumbnailUrl: uploadedItem.thumbnailUrl,
          fileType: 'drive'
        });
      }

      if (onNotify) onNotify(`تم رفع "${uploadedItem.name}" وإتاحته للطلاب بنجاح!`, 'success');

      setSelectedFile(null);
      await loadQuotaAndFiles();
    } catch (err: any) {
      if (onNotify) onNotify(err.message || 'حدث خطأ أثناء رفع الملف', 'error');
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  const handleCopyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    if (onNotify) onNotify('تم نسخ الرابط المباشر إلى الحافظة', 'success');
  };

  const confirmDelete = async () => {
    if (!deletingItem) return;
    try {
      await GoogleDriveService.deleteFile(deletingItem);
      setFiles((prev) => prev.filter((f) => f.id !== deletingItem.id));
      if (onNotify) onNotify('تم حذف الملف من Google Drive وقاعدة البيانات', 'success');
      setDeletingItem(null);
      if (isConnected) loadQuotaAndFiles();
    } catch (err: any) {
      if (onNotify) onNotify(err.message || 'فشل حذف الملف', 'error');
    }
  };

  return (
    <div className="space-y-6 text-right">
      {/* Top Banner / Storage Architecture */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#071A3D] via-[#0b2964] to-[#16958E] text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[#BCEBFF] text-xs font-bold border border-white/15">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>معمارية التخزين السحابي المجاني (Google Drive 15GB)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-tajawal">
            إدارة وسائط وملفات الكلية السحابية
          </h2>
          <p className="text-xs text-slate-200 max-w-xl leading-relaxed">
            ارفع محاضرات الفيديو بصيغة MP4 وملفات الـ PDF مباشرة إلى حساب Google Drive الخاص بك بدون أي تكاليف سيرفرات، مع تحويلها تلقائياً إلى روابط مشاهدة وتنزيل عامة ومباشرة للطلاب دون أن يُطلب منهم تسجيل الدخول.
          </p>
        </div>

        {/* Connection Action */}
        <div className="flex-shrink-0">
          {isConnected ? (
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center space-y-2 min-w-[220px]">
              <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-300">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>متصل بالسحابة</span>
              </div>
              <p className="text-xs font-mono text-white/90 truncate max-w-[200px]" title={currentUserEmail || ''}>
                {currentUserEmail}
              </p>
              <button
                type="button"
                onClick={handleDisconnect}
                className="w-full py-1.5 px-3 rounded-xl bg-white/15 hover:bg-rose-600/80 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>تبديل الحساب</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleConnect}
              disabled={isConnecting}
              className="px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-[#071A3D] font-extrabold text-xs shadow-xl transition-all flex items-center gap-3 cursor-pointer group disabled:opacity-50"
            >
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>{isConnecting ? 'جاري المصادقة...' : 'ربط حساب Google Drive'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Storage Quota Card */}
      {isConnected && quota && (
        <div className="p-5 rounded-2xl bg-white dark:bg-[#071A3D] border border-slate-200 dark:border-[#16958E]/30 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-[#071A3D] dark:text-white">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-[#16958E]" />
              <span>مساحة التخزين السحابي الحالية</span>
            </div>
            <div className="text-slate-500 dark:text-slate-400 font-mono">
              {quota.usageFormatted} / {quota.limitFormatted} ({quota.percentUsed}% مستخدم)
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full h-3 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                quota.percentUsed > 85 ? 'bg-rose-500' : 'bg-gradient-to-r from-[#16958E] to-blue-500'
              }`}
              style={{ width: `${quota.percentUsed}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>المساحة المتبقية المجانية: <strong className="text-emerald-600 dark:text-emerald-400 font-mono">{quota.freeFormatted}</strong></span>
            <span>مجلد المنصة: <strong className="text-[#071A3D] dark:text-white">دليلك الجامعي - الوسائط والمحاضرات</strong></span>
          </div>
        </div>
      )}

      {/* Upload File Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#071A3D] border border-slate-200 dark:border-[#16958E]/30 shadow-md">
        <div className="flex items-center gap-2 mb-4">
          <UploadCloud className="w-5 h-5 text-[#16958E]" />
          <h3 className="text-base font-extrabold text-[#071A3D] dark:text-white">
            رفع ملف تعليمي جديد إلى السحابة
          </h3>
        </div>

        <form onSubmit={handleUpload} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* File Input */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                اختر الملف (فيديو، PDF، ملخص، صورة):
              </label>
              <input
                type="file"
                onChange={handleFileSelect}
                disabled={isUploading}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-[#16958E]/20 text-xs text-[#071A3D] dark:text-white focus:ring-2 focus:ring-[#16958E] outline-none file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#16958E] file:text-white cursor-pointer"
              />
              {selectedFile && (
                <div className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                  الحجم: {((selectedFile.size / 1024 / 1024).toFixed(2))} ميجابايت • النوع: {selectedFile.type || 'غير محدد'}
                </div>
              )}
            </div>

            {/* Category Select */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                نوع المحتوى:
              </label>
              <select
                value={uploadCategory}
                onChange={(e) => setUploadCategory(e.target.value as any)}
                disabled={isUploading}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-[#16958E]/20 text-xs font-bold text-[#071A3D] dark:text-white focus:ring-2 focus:ring-[#16958E] outline-none"
              >
                <option value="video">محاضرة فيديو (Video)</option>
                <option value="pdf">ملف دراسي / ملخص (PDF)</option>
                <option value="image">صورة / مخطط توضيحي</option>
                <option value="other">ملف آخر</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Subject Tag */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                المادة الأكاديمية التابعة:
              </label>
              <input
                type="text"
                value={uploadSubject}
                onChange={(e) => setUploadSubject(e.target.value)}
                placeholder="مثال: هياكل البيانات، المحاسبة، البرمجة..."
                disabled={isUploading}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-[#16958E]/20 text-xs text-[#071A3D] dark:text-white focus:ring-2 focus:ring-[#16958E] outline-none"
              />
            </div>

            {/* Sync to Video Library */}
            {uploadCategory === 'video' && (
              <div className="flex items-center pt-5">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={syncToVideoLibrary}
                    onChange={(e) => setSyncToVideoLibrary(e.target.checked)}
                    className="w-4 h-4 text-[#16958E] rounded"
                  />
                  <span>نشر تلقائي في قسم "المكتبة المرئية" ليظهر للطلاب فوراً</span>
                </label>
              </div>
            )}
          </div>

          {/* Upload Progress Message */}
          {uploadProgress && (
            <div className="p-3.5 rounded-xl bg-[#16958E]/10 border border-[#16958E]/30 text-xs text-[#16958E] font-bold flex items-center gap-2 animate-pulse">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>{uploadProgress}</span>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={!selectedFile || isUploading || !isConnected}
              className="px-6 py-2.5 rounded-xl bg-[#16958E] hover:bg-[#127771] text-white text-xs font-bold shadow-md transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              <span>{isUploading ? 'جاري الرفع...' : 'رفع الملف إلى السحابة'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Uploaded Files Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#071A3D] border border-slate-200 dark:border-[#16958E]/30 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#16958E]" />
            <h3 className="text-base font-extrabold text-[#071A3D] dark:text-white">
              الملفات السحابية المرفوعة ({files.length})
            </h3>
          </div>
          <button
            type="button"
            onClick={loadQuotaAndFiles}
            disabled={isLoadingFiles}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingFiles ? 'animate-spin' : ''}`} />
            <span>تحديث</span>
          </button>
        </div>

        {files.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <Cloud className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600" />
            <p className="text-xs">لم يتم رفع أي ملفات سحابية بعد.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400">
                  <th className="py-3 px-3">اسم الملف</th>
                  <th className="py-3 px-3">النوع</th>
                  <th className="py-3 px-3">المادة</th>
                  <th className="py-3 px-3">الحجم</th>
                  <th className="py-3 px-3">تاريخ الرفع</th>
                  <th className="py-3 px-3 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {files.map((file) => (
                  <tr key={file.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                    <td className="py-3 px-3 font-bold text-[#071A3D] dark:text-white max-w-[220px] truncate" title={file.name}>
                      <div className="flex items-center gap-2">
                        {file.category === 'video' ? (
                          <Film className="w-4 h-4 text-rose-500 flex-shrink-0" />
                        ) : file.category === 'pdf' ? (
                          <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        ) : (
                          <ImageIcon className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        )}
                        <span className="truncate">{file.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-500">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/10 text-[10px] font-bold">
                        {file.category}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300 font-medium">
                      {file.subject || 'عام'}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-500 text-[11px]">
                      {file.sizeFormatted}
                    </td>
                    <td className="py-3 px-3 text-slate-400 text-[11px]">
                      {new Date(file.uploadedAt).toLocaleDateString('ar-EG')}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Preview */}
                        <button
                          type="button"
                          onClick={() => setPreviewItem(file)}
                          className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 transition-colors cursor-pointer"
                          title="معاينة الملف"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Copy Direct Student Link */}
                        <button
                          type="button"
                          onClick={() => handleCopyLink(file.previewUrl, file.id)}
                          className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-300 transition-colors cursor-pointer"
                          title="نسخ رابط المعاينة للطلاب"
                        >
                          {copiedId === file.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>

                        {/* Open in Drive */}
                        <a
                          href={file.previewUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                          title="فتح في Google Drive"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => setDeletingItem(file)}
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-300 transition-colors cursor-pointer"
                          title="حذف الملف"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* PREVIEW MODAL */}
      {previewItem && (
        <Modal
          isOpen={Boolean(previewItem)}
          onClose={() => setPreviewItem(null)}
          maxWidth="4xl"
          title={previewItem.name}
          subtitle={`الحجم: ${previewItem.sizeFormatted} • المادة: ${previewItem.subject || 'عام'}`}
          icon={<Film className="w-5 h-5 text-[#16958E]" />}
          footer={
            <div className="flex items-center gap-3">
              <a
                href={previewItem.downloadUrl}
                download
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-[#16958E] hover:bg-[#127771] text-white text-xs font-bold transition-all"
              >
                تحميل الملف المباشر
              </a>
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-300 cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          }
        >
          <div className="w-full aspect-video rounded-2xl overflow-hidden bg-black flex items-center justify-center">
            <iframe
              src={previewItem.previewUrl}
              className="w-full h-full border-0"
              allow="autoplay; encrypted-media"
              allowFullScreen
              title={previewItem.name}
            ></iframe>
          </div>
        </Modal>
      )}

      {/* CONFIRM DELETE MODAL (Mandatory per workspace-integration skill) */}
      {deletingItem && (
        <Modal
          isOpen={Boolean(deletingItem)}
          onClose={() => setDeletingItem(null)}
          maxWidth="md"
          title="تأكيد حذف الملف من Google Drive"
          subtitle="عملية حذف دائمة للملف السحابي"
          icon={<AlertCircle className="w-5 h-5 text-rose-600" />}
          footer={
            <>
              <button
                type="button"
                onClick={() => setDeletingItem(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-300 cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
              >
                تأكيد الحذف نهائياً
              </button>
            </>
          }
        >
          <div className="space-y-3 text-right">
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              هل أنت متأكد من رغبتك في حذف هذا الملف نهائياً من سحابة Google Drive وقاعدة بيانات المنصة؟
            </p>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 font-bold text-xs text-[#071A3D] dark:text-white truncate">
              {deletingItem.name}
            </div>
            <p className="text-[11px] text-rose-500 font-medium">
              تنبيه: سيتم إزالة رابط المشاهدة المباشر ولن يتمكن الطلاب من فتح هذا الملف بعد حذفه.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
};
