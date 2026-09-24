import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  PlusCircle,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Users,
  Award,
  ArrowRight,
  Sparkles,
  Megaphone,
  Laptop,
  CreditCard,
  Briefcase,
  BookOpen,
  Shirt,
  Activity,
  Package,
} from 'lucide-react';
import api from '../services/api';
import ItemCard from '../components/items/ItemCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useLanguage } from '../context/LanguageContext';

const categoryIcons = {
  'Electronics & Gadgets': Laptop,
  'ID Cards & Wallets': CreditCard,
  'Bags & Luggage': Briefcase,
  'Books & Stationery': BookOpen,
  'Clothing & Accessories': Shirt,
  'Sports & Fitness Equipment': Activity,
  'Personal & Miscellaneous': Package,
};

export default function HomePage() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [recentlyLost, setRecentlyLost] = useState([]);
  const [recentlyFound, setRecentlyFound] = useState([]);
  const [categories, setCategories] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [stats, setStats] = useState({ totalItems: 0, recoveredCount: 0, activeUsers: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [lostRes, foundRes, catRes, annRes] = await Promise.all([
          api.get('/items?type=lost&limit=4'),
          api.get('/items?type=found&limit=4'),
          api.get('/admin/categories'),
          api.get('/admin/announcements'),
        ]);

        setRecentlyLost(lostRes.data.data.items || []);
        setRecentlyFound(foundRes.data.data.items || []);
        setCategories(catRes.data.data.categories || []);
        setAnnouncements(annRes.data.data.announcements || []);

        const total = (lostRes.data.data.pagination?.total || 0) + (foundRes.data.data.pagination?.total || 0);
        setStats({
          totalItems: total,
          recoveredCount: 14,
          activeUsers: 120,
        });
      } catch (err) {
        console.error('[Home Load Error]:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const [searchTarget, setSearchTarget] = useState('lost');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      navigate(`/${searchTarget}?search=${encodeURIComponent(q)}`);
    } else {
      navigate(`/${searchTarget}`);
    }
  };

  const quickSearchTags = ['MacBook', 'AirPods', 'ID Card', 'Wallet', 'Calculator', 'Keys', 'Backpack', 'Hydro Flask'];

  return (
    <div className="space-y-16 animate-fade-in pb-12">
      {/* Pinned Announcements */}
      {announcements.length > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-brand-600/10 via-indigo-600/10 to-purple-600/10 border border-brand-200 dark:border-brand-900/60 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-brand-600 text-white flex-shrink-0 mt-0.5">
            <Megaphone className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wide">
              Campus Announcement
            </span>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">
              {announcements[0].title}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              {announcements[0].content}
            </p>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-brand-950 via-slate-900 to-indigo-950 text-white p-8 sm:p-12 lg:p-16 shadow-2xl border border-brand-800/40">
        {/* Glow effects */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-brand-600/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-semibold text-brand-300">
            <Sparkles className="w-3.5 h-3.5 text-brand-300" />
            <span>Campus Item Matching & Verification Engine</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-display font-extrabold tracking-tight leading-tight">
            {t('heroTitle')}
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {t('heroSubtitle')}
          </p>

          {/* Search bar with target toggle */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex flex-col sm:flex-row items-center gap-2 p-2 bg-white/95 dark:bg-slate-900/95 rounded-2xl shadow-xl border border-white/20 max-w-2xl mx-auto"
          >
            <div className="flex items-center w-full sm:w-auto">
              <select
                value={searchTarget}
                onChange={(e) => setSearchTarget(e.target.value)}
                className="text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl px-3 py-2 border-none outline-none cursor-pointer"
              >
                <option value="lost">Lost Items</option>
                <option value="found">Found Items</option>
              </select>
            </div>

            <div className="flex items-center gap-2 flex-1 w-full px-2">
              <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchTarget === 'lost' ? "Search lost items across campus..." : "Search items found & turned in..."}
                className="flex-1 text-sm bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none py-1.5"
              />
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs transition shadow-sm"
            >
              Search
            </button>
          </form>

          {/* Quick Search Tag Suggestions */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1 text-xs text-slate-300">
            <span className="text-slate-400 text-[11px] mr-1">Trending:</span>
            {quickSearchTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => navigate(`/${searchTarget}?search=${encodeURIComponent(tag)}`)}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 text-[11px] font-medium transition backdrop-blur-xs border border-white/5"
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to="/report-lost"
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm transition shadow-lg shadow-rose-600/25 hover:scale-105"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t('reportLost')}</span>
            </Link>

            <Link
              to="/report-found"
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition shadow-lg shadow-emerald-600/25 hover:scale-105"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t('reportFound')}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Metrics Banner */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-display font-extrabold text-slate-900 dark:text-slate-100">
              90%+
            </div>
            <div className="text-xs text-slate-500 font-medium">Match Accuracy</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-display font-extrabold text-slate-900 dark:text-slate-100">
              {stats.recoveredCount}+
            </div>
            <div className="text-xs text-slate-500 font-medium">Items Recovered</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-display font-extrabold text-slate-900 dark:text-slate-100">
              {stats.activeUsers}+
            </div>
            <div className="text-xs text-slate-500 font-medium">Campus Members</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-display font-extrabold text-slate-900 dark:text-slate-100">
              100%
            </div>
            <div className="text-xs text-slate-500 font-medium">Verified Handover</div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-900 dark:text-slate-100">
              Explore by Category
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Browse listings sorted by campus item types
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {categories.map((cat) => {
            const Icon = categoryIcons[cat.name] || Package;
            return (
              <Link
                key={cat._id || cat.name}
                to={`/lost?category=${encodeURIComponent(cat.name)}`}
                className="group p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:shadow-md hover:border-brand-500 transition-all flex flex-col items-center text-center gap-2"
              >
                <div className="w-11 h-11 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-2">
                  {cat.name}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Recently Lost Items */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <span>{t('recentlyLost')}</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Items recently reported missing across campus
            </p>
          </div>
          <Link
            to="/lost"
            className="flex items-center gap-1 text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline"
          >
            <span>View All Lost</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : recentlyLost.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {recentlyLost.map((item) => (
              <ItemCard key={item._id} item={item} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">No lost items reported recently.</p>
        )}
      </section>

      {/* Recently Found Items */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{t('recentlyFound')}</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Found items awaiting verified owners
            </p>
          </div>
          <Link
            to="/found"
            className="flex items-center gap-1 text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline"
          >
            <span>View All Found</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : recentlyFound.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {recentlyFound.map((item) => (
              <ItemCard key={item._id} item={item} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">No found items reported recently.</p>
        )}
      </section>

      {/* How It Works */}
      <section className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-8">
        <div className="text-center max-w-xl mx-auto">
          <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-slate-100">
            {t('howItWorks')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Simple, safe, and automated 4-step recovery pipeline
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-brand-100 dark:bg-brand-950/80 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-lg">
              1
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Report an Item</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Post missing or found belongings with category, zone, photos, and private verification questions.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-lg">
              2
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Automated Matching</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Our 6-factor weighted algorithm computes similarity and alerts potential owners automatically.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-lg">
              3
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Hidden Verification</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Claimants submit proof answers to private questions without exposing sensitive details publicly.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg">
              4
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Safe Handover</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Upon approval, chat safely in real-time, meet at designated campus security desks, and exchange feedback!
            </p>
          </div>
        </div>
      </section>

      {/* Safety Guidelines */}
      <section className="p-8 sm:p-10 rounded-3xl bg-amber-500/5 border border-amber-500/20 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500 text-white">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {t('safetyGuidelines')}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="font-bold text-slate-900 dark:text-slate-100 block mb-1">
              📍 Public Meeting Zones
            </span>
            Always arrange handovers during daylight hours at designated campus locations such as the Central Security Desk or SAC Foyer.
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="font-bold text-slate-900 dark:text-slate-100 block mb-1">
              🔒 ID Verification
            </span>
            Verify university student ID card before handing over high-value electronics, wallets, or keys.
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="font-bold text-slate-900 dark:text-slate-100 block mb-1">
              🚫 Zero Reward Demands
            </span>
            Demanding ransom or finder fees violates university regulations. Report any suspicious behavior immediately to moderators.
          </div>
        </div>
      </section>
    </div>
  );
}
