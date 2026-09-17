export type DayOfWeek = 'tuesday' | 'thursday' | 'saturday' | 'sunday';
export type ActiveTab = 'tuesday' | 'thursday' | 'saturday' | 'sunday' | 'full-audit';
export type ReportingCadence = 'monthly-summary' | 'weekly-summary' | 'every-visit';

export type ItemStatus = 'pass' | 'fail' | 'pending' | 'na';

export interface InspectionMethodGuide {
  coverallSection: string; // e.g. "Entry & Common Areas", "Restrooms", "Floors", "Detail Cleaning", "Office Areas"
  inspectionProcedure: string; // The physical step-by-step way to perform the inspection
  inspectionSteps: string[]; // Specific checkpoints from Coverall FBO inspection guide
  passStandard: string; // 9 - Meets standards
  needsImprovementStandard: string; // 7 - Needs improvement
  belowStandard: string; // 5 - Below standards (must be corrected within 24 hours)
  fboProTip?: string; // FBO Inspection tip from Coverall guide
}

export interface InspectionItem {
  id: string;
  name: string;
  category: 'core' | 'tuesday' | 'thursday' | 'saturday' | 'sunday' | 'monthly';
  applicableDays: ('tuesday' | 'thursday' | 'saturday' | 'sunday' | 'all')[];
  isMonthly?: boolean;
  notesPrompt?: string;
  description?: string;
  inspectionGuide?: InspectionMethodGuide;
}

export interface InspectionPhoto {
  id: string;
  dataUrl: string;
  timestamp: string;
  caption?: string;
}

export interface ItemEvaluation {
  id: string;
  status: ItemStatus;
  notes?: string;
  photoUrl?: string; // Legacy single photo fallback
  photos?: InspectionPhoto[]; // Multiple pictures per inspection step or station
  updatedAt?: string;
}

export interface FacilityMetadata {
  facility: string;
  unit: string;
  address: string;
  frequency: string;
  contactName: string;
  contactPhone: string;
  accountNumber?: string;
  secondaryContact?: string;
  secondaryPhone?: string;
  keysInfo?: string;
  franchiseeName?: string;
  monthlyBilling?: string;
  printingDate?: string;
  totalAnnualVisits?: number;
  contractCycle?: string;
}

export interface InspectionRecord {
  id: string;
  facility: FacilityMetadata;
  inspectionDate: string; // ISO date string or formatted date
  inspectionTime: string;
  activeDay: ActiveTab;
  inspectorName: string;
  supervisorName: string;
  supervisorSignature: string; // Data URL
  signedAt: string;
  items: Record<string, ItemEvaluation>;
  monthlyToggles: Record<string, boolean>; // e.g. { 'sun-refrigerator': true }
  overallNotes: string;
  recipientTo?: string;
  recipientCc?: string;
  completedPeriodicServices?: string[];
  score: {
    percentage: number;
    passedCount: number;
    failedCount: number;
    naCount: number;
    totalEvaluated: number;
    totalScorable: number;
  };
  submittedAt?: string;
  resendStatus?: {
    sent: boolean;
    messageId?: string;
    mode: 'live' | 'simulated';
    error?: string;
  };
}

export const FACILITY_INFO: FacilityMetadata = {
  facility: 'Anytime Fitness North Vancouver',
  unit: 'Unit 103',
  address: '103 - 2180 Dollarton Hwy, North Vancouver, BC V7H 0B5',
  frequency: '3x / Week (Tuesday, Thursday, Saturday at 11:00 PM — 156 Annual Visits)',
  contactName: 'Jennifer Johnson',
  contactPhone: '604-785-4857',
  accountNumber: '3007',
  secondaryContact: 'Tara',
  secondaryPhone: '604-620-0048',
  keysInfo: '1 Fob + 1 Key',
  franchiseeName: 'Ronald Ephard',
  monthlyBilling: '$685.00 / month',
  printingDate: 'May 20, 2026',
  totalAnnualVisits: 156,
  contractCycle: 'Tuesday, Thursday, Saturday (156 Visits / Year)',
};

export const RECIPIENT_CONFIG = {
  to: 'ronaldephard10@gmail.com',
  cc: 'ronald@marketingdo.net',
  from: '"Clean Audit Pro" <inspections@cleanaudit.pro>',
};

export const CLIENT_REPORT_RECIPIENTS = {
  to: 'jen.johnson@anytimefitness.ca',
  cc: 'ronaldephard10@gmail.com, ronald@marketingdo.net',
  clientName: 'Jennifer Johnson',
  clubName: 'Anytime Fitness North Vancouver',
};
