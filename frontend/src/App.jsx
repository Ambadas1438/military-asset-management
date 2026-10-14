import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import DemoGuideModal from './components/DemoGuideModal';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PurchasesPage from './pages/PurchasesPage';
import TransfersPage from './pages/TransfersPage';
import AssignmentsPage from './pages/AssignmentsPage';
import AuditLogsPage from './pages/AuditLogsPage';
import { api, setApiUser, getApiUser } from './services/api';
import { Shield, Lock, AlertCircle, LogIn, UserPlus } from 'lucide-react';

const DEFAULT_BASES = [
  { id: 'base-alpha', code: 'AFB-NORTH', name: 'Fort Sentinel (Command HQ)', location: 'Sector 4 - Northern Frontier' },
  { id: 'base-bravo', code: 'CAMP-VALOR', name: 'Camp Valor Logistics Outpost', location: 'Sector 9 - Eastern Plateau' },
  { id: 'base-charlie', code: 'NAVAL-POINT', name: 'Naval Point Maritime Redoubt', location: 'Sector 2 - Coastal Basin' },
  { id: 'base-delta', code: 'FORT-IRONCLAD', name: 'Fort Ironclad Armored Depot', location: 'Sector 7 - Central Desert' }
];

const DEFAULT_CATEGORIES = [
  { id: 'weapons', code: 'WEP', name: 'Small Arms & Heavy Weapons', unit_of_measure: 'Units' },
  { id: 'vehicles', code: 'VEH', name: 'Armored & Combat Vehicles', unit_of_measure: 'Units' },
  { id: 'ammunition', code: 'AMMO', name: 'Ammunition & Ordnance', unit_of_measure: 'Rounds' },
  { id: 'comms', code: 'COM', name: 'Tactical Communications', unit_of_measure: 'Units' },
  { id: 'optics', code: 'OPT', name: 'Optics & Night Vision', unit_of_measure: 'Units' }
];

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [bases, setBases] = useState(DEFAULT_BASES);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [isDemoGuideOpen, setIsDemoGuideOpen] = useState(false);
  const [showAuthPage, setShowAuthPage] = useState(false);

  // Initialize app data
  const initialize = async () => {
    try {
      setLoading(true);

      // Fetch live data from MySQL backend
      const [basesRes, catRes, usersRes] = await Promise.all([
        api.getBases().catch(() => ({ bases: DEFAULT_BASES })),
        api.getCategories().catch(() => ({ categories: DEFAULT_CATEGORIES })),
        api.getAllUsers().catch(() => ({ users: [] }))
      ]);

      const loadedBases = basesRes?.bases?.length > 0 ? basesRes.bases : DEFAULT_BASES;
      const loadedCats = catRes?.categories?.length > 0 ? catRes.categories : DEFAULT_CATEGORIES;
      const loadedUsers = usersRes?.users?.length > 0 ? usersRes.users : [];

      setBases(loadedBases);
      setCategories(loadedCats);
      setAllUsers(loadedUsers);

      const activeId = getApiUser();
      if (activeId) {
        try {
          const meRes = await api.getCurrentUser();
          setCurrentUser(meRes.user);
        } catch {
          if (loadedUsers.length > 0) {
            setCurrentUser(loadedUsers[0]);
            setApiUser(loadedUsers[0].id);
          }
        }
      } else {
        // If no user saved in localStorage, default to showing Login / Signup page!
        setShowAuthPage(true);
      }
    } catch (err) {
      console.error('Initialization error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initialize();
  }, []);

  const handleSwitchUser = async (userId) => {
    setApiUser(userId);
    try {
      const meRes = await api.getCurrentUser();
      setCurrentUser(meRes.user);
    } catch {
      const found = allUsers.find((u) => u.id === userId);
      if (found) setCurrentUser(found);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setApiUser('');
    setShowAuthPage(true);
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setShowAuthPage(false);
    initialize();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-blue-900 border-2 border-red-600 flex items-center justify-center text-white shadow-xl animate-bounce mb-3">
          <Shield className="w-6 h-6 text-red-500" />
        </div>
        <p className="text-sm font-bold text-blue-950 uppercase tracking-widest">
          Synchronizing Defense Ledger from MySQL...
        </p>
      </div>
    );
  }

  // If unauthenticated or user clicked Sign In / Sign Up, display full LoginPage
  if (!currentUser || showAuthPage) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col">
        {currentUser && (
          <div className="bg-blue-950 text-white px-4 py-2 flex items-center justify-between text-xs border-b border-red-600">
            <span>Currently signed in as: <strong>{currentUser.name}</strong> ({currentUser.role})</span>
            <button
              onClick={() => setShowAuthPage(false)}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded font-bold"
            >
              Back to Dashboard
            </button>
          </div>
        )}
        <LoginPage
          onLoginSuccess={handleLoginSuccess}
          bases={bases}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col">
      {/* Navbar with White, Red, and Blue styling */}
      <Navbar
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenDemoGuide={() => setIsDemoGuideOpen(true)}
        onSwitchUser={handleSwitchUser}
        allUsers={allUsers}
        onLogout={handleLogout}
        onOpenAuthPage={() => setShowAuthPage(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardPage
            currentUser={currentUser}
            bases={bases}
            categories={categories}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'purchases' && (
          <PurchasesPage
            currentUser={currentUser}
            bases={bases}
            categories={categories}
          />
        )}

        {activeTab === 'transfers' && (
          <TransfersPage
            currentUser={currentUser}
            bases={bases}
            categories={categories}
          />
        )}

        {activeTab === 'assignments' && (
          <AssignmentsPage
            currentUser={currentUser}
            bases={bases}
            categories={categories}
          />
        )}

        {activeTab === 'audit' && (
          <AuditLogsPage
            currentUser={currentUser}
            bases={bases}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="font-semibold text-slate-700">ARES Defense Ledger Active</span>
            <span>•</span>
            <span>Java 17 Spring Boot + MySQL + React.js</span>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowAuthPage(true)}
              className="text-blue-700 hover:underline font-semibold flex items-center space-x-1"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Login / Sign Up Page</span>
            </button>
            <span className="text-[11px] text-slate-400">
              Confidential Military Property
            </span>
          </div>
        </div>
      </footer>

      {/* Architecture & RBAC Guide Modal */}
      <DemoGuideModal
        isOpen={isDemoGuideOpen}
        onClose={() => setIsDemoGuideOpen(false)}
      />
    </div>
  );
}
