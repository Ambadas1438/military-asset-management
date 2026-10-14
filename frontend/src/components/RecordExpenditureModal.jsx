import React, { useState } from 'react';
import { X, Flame, AlertCircle, Check } from 'lucide-react';
import { api } from '../services/api';

export default function RecordExpenditureModal({
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
    categoryId: categories.find((c) => c.id === 'ammunition')?.id || categories[0]?.id || '',
    assetName: '5.56x45mm NATO Ball Rounds',
    quantity: 500,
    expenditureType: 'LIVE_FIRE_EXERCISE',
    expenditureDate: new Date().toISOString().split('T')[0],
    missionRef: 'OPERATION-IRON-SENTINEL',
    afterActionReport: 'Tactical qualification fire completed without casualty or misfire.'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.assetName.trim() || !formData.missionRef.trim()) {
      setError('Asset name and mission reference are required');
      return;
    }
    if (formData.quantity <= 0) {
      setError('Expended quantity must be greater than zero');
      return;
    }

    try {
      setLoading(true);
      await api.recordExpenditure({
        baseId: formData.baseId || defaultBaseId,
        categoryId: formData.categoryId,
        assetName: formData.assetName.trim(),
        quantity: Number(formData.quantity),
        expenditureType: formData.expenditureType,
        expenditureDate: formData.expenditureDate,
        missionRef: formData.missionRef.trim(),
        afterActionReport: formData.afterActionReport.trim()
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to record expenditure');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-900 via-red-800 to-slate-900 px-6 py-4 text-white flex items-center justify-between border-b-2 border-red-600">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-600 rounded-lg text-white">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Record Military Asset Expenditure</h3>
              <p className="text-xs text-red-200">Audit consumption: live-fire, combat, maintenance write-off</p>
            </div>
          </div>
          <button onClick={onClose} className="text-red-200 hover:text-white transition">
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
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-red-600 focus:outline-none disabled:bg-slate-100"
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
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-red-600 focus:outline-none"
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
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-red-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Quantity Expended *
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-red-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Expenditure Classification *
              </label>
              <select
                value={formData.expenditureType}
                onChange={(e) => setFormData({ ...formData, expenditureType: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-red-600 focus:outline-none"
              >
                <option value="LIVE_FIRE_EXERCISE">Live Fire Training Exercise</option>
                <option value="OPERATIONAL_MISSION">Combat / Operational Mission</option>
                <option value="MAINTENANCE_CONSUMED">Maintenance Component Consumed</option>
                <option value="DECOMMISSIONED_WRITEOFF">Decommissioned Write-off</option>
                <option value="DAMAGED_IN_ACTION">Damaged Beyond Repair in Action</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Expenditure Date
              </label>
              <input
                type="date"
                value={formData.expenditureDate}
                onChange={(e) => setFormData({ ...formData, expenditureDate: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-red-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Mission Reference / Order Directive *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. OP-DESERT-VANGUARD-04"
              value={formData.missionRef}
              onChange={(e) => setFormData({ ...formData, missionRef: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-red-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              After Action Report (AAR) Summary
            </label>
            <textarea
              rows={2}
              value={formData.afterActionReport}
              onChange={(e) => setFormData({ ...formData, afterActionReport: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-red-600 focus:outline-none"
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
              className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow-md hover:shadow-lg transition flex items-center space-x-2"
            >
              {loading ? (
                <span>Writing Off...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Verify & Write Off Expended Asset</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
