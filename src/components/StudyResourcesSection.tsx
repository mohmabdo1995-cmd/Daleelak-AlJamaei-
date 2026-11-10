import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { STUDY_RESOURCES, SUBJECTS_DATA } from '../data/academicContent';
import { StudyResource, Subject } from '../types';
import { FirebaseService } from '../services/firebase';
import { BookOpen, Send, Video, FileText, ExternalLink, ArrowRight, Sparkles, Layers, Search, Compass } from 'lucide-react';

interface StudyResourcesSectionProps {
  onBack: () => void;
  onNavigateToSubject: (subjectId: string) => void;
}

export const StudyResourcesSection: React.FC<StudyResourcesSectionProps> = ({ onBack, onNavigateToSubject }) => {
  const [resources, setResources] = useState<StudyResource[]>(STUDY_RESOURCES);
  const [subjects, setSubjects] = useState<Subject[]>(SUBJECTS_DATA);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    // Realtime subscription to dynamic study resources
    const unsubscribeResources = FirebaseService.subscribeStudyResources((data) => {
      if (data && data.length > 0) {
        setResources(data);
      } else {
        setResources(STUDY_RESOURCES);
      }
    });

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

  const getSubjectDisplayName = (subjectId?: string, subjectTag?: string) => {
    const rawTag = subjectTag || subjectId;
    if (!rawTag || rawTag === 'general') return 'جميع المقررات / عام';
    const found = subjects.find(s => s.id.toLowerCase() === rawTag.toLowerCase());
    if (found) {
      return `${found.nameAr} (${found.nameEn})`;
    }
    return rawTag;
  };

  const hasValidSubject = (res: StudyResource) => {
    const tag = res.subjectId || res.subjectTag;
    return Boolean(tag && tag !== 'general' && tag.trim() !== '');
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'telegram': return <Send className="w-5 h-5 text-[#16958E] rotate-180" />;
      case 'book': return <BookOpen className="w-5 h-5 text-[#071A3D] dark:text-[#BCEBFF]" />;
      case 'video': return <Video className="w-5 h-5 text-[#16958E]" />;
      case 'notes': return <FileText className="w-5 h-5 text-[#071A3D] dark:text-[#BCEBFF]" />;
      default: return <Layers className="w-5 h-5 text-[#16958E]" />;
    }
  };

  // Only show active resources to students, ordered as configured
  const activeResources = resources.filter(res => res.isActive !== false);

  const filteredResources = activeResources.filter(res => {
    const matchesCategory = filterCategory === 'all' || res.category === filterCategory;
    const matchesSearch = 
      !searchQuery.trim() ||
      res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (res.subjectTag && res.subjectTag.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (res.subjectId && res.subjectId.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 h-9 sm:h-10 px-3.5 rounded-xl bg-[#BCEBFF]/30 hover:bg-[#BCEBFF]/60 text-[#071A3D] dark:text-[#BCEBFF] font-bold text-xs sm:text-sm transition-all mb-4 cursor-pointer"
          >
            <ArrowRight className="w-4 h-4" />
            <span>الرجوع للرئيسية</span>
          </button>

          <div className="flex items-center gap-2 text-[#16958E] dark:text-[#BCEBFF] font-bold text-sm">
            <Sparkles className="w-4 h-4 text-[#16958E]" />
            <span>القسم الثاني - مصادر الدراسة والكتب</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold font-tajawal text-[#071A3D] dark:text-white mt-1">
            مصادر الدراسة والمكتبة الرقمية 📖
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base mt-1">
            مجموعة متجددة ومختارة من أفضل المراجع العلمية، الأطلس الطبي، والبوتات التعليمية المعتمدة.
          </p>
        </div>

        {/* Prominent Telegram Button */}
        <a
          href="http://t.me/Daleelak_AlJamaei_bot"
          target="_blank"
          rel="noopener noreferrer"
          className="h-11 sm:h-12 px-5 sm:px-6 rounded-2xl bg-gradient-to-r from-[#071A3D] to-[#16958E] hover:from-[#0a2558] hover:to-[#1ba8a0] text-white font-bold text-xs sm:text-sm shadow-lg shadow-[#071A3D]/25 flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <Send className="w-5 h-5 rotate-180 text-[#BCEBFF]" />
          <span>فتح بوت التلجرام</span>
        </a>
      </div>

      {/* Main Telegram Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#071A3D] border border-[#BCEBFF]/80 dark:border-[#16958E]/30 mb-8 relative overflow-hidden shadow-sm"
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4 text-right">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#071A3D] to-[#16958E] text-white flex items-center justify-center shadow-lg shadow-[#071A3D]/30 flex-shrink-0">
              <Send className="w-8 h-8 rotate-180 text-[#BCEBFF]" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#16958E] dark:text-[#BCEBFF]">البوت الأكاديمي الشامل</span>
              <h2 className="text-2xl font-bold font-tajawal text-[#071A3D] dark:text-white mt-0.5">
                بوت التلجرام: @Daleelak_AlJamaei_bot
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm mt-1 leading-relaxed max-w-2xl">
                احصل على التجميعات المعتمدة، ملخصات المواد (Anatomy, Physiology, Biochemistry, Microbiology, Pathology, Pharmacology)، وأسئلة الامتحانات السابقة فورياً.
              </p>
            </div>
          </div>

          <a
            href="http://t.me/Daleelak_AlJamaei_bot"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full md:w-auto px-8 py-4 rounded-2xl bg-[#071A3D] hover:bg-[#16958E] text-white font-bold text-base shadow-lg shadow-[#071A3D]/25 transition-all text-center whitespace-nowrap active:scale-95 flex items-center justify-center gap-2"
          >
            <span>انتقال للبوت الآن</span>
            <ExternalLink className="w-4 h-4 text-[#BCEBFF]" />
          </a>
        </div>
      </motion.div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-[#BCEBFF]/40 dark:border-[#16958E]/30 pb-4 mb-8">
        
        {/* Filter Categories */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
          <button
            onClick={() => setFilterCategory('all')}
            className={`h-9 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center whitespace-nowrap cursor-pointer ${
              filterCategory === 'all'
                ? 'bg-[#071A3D] text-white shadow-sm'
                : 'bg-[#BCEBFF]/20 dark:bg-[#071A3D]/50 text-[#071A3D] dark:text-slate-300 hover:bg-[#BCEBFF]/40'
            }`}
          >
            جميع المصادر ({activeResources.length})
          </button>

          <button
            onClick={() => setFilterCategory('telegram')}
            className={`h-9 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center whitespace-nowrap cursor-pointer ${
              filterCategory === 'telegram'
                ? 'bg-[#071A3D] text-white shadow-sm'
                : 'bg-[#BCEBFF]/20 dark:bg-[#071A3D]/50 text-[#071A3D] dark:text-slate-300 hover:bg-[#BCEBFF]/40'
            }`}
          >
            بوت التلجرام
          </button>

          <button
            onClick={() => setFilterCategory('book')}
            className={`h-9 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center whitespace-nowrap cursor-pointer ${
              filterCategory === 'book'
                ? 'bg-[#071A3D] text-white shadow-sm'
                : 'bg-[#BCEBFF]/20 dark:bg-[#071A3D]/50 text-[#071A3D] dark:text-slate-300 hover:bg-[#BCEBFF]/40'
            }`}
          >
            الأطلس والكتب
          </button>

          <button
            onClick={() => setFilterCategory('video')}
            className={`h-9 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center whitespace-nowrap cursor-pointer ${
              filterCategory === 'video'
                ? 'bg-[#071A3D] text-white shadow-sm'
                : 'bg-[#BCEBFF]/20 dark:bg-[#071A3D]/50 text-[#071A3D] dark:text-slate-300 hover:bg-[#BCEBFF]/40'
            }`}
          >
            الشروحات والمرئيات
          </button>

          <button
            onClick={() => setFilterCategory('notes')}
            className={`h-9 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center whitespace-nowrap cursor-pointer ${
              filterCategory === 'notes'
                ? 'bg-[#071A3D] text-white shadow-sm'
                : 'bg-[#BCEBFF]/20 dark:bg-[#071A3D]/50 text-[#071A3D] dark:text-slate-300 hover:bg-[#BCEBFF]/40'
            }`}
          >
            الملخصات وبنك الأسئلة
          </button>
        </div>

        {/* Live Search Input */}
        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث باسم المصدر أو المادة..."
            className="w-full pr-9 pl-3 py-2 rounded-xl border border-[#BCEBFF] dark:border-[#16958E]/40 text-xs font-medium focus:outline-none focus:border-[#16958E] dark:bg-[#071A3D] dark:text-white"
          />
        </div>
      </div>

      {/* Empty State */}
      {filteredResources.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-[#071A3D] rounded-3xl border border-[#BCEBFF]/60 dark:border-[#16958E]/20 p-8">
          <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-3 opacity-60" />
          <h3 className="font-bold text-base text-[#071A3D] dark:text-white">لم يتم العثور على مصادر مطابقة</h3>
          <p className="text-xs text-slate-500 mt-1">جرب تغيير التصنيف أو مسح عبارة البحث</p>
        </div>
      )}

      {/* Resources Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredResources.map((res, index) => {
          const destinationUrl = res.url || res.link;
          const targetSubjectId = res.subjectId || res.subjectTag;
          const showSubjectButton = hasValidSubject(res);

          return (
            <motion.div
              key={res.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-6 rounded-3xl bg-white dark:bg-[#071A3D] border border-[#BCEBFF]/80 dark:border-[#16958E]/30 hover:border-[#16958E] shadow-sm transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-[#BCEBFF]/20 dark:bg-[#071A3D]/70 border border-[#BCEBFF]/40 dark:border-[#16958E]/30">
                      {getCategoryIcon(res.category)}
                    </div>
                    <div>
                      {/* Title (RED corresponding area) */}
                      <h3 className="font-bold font-tajawal text-[#071A3D] dark:text-white text-lg">
                        {res.title}
                      </h3>
                      {/* Subject Tag indicator */}
                      <span className="text-xs text-[#16958E] dark:text-[#BCEBFF] font-medium inline-flex items-center gap-1">
                        <Compass className="w-3 h-3 inline text-[#16958E]" />
                        <span>{getSubjectDisplayName(res.subjectId, res.subjectTag)}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description (BLUE corresponding area) */}
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6 whitespace-pre-line">
                  {res.description}
                </p>
              </div>

              {/* Card Footer with Actions */}
              <div className="pt-4 border-t border-[#BCEBFF]/40 dark:border-[#16958E]/20 flex items-center justify-between gap-2">
                {/* Transfer button (BLACK corresponding area) */}
                <a
                  href={destinationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-[#071A3D] hover:bg-[#16958E] text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all active:scale-95 whitespace-nowrap cursor-pointer"
                  title={`الانتقال إلى: ${destinationUrl}`}
                >
                  <span>الانتقال للمصدر</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#BCEBFF]" />
                </a>

                {/* Subject preview (GREEN corresponding area) */}
                {showSubjectButton && targetSubjectId && (
                  <button
                    onClick={() => onNavigateToSubject(targetSubjectId)}
                    className="text-xs font-bold text-slate-500 hover:text-[#16958E] transition-colors flex items-center gap-1 cursor-pointer"
                    title={`فتح مادة ${targetSubjectId}`}
                  >
                    <span>استعراض المادة</span>
                    <span>←</span>
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

    </div>
  );
};
