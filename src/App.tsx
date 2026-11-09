/**
 * UNIMAK WIP STOCK MANAGEMENT SYSTEM
 * Company: Unimak (Pvt) Ltd - Metal Packaging Manufacturing
 * Main Application Orchestrator
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { NotificationToast } from './components/layout/NotificationToast';
import { BatchHistoryModal } from './components/batch-tracking/BatchHistoryModal';
import { DashboardView } from './components/dashboard/DashboardView';
import { MasterDataView } from './components/master-data/MasterDataView';
import { CoatingReceivingView } from './components/coating/CoatingReceivingView';
import { IssuingView } from './components/issuing/IssuingView';
import { QualityReturnView } from './components/quality/QualityReturnView';
import { CoatingStockSummaryView } from './components/coating-summary/CoatingStockSummaryView';
import { PrintingStockView } from './components/printing-stock/PrintingStockView';
import { ReportsView } from './components/reports/ReportsView';
import { SettingsView } from './components/settings/SettingsView';

const AppContent: React.FC = () => {
  const { activePage, sidebarOpen } = useApp();

  const renderActiveView = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardView />;
      case 'master-data':
        return <MasterDataView />;
      case 'coating-receiving':
        return <CoatingReceivingView />;
      case 'issuing':
        return <IssuingView />;
      case 'quality-return':
        return <QualityReturnView />;
      case 'coating-summary':
        return <CoatingStockSummaryView />;
      case 'printing-stock':
        return <PrintingStockView />;
      case 'reports':
        return <ReportsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex transition-colors duration-200">
      {/* Primary Mandated Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out ${
          sidebarOpen ? 'md:ml-64' : 'md:ml-20'
        }`}
      >
        <Header />

        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {renderActiveView()}
        </main>

        {/* Footer */}
        <footer className="py-4 px-6 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400 bg-white dark:bg-slate-900">
          <div className="flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto gap-2">
            <span>
              UNIMAK WIP STOCK MANAGEMENT SYSTEM &bull; Unimak (Pvt) Ltd &bull; Metal Packaging
            </span>
            <span className="font-mono text-[11px]">
              Single Source of Truth &bull; Supabase RLS &bull; High Precision Batch Traceability
            </span>
          </div>
        </footer>
      </div>

      {/* Global Modals & Notifications */}
      <BatchHistoryModal />
      <NotificationToast />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
