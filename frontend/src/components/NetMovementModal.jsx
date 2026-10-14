import React, { useState } from 'react';
import {
  X,
  TrendingUp,
  ShoppingCart,
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  Building2,
  Package,
  Layers
} from 'lucide-react';

export default function NetMovementModal({
  isOpen,
  onClose,
  breakdown,
  summary,
  filters
}) {
  const [activeTab, setActiveTab] = useState('purchases');

  if (!isOpen) return null;

  const purchases = breakdown?.purchases || [];
  const transfersIn = breakdown?.transfersIn || [];
  const transfersOut = breakdown?.transfersOut || [];

  const totalPurchasesQty = purchases.reduce((acc, p) => acc + (p.quantity || 0), 0);
  const totalTransfersInQty = transfersIn.reduce((acc, t) => acc + (t.quantity || 0), 0);
  const totalTransfersOutQty = transfersOut.reduce((acc, t) => acc + (t.quantity || 0), 0);
  const calculatedNet = totalPurchasesQty + totalTransfersInQty - totalTransfersOutQty;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-slate-900 px-6 py-5 text-white flex items-center justify-between border-b-2 border-red-600">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-red-600 rounded-xl text-white shadow-md">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-white">Net Movement Ledger Breakdown</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-red-600/90 text-white px-2 py-0.5 rounded">
                  Bonus Feature
                </span>
              </div>
              <p className="text-xs text-blue-200">
                Formula: <span className="font-mono text-white">Purchases (+) + Transfers In (+) - Transfers Out (-)</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-blue-200 hover:text-white hover:bg-white/10 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Summary Metric Ribbon */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Purchases (+)</span>
            <div className="text-xl font-black text-blue-700">+{totalPurchasesQty.toLocaleString()}</div>
            <div className="text-[10px] text-slate-500">{purchases.length} transactions</div>
          </div>

          <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Transfers In (+)</span>
            <div className="text-xl font-black text-emerald-600">+{totalTransfersInQty.toLocaleString()}</div>
            <div className="text-[10px] text-slate-500">{transfersIn.length} movements</div>
          </div>

          <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Transfers Out (-)</span>
            <div className="text-xl font-black text-red-600">-{totalTransfersOutQty.toLocaleString()}</div>
            <div className="text-[10px] text-slate-500">{transfersOut.length} dispatched</div>
          </div>

          <div className="bg-blue-900 p-3 rounded-lg border border-blue-950 shadow-sm text-white">
            <span className="text-[11px] font-semibold text-blue-200 uppercase">Calculated Net</span>
            <div className={`text-xl font-black ${calculatedNet >= 0 ? 'text-white' : 'text-red-300'}`}>
              {calculatedNet >= 0 ? `+${calculatedNet.toLocaleString()}` : calculatedNet.toLocaleString()}
            </div>
            <div className="text-[10px] text-blue-200">Across Selected Scope</div>
          </div>
        </div>

        {/* Filter Indicator */}
        {(filters?.baseId || filters?.categoryId || filters?.startDate || filters?.endDate) && (
          <div className="px-6 py-2 bg-blue-50/60 border-b border-blue-100 flex items-center gap-2 text-xs text-blue-800">
            <span className="font-semibold">Filtered Scope:</span>
            {filters?.baseId && <span className="bg-white px-2 py-0.5 rounded border border-blue-200 font-mono">Base: {filters.baseId}</span>}
            {filters?.categoryId && <span className="bg-white px-2 py-0.5 rounded border border-blue-200 font-mono">Category: {filters.categoryId}</span>}
            {filters?.startDate && <span className="bg-white px-2 py-0.5 rounded border border-blue-200 font-mono">From: {filters.startDate}</span>}
            {filters?.endDate && <span className="bg-white px-2 py-0.5 rounded border border-blue-200 font-mono">To: {filters.endDate}</span>}
          </div>
        )}

        {/* Tab Buttons */}
        <div className="flex border-b border-slate-200 px-6 pt-3 space-x-2 bg-slate-50">
          <button
            onClick={() => setActiveTab('purchases')}
            className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold rounded-t-lg transition border-b-2 ${
              activeTab === 'purchases'
                ? 'border-blue-600 text-blue-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShoppingCart className="w-4 h-4 text-blue-600" />
            <span>Purchases ({purchases.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('transfersIn')}
            className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold rounded-t-lg transition border-b-2 ${
              activeTab === 'transfersIn'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
            <span>Transfers In ({transfersIn.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('transfersOut')}
            className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold rounded-t-lg transition border-b-2 ${
              activeTab === 'transfersOut'
                ? 'border-red-600 text-red-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowUpRight className="w-4 h-4 text-red-600" />
            <span>Transfers Out ({transfersOut.length})</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {activeTab === 'purchases' && (
            <div>
              {purchases.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">
                  No purchases found for the selected filter criteria.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase bg-slate-50">
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Order #</th>
                        <th className="py-2.5 px-3">Base</th>
                        <th className="py-2.5 px-3">Asset Name</th>
                        <th className="py-2.5 px-3">Qty</th>
                        <th className="py-2.5 px-3">Supplier</th>
                        <th className="py-2.5 px-3 text-right">Cost</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {purchases.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/80">
                          <td className="py-2 px-3 font-mono text-slate-600">{p.purchaseDate || p.purchase_date}</td>
                          <td className="py-2 px-3 font-semibold text-blue-700">{p.purchaseOrder || p.purchase_order}</td>
                          <td className="py-2 px-3 text-slate-800">{p.baseName || p.base_name || p.baseId}</td>
                          <td className="py-2 px-3 font-medium text-slate-900">{p.assetName || p.asset_name}</td>
                          <td className="py-2 px-3 font-black text-blue-600">+{p.quantity}</td>
                          <td className="py-2 px-3 text-slate-600">{p.supplier}</td>
                          <td className="py-2 px-3 text-right font-mono text-slate-700">
                            ${((p.totalCost || p.total_cost || 0)).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'transfersIn' && (
            <div>
              {transfersIn.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">
                  No incoming transfers recorded for this filter criteria.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase bg-slate-50">
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Tracking #</th>
                        <th className="py-2.5 px-3">Origin Base</th>
                        <th className="py-2.5 px-3">Destination Base</th>
                        <th className="py-2.5 px-3">Asset</th>
                        <th className="py-2.5 px-3">Qty</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {transfersIn.map((t) => (
                        <tr key={t.id} className="hover:bg-slate-50/80">
                          <td className="py-2 px-3 font-mono text-slate-600">{t.transferDate || t.transfer_date}</td>
                          <td className="py-2 px-3 font-semibold text-emerald-700">{t.trackingNumber || t.tracking_number}</td>
                          <td className="py-2 px-3 text-slate-600">{t.originBaseName || t.origin_base_name || t.originBaseId}</td>
                          <td className="py-2 px-3 font-medium text-slate-900">{t.destinationBaseName || t.destination_base_name || t.destinationBaseId}</td>
                          <td className="py-2 px-3 text-slate-900">{t.assetName || t.asset_name}</td>
                          <td className="py-2 px-3 font-black text-emerald-600">+{t.quantity}</td>
                          <td className="py-2 px-3">
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold">
                              {t.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'transfersOut' && (
            <div>
              {transfersOut.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">
                  No outgoing transfers dispatched for this filter criteria.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase bg-slate-50">
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Tracking #</th>
                        <th className="py-2.5 px-3">Dispatched From</th>
                        <th className="py-2.5 px-3">Dispatched To</th>
                        <th className="py-2.5 px-3">Asset</th>
                        <th className="py-2.5 px-3">Qty</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {transfersOut.map((t) => (
                        <tr key={t.id} className="hover:bg-slate-50/80">
                          <td className="py-2 px-3 font-mono text-slate-600">{t.transferDate || t.transfer_date}</td>
                          <td className="py-2 px-3 font-semibold text-red-700">{t.trackingNumber || t.tracking_number}</td>
                          <td className="py-2 px-3 text-slate-600">{t.originBaseName || t.origin_base_name || t.originBaseId}</td>
                          <td className="py-2 px-3 font-medium text-slate-900">{t.destinationBaseName || t.destination_base_name || t.destinationBaseId}</td>
                          <td className="py-2 px-3 text-slate-900">{t.assetName || t.asset_name}</td>
                          <td className="py-2 px-3 font-black text-red-600">-{t.quantity}</td>
                          <td className="py-2 px-3">
                            <span className="bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded text-[10px] font-bold">
                              {t.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Real-time audit verifiable from relational ledger.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white font-semibold text-xs rounded-lg shadow-sm transition"
          >
            Close View
          </button>
        </div>
      </div>
    </div>
  );
}
