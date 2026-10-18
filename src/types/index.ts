export type CredentialType = 'BLS' | 'NURSING_COUNCIL' | 'MEDICAL_COUNCIL' | 'OTHER';

export type VerificationStatus = 'verified' | 'unverified' | 'pending_verification';

export interface CredentialRecord {
  id: string;
  type: CredentialType;
  name: string;
  certificateNumber?: string;
  issuingBody: string;
  expiryDate?: string; // YYYY-MM-DD
  verificationStatus: VerificationStatus;
  lastUpdated?: string; // YYYY-MM-DD
  documentUrl?: string;
  verifiedBy?: string;
  verificationDate?: string;
}

export type StaffRole = 'Nurse' | 'General Physician' | 'Pharmacist' | 'Lab Technician';

export interface StaffMember {
  id: string;
  name: string;
  role: StaffRole;
  email: string;
  phone: string;
  primaryClinic: string;
  credentials: CredentialRecord[];
  avatarBg: string;
}

export type ActionType = 'schedule' | 'swap';

export interface ShiftDetails {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // e.g. "08:00"
  endTime: string; // e.g. "16:00"
  shiftLabel: string; // e.g. "Morning Shift"
  clinicLocation: string;
  requiredRole: StaffRole;
  swapWithStaffId?: string; // If action is swap
  department: string;
}

export interface CredentialCheckResult {
  credentialType: CredentialType;
  credentialName: string;
  required: boolean;
  status: 'passed' | 'expired' | 'missing' | 'unverified' | 'missing_expiry';
  expiryDate?: string;
  daysRemaining?: number;
  message: string;
  verificationStatus?: VerificationStatus;
}

export interface ValidationResult {
  isValid: boolean;
  canConfirm: boolean;
  roleConfigured: boolean;
  overallStatus: 'eligible' | 'blocked' | 'role_unconfigured';
  evaluatedAt: string;
  staffId: string;
  staffName: string;
  actionType: ActionType;
  targetShift: ShiftDetails;
  checks: CredentialCheckResult[];
  failures: string[];
  recommendedAction?: string;
  unconfiguredMessage?: string;
}

export interface ActivityLogEntry {
  id: string;
  timestamp: string; // e.g. "2026-10-18T10:14:00"
  formattedTime: string;
  staffId: string;
  staffName: string;
  staffRole: StaffRole;
  actionType: ActionType;
  targetShiftDate: string;
  targetShiftTime: string;
  clinicLocation: string;
  outcome: 'Approved' | 'Blocked';
  failedCredential?: string;
  failureReason?: string;
  managerName: string;
  isSimulated: boolean;
}

export type StaffFilterStatus = 'all' | 'valid' | 'expired' | 'missing' | 'unverified';
