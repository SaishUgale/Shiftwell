import type { StaffMember, ShiftDetails, ActionType, ValidationResult, CredentialCheckResult } from '../types';


export const DEMO_DATE = '2026-10-18';

export interface MandatoryRequirement {
  type: 'BLS' | 'NURSING_COUNCIL';
  name: string;
}

export const NURSE_MANDATORY_CREDENTIALS: MandatoryRequirement[] = [
  { type: 'BLS', name: 'Basic Life Support (BLS) Certificate' },
  { type: 'NURSING_COUNCIL', name: 'State Nursing Council Registration' },
];

/**
 * Parses YYYY-MM-DD into a UTC date timestamp for precise date comparisons without timezone shift.
 */
export function parseDateString(dateStr: string): number {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return NaN;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  return Date.UTC(year, month, day);
}

/**
 * Calculates day difference between a target date and the fixed demo date (2026-10-18).
 */
export function getDaysDifference(targetDateStr: string, baseDateStr = DEMO_DATE): number {
  const target = parseDateString(targetDateStr);
  const base = parseDateString(baseDateStr);
  if (isNaN(target) || isNaN(base)) return NaN;
  const diffTime = target - base;
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Core validation engine for Shiftwell Certificate Validation.
 * Pure function: takes staff member, target shift, and action type.
 * Returns comprehensive validation verdict with per-credential checks.
 */
export function validateShiftAssignment(
  staff: StaffMember,
  shift: ShiftDetails,
  actionType: ActionType,
  demoDate: string = DEMO_DATE
): ValidationResult {
  const nowIso = new Date().toISOString();

  // Rule: Check role configuration
  // For roles other than Nurse, do not invent requirements. Display a clear message that role requirements must be configured.
  if (staff.role !== 'Nurse') {
    return {
      isValid: false,
      canConfirm: false,
      roleConfigured: false,
      overallStatus: 'role_unconfigured',
      evaluatedAt: nowIso,
      staffId: staff.id,
      staffName: staff.name,
      actionType,
      targetShift: shift,
      checks: [],
      failures: [
        `Credential policy for role '${staff.role}' has not been configured in CarePoint organization settings.`,
      ],
      unconfiguredMessage: `Role requirements must be configured before role '${staff.role}' can be validated. Please configure mandatory credential policies in Organization Settings or assign a Nurse.`,
      recommendedAction: `Contact the CarePoint clinical operations director to define mandatory credentials for '${staff.role}'.`,
    };
  }

  if (shift.requiredRole !== 'Nurse') {
    return {
      isValid: false,
      canConfirm: false,
      roleConfigured: false,
      overallStatus: 'role_unconfigured',
      evaluatedAt: nowIso,
      staffId: staff.id,
      staffName: staff.name,
      actionType,
      targetShift: shift,
      checks: [],
      failures: [
        `Credential policy for role '${shift.requiredRole}' has not been configured in CarePoint organization settings.`,
      ],
      unconfiguredMessage: `Role requirements must be configured before role '${shift.requiredRole}' can be validated. Please configure mandatory credential policies in Organization Settings or assign a Nurse.`,
      recommendedAction: `Contact the CarePoint clinical operations director to define mandatory credentials for '${shift.requiredRole}'.`,
    };
  }

  // Validate mandatory nurse credentials: BLS and Nursing Council Registration
  const checks: CredentialCheckResult[] = [];
  const failures: string[] = [];
  const actionLabel = actionType === 'swap' ? 'shift swap approval' : 'shift assignment';

  for (const requirement of NURSE_MANDATORY_CREDENTIALS) {
    const credential = staff.credentials.find((c) => c.type === requirement.type);

    if (!credential) {
      // Missing credential
      checks.push({
        credentialType: requirement.type,
        credentialName: requirement.name,
        required: true,
        status: 'missing',
        message: `Missing credential: No record of ${requirement.name} exists in the staff profile.`,
      });
      failures.push(
        `${requirement.name} is missing from ${staff.name}'s profile. Mandatory credential must be uploaded and verified before ${actionLabel}.`
      );
      continue;
    }

    // Check verification status
    if (credential.verificationStatus !== 'verified') {
      const statusLabel =
        credential.verificationStatus === 'pending_verification'
          ? 'pending clinic management verification'
          : 'unverified';
      checks.push({
        credentialType: requirement.type,
        credentialName: requirement.name,
        required: true,
        status: 'unverified',
        expiryDate: credential.expiryDate,
        verificationStatus: credential.verificationStatus,
        message: `${requirement.name} has not been verified (${statusLabel}). Mandatory credentials must be verified prior to shift assignment.`,
      });
      failures.push(
        `${requirement.name} is unverified (${statusLabel}). A clinic manager must inspect and verify the physical or digital certificate before ${actionLabel}.`
      );
      continue;
    }

    // Check expiry date existence
    if (!credential.expiryDate) {
      checks.push({
        credentialType: requirement.type,
        credentialName: requirement.name,
        required: true,
        status: 'missing_expiry',
        verificationStatus: credential.verificationStatus,
        message: `${requirement.name} does not have an expiry date recorded. Credentials without an expiry date cannot be automatically validated.`,
      });
      failures.push(
        `${requirement.name} is missing an expiry date. A credential without an expiry date is not automatically valid.`
      );
      continue;
    }

    // Check expiry date against demo date and target shift date
    const targetShiftDate = shift?.date || demoDate;
    const daysRemainingFromDemo = getDaysDifference(credential.expiryDate, demoDate);
    const daysRemainingUntilShift = getDaysDifference(credential.expiryDate, targetShiftDate);

    if (isNaN(daysRemainingFromDemo) || isNaN(daysRemainingUntilShift)) {
      checks.push({
        credentialType: requirement.type,
        credentialName: requirement.name,
        required: true,
        status: 'missing_expiry',
        verificationStatus: credential.verificationStatus,
        message: `${requirement.name} has an unparseable or invalid expiry date format (${credential.expiryDate}).`,
      });
      failures.push(
        `${requirement.name} has an invalid expiry date format. Valid YYYY-MM-DD date required.`
      );
      continue;
    }

    if (daysRemainingFromDemo < 0) {
      // Expired relative to demo date!
      const daysAgo = Math.abs(daysRemainingFromDemo);
      checks.push({
        credentialType: requirement.type,
        credentialName: requirement.name,
        required: true,
        status: 'expired',
        expiryDate: credential.expiryDate,
        daysRemaining: daysRemainingFromDemo,
        verificationStatus: credential.verificationStatus,
        message: `${requirement.name} expired on ${credential.expiryDate} (${daysAgo} day${daysAgo === 1 ? '' : 's'} ago as of ${demoDate}).`,
      });
      failures.push(
        `${requirement.name} expired on ${credential.expiryDate}. Expired credentials block ${actionLabel}.`
      );
    } else if (daysRemainingUntilShift < 0) {
      // Valid on demo date, but expires before the target shift date!
      const daysPrior = Math.abs(daysRemainingUntilShift);
      checks.push({
        credentialType: requirement.type,
        credentialName: requirement.name,
        required: true,
        status: 'expired',
        expiryDate: credential.expiryDate,
        daysRemaining: daysRemainingUntilShift,
        verificationStatus: credential.verificationStatus,
        message: `${requirement.name} expires on ${credential.expiryDate}, before target shift date (${targetShiftDate}) by ${daysPrior} day${daysPrior === 1 ? '' : 's'}. Credentials must remain valid throughout the target shift.`,
      });
      failures.push(
        `${requirement.name} expires on ${credential.expiryDate} prior to target shift on ${targetShiftDate}. Credentials must remain valid throughout the target shift and block ${actionLabel}.`
      );
    } else {
      // Valid throughout target shift!
      checks.push({
        credentialType: requirement.type,
        credentialName: requirement.name,
        required: true,
        status: 'passed',
        expiryDate: credential.expiryDate,
        daysRemaining: daysRemainingFromDemo,
        verificationStatus: credential.verificationStatus,
        message: `Valid through ${credential.expiryDate} (${daysRemainingFromDemo} days remaining). Active throughout target shift on ${targetShiftDate}. Verified.`,
      });
    }
  }

  const isValid = failures.length === 0;

  let recommendedAction: string | undefined;
  if (!isValid) {
    if (failures.some((f) => f.includes('expired') || f.includes('expires'))) {
      recommendedAction =
        'Request an updated renewal certificate from the staff member. Upload the renewed credential in Staff & Credentials before re-attempting assignment.';
    } else if (failures.some((f) => f.includes('missing'))) {
      recommendedAction =
        'Request the mandatory credential document from the employee and upload it into their staff credential record.';
    } else if (failures.some((f) => f.includes('unverified'))) {
      recommendedAction =
        'Review the submitted credential document and mark it as verified in Staff & Credentials if authentic.';
    }
  }

  return {
    isValid,
    canConfirm: isValid,
    roleConfigured: true,
    overallStatus: isValid ? 'eligible' : 'blocked',
    evaluatedAt: nowIso,
    staffId: staff.id,
    staffName: staff.name,
    actionType,
    targetShift: shift,
    checks,
    failures,
    recommendedAction,
  };
}

/**
 * Helper to compute staff member's overall credential status for roster table.
 */
export function getStaffOverallEligibility(
  staff: StaffMember,
  demoDate: string = DEMO_DATE
): {
  overallStatus: 'valid' | 'expired' | 'missing' | 'unverified' | 'unconfigured';
  summaryLabel: string;
  badgeClass: string;
} {
  if (staff.role !== 'Nurse') {
    return {
      overallStatus: 'unconfigured',
      summaryLabel: 'Role Not Configured',
      badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
    };
  }

  let hasExpired = false;
  let hasMissing = false;
  let hasUnverified = false;

  for (const req of NURSE_MANDATORY_CREDENTIALS) {
    const cred = staff.credentials.find((c) => c.type === req.type);
    if (!cred) {
      hasMissing = true;
      continue;
    }
    if (cred.verificationStatus !== 'verified') {
      hasUnverified = true;
      continue;
    }
    const daysDiff = cred.expiryDate ? getDaysDifference(cred.expiryDate, demoDate) : NaN;
    if (!cred.expiryDate || isNaN(daysDiff) || daysDiff < 0) {
      hasExpired = true;
      continue;
    }
  }

  if (hasExpired) {
    return {
      overallStatus: 'expired',
      summaryLabel: 'Expired Credential',
      badgeClass: 'bg-red-50 text-red-700 border-red-200',
    };
  }
  if (hasMissing) {
    return {
      overallStatus: 'missing',
      summaryLabel: 'Missing Credential',
      badgeClass: 'bg-red-50 text-red-700 border-red-200',
    };
  }
  if (hasUnverified) {
    return {
      overallStatus: 'unverified',
      summaryLabel: 'Pending Verification',
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
    };
  }

  return {
    overallStatus: 'valid',
    summaryLabel: 'Eligible & Valid',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };
}
