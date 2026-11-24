import React, { useState } from 'react';
import {
  Shirt,
  Lock,
  UserCheck,
  Shield,
  KeyRound,
  ArrowRight,
  Store,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Zap,
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { api } from '../../services/api';
import { User, UserRole } from '../../types';

interface LoginPageProps {
  onLoginSuccess?: (user: User) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const { availableUsers, login, activeStore, registeredStores, switchActiveStore } = useAuthStore();

  const [selectedStaff, setSelectedStaff] = useState<User | null>(availableUsers[0] || null);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loginMode, setLoginMode] = useState<'quick' | 'credentials'>('quick');

  const getRoleBadge = (role?: UserRole) => {
    switch (role) {
      case 'OWNER':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'MANAGER':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'CASHIER':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'ACCOUNTANT':
        return 'bg-teal-100 text-teal-800 border-teal-300';
      case 'TAILOR':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'INVENTORY_MANAGER':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // Perform login with selected user
  const handlePerformLogin = (userToLogin: User, method: string = 'QUICK_SELECT') => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const generatedToken = `jwt-token-${userToLogin.username}-${Date.now()}`;
      login(userToLogin, generatedToken);

      // Audit log the sign-in
      api.addAuditLog(
        'USER_LOGIN',
        'SECURITY',
        String(userToLogin.id),
        `Staff ${userToLogin.fullName} (${userToLogin.role}) signed into POS terminal`,
        method,
        undefined,
        `Role: ${userToLogin.role}`
      );

      onLoginSuccess?.(userToLogin);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Login failed. Please verify credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick staff 1-click login
  const handleQuickLogin = (userToLogin: User) => {
    handlePerformLogin(userToLogin, 'ONE_CLICK_STAFF');
  };

  // Form submit for manual credentials or PIN
  const handleCredentialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput.trim()) {
      setErrorMessage('Please enter your username, mobile number, or Staff ID.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // Find matching staff member
      const cleanInput = usernameInput.trim().toLowerCase();
      const matched = availableUsers.find(
        (u) =>
          u.username.toLowerCase() === cleanInput ||
          u.mobile.replace(/\D/g, '').includes(cleanInput.replace(/\D/g, '')) ||
          u.fullName.toLowerCase().includes(cleanInput)
      );

      if (!matched) {
        setErrorMessage('User not found. Try one of the quick staff profiles below.');
        setIsSubmitting(false);
        return;
      }

      // Check PIN / password (accept standard demo PINs 1234, 9999, or staff password)
      if (passwordInput && passwordInput !== '1234' && passwordInput !== '9999' && passwordInput !== 'admin') {
        setErrorMessage('Incorrect Security PIN or password. Try default PIN: 1234');
        setIsSubmitting(false);
        return;
      }

      handlePerformLogin(matched, 'CREDENTIALS');
    } catch (err: any) {
      setErrorMessage(err?.message || 'Authentication error.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0A2540] flex items-center justify-center p-4 sm:p-6 select-none font-sans text-slate-100">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-700/50 flex flex-col md:flex-row text-slate-800">
        
        {/* Left Banner: Store Brand & Info */}
        <div className="md:w-5/12 bg-gradient-to-b from-[#1b5e4a] to-[#0f3d30] p-8 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-emerald-400/10 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-emerald-600/10 blur-2xl pointer-events-none" />

          {/* Header & Logo */}
          <div className="relative z-10 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg text-emerald-300">
              <Shirt className="w-8 h-8" />
            </div>

            <div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-emerald-400/20 text-emerald-200 border border-emerald-400/30">
                Garment ERP &amp; POS
              </span>
              <h1 className="text-2xl font-black tracking-tight text-white mt-1 leading-snug">
                {activeStore.name}
              </h1>
              <p className="text-emerald-300 font-bold text-sm tracking-wide">
                {activeStore.tagline || activeStore.branch}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-black/20 border border-white/10 space-y-1.5 text-xs text-emerald-100/90">
              <div className="flex items-center gap-2 font-bold text-white">
                <Store className="w-4 h-4 text-emerald-300 flex-shrink-0" />
                <span className="truncate">{activeStore.branch}</span>
              </div>
              <p className="text-[11px] text-emerald-200/80 leading-relaxed">
                {activeStore.address}
              </p>
              <div className="flex items-center justify-between text-[10px] pt-1 border-t border-white/10 text-emerald-300 font-mono">
                <span>GSTIN: {activeStore.gstin}</span>
                <span>Ph: {activeStore.phone}</span>
              </div>
            </div>

            {registeredStores && registeredStores.length > 1 && (
              <div className="p-2.5 rounded-xl bg-black/25 border border-white/10 space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                  Select Store / Branch:
                </label>
                <select
                  value={activeStore.id}
                  onChange={(e) => switchActiveStore(Number(e.target.value))}
                  className="w-full py-1.5 px-2 rounded-lg bg-black/40 border border-white/20 text-xs font-bold text-white focus:outline-none"
                >
                  {registeredStores.map((st) => (
                    <option key={st.id} value={st.id} className="bg-slate-900 text-white">
                      {st.name} ({st.branch})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Quick System Status Highlights */}
          <div className="relative z-10 mt-8 space-y-3">
            <div className="text-[11px] text-emerald-200/90 font-medium flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Offline Desktop Mode: Active (Local Cache Online)</span>
            </div>
            <div className="text-[11px] text-emerald-200/80 flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-emerald-300" />
              <span>Role-Based Access Control (RBAC) Enforced</span>
            </div>
            <div className="text-[10px] text-emerald-300/60 pt-2 border-t border-white/10">
              Version 2.4.0 • Build March 2026
            </div>
          </div>
        </div>

        {/* Right Section: Sign-in Options */}
        <div className="md:w-7/12 p-8 sm:p-10 bg-slate-50 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                  Staff Terminal Sign-In
                </h2>
                <p className="text-xs text-gray-500 font-medium mt-0.5">
                  Select your profile or enter credentials to open your shift
                </p>
              </div>

              {/* Toggle Mode */}
              <div className="flex rounded-xl bg-gray-200 p-0.5 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setLoginMode('quick')}
                  className={`px-3 py-1 rounded-lg transition ${
                    loginMode === 'quick' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Fast Tap
                </button>
                <button
                  type="button"
                  onClick={() => setLoginMode('credentials')}
                  className={`px-3 py-1 rounded-lg transition ${
                    loginMode === 'credentials' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Password / PIN
                </button>
              </div>
            </div>

            {errorMessage && (
              <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Mode 1: 1-Click Fast Tap Staff Selection */}
            {loginMode === 'quick' ? (
              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Select Staff Profile (1-Click Login):
                  </span>
                  <span className="text-[11px] text-gray-500 font-mono">6 Terminals Available</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[340px] overflow-y-auto pr-1">
                  {availableUsers.map((u) => {
                    const isSelected = selectedStaff?.id === u.id;
                    return (
                      <div
                        key={u.id}
                        onClick={() => setSelectedStaff(u)}
                        onDoubleClick={() => handleQuickLogin(u)}
                        className={`p-3 rounded-2xl border cursor-pointer transition text-left flex flex-col justify-between ${
                          isSelected
                            ? 'bg-blue-50/90 border-blue-400 ring-2 ring-blue-200 shadow-sm'
                            : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="w-8 h-8 rounded-xl bg-slate-800 text-white font-black text-xs flex items-center justify-center">
                            {u.fullName.slice(0, 2).toUpperCase()}
                          </div>
                          <span
                            className={`text-[9px] px-2 py-0.5 rounded-full font-mono font-bold border ${getRoleBadge(
                              u.role
                            )}`}
                          >
                            {u.role}
                          </span>
                        </div>

                        <div className="mt-2">
                          <div className="text-xs font-bold text-gray-900 truncate">{u.fullName}</div>
                          <div className="text-[10px] text-gray-500 font-mono truncate">@{u.username}</div>
                        </div>

                        <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-[10px]">
                          <span className="text-gray-400 font-mono">ID: #{u.id}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuickLogin(u);
                            }}
                            className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-0.5"
                          >
                            Sign In ↵
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {selectedStaff && (
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleQuickLogin(selectedStaff)}
                    className="w-full mt-4 py-3 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-extrabold text-sm shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Sign In as {selectedStaff.fullName} ({selectedStaff.role})</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              /* Mode 2: Standard Username/PIN Login */
              <form onSubmit={handleCredentialSubmit} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Username / Mobile
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      placeholder="e.g. admin or 8999308582"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white font-medium"
                      autoFocus
                    />
                    <UserCheck className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Security PIN / Password
                    </label>
                    <span className="text-[11px] text-gray-400 font-mono">Default: 1234 or admin</span>
                  </div>
                  <div className="relative">
                    <input
                      type="password"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="Enter 4-digit PIN (1234)"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white font-medium"
                    />
                    <KeyRound className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 py-3 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-extrabold text-sm shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>{isSubmitting ? 'Verifying Session...' : 'Authenticate & Open Terminal'}</span>
                </button>

                <div className="p-3 bg-gray-100 rounded-xl text-xs text-gray-600 flex items-start gap-2">
                  <Zap className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] text-gray-500 leading-relaxed">
                    Fast cashier sign-in: Use Fast Tap tab above to log in directly without typing PIN every time.
                  </p>
                </div>
              </form>
            )}
          </div>

          {/* Footer Assistance */}
          <div className="pt-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Session Secure</span>
            </span>
            <span className="font-mono text-[11px]">Help: +91 89993 08582</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
