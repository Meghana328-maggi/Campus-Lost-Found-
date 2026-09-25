import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Compass, Eye, EyeOff, Lock, Mail, ArrowRight, Shield, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { success, error } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      error('Please enter both email and password.');
      return;
    }

    setSubmitting(true);
    try {
      await login(email, password);
      success('Logged in successfully! Welcome back.');
      navigate(from, { replace: true });
    } catch (err) {
      const serverMessage = err.response?.data?.message;
      if (serverMessage) {
        error(serverMessage);
      } else if (err.response?.status === 502 || err.response?.status === 503) {
        error('Backend server is spinning up or temporarily unavailable (502/503). Please wait a moment and try again.');
      } else if (err.message) {
        error(err.message);
      } else {
        error('Invalid email or password.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const fillCredentials = (type) => {
    if (type === 'admin') {
      setEmail('admin@campuslostfound.edu');
      setPassword('AdminPass123!');
    } else {
      setEmail('alex@campuslostfound.edu');
      setPassword('UserPass123!');
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-md p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-brand-500/25">
            <Compass className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-display font-extrabold text-slate-900 dark:text-slate-100">
            Welcome Back
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Sign in to access campus lost & found services and manage your claims.
          </p>
        </div>

        {/* Quick Demo Credentials Fill Pills */}
        <div className="p-3 rounded-2xl bg-brand-50/60 dark:bg-brand-950/30 border border-brand-200/60 dark:border-brand-900/60 space-y-2">
          <span className="text-[11px] font-bold text-brand-700 dark:text-brand-300 block">
            🚀 Quick Development Fill:
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fillCredentials('student')}
              className="flex-1 py-1.5 px-2 rounded-xl bg-white dark:bg-slate-900 border border-brand-200 dark:border-brand-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:border-brand-500 transition flex items-center justify-center gap-1"
            >
              <User className="w-3 h-3 text-brand-600" /> Student
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('admin')}
              className="flex-1 py-1.5 px-2 rounded-xl bg-white dark:bg-slate-900 border border-brand-200 dark:border-brand-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:border-brand-500 transition flex items-center justify-center gap-1"
            >
              <Shield className="w-3 h-3 text-brand-600" /> Admin
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">
              Email or Username
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. student@campus.edu or username"
                className="w-full text-sm pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none focus:ring-2 focus:ring-brand-500 transition"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-sm pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none focus:ring-2 focus:ring-brand-500 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 disabled:bg-brand-400 text-white font-bold text-sm shadow-md shadow-brand-500/25 transition"
          >
            {submitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-brand-600 dark:text-brand-400 hover:underline">
            Register for Campus ID
          </Link>
        </div>
      </div>
    </div>
  );
}
