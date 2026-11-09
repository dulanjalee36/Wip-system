/**
 * UNIMAK WIP STOCK MANAGEMENT SYSTEM
 * Top Navigation Header with Dark Mode Toggle, Search, and Session Controls
 */

import React, { useState } from 'react';
import {
  Search,
  Moon,
  Sun,
  Bell,
  Shield,
  UserCheck,
  CheckCircle2,
  Database,
  Building,
  ArrowRight,
  Menu,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Header: React.FC = () => {
  const {
    theme,
    toggleDarkMode,
    currentUser,
    allUsers,
    switchUser,
    sidebarOpen,
    toggleSidebar,
    qualityReturns,
    setActivePage,
    setInspectedBatchCard,
    coatingReceipts,
    factoryIssues,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Pending returns count
  const pendingApprovals = qualityReturns.filter((q) => q.status === 'Submitted');

  // Search Results computation
  const filteredResults = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q || q.length < 2) return [];

    const results: { type: string; title: string; subtitle: string; batchCard?: string }[] = [];

    // Coating Batches
    coatingReceipts.forEach((cr) => {
      if (
        cr.coatingBatchCardNumber.toLowerCase().includes(q) ||
        cr.jobNumber.toLowerCase().includes(q) ||
        cr.itemCode.toLowerCase().includes(q)
      ) {
        results.push({
          type: 'Coating Batch',
          title: `Coating Batch: ${cr.coatingBatchCardNumber}`,
          subtitle: `Job: ${cr.jobNumber} | Item: ${cr.itemCode} (${cr.receivedQuantity} sheets)`,
          batchCard: cr.coatingBatchCardNumber,
        });
      }
    });

    // Printing Batches
    factoryIssues.forEach((fi) => {
      if (
        fi.printingBatchCardNumber &&
        (fi.printingBatchCardNumber.toLowerCase().includes(q) ||
          fi.jobNumber.toLowerCase().includes(q) ||
          fi.itemCode.toLowerCase().includes(q))
      ) {
        if (!results.find((r) => r.batchCard === fi.printingBatchCardNumber)) {
          results.push({
            type: 'Printing Batch',
            title: `Printing Batch: ${fi.printingBatchCardNumber}`,
            subtitle: `Job: ${fi.jobNumber} | Line Issue: ${fi.issueQuantity} sheets`,
            batchCard: fi.printingBatchCardNumber,
          });
        }
      }
    });

    return results.slice(0, 8);
  }, [searchQuery, coatingReceipts, factoryIssues]);

  const handleSelectResult = (batchCard?: string) => {
    if (batchCard) {
      setInspectedBatchCard(batchCard);
    }
    setShowSearchResults(false);
    setSearchQuery('');
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors shadow-xs">
      {/* Left: Mobile hamburger & Title badge */}
      <div className="flex items-center space-x-3">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center space-x-2">
          <span className="text-xs font-bold tracking-wide uppercase px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-700/50">
            Manufacturing WIP
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Unimak (Pvt) Ltd - Tinplate Decorating Division
          </span>
        </div>
      </div>

      {/* Center: Global Search Bar */}
      <div className="relative flex-1 max-w-md mx-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchResults(true);
            }}
            onFocus={() => setShowSearchResults(true)}
            placeholder="Search Batch Card, Job No, Item Code..."
            className="w-full pl-9 pr-4 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-colors"
          />
        </div>

        {/* Search Results Dropdown */}
        {showSearchResults && searchQuery.trim().length >= 2 && (
          <div className="absolute left-0 right-0 top-full mt-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden z-50">
            <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <span>Matching Batches & Records</span>
              <button
                onClick={() => setShowSearchResults(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Close
              </button>
            </div>
            <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              {filteredResults.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500 dark:text-slate-400">
                  No batch card or record matches "{searchQuery}"
                </div>
              ) : (
                filteredResults.map((res, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelectResult(res.batchCard)}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-blue-50 dark:hover:bg-blue-950/40 flex items-center justify-between transition-colors group"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300">
                          {res.type}
                        </span>
                        <span className="text-xs font-semibold text-slate-900 dark:text-white">
                          {res.title}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {res.subtitle}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Right: Controls & Profile */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Dark Mode Toggle Button */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-700"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          aria-label="Toggle dark mode"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-blue-600" />
          )}
        </button>

        {/* Pending QA Approvals Bell */}
        <button
          onClick={() => setActivePage('quality-return')}
          className="relative p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-700"
          title={`${pendingApprovals.length} Quality Returns pending approval`}
        >
          <Bell className="w-4 h-4" />
          {pendingApprovals.length > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-white shadow-xs">
              {pendingApprovals.length}
            </span>
          )}
        </button>

        {/* Role Quick Switcher & User Profile */}
        <div className="relative">
          <button
            onClick={() => setShowUserDropdown((prev) => !prev)}
            className="flex items-center space-x-2 p-1.5 sm:px-3 sm:py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-left"
          >
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
              {currentUser.name.charAt(0)}
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">
                {currentUser.name}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                {currentUser.role}
              </span>
            </div>
          </button>

          {/* Quick Role Switcher Menu */}
          {showUserDropdown && (
            <div className="absolute right-0 top-full mt-1.5 w-64 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-50">
              <div className="px-2 py-1.5 border-b border-slate-100 dark:border-slate-800 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Switch Active Role (RBAC)
                </span>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Test operations under different authorized permissions
                </p>
              </div>

              {allUsers.map((u) => {
                const isSelected = u.id === currentUser.id;
                return (
                  <button
                    key={u.id}
                    onClick={() => {
                      switchUser(u.id);
                      setShowUserDropdown(false);
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center justify-between text-xs transition-colors mb-0.5 ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div>
                      <div className="font-medium text-slate-900 dark:text-white">{u.name}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        {u.role} - {u.email}
                      </div>
                    </div>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
