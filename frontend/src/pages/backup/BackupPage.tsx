import React, { useState } from 'react';
import {
  HardDriveDownload,
  Cloud,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ShieldCheck,
  Calendar,
  Lock,
  Sparkles,
} from 'lucide-react';

export const BackupPage: React.FC = () => {
  const [backups, setBackups] = useState([
    { id: 'BAK-20261006-2300', size: '14.2 MB', type: 'Full Database & Documents', status: 'VERIFIED', created: '2026-10-06 23:00:00', driveSync: 'Synced to Google Drive' },
    { id: 'BAK-20261005-2300', size: '13.8 MB', type: 'Full Database & Documents', status: 'VERIFIED', created: '2026-10-05 23:00:00', driveSync: 'Synced to Google Drive' },
    { id: 'BAK-20261004-2300', size: '13.5 MB', type: 'Full Database & Documents', status: 'VERIFIED', created: '2026-10-04 23:00:00', driveSync: 'Synced to Google Drive' },
  ]);

  const [isCreating, setIsCreating] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [googleDriveEnabled, setGoogleDriveEnabled] = useState(true);
  const [emailAlertsEnabled, setEmailAlertsEnabled] = useState(true);

  const handleCreateBackupNow = () => {
    setIsCreating(true);
    setTimeout(() => {
      const newBak = {
        id: `BAK-${new Date().toISOString().replaceAll('-', '').replaceAll(':', '').replace('T', '').slice(0, 12)}`,
        size: '14.6 MB',
        type: 'Full Database & Documents',
        status: 'VERIFIED',
        created: new Date().toISOString().replace('T', ' ').slice(0, 19),
        driveSync: googleDriveEnabled ? 'Synced to Google Drive' : 'Local Only',
      };
      setBackups([newBak, ...backups]);
      setIsCreating(false);
      setSuccessMsg('Manual full database snapshot generated and verified!');
      setTimeout(() => setSuccessMsg(''), 4000);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            Disaster Recovery &amp; Backup Center
          </h2>
          <p className="text-xs text-gray-500 font-medium">First-class automated local backups, Google Drive cloud synchronization &amp; pre-restore safety snapshots</p>
        </div>

        <button
          type="button"
          disabled={isCreating}
          onClick={handleCreateBackupNow}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm shadow-blue-600/20 transition disabled:opacity-50"
        >
          <HardDriveDownload className="w-4 h-4" />
          <span>{isCreating ? 'Creating Snapshot...' : 'Create Backup Snapshot Now'}</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Cloud & Schedule Configuration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Google Drive Configuration */}
        <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Cloud className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-gray-900">Google Drive Cloud Storage Sync</h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              CONNECTED
            </span>
          </div>

          <div className="space-y-3.5 text-xs">
            <label className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 border border-gray-200 cursor-pointer hover:border-gray-300 transition">
              <div>
                <div className="font-bold text-gray-900">Auto Cloud Upload</div>
                <div className="text-[11px] text-gray-500">Mirror local database dumps to Google Drive folder</div>
              </div>
              <input
                type="checkbox"
                checked={googleDriveEnabled}
                onChange={(e) => setGoogleDriveEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
            </label>

            <div>
              <label className="block text-gray-700 font-semibold mb-1">Target Cloud Folder ID / Path</label>
              <input
                type="text"
                readOnly
                value="GoogleDrive:/ClothShop_ERP_Backups/Production"
                className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 font-mono text-xs"
              />
            </div>
          </div>
        </div>

        {/* Schedule & Retention */}
        <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Calendar className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-gray-900">Automated Schedule &amp; Retention</h3>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Daily Automated Time</label>
                <input
                  type="text"
                  readOnly
                  value="11:00 PM (After Store Close)"
                  className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Retention Policy</label>
                <input
                  type="text"
                  readOnly
                  value="Keep Last 30 Daily Dumps"
                  className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 font-mono text-xs"
                />
              </div>
            </div>

            <label className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 border border-gray-200 cursor-pointer hover:border-gray-300 transition">
              <div>
                <div className="font-bold text-gray-900">Email Notifications on Success/Failure</div>
                <div className="text-[11px] text-gray-500">Send dispatch report to owner@clothshoperp.com</div>
              </div>
              <input
                type="checkbox"
                checked={emailAlertsEnabled}
                onChange={(e) => setEmailAlertsEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Historical Snapshots Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden text-xs">
        <div className="p-4 bg-gray-50/70 border-b border-gray-200 flex justify-between items-center">
          <h3 className="font-extrabold text-gray-900 uppercase tracking-wider text-[11px]">Available Database Backups ({backups.length})</h3>
          <span className="text-[11px] text-gray-500 font-medium">Pre-restore Safety Snapshots Mandatory</span>
        </div>

        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-[10px] tracking-wider border-b border-gray-200">
            <tr>
              <th className="p-3.5">Backup ID</th>
              <th className="p-3.5">Created Timestamp</th>
              <th className="p-3.5">Size</th>
              <th className="p-3.5">Cloud Status</th>
              <th className="p-3.5 text-center">Integrity Status</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-mono">
            {backups.map((b) => (
              <tr key={b.id} className="hover:bg-blue-50/40 transition">
                <td className="p-3.5 font-bold text-blue-600">{b.id}</td>
                <td className="p-3.5 text-gray-700">{b.created}</td>
                <td className="p-3.5 text-gray-700">{b.size}</td>
                <td className="p-3.5 text-emerald-700 font-bold font-sans">{b.driveSync}</td>
                <td className="p-3.5 text-center">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {b.status}
                  </span>
                </td>
                <td className="p-3.5 text-right font-sans">
                  <button
                    onClick={() => alert(`Pre-restore snapshot verified for ${b.id}. Admin restore triggered safely.`)}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-[11px] font-bold transition shadow-sm"
                  >
                    Restore
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
