import React, { useState, useEffect } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { GlobalShortcutListener } from './components/common/GlobalShortcutListener';
import { LoginPage } from './pages/auth/LoginPage';
import { useAuthStore } from './stores/authStore';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { POSPage } from './pages/pos/POSPage';
import { ProductsPage } from './pages/products/ProductsPage';
import { InventoryPage } from './pages/inventory/InventoryPage';
import { PurchasesPage } from './pages/purchases/PurchasesPage';
import { CustomersPage } from './pages/customers/CustomersPage';
import { AccountingPage } from './pages/accounting/AccountingPage';
import { AlterationsPage } from './pages/alterations/AlterationsPage';
import { CommunicationsPage } from './pages/communications/CommunicationsPage';
import { ReportsPage } from './pages/reports/ReportsPage';
import { EmployeesPage } from './pages/employees/EmployeesPage';
import { BackupPage } from './pages/backup/BackupPage';
import { SettingsPage } from './pages/settings/SettingsPage';
import { AdminPage } from './pages/admin/AdminPage';
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react';
import { UserRole } from './types';

export function App() {
  const { isAuthenticated, user, hasPermission } = useAuthStore();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Set default initial tab based on role upon login or user change
  useEffect(() => {
    if (!user) return;
    const role = (user.role || '').replace(/^ROLE_/, '') as UserRole;

    // If current tab is unauthorized, auto-redirect to role's primary workplace
    if (!hasPermission(activeTab)) {
      if (role === 'CASHIER') setActiveTab('pos');
      else if (role === 'TAILOR') setActiveTab('alterations');
      else if (role === 'ACCOUNTANT') setActiveTab('accounting');
      else if (role === 'INVENTORY_MANAGER') setActiveTab('inventory');
      else setActiveTab('dashboard');
    }
  }, [user]);

  // If not authenticated or no user session, show login screen
  if (!isAuthenticated || !user) {
    return (
      <LoginPage
        onLoginSuccess={(loggedInUser) => {
          const role = (loggedInUser.role || '').replace(/^ROLE_/, '') as UserRole;
          if (role === 'CASHIER') setActiveTab('pos');
          else if (role === 'TAILOR') setActiveTab('alterations');
          else if (role === 'ACCOUNTANT') setActiveTab('accounting');
          else if (role === 'INVENTORY_MANAGER') setActiveTab('inventory');
          else setActiveTab('dashboard');
        }}
      />
    );
  }

  const renderActivePage = () => {
    // RBAC Route Guard: verify user permission for current module
    if (!hasPermission(activeTab)) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 bg-white rounded-3xl border border-gray-200 shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shadow-inner">
            <ShieldAlert className="w-9 h-9" />
          </div>

          <div className="max-w-md space-y-2">
            <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">
              Access Restricted
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Your active role <span className="font-mono font-bold text-rose-600">[{user.role}]</span> is not authorized to access the <span className="font-bold text-gray-800">{activeTab.toUpperCase()}</span> module.
            </p>
            <p className="text-[11px] text-gray-400">
              Please contact the store manager or switch to an authorized user terminal.
            </p>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={() => {
                if (user.role === 'CASHIER') setActiveTab('pos');
                else if (user.role === 'TAILOR') setActiveTab('alterations');
                else if (user.role === 'ACCOUNTANT') setActiveTab('accounting');
                else if (user.role === 'INVENTORY_MANAGER') setActiveTab('inventory');
                else setActiveTab('dashboard');
              }}
              className="px-4 py-2 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-bold transition flex items-center gap-2 shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Permitted Workspace</span>
            </button>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage />;
      case 'pos':
        return <POSPage onNavigateTab={setActiveTab} />;
      case 'products':
        return <ProductsPage />;
      case 'inventory':
        return <InventoryPage />;
      case 'purchases':
        return <PurchasesPage />;
      case 'customers':
        return <CustomersPage />;
      case 'accounting':
        return <AccountingPage />;
      case 'alterations':
        return <AlterationsPage />;
      case 'communications':
        return <CommunicationsPage />;
      case 'reports':
        return <ReportsPage />;
      case 'employees':
        return <EmployeesPage />;
      case 'backup':
        return <BackupPage />;
      case 'settings':
        return <SettingsPage />;
      case 'admin':
        return <AdminPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <>
      <GlobalShortcutListener onNavigate={(tab) => setActiveTab(tab)} />
      <AppLayout activeTab={activeTab} setActiveTab={setActiveTab}>
        {renderActivePage()}
      </AppLayout>
    </>
  );
}

export default App;
