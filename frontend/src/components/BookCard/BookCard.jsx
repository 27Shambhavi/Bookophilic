import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, CheckCircle, Clock, BookOpenCheck, Star } from 'lucide-react';
import bookService from '../../services/bookService';

export default function BookCard({ book, onToggleLifeChanging }) {
  const [isLifeChanging, setIsLifeChanging] = useState(book.is_life_changing);

  useEffect(() => {
    setIsLifeChanging(book.is_life_changing);
  }, [book.is_life_changing]);

  const handleToggleLifeChanging = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const newStatus = !isLifeChanging;
    setIsLifeChanging(newStatus);
    try {
      await bookService.updateBook(book.id, { is_life_changing: newStatus });
      if (onToggleLifeChanging) {
        onToggleLifeChanging(book.id, newStatus);
      }
    } catch (err) {
      console.error("Failed to toggle life-changing status", err);
      setIsLifeChanging(book.is_life_changing);
    }
  };
  const getStatusBadge = (status) => {
    switch (status) {
      case 'reading':
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary-500/10 border border-primary-500/20 text-primary-400">
            <BookOpen className="w-3.5 h-3.5" /> Reading
          </span>
        );
      case 'completed':
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <CheckCircle className="w-3.5 h-3.5" /> Completed
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-500/10 border border-slate-500/20 text-slate-400">
            <Clock className="w-3.5 h-3.5" /> To Read
          </span>
        );
    }
  };

  const progressPercent = book.page_count > 0 
    ? Math.min(100, Math.round((book.current_page / book.page_count) * 100)) 
    : 0;

  // Placeholder cover generator
  const coverUrl = book.cover_image_url || `https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=200`;

  const getGenreClass = (genreName) => {
    if (!genreName) return 'genre-default';
    return `genre-${genreName.toLowerCase().replace(/\s+/g, '-')}`;
  };

  const genreName = book.genre?.name || '';
  const genreClass = getGenreClass(genreName);

  return (
    <div className={`glass-panel rounded-2xl p-5 flex flex-col justify-between genre-card ${genreClass}`}>
      <div>
        <div className="relative aspect-[3/4] rounded-xl overflow-hidden mb-4 shadow-lg group">
          <img 
            src={coverUrl} 
            alt={book.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-3 right-3">
            {getStatusBadge(book.status)}
          </div>
          <button 
            onClick={handleToggleLifeChanging}
            className="absolute top-3 left-3 p-1.5 rounded-full bg-slate-900/60 hover:bg-slate-900/80 border border-white/10 transition-all cursor-pointer group-hover:scale-110 active:scale-95 z-10"
            title="Toggle Life-Changing Status"
          >
            <Star 
              className={`w-4 h-4 transition-all ${
                isLifeChanging 
                  ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]' 
                  : 'text-slate-400 hover:text-white'
              }`} 
            />
          </button>
        </div>

        <h3 className="text-lg font-bold text-white line-clamp-1 mb-0.5" title={book.title}>
          {book.title}
        </h3>
        <p className="text-slate-400 text-sm font-medium mb-2">
          by {book.author}
        </p>

        {genreName && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            <span className="genre-badge px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase">
              {genreName}
            </span>
            {book.subcategory && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/5 border border-white/10 text-slate-300 capitalize">
                {book.subcategory}
              </span>
            )}
          </div>
        )}

        {book.page_count > 0 && (
          <div className="space-y-1.5 mb-5">
            <div className="flex justify-between text-xs font-semibold text-slate-400">
              <span>Progress</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary-500 to-teal-400 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              Page {book.current_page} of {book.page_count}
            </div>
          </div>
        )}
      </div>

      <Link 
        to={`/book/${book.id}`}
        className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-primary-500 hover:text-white border border-white/5 hover:border-primary-500 transition-all text-center text-sm font-semibold text-slate-300 block"
      >
        View Details
      </Link>
    </div>
  );
}
