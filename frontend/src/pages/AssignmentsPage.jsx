import React, { useState, useEffect } from 'react';
import {
  ClipboardList,
  UserPlus,
  Flame,
  Filter,
  Search,
  CheckCircle2,
  Clock,
  RotateCcw,
  RefreshCw,
  Building2,
  AlertTriangle,
  FileText
} from 'lucide-react';
import AssignAssetModal from '../components/AssignAssetModal';
import RecordExpenditureModal from '../components/RecordExpenditureModal';
import { api } from '../services/api';

export default function AssignmentsPage({ currentUser, bases = [], categories = [] }) {
  const isCommander = currentUser?.role === 'commander';
  const defaultBaseId = isCommander ? currentUser?.baseId : '';

  const [activeSubTab, setActiveSubTab] = useState('assignments'); // 'assignments' | 'expenditures'

  const [filters, setFilters] = useState({
    baseId: defaultBaseId || '',
    categoryId: '',
    status: '',
    search: '',
  });

  const [assignments, setAssignments] = useState([]);
  const [expenditures, setExpenditures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isExpendModalOpen, setIsExpendModalOpen] = useState(false);

  useEffect(() => {
    if (isCommander && currentUser?.baseId) {
      setFilters((prev) => ({ ...prev, baseId: currentUser.baseId }));
    }
  }, [currentUser]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [asnRes, expRes] = await Promise.all([
        api.getAssignments(filters),
        api.getExpenditures(filters)
      ]);
      setAssignments(asnRes.assignments || []);
      setExpenditures(expRes.expenditures || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch assignments & expenditures');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  const handleReturnAsset = async (assignmentId) => {
    if (!window.confirm('Confirm receipt and inspection of returned asset?')) return;
    try {
      setActionLoadingId(assignmentId);
      await api.returnAssignment(assignmentId);
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to return asset');
    } finally {
      setActionLoadingId(null);
    }
  };

  const activeAssignments = assignments.filter((a) => a.status === 'ACTIVE');
  const totalExpendedUnits = expenditures.reduce((acc, e) => acc + (e.quantity || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
            Custody & Operational Consumption
          </span>
          <h1 className="text-2xl font-black text-blue-950 mt-2">
            Assignments & Expended Assets
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Issue firearms and tactical vehicles directly to servicemembers, or log ammunition/munitions expended.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAssignModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2.5 bg-blue-900 hover:bg-blue-950 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>Assign Asset to Personnel</span>
          </button>

          <button
            onClick={() => setIsExpendModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition"
          >
            <Flame className="w-4 h-4" />
            <span>Record Expenditure</span>
          </button>
        </div>
      </div>

      {/* Metrics Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-blue-600">
          <span className="text-xs font-bold uppercase text-slate-500">Active Custody Assignments</span>
          <div className="text-2xl font-black text-blue-900 mt-1">{activeAssignments.length} Active</div>
          <span className="text-[11px] text-slate-500">Issued to soldiers & squads</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-emerald-600">
          <span className="text-xs font-bold uppercase text-slate-500">Returned to Armory</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            {assignments.filter((a) => a.status === 'RETURNED').length} Returned
          </div>
          <span className="text-[11px] text-slate-500">Restored to available on-hand</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-red-600">
          <span className="text-xs font-bold uppercase text-slate-500">Total Expended / Consumed</span>
          <div className="text-2xl font-black text-red-600 mt-1">
            {totalExpendedUnits.toLocaleString()} Units
          </div>
          <span className="text-[11px] text-slate-500">Written off from base closing balance</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
            <Filter className="w-4 h-4 text-blue-600" />
            <span>Filter Custody & Expenditures</span>
          </div>
          {(filters.baseId && !isCommander || filters.categoryId || filters.search) && (
            <button
              onClick={() =>
                setFilters({
                  baseId: isCommander ? currentUser?.baseId : '',
                  categoryId: '',
                  status: '',
                  search: '',
                })
              }
              className="text-[11px] font-semibold text-red-600 hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
              Search Personnel / Asset
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Soldier name, MIL-ID, asset..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-8 pr-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tab Selectors: Assignments vs Expenditures */}
      <div className="flex border-b border-slate-200 space-x-4">
        <button
          onClick={() => setActiveSubTab('assignments')}
          className={`pb-3 text-sm font-bold flex items-center space-x-2 border-b-2 transition ${
            activeSubTab === 'assignments'
              ? 'border-blue-900 text-blue-950'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ClipboardList className="w-4 h-4 text-blue-700" />
          <span>Personnel Custody Assignments ({assignments.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('expenditures')}
          className={`pb-3 text-sm font-bold flex items-center space-x-2 border-b-2 transition ${
            activeSubTab === 'expenditures'
              ? 'border-red-600 text-red-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Flame className="w-4 h-4 text-red-600" />
          <span>Expenditure & Consumption History ({expenditures.length})</span>
        </button>
      </div>

      {/* Sub-tab 1: Assignments Table */}
      {activeSubTab === 'assignments' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Personnel Asset Custody Ledger
              </h3>
              <p className="text-xs text-slate-500">
                Tracks military personnel holding weapons, radios, or gear with status and return check-in
              </p>
            </div>
            <button
              onClick={fetchData}
              className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 uppercase font-bold border-b border-slate-200">
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Base</th>
                  <th className="py-3 px-4">Servicemember</th>
                  <th className="py-3 px-4">Military ID / Unit</th>
                  <th className="py-3 px-4">Asset Name</th>
                  <th className="py-3 px-4 text-right">Qty</th>
                  <th className="py-3 px-4">Issue Date</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assignments.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-10 text-center text-slate-400">
                      No assignment records found for this scope.
                    </td>
                  </tr>
                ) : (
                  assignments.map((a) => (
                    <tr key={a.id} className="hover:bg-blue-50/40 transition">
                      <td className="py-2.5 px-4 font-mono font-bold text-blue-700 whitespace-nowrap">
                        {a.assignmentCode || a.assignment_code}
                      </td>
                      <td className="py-2.5 px-4 text-slate-800 font-medium">
                        {a.baseName || a.base_name || a.baseId}
                      </td>
                      <td className="py-2.5 px-4 font-bold text-slate-900">
                        {a.personnelName || a.personnel_name}
                        <div className="text-[10px] text-slate-500 font-normal">{a.rank}</div>
                      </td>
                      <td className="py-2.5 px-4 text-slate-600">
                        <span className="font-mono text-slate-700 font-medium">{a.militaryId || a.military_id}</span>
                        <div className="text-[10px] text-slate-500">{a.unit}</div>
                      </td>
                      <td className="py-2.5 px-4 font-bold text-slate-900">
                        {a.assetName || a.asset_name}
                      </td>
                      <td className="py-2.5 px-4 text-right font-black text-amber-700">
                        {a.quantity}
                      </td>
                      <td className="py-2.5 px-4 font-mono text-slate-600">
                        {a.issueDate || a.issue_date}
                      </td>
                      <td className="py-2.5 px-4 font-mono text-slate-500">
                        {a.returnDueDate || a.return_due_date || 'Permanent'}
                      </td>
                      <td className="py-2.5 px-4">
                        {a.status === 'ACTIVE' ? (
                          <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded text-[10px] font-bold">
                            Active Custody
                          </span>
                        ) : a.status === 'RETURNED' ? (
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold">
                            Returned
                          </span>
                        ) : (
                          <span className="bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded text-[10px] font-bold">
                            {a.status}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        {a.status === 'ACTIVE' && (
                          <button
                            onClick={() => handleReturnAsset(a.id)}
                            disabled={actionLoadingId === a.id}
                            className="px-2.5 py-1 bg-blue-900 hover:bg-blue-950 text-white rounded text-[11px] font-bold shadow-sm transition inline-flex items-center gap-1"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>{actionLoadingId === a.id ? 'Processing...' : 'Return'}</span>
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
      )}

      {/* Sub-tab 2: Expenditures Table */}
      {activeSubTab === 'expenditures' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Ammunition & Equipment Expenditure Write-Offs
              </h3>
              <p className="text-xs text-slate-500">
                Audit records of combat ammunition expenditure, live training, or combat battle damages
              </p>
            </div>
            <button
              onClick={fetchData}
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
                  <th className="py-3 px-4">Expenditure Code</th>
                  <th className="py-3 px-4">Base</th>
                  <th className="py-3 px-4">Asset Name</th>
                  <th className="py-3 px-4 text-right">Quantity</th>
                  <th className="py-3 px-4">Classification</th>
                  <th className="py-3 px-4">Mission Reference</th>
                  <th className="py-3 px-4">Authorized By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expenditures.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-slate-400">
                      No expenditure records found.
                    </td>
                  </tr>
                ) : (
                  expenditures.map((e) => (
                    <tr key={e.id} className="hover:bg-red-50/40 transition">
                      <td className="py-2.5 px-4 font-mono text-slate-600 whitespace-nowrap">
                        {e.expenditureDate || e.expenditure_date}
                      </td>
                      <td className="py-2.5 px-4 font-mono font-bold text-red-700 whitespace-nowrap">
                        {e.expenditureCode || e.expenditure_code}
                      </td>
                      <td className="py-2.5 px-4 text-slate-800 font-medium">
                        {e.baseName || e.base_name || e.baseId}
                      </td>
                      <td className="py-2.5 px-4 font-bold text-slate-900">
                        {e.assetName || e.asset_name}
                      </td>
                      <td className="py-2.5 px-4 text-right font-black text-red-600">
                        -{e.quantity}
                      </td>
                      <td className="py-2.5 px-4">
                        <span className="bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded text-[10px] font-bold">
                          {e.expenditureType || e.expenditure_type}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 font-mono text-slate-700 font-semibold">
                        {e.missionRef || e.mission_ref}
                      </td>
                      <td className="py-2.5 px-4 text-slate-700">
                        {e.authorizedByName || e.authorized_by_name || 'Commander'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      <AssignAssetModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onSuccess={fetchData}
        bases={bases}
        categories={categories}
        currentUser={currentUser}
      />

      <RecordExpenditureModal
        isOpen={isExpendModalOpen}
        onClose={() => setIsExpendModalOpen(false)}
        onSuccess={fetchData}
        bases={bases}
        categories={categories}
        currentUser={currentUser}
      />
    </div>
  );
}
