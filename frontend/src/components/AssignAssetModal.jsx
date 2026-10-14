import React, { useState } from 'react';
import { X, UserPlus, AlertCircle, Check } from 'lucide-react';
import { api } from '../services/api';

export default function AssignAssetModal({
  isOpen,
  onClose,
  onSuccess,
  bases = [],
  categories = [],
  currentUser
}) {
  const isCommander = currentUser?.role === 'commander';
  const defaultBaseId = isCommander ? currentUser?.baseId : (bases[0]?.id || '');

  const [formData, setFormData] = useState({
    baseId: defaultBaseId || '',
    categoryId: categories[0]?.id || '',
    assetName: 'M4A1 SOPMOD Carbine',
    personnelName: '',
    militaryId: '',
    rank: 'Sergeant (E-5)',
    unit: '1st Infantry Division - Recon Bravo',
    quantity: 1,
    issueDate: new Date().toISOString().split('T')[0],
    returnDueDate: '',
    notes: 'Standard combat readiness issue'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.personnelName.trim() || !formData.militaryId.trim()) {
      setError('Personnel name and military ID are required');
      return;
    }
    if (formData.quantity <= 0) {
      setError('Quantity must be at least 1');
      return;
    }

    try {
      setLoading(true);
      await api.assignAsset({
        baseId: formData.baseId || defaultBaseId,
        categoryId: formData.categoryId || categories[0]?.id,
        assetName: formData.assetName.trim(),
        personnelName: formData.personnelName.trim(),
        militaryId: formData.militaryId.trim(),
        rank: formData.rank,
        unit: formData.unit.trim(),
        quantity: Number(formData.quantity),
        issueDate: formData.issueDate,
        returnDueDate: formData.returnDueDate || undefined,
        notes: formData.notes.trim()
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to assign asset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-950 to-blue-900 px-6 py-4 text-white flex items-center justify-between border-b-2 border-red-600">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-600 rounded-lg text-white">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Assign Military Asset to Personnel</h3>
              <p className="text-xs text-blue-200">Deploy weapon, gear or vehicle to servicemember</p>
            </div>
          </div>
          <button onClick={onClose} className="text-blue-200 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Command Base *
              </label>
              <select
                value={formData.baseId}
                disabled={isCommander}
                onChange={(e) => setFormData({ ...formData, baseId: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none disabled:bg-slate-100"
              >
                {bases.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Equipment Category *
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Asset Name *
              </label>
              <input
                type="text"
                required
                value={formData.assetName}
                onChange={(e) => setFormData({ ...formData, assetName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Quantity *
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Servicemember Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Sgt. John Carter"
                value={formData.personnelName}
                onChange={(e) => setFormData({ ...formData, personnelName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Military ID / CAC # *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. MIL-78429"
                value={formData.militaryId}
                onChange={(e) => setFormData({ ...formData, militaryId: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Rank / Paygrade
              </label>
              <input
                type="text"
                value={formData.rank}
                onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Assigned Unit / Platoon
              </label>
              <input
                type="text"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Issue Date
              </label>
              <input
                type="date"
                value={formData.issueDate}
                onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Return Due Date (Optional)
              </label>
              <input
                type="date"
                value={formData.returnDueDate}
                onChange={(e) => setFormData({ ...formData, returnDueDate: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Mission Directives / Issue Notes
            </label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-blue-900 hover:bg-blue-950 text-white rounded-lg text-xs font-bold shadow-md hover:shadow-lg transition flex items-center space-x-2"
            >
              {loading ? (
                <span>Assigning...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Issue & Sign Custody Transfer</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
