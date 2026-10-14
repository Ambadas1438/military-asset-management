import React, { useState, useEffect } from 'react';
import {
  FileText,
  ShieldAlert,
  Search,
  Filter,
  RefreshCw,
  Building2,
  Calendar,
  Lock,
  Terminal
} from 'lucide-react';
import { api } from '../services/api';

export default function AuditLogsPage({ currentUser, bases = [] }) {
  const [filters, setFilters] = useState({
    baseId: '',
    action: '',
    entityType: '',
    limit: 50,
  });

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.getAuditLogs(filters);
      setLogs(data.logs || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch audit ledger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filters]);

  const filteredLogs = logs.filter((log) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      log.action?.toLowerCase().includes(q) ||
      log.user_name?.toLowerCase().includes(q) ||
      log.entity_id?.toLowerCase().includes(q) ||
      log.details?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-red-700 bg-red-50 px-2.5 py-1 rounded-full border border-red-200">
            Immutable Audit Trail & Compliance
          </span>
          <h1 className="text-2xl font-black text-blue-950 mt-2">
            System Transaction Audit Logs
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Every transaction (purchases, transfers, assignments, expenditures) is cryptographically recorded for legal accountability.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="flex items-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition border border-slate-200"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Ledger</span>
        </button>
      </div>

      {/* Filter Ribbon */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Base Scope
            </label>
            <select
              value={filters.baseId}
              onChange={(e) => setFilters({ ...filters, baseId: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
            >
              <option value="">All Bases</option>
              {bases.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Action Filter
            </label>
            <select
              value={filters.action}
              onChange={(e) => setFilters({ ...filters, action: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
            >
              <option value="">All Actions</option>
              <option value="RECORD_PURCHASE">RECORD_PURCHASE</option>
              <option value="INITIATE_TRANSFER">INITIATE_TRANSFER</option>
              <option value="RECEIVE_TRANSFER">RECEIVE_TRANSFER</option>
              <option value="ASSIGN_ASSET">ASSIGN_ASSET</option>
              <option value="RETURN_ASSET">RETURN_ASSET</option>
              <option value="RECORD_EXPENDITURE">RECORD_EXPENDITURE</option>
              <option value="USER_LOGIN">USER_LOGIN</option>
              <option value="USER_REGISTER">USER_REGISTER</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Limit
            </label>
            <select
              value={filters.limit}
              onChange={(e) => setFilters({ ...filters, limit: parseInt(e.target.value) || 50 })}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
            >
              <option value="25">Last 25 entries</option>
              <option value="50">Last 50 entries</option>
              <option value="100">Last 100 entries</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Search Details
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="User, ID, details..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-8 pr-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-blue-900" />
            <h3 className="text-base font-bold text-slate-900">
              Audit Event Stream
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-500">
            {filteredLogs.length} events logged
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="bg-slate-50 text-slate-600 uppercase font-bold border-b border-slate-200 font-sans">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Operator / Role</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Entity Ref</th>
                <th className="py-3 px-4">Base</th>
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4">Payload Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400 font-sans">
                    No audit records match the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition text-[11px]">
                    <td className="py-2.5 px-4 text-slate-500 whitespace-nowrap">
                      {log.timestamp}
                    </td>
                    <td className="py-2.5 px-4 font-sans whitespace-nowrap">
                      <div className="font-bold text-slate-900">{log.user_name || log.userName}</div>
                      <span className="text-[10px] text-blue-700 uppercase font-bold">
                        {log.user_role || log.userRole}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          log.action?.includes('PURCHASE')
                            ? 'bg-blue-50 text-blue-800 border border-blue-200'
                            : log.action?.includes('TRANSFER')
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : log.action?.includes('EXPENDITURE')
                            ? 'bg-red-50 text-red-800 border border-red-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-bold text-slate-800 whitespace-nowrap">
                      {log.entity_id || log.entityId}
                    </td>
                    <td className="py-2.5 px-4 font-sans text-slate-700 whitespace-nowrap">
                      {log.base_name || log.baseName || log.base_id || log.baseId || 'GLOBAL'}
                    </td>
                    <td className="py-2.5 px-4 text-slate-400 whitespace-nowrap">
                      {log.ip_address || log.ipAddress || '127.0.0.1'}
                    </td>
                    <td className="py-2.5 px-4 text-slate-600 max-w-xs truncate" title={log.details}>
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
