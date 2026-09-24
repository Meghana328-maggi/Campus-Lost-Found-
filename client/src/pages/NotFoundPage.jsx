import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-6">
      <div className="w-20 h-20 rounded-3xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center shadow-lg shadow-brand-500/10">
        <Compass className="w-10 h-10 animate-bounce" />
      </div>

      <div className="space-y-2">
        <h1 className="text-6xl font-display font-black text-slate-900 dark:text-slate-100">
          404
        </h1>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
          Page Lost in Campus Transit
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
          The requested page could not be found. It may have moved or been retired.
        </p>
      </div>

      <Link
        to="/"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Campus Home</span>
      </Link>
    </div>
  );
}
