import type { FC } from 'react';
import { useState, useEffect, useMemo } from 'react';
import { 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Calendar, 
  MapPin, 
  UserCheck, 
  Lock, 
  ArrowLeftRight, 
  Sparkles,
  Info
} from 'lucide-react';
import type { 
  StaffMember, 
  ShiftDetails, 
  ActionType, 
  StaffRole, 
  ValidationResult, 
  ActivityLogEntry 
} from '../types';
import { 
  validateShiftAssignment, 
  DEMO_DATE, 
  getStaffOverallEligibility 
} from '../utils/validationEngine';
import { CLINIC_LOCATIONS } from '../data/mockData';

interface ShiftAssignmentProps {
  staffList: StaffMember[];
  selectedStaffId: string;
  setSelectedStaffId: (id: string) => void;
  selectedClinic: string;
  onAddActivityLog: (entry: Omit<ActivityLogEntry, 'id' | 'timestamp' | 'formattedTime' | 'isSimulated'>) => void;
  onOpenTestMatrix: () => void;
}

export const ShiftAssignment: FC<ShiftAssignmentProps> = ({
  staffList,
  selectedStaffId,
  setSelectedStaffId,
  selectedClinic,
  onAddActivityLog,
  onOpenTestMatrix,
}) => {
  // Step 1: Action Type
  const [actionType, setActionType] = useState<ActionType>('schedule');

  // Step 2: Swap Details (if actionType === 'swap')
  const originalStaffName = 'Staff Nurse Sunita Rao (Emergency Leave)';

  // Step 3: Target Shift Details
  const [shiftDate, setShiftDate] = useState('2026-10-20');
  const [shiftTime, setShiftTime] = useState('08:00 - 16:00 (Morning Duty)');
  const [shiftLocation, setShiftLocation] = useState(selectedClinic);
  const [requiredRole, setRequiredRole] = useState<StaffRole>('Nurse');

  // Feedback banner state after confirming
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [infoNotice, setInfoNotice] = useState<string | null>(null);

  // Synchronize location if global clinic changes
  useEffect(() => {
    setShiftLocation(selectedClinic);
  }, [selectedClinic]);

  // Selected staff object
  const currentStaff = useMemo(() => {
    return staffList.find((s) => s.id === selectedStaffId) || staffList[0];
  }, [staffList, selectedStaffId]);

  // Current Target Shift object
  const currentShift: ShiftDetails = useMemo(() => {
    const timeParts = shiftTime.split(' ')[0].split('-');
    return {
      id: `SHF-${shiftDate}-${actionType}`,
      date: shiftDate,
      startTime: timeParts[0] || '08:00',
      endTime: timeParts[1] || '16:00',
      shiftLabel: shiftTime,
      clinicLocation: shiftLocation,
      requiredRole,
      department: 'Clinical Operations',
    };
  }, [shiftDate, shiftTime, shiftLocation, requiredRole, actionType]);

  // Step 4: Live Validation Result
  // Note: Runs dynamically whenever staff, shift, action, or role changes!
  // Prevents stale state from ever enabling confirmation for an invalid selection.
  const validationResult: ValidationResult = useMemo(() => {
    if (!currentStaff) {
      return {
        isValid: false,
        canConfirm: false,
        roleConfigured: true,
        overallStatus: 'blocked',
        evaluatedAt: DEMO_DATE + 'T10:00:00Z',
        staffId: '',
        staffName: '',
        actionType,
        targetShift: currentShift,
        checks: [],
        failures: ['No staff member selected.'],
      };
    }
    return validateShiftAssignment(currentStaff, currentShift, actionType, DEMO_DATE);
  }, [currentStaff, currentShift, actionType]);

  // Clear success notification when selections change
  useEffect(() => {
    setSuccessNotice(null);
  }, [selectedStaffId, actionType, shiftDate, shiftTime, shiftLocation, requiredRole]);

  // Handle Confirmation of Assignment or Swap
  const handleConfirmAssignment = () => {
    if (!validationResult.canConfirm || !currentStaff) return;

    onAddActivityLog({
      staffId: currentStaff.id,
      staffName: currentStaff.name,
      staffRole: currentStaff.role,
      actionType,
      targetShiftDate: currentShift.date,
      targetShiftTime: currentShift.shiftLabel,
      clinicLocation: currentShift.clinicLocation,
      outcome: 'Approved',
      managerName: 'Sunita Menon (CarePoint Clinic Ops Manager)',
    });

    const actionText = actionType === 'swap' ? 'Shift swap approved' : 'Shift assignment confirmed';
    setSuccessNotice(
      `${actionText} successfully for ${currentStaff.name} on ${currentShift.date} (${currentShift.shiftLabel}) at ${currentShift.clinicLocation}. Recorded in audit activity trail.`
    );
  };

  // Handle logging a blocked attempt in audit trail
  const handleRecordBlockedAttempt = () => {
    if (!currentStaff || validationResult.isValid) return;

    const failedCheck = validationResult.checks.find((c) => c.status !== 'passed');
    onAddActivityLog({
      staffId: currentStaff.id,
      staffName: currentStaff.name,
      staffRole: currentStaff.role,
      actionType,
      targetShiftDate: currentShift.date,
      targetShiftTime: currentShift.shiftLabel,
      clinicLocation: currentShift.clinicLocation,
      outcome: 'Blocked',
      failedCredential: failedCheck?.credentialName || 'Credential Verification',
      failureReason: validationResult.failures[0] || 'Mandatory credential requirement not met.',
      managerName: 'Sunita Menon (CarePoint Clinic Ops Manager)',
    });

    setInfoNotice(
      `Blocked validation event recorded to simulated audit trail for ${currentStaff.name}. You can view it under the 'Validation Activity' tab.`
    );
  };

  // Quick 1-Click Acceptance Test Presets
  const runAcceptanceTestPreset = (testNumber: number) => {
    setSuccessNotice(null);
    setInfoNotice(null);
    switch (testNumber) {
      case 1: // Test 1: Valid nurse Ananya Deshmukh
        setSelectedStaffId('STF-101');
        setActionType('schedule');
        setRequiredRole('Nurse');
        setShiftDate('2026-10-20');
        break;
      case 2: // Test 2: Expired BLS Rohan Patil
        setSelectedStaffId('STF-102');
        setActionType('schedule');
        setRequiredRole('Nurse');
        setShiftDate('2026-10-20');
        break;
      case 3: // Test 3: Expired Registration Meera Shah
        setSelectedStaffId('STF-103');
        setActionType('schedule');
        setRequiredRole('Nurse');
        setShiftDate('2026-10-20');
        break;
      case 4: // Test 4: Missing BLS Kavya Joshi
        setSelectedStaffId('STF-104');
        setActionType('schedule');
        setRequiredRole('Nurse');
        setShiftDate('2026-10-20');
        break;
      case 5: // Test 5: Swap Approval with expired candidate Rohan Patil
        setSelectedStaffId('STF-102');
        setActionType('swap');
        setRequiredRole('Nurse');
        setShiftDate('2026-10-20');
        break;
      case 6: // Test 6: Changed selection (Ananya -> Rohan)
        // Select Ananya first, then guide user to switch to Rohan
        setSelectedStaffId('STF-101');
        setActionType('schedule');
        setRequiredRole('Nurse');
        setInfoNotice(
          'Test 6 Step 1: Selected valid nurse Ananya Deshmukh (Eligible). Now select Rohan Patil from the dropdown or quick select below to verify that the valid verdict immediately clears and blocks confirmation without retaining stale state.'
        );
        break;
      case 7: // Test 7: Unverified credential Priya Nair
        setSelectedStaffId('STF-105');
        setActionType('schedule');
        setRequiredRole('Nurse');
        setShiftDate('2026-10-20');
        break;
      case 8: // Test 8: Unconfigured role Dr. Rajesh Kumar
        setSelectedStaffId('STF-106');
        setActionType('schedule');
        setRequiredRole('General Physician');
        setShiftDate('2026-10-20');
        break;
    }
  };

  return (
    <div className="space-y-6">
      {/* Interactive Acceptance Test Bar */}
      <div className="bg-slate-900 text-white rounded-xl p-4 shadow-sm border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Case Study Acceptance Test Presets
              </span>
              <p className="text-[11px] text-slate-400">
                1-click verification of the 8 required case-study scenarios defined in product specifications
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenTestMatrix}
            className="text-xs font-medium text-blue-300 hover:text-white underline cursor-pointer self-start md:self-auto"
          >
            Open Full Test Matrix
          </button>
        </div>

        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-1.5 text-xs">
          <button
            type="button"
            onClick={() => runAcceptanceTestPreset(1)}
            className={`p-1.5 rounded text-left transition-all cursor-pointer border ${
              selectedStaffId === 'STF-101' && actionType === 'schedule'
                ? 'bg-blue-600 text-white border-blue-400 font-bold shadow-xs'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
            }`}
          >
            <div className="text-[10px] text-emerald-400 font-mono font-bold">T1: Valid</div>
            <div className="truncate font-medium">Ananya (Pass)</div>
          </button>

          <button
            type="button"
            onClick={() => runAcceptanceTestPreset(2)}
            className={`p-1.5 rounded text-left transition-all cursor-pointer border ${
              selectedStaffId === 'STF-102' && actionType === 'schedule'
                ? 'bg-blue-600 text-white border-blue-400 font-bold shadow-xs'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
            }`}
          >
            <div className="text-[10px] text-red-400 font-mono font-bold">T2: Exp BLS</div>
            <div className="truncate font-medium">Rohan (Block)</div>
          </button>

          <button
            type="button"
            onClick={() => runAcceptanceTestPreset(3)}
            className={`p-1.5 rounded text-left transition-all cursor-pointer border ${
              selectedStaffId === 'STF-103' && actionType === 'schedule'
                ? 'bg-blue-600 text-white border-blue-400 font-bold shadow-xs'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
            }`}
          >
            <div className="text-[10px] text-red-400 font-mono font-bold">T3: Exp Reg</div>
            <div className="truncate font-medium">Meera (Block)</div>
          </button>

          <button
            type="button"
            onClick={() => runAcceptanceTestPreset(4)}
            className={`p-1.5 rounded text-left transition-all cursor-pointer border ${
              selectedStaffId === 'STF-104' && actionType === 'schedule'
                ? 'bg-blue-600 text-white border-blue-400 font-bold shadow-xs'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
            }`}
          >
            <div className="text-[10px] text-red-400 font-mono font-bold">T4: Missing</div>
            <div className="truncate font-medium">Kavya (Block)</div>
          </button>

          <button
            type="button"
            onClick={() => runAcceptanceTestPreset(5)}
            className={`p-1.5 rounded text-left transition-all cursor-pointer border ${
              actionType === 'swap'
                ? 'bg-blue-600 text-white border-blue-400 font-bold shadow-xs'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
            }`}
          >
            <div className="text-[10px] text-amber-400 font-mono font-bold">T5: Swap</div>
            <div className="truncate font-medium">Swap Approval</div>
          </button>

          <button
            type="button"
            onClick={() => runAcceptanceTestPreset(6)}
            className="p-1.5 rounded text-left transition-all cursor-pointer border bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750"
          >
            <div className="text-[10px] text-cyan-400 font-mono font-bold">T6: Stale Check</div>
            <div className="truncate font-medium">Change Nurse</div>
          </button>

          <button
            type="button"
            onClick={() => runAcceptanceTestPreset(7)}
            className={`p-1.5 rounded text-left transition-all cursor-pointer border ${
              selectedStaffId === 'STF-105'
                ? 'bg-blue-600 text-white border-blue-400 font-bold shadow-xs'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
            }`}
          >
            <div className="text-[10px] text-amber-400 font-mono font-bold">T7: Unverified</div>
            <div className="truncate font-medium">Priya (Block)</div>
          </button>

          <button
            type="button"
            onClick={() => runAcceptanceTestPreset(8)}
            className={`p-1.5 rounded text-left transition-all cursor-pointer border ${
              selectedStaffId === 'STF-106'
                ? 'bg-blue-600 text-white border-blue-400 font-bold shadow-xs'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
            }`}
          >
            <div className="text-[10px] text-purple-400 font-mono font-bold">T8: Other Role</div>
            <div className="truncate font-medium">Dr. Rajesh</div>
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs flex items-start justify-between gap-3 shadow-xs animate-in fade-in">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-emerald-950">Assignment Confirmed &amp; Logged</h4>
              <p className="mt-0.5 leading-relaxed">{successNotice}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSuccessNotice(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold cursor-pointer"
          >
            &times;
          </button>
        </div>
      )}

      {/* System Info Notification Alert */}
      {infoNotice && (
        <div className="p-4 bg-blue-50 border border-blue-300 rounded-xl text-blue-900 text-xs flex items-start justify-between gap-3 shadow-xs animate-in fade-in">
          <div className="flex items-start gap-2.5">
            <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-blue-950">System Notification</h4>
              <p className="mt-0.5 leading-relaxed">{infoNotice}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setInfoNotice(null)}
            className="text-blue-700 hover:text-blue-900 font-bold cursor-pointer"
          >
            &times;
          </button>
        </div>
      )}

      {/* Two Column Layout: Workflow Configuration vs Live Validation Engine Outcome */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 4-Step Assignment Form (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
                1
              </span>
              Step 1: Select Operational Action
            </h2>
            <p className="text-xs text-slate-500 mt-1 ml-8">
              Choose whether you are scheduling an open shift or approving a staff shift swap request.
            </p>

            <div className="mt-3 ml-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`p-3 rounded-lg border flex items-start gap-3 cursor-pointer transition-all ${
                  actionType === 'schedule'
                    ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600 text-slate-900'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="actionType"
                  value="schedule"
                  checked={actionType === 'schedule'}
                  onChange={() => setActionType('schedule')}
                  className="mt-0.5 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div className="font-bold text-xs">Schedule a Shift</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Assign a clinical staff member to an upcoming roster slot
                  </div>
                </div>
              </label>

              <label
                className={`p-3 rounded-lg border flex items-start gap-3 cursor-pointer transition-all ${
                  actionType === 'swap'
                    ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600 text-slate-900'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="actionType"
                  value="swap"
                  checked={actionType === 'swap'}
                  onChange={() => setActionType('swap')}
                  className="mt-0.5 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div className="font-bold text-xs flex items-center gap-1.5">
                    <ArrowLeftRight className="w-3.5 h-3.5 text-blue-600" />
                    Approve a Shift Swap
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Authorize a replacement staff member to cover an existing shift
                  </div>
                </div>
              </label>
            </div>

            {/* Realistic Swap Details Notice */}
            {actionType === 'swap' && (
              <div className="mt-3 ml-8 p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-xs text-amber-900">
                <div className="font-semibold flex items-center gap-1 text-amber-950">
                  <Info className="w-3.5 h-3.5 text-amber-700" />
                  Swap Request Context:
                </div>
                <div className="mt-1 text-[11px] text-amber-800">
                  Original Assigned Staff: <strong>{originalStaffName}</strong>
                </div>
                <div className="text-[11px] text-amber-700 mt-0.5">
                  <strong>Strict Rule:</strong> Mandatory professional credential requirements apply equally to swap approvals. A swap cannot bypass expired or missing credentials.
                </div>
              </div>
            )}
          </div>

          {/* Step 2: Select Staff Member */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
                2
              </span>
              Step 2: Select Candidate Staff Member
            </h2>
            <p className="text-xs text-slate-500 mt-1 ml-8">
              Select the employee being scheduled or proposed as the swap replacement.
            </p>

            <div className="mt-3 ml-8 space-y-3">
              <div>
                <label htmlFor="staff-candidate-select" className="block text-xs font-semibold text-slate-700 mb-1">
                  Staff Member:
                </label>
                <select
                  id="staff-candidate-select"
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  {staffList.map((staff) => {
                    const { summaryLabel } = getStaffOverallEligibility(staff);
                    return (
                      <option key={staff.id} value={staff.id}>
                        {staff.name} ({staff.role}) &mdash; {summaryLabel}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Quick staff selector badges */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[11px] text-slate-400 self-center mr-1">Quick Select:</span>
                {staffList.map((staff) => {
                  const isSelected = staff.id === selectedStaffId;
                  const { overallStatus } = getStaffOverallEligibility(staff);
                  return (
                    <button
                      key={staff.id}
                      type="button"
                      onClick={() => setSelectedStaffId(staff.id)}
                      className={`px-2 py-1 rounded text-xs transition-colors cursor-pointer border ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                      }`}
                    >
                      {staff.name.split(' ')[0]}
                      <span className={`ml-1 text-[9px] px-1 py-0.2 rounded font-mono ${
                        overallStatus === 'valid'
                          ? 'bg-emerald-200 text-emerald-900'
                          : overallStatus === 'unverified'
                          ? 'bg-amber-200 text-amber-900'
                          : overallStatus === 'unconfigured'
                          ? 'bg-slate-200 text-slate-800'
                          : 'bg-red-200 text-red-900'
                      }`}>
                        {overallStatus}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Selected Staff Mini-Card */}
              {currentStaff && (
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-full ${currentStaff.avatarBg} text-white font-bold text-xs flex items-center justify-center shrink-0`}>
                      {currentStaff.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{currentStaff.name}</div>
                      <div className="text-[11px] text-slate-500">
                        {currentStaff.role} &bull; {currentStaff.primaryClinic}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Roster ID</div>
                    <div className="font-mono text-slate-700 font-medium">{currentStaff.id}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Step 3: Select Target Shift */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
                3
              </span>
              Step 3: Select Target Shift Parameters
            </h2>
            <p className="text-xs text-slate-500 mt-1 ml-8">
              Define the shift date, operating hours, clinic facility, and required role.
            </p>

            <div className="mt-3 ml-8 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label htmlFor="shift-date-input" className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> Shift Date:
                </label>
                <input
                  id="shift-date-input"
                  type="date"
                  value={shiftDate}
                  onChange={(e) => setShiftDate(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-[10px] text-slate-400">Default test date: 2026-10-20</span>
              </div>

              <div>
                <label htmlFor="shift-timing-select" className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> Shift Timings:
                </label>
                <select
                  id="shift-timing-select"
                  value={shiftTime}
                  onChange={(e) => setShiftTime(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="08:00 - 16:00 (Morning Duty)">08:00 - 16:00 (Morning Duty)</option>
                  <option value="16:00 - 00:00 (Evening Duty)">16:00 - 00:00 (Evening Duty)</option>
                  <option value="00:00 - 08:00 (Night Duty)">00:00 - 08:00 (Night Duty)</option>
                </select>
              </div>

              <div>
                <label htmlFor="shift-location-select" className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> Clinic Facility:
                </label>
                <select
                  id="shift-location-select"
                  value={shiftLocation}
                  onChange={(e) => setShiftLocation(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {CLINIC_LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="required-role-select" className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-slate-400" /> Required Role:
                </label>
                <select
                  id="required-role-select"
                  value={requiredRole}
                  onChange={(e) => setRequiredRole(e.target.value as StaffRole)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Nurse">Nurse (Configured: BLS + State Council)</option>
                  <option value="General Physician">General Physician (Role Unconfigured)</option>
                  <option value="Pharmacist">Pharmacist (Role Unconfigured)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Step 4 Validation Engine Outcome & Action Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between min-h-[460px]">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
                    4
                  </span>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">Step 4: Validation Engine</h2>
                    <div className="text-[11px] text-slate-400">Continuous credential verification</div>
                  </div>
                </div>

                <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                  Ref: {DEMO_DATE}
                </span>
              </div>

              {/* Status Outcome Banner */}
              <div className="mt-4">
                {validationResult.overallStatus === 'eligible' ? (
                  /* Green Eligible Result */
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                          Validation Passed
                        </span>
                        <h3 className="text-base font-extrabold text-emerald-950 leading-tight">
                          Eligible for Assignment
                        </h3>
                      </div>
                    </div>
                    <p className="text-xs text-emerald-800 leading-relaxed pt-1">
                      All mandatory professional credentials for role <strong>Nurse</strong> are verified and active on the target shift date ({currentShift.date}).
                    </p>
                  </div>
                ) : validationResult.overallStatus === 'blocked' ? (
                  /* Red Blocked Result */
                  <div className="p-4 rounded-xl bg-red-50 border border-red-300 text-red-900 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0">
                        <ShieldAlert className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-red-700">
                          Validation Blocked
                        </span>
                        <h3 className="text-base font-extrabold text-red-950 leading-tight">
                          Assignment Blocked
                        </h3>
                      </div>
                    </div>
                    <p className="text-xs text-red-800 leading-relaxed pt-1">
                      Candidate cannot be assigned to this shift because mandatory credential requirements have not been met.
                    </p>
                  </div>
                ) : (
                  /* Role Unconfigured */
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
                          Configuration Required
                        </span>
                        <h3 className="text-base font-extrabold text-amber-950 leading-tight">
                          Role Requirements Not Configured
                        </h3>
                      </div>
                    </div>
                    <p className="text-xs text-amber-800 leading-relaxed pt-1">
                      {validationResult.unconfiguredMessage}
                    </p>
                  </div>
                )}
              </div>

              {/* Credential Checks Breakdown */}
              <div className="mt-4 space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Mandatory Credential Checks ({validationResult.checks.length})
                </h4>

                {validationResult.checks.length === 0 ? (
                  <div className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded-lg border border-slate-200">
                    No credential rules configured for role '{currentStaff?.role !== 'Nurse' ? currentStaff?.role : requiredRole}'. Validation cannot proceed.
                  </div>
                ) : (
                  validationResult.checks.map((check) => {
                    const isPassed = check.status === 'passed';
                    const isExpired = check.status === 'expired';
                    const isMissing = check.status === 'missing';
                    const isUnverified = check.status === 'unverified';

                    return (
                      <div
                        key={check.credentialType}
                        className={`p-3 rounded-lg border text-xs transition-all ${
                          isPassed
                            ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
                            : isExpired
                            ? 'bg-red-50/80 border-red-200 text-red-950'
                            : isMissing
                            ? 'bg-red-50/80 border-red-200 text-red-950'
                            : 'bg-amber-50/80 border-amber-200 text-amber-950'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold flex items-center gap-1.5">
                            {isPassed ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            ) : isUnverified ? (
                              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                            ) : (
                              <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                            )}
                            {check.credentialName}
                          </span>

                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              isPassed
                                ? 'bg-emerald-200 text-emerald-800'
                                : isUnverified
                                ? 'bg-amber-200 text-amber-900'
                                : 'bg-red-200 text-red-900'
                            }`}
                          >
                            {check.status === 'missing_expiry' ? 'No Expiry' : check.status}
                          </span>
                        </div>

                        <div className="mt-1.5 text-[11px] leading-relaxed text-slate-700">
                          {check.message}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Actionable Next Steps for Manager (When Blocked) */}
              {!validationResult.isValid && validationResult.recommendedAction && (
                <div className="mt-4 p-3 bg-slate-100 rounded-lg border border-slate-200 text-xs">
                  <div className="font-bold text-slate-800 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-blue-600" />
                    Manager Next Steps:
                  </div>
                  <div className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                    {validationResult.recommendedAction}
                  </div>
                </div>
              )}

              {/* Explicit Policy Callout */}
              <div className="mt-3 text-[11px] text-slate-400 flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-slate-400" />
                <span>Manager overrides are strictly disabled per CarePoint clinical governance policy.</span>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-6 pt-4 border-t border-slate-200 space-y-2">
              <button
                type="button"
                disabled={!validationResult.canConfirm}
                onClick={handleConfirmAssignment}
                className={`w-full py-3 px-4 rounded-xl text-xs font-bold tracking-wide transition-all flex items-center justify-center gap-2 ${
                  validationResult.canConfirm
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 cursor-pointer active:scale-[0.99]'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                }`}
              >
                {validationResult.canConfirm ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    {actionType === 'swap' ? 'Confirm & Approve Shift Swap' : 'Confirm Shift Assignment'}
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-slate-400" />
                    {actionType === 'swap'
                      ? 'Swap Blocked &mdash; Mandatory Credentials Incomplete'
                      : 'Assignment Blocked &mdash; Fix Failed Credentials'}
                  </>
                )}
              </button>

              {/* If blocked, allow recording the blocked attempt into simulated audit trail */}
              {!validationResult.isValid && (
                <button
                  type="button"
                  onClick={handleRecordBlockedAttempt}
                  className="w-full py-2 px-3 text-[11px] font-semibold text-red-700 hover:text-red-800 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors cursor-pointer"
                >
                  Record Blocked Attempt in Audit Log (Acceptance Test 8)
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
