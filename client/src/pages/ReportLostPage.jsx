import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Upload, X, AlertCircle, Sparkles } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import DuplicateWarningBanner from '../components/items/DuplicateWarningBanner';

export default function ReportLostPage() {
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
  const [serialNumber, setSerialNumber] = useState('');
  const [uniqueFeatures, setUniqueFeatures] = useState('');
  const [dateLostOrFound, setDateLostOrFound] = useState(new Date().toISOString().split('T')[0]);
  const [approximateTime, setApproximateTime] = useState('');
  const [location, setLocation] = useState('');
  const [campusZone, setCampusZone] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [tags, setTags] = useState('');
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  // Load categories and locations
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

  // Debounced duplicate detection
  useEffect(() => {
    if (title.trim().length > 3) {
      const timer = setTimeout(() => {
        api
          .post('/items/check-duplicates', {
            title,
            description,
            category,
            type: 'lost',
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

  const currentSubcategories = categories.find((c) => c.name === category)?.subcategories || [];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      error('Please sign in to report an item.');
      navigate('/login');
      return;
    }

    if (!title || !description || !category || !campusZone || !location || !dateLostOrFound) {
      error('Please complete all required fields (*).');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('type', 'lost');
      formData.append('category', category);
      formData.append('subcategory', subcategory);
      formData.append('description', description);
      formData.append('brand', brand);
      formData.append('model', model);
      formData.append('color', color);
      formData.append('size', size);
      formData.append('serialNumber', serialNumber);
      formData.append('uniqueFeatures', uniqueFeatures);
      formData.append('dateLostOrFound', dateLostOrFound);
      formData.append('approximateTime', approximateTime);
      formData.append('location', location);
      formData.append('campusZone', campusZone);
      formData.append('isUrgent', String(isUrgent));
      formData.append('isAnonymous', String(isAnonymous));
      formData.append('tags', tags);

      images.forEach((file) => {
        formData.append('images', file);
      });

      const res = await api.post('/items', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      success('Lost item report posted successfully! Campus alerts have been notified.');
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
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs font-bold mb-2">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Lost Item Report</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 dark:text-slate-100">
          Report a Missing Item
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Provide detailed specifications so our automated campus engine can match with discovered items.
        </p>
      </div>

      {/* Duplicate detection warning */}
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
            placeholder="e.g. Blue Hydro Flask 32oz, MacBook Air M2, Black Leather Wallet..."
            className="w-full text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-3 focus:ring-2 focus:ring-brand-500 outline-none transition"
          />
        </div>

        {/* Category & Subcategory */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Category *
            </label>
            <select
              required
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setSubcategory('');
              }}
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
              Subcategory
            </label>
            <select
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
              className="w-full text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-3 focus:ring-2 focus:ring-brand-500 outline-none transition"
            >
              <option value="">Select subcategory...</option>
              {currentSubcategories.map((sc) => (
                <option key={sc} value={sc}>
                  {sc}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
            Detailed Description *
          </label>
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe where you think you lost it, contents, stickers, distinguishing marks, etc..."
            className="w-full text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-3 focus:ring-2 focus:ring-brand-500 outline-none transition leading-relaxed"
          />
        </div>

        {/* Physical Specs: Brand, Model, Color, Size */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Brand
            </label>
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="e.g. Apple, Nike"
              className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Model
            </label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="e.g. Air M2, fx-991"
              className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Color
            </label>
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="e.g. Space Gray, Blue"
              className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Size
            </label>
            <input
              type="text"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              placeholder="e.g. 13-inch, M, 32oz"
              className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>
        </div>

        {/* Unique Features & Serial */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Serial Number / IMEI (Private)
            </label>
            <input
              type="text"
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
              placeholder="Masked from public view"
              className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Distinctive Markings / Stickers
            </label>
            <input
              type="text"
              value={uniqueFeatures}
              onChange={(e) => setUniqueFeatures(e.target.value)}
              placeholder="e.g. GitHub sticker, scratch on corner"
              className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>
        </div>

        {/* Location & Zone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Campus Zone *
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
              Last Seen Location *
            </label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Library 2nd floor Table 14, Food Court Counter..."
              className="w-full text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-3 focus:ring-2 focus:ring-brand-500 outline-none transition"
            />
          </div>
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Date Lost *
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
              placeholder="e.g. Between 2 PM and 4 PM"
              className="w-full text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-3 focus:ring-2 focus:ring-brand-500 outline-none transition"
            />
          </div>
        </div>

        {/* Images Upload & Previews */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
            Upload Item Photos (Up to 5)
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
            placeholder="e.g. laptop, apple, electronics, blue"
            className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 focus:ring-2 focus:ring-brand-500 outline-none"
          />
        </div>

        {/* Checkbox Options */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isUrgent}
              onChange={(e) => setIsUrgent(e.target.checked)}
              className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
            />
            <div>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 block">
                ⚡ Mark as Urgent Item
              </span>
              <span className="text-[11px] text-slate-500">
                Highlights listing with emergency badge for essential items like keys, wallets, or inhalers.
              </span>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer pt-2 border-t border-slate-200 dark:border-slate-700/60">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
            />
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                👤 Post Anonymously
              </span>
              <span className="text-[11px] text-slate-500">
                Your name will be hidden from public view; only verified admins can see the poster identity.
              </span>
            </div>
          </label>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => navigate('/lost')}
            className="px-5 py-2.5 text-sm font-semibold rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white font-bold text-sm shadow-md shadow-rose-600/25 transition"
          >
            {submitting ? 'Publishing Report...' : 'Publish Lost Item Report'}
          </button>
        </div>
      </form>
    </div>
  );
}
