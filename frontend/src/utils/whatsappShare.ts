import { Invoice } from '../types';
import { PrinterRole } from './billGenerator';

export interface StoreInfo {
  name: string;
  branch: string;
  address: string;
  phone: string;
  gstin: string;
}

/**
 * Clean phone number to ensure standard WhatsApp international format (e.g. 9198XXXXXXXX)
 */
export function formatWhatsAppPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return '91' + digits;
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits;
  }
  return digits;
}

/**
 * Generate English WhatsApp message for the purchase bill
 */
export function getEnglishWhatsAppMessage(
  invoice: Invoice,
  store: StoreInfo,
  printerRole: PrinterRole = 'CASHIER',
  operatorName: string = 'Staff'
): string {
  const roleLabel = printerRole === 'MANAGER' ? 'Manager Print Bill' : 'Cashier Print Bill';
  const itemsList = invoice.items
    .map(
      (item, idx) =>
        `${idx + 1}. *${item.articleName}* (${item.size || ''} ${item.color || ''}) - ${item.unitType === 'METER' ? `${item.quantity} Mtr` : `Qty: ${item.quantity}`} | ₹${item.totalAmount.toLocaleString('en-IN')}`
    )
    .join('\n');

  return `*${store.name.toUpperCase()}*
📍 ${store.branch} • ${store.address}
📞 Phone: ${store.phone} | GSTIN: ${store.gstin}

Namaste *${invoice.customerName}*,
Thank you for shopping with us! Here is your official purchase bill:

📄 *Bill / Invoice No:* ${invoice.invoiceNumber}
📅 *Date & Time:* ${invoice.createdAt}
💳 *Payment Mode:* ${invoice.paymentMode}

*PURCHASED ITEMS:*
${itemsList}

---------------------------------
💰 *Subtotal:* ₹${invoice.subtotal.toLocaleString('en-IN')}${
    invoice.billDiscount > 0 ? `\n🏷️ *Discount:* -₹${invoice.billDiscount.toLocaleString('en-IN')}` : ''
  }
💵 *NET GRAND TOTAL:* ₹${invoice.grandTotal.toLocaleString('en-IN')}
✅ *Paid Amount:* ₹${invoice.paidAmount.toLocaleString('en-IN')}${
    invoice.balanceAmount > 0
      ? `\n⚠️ *Khata Balance Due:* ₹${invoice.balanceAmount.toLocaleString('en-IN')}`
      : ''
  }
---------------------------------

👤 *Bill Print Authority:* [${roleLabel.toUpperCase()}]
✍️ *Printed by:* ${operatorName}

ℹ️ *Exchange Policy:* Allowed within 7 days with original tag and bill.
🙏 *** THANK YOU FOR SHOPPING WITH US! VISIT AGAIN! ***`;
}

/**
 * Generate Marathi WhatsApp message for the purchase bill
 */
export function getMarathiWhatsAppMessage(
  invoice: Invoice,
  store: StoreInfo,
  printerRole: PrinterRole = 'CASHIER',
  operatorName: string = 'Staff'
): string {
  const roleLabel = printerRole === 'MANAGER' ? 'मॅनेजर प्रिंट बिल' : 'कॅशियर प्रिंट बिल';
  const itemsList = invoice.items
    .map(
      (item, idx) =>
        `${idx + 1}. *${item.articleName}* (${item.size || ''} ${item.color || ''}) - ${item.unitType === 'METER' ? `${item.quantity} मीटर` : `नग: ${item.quantity}`} | ₹${item.totalAmount.toLocaleString('en-IN')}`
    )
    .join('\n');

  return `*श्रावणी कलेक्शन आणि न्यू एस. के. टेलर्स*
📍 ${store.branch} • ${store.address}
📞 संपर्क: ${store.phone} | GSTIN: ${store.gstin}

नमस्कार *${invoice.customerName}*,
आमच्या दुकानात खरेदी केल्याबद्दल मनःपूर्वक धन्यवाद! आपल्या खरेदी बिलाचा तपशील खालीलप्रमाणे:

📄 *बिल क्रमांक:* ${invoice.invoiceNumber}
📅 *तारीख आणि वेळ:* ${invoice.createdAt}
💳 *पेमेंट प्रकार:* ${invoice.paymentMode}

*खरेदी केलेल्या वस्तू:*
${itemsList}

---------------------------------
💰 *उप-एकूण (Subtotal):* ₹${invoice.subtotal.toLocaleString('en-IN')}${
    invoice.billDiscount > 0 ? `\n🏷️ *सूट (Discount):* -₹${invoice.billDiscount.toLocaleString('en-IN')}` : ''
  }
💵 *एकूण बिल रक्कम:* ₹${invoice.grandTotal.toLocaleString('en-IN')}
✅ *जमा रक्कम (Paid):* ₹${invoice.paidAmount.toLocaleString('en-IN')}${
    invoice.balanceAmount > 0
      ? `\n⚠️ *शिल्लक खाते बाकी (Khata Due):* ₹${invoice.balanceAmount.toLocaleString('en-IN')}`
      : ''
  }
---------------------------------

👤 *बिल प्रिंट प्राधिकृत:* [${roleLabel}]
✍️ *प्रिंट केले:* ${operatorName}

ℹ️ *नियम:* खरेदी केलेल्या कपड्यांची अदलाबदल ७ दिवसांत बिलासह केली जाईल.
🙏 *** आपल्या सेवेसाठी सदैव तत्पर! पुन्हा अवश्य भेट द्या! धन्यवाद! ***`;
}

