import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Upload, X, CheckCircle2, ShieldCheck, Plus, Trash2 } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import DuplicateWarningBanner from '../components/items/DuplicateWarningBanner';

export default function ReportFoundPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { success, error } = useToast();

  const [categories, setCategories] = useState([]);
  const [campusZones, setCampusZones] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [duplicates, setDuplicates] = useState([]);

  // Form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [description, setDescription] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [color, setColor] = useState('');
  const [size, setSize] = useState('');
  const [condition, setCondition] = useState('good');
  const [currentStorageLocation, setCurrentStorageLocation] = useState('');
  const [dateLostOrFound, setDateLostOrFound] = useState(new Date().toISOString().split('T')[0]);
  const [approximateTime, setApproximateTime] = useState('');
  const [location, setLocation] = useState('');
  const [campusZone, setCampusZone] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [tags, setTags] = useState('');
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  // Hidden verification questions
  const [hiddenQuestions, setHiddenQuestions] = useState([
    { question: '', answer: '' },
  ]);

  useEffect(() => {
    Promise.all([api.get('/admin/categories'), api.get('/admin/locations')])
      .then(([catRes, locRes]) => {
        const cats = catRes.data.data.categories || [];
        setCategories(cats);
        if (cats.length > 0) setCategory(cats[0].name);

        const zones = Array.from(new Set((locRes.data.data.locations || []).map((l) => l.zone)));
        setCampusZones(zones);
        if (zones.length > 0) setCampusZone(zones[0]);
      })
      .catch((err) => console.error(err));
  }, []);

  // Duplicate detection
  useEffect(() => {
    if (title.trim().length > 3) {
      const timer = setTimeout(() => {
        api
          .post('/items/check-duplicates', {
            title,
            description,
            category,
            type: 'found',
            campusZone,
          })
          .then((res) => {
            setDuplicates(res.data.data.duplicates || []);
          })
          .catch(() => {});
      }, 500);

      return () => clearTimeout(timer);
    } else {
      setDuplicates([]);
    }
  }, [title, category, campusZone]);

  const handleImageChange = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setImages((prev) => [...prev, ...filesArray]);

      const previews = filesArray.map((file) => URL.createObjectURL(file));
      setImagePreviews((prev) => [...prev, ...previews]);
    }
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const addQuestionField = () => {
    setHiddenQuestions((prev) => [...prev, { question: '', answer: '' }]);
  };

  const updateQuestionField = (index, field, value) => {
    setHiddenQuestions((prev) => {
      const next = [...prev];
      next[index][field] = value;
      return next;
    });
  };

  const removeQuestionField = (index) => {
    setHiddenQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      error('Please sign in to report a found item.');
      navigate('/login');
      return;
    }

    if (!title || !description || !category || !campusZone || !location || !dateLostOrFound) {
      error('Please complete all required fields (*).');
      return;
    }

    // Filter valid hidden questions
    const validQuestions = hiddenQuestions.filter((q) => q.question.trim() && q.answer.trim());

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('type', 'found');
      formData.append('category', category);
      formData.append('subcategory', subcategory);
      formData.append('description', description);
      formData.append('brand', brand);
      formData.append('model', model);
      formData.append('color', color);
      formData.append('size', size);
      formData.append('condition', condition);
      formData.append('currentStorageLocation', currentStorageLocation);
      formData.append('dateLostOrFound', dateLostOrFound);
      formData.append('approximateTime', approximateTime);
      formData.append('location', location);
      formData.append('campusZone', campusZone);
      formData.append('isUrgent', String(isUrgent));
      formData.append('isAnonymous', String(isAnonymous));
      formData.append('tags', tags);

      if (validQuestions.length > 0) {
        formData.append('hiddenVerification', JSON.stringify(validQuestions));
      }

      images.forEach((file) => {
        formData.append('images', file);
      });

      const res = await api.post('/items', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      success('Found item report published! Thank you for helping our campus community.');
      navigate(`/items/${res.data.data.item._id}`);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to submit report.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-16">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold mb-2">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Found Item Report</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 dark:text-slate-100">
          Turn In / Report a Found Item
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Help return a lost belonging by providing key details and private verification questions.
        </p>
      </div>

      <DuplicateWarningBanner duplicates={duplicates} />

      <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-6">
        {/* Title */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
            Item Name / Title *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Sony WH-1000XM4 Headphones, Bi-fold Wallet, Car Keys with Lanyard..."
            className="w-full text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-3 focus:ring-2 focus:ring-brand-500 outline-none transition"
          />
        </div>

        {/* Category & Condition */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Category *
            </label>
            <select
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-3 focus:ring-2 focus:ring-brand-500 outline-none transition"
            >
              {categories.map((c) => (
                <option key={c._id || c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Condition
            </label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="w-full text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-3 focus:ring-2 focus:ring-brand-500 outline-none transition"
            >
              <option value="brand_new">Brand New / Mint</option>
              <option value="good">Good Condition</option>
              <option value="fair">Fair / Used</option>
              <option value="worn">Worn</option>
              <option value="damaged">Damaged / Broken Screen</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
            Description *
          </label>
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Do NOT expose secret identifying marks publicly — save those for the private verification questions below!"
            className="w-full text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-3 focus:ring-2 focus:ring-brand-500 outline-none transition leading-relaxed"
          />
        </div>

        {/* Specs: Brand, Model, Color, Size */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Brand</label>
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="e.g. Sony, Casio"
              className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Model</label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="e.g. WH-1000XM4"
              className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Color</label>
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="e.g. Black, Brown"
              className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Size</label>
            <input
              type="text"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              placeholder="e.g. Large, 32oz"
              className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>
        </div>

        {/* Location & Storage */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Found Campus Zone *
            </label>
            <select
              required
              value={campusZone}
              onChange={(e) => setCampusZone(e.target.value)}
              className="w-full text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-3 focus:ring-2 focus:ring-brand-500 outline-none transition"
            >
              {campusZones.map((z) => (
                <option key={z} value={z}>
                  {z}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Exact Location Found *
            </label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Under bench at SAC Gym, Library 2nd floor desk..."
              className="w-full text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-3 focus:ring-2 focus:ring-brand-500 outline-none transition"
            />
          </div>
        </div>

        {/* Current Physical Storage Location */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
            Current Physical Storage Location (Where can owner find it?)
          </label>
          <input
            type="text"
            value={currentStorageLocation}
            onChange={(e) => setCurrentStorageLocation(e.target.value)}
            placeholder="e.g. Deposited at Library Circulation Security Desk, Locker #4, or with Finder"
            className="w-full text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-3 focus:ring-2 focus:ring-brand-500 outline-none transition"
          />
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Date Found *
            </label>
            <input
              type="date"
              required
              value={dateLostOrFound}
              onChange={(e) => setDateLostOrFound(e.target.value)}
              className="w-full text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-3 focus:ring-2 focus:ring-brand-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Approximate Time
            </label>
            <input
              type="text"
              value={approximateTime}
              onChange={(e) => setApproximateTime(e.target.value)}
              placeholder="e.g. Around 1:30 PM"
              className="w-full text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-3 focus:ring-2 focus:ring-brand-500 outline-none transition"
            />
          </div>
        </div>

        {/* Hidden Verification Section */}
        <div className="p-5 rounded-2xl bg-brand-50/60 dark:bg-brand-950/30 border border-brand-200/80 dark:border-brand-900/80 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-brand-600 dark:text-brand-400" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-brand-900 dark:text-brand-200">
                  Hidden Verification Questions (Fraud Prevention)
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Define private details that only the true owner would know. Answers are strictly hidden from the public!
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={addQuestionField}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Question</span>
            </button>
          </div>

          <div className="space-y-3">
            {hiddenQuestions.map((q, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-brand-100 dark:border-brand-900/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Question #{idx + 1}
                  </span>
                  {hiddenQuestions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuestionField(idx)}
                      className="text-slate-400 hover:text-rose-500 p-1 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={q.question}
                  onChange={(e) => updateQuestionField(idx, 'question', e.target.value)}
                  placeholder="e.g. What picture is on the phone wallpaper? / What card is in front slot?"
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 focus:ring-2 focus:ring-brand-500 outline-none"
                />
                <input
                  type="text"
                  value={q.answer}
                  onChange={(e) => updateQuestionField(idx, 'answer', e.target.value)}
                  placeholder="Secret expected answer (only you see this to verify claims)"
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Photos */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
            Upload Item Photos
          </label>
          <div className="flex flex-wrap gap-3 items-center">
            <label className="flex flex-col items-center justify-center w-28 h-28 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-brand-500 bg-slate-50 dark:bg-slate-800/60 cursor-pointer transition">
              <Upload className="w-6 h-6 text-slate-400 mb-1" />
              <span className="text-[11px] font-semibold text-slate-500">Add Photo</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>

            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative w-28 h-28 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xs">
                <img src={preview} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 p-1 rounded-full bg-slate-900/80 text-white hover:bg-rose-600 transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Tags (comma separated)
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="e.g. headphones, audio, gym, black"
            className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 focus:ring-2 focus:ring-brand-500 outline-none"
          />
        </div>

        {/* Anonymous */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
            />
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                👤 Report as Anonymous Finder
              </span>
              <span className="text-[11px] text-slate-500">
                Keeps your identity anonymous on the public card; communication remains protected.
              </span>
            </div>
          </label>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => navigate('/found')}
            className="px-5 py-2.5 text-sm font-semibold rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold text-sm shadow-md shadow-emerald-600/25 transition"
          >
            {submitting ? 'Publishing Report...' : 'Publish Found Item Report'}
          </button>
        </div>
      </form>
    </div>
  );
}
