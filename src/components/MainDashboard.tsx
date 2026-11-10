import React from 'react';
import { motion } from 'motion/react';
import { ActivePage, Lecture } from '../types';
import { GraduationCap, BookOpen, CalendarCheck, ArrowLeft, Send, Sparkles, Clock, CheckCircle2, Bookmark, BellRing, ChevronLeft, Zap, Layers, FileText, Video, Calendar, Smartphone, Download } from 'lucide-react';

interface MainDashboardProps {
  onNavigate: (page: ActivePage) => void;
  lectureCount: number;
  upcomingCount: number;
  lectures?: Lecture[];
}

export const MainDashboard: React.FC<MainDashboardProps> = ({
  onNavigate,
  lectureCount,
  upcomingCount,
  lectures = []
}) => {
  const currentDateFormatted = new Date().toLocaleDateString('ar-EG', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">
      
      {/* Top Welcome Title */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-right"
      >
        <div>
          <div className="flex items-center gap-2 text-[#16958E] font-bold text-xs mb-1">
            <Sparkles className="w-4 h-4 text-[#16958E]" />
            <span>تصميم شبكي تفاعلي • Bento Grid</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold font-tajawal text-[#071A3D] dark:text-white tracking-tight">
            لوحة تحكم دليلك الجامعي 🎓
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            تصفح الخدمات والأقسام الأكاديمية والمحاضرات بأسلوب منظم وسريع
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="http://t.me/Daleelak_AlJamaei_bot"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 bg-[#071A3D] hover:bg-[#16958E] text-white rounded-xl font-bold text-xs shadow-md shadow-[#071A3D]/20 transition-all flex items-center gap-2"
          >
            <Send className="w-4 h-4 rotate-180 text-[#BCEBFF]" />
            <span>بوت التلجرام الرسمى</span>
          </a>
        </div>
      </motion.div>

      {/* Quick Access Bar for Articles & Videos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <motion.div
          whileHover={{ scale: 1.01 }}
          onClick={() => onNavigate('articles')}
          className="p-5 rounded-2xl bg-gradient-to-r from-[#071A3D] to-[#16958E] text-white shadow-md cursor-pointer flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-[#BCEBFF]">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold font-tajawal text-base">المقالات والأبحاث الأكاديمية</h4>
              <p className="text-xs text-[#BCEBFF]">استعرض أحدث المقالات والإرشادات الطبية والتعليمية</p>
            </div>
          </div>
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.01 }}
          onClick={() => onNavigate('videos')}
          className="p-5 rounded-2xl bg-gradient-to-r from-[#16958E] to-[#071A3D] text-white shadow-md cursor-pointer flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-[#BCEBFF]">
              <Video className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold font-tajawal text-base">المكتبة المرئية والفيديوهات</h4>
              <p className="text-xs text-[#BCEBFF]">شروحات ومحاضرات فيديو مسجلة مع مشغل تفاعلي</p>
            </div>
          </div>
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        </motion.div>
      </div>

      {/* Bento Grid Layout Main Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Bento Box 1: Hero & Stats Banner (Col 8) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-8 bg-white dark:bg-[#071A3D] border border-[#BCEBFF]/80 dark:border-[#16958E]/30 rounded-[2rem] p-6 sm:p-8 shadow-sm relative overflow-hidden flex flex-col justify-between"
        >
          <div className="absolute top-0 left-0 w-64 h-64 bg-[#BCEBFF]/20 dark:bg-[#16958E]/10 rounded-full -translate-x-20 -translate-y-20 pointer-events-none opacity-60"></div>
          
          <div className="relative z-10">
            <span className="px-4 py-1.5 bg-[#BCEBFF]/40 dark:bg-[#16958E]/20 text-[#071A3D] dark:text-[#BCEBFF] rounded-full text-xs font-bold uppercase tracking-wider mb-4 inline-block border border-[#16958E]/30">
              مرحباً بك، طالب الكلية
            </span>
            <h3 className="text-2xl sm:text-4xl font-extrabold text-[#071A3D] dark:text-white leading-tight mb-3 font-tajawal">
              ابدأ رحلتك الأكاديمية <br />
              <span className="text-[#16958E] dark:text-[#BCEBFF]">بذكاء وتنظيم فاخر</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed mb-6">
              منصة شاملة لمتابعة الجداول والكتب والملخصات وتنبيهات المحاضرات الفورية مع ربط التلجرام الحقيقي.
            </p>
          </div>

          {/* Sub-Stats Cards */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 relative z-10 pt-4 border-t border-[#BCEBFF]/40 dark:border-[#16958E]/30">
            <div className="bg-[#BCEBFF]/20 dark:bg-[#071A3D]/60 p-3.5 sm:p-4 rounded-2xl border border-[#BCEBFF]/50 dark:border-[#16958E]/30">
              <p className="text-slate-500 dark:text-slate-400 text-[11px] font-bold mb-1">المحاضرات الكلية</p>
              <p className="text-xl sm:text-2xl font-extrabold text-[#071A3D] dark:text-white font-mono">{lectureCount}</p>
            </div>
            <div className="bg-[#BCEBFF]/20 dark:bg-[#071A3D]/60 p-3.5 sm:p-4 rounded-2xl border border-[#BCEBFF]/50 dark:border-[#16958E]/30">
              <p className="text-slate-500 dark:text-slate-400 text-[11px] font-bold mb-1">المحاضرات القادمة</p>
              <p className="text-xl sm:text-2xl font-extrabold text-[#16958E] dark:text-[#BCEBFF] font-mono">{upcomingCount}</p>
            </div>
            <div className="bg-[#BCEBFF]/20 dark:bg-[#071A3D]/60 p-3.5 sm:p-4 rounded-2xl border border-[#BCEBFF]/50 dark:border-[#16958E]/30">
              <p className="text-slate-500 dark:text-slate-400 text-[11px] font-bold mb-1">المواد المقررة</p>
              <p className="text-xl sm:text-2xl font-extrabold text-[#16958E] dark:text-[#BCEBFF] font-mono">6 مواد</p>
            </div>
          </div>
        </motion.div>

        {/* Bento Box 2: Schedule Card (Col 4) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-4 bg-white dark:bg-[#071A3D] border border-[#BCEBFF]/80 dark:border-[#16958E]/30 text-slate-800 dark:text-white rounded-[2rem] p-6 shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-[#BCEBFF]/40 dark:border-[#16958E]/30">
              <h3 className="text-[#071A3D] dark:text-white font-bold text-base font-tajawal flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#16958E]" />
                <span>الجدول الدراسي</span>
              </h3>
              <span className="text-slate-400 text-xs font-mono">{currentDateFormatted}</span>
            </div>

            {lectures.length === 0 ? (
              <div className="my-6 py-6 text-center flex flex-col items-center justify-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-[#BCEBFF]/40 text-[#16958E] flex items-center justify-center mb-1">
                  <Calendar className="w-6 h-6" />
                </div>
                <p className="text-[#071A3D] dark:text-white font-bold text-sm font-tajawal">لا توجد محاضرات حالياً</p>
                <p className="text-slate-400 text-xs max-w-[220px]">
                  لم يتم إضافة أي محاضرات في جدول التذكير بعد
                </p>
              </div>
            ) : (
              <div className="space-y-3 mb-6 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
                {lectures.slice(0, 4).map((lec) => {
                  const todayStr = new Date().toISOString().split('T')[0];
                  return (
                    <div key={lec.id} className="flex gap-3 items-center p-2.5 rounded-xl bg-[#BCEBFF]/20 dark:bg-[#071A3D]/40 border border-[#BCEBFF]/50 dark:border-[#16958E]/30">
                      <div className="text-[#16958E] dark:text-[#BCEBFF] font-bold text-[11px] font-mono w-14 flex-shrink-0 text-center bg-[#BCEBFF]/40 py-1 rounded-lg border border-[#16958E]/30">
                        {lec.time}
                      </div>
                      <div className="flex-1 min-w-0 text-right">
                        <p className={`text-xs font-bold font-tajawal truncate ${lec.completed ? 'line-through text-slate-400' : 'text-[#071A3D] dark:text-white'}`}>
                          {lec.title}
                        </p>
                        <p className="text-slate-500 dark:text-slate-400 text-[10px] truncate mt-0.5">
                          {lec.subject} {lec.hall ? `• ${lec.hall}` : ''} {lec.professor ? `• ${lec.professor}` : ''}
                        </p>
                      </div>
                      {lec.date === todayStr && (
                        <span className="px-2 py-0.5 rounded-full bg-[#16958E] text-white font-bold text-[9px] flex-shrink-0">
                          اليوم
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <button
            onClick={() => onNavigate('schedule')}
            className="w-full py-3 bg-[#071A3D] hover:bg-[#16958E] text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 active:scale-95"
          >
            <span>عرض وإدارة الجدول الكامل</span>
            <ArrowLeft className="w-4 h-4 text-[#BCEBFF]" />
          </button>
        </motion.div>

      </div>

      {/* Core 3 Main Section Bento Cards Grid - STRICT REQUIREMENT */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: معلومات عن الكلية والمواد */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          whileHover={{ y: -6, scale: 1.01 }}
          onClick={() => onNavigate('college')}
          className="group cursor-pointer bg-white dark:bg-[#071A3D] border border-[#BCEBFF]/80 dark:border-[#16958E]/30 rounded-[2rem] p-7 shadow-sm hover:border-[#16958E] transition-all flex flex-col justify-between"
        >
          <div>
            <div className="w-14 h-14 rounded-2xl bg-[#071A3D] text-[#BCEBFF] flex items-center justify-center shadow-lg shadow-[#071A3D]/25 group-hover:scale-110 transition-transform mb-6">
              <GraduationCap className="w-7 h-7 stroke-[2.2]" />
            </div>

            <span className="text-[11px] font-bold text-[#16958E] dark:text-[#BCEBFF] font-mono uppercase tracking-wider block mb-1">
              القسم الأول
            </span>

            <h3 className="text-xl font-bold font-tajawal text-[#071A3D] dark:text-white mb-2 group-hover:text-[#16958E] transition-colors">
              ١. معلومات عن الكلية والمواد
            </h3>

            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed mb-6">
              شرح كامل لنظام الكلية، الساعات المعتمدة، التقييم والأكاديميا، ونصائح الطلاب المستجدين لحساب المعدل.
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#BCEBFF]/40 dark:border-[#16958E]/30 text-[#16958E] dark:text-[#BCEBFF] font-bold text-xs">
            <span>تصفح دليل الكلية</span>
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1.5 transition-transform" />
          </div>
        </motion.div>

        {/* Card 2: مصادر الدراسة والمقررات */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          whileHover={{ y: -6, scale: 1.01 }}
          onClick={() => onNavigate('resources')}
          className="group cursor-pointer bg-white dark:bg-[#071A3D] border border-[#BCEBFF]/80 dark:border-[#16958E]/30 rounded-[2rem] p-7 shadow-sm hover:border-[#16958E] transition-all flex flex-col justify-between"
        >
          <div>
            <div className="w-14 h-14 rounded-2xl bg-[#16958E] text-white flex items-center justify-center shadow-lg shadow-[#16958E]/25 group-hover:scale-110 transition-transform mb-6">
              <BookOpen className="w-7 h-7 stroke-[2.2]" />
            </div>

            <span className="text-[11px] font-bold text-[#071A3D] dark:text-[#BCEBFF] font-mono uppercase tracking-wider block mb-1">
              القسم الثاني
            </span>

            <h3 className="text-xl font-bold font-tajawal text-[#071A3D] dark:text-white mb-2 group-hover:text-[#16958E] transition-colors">
              ٢. مصادر الدراسة والمقررات
            </h3>

            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed mb-6">
              مكتبة المقررات (Anatomy, Physiology, Biochemistry, Microbiology, Pathology, Pharmacology) والمراجع الطبية.
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#BCEBFF]/40 dark:border-[#16958E]/30 text-[#16958E] dark:text-[#BCEBFF] font-bold text-xs">
            <span>فتح المقررات الأكاديمية</span>
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1.5 transition-transform" />
          </div>
        </motion.div>

        {/* Card 3: التنظيم والتذكير */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          whileHover={{ y: -6, scale: 1.01 }}
          onClick={() => onNavigate('schedule')}
          className="group cursor-pointer bg-white dark:bg-[#071A3D] border border-[#BCEBFF]/80 dark:border-[#16958E]/30 rounded-[2rem] p-7 shadow-sm hover:border-[#16958E] transition-all flex flex-col justify-between"
        >
          <div>
            <div className="w-14 h-14 rounded-2xl bg-[#071A3D] text-[#BCEBFF] flex items-center justify-center shadow-lg shadow-[#071A3D]/25 group-hover:scale-110 transition-transform mb-6">
              <CalendarCheck className="w-7 h-7 stroke-[2.2]" />
            </div>

            <span className="text-[11px] font-bold text-[#16958E] dark:text-[#BCEBFF] font-mono uppercase tracking-wider block mb-1">
              القسم الثالث
            </span>

            <h3 className="text-xl font-bold font-tajawal text-[#071A3D] dark:text-white mb-2 group-hover:text-[#16958E] transition-colors">
              ٣. التنظيم والتذكير
            </h3>

            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed mb-6">
              إدارة جدول المحاضرات التفاعلي، التخزين الدائم، والتنبيهات التلقائية المباشرة بالفيسبوك والمتصفح.
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#BCEBFF]/40 dark:border-[#16958E]/30 text-[#16958E] dark:text-[#BCEBFF] font-bold text-xs">
            <span>جدول المحاضرات والتنبيهات</span>
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1.5 transition-transform" />
          </div>
        </motion.div>

      </div>

      {/* Secondary Bento Grid Row: Subjects Quick Access & Telegram & Smart Notifications */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Subjects Bento Grid Card (Col 5) */}
        <div className="md:col-span-5 bg-white dark:bg-[#071A3D] border border-[#BCEBFF]/80 dark:border-[#16958E]/30 rounded-[2rem] p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[#071A3D] dark:text-white text-base font-tajawal">المواد الدراسية السريعة</h3>
            <button
              onClick={() => onNavigate('subjects')}
              className="text-[#16958E] dark:text-[#BCEBFF] text-xs font-bold hover:underline"
            >
              عرض الكل
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div onClick={() => onNavigate('subjects')} className="flex flex-col items-center p-3 rounded-2xl bg-[#BCEBFF]/20 dark:bg-[#071A3D]/50 border border-[#BCEBFF]/50 dark:border-[#16958E]/30 hover:scale-105 cursor-pointer transition-transform">
              <div className="w-10 h-10 bg-[#071A3D] text-[#BCEBFF] rounded-xl flex items-center justify-center mb-1.5 font-bold font-mono text-xs">An</div>
              <span className="text-[10px] font-bold text-[#071A3D] dark:text-white">Anatomy</span>
            </div>

            <div onClick={() => onNavigate('subjects')} className="flex flex-col items-center p-3 rounded-2xl bg-[#BCEBFF]/20 dark:bg-[#071A3D]/50 border border-[#BCEBFF]/50 dark:border-[#16958E]/30 hover:scale-105 cursor-pointer transition-transform">
              <div className="w-10 h-10 bg-[#16958E] text-white rounded-xl flex items-center justify-center mb-1.5 font-bold font-mono text-xs">Ph</div>
              <span className="text-[10px] font-bold text-[#071A3D] dark:text-white">Physiology</span>
            </div>

            <div onClick={() => onNavigate('subjects')} className="flex flex-col items-center p-3 rounded-2xl bg-[#BCEBFF]/20 dark:bg-[#071A3D]/50 border border-[#BCEBFF]/50 dark:border-[#16958E]/30 hover:scale-105 cursor-pointer transition-transform">
              <div className="w-10 h-10 bg-[#071A3D] text-[#BCEBFF] rounded-xl flex items-center justify-center mb-1.5 font-bold font-mono text-xs">Bc</div>
              <span className="text-[10px] font-bold text-[#071A3D] dark:text-white">Biochem</span>
            </div>

            <div onClick={() => onNavigate('subjects')} className="flex flex-col items-center p-3 rounded-2xl bg-[#BCEBFF]/20 dark:bg-[#071A3D]/50 border border-[#BCEBFF]/50 dark:border-[#16958E]/30 hover:scale-105 cursor-pointer transition-transform">
              <div className="w-10 h-10 bg-[#16958E] text-white rounded-xl flex items-center justify-center mb-1.5 font-bold font-mono text-xs">Mi</div>
              <span className="text-[10px] font-bold text-[#071A3D] dark:text-white">Microbio</span>
            </div>

            <div onClick={() => onNavigate('subjects')} className="flex flex-col items-center p-3 rounded-2xl bg-[#BCEBFF]/20 dark:bg-[#071A3D]/50 border border-[#BCEBFF]/50 dark:border-[#16958E]/30 hover:scale-105 cursor-pointer transition-transform">
              <div className="w-10 h-10 bg-[#071A3D] text-[#BCEBFF] rounded-xl flex items-center justify-center mb-1.5 font-bold font-mono text-xs">Pa</div>
              <span className="text-[10px] font-bold text-[#071A3D] dark:text-white">Pathology</span>
            </div>

            <div onClick={() => onNavigate('subjects')} className="flex flex-col items-center p-3 rounded-2xl bg-[#BCEBFF]/20 dark:bg-[#071A3D]/50 border border-[#BCEBFF]/50 dark:border-[#16958E]/30 hover:scale-105 cursor-pointer transition-transform">
              <div className="w-10 h-10 bg-[#16958E] text-white rounded-xl flex items-center justify-center mb-1.5 font-bold font-mono text-xs">Pm</div>
              <span className="text-[10px] font-bold text-[#071A3D] dark:text-white">Pharmaco</span>
            </div>
          </div>
        </div>

        {/* Telegram Bento Card (Col 4) */}
        <a
          href="http://t.me/Daleelak_AlJamaei_bot"
          target="_blank"
          rel="noopener noreferrer"
          className="md:col-span-4 bg-gradient-to-br from-[#071A3D] via-[#16958E] to-[#071A3D] rounded-[2rem] p-6 shadow-lg shadow-[#071A3D]/20 flex flex-col items-center justify-center text-center text-white group cursor-pointer hover:scale-[1.02] transition-transform"
        >
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform text-[#BCEBFF]">
            <Send className="w-8 h-8 rotate-180" />
          </div>
          <h4 className="text-xl font-bold font-tajawal mb-1">بوت التلجرام الرسمى</h4>
          <p className="text-[#BCEBFF] text-xs leading-relaxed max-w-xs">
            تواصل معنا واحصل على الملخصات والتحديثات الأكاديمية مباشرة على التلجرام
          </p>
        </a>

        {/* Smart Notifications & PWA Bento Card (Col 3) */}
        <div className="md:col-span-3 bg-white dark:bg-[#071A3D] border border-[#BCEBFF]/80 dark:border-[#16958E]/30 rounded-[2rem] p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-[#BCEBFF]/40 text-[#16958E] rounded-2xl flex items-center justify-center flex-shrink-0">
              <Smartphone className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-bold text-[#071A3D] dark:text-white text-sm font-tajawal">تطبيق الهاتف PWA</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">مثبت في قائمة تطبيقاتك</p>
            </div>
          </div>

          <button
            onClick={() => window.dispatchEvent(new CustomEvent('open-pwa-install'))}
            className="p-3 rounded-2xl bg-[#16958E] hover:bg-[#127d77] text-white flex items-center justify-between text-xs font-bold transition-all shadow-md shadow-[#16958E]/20 active:scale-95 cursor-pointer"
          >
            <span>تثبيت التطبيق الآن</span>
            <Download className="w-4 h-4 text-[#BCEBFF]" />
          </button>
        </div>

      </div>

    </div>
  );
};
