import React, { useState } from 'react';
import { Filter, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';

export default function ItemFilters({
  filters,
  onChange,
  onReset,
  categories = [],
  campusZones = [],
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  // Active filter count indicator
  const activeCount = [
    filters.category && filters.category !== 'All',
    filters.campusZone && filters.campusZone !== 'All',
    filters.sort && filters.sort !== 'newest',
    filters.isUrgent === true || filters.isUrgent === 'true',
  ].filter(Boolean).length;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-sm">
      <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100 text-sm">
          <Filter className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          <span>Filters & Sort</span>
          {activeCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400 text-xs font-bold">
              {activeCount} active
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="sm:hidden flex items-center gap-1 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300"
          >
            <span>{mobileOpen ? 'Hide' : 'Filter Options'}</span>
            {mobileOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      <div className={`${mobileOpen ? 'grid' : 'hidden sm:grid'} grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 animate-fade-in`}>
        {/* Category */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Category
          </label>
          <select
            value={filters.category || 'All'}
            onChange={(e) => onChange('category', e.target.value)}
            className="w-full text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 p-2.5 focus:ring-2 focus:ring-brand-500 outline-none transition"
          >
            <option value="All">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id || cat.name} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Campus Zone */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Campus Zone
          </label>
          <select
            value={filters.campusZone || 'All'}
            onChange={(e) => onChange('campusZone', e.target.value)}
            className="w-full text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 p-2.5 focus:ring-2 focus:ring-brand-500 outline-none transition"
          >
            <option value="All">All Campus Zones</option>
            {campusZones.map((zone) => (
              <option key={zone} value={zone}>
                {zone}
              </option>
            ))}
          </select>
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Sort By
          </label>
          <select
            value={filters.sort || 'newest'}
            onChange={(e) => onChange('sort', e.target.value)}
            className="w-full text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 p-2.5 focus:ring-2 focus:ring-brand-500 outline-none transition"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="views">Most Viewed</option>
            <option value="date_desc">Incident Date (Recent)</option>
          </select>
        </div>

        {/* Status / Urgent */}
        <div className="flex flex-col justify-end gap-2 pb-1">
          <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={filters.isUrgent === true || filters.isUrgent === 'true'}
              onChange={(e) => onChange('isUrgent', e.target.checked)}
              className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
            />
            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold text-xs">
              ⚡ Urgent items only
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
