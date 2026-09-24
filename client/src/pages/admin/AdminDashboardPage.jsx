import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Package,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Clock,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/admin/dashboard')
      .then((res) => {
        setData(res.data.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading administration dashboard..." />;
  }

  const metrics = data?.metrics || {};
  const recentItems = data?.recentItems || [];
  const recentReports = data?.recentReports || [];

  const cards = [
    { label: 'Total Users', value: metrics.totalUsers, icon: Users, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/60' },
    { label: 'Active Users', value: metrics.activeUsers, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60' },
    { label: 'Lost Items', value: metrics.lostItemsCount, icon: Package, color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/60' },
    { label: 'Found Items', value: metrics.foundItemsCount, icon: Package, color: 'text-teal-600 bg-teal-50 dark:bg-teal-950/60' },
    { label: 'Recovered Items', value: metrics.recoveredItemsCount, icon: ShieldCheck, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60' },
    { label: 'Pending Claims', value: metrics.pendingClaimsCount, icon: Clock, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/60' },
    { label: 'Pending Reports', value: metrics.pendingReportsCount, icon: AlertTriangle, color: 'text-orange-600 bg-orange-50 dark:bg-orange-950/60' },
    { label: 'Recovery Rate', value: `${metrics.recoveryRate || 0}%`, icon: TrendingUp, color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/60' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner */}
      <div>
        <h2 className="text-2xl font-display font-extrabold text-slate-900 dark:text-slate-100">
          Campus Operational Overview
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Real-time database statistics and safety moderation controls.
        </p>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {cards.map((c, idx) => {
          const Icon = c.icon;
          return (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center gap-4"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${c.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <span className="text-xs text-slate-500 block truncate">{c.label}</span>
                <span className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                  {c.value !== undefined ? c.value : 0}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Action Shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/admin/claims"
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 hover:border-brand-500 transition shadow-xs flex items-center justify-between"
        >
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Review Pending Claims</h4>
            <p className="text-[11px] text-slate-500">{metrics.pendingClaimsCount || 0} claims awaiting investigation</p>
          </div>
          <ArrowRight className="w-4 h-4 text-brand-500" />
        </Link>

        <Link
          to="/admin/reports"
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 hover:border-brand-500 transition shadow-xs flex items-center justify-between"
        >
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Fraud & Safety Reports</h4>
            <p className="text-[11px] text-slate-500">{metrics.pendingReportsCount || 0} flags awaiting moderation</p>
          </div>
          <ArrowRight className="w-4 h-4 text-brand-500" />
        </Link>

        <Link
          to="/admin/announcements"
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 hover:border-brand-500 transition shadow-xs flex items-center justify-between"
        >
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Post Announcement</h4>
            <p className="text-[11px] text-slate-500">Broadcast notification to all campus users</p>
          </div>
          <ArrowRight className="w-4 h-4 text-brand-500" />
        </Link>
      </div>

      {/* Recent Items & Recent Reports split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Items Table */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Recent Item Submissions
            </h3>
            <Link to="/admin/items" className="text-xs font-bold text-brand-600 hover:underline">
              View All
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentItems.map((item) => (
              <div key={item._id} className="py-3 flex items-center justify-between text-xs">
                <div className="min-w-0 pr-2">
                  <Link to={`/items/${item._id}`} className="font-bold text-slate-800 dark:text-slate-200 hover:text-brand-600 truncate block">
                    {item.title}
                  </Link>
                  <span className="text-slate-400 capitalize">{item.type} • {item.campusZone}</span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase ${
                    item.type === 'lost' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {item.type}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Fraud Reports */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Pending Safety Reports
            </h3>
            <Link to="/admin/reports" className="text-xs font-bold text-brand-600 hover:underline">
              View All
            </Link>
          </div>

          {recentReports.length > 0 ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentReports.map((r) => (
                <div key={r._id} className="py-3 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-rose-600 uppercase tracking-wider">{r.reason.replace('_', ' ')}</span>
                    <span className="text-slate-400">{new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 line-clamp-1">{r.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-6 text-center">No pending safety reports.</p>
          )}
        </div>
      </div>
    </div>
  );
}
