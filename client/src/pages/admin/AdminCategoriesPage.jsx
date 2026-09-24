import React, { useState, useEffect } from 'react';
import { FolderTree, Plus, Trash2, Tag } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function AdminCategoriesPage() {
  const { success, error } = useToast();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [subcategories, setSubcategories] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/admin/categories');
      setCategories(res.data.data.categories || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      const subs = subcategories.split(',').map((s) => s.trim()).filter(Boolean);
      const res = await api.post('/admin/categories', {
        name: name.trim(),
        subcategories: subs,
      });

      setCategories((prev) => [...prev, res.data.data.category]);
      setName('');
      setSubcategories('');
      success('Category created successfully!');
    } catch (err) {
      error('Failed to create category.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/categories/${id}`);
      setCategories((prev) => prev.filter((c) => c._id !== id));
      success('Category deleted.');
    } catch (err) {
      error('Failed to delete category.');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16 max-w-4xl">
      <div>
        <h2 className="text-2xl font-display font-extrabold text-slate-900 dark:text-slate-100">
          Category Management
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Configure campus item taxonomy, subcategories, and icons.
        </p>
      </div>

      {/* Add Category Form */}
      <form
        onSubmit={handleCreate}
        className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4"
      >
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
          Add New Category
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Category Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Lab Equipment & Instruments"
              className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Subcategories (comma separated)
            </label>
            <input
              type="text"
              value={subcategories}
              onChange={(e) => setSubcategories(e.target.value)}
              placeholder="e.g. Oscilloscopes, Multimeters, Soldering Kits"
              className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:bg-brand-400 text-white font-bold text-xs shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
        </div>
      </form>

      {/* Categories List */}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {categories.map((c) => (
            <div
              key={c._id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col justify-between space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{c.name}</h4>
                  <span className="text-[11px] text-slate-400">{c.subcategories?.length || 0} subcategories</span>
                </div>
                <button
                  onClick={() => handleDelete(c._id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 transition"
                  title="Delete category"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {c.subcategories && c.subcategories.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                  {c.subcategories.map((sc, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-600 dark:text-slate-300"
                    >
                      {sc}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
