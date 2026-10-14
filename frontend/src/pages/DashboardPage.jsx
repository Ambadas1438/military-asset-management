import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  ArrowDownLeft,
  ArrowUpRight,
  ShoppingCart,
  Users,
  Flame,
  Scale,
  Filter,
  RefreshCw,
  AlertTriangle,
  Building2,
  Calendar,
  Layers,
  Search,
  CheckCircle2,
  BarChart3
} from 'lucide-react';
import StatCard from '../components/StatCard';
import NetMovementModal from '../components/NetMovementModal';
import { api } from '../services/api';

export default function DashboardPage({
  currentUser,
  bases = [],
  categories = [],
  onNavigateTab
}) {
  const isCommander = currentUser?.role === 'commander';
  const defaultBaseId = isCommander ? currentUser?.baseId : '';

  // Filter states
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    baseId: defaultBaseId || '',
    categoryId: '',
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isNetMovementModalOpen, setIsNetMovementModalOpen] = useState(false);

  useEffect(() => {
    if (isCommander && currentUser?.baseId) {
      setFilters((prev) => ({ ...prev, baseId: currentUser.baseId }));
    }
  }, [currentUser]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.getDashboardMetrics(filters);
      setMetrics(data);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [filters]);

  const summary = metrics?.summary || {
    openingBalance: 0,
    totalPurchases: 0,
    totalTransfersIn: 0,
    totalTransfersOut: 0,
    netMovement: 0,
    totalAssigned: 0,
    totalExpended: 0,
    closingBalance: 0,
  };

  const detailedAssets = metrics?.detailedAssets || [];
  const filteredAssets = detailedAssets.filter((item) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.assetName?.toLowerCase().includes(q) ||
      item.baseName?.toLowerCase().includes(q) ||
      item.categoryName?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Context */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Live Tactical Inventory Ledger
            </span>
          </div>
          <h1 className="text-2xl font-black text-blue-950 mt-1">
            Command Center Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time multi-base balance sheet, custody transfers & asset expenditure tracking.
          </p>
        </div>

        {/* Quick Action Badges */}
        <div className="flex items-center gap-2">
          <button
            onClick={fetchDashboardData}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition border border-slate-200"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setIsNetMovementModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition shadow-sm"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Net Movement Modal [Bonus]</span>
          </button>
        </div>
      </div>

      {/* FILTER BAR: Date, Base, Equipment Type */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
            <Filter className="w-4 h-4 text-blue-600" />
            <span>Audit & Scope Filters</span>
          </div>
          {(filters.startDate || filters.endDate || (!isCommander && filters.baseId) || filters.categoryId) && (
            <button
              onClick={() =>
                setFilters({
                  startDate: '',
                  endDate: '',
                  baseId: isCommander ? currentUser?.baseId : '',
                  categoryId: '',
                })
              }
              className="text-[11px] font-semibold text-red-600 hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
              {!isCommander && <option value="">All Bases (Global Fleet)</option>}
              {bases.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.code})
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Equipment Type / Category
            </label>
            <select
              value={filters.categoryId}
              onChange={(e) => setFilters({ ...filters, categoryId: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
            >
              <option value="">All Categories (Weapons, Vehicles, Ammo...)</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Start Date
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
              End Date
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* CORE METRICS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* 1. Opening Balance */}
        <StatCard
          title="Opening Balance"
          value={summary.openingBalance.toLocaleString()}
          subvalue="Baseline initial inventory balance"
          icon={Building2}
          variant="navy"
          badgeText="Baseline"
        />

        {/* 2. Net Movement (INTERACTIVE POPUP MODAL ON CLICK) */}
        <StatCard
          title="Net Movement"
          value={
            summary.netMovement >= 0
              ? `+${summary.netMovement.toLocaleString()}`
              : summary.netMovement.toLocaleString()
          }
          subvalue="Purchases + Transfers In - Out"
          icon={TrendingUp}
          variant={summary.netMovement >= 0 ? 'blue' : 'red'}
          isInteractive={true}
          onClick={() => setIsNetMovementModalOpen(true)}
          badgeText="Click for Popup"
        />

        {/* 3. Assigned Assets */}
        <StatCard
          title="Assigned to Personnel"
          value={summary.totalAssigned.toLocaleString()}
          subvalue="In custody with active servicemembers"
          icon={Users}
          variant="blue"
          badgeText="Custody"
        />

        {/* 4. Expended Assets */}
        <StatCard
          title="Expended Assets"
          value={summary.totalExpended.toLocaleString()}
          subvalue="Live fire, combat or decommission"
          icon={Flame}
          variant="red"
          badgeText="Consumed"
        />

        {/* 5. Closing Balance */}
        <StatCard
          title="Closing Balance"
          value={summary.closingBalance.toLocaleString()}
          subvalue="Current verified asset ledger total"
          icon={Scale}
          variant="navy"
          badgeText="Reconciled"
        />
      </div>

      {/* DETAILED ASSET BREAKDOWN TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Detailed Asset Reconciliation Ledger
            </h3>
            <p className="text-xs text-slate-500">
              Double-entry tracking showing Opening + Net Movement - Expended = Closing
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search assets, bases..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-1.5 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 uppercase font-bold border-b border-slate-200">
                <th className="py-3 px-4">Base</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Asset Name</th>
                <th className="py-3 px-4 text-right">Opening</th>
                <th className="py-3 px-4 text-right text-blue-700">Purchases (+)</th>
                <th className="py-3 px-4 text-right text-emerald-700">Trf In (+)</th>
                <th className="py-3 px-4 text-right text-red-600">Trf Out (-)</th>
                <th className="py-3 px-4 text-right font-black">Net Mvt</th>
                <th className="py-3 px-4 text-right text-red-700">Expended</th>
                <th className="py-3 px-4 text-right text-amber-700">Assigned</th>
                <th className="py-3 px-4 text-right font-black text-slate-900">Closing</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-8 text-center text-slate-400">
                    No asset inventory matches your filter.
                  </td>
                </tr>
              ) : (
                filteredAssets.map((item, idx) => (
                  <tr key={item.id || idx} className="hover:bg-blue-50/40 transition">
                    <td className="py-2.5 px-4 font-semibold text-slate-800">{item.baseName}</td>
                    <td className="py-2.5 px-4 text-slate-600">
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-medium border border-slate-200">
                        {item.categoryName}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-bold text-slate-900">{item.assetName}</td>
                    <td className="py-2.5 px-4 text-right font-mono text-slate-700">{item.openingBalance}</td>
                    <td className="py-2.5 px-4 text-right font-mono text-blue-700 font-bold">
                      {item.purchases > 0 ? `+${item.purchases}` : '0'}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-emerald-600 font-bold">
                      {item.transfersIn > 0 ? `+${item.transfersIn}` : '0'}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-red-600 font-bold">
                      {item.transfersOut > 0 ? `-${item.transfersOut}` : '0'}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-black text-blue-900">
                      {item.netMovement > 0 ? `+${item.netMovement}` : item.netMovement}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-red-700 font-bold">
                      {item.expended > 0 ? `-${item.expended}` : '0'}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-amber-700 font-bold">
                      {item.assigned}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-black text-slate-900 text-sm">
                      {item.closingBalance}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      {item.isLowStock ? (
                        <span className="bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded text-[10px] font-bold inline-flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-red-600" /> Low Stock
                        </span>
                      ) : (
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Operational
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* NET MOVEMENT POPUP MODAL (BONUS REQUIREMENT) */}
      <NetMovementModal
        isOpen={isNetMovementModalOpen}
        onClose={() => setIsNetMovementModalOpen(false)}
        breakdown={metrics?.popupBreakdown}
        summary={summary}
        filters={filters}
      />
    </div>
  );
}
