import React, { useState } from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  Shirt,
  Boxes,
  Truck,
  Users,
  WalletCards,
  Scissors,
  MessageSquare,
  BarChart3,
  UserCheck,
  HardDriveDownload,
  Settings,
  ShieldAlert,
  Store,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Bell,
  Sparkles,
  Printer,
  Download,
  Check,
  X,
  LogOut,
  Shield,
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useCartStore } from '../../stores/cartStore';
import { useShortcutStore } from '../../stores/shortcutStore';
import { api } from '../../services/api';
import { User, UserRole } from '../../types';

interface AppLayoutProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  activeTab,
  setActiveTab,
  children,
}) => {
  const { user, availableUsers, switchUser, logout, hasPermission, activeStore } = useAuthStore();
  const { heldBills } = useCartStore();
  const { shortcuts } = useShortcutStore();
  const [showUserSwitchModal, setShowUserSwitchModal] = useState(false);
  const [selectedUserIndex, setSelectedUserIndex] = useState(0);

  const handleSwitchUser = (targetUser: User) => {
    const oldUser = user;
    switchUser(targetUser);
    setShowUserSwitchModal(false);

    api.addAuditLog(
      'TERMINAL_SWITCH',
      'SECURITY',
      String(targetUser.id),
      `Switched active cashier terminal to ${targetUser.fullName} (${targetUser.role})`,
      'TERMINAL_SWITCH',
      oldUser ? `${oldUser.fullName} (${oldUser.role})` : undefined,
      `${targetUser.fullName} (${targetUser.role})`
    );

    // If target user lacks permission for current activeTab, redirect safely
    setTimeout(() => {
      const canAccessCurrent = useAuthStore.getState().hasPermission(activeTab);
      if (!canAccessCurrent) {
        if (targetUser.role === 'CASHIER') setActiveTab('pos');
        else if (targetUser.role === 'TAILOR') setActiveTab('alterations');
        else if (targetUser.role === 'ACCOUNTANT') setActiveTab('accounting');
        else if (targetUser.role === 'INVENTORY_MANAGER') setActiveTab('inventory');
        else setActiveTab('dashboard');
      }
    }, 0);
  };

  const handleLogout = () => {
    if (window.confirm(`Sign out from ${user?.fullName}'s session and lock terminal?`)) {
      api.addAuditLog(
        'USER_LOGOUT',
        'SECURITY',
        String(user?.id || 1),
        `Staff ${user?.fullName} signed out of POS terminal`,
        'USER_LOGOUT'
      );
      logout();
    }
  };

  // Keyboard navigation for user switch modal
  React.useEffect(() => {
    if (!showUserSwitchModal) return;

    const currentIdx = availableUsers.findIndex((u) => u.id === user?.id);
    if (currentIdx !== -1) setSelectedUserIndex(currentIdx);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowUserSwitchModal(false);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedUserIndex((prev) => (prev + 1) % availableUsers.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedUserIndex((prev) => (prev - 1 + availableUsers.length) % availableUsers.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (availableUsers[selectedUserIndex]) {
          handleSwitchUser(availableUsers[selectedUserIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showUserSwitchModal, availableUsers, selectedUserIndex, user]);

  const navItems = [
    { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'pos', label: 'POS Billing (F2)', icon: ShoppingCart, badge: heldBills.length > 0 ? `${heldBills.length} Held` : null, highlight: true },
    { id: 'products', label: 'Garment Style Master', icon: Shirt, badge: null },
    { id: 'inventory', label: 'Inventory & Valuation', icon: Boxes, badge: 'Low Stock' },
    { id: 'purchases', label: 'Purchases & Bills', icon: Truck, badge: null },
    { id: 'customers', label: 'Customers / Khata', icon: Users, badge: null },
    { id: 'accounting', label: 'Cash Shift & Expenses', icon: WalletCards, badge: null },
    { id: 'alterations', label: 'Tailoring & Alterations', icon: Scissors, badge: '2 Due' },
    { id: 'communications', label: 'WhatsApp / Alerts', icon: MessageSquare, badge: null },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3, badge: null },
    { id: 'employees', label: 'Employees & Roles', icon: UserCheck, badge: null },
    { id: 'backup', label: 'Backup & Cloud Sync', icon: HardDriveDownload, badge: null },
    { id: 'settings', label: 'Settings & Shortcuts', icon: Settings, badge: null },
    { id: 'admin', label: 'Audit Logs & Diagnostics', icon: ShieldAlert, badge: null },
  ];

  // RBAC: Filter navigation by granular role permissions
  const accessibleNavItems = navItems.filter((item) => hasPermission(item.id));

  const getRoleBadgeClass = (role?: UserRole) => {
    switch (role) {
      case 'OWNER':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'MANAGER':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'CASHIER':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'ACCOUNTANT':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'TAILOR':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'INVENTORY_MANAGER':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F3F4F6] text-[#1F2937]">
      {/* Sidebar Navigation */}
      <aside className="w-64 flex-shrink-0 flex flex-col bg-[#1F2937] text-slate-200 select-none shadow-xl">
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-700/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1b5e4a] flex items-center justify-center shadow-md shadow-emerald-900/20 text-white font-black text-lg">
            <Shirt className="w-5 h-5 text-white" />
          </div>
          <div className="overflow-hidden">
            <h1 className="font-extrabold text-xs text-white tracking-wide truncate">{activeStore.name}</h1>
            <p className="text-[10px] font-medium text-emerald-400 truncate flex items-center gap-1">
              {activeStore.tagline || activeStore.branch}
            </p>
          </div>
        </div>

        {/* Store Active Branch Banner */}
        <div className="mx-3 mt-3 p-2.5 rounded-xl bg-slate-800/90 border border-slate-700/80">
          <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
            <span className="flex items-center gap-1.5 font-bold text-white truncate">
              <Store className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span className="truncate">{activeStore.name}</span>
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 font-mono font-bold">
              ONLINE
            </span>
          </div>
          <div className="text-[11px] text-slate-400 truncate">
            {activeStore.address} • Ph: {activeStore.phone}
          </div>
        </div>

        {/* Nav Items List - Filtered by RBAC permissions */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          {accessibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#2563EB] text-white shadow-md shadow-blue-600/30'
                    : item.highlight
                    ? 'bg-slate-800 text-sky-300 hover:bg-slate-700/90 hover:text-white border border-sky-500/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-sky-400' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : item.badge.includes('Held')
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-rose-500/20 text-rose-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Footer with Switch User Trigger & Logout */}
        <div className="p-3 border-t border-slate-700/80 bg-slate-900/80 space-y-2">
          <div
            onClick={() => setShowUserSwitchModal(true)}
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 flex items-center justify-between cursor-pointer transition group"
            title="Click or press arrow keys to Switch Cashier User"
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-[#2563EB] text-white flex items-center justify-center font-bold text-xs shadow">
                {user?.fullName.slice(0, 2).toUpperCase()}
              </div>
              <div className="overflow-hidden text-left">
                <div className="text-xs font-bold text-white truncate">
                  {user?.fullName}
                </div>
                <div className="text-[10px] text-emerald-400 uppercase font-mono font-semibold flex items-center gap-1">
                  <span>{user?.role}</span>
                  <span className="text-slate-400 group-hover:text-slate-200">• Switch ▾</span>
                </div>
              </div>
            </div>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 ring-4 ring-emerald-500/20" title="Connected" />
          </div>

          {/* Quick Sign Out Action */}
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-xs font-bold transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Lock Terminal / Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Control Bar */}
        <header className="h-14 bg-white border-b border-gray-200 px-6 flex items-center justify-between flex-shrink-0 shadow-sm">
          {/* Left: Back to All Styles breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer">
            <ChevronLeft className="w-4 h-4 text-slate-400" />
            <span onClick={() => setActiveTab('products')}>Back to All Styles</span>
          </div>

          {/* Center: Active Screen / Store Title */}
          <div className="flex items-center gap-1.5 text-sm font-bold text-[#1F2937] cursor-pointer hover:text-[#2563EB] transition">
            <span>{navItems.find((n) => n.id === activeTab)?.label || 'Executive Dashboard'}</span>
            <ChevronDown className="w-4 h-4 text-slate-500" />
          </div>

          {/* Right: Prev / Next Navigation, User Switch Pill & Logout */}
          <div className="flex items-center gap-3 text-xs font-medium text-slate-600">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const idx = accessibleNavItems.findIndex((n) => n.id === activeTab);
                  if (idx > 0) setActiveTab(accessibleNavItems[idx - 1].id);
                }}
                className="hover:text-slate-900 font-semibold"
              >
                ← Prev
              </button>
              <button
                onClick={() => {
                  const idx = accessibleNavItems.findIndex((n) => n.id === activeTab);
                  if (idx < accessibleNavItems.length - 1) setActiveTab(accessibleNavItems[idx + 1].id);
                }}
                className="hover:text-slate-900 font-semibold"
              >
                Next →
              </button>
            </div>

            <div className="h-4 w-px bg-slate-200" />

            {/* Quick Switch User button */}
            <button
              onClick={() => setShowUserSwitchModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-800 font-bold text-xs border border-gray-200 shadow-xs transition"
              title="Switch Cashier Profile"
            >
              <UserCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>{user?.fullName.split(' ')[0]} ({user?.role})</span>
            </button>

            {/* Quick POS Shortcut pill */}
            {hasPermission('pos') && (
              <button
                onClick={() => setActiveTab('pos')}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-[#2563EB] font-bold text-xs hover:bg-blue-100 transition border border-blue-200/60"
              >
                <kbd className="px-1 py-0.2 bg-white text-[#2563EB] rounded font-mono shadow-xs border border-blue-200">F2</kbd>
                <span>POS Billing</span>
              </button>
            )}

            {/* Header Sign Out Button */}
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition border border-transparent hover:border-rose-200"
              title="Sign Out & Lock Terminal"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Viewport Canvas */}
        <main className="flex-1 overflow-y-auto bg-[#F3F4F6] p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Switch User Modal */}
      {showUserSwitchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl w-full max-w-md overflow-hidden p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-extrabold text-base text-gray-900">Switch User Account</h2>
                  <p className="text-xs text-gray-500">Select active profile to switch role and session</p>
                </div>
              </div>
              <button
                onClick={() => setShowUserSwitchModal(false)}
                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* User List */}
            <div className="space-y-2.5">
              {availableUsers.map((u, idx) => {
                const isCurrent = user?.id === u.id;
                const isNavSelected = selectedUserIndex === idx;
                return (
                  <div
                    key={u.id}
                    onMouseEnter={() => setSelectedUserIndex(idx)}
                    onClick={() => handleSwitchUser(u)}
                    className={`p-3.5 rounded-2xl border cursor-pointer flex items-center justify-between transition ${
                      isNavSelected
                        ? 'bg-blue-50/90 border-blue-400 ring-2 ring-blue-200 shadow-sm'
                        : isCurrent
                        ? 'bg-blue-50/50 border-blue-200'
                        : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#1F2937] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                        {u.fullName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-gray-900 flex items-center gap-2">
                          <span>{u.fullName}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold border ${getRoleBadgeClass(
                              u.role
                            )}`}
                          >
                            {u.role}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 font-mono">
                          @{u.username} • {u.mobile}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isNavSelected && (
                        <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-mono font-bold">
                          ↵ Enter
                        </span>
                      )}
                      {isCurrent && (
                        <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-600 space-y-1">
              <div className="font-semibold text-gray-900 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-blue-600" />
                <span>Role Permissions Active</span>
              </div>
              <p className="text-[11px] text-gray-500">
                Switching users updates POS permissions, invoice PIN authorization levels, and audit trail tagging automatically.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
