import type { FC } from 'react';
import { useState } from 'react';
import { 
  History, 
  Search, 
  CheckCircle2, 
  ShieldAlert, 
  Calendar, 
  MapPin, 
  AlertCircle
} from 'lucide-react';
import type { ActivityLogEntry } from '../types';

interface ValidationActivityProps {
  activityLogs: ActivityLogEntry[];
  onClearLogs?: () => void;
}

export const ValidationActivity: FC<ValidationActivityProps> = ({
  activityLogs,
}) => {
  const [filterOutcome, setFilterOutcome] = useState<'all' | 'Approved' | 'Blocked'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = activityLogs.filter((log) => {
    // Outcome filter
    if (filterOutcome !== 'all' && log.outcome !== filterOutcome) return false;

    // Search filter
    const searchLower = searchTerm.toLowerCase();
    return (
      log.staffName.toLowerCase().includes(searchLower) ||
      log.clinicLocation.toLowerCase().includes(searchLower) ||
      (log.failedCredential && log.failedCredential.toLowerCase().includes(searchLower)) ||
      (log.failureReason && log.failureReason.toLowerCase().includes(searchLower))
    );
  });

  const totalEvents = activityLogs.length;
  const approvedEvents = activityLogs.filter((l) => l.outcome === 'Approved').length;
  const blockedEvents = activityLogs.filter((l) => l.outcome === 'Blocked').length;

  return (
    <div className="space-y-6">
      {/* Header and Summary */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <History className="w-5 h-5 text-blue-600" />
              Simulated Credential Validation Audit Trail
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Chronological log of shift assignments, swap approvals, and blocked non-compliant attempts &bull; CarePoint Clinics
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 text-xs font-mono font-medium border border-slate-200">
              {totalEvents} Logged Attempts ({approvedEvents} Approved, {blockedEvents} Blocked)
            </span>
          </div>
        </div>

        {/* Disclaimer Alert */}
        <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <strong>Demonstration Audit Trail:</strong> This simulated log models how CarePoint Clinics will audit shift scheduling decisions to satisfy hospital compliance requirements. In production, logs will link directly with the CarePoint HRIS without enabling manual record deletions.
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Filter by staff, clinic, or credential..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 placeholder-slate-400"
            />
          </div>

          <div className="flex items-center gap-1.5" aria-label="Outcome Filter Tabs">
            <button
              type="button"
              onClick={() => setFilterOutcome('all')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                filterOutcome === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Events ({totalEvents})
            </button>
            <button
              type="button"
              onClick={() => setFilterOutcome('Approved')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                filterOutcome === 'Approved'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              Approved ({approvedEvents})
            </button>
            <button
              type="button"
              onClick={() => setFilterOutcome('Blocked')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                filterOutcome === 'Blocked'
                  ? 'bg-red-700 text-white'
                  : 'bg-red-50 text-red-700 hover:bg-red-100'
              }`}
            >
              Blocked ({blockedEvents})
            </button>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Action Type</th>
                <th className="py-3 px-4">Target Shift &amp; Clinic</th>
                <th className="py-3 px-4">Outcome</th>
                <th className="py-3 px-4">Diagnostic Details / Block Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    No validation events match the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const isApproved = log.outcome === 'Approved';

                  return (
                    <tr
                      key={log.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        !isApproved ? 'bg-red-50/15' : ''
                      }`}
                    >
                      {/* Timestamp */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-medium text-slate-900">{log.formattedTime}</div>
                        <div className="text-[10px] text-slate-400 font-mono">ID: {log.id}</div>
                      </td>

                      {/* Staff */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-900">{log.staffName}</div>
                        <div className="text-[11px] text-slate-500">{log.staffRole} &bull; {log.staffId}</div>
                      </td>

                      {/* Action Type */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border ${
                          log.actionType === 'swap'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-blue-50 text-blue-800 border-blue-200'
                        }`}>
                          {log.actionType === 'swap' ? 'Swap Approval' : 'Shift Schedule'}
                        </span>
                      </td>

                      {/* Target Shift & Clinic */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {log.targetShiftDate} ({log.targetShiftTime})
                        </div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[200px] flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {log.clinicLocation.replace('CarePoint - ', '')}
                        </div>
                      </td>

                      {/* Outcome Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${
                          isApproved
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : 'bg-red-50 text-red-700 border-red-300'
                        }`}>
                          {isApproved ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                          )}
                          {log.outcome}
                        </span>
                      </td>

                      {/* Diagnostic details */}
                      <td className="py-3.5 px-4">
                        {isApproved ? (
                          <div className="text-slate-600 text-[11px]">
                            All mandatory credentials verified and active. Assignment confirmed by {log.managerName}.
                          </div>
                        ) : (
                          <div className="space-y-0.5">
                            <div className="text-red-700 font-semibold text-[11px]">
                              {log.failedCredential || 'Credential Verification Failed'}
                            </div>
                            <div className="text-red-600 text-[11px] leading-relaxed">
                              {log.failureReason}
                            </div>
                          </div>
                        )}
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
  );
};
