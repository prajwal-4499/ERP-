import { create } from 'zustand';
import { User, UserRole, StoreProfile } from '../types';

export const defaultStoreProfile: StoreProfile = {
  id: 1,
  name: 'Shravani Collection & New SK Telors',
  branch: 'Pargaon (Mangrul)',
  tagline: '& New SK Telors',
  gstin: '27AABCU9603R1ZM',
  phone: '8999308582',
  email: 'contact@shravanicollection.com',
  address: 'Pargaon (Mangrul), Taluka Kavathe Mahankal, Sangli',
  stateCode: '27',
  stateName: 'Maharashtra',
  pincode: '416410',
  upiId: '8999308582@ybl',
  thermalFooter: 'Goods once sold can be exchanged within 7 days with bill. Thank you! Visit again.',
  createdAt: '2026-01-01',
};

export interface RolePermissionsMap {
  [moduleOrAction: string]: boolean;
}

export type SystemPermissionsMatrix = Record<UserRole, RolePermissionsMap>;

export const defaultRolePermissions: SystemPermissionsMatrix = {
  OWNER: {
    dashboard: true,
    pos: true,
    products: true,
    inventory: true,
    purchases: true,
    customers: true,
    accounting: true,
    alterations: true,
    communications: true,
    reports: true,
    employees: true,
    backup: true,
    settings: true,
    admin: true,
    invoice_edit: true,
    invoice_cancel: true,
    stock_adjust: true,
    price_edit: true,
    credit_override: true,
  },
  MANAGER: {
    dashboard: true,
    pos: true,
    products: true,
    inventory: true,
    purchases: true,
    customers: true,
    accounting: true,
    alterations: true,
    communications: true,
    reports: true,
    employees: true,
    backup: false, // Owner only
    settings: true,
    admin: false, // Owner only
    invoice_edit: true,
    invoice_cancel: true,
    stock_adjust: true,
    price_edit: true,
    credit_override: true,
  },
  CASHIER: {
    dashboard: true,
    pos: true,
    products: false,
    inventory: false,
    purchases: false,
    customers: true, // Khata lookups and credit sales
    accounting: false,
    alterations: true, // Receive alteration orders at counter
    communications: true, // WhatsApp receipts
    reports: false,
    employees: false,
    backup: false,
    settings: false,
    admin: false,
    invoice_edit: false, // Requires manager PIN
    invoice_cancel: false,
    stock_adjust: false,
    price_edit: false,
    credit_override: false,
  },
  ACCOUNTANT: {
    dashboard: true,
    pos: false,
    products: false,
    inventory: false,
    purchases: true, // Vendor bills & payments
    customers: true, // Khata credit reconciliations
    accounting: true, // Cash shifts & expenses
    alterations: false,
    communications: false,
    reports: true, // P&L and GST summary
    employees: false,
    backup: false,
    settings: false,
    admin: false,
    invoice_edit: false,
    invoice_cancel: false,
    stock_adjust: false,
    price_edit: false,
    credit_override: true,
  },
  TAILOR: {
    dashboard: true,
    pos: false,
    products: false,
    inventory: false,
    purchases: false,
    customers: false,
    accounting: false,
    alterations: true, // Dedicated tailoring workspace
    communications: false,
    reports: false,
    employees: false,
    backup: false,
    settings: false,
    admin: false,
    invoice_edit: false,
    invoice_cancel: false,
    stock_adjust: false,
    price_edit: false,
    credit_override: false,
  },
  INVENTORY_MANAGER: {
    dashboard: true,
    pos: false,
    products: true, // Style master
    inventory: true, // Stock movements & dead stock
    purchases: true, // GRN inward bills
    customers: false,
    accounting: false,
    alterations: false,
    communications: false,
    reports: false,
    employees: false,
    backup: false,
    settings: false,
    admin: false,
    invoice_edit: false,
    invoice_cancel: false,
    stock_adjust: true,
    price_edit: true,
    credit_override: false,
  },
};

