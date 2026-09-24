import React, { useState } from 'react';
import { X, ShieldCheck, Upload, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function ClaimModal({ isOpen, onClose, item, onClaimSubmitted }) {
  const { success, error } = useToast();
  const [reason, setReason] = useState('');
  const [uniqueDetails, setUniqueDetails] = useState('');
  const [answers, setAnswers] = useState({});
  const [proofFiles, setProofFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !item) return null;

  const handleAnswerChange = (question, value) => {
    setAnswers((prev) => ({ ...prev, [question]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      setProofFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      error('Please provide a reason explaining why this item belongs to you.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('itemId', item._id);
      formData.append('reason', reason);
      formData.append('uniqueDetails', uniqueDetails);

      // Package verification answers
      if (item.hiddenVerification && item.hiddenVerification.length > 0) {
        const verificationList = item.hiddenVerification.map((q) => ({
          question: q.question,
          answer: answers[q.question] || '',
        }));
        formData.append('verificationAnswers', JSON.stringify(verificationList));
      }

      // Proof files
      proofFiles.forEach((file) => {
        formData.append('proofImages', file);
      });

      const res = await api.post('/claims', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      success('Ownership claim submitted! The reporter has been notified to verify your answers.');
      if (onClaimSubmitted) onClaimSubmitted(res.data.data.claim);
      onClose();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to submit claim.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative my-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Claim This Item</h3>
            <p className="text-xs text-slate-500 truncate max-w-xs">{item.title}</p>
          </div>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
          Provide accurate details to verify your ownership. False claims violate campus honor code and may result in disciplinary action.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Reason */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Why do you believe this item is yours? *
            </label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain where and when you lost it, contents, or circumstances..."
              className="w-full text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-3 focus:ring-2 focus:ring-brand-500 outline-none transition"
            />
          </div>

          {/* Unique Details */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Unique Identifying Features
            </label>
            <textarea
              rows={2}
              value={uniqueDetails}
              onChange={(e) => setUniqueDetails(e.target.value)}
              placeholder="e.g. Scratches, stickers, wallpaper, passcode hint, secret mark, specific wallet card..."
              className="w-full text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-3 focus:ring-2 focus:ring-brand-500 outline-none transition"
            />
          </div>

          {/* Hidden Verification Questions (if any specified by finder) */}
          {item.hiddenVerification && item.hiddenVerification.length > 0 && (
            <div className="p-4 rounded-2xl bg-brand-50/50 dark:bg-brand-950/30 border border-brand-200/60 dark:border-brand-900/60 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-brand-700 dark:text-brand-300">
                <AlertCircle className="w-4 h-4" />
                <span>Verification Questions from Finder</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                The person who found this item set the following questions. Please answer them to prove ownership:
              </p>
              {item.hiddenVerification.map((v, index) => (
                <div key={index}>
                  <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                    Q{index + 1}: {v.question}
                  </label>
                  <input
                    type="text"
                    required
                    value={answers[v.question] || ''}
                    onChange={(e) => handleAnswerChange(v.question, e.target.value)}
                    placeholder="Your answer..."
                    className="w-full text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-2.5 focus:ring-2 focus:ring-brand-500 outline-none transition"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Proof Images Upload */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Proof of Ownership (Optional)
            </label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 text-xs font-medium cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                <Upload className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                <span>Upload Photos / Receipts</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              {proofFiles.length > 0 && (
                <span className="text-xs text-brand-600 font-medium">
                  {proofFiles.length} file(s) selected
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 text-sm font-medium rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 text-sm font-medium rounded-xl bg-brand-600 hover:bg-brand-700 disabled:bg-brand-400 text-white transition shadow-sm"
            >
              {submitting ? 'Submitting...' : 'Submit Claim'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
