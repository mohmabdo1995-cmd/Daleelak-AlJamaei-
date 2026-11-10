import React, { useState } from 'react';
import { ActivePage } from '../types';
import { Sparkles, Calculator, Timer, Download, PackageCheck } from 'lucide-react';

interface HeaderProps {
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  onOpenGpa: () => void;
  onOpenPomodoro: () => void;
  onOpenAddLecture: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activePage,
  setActivePage,
  onOpenGpa,
  onOpenPomodoro,
  onOpenAddLecture
}) => {
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-[#BCEBFF]/60 dark:border-[#16958E]/30 backdrop-blur-md transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-2 sm:gap-3 cursor-pointer group flex-shrink-0" onClick={() => setActivePage('landing')}>
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-white border border-[#16958E]/30 flex items-center justify-center p-0.5 shadow-md sm:shadow-lg shadow-[#071A3D]/10 group-hover:scale-105 transition-all duration-300 flex-shrink-0 overflow-hidden">
              <img src="/icon.svg" alt="دليلك الجامعي" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col justify-center">
              <h1 className="text-xs sm:text-xl font-bold font-tajawal text-[#071A3D] dark:text-white tracking-tight leading-tight">
                دليلك الجامعي
              </h1>
              <span className="text-[9px] sm:text-xs font-medium text-[#16958E] dark:text-[#BCEBFF] flex items-center gap-0.5 leading-tight mt-0.5">
                <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#16958E] inline" />
                <span>جامعتك في جيبك</span>
              </span>
            </div>
          </div>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1.5 mx-4">
            <button
              onClick={() => setActivePage('main')}
              className={`h-9 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center ${
                activePage === 'main' ? 'bg-[#071A3D] text-white dark:bg-[#16958E]' : 'text-[#071A3D] dark:text-slate-200 hover:bg-[#BCEBFF]/30'
              }`}
            >
              الرئيسية
            </button>
            <button
              onClick={() => setActivePage('articles')}
              className={`h-9 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center ${
                activePage === 'articles' ? 'bg-[#071A3D] text-white dark:bg-[#16958E]' : 'text-[#071A3D] dark:text-slate-200 hover:bg-[#BCEBFF]/30'
              }`}
            >
              المقالات
            </button>
            <button
              onClick={() => setActivePage('videos')}
              className={`h-9 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center ${
                activePage === 'videos' ? 'bg-[#071A3D] text-white dark:bg-[#16958E]' : 'text-[#071A3D] dark:text-slate-200 hover:bg-[#BCEBFF]/30'
              }`}
            >
              المكتبة المرئية
            </button>
            <button
              onClick={() => setActivePage('subjects')}
              className={`h-9 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center ${
                activePage === 'subjects' || activePage === 'subject-detail' ? 'bg-[#071A3D] text-white dark:bg-[#16958E]' : 'text-[#071A3D] dark:text-slate-200 hover:bg-[#BCEBFF]/30'
              }`}
            >
              المواد
            </button>
            <button
              onClick={() => setActivePage('schedule')}
              className={`h-9 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center ${
                activePage === 'schedule' ? 'bg-[#071A3D] text-white dark:bg-[#16958E]' : 'text-[#071A3D] dark:text-slate-200 hover:bg-[#BCEBFF]/30'
              }`}
            >
              الجدول
            </button>
          </nav>

          {/* Action Buttons: Unified in height (h-9 mobile, h-10 desktop) and proportional styling */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* Focus / Pomodoro Button */}
            <button
              onClick={onOpenPomodoro}
              title="مؤقت الدراسة والتركيز"
              className="h-9 sm:h-10 px-2.5 sm:px-3.5 rounded-xl bg-[#BCEBFF]/30 hover:bg-[#BCEBFF]/60 text-[#071A3D] border border-[#BCEBFF]/60 text-xs font-bold flex items-center justify-center gap-1 sm:gap-1.5 transition-all active:scale-95 whitespace-nowrap cursor-pointer"
            >
              <Timer className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#16958E]" />
              <span className="hidden xs:inline sm:inline">التركيز</span>
            </button>

            {/* GPA Calculator Button */}
            <button
              onClick={onOpenGpa}
              title="حساب المعدل التراكمي GPA"
              className="h-9 sm:h-10 px-2.5 sm:px-3.5 rounded-xl bg-[#BCEBFF]/30 hover:bg-[#BCEBFF]/60 text-[#071A3D] border border-[#BCEBFF]/60 text-xs font-bold flex items-center justify-center gap-1 sm:gap-1.5 transition-all active:scale-95 whitespace-nowrap cursor-pointer"
            >
              <Calculator className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#16958E]" />
              <span className="hidden xs:inline sm:inline">GPA</span>
            </button>

            {/* Direct PWA Install Button */}
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('trigger-pwa-install'))}
              title="تثبيت تطبيق دليلك الجامعي على هاتفك بشعار قبعة التخرج"
              className="h-9 sm:h-10 px-3 sm:px-3.5 rounded-xl bg-[#16958E] hover:bg-[#127d77] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md transition-all active:scale-95 whitespace-nowrap cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#BCEBFF]" />
              <span>تثبيت التطبيق 🎓</span>
            </button>


            {/* Download Zip Dropdown (Desktop Only) */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                title="تحميل المشروع ZIP"
                className="h-9 sm:h-10 px-3 sm:px-3.5 rounded-xl bg-[#BCEBFF]/30 hover:bg-[#BCEBFF]/60 text-[#071A3D] dark:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all border border-[#16958E]/30"
              >
                <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#16958E]" />
                <span>ZIP</span>
              </button>

              {showDownloadMenu && (
                <div className="absolute left-0 top-full mt-2 w-64 glass-panel rounded-2xl p-3 shadow-xl border border-[#BCEBFF] dark:border-[#16958E]/30 bg-white dark:bg-[#071A3D] z-50 animate-scale-in text-right">
                  <div className="text-[11px] font-bold text-slate-400 mb-2 px-2">اختر صيغة التحميل المطلوبة:</div>
                  <a
                    href="/dist_web_app.zip"
                    download="dist_web_app.zip"
                    onClick={() => setShowDownloadMenu(false)}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#BCEBFF]/20 transition-colors text-xs font-bold text-[#071A3D] dark:text-white mb-1 group"
                  >
                    <div>
                      <span className="block font-tajawal text-[#16958E]">نسخة الاستضافة والعمل بدون إنترنت (HTML/JS)</span>
                      <span className="text-[10px] text-slate-400 font-normal">جاهز للرفع على أي استضافة أونلاين أو أوفلاين</span>
                    </div>
                    <PackageCheck className="w-4 h-4 text-[#16958E] flex-shrink-0 mr-2" />
                  </a>

                  <a
                    href="/project_source.zip"
                    download="project_source.zip"
                    onClick={() => setShowDownloadMenu(false)}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#BCEBFF]/20 transition-colors text-xs font-bold text-[#071A3D] dark:text-white group"
                  >
                    <div>
                      <span className="block font-tajawal text-[#071A3D] dark:text-[#BCEBFF]">الكود المصدري الكامل (Source Code)</span>
                      <span className="text-[10px] text-slate-400 font-normal">يتضمن ملفات React و TypeScript والمكونات</span>
                    </div>
                    <Download className="w-4 h-4 text-[#071A3D] dark:text-[#BCEBFF] flex-shrink-0 mr-2" />
                  </a>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
