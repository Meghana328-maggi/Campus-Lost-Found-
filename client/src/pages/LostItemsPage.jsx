import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, PlusCircle, AlertCircle, X, Check, Filter } from 'lucide-react';
import api from '../services/api';
import ItemCard from '../components/items/ItemCard';
import ItemFilters from '../components/items/ItemFilters';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';

export default function LostItemsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [campusZones, setCampusZones] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  // Read filter query params
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || 'All';
  const campusZone = searchParams.get('campusZone') || 'All';
  const isUrgent = searchParams.get('isUrgent') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = parseInt(searchParams.get('page') || '1', 10);

  // Controlled input for search to allow typing then submitting or pressing enter
  const [searchTerm, setSearchTerm] = useState(search);

  useEffect(() => {
    setSearchTerm(search);
  }, [search]);

  // Load categories & campus zones
  useEffect(() => {
    Promise.all([api.get('/admin/categories'), api.get('/admin/locations')])
      .then(([catRes, locRes]) => {
        setCategories(catRes.data.data.categories || []);
        const zones = Array.from(new Set((locRes.data.data.locations || []).map((l) => l.zone)));
        setCampusZones(zones);
      })
      .catch((err) => console.error(err));
  }, []);

  // Fetch items
  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          type: 'lost',
          page,
          limit: 12,
          sort,
        });

        if (search) queryParams.set('search', search);
        if (category && category !== 'All') queryParams.set('category', category);
        if (campusZone && campusZone !== 'All') queryParams.set('campusZone', campusZone);
        if (isUrgent === 'true') queryParams.set('isUrgent', 'true');

        const res = await api.get(`/items?${queryParams.toString()}`);
        setItems(res.data.data.items || []);
        setPagination(res.data.data.pagination || { currentPage: 1, totalPages: 1, total: 0 });
      } catch (err) {
        console.error('[Lost Items Error]:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [search, category, campusZone, isUrgent, sort, page]);

  const handleFilterChange = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value && value !== 'All') {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleFilterChange('search', searchTerm.trim());
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSearchParams({ page: '1' });
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Directory Switcher & Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 w-fit mb-3">
            <span className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-rose-600 text-white shadow-xs">
              Lost Items ({pagination.total || 0})
            </span>
            <Link
              to={`/found${search ? `?search=${encodeURIComponent(search)}` : ''}`}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition flex items-center gap-1"
            >
              <span>Found Items Directory</span>
              <span>→</span>
            </Link>
          </div>

          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-3">
            <span className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
              <AlertCircle className="w-6 h-6" />
            </span>
            <span>Lost Items Directory</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Search missing items reported by students, staff, and faculty across campus.
          </p>
        </div>

        <Link
          to="/report-lost"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-sm transition self-start md:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Report Lost Item</span>
        </Link>
      </div>

      {/* Search Input Bar with Submit & Clear Button */}
      <form onSubmit={handleSearchSubmit} className="relative flex items-center">
        <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by item name, brand, description, tags, or campus location..."
          className="w-full pl-12 pr-28 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm shadow-sm focus:ring-2 focus:ring-brand-500 outline-none transition"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              handleFilterChange('search', '');
            }}
            className="absolute right-24 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
            title="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <button
          type="submit"
          className="absolute right-2.5 px-4 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-xs transition"
        >
          Search
        </button>
      </form>

      {/* Category Quick-Navigation Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => handleFilterChange('category', 'All')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            category === 'All'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-800 hover:border-brand-500'
          }`}
        >
          All Categories
        </button>
        {categories.map((cat) => (
          <button
            key={cat._id || cat.name}
            onClick={() => handleFilterChange('category', cat.name)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              category === cat.name
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-800 hover:border-rose-400'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Active Search & Filter Tags */}
      {(search || category !== 'All' || campusZone !== 'All' || isUrgent) && (
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
          <span className="text-slate-400">Active filters:</span>
          {search && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
              <span>Query: "{search}"</span>
              <button onClick={() => { setSearchTerm(''); handleFilterChange('search', ''); }}>
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}
          {category !== 'All' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <span>Category: {category}</span>
              <button onClick={() => handleFilterChange('category', 'All')}>
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}
          {campusZone !== 'All' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <span>Zone: {campusZone}</span>
              <button onClick={() => handleFilterChange('campusZone', 'All')}>
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}
          {isUrgent && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
              <span>⚡ Urgent Only</span>
              <button onClick={() => handleFilterChange('isUrgent', '')}>
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}
          <button
            onClick={handleResetFilters}
            className="text-xs text-rose-600 dark:text-rose-400 hover:underline font-bold ml-1"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Advanced Filters Drawer */}
      <ItemFilters
        filters={{ category, campusZone, isUrgent, sort }}
        onChange={handleFilterChange}
        onReset={handleResetFilters}
        categories={categories}
        campusZones={campusZones}
      />

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs font-semibold text-slate-500 pt-1">
        <span>Found {pagination.total || 0} missing item(s)</span>
        <span>Page {page} of {pagination.totalPages || 1}</span>
      </div>

      {/* Items Grid */}
      {loading ? (
        <LoadingSpinner />
      ) : items.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {items.map((item) => (
              <ItemCard key={item._id} item={item} />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-8">
              <button
                disabled={page <= 1}
                onClick={() => handleFilterChange('page', String(page - 1))}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Previous
              </button>
              <span className="text-xs font-semibold px-4 text-slate-600 dark:text-slate-400">
                Page {page} of {pagination.totalPages}
              </span>
              <button
                disabled={page >= pagination.totalPages}
                onClick={() => handleFilterChange('page', String(page + 1))}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <EmptyState
          title="No lost items found"
          description="Try broadening your search keywords or clearing applied filters."
          actionText="Clear Filters"
          onAction={handleResetFilters}
        />
      )}
    </div>
  );
}
