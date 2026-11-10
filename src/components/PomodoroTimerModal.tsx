import React, { useState, useEffect, useRef } from 'react';
import { Timer, Play, Pause, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Modal } from './common/Modal';

interface PomodoroTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PomodoroTimerModal: React.FC<PomodoroTimerModalProps> = ({ isOpen, onClose }) => {
  const [secondsLeft, setSecondsLeft] = useState<number>(25 * 60);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [mode, setMode] = useState<'work' | 'break'>('work');

  // Wall-clock timestamp reference to completely eliminate drift from background tabs / device sleep
  const targetEndTimeRef = useRef<number | null>(null);

  useEffect(() => {
    let animFrameId: number | null = null;
    let intervalId: number | null = null;

    if (isActive) {
      if (!targetEndTimeRef.current) {
        targetEndTimeRef.current = Date.now() + secondsLeft * 1000;
      }

      const checkTime = () => {
        if (!targetEndTimeRef.current) return;
        const remaining = Math.max(0, Math.ceil((targetEndTimeRef.current - Date.now()) / 1000));
        setSecondsLeft(remaining);

        if (remaining === 0) {
          setIsActive(false);
          targetEndTimeRef.current = null;
          confetti({ particleCount: 70, spread: 80 });

          if (mode === 'work') {
            alert('أحسنت! انتهت جلسة التركيز 25 دقيقة. يمكنك أخذ استراحة 5 دقائق الآن ☕');
            setMode('break');
            setSecondsLeft(5 * 60);
          } else {
            alert('انتهت الاستراحة! حان وقت العودة لمذاكرة المحاضرات 💪');
            setMode('work');
            setSecondsLeft(25 * 60);
          }
        }
      };

      // Periodic check every 500ms for continuous accuracy
      intervalId = window.setInterval(checkTime, 500);

      // Visibility change listener to instantly correct displayed time when user returns to tab
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          checkTime();
        }
      };
      document.addEventListener('visibilitychange', handleVisibilityChange);

      return () => {
        if (intervalId) clearInterval(intervalId);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    } else {
      targetEndTimeRef.current = null;
    }
  }, [isActive, secondsLeft, mode]);

  const toggleTimer = () => {
    if (!isActive) {
      // Starting / Resuming: calculate exact target wall-clock timestamp
      targetEndTimeRef.current = Date.now() + secondsLeft * 1000;
      setIsActive(true);
    } else {
      // Pausing: capture remaining seconds and clear target timestamp
      if (targetEndTimeRef.current) {
        const remaining = Math.max(0, Math.ceil((targetEndTimeRef.current - Date.now()) / 1000));
        setSecondsLeft(remaining);
      }
      targetEndTimeRef.current = null;
      setIsActive(false);
    }
  };

  const resetTimer = () => {
    setIsActive(false);
    targetEndTimeRef.current = null;
    setSecondsLeft(mode === 'work' ? 25 * 60 : 5 * 60);
  };

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      title="مؤقت التركيز والدراسة (Pomodoro)"
      subtitle="تقنية بومودورو لتنظيم وقت المذاكرة والاستراحة بدقة زمنية مطلقة"
      icon={<Timer className="w-5 h-5 text-[#16958E]" />}
    >
      <div className="text-center space-y-6">
        {/* Mode Selector */}
        <div className="flex items-center justify-center gap-2 bg-[#BCEBFF]/20 dark:bg-[#071A3D]/60 border border-[#BCEBFF]/40 dark:border-[#16958E]/30 p-1.5 rounded-2xl">
          <button
            type="button"
            onClick={() => {
              setMode('work');
              setSecondsLeft(25 * 60);
              setIsActive(false);
              targetEndTimeRef.current = null;
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              mode === 'work' ? 'bg-[#071A3D] text-white shadow-sm' : 'text-[#071A3D] dark:text-slate-400'
            }`}
          >
            جلسة مذاكرة (25د)
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('break');
              setSecondsLeft(5 * 60);
              setIsActive(false);
              targetEndTimeRef.current = null;
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              mode === 'break' ? 'bg-[#071A3D] text-white shadow-sm' : 'text-[#071A3D] dark:text-slate-400'
            }`}
          >
            استراحة (5د)
          </button>
        </div>

        {/* Timer Circle */}
        <div className="relative w-52 h-52 sm:w-56 sm:h-56 mx-auto rounded-full bg-[#BCEBFF]/15 dark:bg-[#071A3D]/70 border-4 border-[#16958E]/40 flex items-center justify-center shadow-inner">
          <div>
            <span className="text-4xl sm:text-5xl font-black font-mono text-[#071A3D] dark:text-white block tracking-widest">{formattedTime}</span>
            <span className="text-xs font-bold text-[#16958E] dark:text-[#BCEBFF] mt-2 block">
              {mode === 'work' ? '⏱️ وقت المذاكرة والتركيز' : '☕ وقت الاستراحة والراحة'}
            </span>
          </div>
        </div>

        {/* Timer Controls */}
        <div className="flex items-center justify-center gap-4 pt-2">
          <button
            type="button"
            onClick={toggleTimer}
            className={`px-8 py-3.5 rounded-2xl font-bold text-sm text-white shadow-lg transition-all flex items-center gap-2 cursor-pointer ${
              isActive ? 'bg-[#16958E] hover:bg-[#127d77]' : 'bg-[#071A3D] hover:bg-[#16958E]'
            }`}
          >
            {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            <span>{isActive ? 'إيقاف مؤقت' : 'بدء التركيز'}</span>
          </button>

          <button
            type="button"
            onClick={resetTimer}
            className="p-3.5 rounded-2xl bg-[#BCEBFF]/30 hover:bg-[#BCEBFF]/60 text-[#071A3D] transition-all cursor-pointer"
            title="إعادة ضبط"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>
    </Modal>
  );
};
