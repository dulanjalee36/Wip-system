/**
 * UNIMAK WIP STOCK MANAGEMENT SYSTEM
 * Primary Navigation Sidebar
 * Exact Order mandated by requirements:
 * 1. Dashboard
 * 2. Master Data
 * 3. Coating Receiving
 * 4. Issuing to Factories
 * 5. Quality Return
 * 6. Coating Stock Summary
 * 7. Printing Stock
 * 8. Settings
 * 9. Logout
 */

import React from 'react';
import {
  LayoutDashboard,
  Database,
  Layers,
  Send,
  RotateCcw,
  Boxes,
  Printer,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Building2,
  FileSpreadsheet,
} from 'lucide-react';
import { useApp, NavigationPage } from '../../context/AppContext';

export const Sidebar: React.FC = () => {
  const {
    activePage,
    setActivePage,
    sidebarOpen,
    toggleSidebar,
    currentUser,
    switchUser,
    allUsers,
    qualityReturns,
  } = useApp();

  // Pending returns count for badge on Quality Return menu
  const pendingApprovalsCount = qualityReturns.filter((q) => q.status === 'Submitted').length;

  const isQualityUser = currentUser.role === 'Quality Department';
  const isViewer = currentUser.role === 'Viewer';
  const isAdmin = currentUser.role === 'Administrator';

  // Navigation Items in exact mandated order
  const navItems = [
    {
      id: 'dashboard' as NavigationPage,
      label: 'Dashboard',
      icon: LayoutDashboard,
      allowed: true,
    },
    {
      id: 'master-data' as NavigationPage,
      label: 'Master Data',
      icon: Database,
      allowed: true,
      badge: isQualityUser ? 'Read Only' : undefined,
    },
    {
      id: 'coating-receiving' as NavigationPage,
      label: 'Coating Receiving',
      icon: Layers,
      allowed: !isQualityUser, // Quality user cannot create coating receipts
      disabledReason: isQualityUser ? 'Quality Department cannot access Coating Receiving' : undefined,
    },
    {
      id: 'issuing' as NavigationPage,
      label: 'Issuing to Factories',
      icon: Send,
      allowed: !isQualityUser, // Quality user cannot issue stock
      disabledReason: isQualityUser ? 'Quality Department cannot issue stock' : undefined,
    },
    {
      id: 'quality-return' as NavigationPage,
      label: 'Quality Return',
      icon: RotateCcw,
      allowed: true,
      badge: pendingApprovalsCount > 0 ? `${pendingApprovalsCount}` : undefined,
      badgeColor: 'bg-amber-500 text-white',
    },
    {
      id: 'coating-summary' as NavigationPage,
      label: 'Coating Stock Summary',
      icon: Boxes,
      allowed: true,
    },
    {
      id: 'printing-stock' as NavigationPage,
      label: 'Printing Stock',
      icon: Printer,
      allowed: true,
    },
    {
      id: 'settings' as NavigationPage,
      label: 'Settings',
      icon: Settings,
      allowed: true,
    },
  ];

  const handleLogout = () => {
    // Cycle or prompt login
    const otherUser = allUsers.find((u) => u.id !== currentUser.id);
    if (otherUser) {
      switchUser(otherUser.id);
    }
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex flex-col transition-all duration-300 ease-in-out border-r
        bg-slate-900 border-slate-800 text-slate-200
        ${sidebarOpen ? 'w-64' : 'w-20'}
      `}
    >
      {/* Brand & Logo Area */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800 bg-slate-950/60">
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-600 text-white font-bold text-lg shadow-inner shrink-0">
            U
          </div>
          {sidebarOpen && (
            <div className="flex flex-col truncate">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                Unimak (Pvt) Ltd
              </span>
              <span className="text-sm font-bold text-white truncate tracking-tight">
                WIP Stock System
              </span>
            </div>
          )}
        </div>
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title={sidebarOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
        >
          {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
      </div>

      {/* User Information Pill */}
      <div className={`p-3 border-b border-slate-800/80 bg-slate-900/50 ${sidebarOpen ? '' : 'text-center'}`}>
        <div className="flex items-center space-x-3">
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0
              ${
                isAdmin
                  ? 'bg-blue-600 text-white ring-2 ring-blue-400/40'
                  : isQualityUser
                  ? 'bg-amber-600 text-white ring-2 ring-amber-400/40'
                  : 'bg-emerald-600 text-white ring-2 ring-emerald-400/40'
              }
            `}
          >
            {currentUser.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2)
              .toUpperCase()}
          </div>
          {sidebarOpen && (
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-medium text-white truncate">{currentUser.name}</span>
              <span
                className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded w-fit mt-0.5 ${
                  isAdmin
                    ? 'bg-blue-900/60 text-blue-300 border border-blue-700/50'
                    : isQualityUser
                    ? 'bg-amber-900/60 text-amber-300 border border-amber-700/50'
                    : 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/50'
                }`}
              >
                {currentUser.role}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Mandated Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          const isAllowed = item.allowed;

          if (!isAllowed) {
            // Disabled or hidden item based on RBAC rules
            return (
              <div
                key={item.id}
                className="group relative flex items-center px-3 py-2.5 rounded-lg text-slate-600 cursor-not-allowed text-sm font-medium"
                title={item.disabledReason}
              >
                <Icon className="w-5 h-5 shrink-0 text-slate-600" />
                {sidebarOpen && <span className="ml-3 truncate">{item.label}</span>}
                {sidebarOpen && (
                  <span className="ml-auto text-[10px] bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded">
                    Restricted
                  </span>
                )}
              </div>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
              title={!sidebarOpen ? item.label : undefined}
            >
              <Icon
                className={`w-5 h-5 shrink-0 transition-colors ${
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'
                }`}
              />
              {sidebarOpen && <span className="ml-3 truncate">{item.label}</span>}

              {item.badge && sidebarOpen && (
                <span
                  className={`ml-auto px-2 py-0.5 text-xs font-bold rounded-full ${
                    item.badgeColor || 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Reports Navigation Link */}
        <button
          onClick={() => setActivePage('reports')}
          className={`w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative ${
            activePage === 'reports'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30 font-semibold'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
          }`}
          title={!sidebarOpen ? 'Reports & Exports' : undefined}
        >
          <FileSpreadsheet
            className={`w-5 h-5 shrink-0 transition-colors ${
              activePage === 'reports' ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'
            }`}
          />
          {sidebarOpen && <span className="ml-3 truncate">Reports & Exports</span>}
        </button>
      </nav>

      {/* 9. Logout in exact mandated order */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40">
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-rose-400 hover:text-rose-200 hover:bg-rose-950/40 transition-colors group"
          title="Switch User / Logout"
        >
          <LogOut className="w-5 h-5 shrink-0 text-rose-400 group-hover:text-rose-300" />
          {sidebarOpen && <span className="ml-3 font-medium">Switch / Logout</span>}
        </button>
      </div>
    </aside>
  );
};
