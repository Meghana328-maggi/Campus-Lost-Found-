import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, XCircle, ExternalLink, Shield } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function AdminReportsPage() {
  const { success, error } = useToast();

  const [reports, setReports] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Selected report for resolving
  const [selectedReport, setSelectedReport] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: 30 });
      if (statusFilter) params.set('status', statusFilter);

      const res = await api.get(`/admin/reports?${params.toString()}`);
      setReports(res.data.data.reports || []);
    } catch (err) {
      console.error(err);
      error('Failed to load reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [statusFilter]);

  const handleResolve = async (status) => {
    if (!selectedReport) return;
    setActionLoading(true);
    try {
      await api.put(`/admin/reports/${selectedReport._id}`, {
        status,
        adminNotes,
      });
      success(`Report marked as ${status}.`);
      setResolveModalOpen(false);
      setAdminNotes('');
      fetchReports();
    } catch (err) {
      error('Failed to update report.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-extrabold text-slate-900 dark:text-slate-100">
            Safety & Fraud Reports
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review listings, users, or claims flagged for policy violations.
          </p>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="resolved">Resolved</option>
          <option value="dismissed">Dismissed</option>
        </select>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : reports.length > 0 ? (
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-bold">
                <tr>
                  <th className="p-4">Violation Type</th>
                  <th className="p-4">Reported Listing / User</th>
                  <th className="p-4">Reporter</th>
                  <th className="p-4">Details</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {reports.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                    <td className="p-4 font-bold text-rose-600 uppercase tracking-wider">
                      {r.reason.replace('_', ' ')}
                    </td>
                    <td className="p-4">
                      {r.item ? (
                        <span className="font-semibold text-slate-900 dark:text-slate-100 block truncate max-w-xs">
                          Item: {r.item.title}
                        </span>
                      ) : r.reportedUser ? (
                        <span className="font-semibold text-slate-900 dark:text-slate-100 block">
                          User: {r.reportedUser.name}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-400">
                      {r.reporter?.name} ({r.reporter?.email})
                    </td>
                    <td className="p-4 max-w-xs">
                      <p className="line-clamp-2 text-slate-600 dark:text-slate-300">{r.description}</p>
                      {r.adminNotes && (
                        <p className="text-[11px] text-brand-600 dark:text-brand-400 mt-1 font-semibold">
                          Admin note: {r.adminNotes}
                        </p>
                      )}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider ${
                          r.status === 'resolved'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60'
                            : r.status === 'dismissed'
                            ? 'bg-slate-100 text-slate-700 dark:bg-slate-800'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {r.status === 'pending' && (
                        <button
                          onClick={() => {
                            setSelectedReport(r);
                            setResolveModalOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-xs"
                        >
                          Review
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <p className="text-xs text-slate-400 p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          No reports currently awaiting review.
        </p>
      )}

      {/* Resolve / Dismiss Modal */}
      {resolveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Resolve Moderation Report
            </h3>
            <p className="text-xs text-slate-500">
              Reason: <span className="font-bold uppercase text-rose-600">{selectedReport?.reason}</span>
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
              "{selectedReport?.description}"
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Administrative Resolution Notes
              </label>
              <textarea
                rows={2}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Action taken or justification..."
                className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setResolveModalOpen(false)}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleResolve('dismissed')}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Dismiss Report
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleResolve('resolved')}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
              >
                Resolve & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
