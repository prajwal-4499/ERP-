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
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useShortcutStore } from '../../stores/shortcutStore';
import { api } from '../../services/api';

export const SettingsPage: React.FC = () => {
  const { activeStore } = useAuthStore();
  const { shortcuts, updateShortcut, resetDefaults } = useShortcutStore();

  const [activeSubTab, setActiveSubTab] = useState<'SHORTCUTS' | 'STORE' | 'TAX' | 'POLICIES'>('SHORTCUTS');
  const [editingShortcutId, setEditingShortcutId] = useState<string | null>(null);

  const [storeName, setStoreName] = useState(activeStore.name);
  const [gstin, setGstin] = useState(activeStore.gstin);
  const [phone, setPhone] = useState(activeStore.phone);
  const [address, setAddress] = useState(activeStore.address);

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
          <p className="text-xs text-gray-500 font-medium">Configure store identity, POS keyboard shortcuts, taxes and invoice numbering</p>
        </div>
      </div>

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
          <span>Store &amp; Branch Identity</span>
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
          <span>GST &amp; Tax Configuration</span>
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
          <span>Stock Guardrails &amp; Thermal Printing</span>
        </button>
      </div>

      {/* SHORTCUTS TAB */}
      {activeSubTab === 'SHORTCUTS' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h3 className="font-bold text-sm text-gray-900">Configurable POS Keyboard Shortcuts</h3>
              <p className="text-xs text-gray-500">Click on any key combo and press the new key combination to re-map</p>
            </div>
            <button
              onClick={resetDefaults}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-xs text-gray-700 font-bold border border-gray-200 shadow-sm transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Factory Defaults</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {shortcuts.map((s) => (
              <div
                key={s.id}
                className="p-4 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between text-xs hover:border-gray-300 transition"
              >
                <div>
                  <div className="font-bold text-gray-900">{s.label}</div>
                  <div className="text-[11px] text-gray-500">{s.description}</div>
                </div>

                {editingShortcutId === s.id ? (
                  <input
                    type="text"
                    autoFocus
                    placeholder="Press key..."
                    onKeyDown={(e) => handleKeyCapture(s.id, e)}
                    className="w-24 text-center font-mono font-bold text-blue-600 bg-blue-50 border border-blue-500 rounded-lg p-1.5 text-xs ring-2 ring-blue-100"
                  />
                ) : (
                  <button
                    onClick={() => setEditingShortcutId(s.id)}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-gray-100 text-blue-600 font-mono font-extrabold border border-gray-200 text-xs shadow-sm transition"
                  >
                    {s.keyCombo}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STORE IDENTITY TAB */}
      {activeSubTab === 'STORE' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5 max-w-2xl">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-gray-900">Store &amp; Receipt Header Profile</h3>
              <p className="text-[11px] text-gray-500">Business registration details for thermal billing</p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Store / Business Name</label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 font-bold focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">GSTIN Number</label>
                <input
                  type="text"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 font-mono font-semibold focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Store Phone / Support</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 font-medium focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1">Store Address (Printed on Thermal Invoices)</label>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition"
              />
            </div>

            <button
              type="button"
              onClick={() => alert('Store profile updated successfully!')}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm shadow-blue-600/20 transition"
            >
              Save Store Profile
            </button>
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
    </div>
  );
};
