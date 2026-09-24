import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

export default function AdminAnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/admin/analytics')
      .then((res) => {
        setData(res.data.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <LoadingSpinner message="Calculating real-time campus analytics..." />;
  }

  const summary = data?.summary || {};
  const monthlyTrends = data?.monthlyTrends || [];
  const itemsByCategory = data?.itemsByCategory || [];
  const itemsByZone = data?.itemsByZone || [];
  const claimsByStatus = data?.claimsByStatus || [];

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      <div>
        <h2 className="text-2xl font-display font-extrabold text-slate-900 dark:text-slate-100">
          Campus Analytics & Insights
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Real-time metrics computed directly from MongoDB aggregations.
        </p>
      </div>

      {/* Top Summary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-500 block">Total Campus Listings</span>
          <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1 block">
            {summary.totalItems || 0}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-500 block">Recovered Belongings</span>
          <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 block">
            {summary.totalRecovered || 0}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-500 block">Overall Recovery Rate</span>
          <span className="text-2xl font-extrabold text-brand-600 dark:text-brand-400 mt-1 block">
            {summary.recoveryRate || 0}%
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-500 block">Total Claims Processed</span>
          <span className="text-2xl font-extrabold text-purple-600 dark:text-purple-400 mt-1 block">
            {summary.totalClaims || 0}
          </span>
        </div>
      </div>

      {/* Chart 1: Monthly Lost vs Found Trends */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
          Monthly Incident Trends (Lost vs Found)
        </h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="month" stroke="#888888" fontSize={11} />
              <YAxis stroke="#888888" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Bar dataKey="lost" fill="#f43f5e" name="Lost Items" radius={[4, 4, 0, 0]} />
              <Bar dataKey="found" fill="#10b981" name="Found Items" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2 & 3: Categories & Campus Zones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Items by Category */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Items by Category Distribution
          </h3>
          <div className="h-64 w-full">
            {itemsByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={itemsByCategory}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) => `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`}
                    fontSize={10}
                  >
                    {itemsByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-400 text-center py-20">No category data yet.</p>
            )}
          </div>
        </div>

        {/* Items by Campus Zone */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Reports by Campus Zone
          </h3>
          <div className="h-64 w-full">
            {itemsByZone.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={itemsByZone.slice(0, 6)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis type="number" stroke="#888888" fontSize={10} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    stroke="#888888"
                    fontSize={10}
                    width={90}
                    tickFormatter={(val) => val.split(' ')[0]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-400 text-center py-20">No location data yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
