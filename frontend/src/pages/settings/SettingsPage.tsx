import React, { useState, useEffect } from 'react';
import {
  Settings,
  Keyboard,
  Store,
  Receipt,
  Percent,
  CheckCircle,
  RotateCcw,
  Sparkles,
  ShieldAlert,
  Printer,
  Save,
  Check,
  Plus,
  Building2,
  MapPin,
  Phone,
  Mail,
  Hash,
  FileText,
  CheckCircle2,
  QrCode,
  X,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useShortcutStore } from '../../stores/shortcutStore';
import { api } from '../../services/api';
import { StoreProfile } from '../../types';

export const SettingsPage: React.FC = () => {
  const {
    activeStore,
    registeredStores,
    updateActiveStore,
    registerNewStore,
    switchActiveStore,
  } = useAuthStore();
  const { shortcuts, updateShortcut, resetDefaults } = useShortcutStore();

  const [activeSubTab, setActiveSubTab] = useState<'SHORTCUTS' | 'STORE' | 'TAX' | 'POLICIES'>('SHORTCUTS');
  const [editingShortcutId, setEditingShortcutId] = useState<string | null>(null);

  // Active Store Profile Form State
  const [storeName, setStoreName] = useState(activeStore.name);
  const [branch, setBranch] = useState(activeStore.branch || '');
  const [tagline, setTagline] = useState(activeStore.tagline || '');
  const [gstin, setGstin] = useState(activeStore.gstin);
  const [phone, setPhone] = useState(activeStore.phone);
  const [email, setEmail] = useState(activeStore.email || '');
  const [address, setAddress] = useState(activeStore.address);
  const [stateCode, setStateCode] = useState(activeStore.stateCode || '27');
  const [stateName, setStateName] = useState(activeStore.stateName || 'Maharashtra');
  const [pincode, setPincode] = useState(activeStore.pincode || '');
  const [upiId, setUpiId] = useState(activeStore.upiId || '');
  const [thermalFooter, setThermalFooter] = useState(activeStore.thermalFooter || '');
  const [storeSaveSuccess, setStoreSaveSuccess] = useState<string | null>(null);

  // Modal State for Registering Whole New Shop
  const [showRegisterShopModal, setShowRegisterShopModal] = useState(false);
  const [newShopForm, setNewShopForm] = useState({
    name: '',
    branch: '',
    tagline: '',
    gstin: '',
    phone: '',
    email: '',
    address: '',
    stateCode: '27',
    stateName: 'Maharashtra',
    pincode: '',
    upiId: '',
    thermalFooter: 'Goods once sold can be exchanged within 7 days with bill. Thank you! Visit again.',
  });

  // System Policies & Hardware Printing
  const [blockNegativeStock, setBlockNegativeStock] = useState<boolean>(true);
  const [thermalPrinterName, setThermalPrinterName] = useState<string>('');
  const [silentPrinting, setSilentPrinting] = useState<boolean>(true);
  const [storeStateCode, setStoreStateCode] = useState<string>('27');
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Tax rates
  const [gstRate, setGstRate] = useState<number>(5.0);
  const [cgstRate, setCgstRate] = useState<number>(2.5);
  const [sgstRate, setSgstRate] = useState<number>(2.5);

  // Sync state whenever active store changes
  useEffect(() => {
    setStoreName(activeStore.name);
    setBranch(activeStore.branch || '');
    setTagline(activeStore.tagline || '');
    setGstin(activeStore.gstin);
    setPhone(activeStore.phone);
    setEmail(activeStore.email || '');
    setAddress(activeStore.address);
    setStateCode(activeStore.stateCode || '27');
    setStateName(activeStore.stateName || 'Maharashtra');
    setPincode(activeStore.pincode || '');
    setUpiId(activeStore.upiId || '');
    setThermalFooter(activeStore.thermalFooter || '');
  }, [activeStore]);

  useEffect(() => {
    api.getSettings().then((s) => {
      if (s) {
        if (s.blockNegativeStock !== undefined) setBlockNegativeStock(s.blockNegativeStock);
        if (s.thermalPrinterName) setThermalPrinterName(s.thermalPrinterName);
        if (s.silentPrinting !== undefined) setSilentPrinting(s.silentPrinting);
        if (s.storeStateCode) setStoreStateCode(s.storeStateCode);
      }
    });
  }, []);

  const handleSavePolicies = async () => {
    await api.updateSettings({
      blockNegativeStock,
      thermalPrinterName,
      silentPrinting,
      storeStateCode,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleSaveStoreProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName.trim()) {
      alert('Store name cannot be empty.');
      return;
    }

    updateActiveStore({
      name: storeName.trim(),
      branch: branch.trim(),
      tagline: tagline.trim(),
      gstin: gstin.trim().toUpperCase(),
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      stateCode: stateCode.trim(),
      stateName: stateName.trim(),
      pincode: pincode.trim(),
      upiId: upiId.trim(),
      thermalFooter: thermalFooter.trim(),
    });

    api.addAuditLog(
      'SHOP_PROFILE_UPDATE',
      'SETTINGS',
      String(activeStore.id),
      `Updated active shop identity: ${storeName} (${branch})`,
      'SETTINGS_PAGE'
    );

    setStoreSaveSuccess('Store identity and receipt header updated successfully!');
    setTimeout(() => setStoreSaveSuccess(null), 3000);
  };

  const handleRegisterNewShop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShopForm.name.trim()) {
      alert('Please enter a business or shop trade name.');
      return;
    }

    // Auto extract state code from GSTIN if 15 chars provided
    let extractedStateCode = newShopForm.stateCode || '27';
    if (newShopForm.gstin.trim().length >= 2) {
      const prefix = newShopForm.gstin.trim().slice(0, 2);
      if (/^\d{2}$/.test(prefix)) extractedStateCode = prefix;
    }

    const registered = registerNewStore({
      name: newShopForm.name.trim(),
      branch: newShopForm.branch.trim() || 'Main Branch',
      tagline: newShopForm.tagline.trim(),
      gstin: newShopForm.gstin.trim().toUpperCase() || '27AABCU9603R1ZM',
      phone: newShopForm.phone.trim(),
      email: newShopForm.email.trim(),
      address: newShopForm.address.trim(),
      stateCode: extractedStateCode,
      stateName: newShopForm.stateName.trim() || 'Maharashtra',
      pincode: newShopForm.pincode.trim(),
      upiId: newShopForm.upiId.trim() || (newShopForm.phone.trim() ? `${newShopForm.phone.trim()}@upi` : ''),
      thermalFooter: newShopForm.thermalFooter.trim(),
    });

    api.addAuditLog(
      'SHOP_REGISTRATION',
      'SETTINGS',
      String(registered.id),
      `Registered whole new shop: ${registered.name} (${registered.branch})`,
      'SHOP_ONBOARDING'
    );

    setShowRegisterShopModal(false);
    setNewShopForm({
      name: '',
      branch: '',
      tagline: '',
      gstin: '',
      phone: '',
      email: '',
      address: '',
      stateCode: '27',
      stateName: 'Maharashtra',
      pincode: '',
      upiId: '',
      thermalFooter: 'Goods once sold can be exchanged within 7 days with bill. Thank you! Visit again.',
    });

    setStoreSaveSuccess(`New shop "${registered.name}" registered and activated as the primary billing store!`);
    setTimeout(() => setStoreSaveSuccess(null), 4000);
  };

  const handleKeyCapture = (id: string, e: React.KeyboardEvent) => {
    e.preventDefault();
    let combo = '';
    if (e.ctrlKey) combo += 'Ctrl+';
    if (e.altKey) combo += 'Alt+';
    if (e.shiftKey) combo += 'Shift+';
    combo += e.key;
    updateShortcut(id, combo);
    setEditingShortcutId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            System &amp; Keyboard Shortcut Settings
          </h2>
          <p className="text-xs text-gray-500 font-medium">
            Configure store identity, shop registration, POS keyboard shortcuts, GST taxes and invoice numbering
          </p>
        </div>

        {activeSubTab === 'STORE' && (
          <button
            type="button"
            onClick={() => setShowRegisterShopModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-500/20 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Register Whole New Shop / Branch</span>
          </button>
        )}
      </div>

      {storeSaveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{storeSaveSuccess}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-2 text-xs">
        <button
          onClick={() => setActiveSubTab('SHORTCUTS')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold transition ${
            activeSubTab === 'SHORTCUTS'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          <Keyboard className="w-4 h-4" />
          <span>Keyboard Shortcuts (F2–F10)</span>
        </button>
        <button
          onClick={() => setActiveSubTab('STORE')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold transition ${
            activeSubTab === 'STORE'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Shop Registration &amp; Receipt Profile</span>
        </button>
        <button
          onClick={() => setActiveSubTab('TAX')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold transition ${
            activeSubTab === 'TAX'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          <Percent className="w-4 h-4" />
          <span>Apparel GST Tax Engine</span>
        </button>
        <button
          onClick={() => setActiveSubTab('POLICIES')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold transition ${
            activeSubTab === 'POLICIES'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Guardrails &amp; Thermal Printing</span>
        </button>
      </div>

      {/* KEYBOARD SHORTCUTS TAB */}
      {activeSubTab === 'SHORTCUTS' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4 max-w-3xl">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h3 className="font-bold text-sm text-gray-900">Configurable Function Key Bindings</h3>
              <p className="text-[11px] text-gray-500">
                Click any key combination to rebind a hotkey on your physical keyboard
              </p>
            </div>
            <button
              onClick={() => resetDefaults()}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 font-bold transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>
          </div>

          <div className="space-y-2">
            {shortcuts.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 hover:border-gray-300 transition"
              >
                <div>
                  <div className="font-bold text-xs text-gray-900">{s.label}</div>
                  <div className="text-[10px] text-gray-400 font-mono">{s.description}</div>
                </div>

                {editingShortcutId === s.id ? (
                  <input
                    type="text"
                    autoFocus
                    placeholder="Press keys..."
                    onKeyDown={(e) => handleKeyCapture(s.id, e)}
                    onBlur={() => setEditingShortcutId(null)}
                    className="px-3 py-1 rounded-lg bg-blue-50 border border-blue-400 text-blue-700 font-mono font-bold text-xs text-center w-28 focus:outline-none ring-2 ring-blue-200 animate-pulse"
                  />
                ) : (
                  <button
                    onClick={() => setEditingShortcutId(s.id)}
                    className="px-3 py-1 rounded-lg bg-white border border-gray-300 hover:border-blue-400 text-gray-800 font-mono font-extrabold text-xs shadow-2xs transition"
                  >
                    {s.keyCombo}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STORE IDENTITY & SHOP REGISTRATION TAB */}
      {activeSubTab === 'STORE' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Active Store Edit Form (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-900">Active Shop Identity &amp; Receipt Header</h3>
                  <p className="text-[11px] text-gray-500">
                    Live details printed on 80mm ESC/POS thermal slips, A4 invoices, and WhatsApp messages
                  </p>
                </div>
              </div>

              <span className="px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                Active Store ID: #{activeStore.id}
              </span>
            </div>

            <form onSubmit={handleSaveStoreProfile} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Store / Business Name *</label>
                  <input
                    type="text"
                    required
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="e.g. Shravani Collection"
                    className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 font-bold focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">Branch / Location Name *</label>
                  <input
                    type="text"
                    required
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    placeholder="e.g. Pargaon (Mangrul)"
                    className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 font-medium focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Business Tagline / Subtitle (Optional)</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="e.g. &amp; New SK Telors • Complete Garments &amp; Tailoring"
                  className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">GSTIN Number (15 Digits) *</label>
                  <input
                    type="text"
                    required
                    value={gstin}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase();
                      setGstin(val);
                      if (val.length >= 2 && /^\d{2}$/.test(val.slice(0, 2))) {
                        setStateCode(val.slice(0, 2));
                      }
                    }}
                    placeholder="27AABCU9603R1ZM"
                    className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 font-mono font-bold focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">Contact Phone / Mobile *</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="8999308582"
                    className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 font-medium focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Support Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="shop@example.com"
                    className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-gray-700 font-bold mb-1">Store Address (Printed on Bills) *</label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Pargaon (Mangrul), Taluka Kavathe Mahankal, Sangli"
                    className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Pincode</label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="416410"
                    className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 font-mono focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">State Code (GST Tax Split) *</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={stateCode}
                      onChange={(e) => setStateCode(e.target.value)}
                      placeholder="27"
                      className="w-20 p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 font-mono font-bold focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition"
                    />
                    <input
                      type="text"
                      value={stateName}
                      onChange={(e) => setStateName(e.target.value)}
                      placeholder="Maharashtra"
                      className="flex-1 p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 font-medium focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">UPI ID for POS QR Payments</label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="8999308582@ybl"
                    className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 font-mono focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Thermal Receipt Policy &amp; Terms</label>
                <textarea
                  rows={2}
                  value={thermalFooter}
                  onChange={(e) => setThermalFooter(e.target.value)}
                  placeholder="Goods once sold can be exchanged within 7 days with bill. Thank you! Visit again."
                  className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-500/20 transition active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Active Store Profile</span>
                </button>

                <p className="text-[11px] text-gray-400 font-medium">
                  Persists to local database, bill layouts &amp; sidebar instantly.
                </p>
              </div>
            </form>
          </div>

          {/* Right Column: Registered Outlets & Branches (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <Store className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-gray-900">Registered Shops</h3>
                    <p className="text-[11px] text-gray-500">Multi-branch network</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowRegisterShopModal(true)}
                  className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition"
                  title="Register another shop"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                {registeredStores.map((st) => {
                  const isActive = activeStore.id === st.id;
                  return (
                    <div
                      key={st.id}
                      className={`p-3.5 rounded-xl border space-y-2 transition ${
                        isActive
                          ? 'bg-blue-50/70 border-blue-300 ring-2 ring-blue-100 shadow-2xs'
                          : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="font-bold text-sm text-gray-900 leading-snug">
                          {st.name}
                        </div>
                        {isActive ? (
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold font-mono">
                            ACTIVE NOW
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              switchActiveStore(st.id);
                              setStoreSaveSuccess(`Switched active terminal shop to ${st.name}!`);
                              setTimeout(() => setStoreSaveSuccess(null), 3000);
                            }}
                            className="text-[10px] px-2 py-0.5 rounded-lg bg-white border border-gray-300 hover:bg-gray-100 font-bold text-blue-600 shadow-2xs transition"
                          >
                            Switch ↵
                          </button>
                        )}
                      </div>

                      <div className="text-xs text-gray-600 font-medium flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        <span className="truncate">{st.branch} • {st.address}</span>
                      </div>

                      <div className="text-[11px] text-gray-500 font-mono flex items-center justify-between pt-1 border-t border-gray-100">
                        <span>GSTIN: {st.gstin}</span>
                        <span>Ph: {st.phone}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => setShowRegisterShopModal(true)}
                className="w-full py-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 border border-dashed border-gray-300 text-xs font-bold text-gray-700 transition flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4 text-blue-600" />
                <span>+ Register New Shop / Outlet</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAX CONFIGURATION TAB */}
      {activeSubTab === 'TAX' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5 max-w-2xl">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Percent className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-gray-900">GST Tax Behavior Configuration</h3>
              <p className="text-[11px] text-gray-500">Default tax splits applied across retail invoices</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Standard GST Rate (%)</label>
              <input
                type="number"
                value={gstRate}
                onChange={(e) => setGstRate(Number(e.target.value) || 0)}
                className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 font-mono font-extrabold text-sm focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1">CGST Share (%)</label>
              <input
                type="number"
                value={cgstRate}
                onChange={(e) => setCgstRate(Number(e.target.value) || 0)}
                className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 font-mono font-semibold focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1">SGST Share (%)</label>
              <input
                type="number"
                value={sgstRate}
                onChange={(e) => setSgstRate(Number(e.target.value) || 0)}
                className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 font-mono font-semibold focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition"
              />
            </div>
          </div>

          <p className="text-xs text-gray-500 leading-relaxed">
            All prices computed in POS billing automatically apply this tax breakdown on retail invoices and GST reports.
          </p>
        </div>
      )}

      {/* POLICIES & HARDWARE PRINTING TAB */}
      {activeSubTab === 'POLICIES' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-6 max-w-2xl">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-gray-900">Inventory Guardrails &amp; Thermal Printing</h3>
              <p className="text-[11px] text-gray-500">Configure POS checkout constraints, ESC/POS hardware &amp; GST origin</p>
            </div>
          </div>

          <div className="space-y-5 text-xs">
            {/* Guardrail 1: Block Negative Stock */}
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="font-bold text-gray-900 flex items-center gap-2">
                  <span>Block Negative Stock in POS Checkout</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                      blockNegativeStock ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {blockNegativeStock ? 'ENFORCED' : 'DISABLED'}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  When enabled, cashier cannot add out-of-stock garments to the cart or checkout with negative inventory.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={blockNegativeStock}
                  onChange={(e) => setBlockNegativeStock(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
              </label>
            </div>

            {/* Hardware: Silent Thermal Printing */}
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="font-bold text-gray-900 flex items-center gap-2">
                  <span>Silent ESC/POS Direct Receipt Printing</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                      silentPrinting ? 'bg-blue-100 text-blue-800' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {silentPrinting ? 'SILENT' : 'PREVIEW'}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  Directly dispatch 80mm ESC/POS thermal receipts to receipt printer without opening system print dialog.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={silentPrinting}
                  onChange={(e) => setSilentPrinting(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
              </label>
            </div>

            {/* Printer Device Name */}
            <div>
              <label className="block text-gray-700 font-semibold mb-1">
                Designated Thermal Receipt Printer Device Name
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. POS-80C, EPSON TM-T82, or leave blank for default system printer"
                  value={thermalPrinterName}
                  onChange={(e) => setThermalPrinterName(e.target.value)}
                  className="flex-1 p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 font-mono focus:bg-white focus:border-blue-600 focus:outline-none"
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-1">
                Electron desktop shell will silently target this device name via contextBridge IPC.
              </p>
            </div>

            {/* GST Store State Code */}
            <div>
              <label className="block text-gray-700 font-semibold mb-1">
                Store GST State Code (for Intra/Inter-state Apparel Tax Split)
              </label>
              <input
                type="text"
                placeholder="27 (Maharashtra)"
                value={storeStateCode}
                onChange={(e) => setStoreStateCode(e.target.value)}
                className="w-32 p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 font-mono font-bold focus:bg-white focus:border-blue-600 focus:outline-none"
              />
              <p className="text-[10px] text-gray-400 mt-1">
                State Code 27 splits apparel GST into 2.5% CGST + 2.5% SGST (&lt;₹1000) or 6% CGST + 6% SGST (&gt;=₹1000). Other states apply IGST.
              </p>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={handleSavePolicies}
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm shadow-blue-600/20 transition active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>Save Guardrails &amp; Policies</span>
              </button>
              {saveSuccess && (
                <span className="text-emerald-700 font-bold text-xs flex items-center gap-1 animate-in fade-in">
                  <Check className="w-4 h-4" /> Preferences saved successfully!
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: REGISTER WHOLE NEW SHOP / OUTLET */}
      {showRegisterShopModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl w-full max-w-xl overflow-hidden p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-extrabold text-base text-gray-900">Register Whole New Shop / Outlet</h2>
                  <p className="text-xs text-gray-500">
                    Create a new store profile for thermal receipts, GST billing, and terminal branding
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowRegisterShopModal(false)}
                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRegisterNewShop} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Business / Shop Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mahalaxmi Silk &amp; Cloth Stores"
                    value={newShopForm.name}
                    onChange={(e) => setNewShopForm({ ...newShopForm, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 font-bold focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">Branch / Market Location *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kolhapur Main Market"
                    value={newShopForm.branch}
                    onChange={(e) => setNewShopForm({ ...newShopForm, branch: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 font-medium focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Specialization / Tagline</label>
                <input
                  type="text"
                  placeholder="e.g. The Complete Family Clothing &amp; Tailoring Hub"
                  value={newShopForm.tagline}
                  onChange={(e) => setNewShopForm({ ...newShopForm, tagline: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">GSTIN Number (15 Digits) *</label>
                  <input
                    type="text"
                    required
                    placeholder="27AABCU9603R1ZM"
                    value={newShopForm.gstin}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase();
                      let detectedCode = newShopForm.stateCode;
                      if (val.length >= 2 && /^\d{2}$/.test(val.slice(0, 2))) {
                        detectedCode = val.slice(0, 2);
                      }
                      setNewShopForm({ ...newShopForm, gstin: val, stateCode: detectedCode });
                    }}
                    className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 font-mono font-bold focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">Contact Phone / Mobile *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 9822012345"
                    value={newShopForm.phone}
                    onChange={(e) => setNewShopForm({ ...newShopForm, phone: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 font-medium focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Store Email</label>
                  <input
                    type="email"
                    placeholder="branch@clothshop.com"
                    value={newShopForm.email}
                    onChange={(e) => setNewShopForm({ ...newShopForm, email: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-gray-700 font-bold mb-1">Full Shop Address *</label>
                  <input
                    type="text"
                    required
                    placeholder="Shop No. 4, Textile Market, Kolhapur"
                    value={newShopForm.address}
                    onChange={(e) => setNewShopForm({ ...newShopForm, address: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Pincode</label>
                  <input
                    type="text"
                    placeholder="416002"
                    value={newShopForm.pincode}
                    onChange={(e) => setNewShopForm({ ...newShopForm, pincode: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 font-mono focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">State Code (For GST Split)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newShopForm.stateCode}
                      onChange={(e) => setNewShopForm({ ...newShopForm, stateCode: e.target.value })}
                      placeholder="27"
                      className="w-20 p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 font-mono font-bold focus:bg-white"
                    />
                    <input
                      type="text"
                      value={newShopForm.stateName}
                      onChange={(e) => setNewShopForm({ ...newShopForm, stateName: e.target.value })}
                      placeholder="Maharashtra"
                      className="flex-1 p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 font-medium focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">UPI ID for POS QR Payments</label>
                  <input
                    type="text"
                    placeholder="shopname@upi"
                    value={newShopForm.upiId}
                    onChange={(e) => setNewShopForm({ ...newShopForm, upiId: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 font-mono focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Thermal Receipt Footer Policy Note</label>
                <textarea
                  rows={2}
                  value={newShopForm.thermalFooter}
                  onChange={(e) => setNewShopForm({ ...newShopForm, thermalFooter: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:border-blue-600"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowRegisterShopModal(false)}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-gray-100 text-xs font-bold text-gray-700 border border-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-500/20 transition active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Complete Registration &amp; Activate Shop</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
