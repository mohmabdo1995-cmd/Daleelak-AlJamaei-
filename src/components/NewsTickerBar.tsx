import React, { useState, useEffect } from 'react';
import { Radio, ExternalLink, Pause, Play } from 'lucide-react';
import { TickerItem, ActivePage } from '../types';
import { FirebaseService, SiteConfig } from '../services/firebase';

interface NewsTickerBarProps {
  siteConfig: SiteConfig;
  onNavigate?: (page: ActivePage) => void;
}

export const NewsTickerBar: React.FC<NewsTickerBarProps> = ({ siteConfig, onNavigate }) => {
  const [tickerItems, setTickerItems] = useState<TickerItem[]>([]);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const unsubscribe = FirebaseService.subscribeTicker((items) => {
      // Filter visible items
      setTickerItems(items.filter((item) => item.visible !== false));
    });
    return () => unsubscribe();
  }, []);

  // Check if ticker is enabled in siteConfig
  const isVisible = siteConfig.sectionVisibility?.newsTicker !== false;
  if (!isVisible || tickerItems.length === 0) {
    return null;
  }

  // Increased Speed Configuration: Brisk, lively & responsive
  const speed = siteConfig.tickerSpeed || 'fast';
  let secondsPerItem = 3.2; // Fast by default
  if (speed === 'normal') secondsPerItem = 4.5;
  if (speed === 'slow') secondsPerItem = 6.8;

  // Total duration for one loop cycle
  const adjustedDuration = Math.max(10, Math.round(tickerItems.length * secondsPerItem));

  const handleItemClick = (item: TickerItem) => {
    if (!item.link) return;
    const link = item.link.trim();

    if (link.startsWith('http://') || link.startsWith('https://')) {
      window.open(link, '_blank', 'noopener,noreferrer');
      return;
    }

    if (onNavigate) {
      const validPages: ActivePage[] = ['landing', 'main', 'college', 'subjects', 'schedule', 'resources', 'articles', 'videos', 'gpa', 'pomodoro'];
      const targetPage = link.replace('/', '').replace('#', '') as ActivePage;
      if (validPages.includes(targetPage)) {
        onNavigate(targetPage);
      }
    }
  };

  const getBadgeStyle = (badge?: string) => {
    const b = (badge || '').trim();
    if (b.includes('عاجل')) return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
    if (b.includes('تنبيه') || b.includes('هام')) return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    if (b.includes('جديد')) return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    if (b.includes('إعلان')) return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
    return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
  };

  // Ensure enough items to create a continuous wide ribbon
  const baseItems = tickerItems.length > 0 ? tickerItems : [];
  const repeatedItems = baseItems.length < 4 ? [...baseItems, ...baseItems, ...baseItems] : baseItems;

  return (
    <div
      dir="rtl"
      className="sticky top-16 sm:top-20 z-30 w-full bg-[#071A3D] border-b border-[#16958E]/40 text-white shadow-sm overflow-hidden select-none"
      style={{
        background: 'linear-gradient(90deg, #051430 0%, #071A3D 50%, #0E2F5A 100%)'
      }}
    >
      <div className="max-w-7xl mx-auto flex items-stretch h-8 sm:h-8.5">
        
        {/* TV Channel Style Live Label Badge (Right side in RTL) */}
        <div className="flex-shrink-0 z-10 flex items-center gap-1.5 px-2.5 sm:px-3 bg-gradient-to-l from-[#16958E] to-[#0E2F5A] border-l border-[#BCEBFF]/20 shadow-md">
          {/* Pulsating Live Indicator */}
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
          </span>

          <Radio className="w-3 h-3 text-[#BCEBFF] hidden sm:inline" />
          
          <span className="text-[11px] sm:text-xs font-bold font-tajawal text-white tracking-wide whitespace-nowrap">
            {siteConfig.tickerTitle || 'شريط الأخبار'}
          </span>
        </div>

        {/* Scrolling Marquee Container */}
        <div
          className="relative flex-1 flex items-center overflow-hidden cursor-default group"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          {/* Subtle gradient fades on left & right edges */}
          <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-[#071A3D] to-transparent z-10 pointer-events-none"></div>
          <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-[#051430] to-transparent z-10 pointer-events-none"></div>

          {/* Continuous Infinite Seamless Loop Track */}
          <div
            className="animate-ticker flex items-center shrink-0"
            style={{
              animationPlayState: isPaused ? 'paused' : 'running',
              animationDuration: `${adjustedDuration}s`
            }}
          >
            {/* Track 1 */}
            <div className="flex items-center gap-6 shrink-0 pr-6">
              {repeatedItems.map((item, idx) => (
                <div
                  key={`t1-${item.id}-${idx}`}
                  onClick={() => handleItemClick(item)}
                  className={`flex items-center gap-2 px-1 py-0.5 rounded transition-colors ${
                    item.link ? 'cursor-pointer hover:bg-white/10 active:scale-98' : ''
                  }`}
                  title={item.link ? 'انقر للانتقال للرابط' : undefined}
                >
                  {/* Optional Badge */}
                  {item.badge && (
                    <span className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded-full border leading-none ${getBadgeStyle(item.badge)}`}>
                      {item.badge}
                    </span>
                  )}

                  {/* News Text */}
                  <span className="text-[11px] sm:text-xs font-medium text-slate-100 group-hover:text-white transition-colors">
                    {item.text}
                  </span>

                  {/* Link Indicator if present */}
                  {item.link && (
                    <ExternalLink className="w-2.5 h-2.5 text-[#38BDF8] opacity-75 inline" />
                  )}

                  {/* Separator symbol: ✦ */}
                  <span className="text-amber-400 font-extrabold text-xs sm:text-sm mr-2.5 drop-shadow-[0_0_5px_rgba(245,158,11,0.6)] select-none">
                    ✦
                  </span>
                </div>
              ))}
            </div>

            {/* Track 2 (Identical twin for 100% seamless infinite loop without stutter) */}
            <div className="flex items-center gap-6 shrink-0 pr-6" aria-hidden="true">
              {repeatedItems.map((item, idx) => (
                <div
                  key={`t2-${item.id}-${idx}`}
                  onClick={() => handleItemClick(item)}
                  className={`flex items-center gap-2 px-1 py-0.5 rounded transition-colors ${
                    item.link ? 'cursor-pointer hover:bg-white/10 active:scale-98' : ''
                  }`}
                  title={item.link ? 'انقر للانتقال للرابط' : undefined}
                >
                  {/* Optional Badge */}
                  {item.badge && (
                    <span className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded-full border leading-none ${getBadgeStyle(item.badge)}`}>
                      {item.badge}
                    </span>
                  )}

                  {/* News Text */}
                  <span className="text-[11px] sm:text-xs font-medium text-slate-100 group-hover:text-white transition-colors">
                    {item.text}
                  </span>

                  {/* Link Indicator if present */}
                  {item.link && (
                    <ExternalLink className="w-2.5 h-2.5 text-[#38BDF8] opacity-75 inline" />
                  )}

                  {/* Separator symbol: ✦ */}
                  <span className="text-amber-400 font-extrabold text-xs sm:text-sm mr-2.5 drop-shadow-[0_0_5px_rgba(245,158,11,0.6)] select-none">
                    ✦
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Optional Pause/Play status toggle button */}
        <div className="flex-shrink-0 z-10 hidden md:flex items-center px-1.5 bg-[#071A3D]/80 border-r border-white/5">
          <button
            onClick={() => setIsPaused(!isPaused)}
            title={isPaused ? 'استئناف الحركة' : 'إيقاف الحركة مؤقتاً'}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            {isPaused ? <Play className="w-3 h-3 text-emerald-400" /> : <Pause className="w-3 h-3" />}
          </button>
        </div>

      </div>
    </div>
  );
};
