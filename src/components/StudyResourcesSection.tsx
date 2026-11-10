import React, { useState } from 'react';
import { motion } from 'motion/react';
import { STUDY_RESOURCES } from '../data/academicContent';
import { StudyResource } from '../types';
import { BookOpen, Send, Video, FileText, ExternalLink, ArrowRight, Sparkles, Download, Layers } from 'lucide-react';

interface StudyResourcesSectionProps {
  onBack: () => void;
  onNavigateToSubject: (subjectId: string) => void;
}

export const StudyResourcesSection: React.FC<StudyResourcesSectionProps> = ({ onBack, onNavigateToSubject }) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const filteredResources = STUDY_RESOURCES.filter(res => 
    filterCategory === 'all' || res.category === filterCategory
  );

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'telegram': return <Send className="w-5 h-5 text-[#16958E] rotate-180" />;
      case 'book': return <BookOpen className="w-5 h-5 text-[#071A3D] dark:text-[#BCEBFF]" />;
      case 'video': return <Video className="w-5 h-5 text-[#16958E]" />;
      case 'notes': return <FileText className="w-5 h-5 text-[#071A3D] dark:text-[#BCEBFF]" />;
      default: return <Layers className="w-5 h-5 text-[#16958E]" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 h-9 sm:h-10 px-3.5 rounded-xl bg-[#BCEBFF]/30 hover:bg-[#BCEBFF]/60 text-[#071A3D] dark:text-[#BCEBFF] font-bold text-xs sm:text-sm transition-all mb-4"
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
            مجموعة مختارة من أفضل المراجع العلمية، البوتات التعليمية، والمذكرات الملخصة.
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
        className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#071A3D] border border-[#BCEBFF]/80 dark:border-[#16958E]/30 mb-10 relative overflow-hidden shadow-sm"
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

      {/* Filter Categories */}
      <div className="flex items-center gap-2 border-b border-[#BCEBFF]/40 dark:border-[#16958E]/30 pb-4 mb-8 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setFilterCategory('all')}
          className={`h-9 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center ${
            filterCategory === 'all'
              ? 'bg-[#071A3D] text-white shadow-sm'
              : 'bg-[#BCEBFF]/20 dark:bg-[#071A3D]/50 text-[#071A3D] dark:text-slate-300 hover:bg-[#BCEBFF]/40'
          }`}
        >
          جميع المصادر
        </button>

        <button
          onClick={() => setFilterCategory('telegram')}
          className={`h-9 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center ${
            filterCategory === 'telegram'
              ? 'bg-[#071A3D] text-white shadow-sm'
              : 'bg-[#BCEBFF]/20 dark:bg-[#071A3D]/50 text-[#071A3D] dark:text-slate-300 hover:bg-[#BCEBFF]/40'
          }`}
        >
          بوت التلجرام
        </button>

        <button
          onClick={() => setFilterCategory('book')}
          className={`h-9 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center ${
            filterCategory === 'book'
              ? 'bg-[#071A3D] text-white shadow-sm'
              : 'bg-[#BCEBFF]/20 dark:bg-[#071A3D]/50 text-[#071A3D] dark:text-slate-300 hover:bg-[#BCEBFF]/40'
          }`}
        >
          الأطلس والكتب
        </button>

        <button
          onClick={() => setFilterCategory('video')}
          className={`h-9 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center ${
            filterCategory === 'video'
              ? 'bg-[#071A3D] text-white shadow-sm'
              : 'bg-[#BCEBFF]/20 dark:bg-[#071A3D]/50 text-[#071A3D] dark:text-slate-300 hover:bg-[#BCEBFF]/40'
          }`}
        >
          الشروحات والمرئيات
        </button>

        <button
          onClick={() => setFilterCategory('notes')}
          className={`h-9 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center ${
            filterCategory === 'notes'
              ? 'bg-[#071A3D] text-white shadow-sm'
              : 'bg-[#BCEBFF]/20 dark:bg-[#071A3D]/50 text-[#071A3D] dark:text-slate-300 hover:bg-[#BCEBFF]/40'
          }`}
        >
          الملخصات وبنك الأسئلة
        </button>
      </div>

      {/* Resources Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredResources.map((res, index) => (
          <motion.div
            key={res.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            className="p-6 rounded-3xl bg-white dark:bg-[#071A3D] border border-[#BCEBFF]/80 dark:border-[#16958E]/30 hover:border-[#16958E] shadow-sm transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-[#BCEBFF]/20 dark:bg-[#071A3D]/70 border border-[#BCEBFF]/40 dark:border-[#16958E]/30">
                    {getCategoryIcon(res.category)}
                  </div>
                  <div>
                    <h3 className="font-bold font-tajawal text-[#071A3D] dark:text-white text-lg">
                      {res.title}
                    </h3>
                    <span className="text-xs text-[#16958E] dark:text-[#BCEBFF] font-mono">
                      {res.subjectId === 'general' ? 'جميع المقررات' : res.subjectId}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">
                {res.description}
              </p>
            </div>

            <div className="pt-4 border-t border-[#BCEBFF]/40 dark:border-[#16958E]/20 flex items-center justify-between">
              <a
                href={res.link}
                target={res.isExternal ? '_blank' : '_self'}
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-[#071A3D] hover:bg-[#16958E] text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all active:scale-95"
              >
                <span>الانتقال للمصدر</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#BCEBFF]" />
              </a>

              {res.subjectId !== 'general' && (
                <button
                  onClick={() => onNavigateToSubject(res.subjectId)}
                  className="text-xs font-bold text-slate-500 hover:text-[#16958E] transition-colors"
                >
                  استعراض المادة →
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

    </div>
  );
};
