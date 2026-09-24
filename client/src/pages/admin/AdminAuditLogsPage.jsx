import React, { useState, useEffect } from 'react';
import { ScrollText, Shield, Clock } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/audit-logs?page=${pagination.page}&limit=20`);
      setLogs(res.data.data.logs || []);
      setPagination(res.data.data.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [pagination.page]);

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      <div>
        <h2 className="text-2xl font-display font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-3">
          <span className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            <ScrollText className="w-6 h-6" />
          </span>
          <span>Security Audit Trail</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Immutable system log recording administrative modifications, user bans, and resolutions.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : logs.length > 0 ? (
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase font-bold">
                <tr>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Action</th>
                  <th className="p-4">Administrator</th>
                  <th className="p-4">Target Entity</th>
                  <th className="p-4">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="p-4 text-slate-400 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4 font-mono font-bold text-brand-600 dark:text-brand-400">
                      {log.action}
                    </td>
                    <td className="p-4 text-slate-800 dark:text-slate-200 font-semibold">
                      {log.userName || 'System'}
                    </td>
                    <td className="p-4 text-slate-500">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-bold">
                        {log.entityType}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-300">
                      {log.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <p className="text-xs text-slate-400 p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          No audit log events recorded yet.
        </p>
      )}
    </div>
  );
}
