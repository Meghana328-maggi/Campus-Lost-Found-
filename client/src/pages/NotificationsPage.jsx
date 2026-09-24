import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  Sparkles,
  ShieldCheck,
  MessageSquare,
  Megaphone,
  Radio,
  Clock,
  ExternalLink,
} from 'lucide-react';
import api from '../services/api';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';

const typeIcons = {
  possible_match: Sparkles,
  claim_received: ShieldCheck,
  claim_approved: CheckCheck,
  claim_rejected: ShieldCheck,
  message: MessageSquare,
  smart_alert: Radio,
  announcement: Megaphone,
  system: Bell,
};

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { setUnreadNotificationsCount } = useSocket();
  const { success, error } = useToast();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications?limit=50');
      setNotifications(res.data.data.notifications || []);
      setUnreadNotificationsCount(0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadNotificationsCount(0);
      success('All notifications marked as read.');
    } catch (err) {
      error('Failed to mark notifications read.');
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      api.put(`/notifications/${notif._id}/read`).catch(() => {});
      setNotifications((prev) =>
        prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n))
      );
    }
    if (notif.link) {
      navigate(notif.link);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-3">
            <span className="p-2 rounded-xl bg-brand-100 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400">
              <Bell className="w-6 h-6" />
            </span>
            <span>Notification Center</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time updates regarding item claims, potential matches, and campus alerts.
          </p>
        </div>

        {notifications.some((n) => !n.isRead) && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <CheckCheck className="w-4 h-4 text-brand-600" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : notifications.length > 0 ? (
        <div className="divide-y divide-slate-100 dark:divide-slate-800/80 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm overflow-hidden">
          {notifications.map((n) => {
            const Icon = typeIcons[n.type] || Bell;

            return (
              <div
                key={n._id}
                onClick={() => handleNotificationClick(n)}
                className={`p-4 sm:p-5 flex items-start gap-4 transition cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/40 ${
                  !n.isRead ? 'bg-brand-50/30 dark:bg-brand-950/20' : ''
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                    !n.isRead
                      ? 'bg-brand-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {n.title}
                    </h4>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1 flex-shrink-0">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    {n.message}
                  </p>
                </div>

                {!n.isRead && (
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-600 flex-shrink-0 mt-2" />
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Bell}
          title="No notifications"
          description="You are completely caught up! New matches and claim updates will appear here."
        />
      )}
    </div>
  );
}
