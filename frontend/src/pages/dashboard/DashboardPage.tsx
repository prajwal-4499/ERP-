import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Download,
  Share2,
  Calendar,
  Sparkles,
  Cake,
  Heart,
  AlertTriangle,
  MessageCircle,
  Gift,
  BellRing,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { api } from '../../services/api';
import { Customer } from '../../types';
import {
  sendBirthdayGreetingWhatsApp,
  sendAnniversaryGreetingWhatsApp,
  sendKhataReminderWhatsApp,
} from '../../utils/whatsappShare';

// Monthly bar chart data matching the reference image style
const revenueTrendData = [
  { month: 'Jan', revenue: 14.2 },
  { month: 'Feb', revenue: 16.5 },
  { month: 'Mar', revenue: 15.8 },
  { month: 'Apr', revenue: 18.2 },
  { month: 'May', revenue: 19.4 },
  { month: 'Jun', revenue: 20.1 },
  { month: 'Jul', revenue: 20.8 },
  { month: 'Aug', revenue: 22.4 },
  { month: 'Sep', revenue: 23.1 },
  { month: 'Oct', revenue: 22.8 },
  { month: 'Nov', revenue: 24.5 },
  { month: 'Dec', revenue: 26.0 },
];

// Open donut / semi-gauge segment data matching reference image colors
const segmentData = [
  { name: 'Enterprise', value: 45, color: '#2563EB' },
  { name: 'SMB', value: 25, color: '#10B981' },
  { name: 'Consumer', value: 15, color: '#F59E0B' },
  { name: 'Wholesale', value: 15, color: '#8B5CF6' },
];

