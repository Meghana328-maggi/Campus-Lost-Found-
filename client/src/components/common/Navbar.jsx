import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Compass,
  Search,
  Bell,
  MessageSquare,
  Sun,
  Moon,
  Globe,
  PlusCircle,
  Menu,
  X,
  User,
  LogOut,
  Shield,
  Bookmark,
  Radio,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useSocket } from '../../context/SocketContext';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { unreadNotificationsCount, unreadMessagesCount } = useSocket();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white flex items-center justify-center shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <Compass className="w-6 h-6 animate-pulse-subtle" />
            </div>
            <div>
              <span className="font-display font-black text-lg tracking-tight bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 dark:from-brand-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                CAMPUS
              </span>
              <span className="font-display font-semibold text-xs tracking-wider uppercase text-slate-500 dark:text-slate-400 ml-1">
                Lost & Found
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2">
            <Link
              to="/lost"
              className={`px-3 py-2 rounded-xl text-sm font-semibold transition ${
                isActive('/lost')
                  ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              {t('lostItems')}
            </Link>

            <Link
              to="/found"
              className={`px-3 py-2 rounded-xl text-sm font-semibold transition ${
                isActive('/found')
                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              {t('foundItems')}
            </Link>

            {/* Quick Report Dropdown / Buttons */}
            <Link
              to="/report-lost"
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 hover:bg-rose-200 dark:hover:bg-rose-900 transition flex items-center gap-1 shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{t('reportLost')}</span>
            </Link>

            <Link
              to="/report-found"
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900 transition flex items-center gap-1 shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{t('reportFound')}</span>
            </Link>
          </div>

          {/* Right Action Icons & Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                aria-label="Change Language"
                className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-1 text-xs font-semibold"
              >
                <Globe className="w-4 h-4 text-slate-500" />
                <span className="uppercase">{language}</span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-1 z-50 text-xs font-medium">
                  <button
                    onClick={() => { setLanguage('en'); setLangDropdownOpen(false); }}
                    className={`w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between ${language === 'en' ? 'text-brand-600 font-bold' : ''}`}
                  >
                    <span>English</span>
                    {language === 'en' && <span>✓</span>}
                  </button>
                  <button
                    onClick={() => { setLanguage('te'); setLangDropdownOpen(false); }}
                    className={`w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between ${language === 'te' ? 'text-brand-600 font-bold' : ''}`}
                  >
                    <span>తెలుగు (Telugu)</span>
                    {language === 'te' && <span>✓</span>}
                  </button>
                  <button
                    onClick={() => { setLanguage('hi'); setLangDropdownOpen(false); }}
                    className={`w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between ${language === 'hi' ? 'text-brand-600 font-bold' : ''}`}
                  >
                    <span>हिन्दी (Hindi)</span>
                    {language === 'hi' && <span>✓</span>}
                  </button>
                </div>
              )}
            </div>

            {/* Search Directory Shortcut */}
            <Link
              to="/lost"
              aria-label="Search Items Directory"
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition hidden sm:inline-flex"
              title="Search Items Directory"
            >
              <Search className="w-5 h-5 text-slate-500" />
            </Link>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-slate-600" />
              )}
            </button>

            {isAuthenticated ? (
              <>
                {/* Notifications Link */}
                <Link
                  to="/notifications"
                  aria-label="Notifications"
                  className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <Bell className="w-5 h-5" />
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                      {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                    </span>
                  )}
                </Link>

                {/* Messages Link */}
                <Link
                  to="/messages"
                  aria-label="Messages"
                  className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <MessageSquare className="w-5 h-5" />
                  {unreadMessagesCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-brand-600 text-white text-[10px] font-bold flex items-center justify-center">
                      {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
                    </span>
                  )}
                </Link>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1 pl-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-brand-500 transition"
                  >
                    <div className="w-7 h-7 rounded-lg bg-brand-600 text-white flex items-center justify-center text-xs font-bold overflow-hidden">
                      {user.profileImage ? (
                        <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        user.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <span className="text-xs font-semibold max-w-[80px] truncate hidden sm:inline text-slate-800 dark:text-slate-200">
                      {user.name.split(' ')[0]}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-2 z-50 text-sm animate-fade-in">
                      <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                        <p className="font-bold text-slate-900 dark:text-slate-100 truncate">{user.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                        <div className="mt-1 text-xs font-semibold text-brand-600 dark:text-brand-400">
                          Reputation Score: {user.reputationScore || 0}
                        </div>
                      </div>

                      {isAdmin && (
                        <Link
                          to="/admin/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/40 font-semibold"
                        >
                          <Shield className="w-4 h-4" />
                          <span>Admin Dashboard</span>
                        </Link>
                      )}

                      <Link
                        to="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <User className="w-4 h-4" />
                        <span>My Profile</span>
                      </Link>

                      <Link
                        to="/claims"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <Shield className="w-4 h-4" />
                        <span>My Claims</span>
                      </Link>

                      <Link
                        to="/bookmarks"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <Bookmark className="w-4 h-4" />
                        <span>Saved Items</span>
                      </Link>

                      <Link
                        to="/alerts"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <Radio className="w-4 h-4" />
                        <span>Smart Alerts</span>
                      </Link>

                      <div className="border-t border-slate-100 dark:border-slate-800 my-1"></div>

                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2.5 w-full text-left px-4 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-medium"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>{t('logout')}</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  {t('login')}
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-1.5 text-xs font-semibold rounded-xl bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition"
                >
                  {t('register')}
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Open mobile menu"
              className="md:hidden p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md px-4 pt-3 pb-6 space-y-3 animate-fade-in max-h-[calc(100vh-64px)] overflow-y-auto">
          {/* User Profile Mini Banner (if authenticated) */}
          {isAuthenticated && user && (
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-brand-600 text-white font-bold flex items-center justify-center text-xs">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{user.name}</p>
                  <p className="text-[11px] text-brand-600 dark:text-brand-400 font-semibold">★ {user.reputationScore || 0} pts</p>
                </div>
              </div>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
              >
                Profile
              </Link>
            </div>
          )}

          {/* Core Navigation Links */}
          <div className="space-y-1">
            <Link
              to="/lost"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm font-semibold transition ${
                isActive('/lost')
                  ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400'
                  : 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>{t('lostItems')}</span>
              <span className="text-xs text-rose-500 font-bold">Lost</span>
            </Link>
            <Link
              to="/found"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm font-semibold transition ${
                isActive('/found')
                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400'
                  : 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>{t('foundItems')}</span>
              <span className="text-xs text-emerald-500 font-bold">Found</span>
            </Link>
          </div>

          {/* Quick Post Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <Link
              to="/report-lost"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold bg-rose-600 text-white shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t('reportLost')}</span>
            </Link>
            <Link
              to="/report-found"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold bg-emerald-600 text-white shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t('reportFound')}</span>
            </Link>
          </div>

          {/* Authenticated User Features Drawer */}
          {isAuthenticated ? (
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1">
              {isAdmin && (
                <Link
                  to="/admin/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-bold text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40"
                >
                  <Shield className="w-4 h-4" />
                  <span>Admin Control Center</span>
                </Link>
              )}

              <Link
                to="/claims"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Shield className="w-4 h-4 text-slate-400" />
                <span>My Claims</span>
              </Link>

              <Link
                to="/bookmarks"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Bookmark className="w-4 h-4 text-slate-400" />
                <span>Saved Bookmarks</span>
              </Link>

              <Link
                to="/alerts"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Radio className="w-4 h-4 text-slate-400" />
                <span>Smart Alerts</span>
              </Link>

              <Link
                to="/notifications"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <div className="flex items-center gap-2.5">
                  <Bell className="w-4 h-4 text-slate-400" />
                  <span>Notifications</span>
                </div>
                {unreadNotificationsCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-brand-600 text-white text-[10px] font-bold">
                    {unreadNotificationsCount}
                  </span>
                )}
              </Link>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="flex items-center gap-2.5 w-full text-left px-3 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-sm font-medium rounded-xl"
              >
                <LogOut className="w-4 h-4" />
                <span>{t('logout')}</span>
              </button>
            </div>
          ) : (
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200"
              >
                {t('login')}
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm"
              >
                {t('register')}
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
