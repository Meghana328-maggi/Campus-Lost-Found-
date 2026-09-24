import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, PlusCircle, MessageSquare, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';

export default function MobileBottomNav() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { unreadMessagesCount } = useSocket();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800/80 px-4 py-2 flex items-center justify-around shadow-lg">
      <Link
        to="/"
        className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold transition ${
          isActive('/') ? 'text-brand-600 dark:text-brand-400' : 'text-slate-500 dark:text-slate-400'
        }`}
      >
        <Home className="w-5 h-5" />
        <span>Home</span>
      </Link>

      <Link
        to="/lost"
        className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold transition ${
          isActive('/lost') ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400'
        }`}
      >
        <Search className="w-5 h-5" />
        <span>Search</span>
      </Link>

      {/* Floating Center Post Button */}
      <Link
        to="/report-lost"
        className="flex flex-col items-center -mt-5"
      >
        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-brand-500/30">
          <PlusCircle className="w-6 h-6" />
        </div>
        <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400 mt-0.5">Report</span>
      </Link>

      <Link
        to="/messages"
        className={`relative flex flex-col items-center gap-0.5 text-[10px] font-semibold transition ${
          isActive('/messages') ? 'text-brand-600 dark:text-brand-400' : 'text-slate-500 dark:text-slate-400'
        }`}
      >
        <MessageSquare className="w-5 h-5" />
        <span>Chat</span>
        {unreadMessagesCount > 0 && (
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-brand-600 text-white text-[9px] font-bold flex items-center justify-center">
            {unreadMessagesCount}
          </span>
        )}
      </Link>

      <Link
        to={isAuthenticated ? '/profile' : '/login'}
        className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold transition ${
          isActive('/profile') || isActive('/login') ? 'text-brand-600 dark:text-brand-400' : 'text-slate-500 dark:text-slate-400'
        }`}
      >
        <User className="w-5 h-5" />
        <span>{isAuthenticated ? 'Profile' : 'Login'}</span>
      </Link>
    </div>
  );
}
