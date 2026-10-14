import React, { useState } from 'react';
import { X, ArrowLeftRight, AlertCircle, Check } from 'lucide-react';
import { api } from '../services/api';

export default function InitiateTransferModal({
  isOpen,
  onClose,
  onSuccess,
  bases = [],
  categories = [],
  currentUser
}) {
  const isCommander = currentUser?.role === 'commander';
  const defaultOrigin = isCommander ? currentUser?.baseId : (bases[0]?.id || '');
  const defaultDest = bases.find((b) => b.id !== defaultOrigin)?.id || (bases[1]?.id || '');

  const [formData, setFormData] = useState({
    originBaseId: defaultOrigin || '',
    destinationBaseId: defaultDest || '',
    categoryId: categories[0]?.id || '',
    assetName: 'M4A1 SOPMOD Carbine',
    quantity: 5,
    transportMode: 'Tactical Convoy Ground Transport',
    transferDate: new Date().toISOString().split('T')[0],
    notes: 'Strategic inter-base logistics reallocation'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.originBaseId === formData.destinationBaseId) {
      setError('Origin and Destination bases must be different');
      return;
    }
    if (formData.quantity <= 0) {
      setError('Quantity must be greater than zero');
      return;
    }

    try {
      setLoading(true);
      await api.initiateTransfer({
        originBaseId: formData.originBaseId,
        destinationBaseId: formData.destinationBaseId,
        categoryId: formData.categoryId || categories[0]?.id,
        assetName: formData.assetName.trim(),
        quantity: Number(formData.quantity),
        transportMode: formData.transportMode,
        transferDate: formData.transferDate,
        notes: formData.notes.trim()
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to dispatch transfer');
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
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Initiate Inter-Base Asset Transfer</h3>
              <p className="text-xs text-blue-200">Reallocate critical assets with cryptographic tracking</p>
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
            {/* Origin Base */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Origin Base (Dispatched From) *
              </label>
              <select
                value={formData.originBaseId}
                disabled={isCommander}
                onChange={(e) => setFormData({ ...formData, originBaseId: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none disabled:bg-slate-100"
              >
                {bases.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Destination Base */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Destination Base (Receiving) *
              </label>
              <select
                value={formData.destinationBaseId}
                onChange={(e) => setFormData({ ...formData, destinationBaseId: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              >
                {bases.map((b) => (
                  <option key={b.id} value={b.id} disabled={b.id === formData.originBaseId}>
                    {b.name} ({b.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            {/* Quantity */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Quantity to Transfer *
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
          </div>

          {/* Asset Name */}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Transport Mode
              </label>
              <select
                value={formData.transportMode}
                onChange={(e) => setFormData({ ...formData, transportMode: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              >
                <option value="Tactical Convoy Ground Transport">Tactical Convoy Ground Transport</option>
                <option value="C-17 Globemaster Strategic Airlift">C-17 Globemaster Strategic Airlift</option>
                <option value="Armored Heavy Rail Transit">Armored Heavy Rail Transit</option>
                <option value="Naval Support Tender Cargo">Naval Support Tender Cargo</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Transfer Date
              </label>
              <input
                type="date"
                value={formData.transferDate}
                onChange={(e) => setFormData({ ...formData, transferDate: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Transfer Mission Directive / Notes
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
                <span>Dispatching...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Dispatch & Update Ledger</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
