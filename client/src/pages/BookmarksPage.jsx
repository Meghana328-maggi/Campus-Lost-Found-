import React, { useState, useEffect } from 'react';
import { Bookmark } from 'lucide-react';
import api from '../services/api';
import ItemCard from '../components/items/ItemCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';

export default function BookmarksPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookmarks = async () => {
    try {
      const res = await api.get('/bookmarks');
      setItems(res.data.data.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const handleBookmarkToggle = (itemId, newState) => {
    if (!newState) {
      setItems((prev) => prev.filter((item) => item._id !== itemId));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      <div>
        <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-3">
          <span className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
            <Bookmark className="w-6 h-6" />
          </span>
          <span>My Saved Items</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Keep track of items you are monitoring or waiting to claim.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((item) => (
            <ItemCard
              key={item._id}
              item={item}
              initialBookmarked={true}
              onBookmarkToggle={handleBookmarkToggle}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Bookmark}
          title="No saved items yet"
          description="Bookmark lost or found listings while browsing to easily access them later."
          actionText="Browse Items"
          actionLink="/lost"
        />
      )}
    </div>
  );
}
