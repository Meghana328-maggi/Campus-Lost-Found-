import React, { useState, useEffect } from 'react';
import {
  User,
  ShieldCheck,
  Award,
  KeyRound,
  CheckCircle,
  Package,
  Edit2,
  Save,
  Phone,
  Building,
  GraduationCap,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import BadgeDisplay from '../components/common/BadgeDisplay';
import ItemCard from '../components/items/ItemCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function ProfilePage() {
  const { user, updateProfile, changePassword } = useAuth();
  const { success, error } = useToast();

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'items' | 'security'
  const [myItems, setMyItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);

  // Edit form state
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [year, setYear] = useState(user?.year || '');
  const [profileImage, setProfileImage] = useState(user?.profileImage || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (activeTab === 'items') {
      setLoadingItems(true);
      api
        .get('/items/user/me')
        .then((res) => {
          setMyItems(res.data.data.items || []);
        })
        .catch((err) => console.error(err))
        .finally(() => setLoadingItems(false));
    }
  }, [activeTab]);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateProfile({ name, phone, department, year, profileImage });
      success('Profile updated successfully!');
      setEditing(false);
    } catch (err) {
      error('Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      error('New passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      error('New password must be at least 6 characters.');
      return;
    }

    setSavingPassword(true);
    try {
      await changePassword({ currentPassword, newPassword });
      success('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      error(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setSavingPassword(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-16">
      {/* Header Profile Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="relative">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-brand-600 text-white font-bold text-3xl flex items-center justify-center overflow-hidden shadow-lg shadow-brand-500/20">
            {profileImage ? (
              <img src={profileImage} alt="" className="w-full h-full object-cover" />
            ) : (
              user.name.charAt(0).toUpperCase()
            )}
          </div>
          <span className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-emerald-500 text-white shadow-sm" title="Active Verified Member">
            <CheckCircle className="w-4 h-4" />
          </span>
        </div>

        <div className="flex-1 text-center sm:text-left space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h1 className="text-2xl font-display font-extrabold text-slate-900 dark:text-slate-100">
                {user.name}
              </h1>
              <p className="text-xs text-slate-500 font-medium">{user.email} • {user.studentId || 'Campus Student'}</p>
            </div>
            <button
              onClick={() => {
                setEditing(!editing);
                setActiveTab('profile');
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition self-center sm:self-auto"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>{editing ? 'Cancel Editing' : 'Edit Profile'}</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2 text-xs text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <Building className="w-3.5 h-3.5 text-brand-500" />
              <span>{user.department || 'General'}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5 text-brand-500" />
              <span>{user.year || 'Undergraduate'}</span>
            </span>
            {user.phone && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-brand-500" />
                  <span>{user.phone}</span>
                </span>
              </>
            )}
          </div>

          {/* Reputation & Badges row */}
          <div className="pt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <div className="px-3 py-1 rounded-xl bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-900/60 text-xs font-extrabold text-brand-700 dark:text-brand-300">
              ★ {user.reputationScore || 10} Reputation Score
            </div>
            {user.badges && user.badges.map((b) => (
              <BadgeDisplay key={b.id} badge={b} />
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-4 overflow-x-auto whitespace-nowrap scrollbar-none pb-0.5">
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 text-sm font-bold border-b-2 transition ${
            activeTab === 'profile'
              ? 'border-brand-600 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Profile Information
        </button>

        <button
          onClick={() => setActiveTab('items')}
          className={`pb-3 text-sm font-bold border-b-2 transition ${
            activeTab === 'items'
              ? 'border-brand-600 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          My Reported Listings
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`pb-3 text-sm font-bold border-b-2 transition ${
            activeTab === 'security'
              ? 'border-brand-600 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Password & Security
        </button>
      </div>

      {/* Tab 1: Profile View / Edit */}
      {activeTab === 'profile' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-6">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            {editing ? 'Edit Personal Information' : 'Personal Details'}
          </h3>

          {editing ? (
            <form onSubmit={handleProfileSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Department / Major
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Computer Science, Electrical"
                    className="w-full text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Year of Study
                  </label>
                  <input
                    type="text"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    placeholder="e.g. 1st Year, 2nd Year"
                    className="w-full text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Profile Avatar Image URL
                  </label>
                  <input
                    type="text"
                    value={profileImage}
                    onChange={(e) => setProfileImage(e.target.value)}
                    placeholder="https://..."
                    className="w-full text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="flex items-center gap-1.5 px-6 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-xs"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingProfile ? 'Saving...' : 'Save Profile'}</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-slate-400 block mb-0.5">Email Address</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{user.email}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-slate-400 block mb-0.5">Student ID</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{user.studentId || 'Not provided'}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-slate-400 block mb-0.5">College / Institution</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{user.college}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-slate-400 block mb-0.5">Phone Number</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{user.phone || 'Not provided'}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-slate-400 block mb-0.5">Items Reported</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{user.itemsReportedCount || 0}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-slate-400 block mb-0.5">Recoveries Completed</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{user.itemsRecoveredCount || 0}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: My Reported Items */}
      {activeTab === 'items' && (
        <div className="space-y-4">
          {loadingItems ? (
            <LoadingSpinner />
          ) : myItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {myItems.map((item) => (
                <ItemCard key={item._id} item={item} />
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
              You haven't reported any lost or found items yet.
            </p>
          )}
        </div>
      )}

      {/* Tab 3: Security & Password */}
      {activeTab === 'security' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm max-w-lg space-y-4">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-brand-600" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Update Account Password
            </h3>
          </div>

          <form onSubmit={handlePasswordSave} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Current Password
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                New Password (minimum 6 characters)
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <button
              type="submit"
              disabled={savingPassword}
              className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:bg-brand-400 text-white font-bold text-xs shadow-xs transition"
            >
              {savingPassword ? 'Updating...' : 'Change Password'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
