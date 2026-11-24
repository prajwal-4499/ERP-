import React, { useState } from 'react';
import { MessageSquare, Mail, Send, CheckCircle2, Phone, Sparkles } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

export const CommunicationsPage: React.FC = () => {
  const { activeStore } = useAuthStore();
  const [recipientPhone, setRecipientPhone] = useState('9845012345');
  const [recipientName, setRecipientName] = useState('Anand Kumar');
  const [templateType, setTemplateType] = useState<'INVOICE' | 'PAYMENT_REMINDER' | 'PROMO' | 'ALTERATION'>('INVOICE');
  const [customText, setCustomText] = useState('');

  const generateMessage = () => {
    switch (templateType) {
      case 'INVOICE':
        return `Hello ${recipientName},\nThank you for shopping at ${activeStore.name}!\nYour digital tax invoice #INV-2026-1050 for ₹3,463 is ready.\nWe look forward to serving you again!`;
      case 'PAYMENT_REMINDER':
        return `Dear ${recipientName},\nThis is a gentle Khata balance reminder from ${activeStore.name}.\nYour outstanding balance is ₹4,500.\nYou can pay via UPI / QR: 9876543210@upi or visit the store.\nThank you!`;
      case 'ALTERATION':
        return `Hello ${recipientName},\nYour tailored garment order #ALT-1001 is READY FOR PICKUP at ${activeStore.name}.\nPlease collect it at your earliest convenience!`;
      case 'PROMO':
        return `Festive Offer from ${activeStore.name}!\nGet flat 20% OFF on all new arrival Autumn Cotton Shirts and Silk Sarees this weekend.\nShow this message at the counter to redeem!`;
    }
  };

  const handleSendWhatsApp = () => {
    const text = customText || generateMessage();
    const cleanPhone = recipientPhone.replace(/[^0-9]/g, '');
    const url = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            WhatsApp &amp; Customer Communications
          </h2>
          <p className="text-xs text-gray-500 font-medium">Zero-cost WhatsApp direct dispatch, invoice sharing, payment reminders &amp; marketing</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Message Composer */}
        <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-gray-900">Compose WhatsApp Message</h3>
              <p className="text-[11px] text-gray-500">Send personalized messages directly to customer phones</p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Recipient Name</label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 font-medium focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Mobile Number (WhatsApp)</label>
                <input
                  type="text"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 font-mono font-medium focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1.5">Message Template</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'INVOICE', label: 'Digital Invoice' },
                  { id: 'PAYMENT_REMINDER', label: 'Khata Due Reminder' },
                  { id: 'ALTERATION', label: 'Alteration Ready Alert' },
                  { id: 'PROMO', label: 'Festival Promo' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setTemplateType(t.id as any);
                      setCustomText('');
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                      templateType === t.id
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-sm'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1">Message Content Preview / Edit</label>
              <textarea
                rows={5}
                value={customText || generateMessage()}
                onChange={(e) => setCustomText(e.target.value)}
                className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-800 font-mono focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 focus:outline-none transition leading-relaxed"
              />
            </div>

            <button
              type="button"
              onClick={handleSendWhatsApp}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm shadow-emerald-600/20 flex items-center justify-center gap-2 transition"
            >
              <Send className="w-4 h-4" />
              <span>Send via WhatsApp (Direct Click-to-Chat)</span>
            </button>
          </div>
        </div>

        {/* Live Dispatch Log */}
        <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-gray-900">Recent Communication Logs</h3>
              <p className="text-[11px] text-gray-500">History of customer alerts and system dispatch logs</p>
            </div>
          </div>

          <div className="space-y-2.5 max-h-[380px] overflow-y-auto font-mono text-xs pr-1">
            {[
              { id: 1, recipient: 'Anand Kumar (9845012345)', type: 'WhatsApp Invoice', status: 'Delivered', time: 'Today, 19:46' },
              { id: 2, recipient: 'Deepak Rao (9880011223)', type: 'Tailoring Ready Alert', status: 'Delivered', time: 'Today, 18:31' },
              { id: 3, recipient: 'Vikramaditya Rao (9900112233)', type: 'Khata Due Reminder', status: 'Delivered', time: 'Yesterday, 14:10' },
              { id: 4, recipient: 'Store Owner Backup', type: 'Email Nightly Backup Log', status: 'Sent', time: 'Yesterday, 23:00' },
            ].map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-gray-900">{log.recipient}</div>
                  <div className="text-[11px] text-gray-500 font-sans">{log.type} • {log.time}</div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {log.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
