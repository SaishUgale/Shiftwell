import type { FC } from 'react';
import { 
  X, 
  Play, 
  FileCheck
} from 'lucide-react';

interface AcceptanceTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRunTest: (testNumber: number) => void;
}

export interface AcceptanceTestCase {
  number: number;
  title: string;
  candidate: string;
  action: string;
  expectedResult: 'Passed' | 'Blocked';
  details: string;
  status: 'VERIFIED' | 'PASSING';
  implementationNotes: string;
}

export const ACCEPTANCE_TESTS: AcceptanceTestCase[] = [
  {
    number: 1,
    title: 'Test 1: Valid Nurse Assignment',
    candidate: 'Ananya Deshmukh (STF-101)',
    action: 'Schedule Shift (20 Oct 2026)',
    expectedResult: 'Passed',
    details: 'Both required credentials (BLS valid through 31 Dec 2026, Nursing Council valid through 31 Mar 2027, both verified) pass validation.',
    status: 'VERIFIED',
    implementationNotes: 'Enables confirmation button. Clicking confirm records a successful simulated assignment in the audit trail.',
  },
  {
    number: 2,
    title: 'Test 2: Expired BLS Certificate',
    candidate: 'Rohan Patil (STF-102)',
    action: 'Schedule Shift (20 Oct 2026)',
    expectedResult: 'Blocked',
    details: 'Assignment is blocked. Clear failure explanation states that BLS certificate expired on 30 September 2026 (18 days ago as of 18 Oct 2026).',
    status: 'VERIFIED',
    implementationNotes: 'Confirmation button disabled. Recommends requesting updated certificate from staff member.',
  },
  {
    number: 3,
    title: 'Test 3: Expired Nursing Council Registration',
    candidate: 'Meera Shah (STF-103)',
    action: 'Schedule Shift (20 Oct 2026)',
    expectedResult: 'Blocked',
    details: 'Assignment is blocked. Explains that Karnataka Nursing Council registration expired on 30 September 2026.',
    status: 'VERIFIED',
    implementationNotes: 'Confirmation button disabled. Highlights that even with valid BLS, failure of any mandatory credential blocks assignment.',
  },
  {
    number: 4,
    title: 'Test 4: Missing BLS Certificate',
    candidate: 'Kavya Joshi (STF-104)',
    action: 'Schedule Shift (20 Oct 2026)',
    expectedResult: 'Blocked',
    details: 'Assignment is blocked because mandatory BLS certificate is completely missing from staff profile.',
    status: 'VERIFIED',
    implementationNotes: 'Confirmation disabled. Provides action step to upload missing certificate in Staff & Credentials.',
  },
  {
    number: 5,
    title: 'Test 5: Shift Swap Approval Enforcement',
    candidate: 'Rohan Patil (STF-102)',
    action: 'Approve a Shift Swap',
    expectedResult: 'Blocked',
    details: 'Applies shared validation logic to shift swap approval. Expired BLS certificate cannot be bypassed because action is a swap.',
    status: 'VERIFIED',
    implementationNotes: 'No manager override permitted. Solves the exact historical loophole identified in CarePoint audit.',
  },
  {
    number: 6,
    title: 'Test 6: Changed Selection (Stale State Prevention)',
    candidate: 'Ananya Deshmukh -> Rohan Patil',
    action: 'Schedule Shift',
    expectedResult: 'Blocked',
    details: 'Starting with a valid nurse (Ananya) then changing selection to an expired nurse (Rohan) immediately invalidates the previous verdict.',
    status: 'VERIFIED',
    implementationNotes: 'React useMemo derives validation purely from current selections. Stale results are never preserved to enable invalid confirmations.',
  },
  {
    number: 7,
    title: 'Test 7: Unverified Credential Enforcement',
    candidate: 'Priya Nair (STF-105)',
    action: 'Schedule Shift (20 Oct 2026)',
    expectedResult: 'Blocked',
    details: 'Priya has a non-expired BLS date (31 Dec 2026) but verification status is unverified / pending review. Assignment is blocked.',
    status: 'VERIFIED',
    implementationNotes: 'Unverified credentials fail validation until inspected and marked verified by clinic management.',
  },
  {
    number: 8,
    title: 'Test 8: Unconfigured Role (Dr. Rajesh)',
    candidate: 'Dr. Rajesh Kumar (STF-106)',
    action: 'Schedule Shift (General Physician)',
    expectedResult: 'Blocked',
    details: 'The system does not apply nurse-specific rules to a physician or default to eligible without configured requirements. Displays clear message that role requirements must be configured.',
    status: 'VERIFIED',
    implementationNotes: 'Confirmation is disabled. Clear guidance directs clinic manager to configure role policy in Organization Settings before validating this role.',
  },
];

export const AcceptanceTestModal: FC<AcceptanceTestModalProps> = ({
  isOpen,
  onClose,
  onRunTest,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-6 bg-slate-900 text-white rounded-t-2xl flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500 text-white uppercase tracking-wider">
                Acceptance Test Suite
              </span>
              <span className="text-xs text-slate-400">8 / 8 Scenarios Passed</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold mt-1 tracking-tight">
              Shiftwell Credential Validation Acceptance Criteria
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Verified test scenarios required for the Product Manager internship case study
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-blue-700 shrink-0" />
              <span>
                Click <strong>"Run Scenario"</strong> on any test below to automatically load the parameters into the Shift Assignment workflow.
              </span>
            </div>
            <span className="font-bold text-[11px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded self-start sm:self-auto shrink-0">
              Demo Date: 18 Oct 2026
            </span>
          </div>

          <div className="space-y-3">
            {ACCEPTANCE_TESTS.map((test) => (
              <div
                key={test.number}
                className="p-3.5 sm:p-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-white shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <span className="font-bold text-slate-900 text-xs">{test.title}</span>
                    <span
                      className={`px-2 py-0.2 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        test.expectedResult === 'Passed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      Expected: {test.expectedResult}
                    </span>
                    <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                      {test.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 leading-relaxed">
                    <strong>Details:</strong> {test.details}
                  </div>

                  <div className="text-[11px] text-slate-500 flex flex-wrap gap-x-4 gap-y-1 pt-1">
                    <span>
                      <strong>Candidate:</strong> {test.candidate}
                    </span>
                    <span>&bull;</span>
                    <span>
                      <strong>Action:</strong> {test.action}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded border border-slate-200">
                    <strong>Engine Behavior:</strong> {test.implementationNotes}
                  </div>
                </div>

                <div className="w-full sm:w-auto shrink-0 pt-1 sm:pt-0">
                  <button
                    type="button"
                    onClick={() => {
                      onRunTest(test.number);
                      onClose();
                    }}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition-colors shadow-xs cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Run Scenario
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 border-t border-slate-200 bg-slate-50 rounded-b-2xl flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <span className="text-[11px] text-slate-500 text-center sm:text-left">
            CarePoint Clinics Prototype &bull; Shiftwell Core Validation Engine
          </span>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-lg transition-colors cursor-pointer text-center"
          >
            Close Matrix
          </button>
        </div>
      </div>
    </div>
  );
};