export const defaultUsers: User[] = [
  {
    id: 1,
    username: 'admin',
    fullName: 'Rajesh Sharma',
    mobile: '8999308582',
    email: 'admin@shravanicollection.com',
    role: 'OWNER',
    branchId: 1,
    branchName: 'Pargaon (Mangrul)',
    active: true,
  },
  {
    id: 2,
    username: 'manager_priya',
    fullName: 'Priya Nair',
    mobile: '+91 98450 11223',
    email: 'priya@shravanicollection.com',
    role: 'MANAGER',
    branchId: 1,
    branchName: 'Pargaon (Mangrul)',
    active: true,
  },
  {
    id: 3,
    username: 'cashier1',
    fullName: 'Vijay Kumar',
    mobile: '+91 97412 34567',
    email: 'vijay@shravanicollection.com',
    role: 'CASHIER',
    branchId: 1,
    branchName: 'Pargaon (Mangrul)',
    active: true,
  },
  {
    id: 4,
    username: 'tailor_master',
    fullName: 'Master Rafiq',
    mobile: '+91 98800 55443',
    email: 'rafiq@shravanicollection.com',
    role: 'TAILOR',
    branchId: 1,
    branchName: 'Pargaon (Mangrul)',
    active: true,
  },
  {
    id: 5,
    username: 'accountant_sunil',
    fullName: 'Sunil Kulkarni',
    mobile: '+91 98220 33445',
    email: 'sunil@shravanicollection.com',
    role: 'ACCOUNTANT',
    branchId: 1,
    branchName: 'Pargaon (Mangrul)',
    active: true,
  },
  {
    id: 6,
    username: 'inventory_anand',
    fullName: 'Anand Shinde',
    mobile: '+91 98900 66778',
    email: 'anand@shravanicollection.com',
    role: 'INVENTORY_MANAGER',
    branchId: 1,
    branchName: 'Pargaon (Mangrul)',
    active: true,
  },
];

interface AuthState {
  user: User | null;
  token: string | null;
  availableUsers: User[];
  activeStore: StoreProfile;
  registeredStores: StoreProfile[];
  isAuthenticated: boolean;
  customRolePermissions: Record<string, RolePermissionsMap>;

  // Actions
  login: (user: User, token: string) => void;
  switchUser: (user: User) => void;
  logout: () => void;
  hasPermission: (permissionOrModule: string) => boolean;
  hasRole: (role: UserRole | UserRole[]) => boolean;
  updateRolePermission: (role: UserRole, permission: string, allowed: boolean) => void;
  resetDefaultPermissions: () => void;
  updateActiveStore: (updatedFields: Partial<StoreProfile>) => void;
  registerNewStore: (newStore: Omit<StoreProfile, 'id' | 'createdAt'>) => StoreProfile;
  switchActiveStore: (storeId: number) => void;
}

const loadActiveStore = (): StoreProfile => {
  try {
    const raw = localStorage.getItem('cloth_shop_erp_active_store');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.name) return { ...defaultStoreProfile, ...parsed };
    }
  } catch (e) {
    console.warn('Error reading active store from localStorage', e);
  }
  return defaultStoreProfile;
};

const loadRegisteredStores = (): StoreProfile[] => {
  try {
    const raw = localStorage.getItem('cloth_shop_erp_stores');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Error reading registered stores from localStorage', e);
  }
  return [defaultStoreProfile];
};

const loadCustomPermissions = (): Record<string, RolePermissionsMap> => {
  try {
    const raw = localStorage.getItem('cloth_shop_erp_role_permissions');
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Error reading role permissions from storage', e);
  }
  return {};
};

const getInitialUser = (): User | null => {
  try {
    const saved = localStorage.getItem('active_user');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.id && parsed.role) {
        return {
          ...parsed,
          role: parsed.role.replace(/^ROLE_/, '') as UserRole,
        };
      }
    }
  } catch (e) {
    console.warn('Error loading active user session', e);
  }
  return null;
};

const initialUser = getInitialUser();

