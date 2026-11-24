import React, { useState, useEffect } from 'react';
import {
  Shirt,
  Tag,
  Search,
  Sparkles,
  Printer,
} from 'lucide-react';
import { Product, ProductVariant } from '../../types';
import { api } from '../../services/api';
import { SizeColorMatrixModal } from '../../components/matrix/SizeColorMatrixModal';
import { BarcodeLabelModal } from '../../components/matrix/BarcodeLabelModal';

export const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductIndex, setSelectedProductIndex] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [matrixModalOpen, setMatrixModalOpen] = useState(false);
  const [barcodeModalOpen, setBarcodeModalOpen] = useState(false);

  useEffect(() => {
    api.getProducts().then(setProducts);
  }, []);

  const allVariants = products.flatMap((p) => p.variants);

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.articleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.variants.some((v) => v.sku.toLowerCase().includes(searchQuery.toLowerCase()) || v.barcode.includes(searchQuery));
    const matchesCategory = categoryFilter === 'ALL' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (filteredProducts.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedProductIndex((prev) => Math.min(filteredProducts.length - 1, prev + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedProductIndex((prev) => Math.max(0, prev - 1));
    }
  };

  const handleSaveNewProduct = async (productData: Partial<Product>) => {
    const created = await api.addProduct(productData);
    setProducts([...products, created]);
  };

  return (
    <div className="space-y-6">
      {/* Header & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-[#1F2937] tracking-tight">
            Garment Style Master
          </h1>
          <p className="text-sm font-medium text-gray-500 mt-0.5">
            Parent styles, size-color variants, barcode catalog &amp; thermal labels (Use ↑↓ arrows)
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setBarcodeModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-gray-50 text-gray-700 font-bold text-xs border border-gray-200 shadow-sm transition"
          >
            <Printer className="w-4 h-4 text-[#2563EB]" />
            <span>Print Thermal Barcodes</span>
          </button>

          <button
            type="button"
            onClick={() => setMatrixModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition"
          >
            <Sparkles className="w-4 h-4" />
            <span>New Size × Color Matrix</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-sm flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search by Style Name, Brand, SKU, Barcode (↑↓ to navigate)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs text-[#1F2937] placeholder:text-gray-400 focus:bg-white focus:border-[#2563EB] focus:outline-none"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="p-2 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-700 font-semibold focus:outline-none"
        >
          <option value="ALL">All Garment Categories</option>
          <option value="Formal Shirts">Formal Shirts</option>
          <option value="Jeans">Denim Jeans</option>
          <option value="Ethnic Sarees">Ethnic Silk Sarees</option>
          <option value="Trousers">Trousers &amp; Chinos</option>
        </select>
      </div>

      {/* Products & Variant Matrix Cards */}
      <div className="space-y-4">
        {filteredProducts.map((prod, idx) => {
          const isSelected = selectedProductIndex === idx;
          return (
          <div
            key={prod.id}
            onClick={() => setSelectedProductIndex(idx)}
            className={`rounded-2xl bg-white border shadow-sm overflow-hidden transition ${
              isSelected ? 'border-blue-400 ring-2 ring-blue-100 shadow-md' : 'border-gray-200 hover:shadow-md'
            }`}
          >
            {/* Style Master Header Strip */}
            <div className="p-4 bg-gray-50/80 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold border border-blue-100">
                  <Shirt className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-sm text-[#1F2937]">{prod.articleName}</h3>
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#2563EB] font-bold text-[10px] border border-blue-100">
                      {prod.brand}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-semibold text-[10px]">
                      {prod.category}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    HSN: <span className="font-mono text-gray-700 font-semibold">{prod.hsnCode}</span> • Fabric: {prod.fabricType} • Care: {prod.careInstructions}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="text-gray-500 font-sans font-medium">Total Stock: <strong className="text-[#10B981] font-mono">{prod.variants.reduce((s, v) => s + v.stock, 0)} units</strong></span>
              </div>
            </div>

            {/* Variants Matrix Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-gray-50/50 text-gray-500 uppercase text-[10px] font-bold border-b border-gray-200">
                  <tr>
                    <th className="p-3">SKU</th>
                    <th className="p-3">Barcode</th>
                    <th className="p-3 font-sans">Color</th>
                    <th className="p-3 font-sans">Size</th>
                    <th className="p-3 text-right">Cost (₹)</th>
                    <th className="p-3 text-right">MRP (₹)</th>
                    <th className="p-3 text-right">Selling Price (₹)</th>
                    <th className="p-3 text-center">Stock</th>
                    <th className="p-3 text-center font-sans">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {prod.variants.map((v) => (
                    <tr key={v.id} className="hover:bg-gray-50/80 transition">
                      <td className="p-3 font-bold text-[#2563EB]">{v.sku}</td>
                      <td className="p-3 text-gray-600">{v.barcode}</td>
                      <td className="p-3 font-sans">
                        <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 font-medium">
                          {v.color}
                        </span>
                      </td>
                      <td className="p-3 font-extrabold text-[#1F2937] font-sans">{v.size}</td>
                      <td className="p-3 text-right text-gray-500">₹{v.costPrice}</td>
                      <td className="p-3 text-right text-gray-400 line-through">₹{v.mrp}</td>
                      <td className="p-3 text-right font-extrabold text-[#10B981]">₹{v.sellingPrice}</td>
                      <td className="p-3 text-center font-bold text-[#1F2937]">
                        <span className={`px-2.5 py-0.5 rounded-md font-mono ${v.stock <= v.reorderLevel ? 'bg-red-50 text-[#EF4444] font-black' : 'bg-gray-100 text-gray-800'}`}>
                          {v.stock}
                        </span>
                      </td>
                      <td className="p-3 text-center font-sans">
                        {v.stock <= v.reorderLevel ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-[#EF4444] border border-red-200">
                            Low Stock
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-[#10B981] border border-emerald-200">
                            In Stock
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          );
        })}
      </div>

      {/* Size Color Matrix Modal */}
      {matrixModalOpen && (
        <SizeColorMatrixModal
          onClose={() => setMatrixModalOpen(false)}
          onSaveProduct={handleSaveNewProduct}
        />
      )}

      {/* Barcode Label Modal */}
      {barcodeModalOpen && (
        <BarcodeLabelModal
          variants={allVariants}
          onClose={() => setBarcodeModalOpen(false)}
        />
      )}
    </div>
  );
};
