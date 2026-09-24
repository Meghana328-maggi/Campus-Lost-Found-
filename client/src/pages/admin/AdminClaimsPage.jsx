import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Eye, ExternalLink, CheckCircle, XCircle } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function AdminClaimsPage() {
  const { success, error } = useToast();

  const [claims, setClaims] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchClaims = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: 30 });
      if (statusFilter) params.set('status', statusFilter);

      const res = await api.get(`/admin/claims?${params.toString()}`);
      setClaims(res.data.data.claims || []);
    } catch (err) {
      console.error(err);
      error('Failed to load claims.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, [statusFilter]);

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-extrabold text-slate-900 dark:text-slate-100">
            Ownership Claims Review
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review claimant identification, evidence, and dispute resolutions.
          </p>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : claims.length > 0 ? (
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-bold">
                <tr>
                  <th className="p-4">Item</th>
                  <th className="p-4">Claimant</th>
                  <th className="p-4">Reporter / Finder</th>
                  <th className="p-4">Reason & Proof</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {claims.map((claim) => (
                  <tr key={claim._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                    <td className="p-4 font-bold text-slate-900 dark:text-slate-100">
                      <Link to={`/items/${claim.itemId?._id}`} className="hover:text-brand-600 block line-clamp-1">
                        {claim.itemId?.title || 'Unknown Item'}
                      </Link>
                      <span className="text-[11px] font-normal text-slate-400 capitalize">
                        {claim.itemId?.type} • {claim.itemId?.campusZone}
                      </span>
                    </td>
                    <td className="p-4 text-slate-700 dark:text-slate-300">
                      <div className="font-bold">{claim.claimantId?.name}</div>
                      <div className="text-[11px] text-slate-400">{claim.claimantId?.studentId || claim.claimantId?.email}</div>
                    </td>
                    <td className="p-4 text-slate-700 dark:text-slate-300">
                      <div className="font-bold">{claim.ownerId?.name}</div>
                      <div className="text-[11px] text-slate-400">{claim.ownerId?.email}</div>
                    </td>
                    <td className="p-4 max-w-xs">
                      <p className="line-clamp-2 text-slate-600 dark:text-slate-400">{claim.reason}</p>
                      {claim.verificationAnswers && claim.verificationAnswers.length > 0 && (
                        <span className="inline-block mt-1 text-[10px] font-bold text-brand-600 bg-brand-50 dark:bg-brand-950/60 px-2 py-0.5 rounded">
                          {claim.verificationAnswers.length} verification answers
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider ${
                          claim.status === 'approved'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60'
                            : claim.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60'
                            : claim.status === 'rejected'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60'
                        }`}
                      >
                        {claim.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400">
                      {new Date(claim.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        to={`/items/${claim.itemId?._id}`}
                        className="inline-flex items-center gap-1 font-semibold text-brand-600 hover:underline"
                      >
                        <span>View</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <p className="text-xs text-slate-400 p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          No claims matching the selected status.
        </p>
      )}
    </div>
  );
}
