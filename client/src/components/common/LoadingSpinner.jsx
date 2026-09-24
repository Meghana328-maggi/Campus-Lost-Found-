import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ message = 'Loading...', size = 'default', fullScreen = false }) {
  const sizeClasses = {
    small: 'w-4 h-4',
    default: 'w-8 h-8',
    large: 'w-12 h-12',
  }[size] || 'w-8 h-8';

  const content = (
    <div className="flex flex-col items-center justify-center gap-3 p-6 text-slate-500 dark:text-slate-400">
      <Loader2 className={`${sizeClasses} animate-spin text-brand-600 dark:text-brand-400`} />
      {message && <p className="text-sm font-medium animate-pulse">{message}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
}
