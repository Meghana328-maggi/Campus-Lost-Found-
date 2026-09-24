import React from 'react';
import { Award, CheckCircle, ShieldCheck, HeartHandshake, Crown } from 'lucide-react';

const iconMap = {
  Award,
  CheckCircle,
  ShieldCheck,
  HeartHandshake,
  Crown,
};

export default function BadgeDisplay({ badge, size = 'default' }) {
  if (!badge) return null;

  const IconComponent = iconMap[badge.icon] || Award;

  const colorStyles = {
    helpful_finder: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    first_recovery: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    trusted_user: 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    community_hero: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    guardian: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800',
  }[badge.id] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';

  return (
    <div
      title={badge.description || badge.name}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${colorStyles} shadow-sm`}
    >
      <IconComponent className="w-3.5 h-3.5" />
      <span>{badge.name}</span>
    </div>
  );
}
