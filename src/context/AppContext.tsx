/**
 * UNIMAK WIP STOCK MANAGEMENT SYSTEM
 * Central Application Context & State Provider
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
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
import { UnimakStockEngine, DEFAULT_SETTINGS } from '../lib/supabase';

export type NavigationPage =
  | 'dashboard'
  | 'master-data'
  | 'coating-receiving'
  | 'issuing'
  | 'quality-return'
  | 'coating-summary'
  | 'printing-stock'
  | 'reports'
  | 'settings';

interface AppContextType {
  // Navigation & UI
  activePage: NavigationPage;
  setActivePage: (page: NavigationPage) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;

  // Theme & Dark Mode
  theme: 'dark' | 'light' | 'system';
  setTheme: (theme: 'dark' | 'light' | 'system') => void;
  toggleDarkMode: () => void;

  // User & Auth
  currentUser: UserAccount;
  allUsers: UserAccount[];
  switchUser: (userId: string) => void;
  saveUser: (user: UserAccount) => void;

  // App Settings
  settings: AppSettings;
  updateSettings: (settings: AppSettings) => void;

  // Master Data
  jobs: JobMaster[];
  items: ItemMaster[];
  sheetSizes: SheetSizeMaster[];
  coatingTypes: CoatingTypeMaster[];
  factories: FactoryMaster[];
  saveJob: (job: JobMaster) => void;
  saveItem: (item: ItemMaster) => void;
  saveSheetSize: (size: SheetSizeMaster) => void;
  saveCoatingType: (type: CoatingTypeMaster) => void;
  saveFactory: (factory: FactoryMaster) => void;

  // Transactions
  coatingReceipts: CoatingReceipt[];
  factoryIssues: FactoryIssue[];
  qualityReturns: QualityReturn[];
  auditLogs: AuditLogEntry[];

  // Action methods
  postCoatingReceipt: (
    data: Omit<CoatingReceipt, 'id' | 'receiptNumber' | 'createdAt' | 'createdBy' | 'createdByName'>
  ) => CoatingReceipt;
  reverseCoatingReceipt: (receiptId: string, reason: string) => void;
  postFactoryIssue: (
    data: Omit<FactoryIssue, 'id' | 'issueNumber' | 'createdAt' | 'createdBy' | 'createdByName'>
  ) => FactoryIssue;
  saveQualityReturn: (
    data: Omit<QualityReturn, 'id' | 'returnNumber' | 'createdAt' | 'updatedAt' | 'submittedBy' | 'submittedByName' | 'status'> & {
      id?: string;
      status: 'Draft' | 'Submitted';
    }
  ) => QualityReturn;
  approveQualityReturn: (returnId: string) => QualityReturn;
  returnQualityForCorrection: (returnId: string, reason: string) => QualityReturn;

  // Stock Summaries & Lookups
  itemCoatingSummaries: ItemCoatingStockSummary[];
  allPrintingBatchStocks: PrintingBatchStock[];
  getCoatingBatchStock: (batchCard: string) => CoatingBatchStock | null;
  getPrintingBatchStock: (batchCard: string) => PrintingBatchStock | null;

  // Global Traceability Modal
  inspectedBatchCard: string | null;
  setInspectedBatchCard: (batchCard: string | null) => void;

  // Notifications
  notification: { message: string; type: 'success' | 'error' | 'info' } | null;
  showNotification: (message: string, type?: 'success' | 'error' | 'info') => void;
  clearNotification: () => void;

  // Refresh
  refreshData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activePage, setActivePage] = useState<NavigationPage>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Theme State
  const [theme, setThemeState] = useState<'dark' | 'light' | 'system'>(() => {
    const saved = localStorage.getItem('unimak_theme');
    if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;
    return 'dark'; // Dark theme default as requested
  });

  // Apply Dark class to root
  useEffect(() => {
    const root = document.documentElement;
    const isDark =
      theme === 'dark' ||
      (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('unimak_theme', theme);
  }, [theme]);

  const setTheme = (newTheme: 'dark' | 'light' | 'system') => {
    setThemeState(newTheme);
  };

  const toggleDarkMode = () => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // State slices
  const [currentUser, setCurrentUser] = useState<UserAccount>(() => UnimakStockEngine.getCurrentUser());
  const [allUsers, setAllUsers] = useState<UserAccount[]>(() => UnimakStockEngine.getUsers());
  const [settings, setSettings] = useState<AppSettings>(() => UnimakStockEngine.getSettings());

  const [jobs, setJobs] = useState<JobMaster[]>(() => UnimakStockEngine.getJobs());
  const [items, setItems] = useState<ItemMaster[]>(() => UnimakStockEngine.getItems());
  const [sheetSizes, setSheetSizes] = useState<SheetSizeMaster[]>(() => UnimakStockEngine.getSheetSizes());
  const [coatingTypes, setCoatingTypes] = useState<CoatingTypeMaster[]>(() => UnimakStockEngine.getCoatingTypes());
  const [factories, setFactories] = useState<FactoryMaster[]>(() => UnimakStockEngine.getFactories());

  const [coatingReceipts, setCoatingReceipts] = useState<CoatingReceipt[]>(() =>
    UnimakStockEngine.getCoatingReceipts()
  );
  const [factoryIssues, setFactoryIssues] = useState<FactoryIssue[]>(() => UnimakStockEngine.getFactoryIssues());
  const [qualityReturns, setQualityReturns] = useState<QualityReturn[]>(() =>
    UnimakStockEngine.getQualityReturns()
  );
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => UnimakStockEngine.getAuditLogs());

  // Global Traceability modal batch
  const [inspectedBatchCard, setInspectedBatchCard] = useState<string | null>(null);

  // Notification Toast
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  const showNotification = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ message, type });
  }, []);

  const clearNotification = useCallback(() => {
    setNotification(null);
  }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Refresh helper
  const refreshData = useCallback(() => {
    setJobs(UnimakStockEngine.getJobs());
    setItems(UnimakStockEngine.getItems());
    setSheetSizes(UnimakStockEngine.getSheetSizes());
    setCoatingTypes(UnimakStockEngine.getCoatingTypes());
    setFactories(UnimakStockEngine.getFactories());
    setCoatingReceipts(UnimakStockEngine.getCoatingReceipts());
    setFactoryIssues(UnimakStockEngine.getFactoryIssues());
    setQualityReturns(UnimakStockEngine.getQualityReturns());
    setAuditLogs(UnimakStockEngine.getAuditLogs());
    setAllUsers(UnimakStockEngine.getUsers());
  }, []);

  // Auth & User switching
  const switchUser = (userId: string) => {
    const user = UnimakStockEngine.setCurrentUser(userId);
    setCurrentUser(user);
    refreshData();
    showNotification(`Switched active session to: ${user.name} (${user.role})`, 'info');
  };

  const saveUser = (user: UserAccount) => {
    try {
      UnimakStockEngine.saveUser(user, currentUser);
      refreshData();
      showNotification(`User ${user.email} saved successfully`, 'success');
    } catch (err: any) {
      showNotification(err.message || 'Failed to save user', 'error');
      throw err;
    }
  };

  const updateSettings = (newSettings: AppSettings) => {
    try {
      UnimakStockEngine.saveSettings(newSettings, currentUser);
      setSettings(newSettings);
      refreshData();
      showNotification('Settings updated successfully', 'success');
    } catch (err: any) {
      showNotification(err.message || 'Failed to update settings', 'error');
      throw err;
    }
  };

  // Master Data Actions
  const handleSaveJob = (job: JobMaster) => {
    try {
      UnimakStockEngine.saveJob(job, currentUser);
      refreshData();
      showNotification(`Job "${job.jobNumber}" saved successfully`, 'success');
    } catch (err: any) {
      showNotification(err.message || 'Error saving job', 'error');
      throw err;
    }
  };

  const handleSaveItem = (item: ItemMaster) => {
    try {
      UnimakStockEngine.saveItem(item, currentUser);
      refreshData();
      showNotification(`Item "${item.itemCode}" saved successfully`, 'success');
    } catch (err: any) {
      showNotification(err.message || 'Error saving item', 'error');
      throw err;
    }
  };

  const handleSaveSheetSize = (size: SheetSizeMaster) => {
    try {
      UnimakStockEngine.saveSheetSize(size, currentUser);
      refreshData();
      showNotification(`Sheet size "${size.size}" updated`, 'success');
    } catch (err: any) {
      showNotification(err.message, 'error');
      throw err;
    }
  };

  const handleSaveCoatingType = (cType: CoatingTypeMaster) => {
    try {
      UnimakStockEngine.saveCoatingType(cType, currentUser);
      refreshData();
      showNotification(`Coating type "${cType.name}" updated`, 'success');
    } catch (err: any) {
      showNotification(err.message, 'error');
      throw err;
    }
  };

  const handleSaveFactory = (factory: FactoryMaster) => {
    try {
      UnimakStockEngine.saveFactory(factory, currentUser);
      refreshData();
      showNotification(`Factory "${factory.name}" updated`, 'success');
    } catch (err: any) {
      showNotification(err.message, 'error');
      throw err;
    }
  };

  // Transaction Actions
  const postCoatingReceipt = (
    data: Omit<CoatingReceipt, 'id' | 'receiptNumber' | 'createdAt' | 'createdBy' | 'createdByName'>
  ) => {
    try {
      const created = UnimakStockEngine.postCoatingReceipt(data, currentUser);
      refreshData();
      showNotification(`Coating Batch ${created.coatingBatchCardNumber} recorded (${created.receivedQuantity.toLocaleString()} sheets)`, 'success');
      return created;
    } catch (err: any) {
      showNotification(err.message || 'Error recording coating receipt', 'error');
      throw err;
    }
  };

  const reverseCoatingReceipt = (receiptId: string, reason: string) => {
    try {
      UnimakStockEngine.reverseCoatingReceipt(receiptId, reason, currentUser);
      refreshData();
      showNotification('Coating receipt reversed with audit reason', 'info');
    } catch (err: any) {
      showNotification(err.message || 'Failed to reverse receipt', 'error');
      throw err;
    }
  };

  const postFactoryIssue = (
    data: Omit<FactoryIssue, 'id' | 'issueNumber' | 'createdAt' | 'createdBy' | 'createdByName'>
  ) => {
    try {
      const created = UnimakStockEngine.postFactoryIssue(data, currentUser);
      refreshData();
      showNotification(
        `Issued ${created.issueQuantity.toLocaleString()} sheets to ${created.destinationFactory} (${created.issueNumber})`,
        'success'
      );
      return created;
    } catch (err: any) {
      showNotification(err.message || 'Error processing factory issue', 'error');
      throw err;
    }
  };

  const saveQualityReturn = (
    data: Omit<QualityReturn, 'id' | 'returnNumber' | 'createdAt' | 'updatedAt' | 'submittedBy' | 'submittedByName' | 'status'> & {
      id?: string;
      status: 'Draft' | 'Submitted';
    }
  ) => {
    try {
      const saved = UnimakStockEngine.saveQualityReturn(data, currentUser);
      refreshData();
      showNotification(
        `Quality Return ${saved.returnNumber} ${saved.status === 'Submitted' ? 'submitted for Admin approval' : 'saved as Draft'}`,
        'success'
      );
      return saved;
    } catch (err: any) {
      showNotification(err.message || 'Error saving quality return', 'error');
      throw err;
    }
  };

  const approveQualityReturn = (returnId: string) => {
    try {
      const approved = UnimakStockEngine.approveQualityReturn(returnId, currentUser);
      refreshData();
      showNotification(
        `Quality Return ${approved.returnNumber} approved into stock (${approved.goodQuantity.toLocaleString()} Good, ${approved.rejectedQuantity.toLocaleString()} Rejected)`,
        'success'
      );
      return approved;
    } catch (err: any) {
      showNotification(err.message || 'Error approving quality return', 'error');
      throw err;
    }
  };

  const returnQualityForCorrection = (returnId: string, reason: string) => {
    try {
      const returned = UnimakStockEngine.returnQualityForCorrection(returnId, reason, currentUser);
      refreshData();
      showNotification(`Quality Return ${returned.returnNumber} returned for correction`, 'info');
      return returned;
    } catch (err: any) {
      showNotification(err.message || 'Error returning record', 'error');
      throw err;
    }
  };

  // Stock Summaries derived with memoization
  const itemCoatingSummaries = useMemo(() => {
    return UnimakStockEngine.getItemCoatingSummaries();
  }, [coatingReceipts, factoryIssues]);

  const allPrintingBatchStocks = useMemo(() => {
    return UnimakStockEngine.getAllPrintingBatchStocks();
  }, [factoryIssues, qualityReturns]);

  const getCoatingBatchStock = useCallback((batchCard: string) => {
    return UnimakStockEngine.getCoatingBatchStock(batchCard);
  }, [coatingReceipts, factoryIssues]);

  const getPrintingBatchStock = useCallback((batchCard: string) => {
    return UnimakStockEngine.getPrintingBatchStock(batchCard);
  }, [factoryIssues, qualityReturns]);

  return (
    <AppContext.Provider
      value={{
        activePage,
        setActivePage,
        sidebarOpen,
        setSidebarOpen,
        toggleSidebar: () => setSidebarOpen((prev) => !prev),
        theme,
        setTheme,
        toggleDarkMode,
        currentUser,
        allUsers,
        switchUser,
        saveUser,
        settings,
        updateSettings,
        jobs,
        items,
        sheetSizes,
        coatingTypes,
        factories,
        saveJob: handleSaveJob,
        saveItem: handleSaveItem,
        saveSheetSize: handleSaveSheetSize,
        saveCoatingType: handleSaveCoatingType,
        saveFactory: handleSaveFactory,
        coatingReceipts,
        factoryIssues,
        qualityReturns,
        auditLogs,
        postCoatingReceipt,
        reverseCoatingReceipt,
        postFactoryIssue,
        saveQualityReturn,
        approveQualityReturn,
        returnQualityForCorrection,
        itemCoatingSummaries,
        allPrintingBatchStocks,
        getCoatingBatchStock,
        getPrintingBatchStock,
        inspectedBatchCard,
        setInspectedBatchCard,
        notification,
        showNotification,
        clearNotification,
        refreshData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
