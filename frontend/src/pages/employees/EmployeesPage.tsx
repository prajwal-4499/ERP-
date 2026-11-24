import React, { useState } from 'react';
import {
  UserCheck,
  Shield,
  CheckCircle,
  Check,
  RotateCcw,
  Sparkles,
  Lock,
  Sliders,
  AlertCircle,
} from 'lucide-react';
import { useAuthStore, defaultRolePermissions } from '../../stores/authStore';
import { api } from '../../services/api';
import { UserRole } from '../../types';

export const EmployeesPage: React.FC = () => {
  const {
    user,
    availableUsers,
    switchUser,
    customRolePermissions,
    updateRolePermission,
    resetDefaultPermissions,
    hasRole,
  } = useAuthStore();

  const [notification, setNotification] = useState<string | null>(null);

  const roles: { role: UserRole; label: string; badgeClass: string }[] = [
    { role: 'OWNER', label: 'Owner', badgeClass: 'bg-blue-100 text-blue-800 border-blue-200' },
    { role: 'MANAGER', label: 'Manager', badgeClass: 'bg-purple-100 text-purple-800 border-purple-200' },
    { role: 'CASHIER', label: 'Cashier', badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    { role: 'ACCOUNTANT', label: 'Accountant', badgeClass: 'bg-teal-100 text-teal-800 border-teal-200' },
    { role: 'TAILOR', label: 'Tailor', badgeClass: 'bg-amber-100 text-amber-800 border-amber-200' },
    { role: 'INVENTORY_MANAGER', label: 'Inventory Mgr', badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  ];

  const permissionModules = [
    { key: 'dashboard', name: 'Executive Dashboard & Overview', category: 'Navigation' },
    { key: 'pos', name: 'POS Billing & Sales Terminal (F2)', category: 'Sales' },
    { key: 'invoice_edit', name: 'Modify Completed Invoices (PIN)', category: 'Sales' },
    { key: 'price_edit', name: 'Cart Price & Discount Override', category: 'Sales' },
    { key: 'credit_override', name: 'Customer Khata Limit Override', category: 'Credit' },
    { key: 'products', name: 'Garment Style Master & Barcodes', category: 'Catalog' },
    { key: 'inventory', name: 'Stock Levels & Valuation Reports', category: 'Inventory' },
    { key: 'stock_adjust', name: 'Manual Stock Adjustments', category: 'Inventory' },
    { key: 'purchases', name: 'Supplier Khata, GRN & Inward Bills', category: 'Purchases' },
    { key: 'customers', name: 'Customers & Khata Ledger', category: 'Customers' },
    { key: 'accounting', name: 'Cash Register Shifts & Expenses', category: 'Accounts' },
    { key: 'alterations', name: 'Tailoring & Alterations Orders', category: 'Tailoring' },
    { key: 'communications', name: 'WhatsApp Bills & Reminders', category: 'Comms' },
    { key: 'reports', name: 'Financial & Sales Analytics', category: 'Reports' },
    { key: 'employees', name: 'Staff Profiles & Role Matrix', category: 'Admin' },
    { key: 'backup', name: 'Database Cloud Backup & Export', category: 'System' },
    { key: 'settings', name: 'Store Settings & Hardware Config', category: 'System' },
    { key: 'admin', name: 'Security Audit Logs & Diagnostics', category: 'System' },
  ];

  const getEffectivePermission = (role: UserRole, key: string): boolean => {
    if (role === 'OWNER') return true;
    if (customRolePermissions[role] && typeof customRolePermissions[role][key] === 'boolean') {
      return customRolePermissions[role][key];
    }
    const defaultMap = defaultRolePermissions[role];
    return defaultMap ? defaultMap[key] === true : false;
  };

  const handleToggle = (role: UserRole, key: string) => {
    if (role === 'OWNER') {
      setNotification('Owner permissions are permanently granted for system administration.');
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    if (!hasRole(['OWNER', 'MANAGER'])) {
      setNotification('Only Store Owner or Manager can modify role access permissions.');
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    const currentVal = getEffectivePermission(role, key);
    const newVal = !currentVal;
    updateRolePermission(role, key, newVal);

    api.addAuditLog(
      'PERMISSION_UPDATE',
      'RBAC',
      `${role}:${key}`,
      `Updated ${key} permission for ${role} to ${newVal ? 'ALLOWED' : 'DENIED'}`,
      'RBAC_POLICY',
      String(currentVal),
      String(newVal)
    );

    setNotification(`Updated ${role} access for "${key}" to ${newVal ? 'Allowed' : 'Restricted'}.`);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleReset = () => {
    if (!hasRole('OWNER')) {
      setNotification('Only Store Owner can reset permissions to system defaults.');
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    if (window.confirm('Reset all custom role permissions back to factory defaults?')) {
      resetDefaultPermissions();
      api.addAuditLog(
        'PERMISSIONS_RESET',
        'RBAC',
        'ALL_ROLES',
        'Reset all role access permissions back to system defaults',
        'ADMIN_RESET'
      );
      setNotification('All role permissions reset to default matrix.');
      setTimeout(() => setNotification(null), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            Employee Profiles &amp; Role-Based Access Control (RBAC)
          </h2>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Configure cashier logins, terminal assignments, and granular module permissions with instant synchronization
          </p>
        </div>

        {hasRole('OWNER') && (
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-gray-300 hover:bg-gray-50 text-xs font-bold text-gray-700 shadow-2xs transition"
          >
            <RotateCcw className="w-3.5 h-3.5 text-gray-500" />
            <span>Reset Permissions to Factory Defaults</span>
          </button>
        )}
      </div>

      {notification && (
        <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-medium flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-blue-500 hover:text-blue-800 text-xs font-bold">
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Staff Profiles (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-gray-900">Store Staff &amp; Terminals</h3>
              <p className="text-[11px] text-gray-500">Active credentials and assigned roles</p>
            </div>
          </div>

          <div className="space-y-3">
            {availableUsers.map((emp) => {
              const isCurrent = user?.id === emp.id;
              return (
                <div
                  key={emp.id}
                  className={`p-3.5 rounded-xl border space-y-2 transition ${
                    isCurrent
                      ? 'bg-blue-50/70 border-blue-300 ring-2 ring-blue-100 shadow-xs'
                      : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                      <span>{emp.fullName}</span>
                      {isCurrent && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                          Active Now
                        </span>
                      )}
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold border ${
                        emp.role === 'OWNER'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : emp.role === 'MANAGER'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : emp.role === 'CASHIER'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : emp.role === 'TAILOR'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : emp.role === 'ACCOUNTANT'
                          ? 'bg-teal-50 text-teal-700 border-teal-200'
                          : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      }`}
                    >
                      {emp.role}
                    </span>
                  </div>

                  <div className="text-xs text-gray-500 font-mono">
                    @{emp.username} • {emp.mobile}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-gray-400 font-mono">Terminal ID: #{emp.id}</span>
                    {!isCurrent && (
                      <button
                        type="button"
                        onClick={() => {
                          switchUser(emp);
                          api.addAuditLog(
                            'TERMINAL_SWITCH',
                            'SECURITY',
                            String(emp.id),
                            `Switched cashier session to ${emp.fullName} (${emp.role})`,
                            'EMPLOYEES_PAGE'
                          );
                          setNotification(`Switched active terminal user to ${emp.fullName} (${emp.role}).`);
                          setTimeout(() => setNotification(null), 3000);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white border border-gray-300 hover:bg-gray-100 text-[11px] font-bold text-blue-600 transition shadow-2xs"
                      >
                        Switch Terminal ↵
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 8 Columns: Dynamic Interactive Permissions Matrix */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 bg-gray-50/70 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-gray-900">Granular Role Permissions Matrix</h3>
                <p className="text-[11px] text-gray-500">
                  Click any cell to toggle access on/off • Owner is permanently authorized
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] font-medium text-gray-600">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Allowed
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-gray-300 inline-block" /> Restricted
              </span>
            </div>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-[10px] tracking-wider border-b border-gray-200">
                <tr>
                  <th className="p-3 min-w-[200px]">Module / Action</th>
                  {roles.map((r) => (
                    <th key={r.role} className="p-2.5 text-center min-w-[85px]">
                      <span className={`px-2 py-0.5 rounded-full font-mono text-[9px] font-bold border ${r.badgeClass}`}>
                        {r.label}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {permissionModules.map((p) => (
                  <tr key={p.key} className="hover:bg-blue-50/30 transition">
                    <td className="p-3">
                      <div className="font-semibold text-gray-900">{p.name}</div>
                      <div className="text-[10px] text-gray-400 font-mono">key: {p.key}</div>
                    </td>

                    {roles.map((r) => {
                      const isAllowed = getEffectivePermission(r.role, p.key);
                      const isOwner = r.role === 'OWNER';

                      return (
                        <td key={r.role} className="p-2.5 text-center">
                          <button
                            type="button"
                            disabled={isOwner}
                            onClick={() => handleToggle(r.role, p.key)}
                            title={isOwner ? 'Owner has full unrestricted access' : `Click to toggle ${r.label} access for ${p.name}`}
                            className={`w-7 h-7 rounded-lg inline-flex items-center justify-center font-bold text-xs transition ${
                              isOwner
                                ? 'bg-blue-50 text-blue-600 cursor-default opacity-80'
                                : isAllowed
                                ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 shadow-2xs'
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-400'
                            }`}
                          >
                            {isOwner ? (
                              <Lock className="w-3.5 h-3.5 text-blue-600" />
                            ) : isAllowed ? (
                              <Check className="w-4 h-4 stroke-[2.5]" />
                            ) : (
                              <span>—</span>
                            )}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-gray-50/70 border-t border-gray-200 text-[11px] text-gray-500 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-blue-600" />
              <span>Modifications take effect immediately in the sidebar, shortcuts, and route guards.</span>
            </span>
            <span className="font-mono text-gray-400">Total Modules: {permissionModules.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeesPage;
