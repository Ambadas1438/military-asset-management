import React from 'react';
import {
  Shield,
  LayoutDashboard,
  ShoppingCart,
  ArrowLeftRight,
  ClipboardList,
  FileText,
  LogOut,
  UserCheck,
  UserPlus,
  Building2,
  HelpCircle,
  ChevronDown
} from 'lucide-react';

export default function Navbar({
  currentUser,
  activeTab,
  setActiveTab,
  onOpenDemoGuide,
  onSwitchUser,
  allUsers,
  onLogout,
  onOpenAuthPage
}) {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'purchases', label: 'Purchases', icon: ShoppingCart },
    { id: 'transfers', label: 'Transfers', icon: ArrowLeftRight },
    { id: 'assignments', label: 'Assignments & Expended', icon: ClipboardList },
    { id: 'audit', label: 'Audit Trail', icon: FileText, adminOnly: true },
  ];

  const roleBadgeColors = {
    admin: 'bg-red-600 text-white border-red-700',
    commander: 'bg-blue-600 text-white border-blue-700',
    logistics: 'bg-amber-600 text-white border-amber-700',
  };

  return (
    <header className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 text-white shadow-lg sticky top-0 z-40 border-b-2 border-red-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center text-white shadow-md border border-red-400">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-lg tracking-wider text-white">ARES</span>
                <span className="text-[10px] font-bold uppercase tracking-widest bg-red-600/90 text-white px-2 py-0.5 rounded shadow-sm">
                  DEFENSE LEDGER
                </span>
              </div>
              <p className="text-[11px] text-blue-200 font-medium">Military Asset Management System</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex space-x-1">
            {navItems.map((item) => {
              if (item.adminOnly && currentUser?.role !== 'admin') return null;
              const isActive = activeTab === item.id;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-red-600 text-white shadow-md'
                      : 'text-blue-100 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Controls: Role & User & Demo Guide */}
          <div className="flex items-center space-x-3">
            {/* Direct Login / Signup Button */}
            <button
              onClick={onOpenAuthPage}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-lg transition shadow-sm border border-red-500"
              title="Open Login & Signup Page"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Login / Sign Up</span>
            </button>

            {/* Guide Button */}
            <button
              onClick={onOpenDemoGuide}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white rounded-lg transition border border-white/15"
              title="System Architecture & RBAC Guide"
            >
              <HelpCircle className="w-3.5 h-3.5 text-blue-300" />
              <span className="hidden sm:inline">System Guide</span>
            </button>

            {/* User Profile & Role Switcher */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2.5 p-1.5 pr-2.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/15 transition text-left"
              >
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-xs text-white border border-blue-400">
                  {currentUser?.name?.charAt(0) || 'U'}
                </div>
                <div className="hidden lg:block text-xs">
                  <div className="font-bold text-white flex items-center space-x-1">
                    <span>{currentUser?.name || 'Officer'}</span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${roleBadgeColors[currentUser?.role] || 'bg-slate-700'}`}>
                      {currentUser?.role}
                    </span>
                  </div>
                  <div className="text-[10px] text-blue-200">
                    {currentUser?.baseName ? currentUser.baseName : 'All Bases Access'}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-blue-300" />
              </button>

              {/* Quick Switch Dropdown */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-200 py-2 z-50">
                  <div className="px-3 py-2 border-b border-slate-100 bg-slate-50">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Signed In User</p>
                    <p className="text-sm font-bold text-slate-900">{currentUser?.name}</p>
                    <p className="text-xs text-slate-500">{currentUser?.email}</p>
                    <div className="mt-1 flex items-center space-x-2 text-[11px] text-slate-600">
                      <span className="font-semibold text-blue-700">{currentUser?.rank}</span>
                      <span>•</span>
                      <span>{currentUser?.serviceNumber}</span>
                    </div>
                  </div>

                  <div className="px-3 py-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Quick Switch Role (RBAC Testing)
                    </p>
                    <div className="space-y-1">
                      {allUsers?.map((u) => (
                        <button
                          key={u.id}
                          onClick={() => {
                            onSwitchUser(u.id);
                            setDropdownOpen(false);
                          }}
                          className={`w-full text-left px-2 py-1.5 rounded-lg text-xs flex items-center justify-between transition ${
                            u.id === currentUser?.id
                              ? 'bg-blue-50 text-blue-900 font-bold border border-blue-200'
                              : 'hover:bg-slate-100 text-slate-700'
                          }`}
                        >
                          <div>
                            <div className="font-medium">{u.name}</div>
                            <div className="text-[10px] text-slate-500">
                              {u.baseName || 'Central Command HQ'}
                            </div>
                          </div>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                              roleBadgeColors[u.role] || 'bg-slate-200 text-slate-800'
                            }`}
                          >
                            {u.role}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-1 px-1 space-y-1">
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        onOpenAuthPage();
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50 rounded-lg flex items-center space-x-2 transition"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                      <span>Register New Officer (Sign Up)</span>
                    </button>
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        onLogout();
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg flex items-center space-x-2 transition"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="flex md:hidden overflow-x-auto py-2 space-x-1 border-t border-blue-900">
          {navItems.map((item) => {
            if (item.adminOnly && currentUser?.role !== 'admin') return null;
            const isActive = activeTab === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition ${
                  isActive ? 'bg-red-600 text-white' : 'text-blue-100 hover:bg-white/10'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
