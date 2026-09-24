import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Bookmark, Eye, AlertCircle, ShieldCheck } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function ItemCard({ item, onBookmarkToggle, initialBookmarked = false }) {
  const { isAuthenticated } = useAuth();
  const { success, error } = useToast();
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  if (!item) return null;

  const isLost = item.type === 'lost';
  const imageUrl = item.images && item.images.length > 0 ? item.images[0].url : null;

  const handleBookmark = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      error('Please log in to save items to your bookmarks.');
      return;
    }

    setBookmarkLoading(true);
    try {
      const res = await api.post('/bookmarks/toggle', { itemId: item._id });
      const newState = res.data.data.isBookmarked;
      setIsBookmarked(newState);
      success(newState ? 'Item saved to bookmarks!' : 'Item removed from bookmarks.');
      if (onBookmarkToggle) onBookmarkToggle(item._id, newState);
    } catch (err) {
      error('Failed to update bookmark.');
    } finally {
      setBookmarkLoading(false);
    }
  };

  const formattedDate = new Date(item.dateLostOrFound || item.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="group relative flex flex-col bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      {/* Image container */}
      <div className="relative aspect-[4/3] w-full bg-slate-100 dark:bg-slate-800/60 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 p-4">
            <span className="text-4xl mb-1">📦</span>
            <span className="text-xs font-medium">No photo provided</span>
          </div>
        )}

        {/* Status badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 items-center">
          <span
            className={`px-2.5 py-1 text-xs font-bold rounded-lg uppercase tracking-wide shadow-sm ${
              isLost
                ? 'bg-rose-600 text-white'
                : 'bg-emerald-600 text-white'
            }`}
          >
            {item.type}
          </span>
          {item.isUrgent && (
            <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-lg bg-amber-500 text-white shadow-sm animate-pulse">
              <AlertCircle className="w-3 h-3" /> Urgent
            </span>
          )}
          {item.status === 'recovered' && (
            <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-lg bg-blue-600 text-white shadow-sm">
              <ShieldCheck className="w-3 h-3" /> Recovered
            </span>
          )}
        </div>

        {/* Bookmark heart button */}
        <button
          onClick={handleBookmark}
          disabled={bookmarkLoading}
          aria-label="Save item"
          className="absolute top-3 right-3 p-2 rounded-xl bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 hover:text-rose-500 dark:hover:text-rose-400 shadow-md backdrop-blur-sm transition"
        >
          <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>

        {/* View counter overlay */}
        <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-[11px] font-medium text-white flex items-center gap-1">
          <Eye className="w-3 h-3" />
          <span>{item.viewCount || 0}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider mb-1">
            {item.category}
          </div>
          <Link to={`/items/${item._id}`}>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-1">
              {item.title}
            </h3>
          </Link>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Metadata footer */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-col gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="truncate">{item.campusZone || item.location}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span>{formattedDate}</span>
            </div>
            <Link
              to={`/items/${item._id}`}
              className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
            >
              View Details →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
