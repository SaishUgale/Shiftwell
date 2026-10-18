import type { FC } from 'react';
import { 
  Users, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  ArrowRight, 
  ShieldCheck, 
  History, 
  AlertCircle
} from 'lucide-react';
import type { StaffMember, ActivityLogEntry } from '../types';
import { getStaffOverallEligibility } from '../utils/validationEngine';

interface OverviewProps {
  staffList: StaffMember[];
  activityLogs: ActivityLogEntry[];
  onNavigate: (tab: 'overview' | 'staff' | 'assignment' | 'activity') => void;
  onOpenCaseStudy: () => void;
  onSelectStaffForAssignment: (staffId: string) => void;
}

export const Overview: FC<OverviewProps> = ({
  staffList,
  activityLogs,
  onNavigate,
  onOpenCaseStudy,
  onSelectStaffForAssignment,
}) => {
  // Derive all metrics purely from mock state
  const totalStaff = staffList.length;

  let validStaffCount = 0;
  let expiredOrMissingCount = 0;
  let unverifiedCount = 0;

  staffList.forEach((staff) => {
    const { overallStatus } = getStaffOverallEligibility(staff);
    if (overallStatus === 'valid') {
      validStaffCount++;
    } else if (overallStatus === 'expired' || overallStatus === 'missing') {
      expiredOrMissingCount++;
    } else if (overallStatus === 'unverified') {
      unverifiedCount++;
    }
  });

  const blockedAssignments = activityLogs.filter((log) => log.outcome === 'Blocked').length;
  const recentLogs = activityLogs.slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Healthcare Operations Context Alert */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-xl p-5 text-white shadow-sm border border-blue-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-400 text-slate-900 tracking-wide uppercase">
                Audit Remediation Active
              </span>
              <span className="text-xs text-blue-200">CarePoint Clinics Incident Post-Mortem</span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">
              Shiftwell Mandatory Credential Enforcement
            </h1>
            <p className="text-sm text-blue-100 max-w-2xl leading-relaxed">
              In response to the audit finding where <strong>two shifts were covered by nurses with expired BLS certificates</strong>,
              Shiftwell blocks shift assignments and swap approvals when professional credentials are expired, missing, or unverified.
            </p>
          </div>
          <div className="flex flex-wrap sm:flex-col gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('assignment')}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              Try Assignment Workflow
            </button>
            <button
              type="button"
              onClick={onOpenCaseStudy}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-950/60 hover:bg-blue-900 text-blue-200 border border-blue-700/60 rounded-lg text-xs font-medium transition-all cursor-pointer"
            >
              Case Study Facts (&#8377;60L ARR)
            </button>
          </div>
        </div>
      </div>

      {/* 4 Core Metrics Cards (Strictly Derived from Mock Data) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Staff */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Mock Staff
            </span>
            <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{totalStaff}</span>
            <span className="text-xs text-slate-500">records in clinic roster</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            5 Nurses &bull; 1 General Physician
          </div>
        </div>

        {/* Valid Credentials */}
        <div className="bg-white p-5 rounded-xl border border-emerald-200 shadow-xs hover:border-emerald-300 transition-all bg-emerald-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
              Eligible &amp; Valid Staff
            </span>
            <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-700">{validStaffCount}</span>
            <span className="text-xs text-emerald-600">of {totalStaff} ready to assign</span>
          </div>
          <div className="mt-2 text-xs text-emerald-700 font-medium">
            All mandatory credentials current &amp; verified
          </div>
        </div>

        {/* Expired or Missing */}
        <div className="bg-white p-5 rounded-xl border border-red-200 shadow-xs hover:border-red-300 transition-all bg-red-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-red-700">
              Expired or Missing
            </span>
            <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center text-red-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-red-700">{expiredOrMissingCount}</span>
            <span className="text-xs text-red-600">staff members non-compliant</span>
          </div>
          <div className="mt-2 text-xs text-red-700 font-medium flex items-center gap-1">
            <span>Rohan (BLS), Meera (Reg), Kavya (Missing){unverifiedCount > 0 ? ` • ${unverifiedCount} Unverified (Priya)` : ''}</span>
          </div>
        </div>

        {/* Blocked Assignment Attempts */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              Recent Blocked Attempts
            </span>
            <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center text-red-600">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-red-600">{blockedAssignments}</span>
            <span className="text-xs text-slate-500">recorded in audit trail</span>
          </div>
          <div className="mt-2 text-xs text-slate-600">
            Zero shifts assigned with invalid credentials
          </div>
        </div>
      </div>

      {/* Main Grid: Staff Roster Health & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Roster Credential Snapshot */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Case Study Staff Credential Status</h2>
              <p className="text-xs text-slate-500">Evaluation reference date: 18 October 2026</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('staff')}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1 cursor-pointer"
            >
              View All Staff <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {staffList.map((staff) => {
              const { summaryLabel, badgeClass } = getStaffOverallEligibility(staff);
              const bls = staff.credentials.find((c) => c.type === 'BLS');
              const reg = staff.credentials.find((c) => c.type === 'NURSING_COUNCIL');

              return (
                <div
                  key={staff.id}
                  className="p-4 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-full ${staff.avatarBg} text-white font-semibold text-xs flex items-center justify-center shrink-0 shadow-xs`}>
                      {staff.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900">{staff.name}</span>
                        <span className="text-[11px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                          {staff.role}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 flex flex-wrap gap-x-3 gap-y-1">
                        {staff.role === 'Nurse' ? (
                          <>
                            <span>
                              BLS:{' '}
                              {!bls ? (
                                <strong className="text-red-600">Missing</strong>
                              ) : bls.verificationStatus !== 'verified' ? (
                                <strong className="text-amber-600">Unverified ({bls.expiryDate})</strong>
                              ) : bls.expiryDate && bls.expiryDate < '2026-10-18' ? (
                                <strong className="text-red-600">Expired ({bls.expiryDate})</strong>
                              ) : (
                                <strong className="text-emerald-700">Valid ({bls.expiryDate})</strong>
                              )}
                            </span>
                            <span>&bull;</span>
                            <span>
                              Council Reg:{' '}
                              {!reg ? (
                                <strong className="text-red-600">Missing</strong>
                              ) : reg.expiryDate && reg.expiryDate < '2026-10-18' ? (
                                <strong className="text-red-600">Expired ({reg.expiryDate})</strong>
                              ) : (
                                <strong className="text-emerald-700">Valid ({reg.expiryDate})</strong>
                              )}
                            </span>
                          </>
                        ) : (
                          <span className="text-slate-400 italic">Requirements not configured for {staff.role}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${badgeClass}`}>
                      {summaryLabel}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectStaffForAssignment(staff.id);
                        onNavigate('assignment');
                      }}
                      className="px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded border border-slate-200 hover:border-blue-200 transition-colors cursor-pointer"
                    >
                      Assign Shift
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (1 Col): Recent Simulated Activity */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-slate-500" />
                <h2 className="text-sm font-bold text-slate-900">Recent Validation Activity</h2>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('activity')}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
              >
                View Log
              </button>
            </div>

            <div className="p-4 space-y-3">
              {recentLogs.map((log) => (
                <div
                  key={log.id}
                  className={`p-3 rounded-lg border text-xs ${
                    log.outcome === 'Blocked'
                      ? 'bg-red-50/40 border-red-200 text-slate-800'
                      : 'bg-emerald-50/40 border-emerald-200 text-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-slate-900">{log.staffName}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        log.outcome === 'Blocked'
                          ? 'bg-red-600 text-white'
                          : 'bg-emerald-600 text-white'
                      }`}
                    >
                      {log.outcome}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
                    <span>{log.actionType === 'swap' ? 'Swap Approval' : 'Shift Schedule'}</span>
                    <span>&bull;</span>
                    <span>{log.formattedTime}</span>
                  </div>
                  {log.failureReason && (
                    <div className="mt-1.5 text-[11px] text-red-700 bg-red-100/60 p-1.5 rounded">
                      {log.failureReason}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 border-t border-slate-100 bg-slate-50/50 rounded-b-xl">
            <div className="flex items-start gap-2 text-xs text-slate-500">
              <AlertCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <span>
                Simulated activity trail records validation attempts without modifying external payroll or hospital systems.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
