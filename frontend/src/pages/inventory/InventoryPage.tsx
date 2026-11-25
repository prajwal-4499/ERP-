import React, { useState, useEffect } from 'react';
import {
  Boxes,
  Plus,
  Minus,
  AlertTriangle,
  Search,
  FileText,
  ShoppingCart,
  Truck,
  ArrowRight,
  Printer,
  CheckCircle2,
  DollarSign,
  PackageCheck,
  Calendar,
  Building,
  Eye,
  Trash2,
  Clock,
  Timer,
  Flame,
} from 'lucide-react';
import { ProductVariant, Supplier, PurchaseOrder, PurchaseOrderItem, SupplierBill, SupplierBillItem } from '../../types';
import { api } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import { useFocusTrap } from '../../utils/useFocusTrap';

export const InventoryPage: React.FC = () => {
  const { activeStore } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'STOCK' | 'AGING' | 'PO' | 'BILLS'>('STOCK');

  // Stock state
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState<number>(0);
  const [search, setSearch] = useState('');
  const [filterLowStock, setFilterLowStock] = useState(false);

  // Aging Stock state
  const [agingDays, setAgingDays] = useState<number>(60);
  const [agingVariants, setAgingVariants] = useState<any[]>([]);

  // Stock Adjustment & Transfer
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [adjustQty, setAdjustQty] = useState<number>(1);
  const [adjustType, setAdjustType] = useState<'ADD' | 'REMOVE'>('ADD');
  const [adjustReason, setAdjustReason] = useState('Stock Count Audit Adjustment');

  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [targetBranch, setTargetBranch] = useState('Mall Outlet Branch - Forum South');
  const [transferQty, setTransferQty] = useState<number>(2);

  // Suppliers, POs, and Purchase Bills
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [supplierBills, setSupplierBills] = useState<SupplierBill[]>([]);

  // PO Creation Modal
  const [createPOModalOpen, setCreatePOModalOpen] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState<number>(1);
  const [poExpectedDate, setPoExpectedDate] = useState<string>(
    new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10)
  );
  const [poNotes, setPoNotes] = useState<string>('');
  const [poLineItems, setPoLineItems] = useState<
    { variantId: number; articleName: string; sku: string; color: string; size: string; orderedQty: number; unitCost: number; taxRate: number }[]
  >([]);

  // Purchase Bill (GRN Inward) Creation Modal
  const [createBillModalOpen, setCreateBillModalOpen] = useState(false);
  const [billSupplierId, setBillSupplierId] = useState<number>(1);
  const [billInvoiceNo, setBillInvoiceNo] = useState<string>('');
  const [billDate, setBillDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [billDueDate, setBillDueDate] = useState<string>(
    new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10)
  );
  const [linkedPoNo, setLinkedPoNo] = useState<string>('');
  const [billPaymentMode, setBillPaymentMode] = useState<string>('BANK_TRANSFER');
  const [billPaidAmount, setBillPaidAmount] = useState<number>(0);
  const [billLineItems, setBillLineItems] = useState<
    { variantId: number; articleName: string; sku: string; color: string; size: string; quantity: number; costPrice: number; sellingPrice: number; taxRate: number }[]
  >([]);

  // View Bill Modal
  const [viewBill, setViewBill] = useState<SupplierBill | null>(null);

  // Focus Traps for Modals
  const adjustModalRef = useFocusTrap(adjustModalOpen, () => setAdjustModalOpen(false));
  const transferModalRef = useFocusTrap(transferModalOpen, () => setTransferModalOpen(false));
  const createPOModalRef = useFocusTrap(createPOModalOpen, () => setCreatePOModalOpen(false));
  const createBillModalRef = useFocusTrap(createBillModalOpen, () => setCreateBillModalOpen(false));
  const viewBillModalRef = useFocusTrap(!!viewBill, () => setViewBill(null));

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    api.getAgingInventory(agingDays).then(setAgingVariants);
  }, [agingDays]);

  const loadAllData = async () => {
    const [allVars, suppList, pos, bills, aging] = await Promise.all([
      api.getAllVariants(),
      api.getSuppliers(),
      api.getPurchaseOrders(),
      api.getSupplierBills(),
      api.getAgingInventory(agingDays),
    ]);
    setVariants(allVars);
    setSuppliers(suppList);
    setPurchaseOrders(pos);
    setSupplierBills(bills);
    setAgingVariants(aging);
    if (suppList.length > 0) {
      setSelectedSupplierId(suppList[0].id);
      setBillSupplierId(suppList[0].id);
    }
  };

  const filtered = variants.filter((v) => {
    const match =
      v.articleName.toLowerCase().includes(search.toLowerCase()) ||
      v.sku.toLowerCase().includes(search.toLowerCase()) ||
      v.barcode.includes(search);
    if (filterLowStock) return match && v.stock <= v.reorderLevel;
    return match;
  });

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (filtered.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedVariantIndex((prev) => Math.min(filtered.length - 1, prev + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedVariantIndex((prev) => Math.max(0, prev - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedVariantIndex]) {
        setSelectedVariant(filtered[selectedVariantIndex]);
        setAdjustType('ADD');
        setAdjustQty(1);
        setAdjustModalOpen(true);
      }
    } else if (e.key === 'Home') {
      e.preventDefault();
      setSelectedVariantIndex(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setSelectedVariantIndex(filtered.length - 1);
    }
  };

  const handleAdjustSubmit = () => {
    if (!selectedVariant) return;
    const change = adjustType === 'ADD' ? adjustQty : -adjustQty;
    selectedVariant.stock = Math.max(0, selectedVariant.stock + change);
    api.addAuditLog(
      'STOCK_ADJUSTMENT',
      'INVENTORY',
      selectedVariant.sku,
      `${adjustType === 'ADD' ? 'Added' : 'Removed'} ${adjustQty} qty. Reason: ${adjustReason}`
    );
    setAdjustModalOpen(false);
  };

  const handleTransferSubmit = () => {
    if (!selectedVariant) return;
    if (selectedVariant.stock < transferQty) {
      alert('Insufficient stock to transfer.');
      return;
    }
    selectedVariant.stock -= transferQty;
    api.addAuditLog(
      'STOCK_TRANSFER',
      'INVENTORY',
      selectedVariant.sku,
      `Dispatched ${transferQty} qty to branch: ${targetBranch}`
    );
    setTransferModalOpen(false);
  };

  // Add Item to PO Line Items
  const handleAddPoItem = (variant: ProductVariant) => {
    if (poLineItems.some((it) => it.variantId === variant.id)) return;
    setPoLineItems([
      ...poLineItems,
      {
        variantId: variant.id,
        articleName: variant.articleName,
        sku: variant.sku,
        color: variant.color,
        size: variant.size,
        orderedQty: 20,
        unitCost: variant.costPrice,
        taxRate: 5,
      },
    ]);
  };

  // Submit PO
  const handleCreatePOSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (poLineItems.length === 0) {
      alert('Please add at least one line item to the Purchase Order.');
      return;
    }

    const subtotal = poLineItems.reduce((sum, it) => sum + it.orderedQty * it.unitCost, 0);
    const taxAmount = poLineItems.reduce((sum, it) => sum + (it.orderedQty * it.unitCost * it.taxRate) / 100, 0);
    const grandTotal = Math.round(subtotal + taxAmount);

    const supp = suppliers.find((s) => s.id === selectedSupplierId);

    await api.createPurchaseOrder({
      supplierId: selectedSupplierId,
      supplierName: supp?.name || 'Textile Supplier',
      expectedDate: poExpectedDate,
      notes: poNotes,
      subtotal,
      taxAmount,
      grandTotal,
      items: poLineItems.map((it, idx) => ({
        id: idx + 1,
        variantId: it.variantId,
        articleName: it.articleName,
        sku: it.sku,
        color: it.color,
        size: it.size,
        orderedQty: it.orderedQty,
        receivedQty: 0,
        unitCost: it.unitCost,
        taxRate: it.taxRate,
        totalAmount: Math.round(it.orderedQty * it.unitCost * (1 + it.taxRate / 100)),
      })),
    });

    setPoLineItems([]);
    setPoNotes('');
    setCreatePOModalOpen(false);
    loadAllData();
  };

  // Inward PO to Purchase Bill
  const handleConvertPoToBill = (po: PurchaseOrder) => {
    setBillSupplierId(po.supplierId);
    setLinkedPoNo(po.poNumber);
    setBillInvoiceNo(`INV-${po.supplierName.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`);
    setBillLineItems(
      po.items.map((it) => {
        const v = variants.find((vr) => vr.id === it.variantId);
        return {
          variantId: it.variantId || 1,
          articleName: it.articleName,
          sku: it.sku || '',
          color: it.color || '',
          size: it.size || '',
          quantity: it.orderedQty,
          costPrice: it.unitCost,
          sellingPrice: v ? v.sellingPrice : Math.round(it.unitCost * 1.8),
          taxRate: it.taxRate,
        };
      })
    );
    setCreateBillModalOpen(true);
  };

  // Add Item to Purchase Bill Line Items
  const handleAddBillItem = (variant: ProductVariant) => {
    if (billLineItems.some((it) => it.variantId === variant.id)) return;
    setBillLineItems([
      ...billLineItems,
      {
        variantId: variant.id,
        articleName: variant.articleName,
        sku: variant.sku,
        color: variant.color,
        size: variant.size,
        quantity: 15,
        costPrice: variant.costPrice,
        sellingPrice: variant.sellingPrice,
        taxRate: 5,
      },
    ]);
  };

  // Submit Purchase Bill (Inward stock and create supplier ledger)
  const handleCreateBillSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (billLineItems.length === 0) {
      alert('Please add at least one line item to inward stock.');
      return;
    }
    if (!billInvoiceNo.trim()) {
      alert('Please enter Supplier Bill / Invoice Number.');
      return;
    }

    const taxableAmount = billLineItems.reduce((sum, it) => sum + it.quantity * it.costPrice, 0);
    const gstAmount = billLineItems.reduce((sum, it) => sum + (it.quantity * it.costPrice * it.taxRate) / 100, 0);
    const amount = Math.round(taxableAmount + gstAmount);

    const supp = suppliers.find((s) => s.id === billSupplierId);

    await api.createSupplierBillWithItems({
      supplierId: billSupplierId,
      supplierName: supp?.name || 'Textile Supplier',
      supplierInvoiceNo: billInvoiceNo.trim(),
      purchaseDate: billDate,
      dueDate: billDueDate,
      poNumber: linkedPoNo || undefined,
      taxableAmount,
      gstAmount,
      amount,
      paidAmount: billPaidAmount,
      notes: `Inward purchase bill from ${supp?.name || 'vendor'}`,
      items: billLineItems.map((it, idx) => ({
        id: idx + 1,
        variantId: it.variantId,
        articleName: it.articleName,
        sku: it.sku,
        color: it.color,
        size: it.size,
        quantity: it.quantity,
        costPrice: it.costPrice,
        sellingPrice: it.sellingPrice,
        taxRate: it.taxRate,
        totalAmount: Math.round(it.quantity * it.costPrice * (1 + it.taxRate / 100)),
      })),
    });

    setBillLineItems([]);
    setBillInvoiceNo('');
    setLinkedPoNo('');
    setBillPaidAmount(0);
    setCreateBillModalOpen(false);
    loadAllData();
    alert('Purchase Bill created successfully! Stock has been updated automatically.');
  };

  const lowStockCount = variants.filter((v) => v.stock <= v.reorderLevel).length;
  const totalStockCount = variants.reduce((sum, v) => sum + v.stock, 0);
  const totalStockValuation = variants.reduce((sum, v) => sum + v.stock * v.sellingPrice, 0);

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-[#1F2937] tracking-tight flex items-center gap-2.5">
            <Boxes className="w-7 h-7 text-blue-600" />
            <span>Inventory, Purchase Orders &amp; Bills</span>
          </h1>
          <p className="text-xs text-gray-500 font-normal mt-0.5">
            2,000+ fashion styles in Indian Rupees (₹), make Purchase Orders, and inward Purchase Bills with automated stock update
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setCreatePOModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Make Purchase Order (PO)</span>
          </button>

          <button
            type="button"
            onClick={() => setCreateBillModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Make Purchase Bill (GRN)</span>
          </button>
        </div>
      </div>

      {/* Tabs: Stock Catalog vs Purchase Orders vs Purchase Bills */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('STOCK')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'STOCK'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Boxes className="w-3.5 h-3.5" />
          <span>Stock Valuation &amp; Catalog ({variants.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('AGING')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'AGING'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Stock Aging &amp; Dead Stock ({agingVariants.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('PO')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'PO'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          <span>Purchase Orders ({purchaseOrders.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('BILLS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'BILLS'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Purchase Bills &amp; Inward ({supplierBills.length})</span>
        </button>
      </div>

      {/* TAB 1: STOCK CATALOG & VALUATION */}
      {activeTab === 'STOCK' && (
        <div className="space-y-5">
          {/* Metrics Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200">
              <div className="text-[10px] font-bold text-blue-800 uppercase tracking-wide">
                Total Styles / Variants
              </div>
              <div className="text-xl font-black font-mono text-blue-700 mt-0.5">
                {variants.length.toLocaleString()}
              </div>
              <div className="text-[10px] text-blue-600 mt-0.5">Across 8 Major Domains</div>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200">
              <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wide">
                Current Stock In Hand
              </div>
              <div className="text-xl font-black font-mono text-emerald-700 mt-0.5">
                {totalStockCount.toLocaleString()} Pcs
              </div>
              <div className="text-[10px] text-emerald-600 mt-0.5">Total Quantity in Pargaon</div>
            </div>

            <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200">
              <div className="text-[10px] font-bold text-purple-800 uppercase tracking-wide">
                Total Inventory Valuation
              </div>
              <div className="text-xl font-black font-mono text-purple-700 mt-0.5">
                ₹{totalStockValuation.toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-purple-600 mt-0.5">At Selling Price</div>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 flex flex-col justify-between">
              <div>
                <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wide">
                  Low Stock Reorder Alerts
                </div>
                <div className="text-xl font-black font-mono text-amber-700 mt-0.5">
                  {lowStockCount} Styles
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFilterLowStock(!filterLowStock)}
                className={`mt-1 py-1 px-2 rounded-lg text-[10px] font-bold border transition ${
                  filterLowStock ? 'bg-amber-600 text-white' : 'bg-white text-amber-800 border-amber-300'
                }`}
              >
                {filterLowStock ? 'Showing Low Stock' : 'Filter Low Stock'}
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="p-3.5 bg-white rounded-2xl border border-gray-200 shadow-sm flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search Inventory by SKU, Barcode, Style, Color (↑↓ to navigate)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs text-[#1F2937] placeholder:text-gray-400 focus:bg-white focus:border-[#2563EB] focus:outline-none font-sans"
              />
            </div>
            <div className="text-xs text-gray-500 font-mono">
              Showing <strong>{filtered.length}</strong> of {variants.length}
            </div>
          </div>

          {/* Inventory Table */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold border-b border-gray-200 sticky top-0 z-10">
                  <tr>
                    <th className="p-3">SKU / Barcode</th>
                    <th className="p-3 font-sans">Garment Style</th>
                    <th className="p-3 font-sans">Color &amp; Size</th>
                    <th className="p-3 text-right">Cost (₹)</th>
                    <th className="p-3 text-right">Selling Price (₹)</th>
                    <th className="p-3 text-center">Stock</th>
                    <th className="p-3 text-center">Reorder</th>
                    <th className="p-3 text-center font-sans">Status</th>
                    <th className="p-3 text-right font-sans">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.slice(0, 150).map((v, idx) => {
                    const isSelected = selectedVariantIndex === idx;
                    return (
                      <tr
                        key={v.id}
                        onClick={() => setSelectedVariantIndex(idx)}
                        className={`transition ${isSelected ? 'bg-blue-50/70 font-semibold' : 'hover:bg-gray-50/80'}`}
                      >
                        <td className="p-3">
                          <div className="font-bold text-[#2563EB]">{v.sku}</div>
                          <div className="text-[10px] text-gray-500 font-normal">{v.barcode}</div>
                        </td>
                        <td className="p-3 font-bold text-[#1F2937] font-sans">{v.articleName}</td>
                        <td className="p-3 font-sans">
                          <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 mr-1 font-medium">{v.color}</span>
                          <span className="font-extrabold text-[#1F2937]">{v.size}</span>
                        </td>
                        <td className="p-3 text-right text-gray-500">₹{v.costPrice.toLocaleString('en-IN')}</td>
                        <td className="p-3 text-right font-extrabold text-[#10B981]">₹{v.sellingPrice.toLocaleString('en-IN')}</td>
                        <td className="p-3 text-center font-bold text-[#1F2937]">
                          <span
                            className={`px-2.5 py-0.5 rounded-md font-mono ${
                              v.stock <= v.reorderLevel ? 'bg-red-50 text-[#EF4444] font-black' : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {v.stock}
                          </span>
                        </td>
                        <td className="p-3 text-center text-gray-500">{v.reorderLevel}</td>
                        <td className="p-3 text-center font-sans">
                          {v.stock <= v.reorderLevel ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-[#EF4444] border border-red-200">
                              Reorder Alert
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-[#10B981] border border-emerald-200">
                              Adequate
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right font-sans">
                          <div className="flex justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedVariant(v);
                                setAdjustModalOpen(true);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-[#2563EB] text-[11px] font-bold"
                            >
                              Adjust
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedVariant(v);
                                setTransferModalOpen(true);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-[11px] font-bold"
                            >
                              Transfer
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: STOCK AGING & DEAD STOCK (60 / 90 / 180+ DAYS) */}
      {activeTab === 'AGING' && (
        <div className="space-y-5">
          {/* Metrics Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200">
              <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Aging Garments</span>
              </div>
              <div className="text-xl font-black text-amber-900 mt-1">
                {agingVariants.length} <span className="text-xs font-normal text-amber-700">articles</span>
              </div>
              <div className="text-[10px] text-amber-700 mt-0.5">
                {agingVariants.reduce((s, v) => s + v.stock, 0)} total pieces unsold
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-rose-50/80 border border-rose-200">
              <div className="text-[11px] font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
                <Timer className="w-3.5 h-3.5" />
                <span>Tied Working Capital</span>
              </div>
              <div className="text-xl font-black text-rose-900 font-mono mt-1">
                ₹{agingVariants.reduce((s, v) => s + v.tiedCapital, 0).toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-rose-700 mt-0.5">
                Locked in slow-moving inventory
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-orange-50/80 border border-orange-200">
              <div className="text-[11px] font-bold text-orange-700 uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5" />
                <span>Dead Stock (&gt;180 Days)</span>
              </div>
              <div className="text-xl font-black text-orange-900 mt-1">
                {agingVariants.filter((v) => v.daysUnsold >= 180).length} <span className="text-xs font-normal text-orange-700">items</span>
              </div>
              <div className="text-[10px] text-orange-700 mt-0.5">
                Immediate clearance candidates
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-purple-50/80 border border-purple-200">
              <div className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">
                Retail Valuation
              </div>
              <div className="text-xl font-black text-purple-900 font-mono mt-1">
                ₹{agingVariants.reduce((s, v) => s + v.stock * v.sellingPrice, 0).toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-purple-700 mt-0.5">
                Potential gross recovery
              </div>
            </div>
          </div>

          {/* Aging Controls: Threshold Selector */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-700">Filter Aging Threshold:</span>
              <div className="flex gap-1.5 bg-gray-100 p-1 rounded-xl">
                {[
                  { days: 60, label: '60+ Days Unsold' },
                  { days: 90, label: '90+ Days Unsold' },
                  { days: 180, label: '180+ Days (Dead Stock)' },
                ].map((th) => (
                  <button
                    key={th.days}
                    type="button"
                    onClick={() => setAgingDays(th.days)}
                    className={`px-3 py-1.5 rounded-lg font-bold transition text-xs ${
                      agingDays === th.days
                        ? 'bg-amber-600 text-white shadow-2xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {th.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-gray-500 font-medium">
              Showing garments with zero sales or inward stock movement for at least {agingDays} days
            </div>
          </div>

          {/* Aging Table */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden text-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#F8F9FA] text-gray-500 font-bold uppercase text-[10px] tracking-wider border-b border-gray-200">
                  <tr>
                    <th className="p-3.5">ARTICLE &amp; SKU</th>
                    <th className="p-3.5">BRAND / CATEGORY</th>
                    <th className="p-3.5 text-center">SIZE &amp; COLOR</th>
                    <th className="p-3.5 text-center">TYPE</th>
                    <th className="p-3.5 text-center">STOCK</th>
                    <th className="p-3.5 text-right">COST PRICE</th>
                    <th className="p-3.5 text-right">SELLING PRICE</th>
                    <th className="p-3.5 text-right">TIED CAPITAL</th>
                    <th className="p-3.5 text-center">DAYS UNSOLD</th>
                    <th className="p-3.5 text-center">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {agingVariants.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="p-8 text-center text-gray-400">
                        🎉 Great news! No inventory items currently qualify as aging ({agingDays}+ days unsold).
                      </td>
                    </tr>
                  ) : (
                    agingVariants.map((v) => {
                      const isFabric = v.unitType === 'METER';
                      const isDeadStock = v.daysUnsold >= 180;
                      return (
                        <tr key={v.id} className="hover:bg-amber-50/30 transition">
                          <td className="p-3.5">
                            <div className="font-bold text-gray-900">{v.articleName}</div>
                            <div className="text-[10px] text-gray-400 font-mono">{v.sku}</div>
                          </td>
                          <td className="p-3.5 font-medium text-gray-700">
                            <div>{v.brand}</div>
                            <div className="text-[10px] text-gray-400">{v.category}</div>
                          </td>
                          <td className="p-3.5 text-center font-medium">
                            <span className="font-semibold text-gray-900">{v.size}</span>
                            {v.color && <div className="text-[10px] text-gray-400">{v.color}</div>}
                          </td>
                          <td className="p-3.5 text-center">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                isFabric ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {isFabric ? 'METER' : 'PCS'}
                            </span>
                          </td>
                          <td className="p-3.5 text-center font-bold text-gray-900 font-mono">
                            {v.stock}
                          </td>
                          <td className="p-3.5 text-right font-mono text-gray-600">
                            ₹{v.costPrice.toFixed(2)}
                          </td>
                          <td className="p-3.5 text-right font-mono font-bold text-gray-900">
                            ₹{v.sellingPrice.toFixed(2)}
                          </td>
                          <td className="p-3.5 text-right font-mono font-bold text-rose-700">
                            ₹{v.tiedCapital.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-3.5 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                                isDeadStock
                                  ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                  : v.daysUnsold >= 90
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {v.daysUnsold} Days
                            </span>
                          </td>
                          <td className="p-3.5 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedVariant(v);
                                setAdjustType('REMOVE');
                                setAdjustReason(`Clearance write-off / dead stock markdown after ${v.daysUnsold} days`);
                                setAdjustModalOpen(true);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-bold border border-amber-200 transition"
                            >
                              Markdown / Clear
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      {activeTab === 'PO' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-200">
            <div>
              <h3 className="font-bold text-sm text-gray-900">Purchase Orders Issued to Suppliers</h3>
              <p className="text-xs text-gray-500">Create vendor orders, check delivery commitments, and convert to Purchase Bills</p>
            </div>
            <button
              type="button"
              onClick={() => setCreatePOModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create Purchase Order</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold border-b border-gray-200">
                <tr>
                  <th className="p-3">PO Number</th>
                  <th className="p-3">Supplier</th>
                  <th className="p-3">Order Date</th>
                  <th className="p-3">Expected Date</th>
                  <th className="p-3">Items Count</th>
                  <th className="p-3 text-right">Grand Total (₹)</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {purchaseOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-10 text-center text-gray-400">
                      No Purchase Orders created yet. Click &quot;Create Purchase Order&quot; to issue an order to suppliers.
                    </td>
                  </tr>
                ) : (
                  purchaseOrders.map((po) => (
                    <tr key={po.id} className="hover:bg-gray-50 transition">
                      <td className="p-3 font-bold font-mono text-blue-600">{po.poNumber}</td>
                      <td className="p-3 font-semibold text-gray-900">{po.supplierName}</td>
                      <td className="p-3 text-gray-600">{po.orderDate}</td>
                      <td className="p-3 text-gray-600">{po.expectedDate || '—'}</td>
                      <td className="p-3 font-medium text-gray-700">{po.items.length} items ({po.items.reduce((s, it) => s + it.orderedQty, 0)} pcs)</td>
                      <td className="p-3 text-right font-black font-mono text-gray-900">₹{po.grandTotal.toLocaleString('en-IN')}</td>
                      <td className="p-3 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            po.status === 'RECEIVED'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : po.status === 'ORDERED'
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {po.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex justify-end gap-1.5">
                          {po.status !== 'RECEIVED' && (
                            <button
                              type="button"
                              onClick={() => handleConvertPoToBill(po)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center gap-1"
                              title="Inward this order and generate Purchase Bill"
                            >
                              <PackageCheck className="w-3.5 h-3.5" />
                              <span>Inward Bill</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              alert(`PO #${po.poNumber}\nSupplier: ${po.supplierName}\nItems: ${po.items.length}\nTotal: ₹${po.grandTotal}`);
                            }}
                            className="p-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700"
                            title="View Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: PURCHASE BILLS (GRN INWARD) */}
      {activeTab === 'BILLS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-200">
            <div>
              <h3 className="font-bold text-sm text-gray-900">Inward Purchase Bills (Vendor Invoices)</h3>
              <p className="text-xs text-gray-500">Every Purchase Bill automatically increments inventory stock and updates supplier ledger</p>
            </div>
            <button
              type="button"
              onClick={() => setCreateBillModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Make Purchase Bill (GRN)</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold border-b border-gray-200">
                <tr>
                  <th className="p-3">Vendor Bill #</th>
                  <th className="p-3">Supplier Name</th>
                  <th className="p-3">Purchase Date</th>
                  <th className="p-3">Due Date</th>
                  <th className="p-3 text-right">Bill Amount (₹)</th>
                  <th className="p-3 text-right">Paid (₹)</th>
                  <th className="p-3 text-right">Outstanding (₹)</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {supplierBills.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-10 text-center text-gray-400">
                      No Purchase Bills recorded. Click &quot;Make Purchase Bill (GRN)&quot; to add new stock and record supplier purchases.
                    </td>
                  </tr>
                ) : (
                  supplierBills.map((bill) => (
                    <tr key={bill.id} className="hover:bg-gray-50 transition">
                      <td className="p-3 font-bold font-mono text-emerald-700">{bill.supplierInvoiceNo}</td>
                      <td className="p-3 font-semibold text-gray-900">{bill.supplierName}</td>
                      <td className="p-3 text-gray-600">{bill.purchaseDate}</td>
                      <td className="p-3 text-gray-600">{bill.dueDate}</td>
                      <td className="p-3 text-right font-black font-mono text-gray-900">₹{bill.amount.toLocaleString('en-IN')}</td>
                      <td className="p-3 text-right font-mono text-emerald-600">₹{bill.paidAmount.toLocaleString('en-IN')}</td>
                      <td className="p-3 text-right font-mono text-rose-600 font-bold">₹{bill.outstandingAmount.toLocaleString('en-IN')}</td>
                      <td className="p-3 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            bill.paymentStatus === 'PAID'
                              ? 'bg-emerald-100 text-emerald-800'
                              : bill.paymentStatus === 'PARTIAL'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {bill.paymentStatus}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          type="button"
                          onClick={() => setViewBill(bill)}
                          className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold flex items-center gap-1 ml-auto"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Bill</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE PURCHASE ORDER MODAL */}
      {createPOModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div ref={createPOModalRef} className="bg-white rounded-3xl border border-gray-200 shadow-2xl p-6 max-w-3xl w-full my-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="font-extrabold text-base text-gray-900">Create New Purchase Order</h3>
                <p className="text-xs text-gray-500">Issue an official purchase order to garment and fabric suppliers</p>
              </div>
              <button
                type="button"
                onClick={() => setCreatePOModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePOSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Select Supplier *</label>
                  <select
                    value={selectedSupplierId}
                    onChange={(e) => setSelectedSupplierId(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-gray-300 bg-white font-semibold text-gray-800"
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.contactPerson})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">Expected Delivery Date</label>
                  <input
                    type="date"
                    value={poExpectedDate}
                    onChange={(e) => setPoExpectedDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 bg-white text-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">Delivery Terms / Notes</label>
                  <input
                    type="text"
                    placeholder="e.g. Standard Freight to Pargaon"
                    value={poNotes}
                    onChange={(e) => setPoNotes(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 bg-white text-gray-800"
                  />
                </div>
              </div>

              {/* Line Items Selection */}
              <div className="border border-gray-200 rounded-2xl p-3 bg-gray-50/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-gray-800 uppercase tracking-wide">
                    Line Items in Order ({poLineItems.length})
                  </span>
                  <span className="text-[11px] text-gray-500">Pick products below to add</span>
                </div>

                {/* Items Table */}
                {poLineItems.length === 0 ? (
                  <div className="p-6 text-center text-xs text-gray-400 bg-white rounded-xl border border-dashed border-gray-300">
                    No items added yet. Click &quot;+ Add&quot; on products below to include them in this PO.
                  </div>
                ) : (
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50 text-[10px] text-gray-500 uppercase border-b">
                        <tr>
                          <th className="p-2">Item</th>
                          <th className="p-2 w-20 text-center">Qty</th>
                          <th className="p-2 w-24 text-right">Rate (₹)</th>
                          <th className="p-2 w-16 text-center">GST %</th>
                          <th className="p-2 w-24 text-right">Total (₹)</th>
                          <th className="p-2 w-10"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {poLineItems.map((it, idx) => (
                          <tr key={it.variantId}>
                            <td className="p-2">
                              <div className="font-bold text-gray-900">{it.articleName}</div>
                              <div className="text-[10px] text-gray-500">{it.sku}</div>
                            </td>
                            <td className="p-2">
                              <input
                                type="number"
                                min="1"
                                value={it.orderedQty}
                                onChange={(e) => {
                                  const updated = [...poLineItems];
                                  updated[idx].orderedQty = Number(e.target.value) || 1;
                                  setPoLineItems(updated);
                                }}
                                className="w-16 p-1 text-center rounded border border-gray-300 font-bold text-xs"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="number"
                                min="0"
                                value={it.unitCost}
                                onChange={(e) => {
                                  const updated = [...poLineItems];
                                  updated[idx].unitCost = Number(e.target.value) || 0;
                                  setPoLineItems(updated);
                                }}
                                className="w-20 p-1 text-right rounded border border-gray-300 font-bold text-xs"
                              />
                            </td>
                            <td className="p-2 text-center">{it.taxRate}%</td>
                            <td className="p-2 text-right font-bold font-mono">
                              ₹{Math.round(it.orderedQty * it.unitCost * (1 + it.taxRate / 100)).toLocaleString('en-IN')}
                            </td>
                            <td className="p-2 text-center">
                              <button
                                type="button"
                                onClick={() => setPoLineItems(poLineItems.filter((_, i) => i !== idx))}
                                className="text-rose-600 hover:text-rose-800 p-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Quick Add Product Picker (from inventory) */}
                <div className="pt-2">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                    Quick Pick Products from Catalog to Order:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto p-1 bg-white rounded-xl border border-gray-200">
                    {variants.slice(0, 15).map((v) => (
                      <div
                        key={v.id}
                        className="p-1.5 rounded-lg border border-gray-200 text-xs flex justify-between items-center hover:bg-gray-50"
                      >
                        <div className="truncate max-w-[150px]">
                          <div className="font-bold text-gray-800 truncate">{v.articleName}</div>
                          <div className="text-[10px] text-gray-500">Cost: ₹{v.costPrice} • Stock: {v.stock}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAddPoItem(v)}
                          className="px-2 py-0.5 rounded bg-blue-50 text-blue-600 font-bold text-[11px] hover:bg-blue-100"
                        >
                          + Add
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Order Totals Summary */}
              <div className="p-3 bg-gray-50 rounded-xl flex justify-between items-center text-xs">
                <span className="font-bold text-gray-600">Total Purchase Order Estimate:</span>
                <span className="font-extrabold text-base text-gray-900 font-mono">
                  ₹
                  {Math.round(
                    poLineItems.reduce(
                      (sum, it) => sum + it.orderedQty * it.unitCost * (1 + it.taxRate / 100),
                      0
                    )
                  ).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition"
                >
                  Issue Purchase Order
                </button>
                <button
                  type="button"
                  onClick={() => setCreatePOModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl bg-gray-100 text-gray-700 font-semibold text-xs"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE PURCHASE BILL (INWARD GRN) MODAL */}
      {createBillModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div ref={createBillModalRef} className="bg-white rounded-3xl border border-gray-200 shadow-2xl p-6 max-w-3xl w-full my-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="font-extrabold text-base text-gray-900">Make Purchase Bill (Inward GRN)</h3>
                <p className="text-xs text-gray-500">Inward stock items automatically increment inventory counts and credit supplier ledger</p>
              </div>
              <button
                type="button"
                onClick={() => setCreateBillModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBillSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Supplier *</label>
                  <select
                    value={billSupplierId}
                    onChange={(e) => setBillSupplierId(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-gray-300 bg-white font-semibold text-gray-800"
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">Vendor Bill / Inv No *</label>
                  <input
                    type="text"
                    placeholder="e.g. BILL-SURAT-401"
                    value={billInvoiceNo}
                    onChange={(e) => setBillInvoiceNo(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 bg-white font-mono text-gray-900 font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">Bill Date</label>
                  <input
                    type="date"
                    value={billDate}
                    onChange={(e) => setBillDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 bg-white text-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">Linked PO No (optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. PO-2026-104"
                    value={linkedPoNo}
                    onChange={(e) => setLinkedPoNo(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 bg-white text-gray-800 font-mono"
                  />
                </div>
              </div>

              {/* Inward Items */}
              <div className="border border-gray-200 rounded-2xl p-3 bg-gray-50/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-gray-800 uppercase tracking-wide">
                    Inward Stock Items ({billLineItems.length})
                  </span>
                  <span className="text-[11px] text-emerald-700 font-bold">
                    ✓ Stock automatically increases upon saving
                  </span>
                </div>

                {billLineItems.length === 0 ? (
                  <div className="p-6 text-center text-xs text-gray-400 bg-white rounded-xl border border-dashed border-gray-300">
                    No items in bill. Select catalog items below to inward into stock.
                  </div>
                ) : (
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50 text-[10px] text-gray-500 uppercase border-b">
                        <tr>
                          <th className="p-2">Item</th>
                          <th className="p-2 w-20 text-center">Inward Qty</th>
                          <th className="p-2 w-24 text-right">Cost Price (₹)</th>
                          <th className="p-2 w-24 text-right">Selling Price (₹)</th>
                          <th className="p-2 w-24 text-right">Total (₹)</th>
                          <th className="p-2 w-10"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {billLineItems.map((it, idx) => (
                          <tr key={it.variantId}>
                            <td className="p-2">
                              <div className="font-bold text-gray-900">{it.articleName}</div>
                              <div className="text-[10px] text-gray-500">{it.sku}</div>
                            </td>
                            <td className="p-2">
                              <input
                                type="number"
                                min="1"
                                value={it.quantity}
                                onChange={(e) => {
                                  const updated = [...billLineItems];
                                  updated[idx].quantity = Number(e.target.value) || 1;
                                  setBillLineItems(updated);
                                }}
                                className="w-16 p-1 text-center rounded border border-gray-300 font-bold text-xs font-mono"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="number"
                                min="0"
                                value={it.costPrice}
                                onChange={(e) => {
                                  const updated = [...billLineItems];
                                  updated[idx].costPrice = Number(e.target.value) || 0;
                                  setBillLineItems(updated);
                                }}
                                className="w-20 p-1 text-right rounded border border-gray-300 font-bold text-xs font-mono"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="number"
                                min="0"
                                value={it.sellingPrice}
                                onChange={(e) => {
                                  const updated = [...billLineItems];
                                  updated[idx].sellingPrice = Number(e.target.value) || 0;
                                  setBillLineItems(updated);
                                }}
                                className="w-20 p-1 text-right rounded border border-gray-300 font-bold text-xs font-mono text-emerald-700"
                              />
                            </td>
                            <td className="p-2 text-right font-bold font-mono">
                              ₹{Math.round(it.quantity * it.costPrice * (1 + it.taxRate / 100)).toLocaleString('en-IN')}
                            </td>
                            <td className="p-2 text-center">
                              <button
                                type="button"
                                onClick={() => setBillLineItems(billLineItems.filter((_, i) => i !== idx))}
                                className="text-rose-600 hover:text-rose-800 p-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Quick Add Product Picker */}
                <div className="pt-2">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                    Select Styles to Inward:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto p-1 bg-white rounded-xl border border-gray-200">
                    {variants.slice(0, 15).map((v) => (
                      <div
                        key={v.id}
                        className="p-1.5 rounded-lg border border-gray-200 text-xs flex justify-between items-center hover:bg-gray-50"
                      >
                        <div className="truncate max-w-[150px]">
                          <div className="font-bold text-gray-800 truncate">{v.articleName}</div>
                          <div className="text-[10px] text-gray-500">Cost: ₹{v.costPrice} • Cur Stock: {v.stock}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAddBillItem(v)}
                          className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[11px] hover:bg-emerald-100"
                        >
                          + Inward
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Settlement Payment Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-gray-50 p-3 rounded-xl border border-gray-200">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Payment Mode</label>
                  <select
                    value={billPaymentMode}
                    onChange={(e) => setBillPaymentMode(e.target.value)}
                    className="w-full p-2 rounded-lg border border-gray-300 bg-white font-semibold text-gray-800"
                  >
                    <option value="BANK_TRANSFER">Bank Wire / NEFT</option>
                    <option value="UPI">UPI / GPay</option>
                    <option value="CASH">Cash</option>
                    <option value="CHEQUE">Cheque</option>
                    <option value="CREDIT">Supplier Credit (Pay Later)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">Immediate Paid Amount (₹)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={billPaidAmount || ''}
                    onChange={(e) => setBillPaidAmount(Number(e.target.value) || 0)}
                    className="w-full p-2 rounded-lg border border-gray-300 bg-white font-bold font-mono text-gray-900"
                  />
                </div>

                <div className="text-right flex flex-col justify-center">
                  <span className="text-[10px] text-gray-500 font-bold uppercase">Total Inward Bill Amount</span>
                  <span className="text-lg font-black font-mono text-emerald-700">
                    ₹
                    {Math.round(
                      billLineItems.reduce(
                        (sum, it) => sum + it.quantity * it.costPrice * (1 + it.taxRate / 100),
                        0
                      )
                    ).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition"
                >
                  Save Bill &amp; Update Inventory Stock
                </button>
                <button
                  type="button"
                  onClick={() => setCreateBillModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl bg-gray-100 text-gray-700 font-semibold text-xs"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW BILL DETAILS MODAL */}
      {viewBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div ref={viewBillModalRef} className="bg-white rounded-3xl border border-gray-200 shadow-2xl p-6 max-w-lg w-full space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <span className="font-bold text-xs uppercase tracking-wider text-gray-800">
                Purchase Bill Details ({viewBill.supplierInvoiceNo})
              </span>
              <button
                type="button"
                onClick={() => setViewBill(null)}
                className="text-gray-400 hover:text-gray-700 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Supplier:</span>
                <span className="font-bold text-gray-900">{viewBill.supplierName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Invoice Date:</span>
                <span>{viewBill.purchaseDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Due Date:</span>
                <span>{viewBill.dueDate}</span>
              </div>
              <div className="flex justify-between font-bold pt-1 border-t border-gray-200">
                <span>Total Amount:</span>
                <span className="font-mono text-emerald-700">₹{viewBill.amount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Paid Amount:</span>
                <span className="font-mono">₹{viewBill.paidAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-rose-600 font-bold">
                <span>Outstanding Payable:</span>
                <span className="font-mono">₹{viewBill.outstandingAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {viewBill.items && viewBill.items.length > 0 && (
              <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-xl p-2 text-xs">
                <div className="font-bold text-[10px] text-gray-500 uppercase mb-1">Inward Items:</div>
                {viewBill.items.map((it, idx) => (
                  <div key={idx} className="p-1.5 border-b border-gray-100 flex justify-between">
                    <div>
                      <div className="font-semibold text-gray-800">{it.articleName}</div>
                      <div className="text-[10px] text-gray-400">Qty: {it.quantity} • Cost: ₹{it.costPrice}</div>
                    </div>
                    <div className="font-bold font-mono">₹{it.totalAmount.toLocaleString('en-IN')}</div>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => setViewBill(null)}
              className="w-full py-2.5 rounded-xl bg-gray-800 text-white font-bold text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {adjustModalOpen && selectedVariant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div ref={adjustModalRef} className="bg-white rounded-3xl border border-gray-200 shadow-2xl p-6 max-w-sm w-full space-y-4">
            <h3 className="font-bold text-sm text-gray-900">Audit Stock Adjustment</h3>
            <p className="text-xs text-gray-500">
              Adjust quantity for <strong>{selectedVariant.articleName}</strong> ({selectedVariant.sku})
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-600 mb-1">Adjustment Type</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustType('ADD')}
                    className={`flex-1 py-2 rounded-xl font-bold transition ${
                      adjustType === 'ADD' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    + Add Stock
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustType('REMOVE')}
                    className={`flex-1 py-2 rounded-xl font-bold transition ${
                      adjustType === 'REMOVE' ? 'bg-rose-600 text-white' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    - Remove Stock
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-gray-600 mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(Number(e.target.value) || 1)}
                  className="w-full p-2 rounded-xl border border-gray-300 font-bold text-center"
                />
              </div>

              <div>
                <label className="block text-gray-600 mb-1">Audit Reason</label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full p-2 rounded-xl border border-gray-300"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleAdjustSubmit}
                className="flex-1 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs"
              >
                Confirm Adjust
              </button>
              <button
                type="button"
                onClick={() => setAdjustModalOpen(false)}
                className="py-2 px-3 rounded-xl bg-gray-100 text-gray-700 text-xs font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stock Transfer Modal */}
      {transferModalOpen && selectedVariant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div ref={transferModalRef} className="bg-white rounded-3xl border border-gray-200 shadow-2xl p-6 max-w-sm w-full space-y-4">
            <h3 className="font-bold text-sm text-gray-900">Multi-Branch Stock Transfer</h3>
            <p className="text-xs text-gray-500">
              Dispatch <strong>{selectedVariant.articleName}</strong> to another retail branch
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-600 mb-1">Target Branch</label>
                <select
                  value={targetBranch}
                  onChange={(e) => setTargetBranch(e.target.value)}
                  className="w-full p-2 rounded-xl border border-gray-300 bg-white"
                >
                  <option value="Mall Outlet Branch - Forum South">Mall Outlet Branch - Forum South</option>
                  <option value="Airport Highway Express Branch">Airport Highway Express Branch</option>
                  <option value="Central Warehouse Peenya">Central Warehouse Peenya</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-600 mb-1">Transfer Quantity (Max: {selectedVariant.stock})</label>
                <input
                  type="number"
                  min="1"
                  max={selectedVariant.stock}
                  value={transferQty}
                  onChange={(e) => setTransferQty(Number(e.target.value) || 1)}
                  className="w-full p-2 rounded-xl border border-gray-300 font-bold text-center"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleTransferSubmit}
                className="flex-1 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs"
              >
                Dispatch Transfer
              </button>
              <button
                type="button"
                onClick={() => setTransferModalOpen(false)}
                className="py-2 px-3 rounded-xl bg-gray-100 text-gray-700 text-xs font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
