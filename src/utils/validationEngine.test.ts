import { describe, it, expect } from 'vitest';
import { 
  validateShiftAssignment, 
  getStaffOverallEligibility, 
  getDaysDifference, 
  parseDateString, 
  DEMO_DATE 
} from './validationEngine';
import { INITIAL_STAFF } from '../data/mockData';
import type { StaffMember, ShiftDetails } from '../types';

describe('Shiftwell Credential Validation Engine', () => {
  const defaultNurseShift: ShiftDetails = {
    id: 'SHF-TEST-01',
    date: '2026-10-20',
    startTime: '08:00',
    endTime: '16:00',
    shiftLabel: 'Morning Duty (08:00 - 16:00)',
    clinicLocation: 'CarePoint - Indiranagar (Bengaluru)',
    requiredRole: 'Nurse',
    department: 'Outpatient Triage',
  };

  // Helper to find staff by ID
  const getStaff = (id: string): StaffMember => {
    const staff = INITIAL_STAFF.find((s) => s.id === id);
    if (!staff) throw new Error(`Staff with id ${id} not found in mock data`);
    return JSON.parse(JSON.stringify(staff)); // Deep clone
  };

  describe('Core Acceptance Tests (T1 - T8)', () => {
    // T1: Valid nurse Ananya Deshmukh
    it('T1 — Valid nurse Ananya Deshmukh should pass all checks and be eligible for confirmation', () => {
      const ananya = getStaff('STF-101');
      const result = validateShiftAssignment(ananya, defaultNurseShift, 'schedule', DEMO_DATE);

      expect(result.isValid).toBe(true);
      expect(result.canConfirm).toBe(true);
      expect(result.overallStatus).toBe('eligible');
      expect(result.failures).toHaveLength(0);
      expect(result.checks).toHaveLength(2);
      expect(result.checks.every((c) => c.status === 'passed')).toBe(true);

      const blsCheck = result.checks.find((c) => c.credentialType === 'BLS');
      expect(blsCheck?.expiryDate).toBe('2026-12-31');
      expect(blsCheck?.verificationStatus).toBe('verified');
      expect(blsCheck?.status).toBe('passed');

      const regCheck = result.checks.find((c) => c.credentialType === 'NURSING_COUNCIL');
      expect(regCheck?.expiryDate).toBe('2027-03-31');
      expect(regCheck?.verificationStatus).toBe('verified');
      expect(regCheck?.status).toBe('passed');
    });

    // T2: Expired BLS Rohan Patil
    it('T2 — Expired BLS Rohan Patil must be blocked with confirmation disabled', () => {
      const rohan = getStaff('STF-102');
      const result = validateShiftAssignment(rohan, defaultNurseShift, 'schedule', DEMO_DATE);

      expect(result.isValid).toBe(false);
      expect(result.canConfirm).toBe(false);
      expect(result.overallStatus).toBe('blocked');
      expect(result.failures.length).toBeGreaterThan(0);
      expect(result.failures.some((f) => f.includes('expired on 2026-09-30'))).toBe(true);

      const blsCheck = result.checks.find((c) => c.credentialType === 'BLS');
      expect(blsCheck?.status).toBe('expired');
      expect(blsCheck?.expiryDate).toBe('2026-09-30');
      expect(blsCheck?.daysRemaining).toBeLessThan(0); // -18 days

      const regCheck = result.checks.find((c) => c.credentialType === 'NURSING_COUNCIL');
      expect(regCheck?.status).toBe('passed');
    });

    // T3: Expired Registration Meera Shah
    it('T3 — Expired Registration Meera Shah must be blocked even if BLS is valid', () => {
      const meera = getStaff('STF-103');
      const result = validateShiftAssignment(meera, defaultNurseShift, 'schedule', DEMO_DATE);

      expect(result.isValid).toBe(false);
      expect(result.canConfirm).toBe(false);
      expect(result.overallStatus).toBe('blocked');

      const blsCheck = result.checks.find((c) => c.credentialType === 'BLS');
      expect(blsCheck?.status).toBe('passed'); // BLS is valid

      const regCheck = result.checks.find((c) => c.credentialType === 'NURSING_COUNCIL');
      expect(regCheck?.status).toBe('expired');
      expect(regCheck?.expiryDate).toBe('2026-09-30');
      expect(result.failures.some((f) => f.includes('State Nursing Council Registration expired'))).toBe(true);
    });

    // T4: Missing BLS Kavya Joshi
    it('T4 — Missing BLS Kavya Joshi must fail validation with missing status', () => {
      const kavya = getStaff('STF-104');
      const result = validateShiftAssignment(kavya, defaultNurseShift, 'schedule', DEMO_DATE);

      expect(result.isValid).toBe(false);
      expect(result.canConfirm).toBe(false);
      expect(result.overallStatus).toBe('blocked');

      const blsCheck = result.checks.find((c) => c.credentialType === 'BLS');
      expect(blsCheck?.status).toBe('missing');
      expect(result.failures.some((f) => f.includes('missing from Kavya Joshi\'s profile'))).toBe(true);
    });

    // T5: Swap approval enforcement
    it('T5 — Shift swap approval enforces the exact same mandatory credential rules without bypass', () => {
      const rohan = getStaff('STF-102'); // Expired BLS
      const swapResultRohan = validateShiftAssignment(rohan, defaultNurseShift, 'swap', DEMO_DATE);

      expect(swapResultRohan.isValid).toBe(false);
      expect(swapResultRohan.canConfirm).toBe(false);
      expect(swapResultRohan.overallStatus).toBe('blocked');
      expect(swapResultRohan.actionType).toBe('swap');
      expect(swapResultRohan.failures[0]).toContain('shift swap approval');

      const kavya = getStaff('STF-104'); // Missing BLS
      const swapResultKavya = validateShiftAssignment(kavya, defaultNurseShift, 'swap', DEMO_DATE);
      expect(swapResultKavya.isValid).toBe(false);
      expect(swapResultKavya.canConfirm).toBe(false);

      const ananya = getStaff('STF-101'); // Valid
      const swapResultAnanya = validateShiftAssignment(ananya, defaultNurseShift, 'swap', DEMO_DATE);
      expect(swapResultAnanya.isValid).toBe(true);
      expect(swapResultAnanya.canConfirm).toBe(true);
    });

    // T6: Stale validation / input change
    it('T6 — Switching candidate staff immediately yields new validation verdict without retaining stale eligible state', () => {
      const ananya = getStaff('STF-101');
      const rohan = getStaff('STF-102');

      const initialValidation = validateShiftAssignment(ananya, defaultNurseShift, 'schedule', DEMO_DATE);
      expect(initialValidation.isValid).toBe(true);
      expect(initialValidation.canConfirm).toBe(true);

      // Re-evaluate with Rohan
      const updatedValidation = validateShiftAssignment(rohan, defaultNurseShift, 'schedule', DEMO_DATE);
      expect(updatedValidation.isValid).toBe(false);
      expect(updatedValidation.canConfirm).toBe(false);
      expect(updatedValidation.overallStatus).toBe('blocked');
      expect(updatedValidation.staffName).toBe('Rohan Patil');
    });

    // T7: Unverified credential Priya Nair
    it('T7 — Unverified credential Priya Nair must be blocked until verified by supervisor', () => {
      const priya = getStaff('STF-105');
      const result = validateShiftAssignment(priya, defaultNurseShift, 'schedule', DEMO_DATE);

      expect(result.isValid).toBe(false);
      expect(result.canConfirm).toBe(false);
      expect(result.overallStatus).toBe('blocked');

      const blsCheck = result.checks.find((c) => c.credentialType === 'BLS');
      expect(blsCheck?.status).toBe('unverified');
      expect(blsCheck?.verificationStatus).toBe('unverified');
      expect(result.failures.some((f) => f.includes('unverified'))).toBe(true);
    });

    // T8: Unconfigured role Dr. Rajesh Kumar
    it('T8 — Non-nurse role Dr. Rajesh Kumar must be blocked with unconfigured role message', () => {
      const rajesh = getStaff('STF-106');
      const physicianShift: ShiftDetails = {
        ...defaultNurseShift,
        requiredRole: 'General Physician',
      };

      const result = validateShiftAssignment(rajesh, physicianShift, 'schedule', DEMO_DATE);

      expect(result.isValid).toBe(false);
      expect(result.canConfirm).toBe(false);
      expect(result.roleConfigured).toBe(false);
      expect(result.overallStatus).toBe('role_unconfigured');
      expect(result.unconfiguredMessage).toContain('Role requirements must be configured before role');
    });
  });

  describe('Date Handling & Boundary Conditions', () => {
    it('parses YYYY-MM-DD correctly without timezone shifts', () => {
      const ts = parseDateString('2026-10-18');
      const d = new Date(ts);
      expect(d.getUTCFullYear()).toBe(2026);
      expect(d.getUTCMonth()).toBe(9); // 0-indexed month (October)
      expect(d.getUTCDate()).toBe(18);
    });

    it('returns NaN for malformed date strings', () => {
      expect(isNaN(parseDateString('invalid'))).toBe(true);
      expect(isNaN(parseDateString('2026-10'))).toBe(true);
      expect(isNaN(getDaysDifference('not-a-date', '2026-10-18'))).toBe(true);
    });

    it('considers credentials expiring AFTER demo date as valid', () => {
      expect(getDaysDifference('2026-10-19', '2026-10-18')).toBe(1);
      expect(getDaysDifference('2026-12-31', '2026-10-18')).toBe(74);
    });

    it('considers credentials expiring BEFORE demo date as expired', () => {
      expect(getDaysDifference('2026-10-17', '2026-10-18')).toBe(-1);
      expect(getDaysDifference('2026-09-30', '2026-10-18')).toBe(-18);
    });

    it('treats credentials expiring ON the exact shift date as valid (0 days remaining)', () => {
      const days = getDaysDifference('2026-10-18', '2026-10-18');
      expect(days).toBe(0);

      const staff = getStaff('STF-101');
      // Set BLS expiry exactly to demo/shift date
      staff.credentials[0].expiryDate = '2026-10-18';
      const shiftOnDemoDate: ShiftDetails = { ...defaultNurseShift, date: '2026-10-18' };
      const result = validateShiftAssignment(staff, shiftOnDemoDate, 'schedule', '2026-10-18');

      const blsCheck = result.checks.find((c) => c.credentialType === 'BLS');
      expect(blsCheck?.status).toBe('passed');
      expect(blsCheck?.daysRemaining).toBe(0);
      expect(result.isValid).toBe(true);
    });

    it('blocks credentials missing an expiry date', () => {
      const staff = getStaff('STF-101');
      delete staff.credentials[0].expiryDate;
      const result = validateShiftAssignment(staff, defaultNurseShift, 'schedule', DEMO_DATE);

      expect(result.isValid).toBe(false);
      expect(result.canConfirm).toBe(false);
      const blsCheck = result.checks.find((c) => c.credentialType === 'BLS');
      expect(blsCheck?.status).toBe('missing_expiry');
    });
  });

  describe('Shift-Date-Aware Validation (Required Regression Scenarios)', () => {
    it('blocks assignment when credential expires before target shift date even if valid on demo date', () => {
      const staff = getStaff('STF-101');
      // BLS expires on 2026-10-19 (+1 day after demo date 2026-10-18, but 1 day before shift on 2026-10-20)
      staff.credentials[0].expiryDate = '2026-10-19';
      const result = validateShiftAssignment(staff, defaultNurseShift, 'schedule', '2026-10-18');

      expect(result.isValid).toBe(false);
      expect(result.canConfirm).toBe(false);
      expect(result.overallStatus).toBe('blocked');
      const blsCheck = result.checks.find((c) => c.credentialType === 'BLS');
      expect(blsCheck?.status).toBe('expired');
      expect(blsCheck?.message).toContain('before target shift date (2026-10-20)');
      expect(result.failures.some((f) => f.includes('expires on 2026-10-19 prior to target shift on 2026-10-20'))).toBe(true);
    });

    it('allows assignment when credential remains valid throughout the target shift date', () => {
      const staff = getStaff('STF-101');
      // BLS expires on 2026-10-20 (exact day of target shift)
      staff.credentials[0].expiryDate = '2026-10-20';
      const result = validateShiftAssignment(staff, defaultNurseShift, 'schedule', '2026-10-18');

      expect(result.isValid).toBe(true);
      expect(result.canConfirm).toBe(true);
      expect(result.overallStatus).toBe('eligible');
      const blsCheck = result.checks.find((c) => c.credentialType === 'BLS');
      expect(blsCheck?.status).toBe('passed');
      expect(blsCheck?.message).toContain('Active throughout target shift on 2026-10-20');
    });

    it('enforces identical shift-date-aware validation rules on shift swap approvals', () => {
      const staff = getStaff('STF-101');
      // BLS expires before shift date on a swap approval
      staff.credentials[0].expiryDate = '2026-10-19';
      const swapResult = validateShiftAssignment(staff, defaultNurseShift, 'swap', '2026-10-18');

      expect(swapResult.isValid).toBe(false);
      expect(swapResult.canConfirm).toBe(false);
      expect(swapResult.overallStatus).toBe('blocked');
      expect(swapResult.actionType).toBe('swap');
      expect(swapResult.failures[0]).toContain('shift swap approval');
    });

    it('recalculates validation when the target shift date is changed', () => {
      const staff = getStaff('STF-101');
      staff.credentials[0].expiryDate = '2026-10-19';

      // For a shift on 2026-10-18, credential is valid through shift date
      const shiftToday: ShiftDetails = { ...defaultNurseShift, date: '2026-10-18' };
      const validToday = validateShiftAssignment(staff, shiftToday, 'schedule', '2026-10-18');
      expect(validToday.isValid).toBe(true);
      expect(validToday.canConfirm).toBe(true);

      // Change shift date to 2026-10-20: credential expires before shift, immediately blocked
      const shiftFuture: ShiftDetails = { ...defaultNurseShift, date: '2026-10-20' };
      const invalidFuture = validateShiftAssignment(staff, shiftFuture, 'schedule', '2026-10-18');
      expect(invalidFuture.isValid).toBe(false);
      expect(invalidFuture.canConfirm).toBe(false);
      expect(invalidFuture.overallStatus).toBe('blocked');
    });
  });

  describe('Roster Overall Status (getStaffOverallEligibility)', () => {
    it('accurately derives status for all 6 mock staff records', () => {
      expect(getStaffOverallEligibility(getStaff('STF-101'))).toMatchObject({
        overallStatus: 'valid',
        summaryLabel: 'Eligible & Valid',
      });

      expect(getStaffOverallEligibility(getStaff('STF-102'))).toMatchObject({
        overallStatus: 'expired',
        summaryLabel: 'Expired Credential',
      });

      expect(getStaffOverallEligibility(getStaff('STF-103'))).toMatchObject({
        overallStatus: 'expired',
        summaryLabel: 'Expired Credential',
      });

      expect(getStaffOverallEligibility(getStaff('STF-104'))).toMatchObject({
        overallStatus: 'missing',
        summaryLabel: 'Missing Credential',
      });

      expect(getStaffOverallEligibility(getStaff('STF-105'))).toMatchObject({
        overallStatus: 'unverified',
        summaryLabel: 'Pending Verification',
      });

      expect(getStaffOverallEligibility(getStaff('STF-106'))).toMatchObject({
        overallStatus: 'unconfigured',
        summaryLabel: 'Role Not Configured',
      });
    });
  });

  describe('Simulated Credential Updates', () => {
    it('revalidates to eligible when expired BLS is renewed and verified', () => {
      const rohan = getStaff('STF-102');
      // Initially blocked
      expect(validateShiftAssignment(rohan, defaultNurseShift, 'schedule').isValid).toBe(false);

      // Simulate renewal
      const bls = rohan.credentials.find((c) => c.type === 'BLS')!;
      bls.expiryDate = '2027-10-18';
      bls.verificationStatus = 'verified';

      const renewedResult = validateShiftAssignment(rohan, defaultNurseShift, 'schedule');
      expect(renewedResult.isValid).toBe(true);
      expect(renewedResult.canConfirm).toBe(true);
      expect(renewedResult.overallStatus).toBe('eligible');
    });

    it('revalidates to blocked when verified BLS is set to unverified', () => {
      const ananya = getStaff('STF-101');
      expect(validateShiftAssignment(ananya, defaultNurseShift, 'schedule').isValid).toBe(true);

      // Simulate change to unverified
      ananya.credentials[0].verificationStatus = 'unverified';

      const unverifiedResult = validateShiftAssignment(ananya, defaultNurseShift, 'schedule');
      expect(unverifiedResult.isValid).toBe(false);
      expect(unverifiedResult.canConfirm).toBe(false);
      expect(unverifiedResult.overallStatus).toBe('blocked');
    });

    it('revalidates to eligible when missing BLS is added for Kavya Joshi', () => {
      const kavya = getStaff('STF-104');
      expect(validateShiftAssignment(kavya, defaultNurseShift, 'schedule').isValid).toBe(false);

      // Add BLS
      kavya.credentials.push({
        id: 'CRD-104-BLS-ADDED',
        type: 'BLS',
        name: 'Basic Life Support (BLS)',
        issuingBody: 'American Heart Association',
        expiryDate: '2027-12-31',
        verificationStatus: 'verified',
      });

      const addedResult = validateShiftAssignment(kavya, defaultNurseShift, 'schedule');
      expect(addedResult.isValid).toBe(true);
      expect(addedResult.canConfirm).toBe(true);
      expect(addedResult.overallStatus).toBe('eligible');
    });
  });
});
