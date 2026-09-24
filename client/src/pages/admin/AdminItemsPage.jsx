import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Flag, Trash2, Eye, ExternalLink, AlertTriangle } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmationModal from '../../components/common/ConfirmationModal';

export default function AdminItemsPage() {
  const { success, error } = useToast();

  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [suspiciousFilter, setSuspiciousFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  // Selected item for delete or flag
  const [selectedItem, setSelectedItem] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page,
        limit: 15,
      });
      if (search) params.set('search', search);
      if (typeFilter) params.set('type', typeFilter);
      if (suspiciousFilter) params.set('isSuspicious', suspiciousFilter);

      const res = await api.get(`/admin/items?${params.toString()}`);
      setItems(res.data.data.items || []);
      setPagination(res.data.data.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch (err) {
      console.error(err);
      error('Failed to load listings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [pagination.page, typeFilter, suspiciousFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchItems();
  };

  const handleToggleSuspicious = async (item) => {
    try {
      const res = await api.put(`/admin/items/${item._id}/flag`);
      const updated = res.data.data.item;
      setItems((prev) =>
        prev.map((i) => (i._id === updated._id ? { ...i, isSuspicious: updated.isSuspicious } : i))
      );
      success(`Item marked as ${updated.isSuspicious ? 'suspicious' : 'normal'}.`);
    } catch (err) {
      error('Failed to update listing flag.');
    }
  };

  const handleDeleteItem = async () => {
    if (!selectedItem) return;
    setActionLoading(true);
    try {
      await api.delete(`/admin/items/${selectedItem._id}`);
      setItems((prev) => prev.filter((i) => i._id !== selectedItem._id));
      success('Item removed by administration.');
      setDeleteModalOpen(false);
    } catch (err) {
      error('Failed to delete item.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      <div>
        <h2 className="text-2xl font-display font-extrabold text-slate-900 dark:text-slate-100">
          Listing Moderation
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review, flag, and remove inappropriate or duplicate campus listings.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, location, category..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-2 text-xs">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none"
          >
            <option value="">All Types</option>
            <option value="lost">Lost</option>
            <option value="found">Found</option>
          </select>

          <select
            value={suspiciousFilter}
            onChange={(e) => setSuspiciousFilter(e.target.value)}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none"
          >
            <option value="">All Listings</option>
            <option value="true">Flagged Suspicious</option>
          </select>
        </div>
      </div>

      {/* Items Table */}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-bold">
                <tr>
                  <th className="p-4">Item</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Campus Zone</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Reporter</th>
                  <th className="p-4">Flags</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {items.map((i) => (
                  <tr key={i._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0">
                          {i.images && i.images.length > 0 ? (
                            <img src={i.images[0].url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-sm">📦</div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <Link to={`/items/${i._id}`} className="font-bold text-slate-900 dark:text-slate-100 hover:text-brand-600 truncate block">
                            {i.title}
                          </Link>
                          <span className="text-[11px] text-slate-400">{i.category}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase ${
                          i.type === 'lost' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {i.type}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-300">{i.campusZone}</td>
                    <td className="p-4">
                      <span className="capitalize font-semibold text-slate-700 dark:text-slate-300">
                        {i.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-300">
                      {i.owner?.name || 'Anonymous'}
                    </td>
                    <td className="p-4">
                      {i.isSuspicious && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                          Suspicious
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/items/${i._id}`}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 transition"
                          title="View Listing"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleToggleSuspicious(i)}
                          className={`p-1.5 rounded-lg transition ${
                            i.isSuspicious ? 'text-amber-600 hover:bg-amber-50' : 'text-slate-400 hover:text-amber-600'
                          }`}
                          title="Flag / Unflag Suspicious"
                        >
                          <Flag className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedItem(i);
                            setDeleteModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 transition"
                          title="Remove Listing"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        title="Remove Inappropriate Listing"
        message={`Are you sure you want to remove "${selectedItem?.title}" from the platform? This action is recorded in the audit trail.`}
        confirmText="Remove Listing"
        danger={true}
        loading={actionLoading}
        onConfirm={handleDeleteItem}
        onClose={() => setDeleteModalOpen(false)}
      />
    </div>
  );
}
