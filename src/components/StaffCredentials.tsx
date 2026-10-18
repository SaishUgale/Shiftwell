import type { FC } from 'react';
import { useState } from 'react';
import { 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Clock, 
  X, 
  Edit3, 
  RotateCcw, 
  ShieldCheck, 
  Info, 
  PlusCircle, 
  Save
} from 'lucide-react';
import type { StaffMember, CredentialRecord, StaffFilterStatus } from '../types';
import { getStaffOverallEligibility, DEMO_DATE, getDaysDifference } from '../utils/validationEngine';

interface StaffCredentialsProps {
  staffList: StaffMember[];
  onUpdateStaffCredential: (
    staffId: string, 
    credentialId: string, 
    updates: Partial<CredentialRecord>
  ) => void;
  onAddCredential: (staffId: string, newCredential: CredentialRecord) => void;
  onResetStaffData: () => void;
  onAssignShiftForStaff: (staffId: string) => void;
}

export const StaffCredentials: FC<StaffCredentialsProps> = ({
  staffList,
  onUpdateStaffCredential,
  onAddCredential,
  onResetStaffData,
  onAssignShiftForStaff,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StaffFilterStatus>('all');
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);

  // Edit modal / drawer state
  const [editingCred, setEditingCred] = useState<CredentialRecord | null>(null);
  const [editExpiryDate, setEditExpiryDate] = useState('');
  const [editVerificationStatus, setEditVerificationStatus] = useState<'verified' | 'unverified' | 'pending_verification'>('verified');
  const [showAddBlsModal, setShowAddBlsModal] = useState(false);
  const [newBlsExpiry, setNewBlsExpiry] = useState('2027-12-31');
  const [newBlsStatus, setNewBlsStatus] = useState<'verified' | 'unverified'>('verified');

  // Filter staff list
  const filteredStaff = staffList.filter((staff) => {
    // Search match
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      staff.name.toLowerCase().includes(searchLower) ||
      staff.role.toLowerCase().includes(searchLower) ||
      staff.email.toLowerCase().includes(searchLower) ||
      staff.primaryClinic.toLowerCase().includes(searchLower);

    if (!matchesSearch) return false;

    // Filter status match
    if (statusFilter === 'all') return true;

    const { overallStatus } = getStaffOverallEligibility(staff);
    if (statusFilter === 'valid') return overallStatus === 'valid';
    if (statusFilter === 'expired') return overallStatus === 'expired';
    if (statusFilter === 'missing') return overallStatus === 'missing';
    if (statusFilter === 'unverified') return overallStatus === 'unverified';

    return true;
  });

  // Calculate filter counts
  const counts = {
    all: staffList.length,
    valid: staffList.filter((s) => getStaffOverallEligibility(s).overallStatus === 'valid').length,
    expired: staffList.filter((s) => getStaffOverallEligibility(s).overallStatus === 'expired').length,
    missing: staffList.filter((s) => getStaffOverallEligibility(s).overallStatus === 'missing').length,
    unverified: staffList.filter((s) => getStaffOverallEligibility(s).overallStatus === 'unverified').length,
  };

  const handleOpenEdit = (cred: CredentialRecord) => {
    setEditingCred(cred);
    setEditExpiryDate(cred.expiryDate || '');
    setEditVerificationStatus(cred.verificationStatus);
  };

  const handleSaveEdit = () => {
    if (!selectedStaff || !editingCred) return;
    onUpdateStaffCredential(selectedStaff.id, editingCred.id, {
      expiryDate: editExpiryDate,
      verificationStatus: editVerificationStatus,
      lastUpdated: '2026-10-18',
    });

    // Refresh selected staff reference from updated staffList
    const updatedStaff = {
      ...selectedStaff,
      credentials: selectedStaff.credentials.map((c) =>
        c.id === editingCred.id
          ? {
              ...c,
              expiryDate: editExpiryDate,
              verificationStatus: editVerificationStatus,
              lastUpdated: '2026-10-18',
            }
          : c
      ),
    };
    setSelectedStaff(updatedStaff);
    setEditingCred(null);
  };

  const handleAddMissingBls = () => {
    if (!selectedStaff) return;
    const newCred: CredentialRecord = {
      id: `CRD-${selectedStaff.id}-BLS-SIM`,
      type: 'BLS',
      name: 'Basic Life Support (BLS)',
      certificateNumber: 'AHA-BLS-SIMULATED-2026',
      issuingBody: 'American Heart Association (AHA)',
      expiryDate: newBlsExpiry,
      verificationStatus: newBlsStatus,
      lastUpdated: '2026-10-18',
      verifiedBy: newBlsStatus === 'verified' ? 'Dr. Sandeep Rao (CMO)' : undefined,
      verificationDate: newBlsStatus === 'verified' ? '2026-10-18' : undefined,
    };
    onAddCredential(selectedStaff.id, newCred);

    // Update selected staff local state
    const updated = {
      ...selectedStaff,
      credentials: [...selectedStaff.credentials, newCred],
    };
    setSelectedStaff(updated);
    setShowAddBlsModal(false);
  };

  // Keep selectedStaff in sync if staffList updates
  const activeStaff = selectedStaff
    ? staffList.find((s) => s.id === selectedStaff.id) || selectedStaff
    : null;

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold text-slate-900">CarePoint Staff &amp; Credential Registry</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Mandatory credential compliance status for all clinical personnel &bull; Active reference date: 18 Oct 2026
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onResetStaffData}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Reset all staff credentials back to default case study state"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Demo Records
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by name, role, email, clinic..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 placeholder-slate-400"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0" aria-label="Status Filters">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                statusFilter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Staff
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                {counts.all}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('valid')}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                statusFilter === 'valid'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              Valid
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-800 text-emerald-200">
                {counts.valid}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('expired')}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                statusFilter === 'expired'
                  ? 'bg-red-700 text-white'
                  : 'bg-red-50 text-red-700 hover:bg-red-100'
              }`}
            >
              Expired
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-800 text-red-200">
                {counts.expired}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('missing')}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                statusFilter === 'missing'
                  ? 'bg-red-700 text-white'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
              }`}
            >
              Missing
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-800 text-rose-200">
                {counts.missing}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('unverified')}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                statusFilter === 'unverified'
                  ? 'bg-amber-700 text-white'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
              }`}
            >
              Unverified
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-800 text-amber-200">
                {counts.unverified}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Staff Roster: Table for Tablets/Desktop, Responsive Card Stack for Mobile */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Role &amp; Clinic</th>
                <th className="py-3 px-4">BLS Certificate (Mandatory)</th>
                <th className="py-3 px-4">Nursing Council Reg (Mandatory)</th>
                <th className="py-3 px-4">Overall Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No staff records match the current filter or search criteria.
                  </td>
                </tr>
              ) : (
                filteredStaff.map((staff) => {
                  const { summaryLabel, badgeClass } = getStaffOverallEligibility(staff);
                  const bls = staff.credentials.find((c) => c.type === 'BLS');
                  const reg = staff.credentials.find((c) => c.type === 'NURSING_COUNCIL');

                  return (
                    <tr
                      key={staff.id}
                      className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                      onClick={() => setSelectedStaff(staff)}
                    >
                      {/* Name & ID */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full ${staff.avatarBg} text-white font-semibold flex items-center justify-center shrink-0 text-xs shadow-xs`}>
                            {staff.name.split(' ').map((n) => n[0]).join('')}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                              {staff.name}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">{staff.id} &bull; {staff.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Role & Clinic */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800">{staff.role}</div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[160px]">{staff.primaryClinic.replace('CarePoint - ', '')}</div>
                      </td>

                      {/* BLS status */}
                      <td className="py-3.5 px-4">
                        {staff.role !== 'Nurse' ? (
                          <span className="text-slate-400 italic text-[11px]">N/A for role</span>
                        ) : !bls ? (
                          <span className="inline-flex items-center gap-1 text-red-600 font-semibold bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                            <AlertTriangle className="w-3 h-3" /> Missing
                          </span>
                        ) : bls.verificationStatus !== 'verified' ? (
                          <div>
                            <span className="inline-flex items-center gap-1 text-amber-700 font-medium bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                              <Clock className="w-3 h-3" /> Unverified
                            </span>
                            <div className="text-[10px] text-slate-400 mt-0.5">Exp: {bls.expiryDate}</div>
                          </div>
                        ) : bls.expiryDate && bls.expiryDate < DEMO_DATE ? (
                          <div>
                            <span className="inline-flex items-center gap-1 text-red-600 font-medium bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                              <ShieldAlert className="w-3 h-3" /> Expired
                            </span>
                            <div className="text-[10px] text-red-500 font-mono mt-0.5">Exp: {bls.expiryDate}</div>
                          </div>
                        ) : (
                          <div>
                            <span className="inline-flex items-center gap-1 text-emerald-700 font-medium bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                              <CheckCircle2 className="w-3 h-3" /> Valid
                            </span>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">Exp: {bls.expiryDate}</div>
                          </div>
                        )}
                      </td>

                      {/* Nursing Council Reg status */}
                      <td className="py-3.5 px-4">
                        {staff.role !== 'Nurse' ? (
                          <span className="text-slate-400 italic text-[11px]">N/A for role</span>
                        ) : !reg ? (
                          <span className="inline-flex items-center gap-1 text-red-600 font-semibold bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                            <AlertTriangle className="w-3 h-3" /> Missing
                          </span>
                        ) : reg.verificationStatus !== 'verified' ? (
                          <div>
                            <span className="inline-flex items-center gap-1 text-amber-700 font-medium bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                              <Clock className="w-3 h-3" /> Unverified
                            </span>
                            <div className="text-[10px] text-slate-400 mt-0.5">Exp: {reg.expiryDate}</div>
                          </div>
                        ) : reg.expiryDate && reg.expiryDate < DEMO_DATE ? (
                          <div>
                            <span className="inline-flex items-center gap-1 text-red-600 font-medium bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                              <ShieldAlert className="w-3 h-3" /> Expired
                            </span>
                            <div className="text-[10px] text-red-500 font-mono mt-0.5">Exp: {reg.expiryDate}</div>
                          </div>
                        ) : (
                          <div>
                            <span className="inline-flex items-center gap-1 text-emerald-700 font-medium bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                              <CheckCircle2 className="w-3 h-3" /> Valid
                            </span>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">Exp: {reg.expiryDate}</div>
                          </div>
                        )}
                      </td>

                      {/* Overall Status */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2.5 py-0.8 rounded-full text-[11px] font-semibold border ${badgeClass}`}>
                          {summaryLabel}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => setSelectedStaff(staff)}
                            className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded border border-slate-300 transition-colors cursor-pointer"
                          >
                            Details
                          </button>
                          <button
                            type="button"
                            onClick={() => onAssignShiftForStaff(staff.id)}
                            className="px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition-colors cursor-pointer"
                          >
                            Assign
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Responsive Card Stack View */}
        <div className="md:hidden divide-y divide-slate-100">
          {filteredStaff.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No staff records match the current filter or search criteria.
            </div>
          ) : (
            filteredStaff.map((staff) => {
              const { summaryLabel, badgeClass } = getStaffOverallEligibility(staff);
              const bls = staff.credentials.find((c) => c.type === 'BLS');
              const reg = staff.credentials.find((c) => c.type === 'NURSING_COUNCIL');

              return (
                <div
                  key={staff.id}
                  className="p-3.5 space-y-3 hover:bg-slate-50/70 transition-colors cursor-pointer"
                  onClick={() => setSelectedStaff(staff)}
                >
                  {/* Card Header: Avatar, Name, Clinic, Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-full ${staff.avatarBg} text-white font-semibold flex items-center justify-center shrink-0 text-xs shadow-xs`}>
                        {staff.name.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 text-xs">
                          {staff.name}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {staff.role} &bull; {staff.primaryClinic.replace('CarePoint - ', '')}
                        </div>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${badgeClass} shrink-0`}>
                      {summaryLabel}
                    </span>
                  </div>

                  {/* Credentials breakdown */}
                  {staff.role === 'Nurse' ? (
                    <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                      {/* BLS */}
                      <div>
                        <div className="text-[10px] uppercase font-semibold text-slate-400">BLS Cert</div>
                        {!bls ? (
                          <span className="inline-flex items-center gap-1 text-red-600 font-semibold mt-0.5">
                            <AlertTriangle className="w-3 h-3" /> Missing
                          </span>
                        ) : bls.verificationStatus !== 'verified' ? (
                          <div>
                            <span className="inline-flex items-center gap-1 text-amber-700 font-medium mt-0.5">
                              <Clock className="w-3 h-3" /> Unverified
                            </span>
                            <div className="text-[10px] text-slate-400 font-mono">Exp: {bls.expiryDate}</div>
                          </div>
                        ) : bls.expiryDate && bls.expiryDate < DEMO_DATE ? (
                          <div>
                            <span className="inline-flex items-center gap-1 text-red-600 font-medium mt-0.5">
                              <ShieldAlert className="w-3 h-3" /> Expired
                            </span>
                            <div className="text-[10px] text-red-500 font-mono">Exp: {bls.expiryDate}</div>
                          </div>
                        ) : (
                          <div>
                            <span className="inline-flex items-center gap-1 text-emerald-700 font-medium mt-0.5">
                              <CheckCircle2 className="w-3 h-3" /> Valid
                            </span>
                            <div className="text-[10px] text-slate-400 font-mono">Exp: {bls.expiryDate}</div>
                          </div>
                        )}
                      </div>

                      {/* Nursing Council Reg */}
                      <div>
                        <div className="text-[10px] uppercase font-semibold text-slate-400">Council Reg</div>
                        {!reg ? (
                          <span className="inline-flex items-center gap-1 text-red-600 font-semibold mt-0.5">
                            <AlertTriangle className="w-3 h-3" /> Missing
                          </span>
                        ) : reg.verificationStatus !== 'verified' ? (
                          <div>
                            <span className="inline-flex items-center gap-1 text-amber-700 font-medium mt-0.5">
                              <Clock className="w-3 h-3" /> Unverified
                            </span>
                            <div className="text-[10px] text-slate-400 font-mono">Exp: {reg.expiryDate}</div>
                          </div>
                        ) : reg.expiryDate && reg.expiryDate < DEMO_DATE ? (
                          <div>
                            <span className="inline-flex items-center gap-1 text-red-600 font-medium mt-0.5">
                              <ShieldAlert className="w-3 h-3" /> Expired
                            </span>
                            <div className="text-[10px] text-red-500 font-mono">Exp: {reg.expiryDate}</div>
                          </div>
                        ) : (
                          <div>
                            <span className="inline-flex items-center gap-1 text-emerald-700 font-medium mt-0.5">
                              <CheckCircle2 className="w-3 h-3" /> Valid
                            </span>
                            <div className="text-[10px] text-slate-400 font-mono">Exp: {reg.expiryDate}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-400 italic bg-slate-50 p-2 rounded-lg border border-slate-200/60">
                      Mandatory credential rules not configured for role '{staff.role}'
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-0.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => setSelectedStaff(staff)}
                      className="flex-1 py-1.5 px-3 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-300 text-center transition-colors cursor-pointer"
                    >
                      Details &amp; Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onAssignShiftForStaff(staff.id)}
                      className="flex-1 py-1.5 px-3 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 text-center transition-colors cursor-pointer flex items-center justify-center gap-1"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Assign Shift
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Staff Credential Detail & Edit Slide-over Drawer */}
      {activeStaff && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full ${activeStaff.avatarBg} text-white font-bold text-sm flex items-center justify-center shadow-xs shrink-0`}>
                  {activeStaff.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900">{activeStaff.name}</h2>
                  <div className="text-[11px] sm:text-xs text-slate-500 flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <span className="font-medium text-slate-700">{activeStaff.role}</span>
                    <span>&bull;</span>
                    <span>{activeStaff.id}</span>
                    <span>&bull;</span>
                    <span>{activeStaff.primaryClinic.replace('CarePoint - ', '')}</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedStaff(null);
                  setEditingCred(null);
                  setShowAddBlsModal(false);
                }}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer shrink-0"
                title="Close drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Simulated Record Edit Notice */}
            <div className="p-3 bg-amber-50 border-b border-amber-200 text-amber-900 text-xs flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Prototype Simulation Environment:</strong> You can edit certificate expiry dates and verification status to simulate renewals or audits. Edits update local state only and trigger immediate revalidation.
              </div>
            </div>

            {/* Drawer Body: Credentials List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Registered Professional Credentials ({activeStaff.credentials.length})
                </h3>
                {activeStaff.role === 'Nurse' && !activeStaff.credentials.some((c) => c.type === 'BLS') && (
                  <button
                    type="button"
                    onClick={() => setShowAddBlsModal(true)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-lg cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    Upload / Add BLS Certificate
                  </button>
                )}
              </div>

              {activeStaff.credentials.length === 0 ? (
                <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
                  No credential records on file. Staff member is currently ineligible for shifts requiring verified certificates.
                </div>
              ) : (
                <div className="space-y-3">
                  {activeStaff.credentials.map((cred) => {
                    const daysRemaining = cred.expiryDate ? getDaysDifference(cred.expiryDate, DEMO_DATE) : 0;
                    const isExpired = cred.expiryDate ? daysRemaining < 0 : false;
                    const isUnverified = cred.verificationStatus !== 'verified';

                    return (
                      <div
                        key={cred.id}
                        className={`p-4 rounded-xl border text-xs transition-all ${
                          isExpired
                            ? 'bg-red-50/40 border-red-200'
                            : isUnverified
                            ? 'bg-amber-50/40 border-amber-200'
                            : 'bg-white border-slate-200 shadow-xs'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-sm">{cred.name}</span>
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                                {cred.type}
                              </span>
                            </div>
                            <div className="text-slate-500 text-[11px] mt-0.5">
                              Issuer: {cred.issuingBody} &bull; Cert #{cred.certificateNumber || 'N/A'}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleOpenEdit(cred)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 font-medium rounded border border-slate-200 text-xs cursor-pointer shadow-xs"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            Simulate Edit
                          </button>
                        </div>

                        {/* Status Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-100">
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-semibold">Expiry Date</span>
                            <div className="font-medium text-slate-800 mt-0.5 flex items-center gap-1">
                              {cred.expiryDate || 'Not recorded'}
                              {isExpired && (
                                <span className="text-[10px] font-bold text-red-600">
                                  ({Math.abs(daysRemaining)}d ago)
                                </span>
                              )}
                            </div>
                          </div>

                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-semibold">Verification</span>
                            <div className="mt-0.5">
                              {cred.verificationStatus === 'verified' ? (
                                <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                                  <CheckCircle2 className="w-3 h-3" /> Verified
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-amber-700 font-semibold">
                                  <Clock className="w-3 h-3" /> Pending Review
                                </span>
                              )}
                            </div>
                          </div>

                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-semibold">Last Audited</span>
                            <div className="text-slate-600 mt-0.5">{cred.lastUpdated || 'Initial Record'}</div>
                          </div>
                        </div>

                        {/* Failure diagnostics */}
                        {isExpired && (
                          <div className="mt-3 p-2 bg-red-100/70 text-red-800 rounded text-[11px] border border-red-200 flex items-start gap-1.5">
                            <ShieldAlert className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                            <div>
                              <strong>Validation Failure Reason:</strong> Certificate expired on {cred.expiryDate}. Current operating policy strictly prevents shift assignment until a renewal certificate is verified.
                            </div>
                          </div>
                        )}

                        {isUnverified && (
                          <div className="mt-3 p-2 bg-amber-100/70 text-amber-800 rounded text-[11px] border border-amber-200 flex items-start gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                              <strong>Pending Verification:</strong> Document submitted by staff member is awaiting physical or digital credential inspection by clinic supervisor.
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Missing BLS notice for Kavya */}
              {activeStaff.role === 'Nurse' && !activeStaff.credentials.some((c) => c.type === 'BLS') && (
                <div className="p-4 rounded-xl border border-red-200 bg-red-50/50 text-xs">
                  <div className="flex items-start gap-2">
                    <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-red-900">Mandatory Credential Missing: Basic Life Support (BLS)</h4>
                      <p className="text-red-700 mt-0.5">
                        CarePoint clinical safety policy requires all operating nurses to maintain an active AHA BLS certification. Any shift assignment will be blocked until BLS is uploaded.
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowAddBlsModal(true)}
                        className="mt-2.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg text-xs transition-colors cursor-pointer"
                      >
                        Simulate Uploading BLS Certificate
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Edit Credential Sub-Form */}
              {editingCred && (
                <div className="mt-4 p-4 rounded-xl bg-slate-100 border border-slate-300 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">
                      Simulate Credential Update: {editingCred.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => setEditingCred(null)}
                      className="text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        Expiry Date (YYYY-MM-DD):
                      </label>
                      <input
                        type="date"
                        value={editExpiryDate}
                        onChange={(e) => setEditExpiryDate(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 rounded font-mono text-xs"
                      />
                      <span className="text-[10px] text-slate-500">
                        Demo reference date: 2026-10-18
                      </span>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        Verification Status:
                      </label>
                      <select
                        value={editVerificationStatus}
                        onChange={(e) => setEditVerificationStatus(e.target.value as any)}
                        className="w-full p-2 bg-white border border-slate-300 rounded text-xs font-medium"
                      >
                        <option value="verified">Verified (Approved by CMO)</option>
                        <option value="unverified">Unverified (Pending Review)</option>
                        <option value="pending_verification">Pending Verification</option>
                      </select>
                      <span className="text-[10px] text-slate-500">
                        Unverified records block assignment
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditingCred(null)}
                      className="px-3 py-1.5 text-xs text-slate-600 bg-white border border-slate-200 rounded hover:bg-slate-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveEdit}
                      className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      Save &amp; Revalidate
                    </button>
                  </div>
                </div>
              )}

              {/* Add Missing BLS Modal */}
              {showAddBlsModal && (
                <div className="mt-4 p-4 rounded-xl bg-blue-50 border border-blue-300 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-900 text-xs">
                      Add AHA BLS Certificate for {activeStaff.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAddBlsModal(false)}
                      className="text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        Expiry Date:
                      </label>
                      <input
                        type="date"
                        value={newBlsExpiry}
                        onChange={(e) => setNewBlsExpiry(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 rounded font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        Verification Status:
                      </label>
                      <select
                        value={newBlsStatus}
                        onChange={(e) => setNewBlsStatus(e.target.value as any)}
                        className="w-full p-2 bg-white border border-slate-300 rounded text-xs font-medium"
                      >
                        <option value="verified">Verified (Compliant)</option>
                        <option value="unverified">Unverified (Pending)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddBlsModal(false)}
                      className="px-3 py-1.5 text-xs text-slate-600 bg-white border border-slate-200 rounded cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleAddMissingBls}
                      className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      Add Certificate Record
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="p-3.5 sm:p-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-2.5">
              <span className="text-[11px] text-slate-500 text-center sm:text-left">
                CarePoint Clinics Roster &bull; Staff ID: {activeStaff.id}
              </span>
              <button
                type="button"
                onClick={() => {
                  onAssignShiftForStaff(activeStaff.id);
                  setSelectedStaff(null);
                }}
                className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                Assign Shift with Validation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
