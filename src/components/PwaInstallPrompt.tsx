import React, { useState, useEffect, useCallback } from 'react';
import { Download, X, CheckCircle2, Zap, WifiOff, Bell, Share2, PlusSquare, Sparkles, ExternalLink, GraduationCap, AlertCircle, HelpCircle, ChevronDown, ChevronUp, Smartphone } from 'lucide-react';
import { Modal } from './common/Modal';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

declare global {
  interface Window {
    __deferredPWAInstallPrompt?: BeforeInstallPromptEvent | null;
  }
}

export const PwaInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInIframe, setIsInIframe] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [showTroubleshootGuide, setShowTroubleshootGuide] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [installAcceptedPending, setInstallAcceptedPending] = useState(false);

  useEffect(() => {
    // 1. Detect if app is already running as installed standalone PWA
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
      document.referrer.includes('android-app://');

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // 2. Detect if inside an iframe (like AI Studio preview)
    const inIframe = window.self !== window.top;
    setIsInIframe(inIframe);

    // 3. Detect iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // 4. Check if beforeinstallprompt was already captured in index.html
    if (window.__deferredPWAInstallPrompt) {
      setDeferredPrompt(window.__deferredPWAInstallPrompt);
    }

    // 5. Listen to native beforeinstallprompt event
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      window.__deferredPWAInstallPrompt = promptEvent;
      setDeferredPrompt(promptEvent);
      console.log('[PWA] beforeinstallprompt captured successfully.');
    };

    // Custom event dispatched from index.html if captured early
    const handleEarlyPromptAvailable = (e: Event) => {
      const customEvent = e as CustomEvent<BeforeInstallPromptEvent>;
      if (customEvent.detail) {
        setDeferredPrompt(customEvent.detail);
      } else if (window.__deferredPWAInstallPrompt) {
        setDeferredPrompt(window.__deferredPWAInstallPrompt);
      }
    };

    // Native appinstalled event when Android package manager finishes
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsOpen(false);
      setIsInstalling(false);
      setInstallAcceptedPending(false);
      setInstalledSuccess(true);
      setDeferredPrompt(null);
      window.__deferredPWAInstallPrompt = null;
      setTimeout(() => setInstalledSuccess(false), 8000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('pwa-prompt-available', handleEarlyPromptAvailable);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Listen to manual triggers from any button in the app (Header, Hero, etc.)
    const handleTriggerInstall = () => {
      triggerInstall();
    };
    window.addEventListener('trigger-pwa-install', handleTriggerInstall);

    // 6. Auto-show modal upon opening the site (similar to موقع الديوان) after a short delay
    const hasDismissed = sessionStorage.getItem('pwa_prompt_dismissed_session');
    if (!hasDismissed && !isStandalone) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1200);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
        window.removeEventListener('pwa-prompt-available', handleEarlyPromptAvailable);
        window.removeEventListener('appinstalled', handleAppInstalled);
        window.removeEventListener('trigger-pwa-install', handleTriggerInstall);
      };
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('pwa-prompt-available', handleEarlyPromptAvailable);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('trigger-pwa-install', handleTriggerInstall);
    };
  }, []);

  const handleDismiss = () => {
    setIsOpen(false);
    sessionStorage.setItem('pwa_prompt_dismissed_session', 'true');
  };

  // Primary install action triggered by clicking install button
  const triggerInstall = useCallback(async () => {
    const promptEvent = deferredPrompt || window.__deferredPWAInstallPrompt;

    // Case 1: Native PWA prompt available (Chrome / Android / Edge) -> Automatic 1-touch install
    if (promptEvent) {
      try {
        setIsInstalling(true);
        await promptEvent.prompt();
        const choice = await promptEvent.userChoice;
        if (choice.outcome === 'accepted') {
          // Keep dialog open with helpful feedback while Android installs the package
          setInstallAcceptedPending(true);
          setShowTroubleshootGuide(false);
        } else {
          setIsInstalling(false);
        }
        setDeferredPrompt(null);
        window.__deferredPWAInstallPrompt = null;
      } catch (err) {
        console.warn('Install prompt error:', err);
        setShowTroubleshootGuide(true);
        setIsOpen(true);
      } finally {
        setIsInstalling(false);
      }
      return;
    }

    // Case 2: iOS Safari -> Display iOS 1-step Guide
    if (isIOS) {
      setShowIOSGuide(true);
      setIsOpen(true);
      return;
    }

    // Case 3: Inside an iframe or prompt not available
    setIsOpen(true);
    setShowTroubleshootGuide(true);
  }, [deferredPrompt, isIOS]);

  // If already running as an installed standalone app, hide the prompt
  if (isInstalled) {
    return null;
  }

  return (
    <>
      {/* Toast Notification when successfully installed */}
      {installedSuccess && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-[#071A3D] text-white px-6 py-4 rounded-2xl shadow-2xl border-2 border-[#16958E] flex items-center gap-3 text-sm font-bold font-tajawal animate-bounce max-w-sm text-center">
          <div className="w-10 h-10 rounded-xl bg-[#16958E] flex items-center justify-center flex-shrink-0 shadow-lg">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-[#BCEBFF] text-xs font-bold">تم التثبيت بنجاح! 🎓</div>
            <div className="text-white text-xs">ستجد التطبيق الآن في قائمة تطبيقات هاتفك بشعار قبعة التخرج.</div>
          </div>
        </div>
      )}

      {/* Floating Quick Install Pill (visible when modal is closed) */}
      {!isOpen && (
        <button
          onClick={triggerInstall}
          className="fixed bottom-20 sm:bottom-6 left-4 z-40 flex items-center gap-2.5 px-4 py-2.5 min-h-[44px] rounded-full bg-[#071A3D] text-white hover:bg-[#16958E] border-2 border-[#16958E]/60 shadow-2xl shadow-[#071A3D]/40 transition-all hover:scale-105 active:scale-95 text-xs font-bold font-tajawal group cursor-pointer"
          title="تثبيت التطبيق على هاتفك بشعار قبعة التخرج"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#16958E] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#BCEBFF]"></span>
          </span>
          <div className="w-5 h-5 rounded-md bg-[#16958E] flex items-center justify-center group-hover:rotate-12 transition-transform">
            <GraduationCap className="w-3.5 h-3.5 text-white" />
          </div>
          <span>تثبيت التطبيق 📲</span>
        </button>
      )}

      {/* Modal Dialog (Educational Platform Style - موقع الديوان) */}
      <Modal
        isOpen={isOpen}
        onClose={handleDismiss}
        maxWidth="md"
        showHeader={false}
        bodyClassName="p-6 sm:p-7"
      >
        <div className="relative text-slate-800 dark:text-white text-right">
          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-0 left-0 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
            title="إغلاق"
            aria-label="إغلاق نافذة التثبيت"
          >
            <X className="w-5 h-5" />
          </button>

            {/* Header Content with Graduation Cap Logo */}
            <div className="text-center mt-2 mb-4">
              <div className="relative inline-block mb-3">
                <div className="w-20 h-20 rounded-2xl bg-[#071A3D] text-white flex items-center justify-center mx-auto shadow-xl shadow-[#16958E]/30 border-2 border-[#16958E]/50 p-2">
                  <img
                    src="/pwa-192x192.png"
                    alt="شعار قبعة التخرج"
                    className="w-full h-full object-contain rounded-xl"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-[#16958E] text-white p-1 rounded-full border-2 border-white dark:border-[#071A3D]">
                  <Sparkles className="w-3.5 h-3.5 text-[#BCEBFF]" />
                </div>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#16958E]/15 text-[#16958E] dark:text-[#BCEBFF] text-xs font-bold mb-2 border border-[#16958E]/30">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>تطبيق جامعي رسمي خفيف وسريع</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-extrabold font-tajawal text-[#071A3D] dark:text-white leading-snug">
                تثبيت تطبيق "دليلك الجامعي"
              </h3>
              <p className="text-xs text-slate-500 dark:text-[#BCEBFF]/90 mt-1 leading-relaxed max-w-sm mx-auto">
                يتحول الموقع مباشرة إلى تطبيق مثبت في هاتفك مع شعار قبعة التخرج في قائمة تطبيقاتك العادية!
              </p>
            </div>

            {/* In-Progress Notification Feedback after user confirms install */}
            {installAcceptedPending && (
              <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/40 rounded-2xl p-4 mb-4 text-right animate-fade-in">
                <div className="flex items-center gap-2.5 text-emerald-800 dark:text-emerald-300 font-bold text-xs mb-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></span>
                  <span>بدأت عملية التثبيت بنجاح في جهازك! 📲</span>
                </div>
                <p className="text-slate-600 dark:text-emerald-100/90 text-[11px] leading-relaxed mb-3">
                  يقوم نظام أندرويد حالياً بإضافة تطبيق دليلك الجامعي بشعار قبعة التخرج إلى قائمة تطبيقاتك.
                </p>
                <div className="bg-white/80 dark:bg-[#071A3D]/90 p-2.5 rounded-xl border border-emerald-500/30 text-[11px] text-slate-700 dark:text-slate-200">
                  <div className="font-bold text-[#16958E] dark:text-[#BCEBFF] mb-1">
                    ⚡ في حال تعليق إشعار Installing بسبب شبكة الهاتف:
                  </div>
                  <p className="leading-normal">
                    اضغط على قائمة المتصفح <strong>(⋮)</strong> ثم اختر <strong>"إضافة إلى الشاشة الرئيسية" (Add to Home screen)</strong> ليتم التثبيت فوراً وبدون أي انتظار!
                  </p>
                </div>
              </div>
            )}

            {/* Special alert if testing inside an iframe */}
            {isInIframe && (
              <div className="bg-[#BCEBFF]/25 dark:bg-[#0a2558]/70 rounded-2xl p-3.5 border border-[#16958E]/40 mb-4 text-xs text-right">
                <div className="flex items-center gap-2 font-bold text-[#16958E] dark:text-[#BCEBFF] mb-1">
                  <ExternalLink className="w-4 h-4 flex-shrink-0" />
                  <span>لتثبيت التطبيق على هاتفك مباشرة:</span>
                </div>
                <p className="text-slate-600 dark:text-slate-200 text-[11px] leading-relaxed mb-2">
                  نظراً لتصفحك من داخل نافذة العرض، اضغط على الزر بالأسفل لفتح الرابط مباشرة في متصفح هاتفك (Chrome) للتثبيت التلقائي فوراً!
                </p>
                <a
                  href={window.location.href}
                  target="_top"
                  className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#071A3D] text-white font-bold text-xs hover:bg-[#16958E] transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#BCEBFF]" />
                  <span>فتح الرابط المباشر للتثبيت الفوري</span>
                </a>
              </div>
            )}

            {/* iOS Safari Guide View */}
            {showIOSGuide ? (
              <div className="bg-[#BCEBFF]/15 dark:bg-[#0a2558]/50 rounded-2xl p-4 border border-[#16958E]/30 mb-5 space-y-3 text-right animate-fade-in">
                <div className="flex items-center justify-between text-xs font-bold text-[#16958E] dark:text-[#BCEBFF]">
                  <span className="flex items-center gap-1.5">
                    <Share2 className="w-4 h-4" />
                    <span>خطوات التثبيت على أجهزة iPhone / iPad (Safari):</span>
                  </span>
                  <button
                    onClick={() => setShowIOSGuide(false)}
                    className="text-xs underline text-slate-400 hover:text-white"
                  >
                    رجوع
                  </button>
                </div>

                <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#16958E] text-white flex items-center justify-center text-[11px] font-bold flex-shrink-0 mt-0.5">1</span>
                    <p>
                      اضغط على زر <strong>المشاركة (Share)</strong> <Share2 className="w-3.5 h-3.5 inline mx-1 text-[#16958E]" /> أسفل متصفح Safari.
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#16958E] text-white flex items-center justify-center text-[11px] font-bold flex-shrink-0 mt-0.5">2</span>
                    <p>
                      مرر لأسفل ثم اختر <strong>"إضافة إلى الصفحة الرئيسية"</strong> <PlusSquare className="w-3.5 h-3.5 inline mx-1 text-[#16958E]" /> (Add to Home Screen).
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#16958E] text-white flex items-center justify-center text-[11px] font-bold flex-shrink-0 mt-0.5">3</span>
                    <p>
                      اضغط <strong>"إضافة (Add)"</strong> وسيظهر التطبيق فوراً بشعار قبعة التخرج بين تطبيقاتك!
                    </p>
                  </div>
                </div>
              </div>
            ) : showTroubleshootGuide ? (
              /* Android Troubleshoot Guide (Fix "Installing..." hang) */
              <div className="bg-[#BCEBFF]/15 dark:bg-[#0a2558]/60 rounded-2xl p-4 border border-[#16958E]/40 mb-5 space-y-3 text-right animate-fade-in">
                <div className="flex items-center justify-between text-xs font-bold text-[#16958E] dark:text-[#BCEBFF]">
                  <span className="flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-amber-400" />
                    <span>حل مشكلة تعليق إشعار التثبيت (Installing...) في أندرويد:</span>
                  </span>
                  <button
                    onClick={() => setShowTroubleshootGuide(false)}
                    className="text-xs underline text-slate-400 hover:text-white"
                  >
                    إغلاق
                  </button>
                </div>

                <div className="space-y-3 text-xs text-slate-600 dark:text-slate-200">
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-2.5 text-[11px] leading-relaxed">
                    <strong>سبب التعليق:</strong> يحصل التعليق في بعض الأجهزة عند ضعف شبكة الإنترنت أو تأخر خدمات Google Play في بناء حزمة التطبيق.
                  </div>

                  <div className="space-y-2">
                    <div className="font-bold text-[#16958E] dark:text-[#BCEBFF] text-xs">
                      الحل الفوري 100% للتثبيت بدون أي تعليق:
                    </div>
                    <div className="flex items-start gap-2 text-[11px]">
                      <span className="w-5 h-5 rounded-full bg-[#16958E] text-white flex items-center justify-center font-bold flex-shrink-0 mt-0.5">1</span>
                      <p>
                        اضغط على <strong>زر النقاط الثلاث (⋮)</strong> في أعلى يسار متصفح Chrome.
                      </p>
                    </div>
                    <div className="flex items-start gap-2 text-[11px]">
                      <span className="w-5 h-5 rounded-full bg-[#16958E] text-white flex items-center justify-center font-bold flex-shrink-0 mt-0.5">2</span>
                      <p>
                        اختر <strong>"إضافة إلى الشاشة الرئيسية" (Add to Home screen)</strong> أو <strong>"تثبيت التطبيق"</strong>.
                      </p>
                    </div>
                    <div className="flex items-start gap-2 text-[11px]">
                      <span className="w-5 h-5 rounded-full bg-[#16958E] text-white flex items-center justify-center font-bold flex-shrink-0 mt-0.5">3</span>
                      <p>
                        اضغط <strong>"إضافة" (Add)</strong>، وسيظهر تطبيق <strong>دليلك الجامعي</strong> فوراً مع قبعة التخرج في شاشتك وقائمة التطبيقات!
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-[#16958E]/20 pt-2 text-[11px] text-slate-500 dark:text-slate-400">
                    💡 <strong>لإزالة الإشعار القديم المعلق:</strong> اسحب إشعار Chrome لليمين أو اليسار لإزالته، أو قم بإغلاق متصفح Chrome وإعادة فتحه.
                  </div>
                </div>
              </div>
            ) : (
              /* Features List */
              <div className="space-y-2.5 mb-5 text-right">
                <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-[#BCEBFF]/20 dark:bg-[#0a2558]/40 border border-[#BCEBFF]/50 dark:border-[#16958E]/20">
                  <div className="w-8 h-8 rounded-xl bg-[#16958E]/15 text-[#16958E] flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#071A3D] dark:text-white">يظهر مع شعار قبعة التخرج</h4>
                    <p className="text-[11px] text-slate-500 dark:text-[#BCEBFF]/80">يظهر في قائمة تطبيقات هاتفك وشاشتك الرئيسية مثل أي تطبيق أصلي.</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-[#BCEBFF]/20 dark:bg-[#0a2558]/40 border border-[#BCEBFF]/50 dark:border-[#16958E]/20">
                  <div className="w-8 h-8 rounded-xl bg-[#16958E]/15 text-[#16958E] flex items-center justify-center flex-shrink-0">
                    <WifiOff className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#071A3D] dark:text-white">يعمل بدون إنترنت</h4>
                    <p className="text-[11px] text-slate-500 dark:text-[#BCEBFF]/80">تصفح المقررات والجداول والمواد التعليمية في أي وقت ومن أي مكان.</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-[#BCEBFF]/20 dark:bg-[#0a2558]/40 border border-[#BCEBFF]/50 dark:border-[#16958E]/20">
                  <div className="w-8 h-8 rounded-xl bg-[#16958E]/15 text-[#16958E] flex items-center justify-center flex-shrink-0">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#071A3D] dark:text-white">سرعة فائقة وخفة تامة</h4>
                    <p className="text-[11px] text-slate-500 dark:text-[#BCEBFF]/80">يفتح بملء الشاشة وبدون شريط عنوان المتصفح، بدون استهلاك للذاكرة.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2.5">
              <button
                onClick={triggerInstall}
                disabled={isInstalling}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#16958E] via-[#127d77] to-[#071A3D] hover:from-[#127d77] hover:to-[#071A3D] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#16958E]/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 cursor-pointer"
              >
                {isInstalling ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>جاري التثبيت التلقائي...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 stroke-[2.5]" />
                    <span>تثبيت التطبيق الآن (Install) 🎓</span>
                  </>
                )}
              </button>

              {/* Troubleshooting / Fast Alternative Install Button */}
              {!showTroubleshootGuide && (
                <button
                  onClick={() => setShowTroubleshootGuide(true)}
                  className="w-full py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>هل علق الإشعار على Installing؟ اضغط هنا للحل الفوري ⚡</span>
                </button>
              )}

              <button
                onClick={handleDismiss}
                className="w-full py-2.5 px-4 rounded-2xl bg-[#BCEBFF]/30 hover:bg-[#BCEBFF]/60 dark:bg-white/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 font-bold text-xs transition-colors"
              >
                المتابعة عبر المتصفح (لاحقاً)
              </button>
            </div>

            {/* Footer Note */}
            <p className="text-center text-[10px] text-slate-400 mt-4">
              لا يشغل أي مساحة من الذاكرة • آمن وموثوق بنسبة 100%
            </p>
          </div>
      </Modal>
    </>
  );
};
