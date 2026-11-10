import React from 'react';
import { GraduationCap, Send, Heart, Sparkles, BookOpen, Calendar, Smartphone, Download } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: any) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="mt-20 border-t border-[#BCEBFF]/60 dark:border-[#16958E]/30 bg-white/70 dark:bg-[#071A3D]/80 backdrop-blur-md text-slate-600 dark:text-slate-400 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12 text-right">
          
          {/* Col 1: Brand */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white border border-[#16958E]/30 flex items-center justify-center p-0.5 shadow-md overflow-hidden">
                <img src="/icon.svg" alt="دليلك الجامعي" className="w-full h-full object-contain" />
              </div>
              <h3 className="text-xl font-bold font-tajawal text-[#071A3D] dark:text-white">دليلك الجامعي</h3>
            </div>

            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-md">
              منصة أكاديمية شاملة ومصممة خصيصاً لمساعدة الطلاب الجامعيين في تنقيح المواد والأكاديميا وإدارة المحاضرات بمرونة عالية.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-2">
              <a
                href="http://t.me/Daleelak_AlJamaei_bot"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#BCEBFF]/40 dark:bg-[#071A3D] text-[#071A3D] dark:text-[#BCEBFF] font-bold text-xs border border-[#16958E]/30 hover:bg-[#BCEBFF]/70 transition-all"
              >
                <Send className="w-4 h-4 rotate-180 text-[#16958E]" />
                <span>بوت التلجرام: @Daleelak_AlJamaei_bot</span>
              </a>

              <button
                onClick={() => window.dispatchEvent(new CustomEvent('open-pwa-install'))}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#16958E] hover:bg-[#127d77] text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
              >
                <Smartphone className="w-4 h-4 text-[#BCEBFF]" />
                <span>تثبيت التطبيق 📲</span>
              </button>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div>
            <h4 className="font-bold text-[#071A3D] dark:text-white text-sm mb-4">أقسام الدليل الأكاديمي</h4>
            <ul className="space-y-2.5 text-xs font-semibold">
              <li>
                <button onClick={() => onNavigate('main')} className="hover:text-[#16958E] transition-colors">
                  الصفحة الرئيسية
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('college')} className="hover:text-[#16958E] transition-colors">
                  معلومات الكلية والأكاديميا
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('articles')} className="hover:text-[#16958E] transition-colors">
                  المقالات والأبحاث الأكاديمية
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('videos')} className="hover:text-[#16958E] transition-colors">
                  المكتبة المرئية والفيديوهات
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('subjects')} className="hover:text-[#16958E] transition-colors">
                  المواد الدراسية ومصادر التعلم
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('schedule')} className="hover:text-[#16958E] transition-colors">
                  جدول المحاضرات والتذكيرات
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Subjects Links */}
          <div>
            <h4 className="font-bold text-[#071A3D] dark:text-white text-sm mb-4">المقررات الأساسية</h4>
            <ul className="space-y-2 text-xs font-mono">
              <li className="text-slate-500 dark:text-slate-400">Anatomy (علم التشريح)</li>
              <li className="text-slate-500 dark:text-slate-400">Physiology (وظائف الأعضاء)</li>
              <li className="text-slate-500 dark:text-slate-400">Biochemistry (الكيمياء الحيوية)</li>
              <li className="text-slate-500 dark:text-slate-400">Microbiology (الأحياء الدقيقة)</li>
              <li className="text-slate-500 dark:text-slate-400">Pathology (علم الأمراض)</li>
              <li className="text-slate-500 dark:text-slate-400">Pharmacology (علم الأدوية)</li>
            </ul>
          </div>

        </div>

        {/* Bottom Rights */}
        <div className="pt-8 border-t border-[#BCEBFF]/40 dark:border-[#16958E]/20 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div className="flex items-center gap-1 font-medium">
            <span>جميع الحقوق محفوظة © {new Date().getFullYear()} - دليلك الجامعي</span>
          </div>

          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#16958E]" />
            <span>جامعتك في جيبك • تطبيق ويب تقدمي PWA</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
