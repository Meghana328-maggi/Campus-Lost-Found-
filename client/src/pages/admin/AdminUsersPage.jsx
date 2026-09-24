import React, { useState, useEffect } from 'react';
import { Search, Ban, CheckCircle, Shield, User, Filter } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmationModal from '../../components/common/ConfirmationModal';

export default function AdminUsersPage() {
  const { success, error } = useToast();

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [blockedFilter, setBlockedFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  // Selected user for block/unblock modal
  const [selectedUser, setSelectedUser] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page,
        limit: 15,
      });
      if (search) params.set('search', search);
      if (roleFilter) params.set('role', roleFilter);
      if (blockedFilter) params.set('isBlocked', blockedFilter);

      const res = await api.get(`/admin/users?${params.toString()}`);
      setUsers(res.data.data.users || []);
      setPagination(res.data.data.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch (err) {
      console.error(err);
      error('Failed to load campus users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, roleFilter, blockedFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchUsers();
  };

  const handleToggleBlock = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      const res = await api.put(`/admin/users/${selectedUser._id}/block`);
      const updated = res.data.data.user;
      setUsers((prev) =>
        prev.map((u) => (u._id === updated._id ? { ...u, isBlocked: updated.isBlocked } : u))
      );
      success(`User ${updated.name} has been ${updated.isBlocked ? 'blocked' : 'unblocked'}.`);
      setConfirmModalOpen(false);
    } catch (err) {
      error(err.response?.data?.message || 'Action failed.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      <div>
        <h2 className="text-2xl font-display font-extrabold text-slate-900 dark:text-slate-100">
          User Management
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Monitor campus student profiles, reputations, and disciplinary block states.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, student ID..."
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
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none"
          >
            <option value="">All Roles</option>
            <option value="user">Students</option>
            <option value="admin">Administrators</option>
          </select>

          <select
            value={blockedFilter}
            onChange={(e) => setBlockedFilter(e.target.value)}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none"
          >
            <option value="">All Statuses</option>
            <option value="false">Active</option>
            <option value="true">Blocked / Suspended</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-bold">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Department / Year</th>
                  <th className="p-4">Student ID</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Reputation</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-brand-600 text-white font-bold flex items-center justify-center text-xs">
                          {u.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 dark:text-slate-100 block">{u.name}</span>
                          <span className="text-[11px] text-slate-400">{u.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-300">
                      <div>{u.department || 'General'}</div>
                      <div className="text-[11px] text-slate-400">{u.year}</div>
                    </td>
                    <td className="p-4 font-mono text-slate-600 dark:text-slate-300">
                      {u.studentId || '—'}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase ${
                          u.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-brand-600 dark:text-brand-400">
                      ★ {u.reputationScore || 0}
                    </td>
                    <td className="p-4">
                      {u.isBlocked ? (
                        <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 text-[10px] font-bold uppercase">
                          Blocked
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px] font-bold uppercase">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => {
                            setSelectedUser(u);
                            setConfirmModalOpen(true);
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                            u.isBlocked
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100'
                              : 'bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100'
                          }`}
                        >
                          {u.isBlocked ? 'Unblock' : 'Block User'}
                        </button>
                      )}
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
        isOpen={confirmModalOpen}
        title={selectedUser?.isBlocked ? 'Unblock User' : 'Suspend & Block User'}
        message={
          selectedUser?.isBlocked
            ? `Restore full platform privileges for ${selectedUser?.name}?`
            : `Are you sure you want to suspend ${selectedUser?.name}? They will not be able to log in or create claims/reports.`
        }
        confirmText={selectedUser?.isBlocked ? 'Confirm Unblock' : 'Suspend Account'}
        danger={!selectedUser?.isBlocked}
        loading={actionLoading}
        onConfirm={handleToggleBlock}
        onClose={() => setConfirmModalOpen(false)}
      />
    </div>
  );
}
