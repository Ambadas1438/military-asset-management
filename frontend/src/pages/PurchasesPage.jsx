import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Plus,
  Filter,
  Search,
  Calendar,
  Building2,
  RefreshCw,
  DollarSign,
  FileText
} from 'lucide-react';
import RecordPurchaseModal from '../components/RecordPurchaseModal';
import { api } from '../services/api';

export default function PurchasesPage({ currentUser, bases = [], categories = [] }) {
  const isCommander = currentUser?.role === 'commander';
  const defaultBaseId = isCommander ? currentUser?.baseId : '';

  const [filters, setFilters] = useState({
    baseId: defaultBaseId || '',
    categoryId: '',
    startDate: '',
    endDate: '',
    search: '',
  });

  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);

  useEffect(() => {
    if (isCommander && currentUser?.baseId) {
      setFilters((prev) => ({ ...prev, baseId: currentUser.baseId }));
    }
  }, [currentUser]);

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.getPurchases(filters);
      setPurchases(data.purchases || []);
    } catch (err) {
      setError(err.message || 'Failed to load purchase records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, [filters]);

  const totalCostSum = purchases.reduce((sum, p) => sum + (p.totalCost || p.total_cost || 0), 0);
  const totalQuantitySum = purchases.reduce((sum, p) => sum + (p.quantity || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
            Procurement & Inflow Ledger
          </span>
          <h1 className="text-2xl font-black text-blue-950 mt-2">
            Asset Purchases & Acquisitions
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Record newly procured military equipment and track historical deliveries with full audit trail.
          </p>
        </div>

        <button
          onClick={() => setIsRecordModalOpen(true)}
          className="flex items-center space-x-2 px-5 py-2.5 bg-blue-900 hover:bg-blue-950 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition"
        >
          <Plus className="w-4 h-4" />
          <span>Record New Purchase</span>
        </button>
      </div>

      {/* Metrics Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-blue-600">
          <span className="text-xs font-bold uppercase text-slate-500">Purchases Logged</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{purchases.length} Orders</div>
          <span className="text-[11px] text-slate-500">Across current scope</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-emerald-600">
          <span className="text-xs font-bold uppercase text-slate-500">Total Units Acquired</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">+{totalQuantitySum.toLocaleString()} Items</div>
          <span className="text-[11px] text-slate-500">Added to base stocks</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-blue-900">
          <span className="text-xs font-bold uppercase text-slate-500">Total Procurement Value</span>
          <div className="text-2xl font-black text-blue-950 mt-1">${totalCostSum.toLocaleString()}</div>
          <span className="text-[11px] text-slate-500">Defense appropriations</span>
        </div>
      </div>

      {/* Filter Bar: Date & Equipment-Type */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
            <Filter className="w-4 h-4 text-blue-600" />
            <span>Search & Filter Inflows</span>
          </div>
          {(filters.startDate || filters.endDate || (!isCommander && filters.baseId) || filters.categoryId || filters.search) && (
            <button
              onClick={() =>
                setFilters({
                  baseId: isCommander ? currentUser?.baseId : '',
                  categoryId: '',
                  startDate: '',
                  endDate: '',
                  search: '',
                })
              }
              className="text-[11px] font-semibold text-red-600 hover:underline"
            >
              Clear Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Base Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Military Base
            </label>
            <select
              value={filters.baseId}
              disabled={isCommander}
              onChange={(e) => setFilters({ ...filters, baseId: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none disabled:bg-slate-100"
            >
              {!isCommander && <option value="">All Bases</option>}
              {bases.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.code})
                </option>
              ))}
            </select>
          </div>

          {/* Equipment Type Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Equipment Type
            </label>
            <select
              value={filters.categoryId}
              onChange={(e) => setFilters({ ...filters, categoryId: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
            >
              <option value="">All Equipment Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Start Date */}
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

          {/* End Date */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              To Date
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          {/* Search text */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Search Order / Asset
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="PO #, weapon, supplier..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-8 pr-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Historical Purchases Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Procurement History Ledger
            </h3>
            <p className="text-xs text-slate-500">
              All acquisitions legally signed and logged to database
            </p>
          </div>
          <button
            onClick={fetchPurchases}
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
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">Base</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Asset Name</th>
                <th className="py-3 px-4 text-right">Quantity</th>
                <th className="py-3 px-4 text-right">Unit Cost</th>
                <th className="py-3 px-4 text-right">Total Cost</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4">Authorized By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {purchases.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-10 text-center text-slate-400">
                    No purchase records match the selected filters.
                  </td>
                </tr>
              ) : (
                purchases.map((p) => (
                  <tr key={p.id} className="hover:bg-blue-50/40 transition">
                    <td className="py-2.5 px-4 font-mono text-slate-600 whitespace-nowrap">
                      {p.purchaseDate || p.purchase_date}
                    </td>
                    <td className="py-2.5 px-4 font-bold text-blue-700 whitespace-nowrap">
                      {p.purchaseOrder || p.purchase_order}
                    </td>
                    <td className="py-2.5 px-4 text-slate-800 font-medium">
                      {p.baseName || p.base_name || p.baseId}
                    </td>
                    <td className="py-2.5 px-4 text-slate-600">
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] border border-slate-200">
                        {p.categoryName || p.category_name || p.categoryId}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-bold text-slate-900">
                      {p.assetName || p.asset_name}
                    </td>
                    <td className="py-2.5 px-4 text-right font-black text-blue-700">
                      +{p.quantity}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-slate-600">
                      ${(p.unitCost || p.unit_cost || 0).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">
                      ${(p.totalCost || p.total_cost || 0).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-4 text-slate-600">{p.supplier}</td>
                    <td className="py-2.5 px-4 text-slate-700">
                      {p.createdByName || p.created_by_name || 'Supply Clerk'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Purchase Modal */}
      <RecordPurchaseModal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        onSuccess={fetchPurchases}
        bases={bases}
        categories={categories}
        currentUser={currentUser}
      />
    </div>
  );
}