export const DashboardPage: React.FC = () => {
  const [metrics, setMetrics] = useState({
    todayRevenue: 124580,
    todayProfit: 47340,
    totalInvoices: 42,
    itemsSold: 74,
    avgInvoiceValue: 2966,
    customerOutstanding: 36500,
    supplierPayables: 128500,
    stockValue: 845000,
  });

  const [alerts, setAlerts] = useState<{
    birthdaysToday: Customer[];
    anniversariesToday: Customer[];
    overdueKhata: Customer[];
  }>({
    birthdaysToday: [],
    anniversariesToday: [],
    overdueKhata: [],
  });
  const [alertsTab, setAlertsTab] = useState<'ALL' | 'BIRTHDAYS' | 'ANNIVERSARIES' | 'KHATA'>('ALL');

  useEffect(() => {
    api.getDashboardMetrics().then((data) => {
      if (data) {
        setMetrics((prev) => ({ ...prev, ...data }));
      }
    });
    api.getTodayAlerts().then((data) => {
      if (data) {
        setAlerts(data);
      }
    });
  }, []);

  const handleExportReport = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Metric,Value,Growth,Period\n' +
      'Revenue,₹24.5M,+18%,Q4 2025 / Oct 2026\n' +
      'Active Customers,1.2M,+12%,Annual\n' +
      'Net Margin,38%,+2%,Q4\n' +
      'Return Rate,1.8%,-0.5%,Monthly\n';

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'Executive_Summary_Report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Page Header matching Reference Image */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-[#1F2937] tracking-tight">
            Executive Summary
          </h1>
          <p className="text-sm font-medium text-gray-500 mt-0.5">
            Q4 2025 Performance
          </p>
        </div>

        {/* Primary Royal Blue Action Button */}
        <button
          type="button"
          onClick={handleExportReport}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/25 transition active:scale-95"
        >
          <span>Export Report</span>
        </button>
      </div>

      {/* 4 Executive KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI Card 1: Revenue */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-xl shadow-xs">
              💰
            </div>
            <div className="flex items-center gap-1 font-bold text-xs text-[#10B981]">
              <span>↑</span>
              <span>+18%</span>
            </div>
          </div>
          <div className="text-3xl lg:text-4xl font-extrabold text-[#1F2937] tracking-tight font-sans">
            ₹2.45 Cr
          </div>
          <div className="text-xs font-semibold text-gray-500 mt-1">
            Revenue
          </div>
        </div>

        {/* KPI Card 2: Active Users */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-xl shadow-xs">
              👥
            </div>
            <div className="flex items-center gap-1 font-bold text-xs text-[#10B981]">
              <span>↑</span>
              <span>+12%</span>
            </div>
          </div>
          <div className="text-3xl lg:text-4xl font-extrabold text-[#1F2937] tracking-tight font-sans">
            1.2M
          </div>
          <div className="text-xs font-semibold text-gray-500 mt-1">
            Active Users
          </div>
        </div>

        {/* KPI Card 3: Net Margin */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-xl shadow-xs">
              📈
            </div>
            <div className="flex items-center gap-1 font-bold text-xs text-[#10B981]">
              <span>↑</span>
              <span>+2%</span>
            </div>
          </div>
          <div className="text-3xl lg:text-4xl font-extrabold text-[#1F2937] tracking-tight font-sans">
            23%
          </div>
          <div className="text-xs font-semibold text-gray-500 mt-1">
            Net Margin
          </div>
        </div>

        {/* KPI Card 4: Churn Rate */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center text-xl shadow-xs">
              🔄
            </div>
            <div className="flex items-center gap-1 font-bold text-xs text-[#EF4444]">
              <span>↓</span>
              <span>-0.5%</span>
            </div>
          </div>
          <div className="text-3xl lg:text-4xl font-extrabold text-[#1F2937] tracking-tight font-sans">
            2.1%
          </div>
          <div className="text-xs font-semibold text-gray-500 mt-1">
            Churn Rate
          </div>
        </div>
      </div>

      {/* Today's Alerts & Reminders Widget */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#1F2937] tracking-tight flex items-center gap-2">
                <span>Today&apos;s Customer Alerts &amp; Khata Reminders</span>
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-mono font-bold">
                  {alerts.birthdaysToday.length + alerts.anniversariesToday.length + alerts.overdueKhata.length} Active
                </span>
              </h2>
              <p className="text-xs text-gray-500 font-normal">
                One-click bilingual (English &amp; मराठी) WhatsApp greetings and payment reminders
              </p>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs bg-gray-50 p-1 rounded-xl">
            {[
              { id: 'ALL', label: `All (${alerts.birthdaysToday.length + alerts.anniversariesToday.length + alerts.overdueKhata.length})` },
              { id: 'BIRTHDAYS', label: `🎂 Birthdays (${alerts.birthdaysToday.length})` },
              { id: 'ANNIVERSARIES', label: `💍 Anniversaries (${alerts.anniversariesToday.length})` },
              { id: 'KHATA', label: `⚠️ Overdue Khata (${alerts.overdueKhata.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setAlertsTab(tab.id as any)}
                className={`px-2.5 py-1 rounded-lg font-bold transition text-[11px] ${
                  alertsTab === tab.id
                    ? 'bg-white text-purple-700 shadow-xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content list */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {/* Birthdays */}
          {(alertsTab === 'ALL' || alertsTab === 'BIRTHDAYS') &&
            alerts.birthdaysToday.map((c) => (
              <div
                key={`b-${c.id}`}
                className="p-4 rounded-xl bg-gradient-to-br from-pink-50/70 to-purple-50/40 border border-pink-100 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 flex items-center gap-1">
                      <Cake className="w-3 h-3" /> Birthday Today
                    </span>
                    <span className="text-[11px] font-mono text-gray-400">{c.phone}</span>
                  </div>
                  <div className="font-extrabold text-sm text-gray-900 mt-2">{c.name}</div>
                  <div className="text-xs text-gray-500">
                    Loyalty Points: <span className="font-bold text-gray-800">{c.loyaltyPoints || 0}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => sendBirthdayGreetingWhatsApp(c.name, c.phone, 'Shravani Collection', 'EN')}
                    className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] flex items-center justify-center gap-1 transition shadow-2xs"
                  >
                    <MessageCircle className="w-3 h-3" />
                    <span>WhatsApp EN</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => sendBirthdayGreetingWhatsApp(c.name, c.phone, 'Shravani Collection', 'MR')}
                    className="flex-1 py-1.5 px-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-[11px] flex items-center justify-center gap-1 transition shadow-2xs"
                  >
                    <MessageCircle className="w-3 h-3" />
                    <span>मराठी संदेश</span>
                  </button>
                </div>
              </div>
            ))}

          {/* Anniversaries */}
          {(alertsTab === 'ALL' || alertsTab === 'ANNIVERSARIES') &&
            alerts.anniversariesToday.map((c) => (
              <div
                key={`a-${c.id}`}
                className="p-4 rounded-xl bg-gradient-to-br from-amber-50/70 to-rose-50/40 border border-amber-100 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 flex items-center gap-1">
                      <Heart className="w-3 h-3" /> Anniversary
                    </span>
                    <span className="text-[11px] font-mono text-gray-400">{c.phone}</span>
                  </div>
                  <div className="font-extrabold text-sm text-gray-900 mt-2">{c.name}</div>
                  <div className="text-xs text-gray-500">
                    Customer Since: <span className="font-bold text-gray-800">{c.createdAt?.slice(0, 4) || '2025'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => sendAnniversaryGreetingWhatsApp(c.name, c.phone, 'Shravani Collection', 'EN')}
                    className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] flex items-center justify-center gap-1 transition shadow-2xs"
                  >
                    <MessageCircle className="w-3 h-3" />
                    <span>WhatsApp EN</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => sendAnniversaryGreetingWhatsApp(c.name, c.phone, 'Shravani Collection', 'MR')}
                    className="flex-1 py-1.5 px-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-[11px] flex items-center justify-center gap-1 transition shadow-2xs"
                  >
                    <MessageCircle className="w-3 h-3" />
                    <span>मराठी संदेश</span>
                  </button>
                </div>
              </div>
            ))}

          {/* Overdue Khata Balances */}
          {(alertsTab === 'ALL' || alertsTab === 'KHATA') &&
            alerts.overdueKhata.map((c) => (
              <div
                key={`k-${c.id}`}
                className="p-4 rounded-xl bg-gradient-to-br from-orange-50/70 to-amber-50/40 border border-orange-200 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-amber-600" /> Khata Overdue
                    </span>
                    <span className="text-[11px] font-mono text-gray-400">{c.phone}</span>
                  </div>
                  <div className="font-extrabold text-sm text-gray-900 mt-2">{c.name}</div>
                  <div className="text-xs font-mono font-bold text-amber-800">
                    Outstanding: ₹{c.outstandingBalance.toLocaleString('en-IN')}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => sendKhataReminderWhatsApp(c.name, c.phone, c.outstandingBalance, 'Shravani Collection', 'EN')}
                    className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] flex items-center justify-center gap-1 transition shadow-2xs"
                  >
                    <MessageCircle className="w-3 h-3" />
                    <span>Remind EN</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => sendKhataReminderWhatsApp(c.name, c.phone, c.outstandingBalance, 'Shravani Collection', 'MR')}
                    className="flex-1 py-1.5 px-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-[11px] flex items-center justify-center gap-1 transition shadow-2xs"
                  >
                    <MessageCircle className="w-3 h-3" />
                    <span>स्मरणपत्र पाठवा</span>
                  </button>
                </div>
              </div>
            ))}
        </div>

        {alerts.birthdaysToday.length === 0 &&
          alerts.anniversariesToday.length === 0 &&
          alerts.overdueKhata.length === 0 && (
            <div className="text-center py-6 text-xs text-gray-400">
              No pending customer birthdays, anniversaries, or Khata reminders for today.
            </div>
          )}
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Revenue Trend Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="font-bold text-base text-[#1F2937]">Revenue Trend</h3>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                <XAxis dataKey="month" stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', color: '#fff', borderRadius: '10px', fontSize: '12px', border: 'none' }}
                  formatter={(val: any) => [`$${val}M`, 'Monthly Revenue']}
                />
                <Bar dataKey="revenue" fill="#2563EB" radius={[6, 6, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Revenue by Segment Open Donut / Gauge Chart */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="mb-2">
            <h3 className="font-bold text-base text-[#1F2937]">Revenue by Segment</h3>
          </div>

          {/* Open Donut Gauge */}
          <div className="h-56 w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={segmentData}
                  cx="50%"
                  cy="50%"
                  startAngle={210}
                  endAngle={-30}
                  innerRadius={65}
                  outerRadius={90}
                  paddingAngle={6}
                  dataKey="value"
                  cornerRadius={6}
                >
                  {segmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#FFFFFF" strokeWidth={3} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', color: '#fff', borderRadius: '10px', fontSize: '12px', border: 'none' }}
                  formatter={(val: any) => [`${val}%`, 'Share']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend Dots matching Reference Image */}
          <div className="flex items-center justify-center gap-6 pt-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-700">
              <span className="w-3 h-3 rounded-full bg-[#2563EB]" />
              <span>Enterprise</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-700">
              <span className="w-3 h-3 rounded-full bg-[#10B981]" />
              <span>SMB</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-700">
              <span className="w-3 h-3 rounded-full bg-[#F59E0B]" />
              <span>Consumer</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Business Unit Performance */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <h3 className="font-bold text-base text-[#1F2937]">Business Unit Performance</h3>
          <span className="text-xs font-medium text-gray-500 font-mono">Real-time Retail Tracking</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold">
              <tr>
                <th className="p-3.5 rounded-l-xl">Division / Department</th>
                <th className="p-3.5">Key Category</th>
                <th className="p-3.5 text-right">Revenue Share</th>
                <th className="p-3.5 text-right">QoQ Growth</th>
                <th className="p-3.5 text-right">Gross Margin</th>
                <th className="p-3.5 text-center rounded-r-xl">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700 font-medium">
              <tr className="hover:bg-gray-50/80 transition">
                <td className="p-3.5 font-bold text-[#1F2937]">Formal Menswear</td>
                <td className="p-3.5">Oxford Shirts &amp; Chinos</td>
                <td className="p-3.5 text-right font-mono font-bold">₹1.12 Cr</td>
                <td className="p-3.5 text-right font-bold text-[#10B981]">+24%</td>
                <td className="p-3.5 text-right font-mono">42%</td>
                <td className="p-3.5 text-center">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-[#10B981] border border-emerald-200">
                    High Growth
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-gray-50/80 transition">
                <td className="p-3.5 font-bold text-[#1F2937]">Denim &amp; Casuals</td>
                <td className="p-3.5">Stretch Slim-Fit Jeans</td>
                <td className="p-3.5 text-right font-mono font-bold">₹84.0 L</td>
                <td className="p-3.5 text-right font-bold text-[#10B981]">+16%</td>
                <td className="p-3.5 text-right font-mono">36%</td>
                <td className="p-3.5 text-center">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-[#10B981] border border-emerald-200">
                    Strong
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-gray-50/80 transition">
                <td className="p-3.5 font-bold text-[#1F2937]">Ethnic Silk &amp; Sarees</td>
                <td className="p-3.5">Kanjivaram Handloom</td>
                <td className="p-3.5 text-right font-mono font-bold">₹49.0 L</td>
                <td className="p-3.5 text-right font-bold text-[#10B981]">+8%</td>
                <td className="p-3.5 text-right font-mono">48%</td>
                <td className="p-3.5 text-center">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-[#2563EB] border border-blue-200">
                    High Margin
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
