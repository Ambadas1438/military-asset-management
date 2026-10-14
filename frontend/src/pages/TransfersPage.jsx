import React, { useState, useEffect } from 'react';
import {
  ArrowLeftRight,
  Plus,
  Filter,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  Building2,
  RefreshCw,
  Send
} from 'lucide-react';
import InitiateTransferModal from '../components/InitiateTransferModal';
import { api } from '../services/api';

export default function TransfersPage({ currentUser, bases = [], categories = [] }) {
  const isCommander = currentUser?.role === 'commander';
  const defaultBaseId = isCommander ? currentUser?.baseId : '';

  const [filters, setFilters] = useState({
    baseId: defaultBaseId || '',
    categoryId: '',
    status: '',
    startDate: '',
    endDate: '',
    search: '',
  });

  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  useEffect(() => {
    if (isCommander && currentUser?.baseId) {
      setFilters((prev) => ({ ...prev, baseId: currentUser.baseId }));
    }
  }, [currentUser]);

  const fetchTransfers = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.getTransfers(filters);
      setTransfers(data.transfers || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch transfers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransfers();
  }, [filters]);

  const handleReceiveTransfer = async (transferId) => {
    try {
      setActionLoadingId(transferId);
      await api.receiveTransfer(transferId);
      fetchTransfers();
    } catch (err) {
      alert(err.message || 'Failed to mark transfer received');
    } finally {
      setActionLoadingId(null);
    }
  };

  const completedCount = transfers.filter((t) => t.status === 'COMPLETED').length;
  const inTransitCount = transfers.filter((t) => t.status === 'IN_TRANSIT').length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
            Logistics & Inter-Base Relocation
          </span>
          <h1 className="text-2xl font-black text-blue-950 mt-2">
            Asset Transfers & Movements
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Coordinate tactical transport convoys between military bases with real-time custody verification.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 px-5 py-2.5 bg-blue-900 hover:bg-blue-950 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition"
        >
          <Plus className="w-4 h-4" />
          <span>Initiate Base Transfer</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-blue-600">
          <span className="text-xs font-bold uppercase text-slate-500">Total Transfers Logged</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{transfers.length} Convoys</div>
          <span className="text-[11px] text-slate-500">Historical records</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-amber-500">
          <span className="text-xs font-bold uppercase text-slate-500">In Transit (Active Logistics)</span>
          <div className="text-2xl font-black text-amber-600 mt-1">{inTransitCount} En Route</div>
          <span className="text-[11px] text-slate-500">Awaiting receiving base check-in</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-emerald-600">
          <span className="text-xs font-bold uppercase text-slate-500">Delivered & Verified</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">{completedCount} Received</div>
          <span className="text-[11px] text-slate-500">Stock transferred successfully</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
            <Filter className="w-4 h-4 text-blue-600" />
            <span>Filter Base Relocations</span>
          </div>
          {(filters.startDate || filters.endDate || (!isCommander && filters.baseId) || filters.categoryId || filters.status || filters.search) && (
            <button
              onClick={() =>
                setFilters({
                  baseId: isCommander ? currentUser?.baseId : '',
                  categoryId: '',
                  status: '',
                  startDate: '',
                  endDate: '',
                  search: '',
                })
              }
              className="text-[11px] font-semibold text-red-600 hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Base Scope
            </label>
            <select
              value={filters.baseId}
              disabled={isCommander}
              onChange={(e) => setFilters({ ...filters, baseId: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none disabled:bg-slate-100"
            >
              {!isCommander && <option value="">All Bases (Global Fleet)</option>}
              {bases.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Transfer Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="COMPLETED">Completed / Received</option>
              <option value="IN_TRANSIT">In Transit</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Equipment Category
            </label>
            <select
              value={filters.categoryId}
              onChange={(e) => setFilters({ ...filters, categoryId: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              From Date
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Search Tracking #
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="TRF-..., weapon..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-8 pr-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Transfer History Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Inter-Base Transfer Ledger
            </h3>
            <p className="text-xs text-slate-500">
              Complete dispatch-and-receive audit history with timestamps and status
            </p>
          </div>
          <button
            onClick={fetchTransfers}
            className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 uppercase font-bold border-b border-slate-200">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Tracking #</th>
                <th className="py-3 px-4">Origin Base</th>
                <th className="py-3 px-4">Destination Base</th>
                <th className="py-3 px-4">Asset Name</th>
                <th className="py-3 px-4 text-right">Quantity</th>
                <th className="py-3 px-4">Transport Mode</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transfers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-400">
                    No transfers match the selected filters.
                  </td>
                </tr>
              ) : (
                transfers.map((t) => (
                  <tr key={t.id} className="hover:bg-blue-50/40 transition">
                    <td className="py-2.5 px-4 font-mono text-slate-600 whitespace-nowrap">
                      {t.transferDate || t.transfer_date}
                    </td>
                    <td className="py-2.5 px-4 font-bold text-blue-700 whitespace-nowrap">
                      {t.trackingNumber || t.tracking_number}
                    </td>
                    <td className="py-2.5 px-4 text-red-700 font-semibold">
                      {t.originBaseName || t.origin_base_name || t.originBaseId}
                    </td>
                    <td className="py-2.5 px-4 text-emerald-700 font-semibold">
                      {t.destinationBaseName || t.destination_base_name || t.destinationBaseId}
                    </td>
                    <td className="py-2.5 px-4 font-bold text-slate-900">
                      {t.assetName || t.asset_name}
                    </td>
                    <td className="py-2.5 px-4 text-right font-black text-blue-700">
                      {t.quantity}
                    </td>
                    <td className="py-2.5 px-4 text-slate-600">
                      <span className="inline-flex items-center gap-1 text-[11px]">
                        <Truck className="w-3.5 h-3.5 text-slate-400" />
                        {t.transportMode || 'Ground Transport'}
                      </span>
                    </td>
                    <td className="py-2.5 px-4">
                      {t.status === 'COMPLETED' ? (
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Received
                        </span>
                      ) : (
                        <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded text-[10px] font-bold inline-flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-600" /> In Transit
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      {t.status === 'IN_TRANSIT' && (
                        <button
                          onClick={() => handleReceiveTransfer(t.id)}
                          disabled={actionLoadingId === t.id}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold shadow-sm transition"
                        >
                          {actionLoadingId === t.id ? 'Accepting...' : 'Receive Check-in'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <InitiateTransferModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchTransfers}
        bases={bases}
        categories={categories}
        currentUser={currentUser}
      />
    </div>
  );
}
