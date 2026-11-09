/**
 * UNIMAK WIP STOCK MANAGEMENT SYSTEM
 * Supabase Client & Atomic Storage Engine
 * Single Source of Truth for Unimak (Pvt) Ltd
 */

import { createClient } from '@supabase/supabase-js';
import {
  UserAccount,
  JobMaster,
  ItemMaster,
  SheetSizeMaster,
  CoatingTypeMaster,
  FactoryMaster,
  CoatingReceipt,
  FactoryIssue,
  QualityReturn,
  AuditLogEntry,
  AppSettings,
  ItemCoatingStockSummary,
  CoatingBatchStock,
  PrintingBatchStock,
} from '../types';

// Default initial master data as specified in Master Prompt & User Requirements
export const DEFAULT_SHEET_SIZES: SheetSizeMaster[] = [
  { id: 'size-1', size: '0.21 × 830 × 910', description: 'Standard Tinplate Sheet', active: true },
  { id: 'size-2', size: '0.21 × 890 × 710', description: 'Tinplate Can Sheet', active: true },
  { id: 'size-3', size: '0.20 × 910 × 905', description: 'Metal Packaging Sheet', active: true },
  { id: 'size-4', size: '0.21 × 975 × 715', description: 'High Precision Sheet', active: true },
  { id: 'size-5', size: '0.21 × 960 × 735', description: 'Can Body Stock', active: true },
  { id: 'size-6', size: '0.21 × 910 × 840', description: 'End Stock Sheet', active: true },
  { id: 'size-7', size: '0.21 × 960 × 855', description: 'Crown Cap Sheet', active: true },
  { id: 'size-8', size: '0.21 × 828 × 800', description: 'Formed Component Sheet', active: true },
  { id: 'size-9', size: '0.21 × 875 × 892', description: 'Decorated Tinplate Sheet', active: true },
  { id: 'size-10', size: '0.21 × 832 × 846', description: 'Specialty Tinplate', active: true },
  { id: 'size-11', size: '0.20 × 990 × 775', description: 'Wide Format Can Sheet', active: true },
  { id: 'size-12', size: '0.21 × 930 × 915', description: 'Industrial Metal Packaging', active: true },
  { id: 'size-13', size: '0.20 × 566 × 806', description: 'Narrow Format Sheet', active: true },
  { id: 'size-14', size: '0.21 × 566 × 794', description: 'Narrow Stamping Sheet', active: true },
  { id: 'size-15', size: '0.21 × 842 × 910', description: 'Large Format Sheet', active: true },
  { id: 'size-16', size: '0.20 × 1015 × 890', description: 'Extra Large Format Sheet', active: true },
  { id: 'size-17', size: '0.23 × 710 × 1020', description: 'Heavy Gauge 0.23mm Sheet', active: true },
  { id: 'size-18', size: '0.21 × 990 × 775', description: 'Wide Decorated Sheet', active: true },
  { id: 'size-19', size: '0.20 × 710 × 910', description: 'Standard Tinplate Sheet', active: true },
];

export const DEFAULT_COATING_TYPES: CoatingTypeMaster[] = [
  { id: 'coat-1', code: 'WHT', name: 'White', description: 'Base White Coating', active: true },
  { id: 'coat-2', code: 'SIZ', name: 'Size', description: 'Size Varnish', active: true },
  { id: 'coat-3', code: 'GLD', name: 'Gold', description: 'Gold Lacquer', active: true },
  { id: 'coat-4', code: 'LPVC', name: 'LPVC', description: 'Low PVC Coating', active: true },
  { id: 'coat-5', code: 'NPVC', name: 'NPVC', description: 'Non-PVC Protective Lacquer', active: true },
  { id: 'coat-6', code: 'SLV', name: 'Silver', description: 'Silver Finish', active: true },
  { id: 'coat-7', code: 'BLK', name: 'Black', description: 'Black Coating', active: true },
];

export const DEFAULT_FACTORIES: FactoryMaster[] = [
  { id: 'fac-1', code: 'CRN', name: 'Crown Line', isPrintingLine: false, description: 'Crown Cork Manufacturing Line', active: true },
  { id: 'fac-2', code: 'PL2', name: 'Plant 2', isPrintingLine: false, description: 'Component Stamping Plant 2', active: true },
  { id: 'fac-3', code: 'PL3', name: 'Plant 3', isPrintingLine: false, description: 'Assembly & Seaming Plant 3', active: true },
  { id: 'fac-4', code: 'PRT', name: 'Printing Line', isPrintingLine: true, description: 'High-Speed Metal Decorating & Printing Line', active: true },
];

