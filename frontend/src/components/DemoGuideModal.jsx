import React from 'react';
import { X, Shield, BookOpen, Key, CheckCircle, Database, Server, RefreshCw } from 'lucide-react';

export default function DemoGuideModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-950 to-blue-900 px-6 py-4 text-white flex items-center justify-between border-b-2 border-red-600">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-600 rounded-lg text-white">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">System Architecture & RBAC Evaluation Guide</h3>
              <p className="text-xs text-blue-200">Military Asset Management System Overview</p>
            </div>
          </div>
          <button onClick={onClose} className="text-blue-200 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[80vh] overflow-y-auto space-y-5 text-xs text-slate-700">
          {/* Tech Stack Justification */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h4 className="text-sm font-bold text-slate-900 mb-2 flex items-center space-x-2">
              <Server className="w-4 h-4 text-blue-700" />
              <span>Full-Stack Architecture Justification</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <span className="font-bold text-blue-900 block text-xs">Java 17 + Spring Boot 3</span>
                <p className="text-[11px] text-slate-500 mt-1">
                  Enterprise-grade security, transactional ACID integrity, Spring Security middleware, and scalable RESTful APIs.
                </p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <span className="font-bold text-blue-900 block text-xs">MySQL Relational Database</span>
                <p className="text-[11px] text-slate-500 mt-1">
                  Relational foreign keys enforce auditability. Double-entry inventory transactions guarantee zero data drift.
                </p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <span className="font-bold text-blue-900 block text-xs">React.js (Pure JavaScript)</span>
                <p className="text-[11px] text-slate-500 mt-1">
                  Responsive UI with smooth interactive state management, custom modals, dynamic filters, and real-time ledger recalculation.
                </p>
              </div>
            </div>
          </div>

          {/* Mathematical Reconciliation Formula */}
          <div className="bg-blue-50/70 p-4 rounded-xl border border-blue-200">
            <h4 className="text-sm font-bold text-blue-950 mb-1.5 flex items-center space-x-2">
              <RefreshCw className="w-4 h-4 text-blue-700" />
              <span>Cryptographic Balance & Net Movement Equation</span>
            </h4>
            <p className="text-[11px] text-blue-800 mb-2">
              Strict accounting integrity ensures that inventory is never silently altered:
            </p>
            <div className="bg-white p-3 rounded-lg border border-blue-200 font-mono text-xs space-y-1 text-slate-900">
              <div>
                <strong className="text-blue-900">Net Movement</strong> = Purchases (+) + Transfers In (+) - Transfers Out (-)
              </div>
              <div>
                <strong className="text-blue-900">Closing Balance</strong> = Opening Balance + Net Movement - Expended Assets
              </div>
              <div>
                <strong className="text-blue-900">On-Hand Ready</strong> = Closing Balance - Active Personnel Assignments
              </div>
            </div>
          </div>

          {/* RBAC Matrix */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-2 flex items-center space-x-2">
              <Key className="w-4 h-4 text-red-600" />
              <span>Role-Based Access Control (RBAC) Matrix</span>
            </h4>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="py-2.5 px-3">Role</th>
                    <th className="py-2.5 px-3">Demo User</th>
                    <th className="py-2.5 px-3">Access Scope</th>
                    <th className="py-2.5 px-3">Permissions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-bold text-red-700">Admin</td>
                    <td className="py-2.5 px-3">Gen. Arthur Vance</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">Global (All 4 Bases)</td>
                    <td className="py-2.5 px-3 text-slate-600">Full read/write on all operations & complete audit logs.</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-bold text-blue-700">Base Commander</td>
                    <td className="py-2.5 px-3">Col. Sarah Miller</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">Assigned Base Only (Fort Sentinel)</td>
                    <td className="py-2.5 px-3 text-slate-600">Operations and ledger strictly filtered to command post.</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-bold text-amber-700">Logistics Officer</td>
                    <td className="py-2.5 px-3">Lt. Alex Carter</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">Supply Chain & Inventory</td>
                    <td className="py-2.5 px-3 text-slate-600">Limited access to record purchases, dispatch & receive transfers.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs rounded-lg shadow-sm transition"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
}
