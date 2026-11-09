/**
 * UNIMAK WIP STOCK MANAGEMENT SYSTEM
 * Settings, RBAC User Management, Supabase Migration & Audit Log
 * Section 3, 16 & 18 Requirements
 */

import React, { useState } from 'react';
import {
  Settings,
  Users,
  Shield,
  Database,
  History,
  Copy,
  Check,
  Moon,
  Sun,
  Lock,
  UserPlus,
  CheckCircle2,
  XCircle,
  FileCode,
  Key,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserAccount, UserRole } from '../../types';

export const SettingsView: React.FC = () => {
  const {
    currentUser,
    allUsers,
    saveUser,
    settings,
    updateSettings,
    auditLogs,
    theme,
    setTheme,
    toggleDarkMode,
  } = useApp();

  const isAdmin = currentUser.role === 'Administrator';

  const [activeTab, setActiveTab] = useState<'users' | 'system' | 'supabase' | 'audit'>('users');

  // User Creation Modal State
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    role: 'Viewer' as UserRole,
    department: 'Manufacturing',
    canExportReports: false,
    active: true,
  });

  // Supabase connection state
  const [supabaseUrl, setSupabaseUrl] = useState(settings.supabaseUrl || '');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(settings.supabaseAnonKey || '');
  const [useLiveSupabase, setUseLiveSupabase] = useState(settings.useLiveSupabase || false);

  // SQL Copy feedback
  const [copiedSql, setCopiedSql] = useState(false);

  const handleOpenUserModal = (u?: UserAccount) => {
    if (u) {
      setEditingUser(u);
      setUserForm({
        name: u.name,
        email: u.email,
        role: u.role,
        department: u.department,
        canExportReports: u.canExportReports,
        active: u.active,
      });
    } else {
      setEditingUser(null);
      setUserForm({
        name: '',
        email: '',
        role: 'Viewer',
        department: 'Manufacturing',
        canExportReports: false,
        active: true,
      });
    }
    setShowUserModal(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForm.email.trim() || !userForm.name.trim()) return;

    saveUser({
      id: editingUser?.id || `usr-${Date.now()}`,
      name: userForm.name.trim(),
      email: userForm.email.trim().toLowerCase(),
      role: userForm.role,
      department: userForm.department.trim(),
      canExportReports: userForm.role === 'Viewer' ? userForm.canExportReports : true,
      active: userForm.active,
      createdAt: editingUser?.createdAt || new Date().toISOString(),
    });
    setShowUserModal(false);
  };

  const handleSaveSupabaseConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      ...settings,
      supabaseUrl: supabaseUrl.trim(),
      supabaseAnonKey: supabaseAnonKey.trim(),
      useLiveSupabase,
    });
  };

  const handleCopySQL = () => {
    const sqlText = `-- UNIMAK WIP STOCK MANAGEMENT SYSTEM
-- SUPABASE POSTGRESQL PRODUCTION DATABASE SCHEMA & ATOMIC PROCEDURES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_number VARCHAR(100) UNIQUE NOT NULL,
    job_name VARCHAR(255) NOT NULL,
    customer_name VARCHAR(255),
    description TEXT,
    active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_code VARCHAR(100) UNIQUE NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    sheet_size VARCHAR(100) NOT NULL,
    unit_of_measure VARCHAR(50) DEFAULT 'Sheets' NOT NULL,
    active BOOLEAN DEFAULT TRUE NOT NULL
);

CREATE TABLE IF NOT EXISTS public.coating_receipts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    receipt_number VARCHAR(100) UNIQUE NOT NULL,
    receiving_date DATE NOT NULL,
    job_number VARCHAR(100) NOT NULL,
    coating_batch_card_number VARCHAR(100) UNIQUE NOT NULL,
    item_code VARCHAR(100) NOT NULL,
    sheet_size VARCHAR(100) NOT NULL,
    coating_combination VARCHAR(255) NOT NULL,
    side_configuration VARCHAR(20) DEFAULT 'Single' NOT NULL,
    received_quantity INT NOT NULL CHECK (received_quantity > 0),
    is_reversed BOOLEAN DEFAULT FALSE NOT NULL
);

CREATE TABLE IF NOT EXISTS public.factory_issues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    issue_number VARCHAR(100) UNIQUE NOT NULL,
    issue_type VARCHAR(50) NOT NULL,
    issue_date DATE NOT NULL,
    destination_factory VARCHAR(100) NOT NULL,
    is_printing_line BOOLEAN DEFAULT FALSE NOT NULL,
    job_number VARCHAR(100) NOT NULL,
    item_code VARCHAR(100) NOT NULL,
    coating_batch_card_number VARCHAR(100) NOT NULL,
    printing_batch_card_number VARCHAR(100),
    issue_quantity INT NOT NULL CHECK (issue_quantity > 0),
    is_reversed BOOLEAN DEFAULT FALSE NOT NULL
);

CREATE TABLE IF NOT EXISTS public.quality_returns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    return_number VARCHAR(100) UNIQUE NOT NULL,
    return_date DATE NOT NULL,
    printing_batch_card_number VARCHAR(100) NOT NULL,
    item_code VARCHAR(100) NOT NULL,
    good_quantity INT NOT NULL CHECK (good_quantity >= 0),
    rejected_quantity INT NOT NULL CHECK (rejected_quantity >= 0),
    total_returned_quantity INT NOT NULL CHECK (total_returned_quantity > 0),
    status VARCHAR(50) DEFAULT 'Draft' NOT NULL
);
-- Refer to /supabase/migrations/001_initial_schema.sql for atomic RPC procedures and RLS policies!`;

    navigator.clipboard.writeText(sqlText);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              System Settings & Administration
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-700/50">
              Control Panel
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage user roles (RBAC), Supabase database credentials, theme styling, and audit records.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center border-b border-slate-200 dark:border-slate-800 space-x-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center py-3 px-1 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'users'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <Users className="w-4 h-4 mr-2" />
          User Management ({allUsers.length})
        </button>

        <button
          onClick={() => setActiveTab('system')}
          className={`flex items-center py-3 px-1 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'system'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <Settings className="w-4 h-4 mr-2" />
          Appearance & System Parameters
        </button>

        <button
          onClick={() => setActiveTab('supabase')}
          className={`flex items-center py-3 px-1 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'supabase'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <Database className="w-4 h-4 mr-2" />
          Supabase Database & Migrations
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center py-3 px-1 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'audit'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <History className="w-4 h-4 mr-2" />
          Audit Logs ({auditLogs.length})
        </button>
      </div>

      {/* TAB 1: USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-850">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Authorized User Accounts (RBAC)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Administrator, Quality Department, and Viewer roles
              </p>
            </div>
            {isAdmin && (
              <button
                onClick={() => handleOpenUserModal()}
                className="flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-xs transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                Add User Account
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">User Name</th>
                  <th className="px-4 py-3">Email Address</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Report Export Permission</th>
                  <th className="px-4 py-3">Account Status</th>
                  {isAdmin && <th className="px-4 py-3 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {allUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                      {u.name}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-300">
                      {u.email}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.role === 'Administrator'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300'
                            : u.role === 'Quality Department'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{u.department}</td>
                    <td className="px-4 py-3">
                      {u.canExportReports ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                          Allowed
                        </span>
                      ) : (
                        <span className="text-slate-400">Restricted</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {u.active ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[10px] flex items-center">
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Active
                        </span>
                      ) : (
                        <span className="text-rose-500 font-bold text-[10px] flex items-center">
                          <XCircle className="w-3.5 h-3.5 mr-1" /> Deactivated
                        </span>
                      )}
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleOpenUserModal(u)}
                          className="px-2 py-1 rounded text-[10px] font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                        >
                          Edit Account
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: SYSTEM & APPEARANCE */}
      {activeTab === 'system' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Dark Mode & Theme Card */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <Moon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Display Theme & Dark Mode
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Choose your preferred visual mode. Dark Mode provides high-contrast industrial readability for manufacturing environments.
            </p>

            <div className="grid grid-cols-3 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  theme === 'light'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/50 font-bold text-blue-700'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Sun className="w-5 h-5 mx-auto mb-1 text-amber-500" />
                <span className="text-xs">Light Mode</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  theme === 'dark'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/50 font-bold text-blue-400'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Moon className="w-5 h-5 mx-auto mb-1 text-blue-400" />
                <span className="text-xs">Dark Mode</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme('system')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  theme === 'system'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/50 font-bold text-blue-600'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Settings className="w-5 h-5 mx-auto mb-1 text-slate-400" />
                <span className="text-xs">System Auto</span>
              </button>
            </div>
          </div>

          {/* Company & Division Details */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Manufacturing Organization
              </h3>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block font-semibold">Company Name:</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">
                  {settings.companyName}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">System Title:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {settings.systemTitle}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Manufacturing Division:</span>
                <span className="text-slate-600 dark:text-slate-300">{settings.companyAddress}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SUPABASE DATABASE */}
      {activeTab === 'supabase' && (
        <div className="space-y-6">
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <Database className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Supabase PostgreSQL Single Source of Truth
                </h3>
              </div>
              <button
                onClick={handleCopySQL}
                className="flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-xs transition-colors"
              >
                {copiedSql ? (
                  <>
                    <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-300" />
                    SQL Copied to Clipboard!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 mr-1.5" />
                    Copy SQL Migration Script
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              The application provides complete SQL schema, RLS policies, tables, constraints and atomic stored procedures in{' '}
              <code className="text-blue-600 dark:text-blue-400 font-mono">
                /supabase/migrations/001_initial_schema.sql
              </code>
              . You can paste your Supabase Project URL and Public Anon Key below to connect your remote database.
            </p>

            <form onSubmit={handleSaveSupabaseConfig} className="space-y-3 text-xs max-w-xl">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Supabase Project URL
                </label>
                <input
                  type="text"
                  placeholder="https://xyzcompany.supabase.co"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Supabase Anon Key (Public Client Key)
                </label>
                <input
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={supabaseAnonKey}
                  onChange={(e) => setSupabaseAnonKey(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="liveSupabase"
                  checked={useLiveSupabase}
                  onChange={(e) => setUseLiveSupabase(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <label htmlFor="liveSupabase" className="font-semibold text-slate-700 dark:text-slate-300">
                  Enable live remote sync with Supabase project
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-500 text-white"
                >
                  Save Connection Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Immutable System Audit Log
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Records all user logins, master data modifications, stock receipts, factory issues, and quality returns
            </p>
          </div>

          <div className="overflow-x-auto max-h-[500px]">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800 sticky top-0">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Module</th>
                  <th className="px-4 py-3">Record Reference</th>
                  <th className="px-4 py-3">Reason / Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-2.5 font-mono text-slate-400">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-2.5 font-medium text-slate-900 dark:text-white">
                      {log.userName}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 font-medium">
                        {log.userRole}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 font-mono font-bold text-blue-600 dark:text-blue-400">
                      {log.action}
                    </td>
                    <td className="px-4 py-2.5 text-slate-600 dark:text-slate-300">{log.module}</td>
                    <td className="px-4 py-2.5 font-mono text-slate-800 dark:text-slate-200">
                      {log.recordReference}
                    </td>
                    <td className="px-4 py-2.5 text-slate-500 max-w-sm truncate">
                      {log.reason || log.newValue || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* USER MODAL */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <form
            onSubmit={handleSaveUser}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95"
          >
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-850">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                {editingUser ? 'Edit User Account' : 'Provision User Account'}
              </h3>
              <button
                type="button"
                onClick={() => setShowUserModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Priyanga Jayawardena"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address * (Username)
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. p.jayawardena@unimak.lk"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Assigned Role (RBAC) *
                </label>
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value as UserRole })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                >
                  <option value="Quality Department">Quality Department (QA Submissions)</option>
                  <option value="Viewer">Viewer (Read-Only Access)</option>
                  <option value="Administrator">Administrator (Full Access)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  value={userForm.department}
                  onChange={(e) => setUserForm({ ...userForm, department: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              {userForm.role === 'Viewer' && (
                <div className="flex items-center space-x-2 p-2 rounded bg-slate-50 dark:bg-slate-800">
                  <input
                    type="checkbox"
                    id="exportPerm"
                    checked={userForm.canExportReports}
                    onChange={(e) => setUserForm({ ...userForm, canExportReports: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <label htmlFor="exportPerm" className="font-semibold text-slate-700 dark:text-slate-300">
                    Grant Excel / PDF Report Export Permission
                  </label>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="userActive"
                  checked={userForm.active}
                  onChange={(e) => setUserForm({ ...userForm, active: e.target.checked })}
                  className="rounded text-blue-600"
                />
                <label htmlFor="userActive" className="font-semibold text-slate-700 dark:text-slate-300">
                  Account Active
                </label>
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowUserModal(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white"
              >
                Save Account
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
