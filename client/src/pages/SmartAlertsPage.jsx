import React, { useState, useEffect } from 'react';
import { Radio, Plus, Trash2, Bell, CheckCircle2, PauseCircle } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';

export default function SmartAlertsPage() {
  const { success, error } = useToast();

  const [alerts, setAlerts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [campusZones, setCampusZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form
  const [category, setCategory] = useState('');
  const [campusZone, setCampusZone] = useState('');
  const [color, setColor] = useState('');
  const [keywords, setKeywords] = useState('');

  const fetchAlerts = async () => {
    try {
      const [alertRes, catRes, locRes] = await Promise.all([
        api.get('/alerts'),
        api.get('/admin/categories'),
        api.get('/admin/locations'),
      ]);
      setAlerts(alertRes.data.data.alerts || []);
      setCategories(catRes.data.data.categories || []);
      const zones = Array.from(new Set((locRes.data.data.locations || []).map((l) => l.zone)));
      setCampusZones(zones);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleCreateAlert = async (e) => {
    e.preventDefault();
    if (!category && !campusZone && !keywords.trim()) {
      error('Please select at least a category, campus zone, or keywords for your alert.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/alerts', {
        category,
        campusZone,
        color,
        keywords: keywords.split(',').map((k) => k.trim()).filter(Boolean),
        type: 'found',
      });

      setAlerts((prev) => [res.data.data.alert, ...prev]);
      success('Smart alert created! You will be notified as soon as a matching item is reported.');
      setColor('');
      setKeywords('');
    } catch (err) {
      error('Failed to create alert.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (alertId) => {
    try {
      const res = await api.put(`/alerts/${alertId}/toggle`);
      setAlerts((prev) =>
        prev.map((a) => (a._id === alertId ? res.data.data.alert : a))
      );
      success('Alert status updated.');
    } catch (err) {
      error('Failed to toggle alert.');
    }
  };

  const handleDelete = async (alertId) => {
    try {
      await api.delete(`/alerts/${alertId}`);
      setAlerts((prev) => prev.filter((a) => a._id !== alertId));
      success('Alert deleted.');
    } catch (err) {
      error('Failed to delete alert.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in pb-16">
      <div>
        <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-3">
          <span className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
            <Radio className="w-6 h-6" />
          </span>
          <span>Smart Alerts</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Set custom criteria to receive automatic notifications whenever an item matching your lost belongings is turned in.
        </p>
      </div>

      {/* Create Alert Form */}
      <form
        onSubmit={handleCreateAlert}
        className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4"
      >
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
          Create New Smart Alert
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 focus:ring-2 focus:ring-brand-500 outline-none"
            >
              <option value="">Any Category</option>
              {categories.map((c) => (
                <option key={c._id || c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Campus Zone
            </label>
            <select
              value={campusZone}
              onChange={(e) => setCampusZone(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 focus:ring-2 focus:ring-brand-500 outline-none"
            >
              <option value="">Any Campus Zone</option>
              {campusZones.map((z) => (
                <option key={z} value={z}>
                  {z}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Color
            </label>
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="e.g. Black, Blue, Silver"
              className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Keywords (comma-separated)
            </label>
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="e.g. macbook, airpods, hydroflask"
              className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-bold text-xs shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>{submitting ? 'Creating Alert...' : 'Create Smart Alert'}</span>
          </button>
        </div>
      </form>

      {/* Alerts List */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
          Your Active Alerts ({alerts.length})
        </h3>

        {loading ? (
          <LoadingSpinner />
        ) : alerts.length > 0 ? (
          alerts.map((alert) => (
            <div
              key={alert._id}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                      alert.isActive
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {alert.isActive ? 'Active' : 'Paused'}
                  </span>
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {alert.category || 'Any Category'}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                  {alert.campusZone && <span>📍 {alert.campusZone}</span>}
                  {alert.color && <span>🎨 Color: {alert.color}</span>}
                  {alert.keywords && alert.keywords.length > 0 && (
                    <span>🏷️ [{alert.keywords.join(', ')}]</span>
                  )}
                  <span>🔔 Triggered: {alert.notificationCount || 0} times</span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  onClick={() => handleToggle(alert._id)}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  {alert.isActive ? 'Pause' : 'Activate'}
                </button>
                <button
                  onClick={() => handleDelete(alert._id)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 transition"
                  title="Delete alert"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <EmptyState
            icon={Radio}
            title="No smart alerts configured"
            description="Create an alert above so the platform will notify you the moment someone turns in an item matching your description."
          />
        )}
      </div>
    </div>
  );
}
