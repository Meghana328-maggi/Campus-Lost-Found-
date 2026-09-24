import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ShieldCheck, Mail, MapPin, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200/80 dark:border-slate-800/80 bg-white/60 dark:bg-slate-950/60 backdrop-blur-sm mt-20 pb-20 md:pb-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold">
                <Compass className="w-5 h-5" />
              </div>
              <span className="font-display font-bold text-base tracking-tight text-slate-900 dark:text-slate-100">
                Campus Lost & Found
              </span>
            </Link>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Official university recovery portal ensuring safe, verified handovers of lost and found belongings across all campus zones.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Campus Security Partnered</span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-3">
              Explore
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <Link to="/lost" className="hover:text-brand-600 dark:hover:text-brand-400 transition">
                  Browse Lost Items
                </Link>
              </li>
              <li>
                <Link to="/found" className="hover:text-brand-600 dark:hover:text-brand-400 transition">
                  Browse Found Items
                </Link>
              </li>
              <li>
                <Link to="/report-lost" className="hover:text-brand-600 dark:hover:text-brand-400 transition">
                  Report a Lost Item
                </Link>
              </li>
              <li>
                <Link to="/report-found" className="hover:text-brand-600 dark:hover:text-brand-400 transition">
                  Report a Found Item
                </Link>
              </li>
            </ul>
          </div>

          {/* Guidelines */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-3">
              Campus Guidelines
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <span className="hover:underline cursor-pointer">Safe Handover Protocols</span>
              </li>
              <li>
                <span className="hover:underline cursor-pointer">Verification Procedures</span>
              </li>
              <li>
                <span className="hover:underline cursor-pointer">Unclaimed Items Policy (90 Days)</span>
              </li>
              <li>
                <span className="hover:underline cursor-pointer">Student Code of Conduct</span>
              </li>
            </ul>
          </div>

          {/* Security Contact */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-3">
              Security Assistance
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>Central Security Office, SAC Ground Floor</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>security@campuslostfound.edu</span>
              </li>
              <li className="pt-2 text-amber-600 dark:text-amber-400 font-semibold">
                Emergency Hotline: +1 (555) 911-CAMPUS
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <p>© {new Date().getFullYear()} Campus Lost & Found Platform. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for campus safety & honesty.
          </p>
        </div>
      </div>
    </footer>
  );
}
