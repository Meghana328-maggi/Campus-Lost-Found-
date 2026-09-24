import React, { useState, useEffect } from 'react';
import { Megaphone, Plus, Clock } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function AdminAnnouncementsPage() {
  const { success, error } = useToast();

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState('normal');
  const [submitting, setSubmitting] = useState(false);

  const fetchAnnouncements = async () => {
    try {
      const res = await api.get('/admin/announcements');
      setAnnouncements(res.data.data.announcements || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setSubmitting(true);
    try {
      const res = await api.post('/admin/announcements', {
        title: title.trim(),
        content: content.trim(),
        priority,
      });

      setAnnouncements((prev) => [res.data.data.announcement, ...prev]);
      setTitle('');
      setContent('');
      setPriority('normal');
      success('Campus announcement published and broadcast to students!');
    } catch (err) {
      error('Failed to publish announcement.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16 max-w-4xl">
      <div>
        <h2 className="text-2xl font-display font-extrabold text-slate-900 dark:text-slate-100">
          Campus Announcements
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Broadcast alerts, lost item collection drives, and campus recovery updates.
        </p>
      </div>

      {/* Create Announcement */}
      <form
        onSubmit={handleCreate}
        className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4"
      >
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
          Publish New Announcement
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Lost ID Cards Collection Drive This Friday"
              className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="normal">Normal</option>
              <option value="urgent">Urgent</option>
              <option value="pinned">Pinned to Home</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Announcement Content *
          </label>
          <textarea
            required
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Details, times, and instructions for campus members..."
            className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:bg-brand-400 text-white font-bold text-xs shadow-xs transition"
          >
            <Megaphone className="w-4 h-4" />
            <span>Publish & Broadcast</span>
          </button>
        </div>
      </form>

      {/* Announcements List */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
          Published Announcements ({announcements.length})
        </h3>

        {loading ? (
          <LoadingSpinner />
        ) : (
          announcements.map((a) => (
            <div
              key={a._id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-2"
            >
              <div className="flex items-center justify-between">
                <span
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase ${
                    a.priority === 'urgent'
                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60'
                      : a.priority === 'pinned'
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-800'
                  }`}
                >
                  {a.priority}
                </span>
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(a.createdAt).toLocaleDateString()}</span>
                </span>
              </div>

              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{a.title}</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line">
                {a.content}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