export const useAuthStore = create<AuthState>((set, get) => ({
  user: initialUser,
  token: initialUser ? (localStorage.getItem('auth_token') || 'local-session-active-token') : null,
  availableUsers: defaultUsers,
  activeStore: loadActiveStore(),
  registeredStores: loadRegisteredStores(),
  isAuthenticated: initialUser !== null,
  customRolePermissions: loadCustomPermissions(),

  login: (user, token) => {
    const normalizedRole = (user.role || 'CASHIER').replace(/^ROLE_/, '') as UserRole;
    const cleanUser: User = { ...user, role: normalizedRole };
    try {
      localStorage.setItem('active_user', JSON.stringify(cleanUser));
      localStorage.setItem('auth_token', token);
    } catch (e) {
      console.warn('Failed writing session to localStorage', e);
    }
    set({ user: cleanUser, token, isAuthenticated: true });
  },

  switchUser: (user) => {
    const normalizedRole = (user.role || 'CASHIER').replace(/^ROLE_/, '') as UserRole;
    const cleanUser: User = { ...user, role: normalizedRole };
    try {
      localStorage.setItem('active_user', JSON.stringify(cleanUser));
    } catch (e) {
      console.warn('Failed writing active user to localStorage', e);
    }
    set({ user: cleanUser });
  },

  logout: () => {
    try {
      localStorage.removeItem('active_user');
      localStorage.removeItem('auth_token');
      sessionStorage.clear();
    } catch (e) {
      console.warn('Failed clearing auth storage on logout', e);
    }
    set({ user: null, token: null, isAuthenticated: false });
  },

  hasPermission: (permissionOrModule: string) => {
    const user = get().user;
    if (!user) return false;

    const role = (user.role || '').replace(/^ROLE_/, '') as UserRole;
    if (role === 'OWNER') return true;

    // Check custom permissions overrides first
    const custom = get().customRolePermissions;
    if (custom[role] && typeof custom[role][permissionOrModule] === 'boolean') {
      return custom[role][permissionOrModule];
    }

    // Default permission lookup
    const roleMap = defaultRolePermissions[role];
    if (!roleMap) return false;
    return roleMap[permissionOrModule] === true;
  },

  hasRole: (role) => {
    const user = get().user;
    if (!user) return false;
    const current = (user.role || '').replace(/^ROLE_/, '') as UserRole;

    if (Array.isArray(role)) {
      const normalizedArray = role.map((r) => r.replace(/^ROLE_/, '') as UserRole);
      return normalizedArray.includes(current);
    }
    return current === role.replace(/^ROLE_/, '');
  },

  updateRolePermission: (role: UserRole, permission: string, allowed: boolean) => {
    const current = { ...get().customRolePermissions };
    if (!current[role]) current[role] = {};
    current[role][permission] = allowed;

    try {
      localStorage.setItem('cloth_shop_erp_role_permissions', JSON.stringify(current));
    } catch (e) {
      console.warn('Failed saving custom role permissions', e);
    }
    set({ customRolePermissions: current });
  },

  resetDefaultPermissions: () => {
    try {
      localStorage.removeItem('cloth_shop_erp_role_permissions');
    } catch (e) {}
    set({ customRolePermissions: {} });
  },

  updateActiveStore: (updatedFields: Partial<StoreProfile>) => {
    const current = get().activeStore;
    const merged: StoreProfile = { ...current, ...updatedFields };
    const allStores = get().registeredStores.map((s) => (s.id === merged.id ? merged : s));
    try {
      localStorage.setItem('cloth_shop_erp_active_store', JSON.stringify(merged));
      localStorage.setItem('cloth_shop_erp_stores', JSON.stringify(allStores));
      if (updatedFields.stateCode) {
        const rawSettings = localStorage.getItem('cloth_shop_erp_settings');
        const settings = rawSettings ? JSON.parse(rawSettings) : {};
        settings.storeStateCode = updatedFields.stateCode;
        localStorage.setItem('cloth_shop_erp_settings', JSON.stringify(settings));
      }
    } catch (e) {
      console.warn('Error saving store profile update', e);
    }
    set({ activeStore: merged, registeredStores: allStores });
  },

  registerNewStore: (newStoreData: Omit<StoreProfile, 'id' | 'createdAt'>) => {
    const newStore: StoreProfile = {
      ...newStoreData,
      id: Date.now(),
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };
    const updatedStores = [...get().registeredStores, newStore];
    try {
      localStorage.setItem('cloth_shop_erp_active_store', JSON.stringify(newStore));
      localStorage.setItem('cloth_shop_erp_stores', JSON.stringify(updatedStores));
      const rawSettings = localStorage.getItem('cloth_shop_erp_settings');
      const settings = rawSettings ? JSON.parse(rawSettings) : {};
      settings.storeStateCode = newStore.stateCode;
      localStorage.setItem('cloth_shop_erp_settings', JSON.stringify(settings));
    } catch (e) {
      console.warn('Error registering new store', e);
    }
    set({ activeStore: newStore, registeredStores: updatedStores });
    return newStore;
  },

  switchActiveStore: (storeId: number) => {
    const target = get().registeredStores.find((s) => s.id === storeId);
    if (!target) return;
    try {
      localStorage.setItem('cloth_shop_erp_active_store', JSON.stringify(target));
      const rawSettings = localStorage.getItem('cloth_shop_erp_settings');
      const settings = rawSettings ? JSON.parse(rawSettings) : {};
      settings.storeStateCode = target.stateCode;
      localStorage.setItem('cloth_shop_erp_settings', JSON.stringify(settings));
    } catch (e) {
      console.warn('Error switching active store', e);
    }
    set({ activeStore: target });
  },
}));