// Initial user accounts for system testing & RBAC
export const DEFAULT_USERS: UserAccount[] = [
  {
    id: 'usr-admin-1',
    email: 'admin@unimak.lk',
    name: 'Production Administrator',
    role: 'Administrator',
    department: 'Management & Operations',
    active: true,
    canExportReports: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'usr-qa-1',
    email: 'quality@unimak.lk',
    name: 'QA Inspection Officer',
    role: 'Quality Department',
    department: 'Quality Assurance',
    active: true,
    canExportReports: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'usr-viewer-1',
    email: 'viewer@unimak.lk',
    name: 'Operations Auditor',
    role: 'Viewer',
    department: 'Inventory Audit',
    active: true,
    canExportReports: true,
    createdAt: new Date().toISOString(),
  },
];

export const DEFAULT_SETTINGS: AppSettings = {
  companyName: 'Unimak (Pvt) Ltd',
  companyAddress: 'Metal Packaging Manufacturing Division, Industrial Zone, Colombo, Sri Lanka',
  systemTitle: 'UNIMAK WIP STOCK MANAGEMENT SYSTEM',
  currency: 'LKR',
  allowViewerExport: true,
  theme: 'dark', // default dark mode as requested
  useLiveSupabase: false,
};

// Storage Keys
const STORAGE_PREFIX = 'unimak_wip_';
const KEYS = {
  SETTINGS: `${STORAGE_PREFIX}settings`,
  USERS: `${STORAGE_PREFIX}users`,
  CURRENT_USER_ID: `${STORAGE_PREFIX}current_user_id`,
  JOBS: `${STORAGE_PREFIX}jobs`,
  ITEMS: `${STORAGE_PREFIX}items`,
  SHEET_SIZES: `${STORAGE_PREFIX}sheet_sizes`,
  COATING_TYPES: `${STORAGE_PREFIX}coating_types`,
  FACTORIES: `${STORAGE_PREFIX}factories`,
  COATING_RECEIPTS: `${STORAGE_PREFIX}coating_receipts`,
  FACTORY_ISSUES: `${STORAGE_PREFIX}factory_issues`,
  QUALITY_RETURNS: `${STORAGE_PREFIX}quality_returns`,
  AUDIT_LOGS: `${STORAGE_PREFIX}audit_logs`,
};

function loadStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function saveStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Error saving to storage key ${key}:`, err);
  }
}

// Supabase client instance if configured
export function getSupabaseClient() {
  const settings = loadStorage<AppSettings>(KEYS.SETTINGS, DEFAULT_SETTINGS);
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || settings.supabaseUrl;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || settings.supabaseAnonKey;

  if (supabaseUrl && supabaseAnonKey && settings.useLiveSupabase) {
    try {
      return createClient(supabaseUrl, supabaseAnonKey);
    } catch (e) {
      console.warn('Failed to initialize Supabase client:', e);
      return null;
    }
  }
  return null;
}

/**
 * Atomic Operational Data Store
 * All transactions, constraints, stock calculations and audits pass through here.
 */
export class UnimakStockEngine {
  // Settings
  static getSettings(): AppSettings {
    return loadStorage<AppSettings>(KEYS.SETTINGS, DEFAULT_SETTINGS);
  }

  static saveSettings(settings: AppSettings, user: UserAccount): void {
    const prev = this.getSettings();
    saveStorage(KEYS.SETTINGS, settings);
    this.addAuditLog(user, 'UPDATE_SETTINGS', 'Settings', 'SYSTEM_SETTINGS', JSON.stringify(prev), JSON.stringify(settings), 'Updated system settings');
  }

  // Users & Auth
  static getUsers(): UserAccount[] {
    return loadStorage<UserAccount[]>(KEYS.USERS, DEFAULT_USERS);
  }

  static getCurrentUser(): UserAccount {
    const users = this.getUsers();
    const currentId = localStorage.getItem(KEYS.CURRENT_USER_ID);
    const found = users.find((u) => u.id === currentId && u.active);
    return found || users[0]; // fallback to Administrator
  }

  static setCurrentUser(userId: string): UserAccount {
    const users = this.getUsers();
    const found = users.find((u) => u.id === userId);
    if (found) {
      localStorage.setItem(KEYS.CURRENT_USER_ID, userId);
      this.addAuditLog(found, 'USER_LOGIN', 'Authentication', found.email, undefined, undefined, 'User signed into session');
      return found;
    }
    return users[0];
  }

  static saveUser(userToSave: UserAccount, actor: UserAccount): void {
    if (actor.role !== 'Administrator') {
      throw new Error('Only Administrators can create or manage user accounts.');
    }
    const users = this.getUsers();
    const existingIndex = users.findIndex((u) => u.id === userToSave.id);
    let action = 'CREATE_USER';
    if (existingIndex >= 0) {
      action = 'UPDATE_USER';
      users[existingIndex] = userToSave;
    } else {
      users.push(userToSave);
    }
    saveStorage(KEYS.USERS, users);
    this.addAuditLog(actor, action, 'User Management', userToSave.email, undefined, JSON.stringify(userToSave), `User account ${action === 'CREATE_USER' ? 'created' : 'updated'}`);
  }

  // Master Data: Jobs
  static getJobs(): JobMaster[] {
    return loadStorage<JobMaster[]>(KEYS.JOBS, []);
  }

  static saveJob(job: JobMaster, actor: UserAccount): void {
    if (actor.role !== 'Administrator') {
      throw new Error('Only Administrators can manage Master Data (Jobs).');
    }
    const jobs = this.getJobs();
    const duplicate = jobs.find((j) => j.jobNumber.trim().toLowerCase() === job.jobNumber.trim().toLowerCase() && j.id !== job.id);
    if (duplicate) {
      throw new Error(`Job Number "${job.jobNumber}" already exists. Duplicate job numbers are prohibited.`);
    }
    const index = jobs.findIndex((j) => j.id === job.id);
    if (index >= 0) {
      jobs[index] = job;
      this.addAuditLog(actor, 'UPDATE_JOB', 'Master Data', job.jobNumber, undefined, JSON.stringify(job), 'Updated job definition');
    } else {
      jobs.push(job);
      this.addAuditLog(actor, 'CREATE_JOB', 'Master Data', job.jobNumber, undefined, JSON.stringify(job), 'Created new job');
    }
    saveStorage(KEYS.JOBS, jobs);
  }

  // Master Data: Items
  static getItems(): ItemMaster[] {
    return loadStorage<ItemMaster[]>(KEYS.ITEMS, []);
  }

  static saveItem(item: ItemMaster, actor: UserAccount): void {
    if (actor.role !== 'Administrator') {
      throw new Error('Only Administrators can manage Master Data (Items).');
    }
    const items = this.getItems();
    const duplicate = items.find((i) => i.itemCode.trim().toLowerCase() === item.itemCode.trim().toLowerCase() && i.id !== item.id);
    if (duplicate) {
      throw new Error(`Item Code "${item.itemCode}" already exists. Duplicate item codes are prohibited.`);
    }
    const index = items.findIndex((i) => i.id === item.id);
    if (index >= 0) {
      items[index] = item;
      this.addAuditLog(actor, 'UPDATE_ITEM', 'Master Data', item.itemCode, undefined, JSON.stringify(item), 'Updated item definition');
    } else {
      items.push(item);
      this.addAuditLog(actor, 'CREATE_ITEM', 'Master Data', item.itemCode, undefined, JSON.stringify(item), 'Created new item master');
    }
    saveStorage(KEYS.ITEMS, items);
  }

  // Master Data: Sheet Sizes
  static getSheetSizes(): SheetSizeMaster[] {
    return loadStorage<SheetSizeMaster[]>(KEYS.SHEET_SIZES, DEFAULT_SHEET_SIZES);
  }

  static saveSheetSize(sheetSize: SheetSizeMaster, actor: UserAccount): void {
    if (actor.role !== 'Administrator') throw new Error('Only Administrators can manage Sheet Sizes.');
    const sizes = this.getSheetSizes();
    const index = sizes.findIndex((s) => s.id === sheetSize.id);
    if (index >= 0) sizes[index] = sheetSize;
    else sizes.push(sheetSize);
    saveStorage(KEYS.SHEET_SIZES, sizes);
    this.addAuditLog(actor, 'MANAGE_SHEET_SIZE', 'Master Data', sheetSize.size, undefined, sheetSize.size, 'Saved sheet size');
  }

  // Master Data: Coating Types
  static getCoatingTypes(): CoatingTypeMaster[] {
    return loadStorage<CoatingTypeMaster[]>(KEYS.COATING_TYPES, DEFAULT_COATING_TYPES);
  }

  static saveCoatingType(coatingType: CoatingTypeMaster, actor: UserAccount): void {
    if (actor.role !== 'Administrator') throw new Error('Only Administrators can manage Coating Types.');
    const list = this.getCoatingTypes();
    const index = list.findIndex((c) => c.id === coatingType.id);
    if (index >= 0) list[index] = coatingType;
    else list.push(coatingType);
    saveStorage(KEYS.COATING_TYPES, list);
    this.addAuditLog(actor, 'MANAGE_COATING_TYPE', 'Master Data', coatingType.name, undefined, coatingType.name, 'Saved coating type');
  }

  // Master Data: Factories
  static getFactories(): FactoryMaster[] {
    return loadStorage<FactoryMaster[]>(KEYS.FACTORIES, DEFAULT_FACTORIES);
  }

  static saveFactory(factory: FactoryMaster, actor: UserAccount): void {
    if (actor.role !== 'Administrator') throw new Error('Only Administrators can manage Factory options.');
    const list = this.getFactories();
    const index = list.findIndex((f) => f.id === factory.id);
    if (index >= 0) list[index] = factory;
    else list.push(factory);
    saveStorage(KEYS.FACTORIES, list);
    this.addAuditLog(actor, 'MANAGE_FACTORY', 'Master Data', factory.name, undefined, factory.name, 'Saved factory option');
  }

  // Transactions: Coating Receiving
  static getCoatingReceipts(): CoatingReceipt[] {
    return loadStorage<CoatingReceipt[]>(KEYS.COATING_RECEIPTS, []);
  }

  static postCoatingReceipt(
    data: Omit<CoatingReceipt, 'id' | 'receiptNumber' | 'createdAt' | 'createdBy' | 'createdByName'>,
    actor: UserAccount
  ): CoatingReceipt {
    if (actor.role === 'Viewer') {
      throw new Error('Viewers have read-only access.');
    }
    if (actor.role === 'Quality Department') {
      throw new Error('Quality Department cannot record coating receipts. Only Production/Administrator can.');
    }
    if (data.receivedQuantity <= 0) {
      throw new Error('Received quantity must be a positive number greater than zero.');
    }
    const cleanBatch = data.coatingBatchCardNumber.trim().toUpperCase();
    if (!cleanBatch) {
      throw new Error('Coating Batch Card Number is required.');
    }

    const receipts = this.getCoatingReceipts();
    const duplicate = receipts.find((r) => !r.isReversed && r.coatingBatchCardNumber.trim().toUpperCase() === cleanBatch);
    if (duplicate) {
      throw new Error(`Coating Batch Card Number "${cleanBatch}" is already registered. Duplicate batches are prohibited.`);
    }

    const newId = `cr-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const receiptNumber = `CR-${new Date().getFullYear()}-${String(receipts.length + 1).padStart(4, '0')}`;
    const newReceipt: CoatingReceipt = {
      ...data,
      id: newId,
      receiptNumber,
      coatingBatchCardNumber: cleanBatch,
      createdBy: actor.id,
      createdByName: actor.name,
      createdAt: new Date().toISOString(),
    };

    receipts.unshift(newReceipt);
    saveStorage(KEYS.COATING_RECEIPTS, receipts);

    this.addAuditLog(
      actor,
      'POST_COATING_RECEIPT',
      'Coating Receiving',
      newReceipt.coatingBatchCardNumber,
      undefined,
      `${newReceipt.receivedQuantity} Sheets (Job: ${newReceipt.jobNumber}, Item: ${newReceipt.itemCode})`,
      'Confirmed coating stock receipt'
    );

    return newReceipt;
  }

  // Transactions: Issuing to Factories
  static getFactoryIssues(): FactoryIssue[] {
    return loadStorage<FactoryIssue[]>(KEYS.FACTORY_ISSUES, []);
  }

  static postFactoryIssue(
    data: Omit<FactoryIssue, 'id' | 'issueNumber' | 'createdAt' | 'createdBy' | 'createdByName'>,
    actor: UserAccount
  ): FactoryIssue {
    if (actor.role === 'Viewer') {
      throw new Error('Viewers have read-only access.');
    }
    if (actor.role === 'Quality Department') {
      throw new Error('Quality Department cannot issue stock.');
    }
    if (data.issueQuantity <= 0) {
      throw new Error('Issue quantity must be greater than zero.');
    }

    // Atomic Stock Validation
    if (data.issueType === 'Coated Sheet Issue') {
      const batchStock = this.getCoatingBatchStock(data.coatingBatchCardNumber);
      if (!batchStock) {
        throw new Error(`Coating batch "${data.coatingBatchCardNumber}" not found.`);
      }
      if (data.issueQuantity > batchStock.remainingBalance) {
        throw new Error(
          `Insufficient coated stock! Available in batch ${data.coatingBatchCardNumber}: ${batchStock.remainingBalance.toLocaleString()} sheets. Requested: ${data.issueQuantity.toLocaleString()} sheets.`
        );
      }
    } else if (data.issueType === 'Approved Printed Sheet Issue') {
      if (!data.printingBatchCardNumber) {
        throw new Error('Printing Batch Card Number is required for Approved Printed Sheet issue.');
      }
      if (data.destinationFactory === 'Printing Line') {
        throw new Error('Printing Line cannot receive final approved printed sheets. Select Crown Line, Plant 2, or Plant 3.');
      }
      const printStock = this.getPrintingBatchStock(data.printingBatchCardNumber);
      if (!printStock) {
        throw new Error(`Printing batch "${data.printingBatchCardNumber}" not found.`);
      }
      if (data.issueQuantity > printStock.approvedGoodPrintingStock) {
        throw new Error(
          `Insufficient Approved Good Printing Stock! Available: ${printStock.approvedGoodPrintingStock.toLocaleString()} sheets. Requested: ${data.issueQuantity.toLocaleString()} sheets.`
        );
      }
    }

    const issues = this.getFactoryIssues();
    const newId = `is-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const issueNumber = `IS-${new Date().getFullYear()}-${String(issues.length + 1).padStart(4, '0')}`;

    // If issued to Printing Line, generate automatic Printing Batch Card Number if not supplied
    let pBatch = data.printingBatchCardNumber;
    if (data.issueType === 'Coated Sheet Issue' && data.destinationFactory === 'Printing Line' && !pBatch) {
      pBatch = `PB-${data.coatingBatchCardNumber}-${String(issues.filter((i) => i.coatingBatchCardNumber === data.coatingBatchCardNumber && i.isPrintingLine).length + 1).padStart(2, '0')}`;
    }

    const newIssue: FactoryIssue = {
      ...data,
      id: newId,
      issueNumber,
      printingBatchCardNumber: pBatch,
      isPrintingLine: data.destinationFactory === 'Printing Line',
      createdBy: actor.id,
      createdByName: actor.name,
      createdAt: new Date().toISOString(),
    };

    issues.unshift(newIssue);
    saveStorage(KEYS.FACTORY_ISSUES, issues);

    this.addAuditLog(
      actor,
      'POST_FACTORY_ISSUE',
      'Issuing to Factories',
      newIssue.issueNumber,
      undefined,
      `${newIssue.issueQuantity} Sheets to ${newIssue.destinationFactory} (Batch: ${newIssue.printingBatchCardNumber || newIssue.coatingBatchCardNumber})`,
      `Issued ${newIssue.issueType}`
    );

    return newIssue;
  }

  // Transactions: Quality Returns
  static getQualityReturns(): QualityReturn[] {
    return loadStorage<QualityReturn[]>(KEYS.QUALITY_RETURNS, []);
  }

  static saveQualityReturn(
    data: Omit<QualityReturn, 'id' | 'returnNumber' | 'createdAt' | 'updatedAt' | 'submittedBy' | 'submittedByName' | 'status'> & {
      id?: string;
      status: 'Draft' | 'Submitted';
    },
    actor: UserAccount
  ): QualityReturn {
    if (actor.role === 'Viewer') {
      throw new Error('Viewers have read-only access.');
    }
    if (data.goodQuantity < 0 || data.rejectedQuantity < 0) {
      throw new Error('Good and Rejected quantities must be zero or positive.');
    }
    const totalReturned = data.goodQuantity + data.rejectedQuantity;
    if (totalReturned <= 0) {
      throw new Error('Total returned quantity (Good + Rejected) must be greater than zero.');
    }

    // Verify Outstanding Limit
    const pStock = this.getPrintingBatchStock(data.printingBatchCardNumber);
    if (!pStock) {
      throw new Error(`Printing Batch Card "${data.printingBatchCardNumber}" not found.`);
    }

    // Pending returns (excluding the one being edited if any)
    const allReturns = this.getQualityReturns();
    const otherPendingTotal = allReturns
      .filter((q) => q.printingBatchCardNumber === data.printingBatchCardNumber && q.status === 'Submitted' && q.id !== data.id)
      .reduce((sum, q) => sum + q.totalReturnedQuantity, 0);

    const availableEligible = pStock.outstandingPrintingWIP - otherPendingTotal;
    if (totalReturned > availableEligible) {
      throw new Error(
        `Total Returned Quantity (${totalReturned.toLocaleString()}) exceeds the eligible outstanding quantity (${Math.max(0, availableEligible).toLocaleString()}). Pending submissions from other inspections are held in reserve.`
      );
    }

    let recordId = data.id;
    let returnNumber = '';
    const existingIndex = allReturns.findIndex((q) => q.id === data.id);

    if (existingIndex >= 0) {
      const existing = allReturns[existingIndex];
      if (existing.status === 'Approved') {
        throw new Error('Approved Quality Returns cannot be edited.');
      }
      returnNumber = existing.returnNumber;
      allReturns[existingIndex] = {
        ...existing,
        ...data,
        totalReturnedQuantity: totalReturned,
        goodUPS: data.upsPerSheet ? data.goodQuantity * data.upsPerSheet : undefined,
        rejectedUPS: data.upsPerSheet ? data.rejectedQuantity * data.upsPerSheet : undefined,
        totalUPS: data.upsPerSheet ? totalReturned * data.upsPerSheet : undefined,
        status: data.status,
        submittedBy: actor.id,
        submittedByName: actor.name,
        submittedAt: data.status === 'Submitted' ? new Date().toISOString() : existing.submittedAt,
        updatedAt: new Date().toISOString(),
      };
    } else {
      recordId = `qr-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      returnNumber = `QR-${new Date().getFullYear()}-${String(allReturns.length + 1).padStart(4, '0')}`;
      const newQR: QualityReturn = {
        ...data,
        id: recordId,
        returnNumber,
        totalReturnedQuantity: totalReturned,
        goodUPS: data.upsPerSheet ? data.goodQuantity * data.upsPerSheet : undefined,
        rejectedUPS: data.upsPerSheet ? data.rejectedQuantity * data.upsPerSheet : undefined,
        totalUPS: data.upsPerSheet ? totalReturned * data.upsPerSheet : undefined,
        status: data.status,
        submittedBy: actor.id,
        submittedByName: actor.name,
        submittedAt: data.status === 'Submitted' ? new Date().toISOString() : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      allReturns.unshift(newQR);
    }

    saveStorage(KEYS.QUALITY_RETURNS, allReturns);
    this.addAuditLog(
      actor,
      data.status === 'Submitted' ? 'SUBMIT_QUALITY_RETURN' : 'SAVE_QUALITY_DRAFT',
      'Quality Return',
      returnNumber,
      undefined,
      `Good: ${data.goodQuantity}, Rejected: ${data.rejectedQuantity} for Batch ${data.printingBatchCardNumber}`,
      data.status === 'Submitted' ? 'Submitted Quality Return for Admin approval' : 'Saved draft Quality Return'
    );

    return allReturns.find((q) => q.returnNumber === returnNumber)!;
  }

  // Atomic Quality Return Approval / Correction Return
  static approveQualityReturn(returnId: string, actor: UserAccount): QualityReturn {
    if (actor.role !== 'Administrator') {
      throw new Error('Only Administrators have authority to approve Quality Return submissions.');
    }

    const allReturns = this.getQualityReturns();
    const qrIndex = allReturns.findIndex((q) => q.id === returnId);
    if (qrIndex < 0) {
      throw new Error('Quality Return record not found.');
    }

    const qr = allReturns[qrIndex];
    if (qr.status === 'Approved') {
      throw new Error('This Quality Return is already approved.');
    }
    if (qr.submittedBy === actor.id) {
      throw new Error('Quality users or record originators cannot approve their own submissions.');
    }

    // Atomic Stock Verification
    const pStock = this.getPrintingBatchStock(qr.printingBatchCardNumber);
    if (!pStock) {
      throw new Error(`Printing Batch ${qr.printingBatchCardNumber} not found.`);
    }

    if (qr.totalReturnedQuantity > pStock.outstandingPrintingWIP) {
      throw new Error(
        `Cannot approve! Total returned quantity (${qr.totalReturnedQuantity.toLocaleString()}) exceeds the current outstanding Printing WIP (${pStock.outstandingPrintingWIP.toLocaleString()}).`
      );
    }

    // Mark Approved Atomically
    allReturns[qrIndex] = {
      ...qr,
      status: 'Approved',
      approvedBy: actor.id,
      approvedByName: actor.name,
      approvedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      correctionReason: undefined,
    };

    saveStorage(KEYS.QUALITY_RETURNS, allReturns);

    this.addAuditLog(
      actor,
      'APPROVE_QUALITY_RETURN',
      'Quality Return',
      qr.returnNumber,
      'Submitted',
      'Approved',
      `Approved ${qr.goodQuantity.toLocaleString()} Good, ${qr.rejectedQuantity.toLocaleString()} Rejected sheets for Batch ${qr.printingBatchCardNumber}`
    );

    return allReturns[qrIndex];
  }

  static returnQualityForCorrection(returnId: string, reason: string, actor: UserAccount): QualityReturn {
    if (actor.role !== 'Administrator') {
      throw new Error('Only Administrators can return submissions for correction.');
    }
    if (!reason || !reason.trim()) {
      throw new Error('A mandatory explanation reason is required when returning a Quality record for correction.');
    }

    const allReturns = this.getQualityReturns();
    const qrIndex = allReturns.findIndex((q) => q.id === returnId);
    if (qrIndex < 0) throw new Error('Quality Return record not found.');

    const qr = allReturns[qrIndex];
    if (qr.status === 'Approved') {
      throw new Error('Cannot return an already approved Quality Return.');
    }

    allReturns[qrIndex] = {
      ...qr,
      status: 'Correction Required',
      correctionReason: reason.trim(),
      updatedAt: new Date().toISOString(),
    };

    saveStorage(KEYS.QUALITY_RETURNS, allReturns);

    this.addAuditLog(
      actor,
      'REJECT_QUALITY_RETURN',
      'Quality Return',
      qr.returnNumber,
      qr.status,
      'Correction Required',
      `Returned for correction: ${reason}`
    );

    return allReturns[qrIndex];
  }

  // Controlled Reversals / Corrections (Administrator Only)
  static reverseCoatingReceipt(receiptId: string, reason: string, actor: UserAccount): void {
    if (actor.role !== 'Administrator') {
      throw new Error('Only Administrators can perform controlled transaction reversals.');
    }
    if (!reason.trim()) {
      throw new Error('A mandatory reason is required for reversal.');
    }

    const receipts = this.getCoatingReceipts();
    const idx = receipts.findIndex((r) => r.id === receiptId);
    if (idx < 0) throw new Error('Receipt not found.');

    const receipt = receipts[idx];
    if (receipt.isReversed) throw new Error('Receipt is already reversed.');

    // Check if stock was already issued
    const issues = this.getFactoryIssues().filter((i) => !i.isReversed && i.coatingBatchCardNumber === receipt.coatingBatchCardNumber);
    if (issues.length > 0) {
      throw new Error(`Cannot reverse coating receipt! Issues have already been made from this batch (${receipt.coatingBatchCardNumber}). You must reverse or adjust downstream issues first.`);
    }

    receipts[idx] = {
      ...receipt,
      isReversed: true,
      reversedReason: reason.trim(),
      reversedAt: new Date().toISOString(),
      reversedBy: actor.id,
    };
    saveStorage(KEYS.COATING_RECEIPTS, receipts);

    this.addAuditLog(actor, 'REVERSE_COATING_RECEIPT', 'Coating Receiving', receipt.coatingBatchCardNumber, 'Active', 'Reversed', reason);
  }

  // Stock Calculations (Single Source of Truth)
  static getCoatingBatchStock(coatingBatchCardNumber: string): CoatingBatchStock | null {
    const receipts = this.getCoatingReceipts().filter((r) => !r.isReversed && r.coatingBatchCardNumber === coatingBatchCardNumber);
    if (receipts.length === 0) return null;

    const receipt = receipts[0];
    const issues = this.getFactoryIssues().filter((i) => !i.isReversed && i.coatingBatchCardNumber === coatingBatchCardNumber);

    let issuedToPrintingLine = 0;
    let issuedToCrownLine = 0;
    let issuedToPlant2 = 0;
    let issuedToPlant3 = 0;

    issues.forEach((i) => {
      if (i.destinationFactory === 'Printing Line') issuedToPrintingLine += i.issueQuantity;
      else if (i.destinationFactory === 'Crown Line') issuedToCrownLine += i.issueQuantity;
      else if (i.destinationFactory === 'Plant 2') issuedToPlant2 += i.issueQuantity;
      else if (i.destinationFactory === 'Plant 3') issuedToPlant3 += i.issueQuantity;
    });

    const totalIssuedQuantity = issuedToPrintingLine + issuedToCrownLine + issuedToPlant2 + issuedToPlant3;
    const remainingBalance = receipt.receivedQuantity - totalIssuedQuantity;

    return {
      jobId: receipt.jobId,
      jobNumber: receipt.jobNumber,
      jobName: receipt.jobName,
      coatingBatchCardNumber: receipt.coatingBatchCardNumber,
      itemId: receipt.itemId,
      itemCode: receipt.itemCode,
      itemName: receipt.itemName,
      sheetSize: receipt.sheetSize,
      coatingCombination: receipt.coatingCombination,
      sideConfiguration: receipt.sideConfiguration,
      receivedQuantity: receipt.receivedQuantity,
      issuedToPrintingLine,
      issuedToCrownLine,
      issuedToPlant2,
      issuedToPlant3,
      totalIssuedQuantity,
      remainingBalance,
      receiptDate: receipt.receivingDate,
    };
  }

  static getItemCoatingSummaries(): ItemCoatingStockSummary[] {
    const receipts = this.getCoatingReceipts().filter((r) => !r.isReversed);
    const itemMap = new Map<string, ItemCoatingStockSummary>();

    receipts.forEach((r) => {
      const bStock = this.getCoatingBatchStock(r.coatingBatchCardNumber);
      if (!bStock) return;

      if (!itemMap.has(r.itemCode)) {
        itemMap.set(r.itemCode, {
          itemCode: r.itemCode,
          itemName: r.itemName,
          sheetSize: r.sheetSize,
          totalReceivedQuantity: 0,
          totalIssuedQuantity: 0,
          currentCoatingStock: 0,
          activeCoatingBatchCount: 0,
          batches: [],
        });
      }

      const summary = itemMap.get(r.itemCode)!;
      summary.totalReceivedQuantity += bStock.receivedQuantity;
      summary.totalIssuedQuantity += bStock.totalIssuedQuantity;
      summary.currentCoatingStock += bStock.remainingBalance;
      if (bStock.remainingBalance > 0) {
        summary.activeCoatingBatchCount += 1;
      }
      summary.batches.push(bStock);
    });

    return Array.from(itemMap.values());
  }

  static getPrintingBatchStock(printingBatchCardNumber: string): PrintingBatchStock | null {
    const issues = this.getFactoryIssues().filter((i) => !i.isReversed && i.isPrintingLine && i.printingBatchCardNumber === printingBatchCardNumber);
    if (issues.length === 0) return null;

    const baseIssue = issues[0];
    const totalIssuedToLine = issues.reduce((sum, i) => sum + i.issueQuantity, 0);

    const qualityReturns = this.getQualityReturns().filter((q) => q.printingBatchCardNumber === printingBatchCardNumber);
    const approvedReturns = qualityReturns.filter((q) => q.status === 'Approved');
    const pendingReturns = qualityReturns.filter((q) => q.status === 'Submitted');

    const goodApproved = approvedReturns.reduce((sum, q) => sum + q.goodQuantity, 0);
    const rejectedApproved = approvedReturns.reduce((sum, q) => sum + q.rejectedQuantity, 0);
    const totalApprovedReturned = goodApproved + rejectedApproved;
    const pendingReturnQty = pendingReturns.reduce((sum, q) => sum + q.totalReturnedQuantity, 0);

    // Final Factory Issues from Approved Good Printing Stock
    const finalIssues = this.getFactoryIssues().filter(
      (i) => !i.isReversed && i.issueType === 'Approved Printed Sheet Issue' && i.printingBatchCardNumber === printingBatchCardNumber
    );
    const finalIssuedQty = finalIssues.reduce((sum, i) => sum + i.issueQuantity, 0);

    const outstandingPrintingWIP = Math.max(0, totalIssuedToLine - totalApprovedReturned);
    const approvedGoodPrintingStock = Math.max(0, goodApproved - finalIssuedQty);
    const remainingGoodPrintingStock = approvedGoodPrintingStock;

    return {
      jobId: baseIssue.jobId,
      jobNumber: baseIssue.jobNumber,
      jobName: baseIssue.jobName,
      printingBatchCardNumber,
      originalCoatingBatchCardNumber: baseIssue.coatingBatchCardNumber,
      itemId: baseIssue.itemId,
      itemCode: baseIssue.itemCode,
      itemName: baseIssue.itemName,
      sheetSize: baseIssue.sheetSize,
      coatingCombination: baseIssue.coatingCombination,
      sideConfiguration: baseIssue.sideConfiguration,
      printingLineIssueQuantity: totalIssuedToLine,
      goodQuantityReturnedApproved: goodApproved,
      rejectedQuantityReturnedApproved: rejectedApproved,
      totalApprovedReturnedQuantity: totalApprovedReturned,
      outstandingPrintingWIP,
      pendingReturnQuantity: pendingReturnQty,
      approvedGoodPrintingStock,
      rejectedPrintingStock: rejectedApproved,
      finalFactoryIssuedQuantity: finalIssuedQty,
      remainingGoodPrintingStock,
      issueDate: baseIssue.issueDate,
    };
  }

  static getAllPrintingBatchStocks(): PrintingBatchStock[] {
    const issues = this.getFactoryIssues().filter((i) => !i.isReversed && i.isPrintingLine && i.printingBatchCardNumber);
    const pBatches = Array.from(new Set(issues.map((i) => i.printingBatchCardNumber!)));
    const results: PrintingBatchStock[] = [];
    pBatches.forEach((pb) => {
      const stock = this.getPrintingBatchStock(pb);
      if (stock) results.push(stock);
    });
    return results;
  }

  // Audit Logs
  static getAuditLogs(): AuditLogEntry[] {
    return loadStorage<AuditLogEntry[]>(KEYS.AUDIT_LOGS, []);
  }

  static addAuditLog(
    user: UserAccount,
    action: string,
    module: string,
    recordReference: string,
    previousValue?: string,
    newValue?: string,
    reason?: string
  ): void {
    const logs = this.getAuditLogs();
    const entry: AuditLogEntry = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action,
      module,
      recordReference,
      previousValue,
      newValue,
      reason,
      timestamp: new Date().toISOString(),
    };
    logs.unshift(entry);
    if (logs.length > 500) logs.pop();
    saveStorage(KEYS.AUDIT_LOGS, logs);
  }
}
