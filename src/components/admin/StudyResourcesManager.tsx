import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen,
  Plus,
  Trash2,
  Edit3,
  ExternalLink,
  Search,
  CheckCircle2,
  AlertTriangle,
  Send,
  Video,
  FileText,
  Layers,
  ArrowRight,
  RefreshCw,
  Eye,
  Tag,
  Link as LinkIcon,
  Compass,
  ArrowUp,
  ArrowDown,
  ToggleLeft,
  ToggleRight,
  Copy,
  Check
} from 'lucide-react';
import { FirebaseService } from '../../services/firebase';
import { StudyResource, Subject } from '../../types';
import { STUDY_RESOURCES, SUBJECTS_DATA } from '../../data/academicContent';
import { Modal } from '../common/Modal';

interface StudyResourcesManagerProps {
  onNotify?: (msg: string, type: 'success' | 'error') => void;
  subjectsList?: Subject[];
}

export const StudyResourcesManager: React.FC<StudyResourcesManagerProps> = ({ onNotify, subjectsList = [] }) => {
  const [resources, setResources] = useState<StudyResource[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>(subjectsList.length > 0 ? subjectsList : SUBJECTS_DATA);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<StudyResource> | null>(null);
  const [isCustomSubject, setIsCustomSubject] = useState(false);
  const [customSubjectInput, setCustomSubjectInput] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Deletion Modal State
  const [deletingItem, setDeletingItem] = useState<StudyResource | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Card Preview Modal State
  const [previewItem, setPreviewItem] = useState<StudyResource | null>(null);

  // URL Copy state
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    // 1. Subscribe to study resources
    const unsubscribeResources = FirebaseService.subscribeStudyResources((data) => {
      setResources(data || []);
      setIsLoading(false);
    });

    // 2. Subscribe to subjects
    const unsubscribeSubjects = FirebaseService.subscribeSubjects((data) => {
      if (data && data.length > 0) {
        setSubjects(data);
      }
    });

    return () => {
      unsubscribeResources();
      unsubscribeSubjects();
    };
  }, []);

  const notify = (msg: string, type: 'success' | 'error' = 'success') => {
    if (onNotify) {
      onNotify(msg, type);
    }
  };

  // Helper for category icon
  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'telegram':
        return <Send className="w-5 h-5 text-[#16958E] rotate-180" />;
      case 'book':
        return <BookOpen className="w-5 h-5 text-[#071A3D]" />;
      case 'video':
        return <Video className="w-5 h-5 text-[#16958E]" />;
      case 'notes':
        return <FileText className="w-5 h-5 text-[#071A3D]" />;
      default:
        return <Layers className="w-5 h-5 text-[#16958E]" />;
    }
  };

  // Format subject tag for display
  const getSubjectLabel = (subjectId?: string, subjectTag?: string) => {
    const rawTag = subjectTag || subjectId;
    if (!rawTag || rawTag === 'general') return 'عام / جميع المقررات';
    const found = subjects.find(s => s.id.toLowerCase() === rawTag.toLowerCase());
    if (found) {
      return `${found.nameAr} (${found.nameEn})`;
    }
    return rawTag;
  };

  // Validate URL syntax (HTTP/HTTPS only, block dangerous schemes)
  const isValidUrl = (urlString: string): boolean => {
    if (!urlString || typeof urlString !== 'string') return false;
    const trimmed = urlString.trim();
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      return false;
    }
    try {
      const url = new URL(trimmed);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  };

  // Open Add Modal
  const handleOpenAddModal = () => {
    setFormErrors({});
    setIsCustomSubject(false);
    setCustomSubjectInput('');
    setEditingItem({
      title: '',
      description: '',
      link: 'https://',
      url: 'https://',
      subjectId: 'general',
      subjectTag: 'general',
      category: 'book',
      order: resources.length + 1,
      isActive: true,
      isExternal: true
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (item: StudyResource) => {
    setFormErrors({});
    const tag = item.subjectTag || item.subjectId || 'general';
    const isKnownSubject = subjects.some(s => s.id === tag) || tag === 'general';

    if (!isKnownSubject && tag !== '') {
      setIsCustomSubject(true);
      setCustomSubjectInput(tag);
    } else {
      setIsCustomSubject(false);
      setCustomSubjectInput('');
    }

    setEditingItem({
      ...item,
      url: item.url || item.link
    });
    setIsModalOpen(true);
  };

  // Save (Create or Update)
  const handleSaveResource = async () => {
    if (!editingItem) return;

    const errors: Record<string, string> = {};

    // 1. Validate Title
    if (!editingItem.title || editingItem.title.trim().length < 2) {
      errors.title = 'يرجى إدخال اسم المصدر (حرفين على الأقل)';
    }

    // 2. Validate Description
    if (!editingItem.description || editingItem.description.trim().length < 5) {
      errors.description = 'يرجى إدخال وصف تفصيلي للمصدر (5 أحرف على الأقل)';
    }

    // 3. Validate URL
    const destinationUrl = (editingItem.url || editingItem.link || '').trim();
    if (!destinationUrl || destinationUrl === 'https://' || destinationUrl === 'http://') {
      errors.url = 'يرجى إدخال رابط المصدر الخارجي';
    } else if (!isValidUrl(destinationUrl)) {
      errors.url = 'الرابط غير صالح! يجب أن يبدأ بـ http:// أو https:// ولا يقبل نصوصاً خطيرة';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    setIsSaving(true);

    try {
      // Determine final subject tag
      let finalSubjectTag = editingItem.subjectId || 'general';
      if (isCustomSubject) {
        finalSubjectTag = customSubjectInput.trim() || 'general';
      }

      const payload = {
        title: editingItem.title!.trim(),
        description: editingItem.description!.trim(),
        link: destinationUrl,
        url: destinationUrl,
        subjectId: finalSubjectTag,
        subjectTag: finalSubjectTag,
        category: editingItem.category || 'book',
        order: Number(editingItem.order) || 1,
        isActive: editingItem.isActive !== false,
        isExternal: true
      };

      if (editingItem.id) {
        // UPDATE
        await FirebaseService.updateStudyResource(editingItem.id, payload);
        notify('تم تحديث بيانات المصدر الدراسي بنجاح! 🚀', 'success');
      } else {
        // CREATE
        await FirebaseService.addStudyResource(payload);
        notify('تمت إضافة المصدر الدراسي الجديد إلى الموقع فورياً! 📚', 'success');
      }

      setIsModalOpen(false);
      setEditingItem(null);
    } catch (err: any) {
      console.error('Error saving study resource:', err);
      notify(`حدث خطأ أثناء حفظ المصدر: ${err.message || 'يرجى التحقق من الاتصال'}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Resource
  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    setIsDeleting(true);
    try {
      await FirebaseService.deleteStudyResource(deletingItem.id);
      notify(`تم حذف المصدر "${deletingItem.title}" بنجاح`, 'success');
      setDeletingItem(null);
    } catch (err: any) {
      console.error('Error deleting resource:', err);
      notify('فشل حذف المصدر من قاعدة البيانات', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Toggle Resource Visibility
  const handleToggleActive = async (item: StudyResource) => {
    try {
      const newStatus = !item.isActive;
      await FirebaseService.updateStudyResource(item.id, { isActive: newStatus });
      notify(`تم ${newStatus ? 'تفعيل' : 'إخفاء'} المصدر "${item.title}"`);
    } catch (err) {
      notify('فشل تغيير حالة المصدر', 'error');
    }
  };

  // Reorder Resource
  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === resources.length - 1)) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const current = resources[index];
    const target = resources[targetIndex];

    try {
      const currentOrder = current.order ?? index + 1;
      const targetOrder = target.order ?? targetIndex + 1;

      await FirebaseService.updateStudyResource(current.id, { order: targetOrder });
      await FirebaseService.updateStudyResource(target.id, { order: currentOrder });
      notify('تم تحديث ترتيب المصادر بنجاح');
    } catch (err) {
      notify('فشل تحديث الترتيب', 'error');
    }
  };

  // Seed / Reset to Default Resources
  const handleSeedDefaults = async () => {
    if (!window.confirm('هل تريد استرجاع المصادر الدراسية الافتراضية المعتمدة؟ لن يتم حذف المصادر المضافة يدوياً.')) return;
    try {
      await FirebaseService.seedDefaultStudyResources();
      notify('تمت استعادة المصادر النموذجية بنجاح 📖');
    } catch (err) {
      notify('حدث خطأ أثناء استعادة المصادر الافتراضية', 'error');
    }
  };

  // Copy URL to Clipboard
  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    notify('تم نسخ الرابط إلى الحافظة');
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Filtered resources list
  const filteredResources = resources.filter(res => {
    const matchesSearch =
      !searchQuery.trim() ||
      res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (res.link && res.link.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (res.subjectTag && res.subjectTag.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (res.subjectId && res.subjectId.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSubject =
      selectedSubjectFilter === 'all' ||
      (res.subjectId === selectedSubjectFilter || res.subjectTag === selectedSubjectFilter);

    const matchesCategory =
      selectedCategoryFilter === 'all' || res.category === selectedCategoryFilter;

    const matchesStatus =
      selectedStatusFilter === 'all' ||
      (selectedStatusFilter === 'active' && res.isActive !== false) ||
      (selectedStatusFilter === 'inactive' && res.isActive === false);

    return matchesSearch && matchesSubject && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#16958E]">
            <Layers className="w-4 h-4" />
            <span>نظام إدارة المحتوى الأكاديمي</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold font-tajawal text-slate-900 mt-1 flex items-center gap-2">
            <span>مصادر الدراسة والمكتبة الرقمية</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#BCEBFF] text-[#071A3D]">
              {resources.length} مصدر
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            إدارة روابط الكتب، الأطلس الطبي، بنك الأسئلة، وتحديد ارتباط كل مصدر بالمواد الأكاديمية
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleSeedDefaults}
            title="استعادة أو تحديث المصادر الافتراضية"
            className="h-10 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-all whitespace-nowrap cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>استعادة المصادر النموذجية</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="h-10 px-4 rounded-xl bg-gradient-to-r from-[#071A3D] to-[#16958E] hover:from-[#0a2558] hover:to-[#1ba8a0] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-[#071A3D]/20 active:scale-95 transition-all whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#BCEBFF]" />
            <span>إضافة مصدر جديد ✦</span>
          </button>
        </div>
      </div>

      {/* 2. Directive Visual Guide Info Box */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 space-y-2">
        <div className="font-bold text-slate-900 flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-[#16958E]" />
          <span>تطابق حقول بطاقة الطالب مع لوحة التحكم:</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-[11px]">
          <div className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 flex-shrink-0"></span>
            <div>
              <span className="font-bold">اسم المصدر (الأحمر):</span>
              <span className="block text-[10px] text-rose-700">source.title</span>
            </div>
          </div>
          <div className="p-2 rounded-xl bg-sky-50 border border-sky-200 text-sky-900 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-600 flex-shrink-0"></span>
            <div>
              <span className="font-bold">وصف المصدر (الأزرق):</span>
              <span className="block text-[10px] text-sky-700">source.description</span>
            </div>
          </div>
          <div className="p-2 rounded-xl bg-slate-100 border border-slate-300 text-slate-900 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-900 flex-shrink-0"></span>
            <div>
              <span className="font-bold">زر الانتقال للمصدر (الأسود):</span>
              <span className="block text-[10px] text-slate-600">source.url (رابط خارجي)</span>
            </div>
          </div>
          <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 flex-shrink-0"></span>
            <div>
              <span className="font-bold">استعراض المادة (الأخضر):</span>
              <span className="block text-[10px] text-emerald-700">source.subjectTag</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Search and Filters Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
        
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث باسم المصدر أو الوصف أو الرابط..."
            className="w-full pr-9 pl-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#16958E]"
          />
        </div>

        {/* Filter by Subject */}
        <div>
          <select
            value={selectedSubjectFilter}
            onChange={(e) => setSelectedSubjectFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#16958E] bg-white cursor-pointer"
          >
            <option value="all">كل المواد الدراسية</option>
            <option value="general">عام / جميع المقررات</option>
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.nameAr} ({sub.nameEn})
              </option>
            ))}
          </select>
        </div>

        {/* Filter by Category */}
        <div>
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#16958E] bg-white cursor-pointer"
          >
            <option value="all">جميع التصنيفات</option>
            <option value="book">الأطلس والكتب (Book)</option>
            <option value="video">الشروحات والمرئيات (Video)</option>
            <option value="telegram">بوت التلجرام (Telegram)</option>
            <option value="notes">الملخصات وبنك الأسئلة (Notes)</option>
            <option value="summary">ملخصات ومراجعات (Summary)</option>
          </select>
        </div>

        {/* Filter by Status */}
        <div>
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value as any)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#16958E] bg-white cursor-pointer"
          >
            <option value="all">كل الحالات (المفعل والمخفي)</option>
            <option value="active">المفعلة للطلاب فقط (ON)</option>
            <option value="inactive">المخفية مؤقتاً (OFF)</option>
          </select>
        </div>

      </div>

      {/* 4. Sources Cards Grid / List */}
      {isLoading ? (
        <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <RefreshCw className="w-8 h-8 text-[#16958E] animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500 font-bold">جاري تحميل المصادر الدراسية من قاعدة البيانات...</p>
        </div>
      ) : filteredResources.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-8">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">لا توجد مصادر مطابقة لمعايير البحث</h3>
          <p className="text-xs text-slate-400 mt-1">يمكنك إضافة مصدر جديد أو تغيير فلاتر البحث</p>
          <button
            onClick={handleOpenAddModal}
            className="mt-4 px-4 py-2 rounded-xl bg-[#071A3D] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة أول مصدر دراسي الآن</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredResources.map((res, index) => {
            const destinationUrl = res.url || res.link;
            const hasSubject = Boolean(res.subjectId && res.subjectId !== 'general' && res.subjectId.trim() !== '');

            return (
              <div
                key={res.id}
                className={`p-5 rounded-3xl border transition-all flex flex-col justify-between bg-white ${
                  res.isActive !== false
                    ? 'border-slate-200 hover:border-[#16958E] shadow-sm'
                    : 'border-slate-200/60 bg-slate-50/60 opacity-75'
                }`}
              >
                <div>
                  {/* Top Bar: Icon, Category, Status Toggle, Order Controls */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2.5 rounded-xl bg-[#BCEBFF]/25 border border-[#BCEBFF]/50">
                        {getCategoryIcon(res.category)}
                      </div>
                      <div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 uppercase">
                          {res.category || 'عام'}
                        </span>
                        <span className="text-[10px] text-slate-400 mr-2">
                          ترتيب: #{res.order ?? index + 1}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Active Status Badge / Toggle */}
                      <button
                        onClick={() => handleToggleActive(res)}
                        title={res.isActive !== false ? 'مفعل ويظهر للطلاب' : 'مخفي عن الطلاب'}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                          res.isActive !== false
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                        }`}
                      >
                        {res.isActive !== false ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>نشط</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="w-3 h-3 text-slate-500" />
                            <span>مخفي</span>
                          </>
                        )}
                      </button>

                      {/* Reorder Up / Down */}
                      <button
                        onClick={() => handleMoveOrder(index, 'up')}
                        disabled={index === 0}
                        title="تحريك لأعلى"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveOrder(index, 'down')}
                        disabled={index === resources.length - 1}
                        title="تحريك لأسفل"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title (RED corresponding area) */}
                  <div className="mb-2">
                    <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded mr-1">
                      العنوان
                    </span>
                    <h3 className="font-bold font-tajawal text-slate-900 text-base leading-snug inline">
                      {res.title}
                    </h3>
                  </div>

                  {/* Description (BLUE corresponding area) */}
                  <div className="mb-3">
                    <span className="text-[10px] font-bold text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded mr-1">
                      الوصف
                    </span>
                    <p className="text-slate-600 text-xs leading-relaxed inline whitespace-pre-line">
                      {res.description}
                    </p>
                  </div>

                  {/* Destination URL (BLACK corresponding area) */}
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 mb-3 flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5 overflow-hidden">
                      <span className="text-[10px] font-bold text-slate-900 bg-slate-200 px-1.5 py-0.5 rounded flex-shrink-0">
                        الرابط
                      </span>
                      <a
                        href={destinationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#16958E] hover:underline truncate font-mono text-[11px]"
                        title={destinationUrl}
                      >
                        {destinationUrl}
                      </a>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => handleCopyUrl(destinationUrl, res.id)}
                        title="نسخ الرابط"
                        className="p-1 rounded text-slate-400 hover:text-slate-700 cursor-pointer"
                      >
                        {copiedId === res.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <a
                        href={destinationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="فتح الرابط في تبويب جديد"
                        className="p-1 rounded text-[#16958E] hover:bg-slate-200/50"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                  {/* Associated Subject Tag (GREEN corresponding area) */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-700 mb-3">
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                      وسم المادة
                    </span>
                    <span className="font-medium text-[#16958E] flex items-center gap-1 text-[11px]">
                      <Compass className="w-3 h-3 text-[#16958E]" />
                      <span>{getSubjectLabel(res.subjectId, res.subjectTag)}</span>
                    </span>
                    {hasSubject ? (
                      <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1 rounded font-bold mr-auto">
                        زر الاستعراض: مفعّل ✓
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 bg-slate-100 px-1 rounded mr-auto">
                        بدون زر استعراض
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setPreviewItem(res)}
                    className="h-8 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                    <span>معاينة كرت الطالب</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditModal(res)}
                      className="h-8 px-3 rounded-xl bg-[#071A3D] hover:bg-[#16958E] text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>تعديل</span>
                    </button>

                    <button
                      onClick={() => setDeletingItem(res)}
                      className="h-8 px-2.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer active:scale-95"
                      title="حذف هذا المصدر"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* 5. ADD / EDIT SOURCE MODAL */}
      <AnimatePresence>
        {isModalOpen && editingItem && (
          <Modal
            isOpen={isModalOpen}
            onClose={() => {
              if (!isSaving) {
                setIsModalOpen(false);
                setEditingItem(null);
              }
            }}
            title={editingItem.id ? 'تعديل المصدر الدراسي والمكتبة الرقمية ✍️' : 'إضافة مصدر دراسي جديد إلى المكتبة ✦'}
          >
            <div className="space-y-4 max-h-[75vh] overflow-y-auto px-1 scrollbar-thin text-right">
              
              {/* Field 1: Source Title (RED Area) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
                    <span>اسم المصدر (Source Title)</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] text-rose-600 bg-rose-50 px-2 py-0.5 rounded font-bold">
                    العنصر باللون الأحمر
                  </span>
                </div>
                <input
                  type="text"
                  value={editingItem.title || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  placeholder="مثال: أطلس التشريح التفاعلي (Interactive Anatomy Atlas)"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#16958E]/20 ${
                    formErrors.title ? 'border-rose-400 bg-rose-50/40' : 'border-slate-200 focus:border-[#16958E]'
                  }`}
                />
                {formErrors.title && (
                  <p className="text-[11px] text-rose-600 font-bold mt-1">{formErrors.title}</p>
                )}
              </div>

              {/* Field 2: Source Description (BLUE Area) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-600"></span>
                    <span>وصف المصدر (Source Description)</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] text-sky-600 bg-sky-50 px-2 py-0.5 rounded font-bold">
                    العنصر باللون الأزرق
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={editingItem.description || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  placeholder="مثال: نماذج ثلاثية الأبعاد تفاعلية لجميع أعصاب وعظام وعضلات جسم الإنسان مع تسميات علمية."
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#16958E]/20 leading-relaxed ${
                    formErrors.description ? 'border-rose-400 bg-rose-50/40' : 'border-slate-200 focus:border-[#16958E]'
                  }`}
                />
                {formErrors.description && (
                  <p className="text-[11px] text-rose-600 font-bold mt-1">{formErrors.description}</p>
                )}
              </div>

              {/* Field 3: Source Destination URL (BLACK Area) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-900"></span>
                    <span>رابط المصدر الخارجي (Destination URL)</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] text-slate-700 bg-slate-100 px-2 py-0.5 rounded font-bold">
                    زر الانتقال للمصدر
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="url"
                    dir="ltr"
                    value={editingItem.url || editingItem.link || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, url: e.target.value, link: e.target.value })}
                    placeholder="https://example.com/anatomy-atlas"
                    className={`w-full pr-3.5 pl-24 py-2.5 rounded-xl border text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#16958E]/20 text-left ${
                      formErrors.url ? 'border-rose-400 bg-rose-50/40' : 'border-slate-200 focus:border-[#16958E]'
                    }`}
                  />
                  {editingItem.url && isValidUrl(editingItem.url) && (
                    <a
                      href={editingItem.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute left-2 top-1/2 -translate-y-1/2 px-2 py-1 rounded-lg bg-[#071A3D] text-white text-[10px] font-bold flex items-center gap-1 hover:bg-[#16958E] transition-colors"
                      title="تجربة فتح الرابط في تبويب جديد"
                    >
                      <span>اختبار الرابط</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                {formErrors.url ? (
                  <p className="text-[11px] text-rose-600 font-bold mt-1">{formErrors.url}</p>
                ) : (
                  <p className="text-[11px] text-slate-500 mt-1">
                    * سيتم فتح هذا الرابط بأمان في تبويب جديد عند نقر الطالب على زر "الانتقال للمصدر".
                  </p>
                )}
              </div>

              {/* Field 4: Associated Subject Tag (GREEN Area) */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-200">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                    <span>وسم المادة الدراسية (Subject Tag)</span>
                  </label>
                  <span className="text-[10px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-bold">
                    زر استعراض المادة
                  </span>
                </div>

                <div className="space-y-2 mt-2">
                  {!isCustomSubject ? (
                    <select
                      value={editingItem.subjectId || 'general'}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '__custom__') {
                          setIsCustomSubject(true);
                          setCustomSubjectInput('');
                        } else {
                          setEditingItem({ ...editingItem, subjectId: val, subjectTag: val });
                        }
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-300 text-xs font-medium focus:outline-none focus:border-[#16958E] bg-white cursor-pointer"
                    >
                      <option value="general">بدون وسم محدد - عام (جميع المقررات)</option>
                      {subjects.map((sub) => (
                        <option key={sub.id} value={sub.id}>
                          {sub.nameAr} ({sub.nameEn}) — [{sub.id}]
                        </option>
                      ))}
                      <option value="__custom__">➕ كتابة وسم مخصص جديد...</option>
                    </select>
                  ) : (
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={customSubjectInput}
                          onChange={(e) => {
                            setCustomSubjectInput(e.target.value);
                            setEditingItem({ ...editingItem, subjectId: e.target.value, subjectTag: e.target.value });
                          }}
                          placeholder="اكتب معرّف أو وسم المادة (مثال: neurology أو anesth)"
                          className="flex-1 px-3.5 py-2.5 rounded-xl border border-emerald-300 text-xs font-medium focus:outline-none focus:border-[#16958E] bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setIsCustomSubject(false);
                            setEditingItem({ ...editingItem, subjectId: 'general', subjectTag: 'general' });
                          }}
                          className="px-3 py-2.5 rounded-xl bg-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-300 transition-colors cursor-pointer"
                        >
                          إلغاء والعودة للقائمة
                        </button>
                      </div>
                      <p className="text-[10px] text-emerald-800">
                        * أدخل معرف المادة الأكاديمية بدقة لتوجيه الطالب إلى صفحتها.
                      </p>
                    </div>
                  )}

                  <p className="text-[11px] text-slate-600 leading-normal">
                    💡 <strong>سلوك زر "استعراض المادة":</strong> عند ربط المصدر بمادة معينة، سيظهر زر "استعراض المادة →" في بطاقة الطالب وينقله مباشرة لقسم المادة في الموقع. إذا اخترت (عام)، لن يظهر الزر.
                  </p>
                </div>
              </div>

              {/* Field 5 & 6: Category & Order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    تصنيف المصدر والأيقونة:
                  </label>
                  <select
                    value={editingItem.category || 'book'}
                    onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#16958E] bg-white cursor-pointer"
                  >
                    <option value="book">كتاب / أطلس طبي (BookOpen)</option>
                    <option value="video">شروحات ومرئيات (Video)</option>
                    <option value="telegram">بوت تلجرام أكاديمي (Telegram Send)</option>
                    <option value="notes">مذكرات وبنك أسئلة (FileText)</option>
                    <option value="summary">ملخصات ومراجعات (Layers)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    ترتيب الظهور (Display Order):
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editingItem.order ?? 1}
                    onChange={(e) => setEditingItem({ ...editingItem, order: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#16958E]"
                  />
                </div>
              </div>

              {/* Field 7: Active Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">حالة ظهور المصدر للطلاب</span>
                  <span className="text-[11px] text-slate-500">
                    {editingItem.isActive !== false ? 'المصدر نشط ومتاح للطلاب في صفحة المصادر' : 'المصدر مخفي مؤقتاً'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingItem({ ...editingItem, isActive: editingItem.isActive === false ? true : false })}
                  className={`h-8 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    editingItem.isActive !== false
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-300 text-slate-700'
                  }`}
                >
                  {editingItem.isActive !== false ? 'مفعّل (ON)' : 'معطّل (OFF)'}
                </button>
              </div>

              {/* Real-time Interactive Card Preview */}
              <div className="pt-2">
                <div className="text-[11px] font-bold text-slate-400 mb-2 flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-[#16958E]" />
                  <span>معاينة حية لشكل بطاقة المصدر في صفحة الطالب:</span>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-[#BCEBFF] shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2.5 rounded-xl bg-[#BCEBFF]/20 border border-[#BCEBFF]/40">
                      {getCategoryIcon(editingItem.category)}
                    </div>
                    <div>
                      <h4 className="font-bold font-tajawal text-[#071A3D] text-base">
                        {editingItem.title || 'اسم المصدر سيظهر هنا...'}
                      </h4>
                      <span className="text-xs text-[#16958E] font-medium flex items-center gap-1">
                        <Compass className="w-3 h-3 text-[#16958E]" />
                        <span>
                          {getSubjectLabel(editingItem.subjectId, editingItem.subjectTag)}
                        </span>
                      </span>
                    </div>
                  </div>

                  <p className="text-slate-600 text-xs leading-relaxed mb-4 whitespace-pre-line">
                    {editingItem.description || 'الوصف التفصيلي للمصدر سيظهر هنا للطلاب...'}
                  </p>

                  <div className="pt-3 border-t border-[#BCEBFF]/40 flex items-center justify-between">
                    <span className="px-3 py-1.5 rounded-xl bg-[#071A3D] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm">
                      <span>الانتقال للمصدر</span>
                      <ExternalLink className="w-3 h-3 text-[#BCEBFF]" />
                    </span>

                    {(editingItem.subjectId && editingItem.subjectId !== 'general' && editingItem.subjectId.trim() !== '') && (
                      <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                        <span>استعراض المادة</span>
                        <span>←</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingItem(null);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer disabled:opacity-50"
                >
                  إلغاء
                </button>

                <button
                  type="button"
                  disabled={isSaving}
                  onClick={handleSaveResource}
                  className="px-6 py-2.5 rounded-xl bg-[#071A3D] hover:bg-[#16958E] text-white text-xs font-bold flex items-center gap-2 shadow-md transition-all disabled:opacity-50 cursor-pointer active:scale-95"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-[#BCEBFF]" />
                      <span>جاري الحفظ والمزامنة...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-[#BCEBFF]" />
                      <span>حفظ المصدر وتحديث الموقع</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* 6. DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {deletingItem && (
          <Modal
            isOpen={Boolean(deletingItem)}
            onClose={() => !isDeleting && setDeletingItem(null)}
            title="تأكيد حذف المصدر الدراسي ⚠️"
          >
            <div className="space-y-4 text-right">
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                  <span>هل أنت متأكد من رغبتك في حذف هذا المصدر نهائياً؟</span>
                </div>
                <p>
                  سيتم حذف المصدر <strong>"{deletingItem.title}"</strong> فوراً من قاعدة البيانات وشاشات الطلاب. هذا الإجراء دائم ولا يمكن التراجع عنه.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setDeletingItem(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer disabled:opacity-50"
                >
                  تراجع وإلغاء
                </button>

                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleConfirmDelete}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all disabled:opacity-50 cursor-pointer active:scale-95"
                >
                  {isDeleting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>جاري الحذف...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>نعم، احذف المصدر الآن</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* 7. CARD PREVIEW MODAL */}
      <AnimatePresence>
        {previewItem && (
          <Modal
            isOpen={Boolean(previewItem)}
            onClose={() => setPreviewItem(null)}
            title={`معاينة بطاقة المصدر: ${previewItem.title}`}
          >
            <div className="space-y-4 text-right">
              <div className="p-6 rounded-3xl bg-white border border-[#BCEBFF] shadow-md">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-2xl bg-[#BCEBFF]/20 border border-[#BCEBFF]/40">
                    {getCategoryIcon(previewItem.category)}
                  </div>
                  <div>
                    <h3 className="font-bold font-tajawal text-[#071A3D] text-lg">
                      {previewItem.title}
                    </h3>
                    <span className="text-xs text-[#16958E] font-medium flex items-center gap-1">
                      <Compass className="w-3.5 h-3.5 text-[#16958E]" />
                      <span>{getSubjectLabel(previewItem.subjectId, previewItem.subjectTag)}</span>
                    </span>
                  </div>
                </div>

                <p className="text-slate-600 text-sm leading-relaxed mb-6 whitespace-pre-line">
                  {previewItem.description}
                </p>

                <div className="pt-4 border-t border-[#BCEBFF]/40 flex items-center justify-between">
                  <a
                    href={previewItem.url || previewItem.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-[#071A3D] hover:bg-[#16958E] text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all"
                  >
                    <span>الانتقال للمصدر</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#BCEBFF]" />
                  </a>

                  {(previewItem.subjectId && previewItem.subjectId !== 'general' && previewItem.subjectId.trim() !== '') && (
                    <span className="text-xs font-bold text-slate-500">
                      استعراض المادة ←
                    </span>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setPreviewItem(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 cursor-pointer"
                >
                  إغلاق المعاينة
                </button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>

    </div>
  );
};
