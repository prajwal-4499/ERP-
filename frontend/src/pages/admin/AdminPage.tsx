import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Activity,
  Database,
  Cpu,
  CheckCircle2,
  AlertCircle,
  FileCode,
  Clock,
} from 'lucide-react';
import { AuditLog } from '../../types';
import { api } from '../../services/api';

export const AdminPage: React.FC = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    api.getAuditLogs().then(setAuditLogs);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            System Administration &amp; Audit Logs
          </h2>
          <p className="text-xs text-gray-500 font-medium">Tamper-evident audit trails for all financial actions, invoice edits and system health diagnostics</p>
        </div>
      </div>

      {/* System Health Diagnostics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
        <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold flex-shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="text-gray-500 text-[11px] font-medium">Database Engine</div>
            <div className="text-sm font-bold text-gray-900 font-mono">MySQL / H2</div>
            <span className="text-[10px] text-emerald-600 font-bold">● Online</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold flex-shrink-0">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="text-gray-500 text-[11px] font-medium">Spring Boot Backend</div>
            <div className="text-sm font-bold text-gray-900 font-mono">Port 8080</div>
            <span className="text-[10px] text-emerald-600 font-bold">● Healthy</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold flex-shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="text-gray-500 text-[11px] font-medium">Background Tasks</div>
            <div className="text-sm font-bold text-gray-900 font-mono">3 Jobs Active</div>
            <span className="text-[10px] text-purple-600 font-bold">● Schedulers</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold flex-shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-gray-500 text-[11px] font-medium">Response Latency</div>
            <div className="text-sm font-bold text-gray-900 font-mono">&lt; 8ms</div>
            <span className="text-[10px] text-emerald-600 font-bold">● Instant Local</span>
          </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden text-xs">
        <div className="p-4 bg-gray-50/70 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-gray-900 uppercase">
                Audit Trail Activity Logs ({auditLogs.length} Events)
              </h3>
              <p className="text-[11px] text-gray-500 font-normal">Immutable audit ledger tracking financial operations</p>
            </div>
          </div>
        </div>

        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-[10px] tracking-wider border-b border-gray-200">
            <tr>
              <th className="p-3.5">Timestamp</th>
              <th className="p-3.5">User &amp; Role</th>
              <th className="p-3.5">Module</th>
              <th className="p-3.5">Action Type</th>
              <th className="p-3.5">Record ID</th>
              <th className="p-3.5">Reason / Details</th>
              <th className="p-3.5 text-center">Auth Method</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-mono">
            {auditLogs.map((log) => (
              <tr key={log.id} className="hover:bg-blue-50/40 transition">
                <td className="p-3.5 text-gray-500 text-[11px]">{log.timestamp}</td>
                <td className="p-3.5 text-gray-900 font-sans font-bold">
                  {log.username} <span className="text-[10px] text-gray-500 font-normal">({log.role})</span>
                </td>
                <td className="p-3.5 font-bold text-blue-600">{log.module}</td>
                <td className="p-3.5 font-sans">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      log.action.includes('EDIT') || log.action.includes('CANCEL')
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    }`}
                  >
                    {log.action}
                  </span>
                </td>
                <td className="p-3.5 text-gray-900 font-bold">{log.recordId}</td>
                <td className="p-3.5 text-gray-700 font-sans text-xs max-w-xs truncate">
                  {log.reason || log.newValue}
                </td>
                <td className="p-3.5 text-center">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-gray-100 text-gray-700 font-mono font-semibold border border-gray-200">
                    {log.authMethod}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
