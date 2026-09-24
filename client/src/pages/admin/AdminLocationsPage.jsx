import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Trash2 } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function AdminLocationsPage() {
  const { success, error } = useToast();

  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [zone, setZone] = useState('');
  const [building, setBuilding] = useState('');
  const [floor, setFloor] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchLocations = async () => {
    try {
      const res = await api.get('/admin/locations');
      setLocations(res.data.data.locations || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim() || !zone.trim()) return;

    setSubmitting(true);
    try {
      const res = await api.post('/admin/locations', {
        name: name.trim(),
        zone: zone.trim(),
        building: building.trim(),
        floor: floor.trim(),
      });

      setLocations((prev) => [...prev, res.data.data.location]);
      setName('');
      setZone('');
      setBuilding('');
      setFloor('');
      success('Campus location added!');
    } catch (err) {
      error('Failed to add campus location.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/locations/${id}`);
      setLocations((prev) => prev.filter((l) => l._id !== id));
      success('Location removed.');
    } catch (err) {
      error('Failed to remove location.');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16 max-w-4xl">
      <div>
        <h2 className="text-2xl font-display font-extrabold text-slate-900 dark:text-slate-100">
          Campus Location Management
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Configure designated campus zones, academic buildings, and security desks.
        </p>
      </div>

      {/* Add Location Form */}
      <form
        onSubmit={handleCreate}
        className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4"
      >
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
          Add New Campus Spot
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Location Name / Room *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Science Complex - Room 204"
              className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Campus Zone *
            </label>
            <input
              type="text"
              required
              value={zone}
              onChange={(e) => setZone(e.target.value)}
              placeholder="e.g. Science Complex, Central Library"
              className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Building Name
            </label>
            <input
              type="text"
              value={building}
              onChange={(e) => setBuilding(e.target.value)}
              placeholder="e.g. Hall of Sciences"
              className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Floor / Level
            </label>
            <input
              type="text"
              value={floor}
              onChange={(e) => setFloor(e.target.value)}
              placeholder="e.g. 2nd Floor"
              className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:bg-brand-400 text-white font-bold text-xs shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Location</span>
          </button>
        </div>
      </form>

      {/* Locations List */}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase font-bold">
              <tr>
                <th className="p-4">Location Name</th>
                <th className="p-4">Campus Zone</th>
                <th className="p-4">Building</th>
                <th className="p-4">Floor</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {locations.map((loc) => (
                <tr key={loc._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="p-4 font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-brand-500" />
                    <span>{loc.name}</span>
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-300">{loc.zone}</td>
                  <td className="p-4 text-slate-500">{loc.building || '—'}</td>
                  <td className="p-4 text-slate-500">{loc.floor || '—'}</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDelete(loc._id)}
                      className="p-1 rounded text-slate-400 hover:text-rose-600 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
