import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, AlertTriangle, ArrowRight, Eye, EyeOff, KeyRound, X } from 'lucide-react';
import { AdminAuthService } from '../../services/adminAuth';
import { Modal } from '../common/Modal';

interface AdminLoginModalProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ onSuccess, onCancel }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [lockoutTimer, setLockoutTimer] = useState(0);

  useEffect(() => {
    const status = AdminAuthService.getLockoutStatus();
    setIsLockedOut(status.isLockedOut);
    setLockoutTimer(status.secondsLeft);

    let interval: any = null;
    if (status.isLockedOut && status.secondsLeft > 0) {
      interval = setInterval(() => {
        setLockoutTimer(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsLockedOut(false);
            setErrorMsg(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const result = await AdminAuthService.login(password);
      if (result.success) {
        setErrorMsg(null);
        onSuccess();
      } else {
        setErrorMsg(result.error || 'خطأ في كلمة المرور');
        if (result.lockoutSeconds && result.lockoutSeconds > 0) {
          setIsLockedOut(true);
          setLockoutTimer(result.lockoutSeconds);
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onCancel}
      maxWidth="md"
      showHeader={false}
      bodyClassName="p-6 sm:p-8"
    >
      <div className="relative text-right">
        {/* Close Button top-left */}
        <button
          type="button"
          onClick={onCancel}
          className="absolute top-0 left-0 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-500 dark:text-white flex items-center justify-center transition-colors cursor-pointer"
          aria-label="إغلاق"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center mb-6 pt-2">
          <div className="w-14 h-14 rounded-2xl bg-[#16958E]/15 text-[#16958E] flex items-center justify-center mx-auto mb-3 shadow-md border border-[#16958E]/30">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold font-tajawal text-[#071A3D] dark:text-white">
            تسجيل الدخول للوحة التحكم
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            أدخل كلمة المرور الخاصة بالمسؤول للوصول إلى إدارة المحتوى
          </p>
        </div>

        {/* Lockout Warning */}
        {isLockedOut && (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs mb-5 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div>
              <span className="font-bold block mb-0.5">تم القفل المؤقت لحماية النظام</span>
              <span>يرجى الانتظار {lockoutTimer} ثانية حتى تتمكن من محاولة الدخول مجدداً.</span>
            </div>
          </div>
        )}

        {/* Error Message */}
        {errorMsg && !isLockedOut && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs mb-5 font-bold flex items-center gap-2">
            <Lock className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#071A3D] dark:text-slate-300 mb-1.5">
              كلمة المرور:
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                disabled={isLockedOut}
                placeholder="أدخل كلمة المرور"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-[#16958E]/30 text-[#071A3D] dark:text-white text-sm focus:ring-2 focus:ring-[#16958E] outline-none transition-all disabled:opacity-50"
              />
              <KeyRound className="w-5 h-5 text-slate-400 absolute right-3 top-3.5" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                title={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-[#071A3D] dark:text-white font-bold text-xs transition-all cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isLockedOut || !password || isSubmitting}
              className="flex-1 py-3 rounded-2xl bg-[#071A3D] hover:bg-[#16958E] text-white font-bold text-xs shadow-lg shadow-[#071A3D]/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{isSubmitting ? 'جاري التحقق...' : 'دخول اللوحة'}</span>
              <ArrowRight className="w-4 h-4 rotate-180" />
            </button>
          </div>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/10 text-center text-[11px] text-slate-400">
          محمية بواسطة Firebase Authentication & Rate Limiting
        </div>
      </div>
    </Modal>
  );
};
