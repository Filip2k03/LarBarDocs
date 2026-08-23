export type StaffRole = 
  | 'GOD_ADMIN'
  | 'EXEC_SUPERADMIN'
  | 'KYC_MANAGER'
  | 'KYC_REVIEWER'
  | 'DRIVER_REGISTRAR'
  | 'STAFF_REGISTRAR'
  | 'MARKETER'
  | 'SUPPORT'
  | 'AUDITOR';

export type CaseStatus = 
  | 'DRAFT'
  | 'SUBMITTED'
  | 'IN_REVIEW'
  | 'NEEDS_CORRECTION'
  | 'APPROVED'
  | 'REJECTED'
  | 'ACTIVATION_INVITED'
  | 'ACTIVE'
  | 'SUSPENDED';

export interface DriverCase {
  id: string;
  driverName: string;
  driverNameMm?: string;
  phone: string;
  nrcNumber: string;
  licenceNumber: string;
  licenceClass: string;
  licenceExpiry: string;
  vehiclePlate: string;
  vehicleModel: string;
  branch: string;
  status: CaseStatus;
  riskFlags: string[];
  ocrConfidence: {
    name: number;
    nrc: number;
    dob: number;
    licence: number;
    overall: number;
  };
  livenessScore: number;
  faceMatchScore: number;
  submittedAt: string;
  assignedReviewer?: string;
}

export interface StaffMember {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: StaffRole;
  branch: string;
  mfaType: 'PASSKEY' | 'HARDWARE_KEY' | 'TOTP' | 'SMS_FALLBACK';
  status: 'ACTIVE' | 'INVITED' | 'SUSPENDED';
  lastActive: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: StaffRole;
  action: string;
  targetResource: string;
  purposeReason?: string;
  ipAddress: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
}
