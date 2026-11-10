import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Send, Sparkles, BookOpen, Calendar, Zap, Download } from 'lucide-react';
import { SiteConfig, DEFAULT_SITE_CONFIG } from '../services/firebase';

interface LandingHeroProps {
  onEnter: () => void;
  siteConfig?: SiteConfig;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ onEnter, siteConfig = DEFAULT_SITE_CONFIG }) => {
  const vis = siteConfig.sectionVisibility || DEFAULT_SITE_CONFIG.sectionVisibility;

  if (vis.heroSection === false) {
    return null;
  }

  return (
    <div className="relative min-h-[calc(100vh-80px)] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-12 overflow-hidden bg-grid-pattern">
      
      {/* Background Radial Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 sm:w-[500px] sm:h-[500px] bg-[#16958E]/15 dark:bg-[#16958E]/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-[#BCEBFF]/30 dark:bg-[#BCEBFF]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto text-center relative z-10 flex flex-col items-center">
        
        {/* Animated Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#BCEBFF]/40 dark:bg-[#071A3D]/80 border border-[#16958E]/30 text-[#071A3D] dark:text-[#BCEBFF] text-xs sm:text-sm font-bold shadow-sm mb-6"
        >
          <Sparkles className="w-4 h-4 text-[#16958E] animate-pulse" />
          <span>{siteConfig.heroBadgeText || 'الدليل الرقمي الذكي للطلاب الجامعيين'}</span>
          <span className="bg-[#16958E] text-white text-[10px] px-2 py-0.5 rounded-full font-mono">2026</span>
        </motion.div>

        {/* Main Title - Dynamic Site Title */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-7xl font-extrabold font-tajawal tracking-tight text-[#071A3D] dark:text-white mb-4 leading-tight"
        >
          {siteConfig.siteTitle || 'دليلك الجامعي'}
        </motion.h1>

        {/* Concept Tagline */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#071A3D] via-[#16958E] to-[#16958E] dark:from-[#BCEBFF] dark:via-white dark:to-[#16958E] mb-6 font-tajawal"
        >
          &quot;{siteConfig.siteSubtitle || 'جامعتك في جيبك'}&quot;
        </motion.div>

        {/* Short Introduction / Hero Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed mb-10 font-medium"
        >
          {siteConfig.heroSubtitle || 'منصة أكاديمية شاملة تُساعد الطلاب المستجدين والجامعيين على التأقلم مع الحياة الأكاديمية، تنظيم المحاضرات، متابعة المقررات، وتلقي التذكيرات المباشرة بأسلوب عصري ومنظم.'}
        </motion.p>

        {/* Buttons Grid - Respect ON/OFF switches */}
        {vis.heroButtons !== false && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full justify-center mb-14"
          >
            <button
              onClick={onEnter}
              className="group relative inline-flex items-center justify-center gap-2.5 h-13 sm:h-14 px-7 sm:px-8 rounded-2xl text-sm sm:text-base font-bold text-white bg-gradient-to-r from-[#071A3D] via-[#16958E] to-[#071A3D] shadow-xl shadow-[#071A3D]/25 hover:shadow-2xl hover:shadow-[#16958E]/40 hover:scale-105 active:scale-95 transition-all duration-300 w-full sm:w-auto cursor-pointer"
            >
              <span>{siteConfig.heroPrimaryBtnText || 'دخول اللوحة الرئيسية'}</span>
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1.5 transition-transform duration-300" />
              <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </button>

            {/* Direct PWA Install Button */}
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('trigger-pwa-install'))}
              className="inline-flex items-center justify-center gap-2.5 h-13 sm:h-14 px-7 sm:px-8 rounded-2xl text-sm sm:text-base font-bold text-white bg-[#16958E] hover:bg-[#127d77] border border-[#16958E]/40 shadow-lg shadow-[#16958E]/25 hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 w-full sm:w-auto cursor-pointer"
            >
              <Download className="w-5 h-5 text-[#BCEBFF]" />
              <span>تثبيت التطبيق على الجوال 📲</span>
            </button>

            {/* Direct Telegram Bot Link */}
            {vis.telegramCard !== false && (
              <a
                href={siteConfig.telegramBotLink || "http://t.me/Daleelak_AlJamaei_bot"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 h-13 sm:h-14 px-7 sm:px-8 rounded-2xl text-sm sm:text-base font-bold text-[#071A3D] dark:text-[#BCEBFF] bg-[#BCEBFF]/40 dark:bg-[#071A3D]/60 border border-[#16958E]/30 hover:bg-[#BCEBFF]/70 dark:hover:bg-[#16958E]/30 transition-all duration-200 w-full sm:w-auto text-center"
              >
                <Send className="w-5 h-5 rotate-180 text-[#16958E]" />
                <span>{siteConfig.telegramBotName || 'بوت التلجرام'}</span>
              </a>
            )}
          </motion.div>
        )}

        {/* Modern Illustration Graphic / Bento Highlights Grid - Respect ON/OFF */}
        {vis.heroStats !== false && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="w-full grid grid-cols-1 sm:grid-cols-3 gap-5 text-right"
          >
            <div className="p-6 rounded-[2rem] bg-white dark:bg-[#071A3D] border border-[#BCEBFF]/80 dark:border-[#16958E]/30 shadow-sm flex items-start gap-4 hover:border-[#16958E] transition-all">
              <div className="p-3.5 rounded-2xl bg-[#BCEBFF]/40 dark:bg-[#16958E]/20 text-[#071A3D] dark:text-[#BCEBFF]">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold font-tajawal text-[#071A3D] dark:text-white text-base mb-1">المعلومات الأكاديمية</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">تفاصيل الكلية والأنظمة والمواد الأساسية في مكان واحد.</p>
              </div>
            </div>

            <div className="p-6 rounded-[2rem] bg-white dark:bg-[#071A3D] border border-[#BCEBFF]/80 dark:border-[#16958E]/30 shadow-sm flex items-start gap-4 hover:border-[#16958E] transition-all">
              <div className="p-3.5 rounded-2xl bg-[#BCEBFF]/40 dark:bg-[#16958E]/20 text-[#16958E] dark:text-[#BCEBFF]">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold font-tajawal text-[#071A3D] dark:text-white text-base mb-1">جدول المحاضرات</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">إضافة وتعديل وحذف المحاضرات مع التنبيهات التلقائية.</p>
              </div>
            </div>

            <div className="p-6 rounded-[2rem] bg-white dark:bg-[#071A3D] border border-[#BCEBFF]/80 dark:border-[#16958E]/30 shadow-sm flex items-start gap-4 hover:border-[#16958E] transition-all">
              <div className="p-3.5 rounded-2xl bg-[#BCEBFF]/40 dark:bg-[#16958E]/20 text-[#071A3D] dark:text-[#BCEBFF]">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold font-tajawal text-[#071A3D] dark:text-white text-base mb-1">تنبيهات فورية و PWA</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">دعم الإشعارات وتصفح التطبيق بدون إنترنت بسهولة.</p>
              </div>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
};