/**
 * Open WhatsApp directly with the pre-filled message
 */
export function shareBillOnWhatsApp(
  phone: string | undefined,
  message: string
): void {
  const cleanPhone = phone ? formatWhatsAppPhone(phone) : '';
  const url = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
    : `https://wa.me/?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
}

/**
 * Dispatch Bilingual Birthday Greeting via WhatsApp
 */
export function sendBirthdayGreetingWhatsApp(
  customerName: string,
  phone: string | undefined,
  storeName: string = 'Shravani Collection',
  lang: 'EN' | 'MR' = 'EN'
): void {
  const message =
    lang === 'MR'
      ? `*${storeName}* तर्फे सस्नेह नमस्कार!\n\nप्रिय *${customerName}* जी,\nआपणास वाढदिवसाच्या हार्दिक हार्दिक शुभेच्छा! 🎂💐\nआपला आजचा दिवस आनंदात आणि उत्साहात जावो हीच ईश्वरचरणी प्रार्थना.\n\nआपल्या वाढदिवसाच्या निमित्ताने आज आमच्या दुकानात खास खरेदीवर विशेष भेट व सवलती उपलब्ध आहेत! नक्की भेट द्या!\n\n📍 *${storeName} & New S.K. Tailors*\n🙏 धन्यवाद!`
      : `*${storeName}* Greetings!\n\nDear *${customerName}*,\nWishing you a very Happy Birthday! 🎂💐\nMay your day be filled with joy and celebration. Visit our store today to claim your exclusive birthday shopping discount on all garments!\n\n📍 *${storeName}*\n🙏 Thank you!`;
  shareBillOnWhatsApp(phone, message);
}

/**
 * Dispatch Bilingual Anniversary Greeting via WhatsApp
 */
export function sendAnniversaryGreetingWhatsApp(
  customerName: string,
  phone: string | undefined,
  storeName: string = 'Shravani Collection',
  lang: 'EN' | 'MR' = 'EN'
): void {
  const message =
    lang === 'MR'
      ? `*${storeName}* तर्फे मनःपूर्वक शुभेच्छा!\n\nप्रिय *${customerName}* जी,\nआपणा उभयतांना लग्नाच्या वाढदिवसाच्या हार्दिक शुभेच्छा! 💐💍\nआपला संसार सुख, समाधान व समृद्धीने बहरावा हीच सदिच्छा.\n\n📍 *${storeName} & New S.K. Tailors*\n🙏 धन्यवाद!`
      : `*${storeName}* Greetings!\n\nDear *${customerName}*,\nWishing you a wonderful Wedding Anniversary! 💐💍\nMay love and happiness continue to grow in your life. Celebrate your special milestone with our exclusive festive collections!\n\n📍 *${storeName}*\n🙏 Thank you!`;
  shareBillOnWhatsApp(phone, message);
}

/**
 * Dispatch Bilingual Khata Overdue Balance Reminder via WhatsApp
 */
export function sendKhataReminderWhatsApp(
  customerName: string,
  phone: string | undefined,
  balance: number,
  storeName: string = 'Shravani Collection',
  lang: 'EN' | 'MR' = 'EN'
): void {
  const message =
    lang === 'MR'
      ? `*${storeName} - खाते बाकी स्मरणपत्र*\n\nसस्नेह नमस्कार *${customerName}* जी,\nआपल्या खात्यावर मागील खरेदीची शिल्लक रक्कम *₹${balance.toLocaleString('en-IN')}* येणे बाकी आहे.\n\nकृपया सवडीने दुकानात येऊन किंवा UPI द्वारे रक्कम जमा करावी ही नम्र विनंती.\n\n📍 *${storeName}*\n🙏 धन्यवाद!`
      : `*${storeName} - Khata Account Reminder*\n\nNamaste *${customerName}*,\nThis is a gentle reminder that your pending Khata balance is *₹${balance.toLocaleString('en-IN')}*.\n\nKindly clear the outstanding dues at your earliest convenience in-store or via digital payment.\n\n📍 *${storeName}*\n🙏 Thank you!`;
  shareBillOnWhatsApp(phone, message);
}

