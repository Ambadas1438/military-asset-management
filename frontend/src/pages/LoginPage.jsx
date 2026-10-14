import React, { useState } from 'react';
import {
  Shield,
  Lock,
  Mail,
  User,
  Building2,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  UserPlus,
  LogIn
} from 'lucide-react';
import { api, setApiUser } from '../services/api';

export default function LoginPage({ onLoginSuccess, bases = [] }) {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'

  // Login form state
  const [loginEmail, setLoginEmail] = useState('a.vance@military.gov');
  const [loginPassword, setLoginPassword] = useState('password123');

  // Signup form state
  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    role: 'commander',
    baseId: bases[0]?.id || 'base-alpha',
    rank: 'Captain (O-3)',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Preset demo accounts for fast evaluation
  const demoAccounts = [
    {
      id: 'user-admin',
      name: 'Gen. Arthur Vance',
      role: 'admin',
      roleLabel: 'Admin (4-Star General)',
      base: 'Central Command HQ',
      email: 'a.vance@military.gov',
      desc: 'Global unconstrained visibility across all 4 bases & audit logs',
      badgeColor: 'bg-red-600 text-white'
    },
    {
      id: 'user-cmd-alpha',
      name: 'Col. Sarah Miller',
      role: 'commander',
      roleLabel: 'Base Commander (Alpha)',
      base: 'Fort Sentinel',
      email: 's.miller@sentinel.mil',
      desc: 'Enforced scope to Fort Sentinel - manages assignments & base transfers',
      badgeColor: 'bg-blue-600 text-white'
    },
    {
      id: 'user-cmd-bravo',
      name: 'Maj. John Hayes',
      role: 'commander',
      roleLabel: 'Base Commander (Bravo)',
      base: 'Camp Valor',
      email: 'j.hayes@valor.mil',
      desc: 'Enforced scope to Camp Valor Outpost',
      badgeColor: 'bg-blue-600 text-white'
    },
    {
      id: 'user-logistics',
      name: 'Lt. Alex Carter',
      role: 'logistics',
      roleLabel: 'Logistics Officer',
      base: 'Logistics Bureau',
      email: 'a.carter@logistics.mil',
      desc: 'Specialized supply chain access: record purchases and inter-base transfers',
      badgeColor: 'bg-amber-600 text-white'
    }
  ];

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    try {
      setLoading(true);
      const res = await api.login(loginEmail, loginPassword);
      if (res.user) {
        setApiUser(res.user.id);
        onLoginSuccess(res.user);
      }
    } catch (err) {
      setError(err.message || 'Login failed. Try quick login or sign up.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (userId) => {
    setError('');
    try {
      setLoading(true);
      const res = await api.quickLogin(userId);
      if (res.user) {
        setApiUser(res.user.id);
        onLoginSuccess(res.user);
      }
    } catch (err) {
      setError(err.message || 'Quick login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!signupData.name.trim() || !signupData.email.trim() || !signupData.username.trim() || !signupData.password.trim()) {
      setError('Please fill in all required fields including password');
      return;
    }

    try {
      setLoading(true);
      const res = await api.signup(signupData);
      setSuccessMsg('Account registered successfully! Logging you in...');
      if (res.user) {
        setApiUser(res.user.id);
        setTimeout(() => {
          onLoginSuccess(res.user);
        }, 800);
      }
    } catch (err) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Top Banner Accent */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-900 to-blue-950 text-white shadow-xl border-2 border-red-600 mb-3">
          <Shield className="w-9 h-9 text-red-500" />
        </div>
        <h2 className="text-3xl font-black tracking-tight text-blue-950">
          ARES DEFENSE LEDGER
        </h2>
        <p className="mt-1 text-sm font-semibold text-slate-600">
          Military Asset Management & Role-Based Custody System
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-6 shadow-xl border border-slate-200 sm:rounded-2xl sm:px-10">
          {/* Mode Switch Tabs (Sign In vs Sign Up) */}
          <div className="flex border-b border-slate-200 mb-6">
            <button
              onClick={() => {
                setMode('login');
                setError('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-3 text-center text-sm font-bold flex items-center justify-center space-x-2 border-b-2 transition ${
                mode === 'login'
                  ? 'border-blue-700 text-blue-900 bg-blue-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <LogIn className="w-4 h-4 text-blue-700" />
              <span>Officer Sign In</span>
            </button>

            <button
              onClick={() => {
                setMode('signup');
                setError('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-3 text-center text-sm font-bold flex items-center justify-center space-x-2 border-b-2 transition ${
                mode === 'signup'
                  ? 'border-red-600 text-red-700 bg-red-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <UserPlus className="w-4 h-4 text-red-600" />
              <span>Sign Up / Register Personnel</span>
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-lg flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* SIGN IN FORM */}
          {mode === 'login' && (
            <div>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Official Military Email or Username
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="e.g. a.vance@military.gov or ambadas or general.vance"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase">
                      Security Passcode / Password
                    </label>
                    <span className="text-[10px] text-slate-500 font-medium">Default: password123</span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      required
                      placeholder="Enter password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-blue-900 hover:bg-blue-950 text-white rounded-lg text-xs font-bold shadow-md hover:shadow-lg transition flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <span>Verifying Credentials...</span>
                  ) : (
                    <>
                      <span>Sign In to Defense Ledger</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Fast Evaluation Quick-Login Selector */}
              <div className="mt-8 pt-6 border-t border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Quick Role Access (1-Click Evaluation)
                  </span>
                  <span className="text-[10px] font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full">
                    RBAC Test
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {demoAccounts.map((acc) => (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => handleQuickLogin(acc.id)}
                      className="text-left p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50/70 hover:border-blue-400 transition group shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 group-hover:text-blue-900">
                          {acc.name}
                        </span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${acc.badgeColor}`}>
                          {acc.role}
                        </span>
                      </div>
                      <div className="text-[11px] font-semibold text-blue-700 mt-0.5">{acc.base}</div>
                      <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">{acc.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SIGN UP / REGISTER FORM */}
          {mode === 'signup' && (
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ambadas Miskin"
                    value={signupData.name}
                    onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-red-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Username *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ambadas"
                    value={signupData.username}
                    onChange={(e) => setSignupData({ ...signupData, username: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-red-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Official Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. ambadas@sentinel.mil"
                  value={signupData.email}
                  onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-red-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Security Passcode / Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    placeholder="Create your security password (e.g. Ambu@2004 or password123)"
                    value={signupData.password}
                    onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-red-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    System Role (RBAC) *
                  </label>
                  <select
                    value={signupData.role}
                    onChange={(e) => setSignupData({ ...signupData, role: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-red-600 focus:outline-none"
                  >
                    <option value="commander">Base Commander</option>
                    <option value="logistics">Logistics Officer</option>
                    <option value="admin">Central Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Assigned Military Base
                  </label>
                  <select
                    value={signupData.baseId}
                    onChange={(e) => setSignupData({ ...signupData, baseId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-red-600 focus:outline-none"
                  >
                    {bases.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Military Rank
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Captain, Major, Colonel"
                    value={signupData.rank}
                    onChange={(e) => setSignupData({ ...signupData, rank: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-red-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Auto-generated Service #
                  </label>
                  <div className="bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-600">
                    SN-NEW-AUTOGEN
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow-md hover:shadow-lg transition flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <span>Registering Personnel...</span>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Create Military Account</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
