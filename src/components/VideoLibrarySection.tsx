import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Video, Play, ArrowRight, Search, Clock, Film,
  Sparkles, X, Share2, Check, Eye
} from 'lucide-react';
import { VideoItem } from '../types';
import { FirebaseService } from '../services/firebase';
import { Modal } from './common/Modal';

interface VideoLibrarySectionProps {
  onBack: () => void;
}

export const VideoLibrarySection: React.FC<VideoLibrarySectionProps> = ({ onBack }) => {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    const unsubscribe = FirebaseService.subscribeVideos((data) => {
      // Filter visible videos for visitors (show unless explicitly hidden)
      setVideos(data.filter(v => v.visible !== false));
    });
    return () => unsubscribe();
  }, []);

  const filteredVideos = videos.filter(v =>
    v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleShare = (vid: VideoItem) => {
    if (navigator.share) {
      navigator.share({
        title: vid.title,
        text: vid.description,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Helper to extract clean embed URL for YouTube, Google Drive, Vimeo, or iframes
  const getEmbedUrl = (url: string): string | null => {
    if (!url) return null;
    const clean = url.trim();

    // YouTube Shorts: youtube.com/shorts/VIDEO_ID
    const shortsMatch = clean.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/);
    if (shortsMatch && shortsMatch[1]) {
      return `https://www.youtube.com/embed/${shortsMatch[1]}?autoplay=1`;
    }

    // YouTube Watch: youtube.com/watch?v=VIDEO_ID or youtu.be/VIDEO_ID
    const watchMatch = clean.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/);
    if (watchMatch && watchMatch[1]) {
      return `https://www.youtube.com/embed/${watchMatch[1]}?autoplay=1`;
    }

    // Google Drive: drive.google.com/file/d/FILE_ID/view... -> /preview
    const gdriveMatch = clean.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (gdriveMatch && gdriveMatch[1]) {
      return `https://drive.google.com/file/d/${gdriveMatch[1]}/preview`;
    }

    // Vimeo: vimeo.com/VIDEO_ID
    const vimeoMatch = clean.match(/vimeo\.com\/([0-9]+)/);
    if (vimeoMatch && vimeoMatch[1]) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
    }

    if (clean.includes('<iframe') && clean.includes('src=')) {
      const srcMatch = clean.match(/src=["'](.*?)["']/);
      if (srcMatch && srcMatch[1]) return srcMatch[1];
    }

    return null;
  };

  // Helper to render video element or iframe embed
  const renderVideoPlayer = (vid: VideoItem) => {
    const embedUrl = getEmbedUrl(vid.videoUrl);

    if (embedUrl) {
      return (
        <iframe
          src={embedUrl}
          title={vid.title}
          className="w-full h-80 sm:h-96 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg bg-black"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      );
    }

    return (
      <div className="space-y-2">
        <video
          controls
          autoPlay
          playsInline
          src={vid.videoUrl}
          poster={vid.thumbnailUrl}
          className="w-full max-h-96 rounded-2xl bg-black border border-slate-200 dark:border-slate-800 shadow-lg"
        >
          <source src={vid.videoUrl} type={vid.fileType || 'video/mp4'} />
          متصفحك لا يدعم تشغيل هذا الفيديو مباشرة.
        </video>
        {vid.videoUrl.startsWith('blob:') && (
          <p className="text-[11px] text-amber-500 bg-amber-500/10 p-2 rounded-lg text-center font-medium">
            تنبيه: هذا الفيديو تم اختياره محلياً من جهاز المشرف. لضمان تشغيله لدى كافة الطلاب بشكل دائم، يُنصح بإدخال رابط يوتيوب أو جوجل درايف عبر لوحة التحكم.
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 animate-fade-in" dir="rtl">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#BCEBFF]/40 dark:border-[#16958E]/30">
        <div>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 h-9 px-3.5 rounded-xl bg-[#BCEBFF]/30 hover:bg-[#BCEBFF]/60 text-[#071A3D] dark:text-[#BCEBFF] font-bold text-xs mb-3 transition-all"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة للرئيسية</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-black font-tajawal text-[#071A3D] dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#071A3D] to-[#16958E] text-white flex items-center justify-center shadow-lg shadow-[#071A3D]/25">
              <Video className="w-6 h-6 text-[#BCEBFF]" />
            </div>
            <span>المكتبة المرئية والفيديوهات الأكاديمية</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            شروحات مرئية، محاضرات مسجلة ومقاطع تعليمية تفاعلية
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="بحث في الفيديوهات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-4 py-2.5 rounded-2xl bg-white dark:bg-[#071A3D] border border-[#BCEBFF]/80 dark:border-[#16958E]/30 text-[#071A3D] dark:text-white text-xs focus:ring-2 focus:ring-[#16958E] outline-none shadow-sm"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
        </div>
      </div>

      {/* Videos Grid */}
      {filteredVideos.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-[#071A3D] rounded-3xl border border-[#BCEBFF]/80 dark:border-[#16958E]/30 p-8 shadow-sm">
          <Film className="w-12 h-12 text-[#16958E]/40 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-[#071A3D] dark:text-white font-tajawal">لا توجد فيديوهات منشورة حالياً</h3>
          <p className="text-xs text-slate-400 mt-1">سيتم رفع وتحديث الفيديوهات والشروحات قريباً</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((vid) => (
            <motion.div
              key={vid.id}
              whileHover={{ y: -4 }}
              onClick={() => setActiveVideo(vid)}
              className="bg-white dark:bg-[#071A3D] rounded-3xl border border-[#BCEBFF]/80 dark:border-[#16958E]/30 shadow-sm hover:border-[#16958E] transition-all cursor-pointer overflow-hidden flex flex-col group relative"
            >
              <div className="h-48 w-full bg-[#071A3D] relative overflow-hidden flex items-center justify-center">
                {vid.thumbnailUrl ? (
                  <img
                    src={vid.thumbnailUrl}
                    alt={vid.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#071A3D] to-[#16958E] flex items-center justify-center">
                    <Film className="w-12 h-12 text-[#BCEBFF]/40" />
                  </div>
                )}

                {/* Play Button Overlay */}
                <div className="absolute inset-0 bg-[#071A3D]/40 group-hover:bg-[#071A3D]/50 transition-colors flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-white/95 text-[#16958E] flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                    <Play className="w-6 h-6 fill-[#16958E] mr-1" />
                  </div>
                </div>

                {vid.duration && (
                  <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-[#071A3D]/85 text-white text-[11px] font-mono flex items-center gap-1 backdrop-blur-md">
                    <Clock className="w-3 h-3 text-[#BCEBFF]" />
                    {vid.duration}
                  </span>
                )}
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="text-base font-extrabold text-[#071A3D] dark:text-white group-hover:text-[#16958E] transition-colors font-tajawal line-clamp-2">
                    {vid.title}
                  </h3>
                  {vid.description && (
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {vid.description}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-[#BCEBFF]/40 dark:border-[#16958E]/20 flex items-center justify-between text-xs font-bold text-[#16958E]">
                  <span>مشاهدة الفيديو</span>
                  <Play className="w-4 h-4 fill-[#16958E]" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Video Modal Player */}
      {activeVideo && (
        <Modal
          isOpen={Boolean(activeVideo)}
          onClose={() => setActiveVideo(null)}
          maxWidth="4xl"
          title={activeVideo.title}
          subtitle={activeVideo.subject ? `المادة: ${activeVideo.subject}` : 'شرح مرئي مسجل'}
          icon={<Film className="w-5 h-5 text-[#16958E]" />}
          headerActions={
            <button
              onClick={() => handleShare(activeVideo)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-[#071A3D] dark:text-white transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              title="مشاركة الفيديو"
            >
              {copiedLink ? <Check className="w-4 h-4 text-[#16958E]" /> : <Share2 className="w-4 h-4" />}
              <span className="hidden sm:inline">{copiedLink ? 'تم النسخ!' : 'مشاركة'}</span>
            </button>
          }
          footer={
            <button
              onClick={() => setActiveVideo(null)}
              className="px-6 py-2.5 rounded-xl bg-[#071A3D] hover:bg-[#16958E] text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              إغلاق الفيديو
            </button>
          }
        >
          <div className="space-y-4">
            {renderVideoPlayer(activeVideo)}

            <div>
              <h2 className="text-xl font-extrabold font-tajawal text-[#071A3D] dark:text-white">
                {activeVideo.title}
              </h2>
              {activeVideo.description && (
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mt-2 leading-relaxed whitespace-pre-wrap bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200 dark:border-white/10">
                  {activeVideo.description}
                </p>
              )}
            </div>
          </div>
        </Modal>
      )}


    </div>
  );
};
