import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { COLLEGE_INFO } from '../data/academicContent';
import { GraduationCap, BookOpen, CheckCircle2, Award, Clock, ArrowRight, Lightbulb } from 'lucide-react';
import { FirebaseService } from '../services/firebase';
import { CollegeInfoData } from '../types';

interface CollegeInfoSectionProps {
  onBack: () => void;
  onNavigateToSubjects: () => void;
}

export const CollegeInfoSection: React.FC<CollegeInfoSectionProps> = ({
  onBack,
  onNavigateToSubjects
}) => {
  const [info, setInfo] = useState<CollegeInfoData>({
    title: COLLEGE_INFO.title,
    tagline: COLLEGE_INFO.tagline,
    image: COLLEGE_INFO.image,
    overview: COLLEGE_INFO.overview,
    creditSystem: COLLEGE_INFO.creditSystem,
    survivalTips: COLLEGE_INFO.survivalTips.map((t, idx) => ({ id: 'tip-' + idx, ...t })),
    customSections: []
  });

  useEffect(() => {
    const unsubscribe = FirebaseService.subscribeCollegeInfo((data) => {
      setInfo(data);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      
      {/* Back Button & Top Navigation */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 h-9 sm:h-10 px-3.5 rounded-xl bg-[#BCEBFF]/30 hover:bg-[#BCEBFF]/60 text-[#071A3D] dark:text-[#BCEBFF] font-bold text-xs sm:text-sm transition-all"
        >
          <ArrowRight className="w-4 h-4" />
          <span>الرجوع للرئيسية</span>
        </button>

        <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#BCEBFF]/40 text-[#071A3D] border border-[#16958E]/30">
          القسم الأول
        </span>
      </div>

      {/* College Hero Image & Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl mb-10 shadow-2xl border border-[#BCEBFF]/80 dark:border-[#16958E]/30"
      >
        <img
          src={info.image}
          alt={info.title}
          className="w-full h-64 sm:h-96 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#071A3D] via-[#071A3D]/70 to-transparent flex flex-col justify-end p-6 sm:p-10 text-white">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#071A3D]/80 text-white text-xs font-bold w-fit mb-3 backdrop-blur-md border border-[#16958E]/30">
            <GraduationCap className="w-4 h-4 text-[#BCEBFF]" />
            <span>جامعتك في جيبك</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold font-tajawal mb-2">{info.title}</h1>
          <p className="text-slate-200 text-sm sm:text-base max-w-2xl font-medium">{info.tagline}</p>
        </div>
      </motion.div>

      {/* Main Content Sections */}
      <div className="space-y-8">
        
        {/* Overview Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#071A3D] border border-[#BCEBFF]/80 dark:border-[#16958E]/30 shadow-sm"
        >
          <h2 className="text-xl sm:text-2xl font-bold font-tajawal text-[#071A3D] dark:text-white mb-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#BCEBFF]/40 text-[#16958E]">
              <BookOpen className="w-6 h-6" />
            </div>
            نظرة عامة عن الدراسة والكلية
          </h2>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-base sm:text-lg whitespace-pre-wrap">
            {info.overview}
          </p>
        </motion.div>

        {/* Credit System Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#071A3D] border border-[#BCEBFF]/80 dark:border-[#16958E]/30 shadow-sm"
        >
          <h2 className="text-xl sm:text-2xl font-bold font-tajawal text-[#071A3D] dark:text-white mb-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#BCEBFF]/40 text-[#071A3D] dark:text-[#BCEBFF]">
              <Clock className="w-6 h-6" />
            </div>
            نظام الدراسة والتقييم الأكاديمي
          </h2>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-base sm:text-lg whitespace-pre-wrap">
            {info.creditSystem}
          </p>
        </motion.div>

        {/* Custom Sections Added By Admin */}
        {info.customSections && info.customSections.map((sec, idx) => (
          <motion.div
            key={sec.id || idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#071A3D] border border-[#BCEBFF]/80 dark:border-[#16958E]/30 shadow-sm"
          >
            {sec.image && (
              <img src={sec.image} alt={sec.title} className="w-full h-56 object-cover rounded-2xl mb-4 border border-[#BCEBFF]/80" />
            )}
            <h2 className="text-xl sm:text-2xl font-bold font-tajawal text-[#071A3D] dark:text-white mb-3">
              {sec.title}
            </h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-base whitespace-pre-wrap">
              {sec.content}
            </p>
          </motion.div>
        ))}

        {/* Freshman Survival Tips */}
        {info.survivalTips && info.survivalTips.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#071A3D] border border-[#BCEBFF]/80 dark:border-[#16958E]/30 shadow-sm"
          >
            <h2 className="text-xl sm:text-2xl font-bold font-tajawal text-[#071A3D] dark:text-white mb-6 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#BCEBFF]/40 text-[#16958E]">
                <Lightbulb className="w-6 h-6" />
              </div>
              نصائح توجيهية للطلاب المستجدين
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {info.survivalTips.map((tip, idx) => (
                <div key={tip.id || idx} className="p-5 rounded-2xl bg-[#BCEBFF]/20 dark:bg-[#071A3D]/50 border border-[#BCEBFF]/50 dark:border-[#16958E]/30">
                  <div className="flex items-center gap-2 font-bold text-[#071A3D] dark:text-white mb-2">
                    <CheckCircle2 className="w-5 h-5 text-[#16958E] flex-shrink-0" />
                    <h4>{tip.title}</h4>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                    {tip.description}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Call to action to Section 2 (المواد) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 rounded-3xl bg-gradient-to-r from-[#071A3D] via-[#16958E] to-[#071A3D] text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-[#071A3D]/25"
        >
          <div className="flex items-center gap-4">
            <Award className="w-10 h-10 text-[#BCEBFF]" />
            <div>
              <h3 className="font-bold font-tajawal text-lg">هل أنت جاهز لاستكشاف المقررات الدراسية؟</h3>
              <p className="text-xs text-[#BCEBFF]">استعرض المواد المقررة والأكاديميا بالتفصيل.</p>
            </div>
          </div>

          <button
            onClick={onNavigateToSubjects}
            className="px-6 py-3 rounded-2xl bg-white text-[#071A3D] font-bold text-sm hover:bg-[#BCEBFF]/30 hover:text-white transition-all shadow-md active:scale-95 whitespace-nowrap"
          >
            الانتقال إلى مصادر والمواد
          </button>
        </motion.div>

      </div>
    </div>
  );
};
