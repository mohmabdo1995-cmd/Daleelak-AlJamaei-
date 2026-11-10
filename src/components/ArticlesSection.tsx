import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileText, ArrowRight, Search, Calendar, User, Tag, Eye,
  BookOpen, Sparkles, X, Share2, Check, Clock
} from 'lucide-react';
import { ArticleItem } from '../types';
import { FirebaseService } from '../services/firebase';
import { Modal } from './common/Modal';

interface ArticlesSectionProps {
  onBack: () => void;
}

export const ArticlesSection: React.FC<ArticlesSectionProps> = ({ onBack }) => {
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeArticle, setActiveArticle] = useState<ArticleItem | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    const unsubscribe = FirebaseService.subscribeArticles((data) => {
      // Filter published articles for public view (show unless explicitly marked as draft)
      setArticles(data.filter(a => a.status !== 'draft'));
    });
    return () => unsubscribe();
  }, []);

  const categories = Array.from(
    new Set(articles.map(a => a.category).filter(Boolean) as string[])
  );

  const filteredArticles = articles.filter(art => {
    const matchesSearch =
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (art.subtitle && art.subtitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
      art.content.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCat =
      selectedCategory === 'all' || art.category === selectedCategory;

    return matchesSearch && matchesCat;
  });

  const handleShare = (art: ArticleItem) => {
    if (navigator.share) {
      navigator.share({
        title: art.title,
        text: art.subtitle || art.title,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Simple rich text formatting renderer (Markdown-like parser)
  const renderFormattedText = (text: string) => {
    if (!text) return null;
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={idx} className="h-3" />;

      if (trimmed.startsWith('### ')) {
        return <h3 key={idx} className="text-lg font-bold text-[#071A3D] dark:text-white my-3 font-tajawal">{trimmed.replace('### ', '')}</h3>;
      }
      if (trimmed.startsWith('## ')) {
        return <h2 key={idx} className="text-xl font-extrabold text-[#16958E] dark:text-[#BCEBFF] my-4 font-tajawal">{trimmed.replace('## ', '')}</h2>;
      }
      if (trimmed.startsWith('# ')) {
        return <h1 key={idx} className="text-2xl font-black text-[#071A3D] dark:text-white my-4 font-tajawal">{trimmed.replace('# ', '')}</h1>;
      }
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        return (
          <li key={idx} className="mr-6 my-1 list-disc text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
            {trimmed.substring(2)}
          </li>
        );
      }
      if (/^\d+\.\s/.test(trimmed)) {
        return (
          <li key={idx} className="mr-6 my-1 list-decimal text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
            {trimmed.replace(/^\d+\.\s/, '')}
          </li>
        );
      }
      if (trimmed.startsWith('> ')) {
        return (
          <blockquote key={idx} className="border-r-4 border-[#16958E] pr-4 my-3 py-2 bg-[#BCEBFF]/15 dark:bg-[#071A3D]/50 rounded-l-xl text-[#071A3D] dark:text-slate-200 italic text-sm">
            {trimmed.replace('> ', '')}
          </blockquote>
        );
      }
      if (trimmed.startsWith('![') && trimmed.includes('](')) {
        const altMatch = trimmed.match(/!\[(.*?)\]/);
        const urlMatch = trimmed.match(/\((.*?)\)/);
        if (urlMatch && urlMatch[1]) {
          return (
            <div key={idx} className="my-4">
              <img src={urlMatch[1]} alt={altMatch ? altMatch[1] : ''} className="w-full max-h-96 object-cover rounded-2xl shadow-md border border-[#BCEBFF]/60" />
            </div>
          );
        }
      }

      return (
        <p key={idx} className="text-slate-700 dark:text-slate-300 my-2 leading-relaxed text-sm sm:text-base font-normal">
          {trimmed}
        </p>
      );
    });
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
              <FileText className="w-6 h-6 text-[#BCEBFF]" />
            </div>
            <span>المقالات والأبحاث الأكاديمية</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            اقرأ أحدث المقالات والنصائح والإرشادات الأكاديمية المصممة لتعزيز تحصيلك العلمي
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="بحث في المقالات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-4 py-2.5 rounded-2xl bg-white dark:bg-[#071A3D] border border-[#BCEBFF]/80 dark:border-[#16958E]/30 text-[#071A3D] dark:text-white text-xs focus:ring-2 focus:ring-[#16958E] outline-none shadow-sm"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
        </div>
      </div>

      {/* Categories Bar */}
      {categories.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`h-9 px-4 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center ${
              selectedCategory === 'all'
                ? 'bg-[#071A3D] text-white shadow-md'
                : 'bg-white dark:bg-[#071A3D] text-[#071A3D] dark:text-slate-300 border border-[#BCEBFF]/80 dark:border-[#16958E]/30 hover:bg-[#BCEBFF]/20'
            }`}
          >
            الكل ({articles.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`h-9 px-4 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center ${
                selectedCategory === cat
                  ? 'bg-[#071A3D] text-white shadow-md'
                  : 'bg-white dark:bg-[#071A3D] text-[#071A3D] dark:text-slate-300 border border-[#BCEBFF]/80 dark:border-[#16958E]/30 hover:bg-[#BCEBFF]/20'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Articles Grid */}
      {filteredArticles.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-[#071A3D] rounded-3xl border border-[#BCEBFF]/80 dark:border-[#16958E]/30 p-8 shadow-sm">
          <BookOpen className="w-12 h-12 text-[#16958E]/40 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-[#071A3D] dark:text-white font-tajawal">لا توجد مقالات منشورة حالياً</h3>
          <p className="text-xs text-slate-400 mt-1">سيقوم فريق الكلية بنشر مقالات وأبحاث جديدة قريباً</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((art) => (
            <motion.div
              key={art.id}
              whileHover={{ y: -4 }}
              onClick={() => setActiveArticle(art)}
              className="bg-white dark:bg-[#071A3D] rounded-3xl border border-[#BCEBFF]/80 dark:border-[#16958E]/30 shadow-sm hover:border-[#16958E] transition-all cursor-pointer overflow-hidden flex flex-col group relative"
            >
              {art.coverImage ? (
                <div className="h-48 w-full overflow-hidden relative">
                  <img
                    src={art.coverImage}
                    alt={art.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {art.category && (
                    <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-[#071A3D]/90 text-white text-[11px] font-bold backdrop-blur-md shadow">
                      {art.category}
                    </span>
                  )}
                </div>
              ) : (
                <div className="h-32 w-full bg-gradient-to-br from-[#071A3D] to-[#16958E] flex items-center justify-center text-white relative">
                  <FileText className="w-12 h-12 text-[#BCEBFF] opacity-60" />
                  {art.category && (
                    <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-[#071A3D]/70 text-[#BCEBFF] text-[11px] font-bold backdrop-blur-md">
                      {art.category}
                    </span>
                  )}
                </div>
              )}

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 mb-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#16958E]" />
                      {new Date(art.createdAt).toLocaleDateString('ar-EG')}
                    </span>
                    {art.author && (
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-[#16958E]" />
                        {art.author}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-extrabold text-[#071A3D] dark:text-white group-hover:text-[#16958E] transition-colors font-tajawal line-clamp-2">
                    {art.title}
                  </h3>

                  {art.subtitle && (
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {art.subtitle}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-[#BCEBFF]/40 dark:border-[#16958E]/20 flex items-center justify-between text-xs font-bold text-[#16958E]">
                  <span>قراءة المقال كاملاً</span>
                  <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform text-[#16958E]" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Article Detail View Modal */}
      {activeArticle && (
        <Modal
          isOpen={Boolean(activeArticle)}
          onClose={() => setActiveArticle(null)}
          maxWidth="3xl"
          title={activeArticle.title}
          subtitle={`${activeArticle.category || 'مقال أكاديمي'} • ${new Date(activeArticle.createdAt).toLocaleDateString('ar-EG')}`}
          icon={<BookOpen className="w-5 h-5 text-[#16958E]" />}
          headerActions={
            <button
              onClick={() => handleShare(activeArticle)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-[#071A3D] dark:text-white transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              title="مشاركة المقال"
            >
              {copiedLink ? <Check className="w-4 h-4 text-[#16958E]" /> : <Share2 className="w-4 h-4" />}
              <span className="hidden sm:inline">{copiedLink ? 'تم النسخ!' : 'مشاركة'}</span>
            </button>
          }
          footer={
            <button
              onClick={() => setActiveArticle(null)}
              className="px-6 py-2.5 rounded-xl bg-[#071A3D] hover:bg-[#16958E] text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              إغلاق المقال
            </button>
          }
        >
          <div className="space-y-6">
            {activeArticle.coverImage && (
              <img
                src={activeArticle.coverImage}
                alt={activeArticle.title}
                className="w-full max-h-80 object-cover rounded-2xl shadow border border-slate-200 dark:border-white/10"
              />
            )}

            <div>
              <h1 className="text-2xl sm:text-3xl font-black font-tajawal text-[#071A3D] dark:text-white leading-snug">
                {activeArticle.title}
              </h1>
              {activeArticle.subtitle && (
                <p className="text-sm sm:text-base text-slate-500 mt-2 font-medium">
                  {activeArticle.subtitle}
                </p>
              )}

              {activeArticle.author && (
                <div className="mt-3 flex items-center gap-2 text-xs font-bold text-[#16958E]">
                  <User className="w-4 h-4" />
                  <span>بقلم: {activeArticle.author}</span>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-white/10 font-cairo">
              {renderFormattedText(activeArticle.content)}
            </div>
          </div>
        </Modal>
      )}


    </div>
  );
};
