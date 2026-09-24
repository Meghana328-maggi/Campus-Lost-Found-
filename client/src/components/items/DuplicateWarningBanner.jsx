import React from 'react';
import { AlertTriangle, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DuplicateWarningBanner({ duplicates = [] }) {
  if (!duplicates || duplicates.length === 0) return null;

  return (
    <div className="p-4 mb-6 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 animate-fade-in">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex-shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200">
            Similar Item Already Reported!
          </h4>
          <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
            We found {duplicates.length} existing listing(s) that might match what you are reporting. Check if your item has already been posted before creating a duplicate.
          </p>

          <div className="mt-3 flex flex-col gap-2">
            {duplicates.map(({ item, similarity }) => (
              <div
                key={item._id}
                className="flex items-center justify-between p-2.5 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-amber-200/60 dark:border-amber-900/60 text-xs"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span className="font-bold text-amber-600 dark:text-amber-400">
                    {similarity}% Match
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {item.title}
                  </span>
                  <span className="text-slate-500 truncate hidden sm:inline">
                    ({item.campusZone})
                  </span>
                </div>
                <Link
                  to={`/items/${item._id}`}
                  target="_blank"
                  className="inline-flex items-center gap-1 font-semibold text-brand-600 dark:text-brand-400 hover:underline flex-shrink-0 ml-2"
                >
                  <span>View</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
