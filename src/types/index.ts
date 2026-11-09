/**
 * UNIMAK WIP STOCK MANAGEMENT SYSTEM
 * Type Definitions & Domain Models
 */

export type UserRole = 'Administrator' | 'Quality Department' | 'Viewer';

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department: string;
  active: boolean;
  canExportReports: boolean; // For Viewer role
  createdAt: string;
  lastLogin?: string;
}

export type SideConfiguration = 'Single' | 'Double';

export interface JobMaster {
  id: string;
  jobNumber: string; // Unique job code / number
  jobName: string;
  customerName?: string;
  description?: string;
  active: boolean;
  createdAt: string;
}

export interface ItemMaster {
  id: string;
  itemCode: string; // Unique
  itemName: string;
  sheetSize: string; // e.g., "0.20 × 710 × 910"
  unitOfMeasure: string; // default "Sheets"
  description?: string;
  active: boolean;
  createdAt: string;
}

export interface SheetSizeMaster {
  id: string;
  size: string; // e.g. "0.20 × 710 × 910", "0.20 × 990 × 775 (W)"
  description?: string;
  active: boolean;
}

export interface CoatingTypeMaster {
  id: string;
  code: string;
  name: string; // White, Size, Gold, LPVC, NPVC, Silver, Black
  description?: string;
  active: boolean;
}

export interface FactoryMaster {
  id: string;
  code: string;
  name: string; // Crown Line, Plant 2, Plant 3, Printing Line
  isPrintingLine: boolean;
  description?: string;
  active: boolean;
}

// Transaction Types
export interface CoatingReceipt {
  id: string;
  receiptNumber: string; // e.g. CR-2026-0001
  receivingDate: string; // YYYY-MM-DD
  jobId: string;
  jobNumber: string;
  jobName: string;
  coatingBatchCardNumber: string; // Unique batch card
  itemId: string;
  itemCode: string;
  itemName: string;
  sheetSize: string;
  coatingTypeIds: string[];
  coatingCombination: string; // e.g. "Gold + Size", "White + Gold + Size"
  sideConfiguration: SideConfiguration;
  receivedQuantity: number;
  remarks?: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  isReversed?: boolean;
  reversedReason?: string;
  reversedAt?: string;
  reversedBy?: string;
}

export type IssueType = 'Coated Sheet Issue' | 'Approved Printed Sheet Issue';

export interface FactoryIssue {
  id: string;
  issueNumber: string; // e.g. IS-2026-0001
  issueType: IssueType;
  issueDate: string; // YYYY-MM-DD
  jobId: string;
  jobNumber: string;
  jobName: string;
  destinationFactory: string; // Crown Line, Plant 2, Plant 3, Printing Line
  isPrintingLine: boolean;
  itemId: string;
  itemCode: string;
  itemName: string;
  sheetSize: string;
  coatingCombination: string;
  sideConfiguration: SideConfiguration;
  // If Coated Sheet Issue:
  coatingBatchCardNumber: string;
  // If Issued to Printing Line, generates/links Printing Batch Card Number:
  printingBatchCardNumber?: string;
  issueQuantity: number;
  remarks?: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  isReversed?: boolean;
  reversedReason?: string;
  reversedAt?: string;
  reversedBy?: string;
}

export type QualityReturnStatus = 'Draft' | 'Submitted' | 'Approved' | 'Correction Required';

export interface QualityReturn {
  id: string;
  returnNumber: string; // e.g. QR-2026-0001
  returnDate: string;
  jobId: string;
  jobNumber: string;
  jobName: string;
  printingBatchCardNumber: string;
  originalCoatingBatchCardNumber: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  sheetSize: string;
  coatingCombination: string;
  sideConfiguration: SideConfiguration;
  printingLineIssueQuantity: number;
  previouslyApprovedReturnedQuantity: number;
  pendingReturnQuantity: number;
  outstandingPrintingQuantity: number; // printingLineIssueQuantity - previouslyApprovedReturnedQuantity
  goodQuantity: number;
  rejectedQuantity: number;
  totalReturnedQuantity: number; // goodQuantity + rejectedQuantity
  upsPerSheet?: number;
  goodUPS?: number;
  rejectedUPS?: number;
  totalUPS?: number;
  remarks?: string;
  status: QualityReturnStatus;
  submittedBy: string;
  submittedByName: string;
  submittedAt?: string;
  approvedBy?: string;
  approvedByName?: string;
  approvedAt?: string;
  correctionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  module: string;
  recordReference: string;
  previousValue?: string;
  newValue?: string;
  reason?: string;
  timestamp: string;
}

export interface AppSettings {
  companyName: string;
  companyAddress: string;
  systemTitle: string;
  currency: string;
  allowViewerExport: boolean;
  theme: 'light' | 'dark' | 'system';
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  useLiveSupabase: boolean;
}

// Calculated Stock Summary Models
export interface CoatingBatchStock {
  jobId: string;
  jobNumber: string;
  jobName: string;
  coatingBatchCardNumber: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  sheetSize: string;
  coatingCombination: string;
  sideConfiguration: SideConfiguration;
  receivedQuantity: number;
  issuedToPrintingLine: number;
  issuedToCrownLine: number;
  issuedToPlant2: number;
  issuedToPlant3: number;
  totalIssuedQuantity: number;
  remainingBalance: number;
  receiptDate: string;
}

export interface ItemCoatingStockSummary {
  itemCode: string;
  itemName: string;
  sheetSize: string;
  totalReceivedQuantity: number;
  totalIssuedQuantity: number;
  currentCoatingStock: number;
  activeCoatingBatchCount: number;
  batches: CoatingBatchStock[];
}

export interface PrintingBatchStock {
  jobId: string;
  jobNumber: string;
  jobName: string;
  printingBatchCardNumber: string;
  originalCoatingBatchCardNumber: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  sheetSize: string;
  coatingCombination: string;
  sideConfiguration: SideConfiguration;
  printingLineIssueQuantity: number;
  goodQuantityReturnedApproved: number;
  rejectedQuantityReturnedApproved: number;
  totalApprovedReturnedQuantity: number;
  outstandingPrintingWIP: number; // printingLineIssueQuantity - totalApprovedReturnedQuantity
  pendingReturnQuantity: number;
  approvedGoodPrintingStock: number; // goodQuantityReturnedApproved - finalFactoryIssuedQuantity
  rejectedPrintingStock: number; // rejectedQuantityReturnedApproved
  finalFactoryIssuedQuantity: number;
  remainingGoodPrintingStock: number;
  issueDate: string;
}
