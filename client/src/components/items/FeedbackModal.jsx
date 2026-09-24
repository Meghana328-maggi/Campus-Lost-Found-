import React, { useState } from 'react';
import { X, Star, HeartHandshake } from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function FeedbackModal({ isOpen, onClose, item, onFeedbackSubmitted }) {
  const { success, error } = useToast();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [experienceTag, setExperienceTag] = useState('trustworthy_finder');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !item) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      error('Please write a brief comment about your recovery experience.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/feedback', {
        itemId: item._id,
        rating,
        comment,
        experienceTag,
      });

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      success('Thank you for rating your recovery experience!');
      if (onFeedbackSubmitted) onFeedbackSubmitted();
      onClose();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to submit feedback.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative text-center">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
          <HeartHandshake className="w-7 h-7" />
        </div>

        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Recovery Feedback</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
          How was your experience returning or recovering <span className="font-semibold text-slate-700 dark:text-slate-300">"{item.title}"</span>?
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {/* Star rating selector */}
          <div className="flex flex-col items-center justify-center gap-2 py-2">
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="p-1 transition-transform hover:scale-125 focus:outline-none"
                >
                  <Star
                    className={`w-8 h-8 ${
                      (hoverRating || rating) >= star
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-300 dark:text-slate-700'
                    }`}
                  />
                </button>
              ))}
            </div>
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
              {rating === 5 ? 'Exceptional Handover' : rating === 4 ? 'Great Experience' : rating === 3 ? 'Average' : 'Could be better'}
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Experience Highlight
            </label>
            <select
              value={experienceTag}
              onChange={(e) => setExperienceTag(e.target.value)}
              className="w-full text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 focus:ring-2 focus:ring-brand-500 outline-none transition"
            >
              <option value="trustworthy_finder">Trustworthy & Honest Finder</option>
              <option value="fast_and_easy">Fast & Easy Coordination</option>
              <option value="good_communication">Clear & Friendly Communication</option>
              <option value="smooth_handover">Smooth Campus Handover</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Your Review / Message *
            </label>
            <textarea
              required
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Leave a thank you message or note for the community..."
              className="w-full text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-3 focus:ring-2 focus:ring-brand-500 outline-none transition"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Skip
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-sm font-medium rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white transition shadow-sm"
            >
              {submitting ? 'Submitting...' : 'Post Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
