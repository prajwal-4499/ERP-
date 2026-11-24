import React, { useState, useEffect } from 'react';
import {
  Scissors,
  Plus,
  MessageSquare,
  Phone,
} from 'lucide-react';
import { Alteration } from '../../types';
import { api } from '../../services/api';

export const AlterationsPage: React.FC = () => {
  const [alterations, setAlterations] = useState<Alteration[]>([]);
  const [newModalOpen, setNewModalOpen] = useState(false);

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [invoiceNo, setInvoiceNo] = useState('');
  const [garmentItem, setGarmentItem] = useState('Oxford Cotton Shirt');
  const [measurements, setMeasurements] = useState('Sleeve: -1 inch, Chest: 40, Length: 29');
  const [tailorName, setTailorName] = useState('Master Rafiq');
  const [tailorNotes, setTailorNotes] = useState('Double stitch bottom seam');
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10));
  const [charge, setCharge] = useState<number>(100);

  useEffect(() => {
    loadAlterations();
  }, []);

  const loadAlterations = async () => {
    const list = await api.getAlterations();
    setAlterations(list);
  };

  const handleCreateAlteration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !garmentItem) {
      alert('Please fill customer and garment details.');
      return;
    }

    await api.addAlteration({
      customerName,
      customerPhone,
      invoiceNumber: invoiceNo,
      garmentItem,
      measurements,
      tailorName,
      tailorNotes,
      dueDate,
      alterationCharge: charge,
    });

    setCustomerName('');
    setCustomerPhone('');
    setNewModalOpen(false);
    loadAlterations();
  };

  const handleStatusChange = async (id: number, newStatus: Alteration['status']) => {
    await api.updateAlterationStatus(id, newStatus);
    loadAlterations();
  };

  const sendWhatsAppNotification = (alt: Alteration) => {
    const phoneClean = alt.customerPhone.replace(/[^0-9]/g, '');
    const message = `Hello ${alt.customerName}, your alteration order (${alt.garmentItem}) #${alt.orderNumber} is READY FOR PICKUP at Royal Attire Garments. Please visit the store. Thank you!`;
    const url = `https://wa.me/91${phoneClean}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-[#1F2937] tracking-tight">
            Tailoring &amp; Alterations
          </h1>
          <p className="text-sm font-medium text-gray-500 mt-0.5">
            Custom garment fitting, measurements, tailor assignment &amp; ready alerts
          </p>
        </div>

        <button
          type="button"
          onClick={() => setNewModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Alteration Order</span>
        </button>
      </div>

      {/* Alterations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {alterations.map((alt) => (
          <div
            key={alt.id}
            className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-3 flex flex-col justify-between hover:shadow-md transition"
          >
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-mono font-bold text-[#2563EB]">{alt.orderNumber}</span>
                  <h3 className="font-extrabold text-base text-[#1F2937]">{alt.customerName}</h3>
                  <div className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3 text-gray-400" />
                    <span>{alt.customerPhone}</span>
                  </div>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    alt.status === 'READY'
                      ? 'bg-emerald-50 text-[#10B981] border border-emerald-200'
                      : alt.status === 'IN_PROGRESS'
                      ? 'bg-blue-50 text-[#2563EB] border border-blue-200'
                      : alt.status === 'DELIVERED'
                      ? 'bg-gray-100 text-gray-500 border border-gray-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {alt.status}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-xs space-y-1.5 mt-3">
                <div>
                  <span className="text-gray-500">Garment:</span>{' '}
                  <strong className="text-[#1F2937]">{alt.garmentItem}</strong>
                </div>
                <div>
                  <span className="text-gray-500">Measurements:</span>{' '}
                  <span className="text-[#2563EB] font-mono font-semibold">{alt.measurements}</span>
                </div>
                <div>
                  <span className="text-gray-500">Assigned Tailor:</span>{' '}
                  <span className="text-[#1F2937] font-bold">{alt.tailorName}</span>
                </div>
                <div>
                  <span className="text-gray-500">Due Date:</span>{' '}
                  <span className="font-mono text-amber-600 font-bold">{alt.dueDate}</span>
                </div>
              </div>
            </div>

            {/* Actions & Status Dropdown */}
            <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
              <select
                value={alt.status}
                onChange={(e) => handleStatusChange(alt.id, e.target.value as Alteration['status'])}
                className="p-2 rounded-xl bg-gray-50 border border-gray-200 text-xs text-[#1F2937] font-semibold"
              >
                <option value="PENDING">Pending</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="READY">Ready</option>
                <option value="DELIVERED">Delivered</option>
              </select>

              {alt.status === 'READY' && (
                <button
                  type="button"
                  onClick={() => sendWhatsAppNotification(alt)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#10B981] hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp Alert</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* New Alteration Modal */}
      {newModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="font-extrabold text-base text-[#1F2937]">Create Alteration Order</h3>
              <button
                onClick={() => setNewModalOpen(false)}
                className="text-xs text-gray-400 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAlteration} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-600 mb-1 font-semibold">Customer Name *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-[#1F2937]"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 mb-1 font-semibold">Customer Phone *</label>
                  <input
                    type="text"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-[#1F2937]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-600 mb-1 font-semibold">Garment Item *</label>
                  <input
                    type="text"
                    required
                    value={garmentItem}
                    onChange={(e) => setGarmentItem(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-[#1F2937]"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 mb-1 font-semibold">Tailor Assigned</label>
                  <input
                    type="text"
                    value={tailorName}
                    onChange={(e) => setTailorName(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-[#1F2937]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-600 mb-1 font-semibold">Measurements &amp; Instructions</label>
                <textarea
                  rows={2}
                  value={measurements}
                  onChange={(e) => setMeasurements(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-[#1F2937] font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-600 mb-1 font-semibold">Delivery Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-[#1F2937]"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 mb-1 font-semibold">Alteration Charge (₹)</label>
                  <input
                    type="number"
                    value={charge}
                    onChange={(e) => setCharge(Number(e.target.value) || 0)}
                    className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-[#1F2937] font-mono font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setNewModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-100 text-xs font-bold text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold"
                >
                  Save Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
