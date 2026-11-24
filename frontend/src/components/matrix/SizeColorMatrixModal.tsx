import React, { useState } from 'react';
import { Layers, Plus, Sparkles, X, CheckCircle } from 'lucide-react';
import { Product, ProductVariant } from '../../types';

interface SizeColorMatrixModalProps {
  onClose: () => void;
  onSaveProduct: (product: Partial<Product>) => void;
}

export const SizeColorMatrixModal: React.FC<SizeColorMatrixModalProps> = ({
  onClose,
  onSaveProduct,
}) => {
  const [articleName, setArticleName] = useState('');
  const [brand, setBrand] = useState('Louis Philippe');
  const [category, setCategory] = useState('Formal Shirts');
  const [hsnCode, setHsnCode] = useState('6205');
  const [fabricType, setFabricType] = useState('Pure Cotton');
  const [careInstructions, setCareInstructions] = useState('Machine wash warm, iron medium');

  const [colors, setColors] = useState<string[]>(['Pure White', 'Navy Blue', 'Wine Maroon']);
  const [newColor, setNewColor] = useState('');

  const [sizes, setSizes] = useState<string[]>(['38 (S)', '40 (M)', '42 (L)', '44 (XL)']);
  const [newSize, setNewSize] = useState('');

  const [bulkCost, setBulkCost] = useState<number>(750);
  const [bulkMrp, setBulkMrp] = useState<number>(1899);
  const [bulkSelling, setBulkSelling] = useState<number>(1599);
  const [bulkStock, setBulkStock] = useState<number>(10);

  const [generatedVariants, setGeneratedVariants] = useState<Partial<ProductVariant>[]>([]);

  const handleGenerateMatrix = () => {
    if (!articleName) {
      alert('Please enter an Article/Style Name first.');
      return;
    }
    if (colors.length === 0 || sizes.length === 0) {
      alert('Please select at least 1 color and 1 size.');
      return;
    }

    const brandPrefix = brand.replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase();
    const stylePrefix = articleName.replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase();

    const variants: Partial<ProductVariant>[] = [];
    let counter = 101;

    colors.forEach((col) => {
      sizes.forEach((sz) => {
        const colCode = col.replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase();
        const szCode = sz.replace(/[^a-zA-Z0-9]/g, '').slice(0, 3).toUpperCase();
        const sku = `${brandPrefix}-${stylePrefix}-${colCode}-${szCode}`;
        const barcode = '890' + Math.floor(1000000 + Math.random() * 9000000);

        variants.push({
          id: counter++,
          articleName,
          brand,
          category,
          color: col,
          size: sz,
          sku,
          barcode,
          costPrice: bulkCost,
          mrp: bulkMrp,
          sellingPrice: bulkSelling,
          stock: bulkStock,
          reorderLevel: 5,
        });
      });
    });

    setGeneratedVariants(variants);
  };

  const handleApplyBulkValues = () => {
    setGeneratedVariants((prev) =>
      prev.map((v) => ({
        ...v,
        costPrice: bulkCost,
        mrp: bulkMrp,
        sellingPrice: bulkSelling,
        stock: bulkStock,
      }))
    );
  };

  const handleVariantChange = (index: number, field: keyof ProductVariant, val: any) => {
    const updated = [...generatedVariants];
    updated[index] = { ...updated[index], [field]: val };
    setGeneratedVariants(updated);
  };

  const handleSaveAll = () => {
    if (generatedVariants.length === 0) {
      alert('Please generate matrix variants first.');
      return;
    }

    onSaveProduct({
      articleName,
      brand,
      category,
      hsnCode,
      fabricType,
      careInstructions,
      description: `${fabricType} garment style.`,
      variants: generatedVariants as ProductVariant[],
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-5xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center border border-blue-100">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-[#1F2937]">Garment Size × Color Matrix Generator</h2>
              <p className="text-xs text-gray-500">Generate multi-variant SKUs, barcodes, and bulk pricing</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-5">
          {/* Style Master Inputs */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Article / Style Name *</label>
              <input
                type="text"
                placeholder="e.g. Classic Mandarin Collar Shirt"
                value={articleName}
                onChange={(e) => setArticleName(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-[#1F2937] focus:bg-white focus:border-[#2563EB] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Brand</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-[#1F2937]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-[#1F2937]"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">HSN / Tax Code</label>
              <input
                type="text"
                value={hsnCode}
                onChange={(e) => setHsnCode(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-mono text-[#1F2937]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Fabric Composition</label>
              <input
                type="text"
                value={fabricType}
                onChange={(e) => setFabricType(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-[#1F2937]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Care Instructions</label>
              <input
                type="text"
                value={careInstructions}
                onChange={(e) => setCareInstructions(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-[#1F2937]"
              />
            </div>
          </div>

          {/* Color & Size Matrix Selector */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
            {/* Colors */}
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-extrabold text-[#2563EB]">Available Colors ({colors.length})</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {colors.map((c) => (
                  <span
                    key={c}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white text-xs font-bold text-gray-700 border border-gray-200 shadow-2xs"
                  >
                    {c}
                    <button
                      onClick={() => setColors(colors.filter((x) => x !== c))}
                      className="text-gray-400 hover:text-[#EF4444]"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="Add color (e.g. Olive Green)"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newColor.trim()) {
                      setColors([...colors, newColor.trim()]);
                      setNewColor('');
                    }
                  }}
                  className="flex-1 p-2 rounded-lg bg-white border border-gray-200 text-xs text-[#1F2937]"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newColor.trim()) {
                      setColors([...colors, newColor.trim()]);
                      setNewColor('');
                    }
                  }}
                  className="px-3 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-xs font-bold text-gray-700"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Sizes */}
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-extrabold text-[#2563EB]">Available Sizes ({sizes.length})</span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setSizes(['S', 'M', 'L', 'XL', 'XXL'])}
                    className="px-2 py-0.5 rounded text-[10px] font-bold bg-white text-gray-700 border border-gray-200"
                  >
                    S-XXL
                  </button>
                  <button
                    type="button"
                    onClick={() => setSizes(['28', '30', '32', '34', '36', '38'])}
                    className="px-2 py-0.5 rounded text-[10px] font-bold bg-white text-gray-700 border border-gray-200"
                  >
                    Jeans 28-38
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {sizes.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white text-xs font-bold text-gray-700 border border-gray-200 shadow-2xs"
                  >
                    {s}
                    <button
                      onClick={() => setSizes(sizes.filter((x) => x !== s))}
                      className="text-gray-400 hover:text-[#EF4444]"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="Add size (e.g. 46)"
                  value={newSize}
                  onChange={(e) => setNewSize(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newSize.trim()) {
                      setSizes([...sizes, newSize.trim()]);
                      setNewSize('');
                    }
                  }}
                  className="flex-1 p-2 rounded-lg bg-white border border-gray-200 text-xs text-[#1F2937]"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newSize.trim()) {
                      setSizes([...sizes, newSize.trim()]);
                      setNewSize('');
                    }
                  }}
                  className="px-3 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-xs font-bold text-gray-700"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Bulk Controls & Generate Matrix Button */}
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-xs">
              <span className="font-extrabold text-[#1F2937]">Bulk Defaults:</span>
              <div>
                <label className="text-[10px] text-gray-500 font-semibold block">Cost (₹)</label>
                <input
                  type="number"
                  value={bulkCost}
                  onChange={(e) => setBulkCost(Number(e.target.value) || 0)}
                  className="w-20 p-1.5 rounded-lg bg-white border border-gray-200 text-xs font-mono font-bold text-[#1F2937]"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 font-semibold block">MRP (₹)</label>
                <input
                  type="number"
                  value={bulkMrp}
                  onChange={(e) => setBulkMrp(Number(e.target.value) || 0)}
                  className="w-20 p-1.5 rounded-lg bg-white border border-gray-200 text-xs font-mono font-bold text-[#1F2937]"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 font-semibold block">Sell Price (₹)</label>
                <input
                  type="number"
                  value={bulkSelling}
                  onChange={(e) => setBulkSelling(Number(e.target.value) || 0)}
                  className="w-20 p-1.5 rounded-lg bg-white border border-gray-200 text-xs font-mono font-bold text-[#10B981]"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 font-semibold block">Stock Qty</label>
                <input
                  type="number"
                  value={bulkStock}
                  onChange={(e) => setBulkStock(Number(e.target.value) || 0)}
                  className="w-16 p-1.5 rounded-lg bg-white border border-gray-200 text-xs font-mono font-bold text-[#1F2937]"
                />
              </div>
              {generatedVariants.length > 0 && (
                <button
                  type="button"
                  onClick={handleApplyBulkValues}
                  className="mt-3 px-2.5 py-1 rounded-lg bg-white hover:bg-gray-100 text-[11px] text-[#2563EB] border border-gray-200 font-bold shadow-2xs"
                >
                  Apply to All
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={handleGenerateMatrix}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate Matrix ({colors.length * sizes.length} SKUs)</span>
            </button>
          </div>

          {/* Generated Permutations Table */}
          {generatedVariants.length > 0 && (
            <div className="space-y-2">
              <div className="font-extrabold text-xs text-[#1F2937]">
                Generated Variants ({generatedVariants.length} Combinations)
              </div>
              <div className="max-h-60 overflow-y-auto rounded-xl border border-gray-200">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold sticky top-0 border-b border-gray-200">
                    <tr>
                      <th className="p-2.5">SKU</th>
                      <th className="p-2.5">Barcode</th>
                      <th className="p-2.5 font-sans">Color</th>
                      <th className="p-2.5 font-sans">Size</th>
                      <th className="p-2.5">Cost (₹)</th>
                      <th className="p-2.5">MRP (₹)</th>
                      <th className="p-2.5">Selling Price (₹)</th>
                      <th className="p-2.5">Stock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {generatedVariants.map((v, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="p-2 font-bold text-[#2563EB]">{v.sku}</td>
                        <td className="p-2 text-gray-600">{v.barcode}</td>
                        <td className="p-2 font-sans font-medium text-gray-700">{v.color}</td>
                        <td className="p-2 font-sans font-extrabold text-[#1F2937]">{v.size}</td>
                        <td className="p-2">
                          <input
                            type="number"
                            value={v.costPrice}
                            onChange={(e) => handleVariantChange(idx, 'costPrice', Number(e.target.value) || 0)}
                            className="w-16 p-1 rounded-lg bg-gray-50 border border-gray-200 text-xs text-gray-700 font-bold"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            value={v.mrp}
                            onChange={(e) => handleVariantChange(idx, 'mrp', Number(e.target.value) || 0)}
                            className="w-16 p-1 rounded-lg bg-gray-50 border border-gray-200 text-xs text-gray-700 font-bold"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            value={v.sellingPrice}
                            onChange={(e) => handleVariantChange(idx, 'sellingPrice', Number(e.target.value) || 0)}
                            className="w-16 p-1 rounded-lg bg-gray-50 border border-gray-200 text-xs font-bold text-[#10B981]"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            value={v.stock}
                            onChange={(e) => handleVariantChange(idx, 'stock', Number(e.target.value) || 0)}
                            className="w-14 p-1 rounded-lg bg-gray-50 border border-gray-200 text-xs text-gray-700 font-bold"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white hover:bg-gray-100 text-xs font-bold text-gray-700 border border-gray-200 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveAll}
            disabled={generatedVariants.length === 0}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#10B981] hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition disabled:opacity-40"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Save Style Master &amp; All {generatedVariants.length} Variants</span>
          </button>
        </div>
      </div>
    </div>
  );
};
