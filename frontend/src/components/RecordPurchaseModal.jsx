import React, { useState } from 'react';
import { X, ShoppingCart, AlertCircle, Check } from 'lucide-react';
import { api } from '../services/api';

export default function RecordPurchaseModal({
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
    assetName: '',
    serialOrBatch: '',
    quantity: 10,
    unitCost: 1500,
    supplier: 'Defense Logistics Agency',
    purchaseDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const totalCost = (Number(formData.quantity) || 0) * (Number(formData.unitCost) || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.assetName.trim()) {
      setError('Please provide an asset name');
      return;
    }
    if (formData.quantity <= 0) {
      setError('Quantity must be greater than zero');
      return;
    }

    try {
      setLoading(true);
      await api.recordPurchase({
        baseId: formData.baseId || defaultBaseId,
        categoryId: formData.categoryId || categories[0]?.id,
        assetName: formData.assetName.trim(),
        serialOrBatch: formData.serialOrBatch.trim(),
        quantity: Number(formData.quantity),
        unitCost: Number(formData.unitCost),
        supplier: formData.supplier.trim(),
        purchaseDate: formData.purchaseDate,
        notes: formData.notes.trim()
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to record purchase');
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
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Record Military Asset Purchase</h3>
              <p className="text-xs text-blue-200">Procure & increment base balance</p>
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
            {/* Target Base */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Target Military Base *
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
              {isCommander && (
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Locked to your command base.
                </span>
              )}
            </div>

            {/* Category */}
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

          {/* Asset Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Asset / Weapon / Vehicle Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., M4A1 SOPMOD Carbine, JLTV Tactical Vehicle"
              value={formData.assetName}
              onChange={(e) => setFormData({ ...formData, assetName: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Quantity *
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Unit Cost ($)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.unitCost}
                onChange={(e) => setFormData({ ...formData, unitCost: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Total Value
              </label>
              <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-xs font-bold text-blue-900">
                ${totalCost.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Supplier / Defense Contractor
              </label>
              <input
                type="text"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Purchase Date
              </label>
              <input
                type="date"
                value={formData.purchaseDate}
                onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Serial / Batch # (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. BATCH-2026-X99"
              value={formData.serialOrBatch}
              onChange={(e) => setFormData({ ...formData, serialOrBatch: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Procurement Notes
            </label>
            <textarea
              rows={2}
              placeholder="Contract notes, deployment priority, justification..."
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
                <span>Recording...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Authorize & Record Purchase</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
