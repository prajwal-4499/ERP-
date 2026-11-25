import React, { useState } from 'react';
import { Tag, Printer, Sparkles, X, CheckSquare, Square } from 'lucide-react';
import { ProductVariant } from '../../types';
import { useAuthStore } from '../../stores/authStore';
import { useFocusTrap } from '../../utils/useFocusTrap';

interface BarcodeLabelModalProps {
  variants: ProductVariant[];
  onClose: () => void;
}

export const BarcodeLabelModal: React.FC<BarcodeLabelModalProps> = ({
  variants,
  onClose,
}) => {
  const { activeStore } = useAuthStore();
  const modalRef = useFocusTrap<HTMLDivElement>({
    isOpen: true,
    onClose,
  });
  const [selectedVariantIds, setSelectedVariantIds] = useState<number[]>(
    variants.slice(0, 4).map((v) => v.id)
  );
  const [showLogo, setShowLogo] = useState(true);
  const [showMrp, setShowMrp] = useState(true);
  const [labelCopies, setLabelCopies] = useState<number>(2);

  const toggleSelect = (id: number) => {
    if (selectedVariantIds.includes(id)) {
      setSelectedVariantIds(selectedVariantIds.filter((x) => x !== id));
    } else {
      setSelectedVariantIds([...selectedVariantIds, id]);
    }
  };

  const selectedVariants = variants.filter((v) => selectedVariantIds.includes(v.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div
        ref={modalRef}
        className="bg-white border border-gray-200 rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center border border-blue-100">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-[#1F2937]">Garment Barcode &amp; Price Label Designer</h2>
              <p className="text-xs text-gray-500">Thermal sticker tag generation (50mm × 25mm / 38mm × 25mm)</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto grid grid-cols-3 gap-6">
          {/* Controls Column */}
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-xs space-y-3">
              <div className="font-extrabold text-[#1F2937]">Label Tag Fields Toggle</div>
              <label className="flex items-center gap-2 text-gray-700 cursor-pointer font-medium">
                <input
                  type="checkbox"
                  checked={showLogo}
                  onChange={(e) => setShowLogo(e.target.checked)}
                  className="rounded text-[#2563EB]"
                />
                <span>Store Brand Name</span>
              </label>
              <label className="flex items-center gap-2 text-gray-700 cursor-pointer font-medium">
                <input
                  type="checkbox"
                  checked={showMrp}
                  onChange={(e) => setShowMrp(e.target.checked)}
                  className="rounded text-[#2563EB]"
                />
                <span>Show MRP &amp; Discount %</span>
              </label>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Copies per SKU</label>
              <input
                type="number"
                min={1}
                max={50}
                value={labelCopies}
                onChange={(e) => setLabelCopies(Number(e.target.value) || 1)}
                className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-[#1F2937] font-mono font-bold"
              />
            </div>

            {/* Variant List to Select */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-gray-500 font-medium">
                <span>Select SKUs ({selectedVariantIds.length})</span>
                <button
                  onClick={() => setSelectedVariantIds(variants.map((v) => v.id))}
                  className="text-[#2563EB] font-bold hover:underline"
                >
                  Select All
                </button>
              </div>
              <div className="max-h-48 overflow-y-auto space-y-1 rounded-xl border border-gray-200 p-1.5 bg-gray-50">
                {variants.map((v) => {
                  const isChecked = selectedVariantIds.includes(v.id);
                  return (
                    <div
                      key={v.id}
                      onClick={() => toggleSelect(v.id)}
                      className={`flex items-center gap-2 p-2 rounded-lg text-xs cursor-pointer transition ${
                        isChecked ? 'bg-blue-50 text-[#2563EB] font-bold' : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {isChecked ? <CheckSquare className="w-4 h-4 text-[#2563EB]" /> : <Square className="w-4 h-4 text-gray-400" />}
                      <span className="truncate font-mono">{v.sku}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Thermal Label Live Preview */}
          <div className="col-span-2 space-y-3">
            <div className="text-xs font-extrabold text-[#1F2937] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#2563EB]" />
              <span>Thermal Sticker Preview ({selectedVariants.length * labelCopies} Total Labels)</span>
            </div>

            <div className="grid grid-cols-2 gap-3 max-h-[420px] overflow-y-auto p-4 rounded-xl bg-gray-50 border border-gray-200">
              {selectedVariants.map((v) => (
                <div
                  key={v.id}
                  className="bg-white text-black p-3.5 rounded-xl font-mono text-[10px] leading-tight border border-gray-200 shadow-sm flex flex-col justify-between select-none"
                >
                  {showLogo && (
                    <div className="text-center font-extrabold uppercase tracking-wide border-b border-gray-300 pb-1 text-[11px]">
                      {activeStore.name.split(' ')[0]} {activeStore.name.split(' ')[1] || 'GARMENTS'}
                    </div>
                  )}

                  <div className="py-1.5">
                    <div className="font-bold truncate text-[11px] font-sans">{v.articleName}</div>
                    <div className="flex justify-between text-gray-600 text-[10px] mt-0.5">
                      <span>Size: <strong className="text-black">{v.size}</strong></span>
                      <span>Color: <strong className="text-black">{v.color}</strong></span>
                    </div>
                    <div className="text-[9px] text-gray-500 truncate mt-0.5">SKU: {v.sku}</div>
                  </div>

                  {/* Simulated Barcode */}
                  <div className="my-1.5 text-center py-1 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="tracking-[4px] font-black text-xs text-gray-800">||| | || |||| | ||||| |</div>
                    <div className="text-[10px] font-bold tracking-widest mt-0.5">{v.barcode}</div>
                  </div>

                  {/* Price Tag */}
                  <div className="pt-1.5 border-t border-gray-300 flex items-center justify-between">
                    {showMrp && (
                      <div className="text-gray-400 line-through text-[10px]">
                        MRP ₹{v.mrp}
                      </div>
                    )}
                    <div className="text-xs font-black text-black">
                      OFFER: ₹{v.sellingPrice}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white hover:bg-gray-100 text-xs font-bold text-gray-700 border border-gray-200 transition"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition"
          >
            <Printer className="w-4 h-4" />
            <span>Send to Thermal Label Printer (ESC/POS)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
