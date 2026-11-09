/**
 * UNIMAK WIP STOCK MANAGEMENT SYSTEM
 * Coating Receiving Module
 * Section 6 Requirements: Coating Batch Cards, Multi-Coating Combinations, Side Configurations, Controlled Reversals
 */

import React, { useState, useEffect } from 'react';
import {
  Layers,
  Plus,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  History,
  FileText,
  Search,
  Check,
  ShieldAlert,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SideConfiguration } from '../../types';

export const CoatingReceivingView: React.FC = () => {
  const {
    jobs,
    items,
    sheetSizes,
    coatingTypes,
    coatingReceipts,
    postCoatingReceipt,
    reverseCoatingReceipt,
    currentUser,
    setInspectedBatchCard,
  } = useApp();

  const isAdmin = currentUser.role === 'Administrator';
  const isQualityUser = currentUser.role === 'Quality Department';

  const activeJobs = jobs.filter((j) => j.active);
  const activeItems = items.filter((i) => i.active);
  const activeCoatingTypes = coatingTypes.filter((c) => c.active);

  // Form State
  const [receivingDate, setReceivingDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [coatingBatchCardNumber, setCoatingBatchCardNumber] = useState('');
  const [selectedItemId, setSelectedItemId] = useState('');
  const [sheetSize, setSheetSize] = useState('');
  const [selectedCoatingTypeIds, setSelectedCoatingTypeIds] = useState<string[]>([]);
  const [sideConfiguration, setSideConfiguration] = useState<SideConfiguration>('Single');
  const [receivedQuantity, setReceivedQuantity] = useState<number | ''>('');
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reversal Modal State (Administrator Only)
  const [reversalModalOpen, setReversalModalOpen] = useState(false);
  const [reversingReceiptId, setReversingReceiptId] = useState<string | null>(null);
  const [reversalReason, setReversalReason] = useState('');

  // Table Search / Filter
  const [searchFilter, setSearchFilter] = useState('');

  // Auto-populate Item Name & Sheet Size when item selected
  const selectedItem = items.find((i) => i.id === selectedItemId);
  useEffect(() => {
    if (selectedItem) {
      if (!sheetSize || sheetSize === '') {
        setSheetSize(selectedItem.sheetSize);
      }
    }
  }, [selectedItem]);

  // Coating combination formatted string: e.g. "Gold + Size", "White + Gold + Size"
  const coatingCombination = selectedCoatingTypeIds
    .map((id) => coatingTypes.find((c) => c.id === id)?.name)
    .filter(Boolean)
    .join(' + ');

  const handleToggleCoatingType = (id: string) => {
    setSelectedCoatingTypeIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isQualityUser) return;

    if (!selectedJobId) {
      alert('Please select a Production Job.');
      return;
    }
    const cleanBatch = coatingBatchCardNumber.trim().toUpperCase();
    if (!cleanBatch) {
      alert('Coating Batch Card Number is required.');
      return;
    }
    if (!selectedItemId) {
      alert('Please select an Item.');
      return;
    }
    if (selectedCoatingTypeIds.length === 0) {
      alert('Please select at least one Coating Type.');
      return;
    }
    const qty = Number(receivedQuantity);
    if (!qty || qty <= 0) {
      alert('Received quantity must be a positive number greater than 0.');
      return;
    }

    const job = jobs.find((j) => j.id === selectedJobId);
    if (!job) return;

    setIsSubmitting(true);
    try {
      postCoatingReceipt({
        receivingDate,
        jobId: job.id,
        jobNumber: job.jobNumber,
        jobName: job.jobName,
        coatingBatchCardNumber: cleanBatch,
        itemId: selectedItem!.id,
        itemCode: selectedItem!.itemCode,
        itemName: selectedItem!.itemName,
        sheetSize: sheetSize || selectedItem!.sheetSize,
        coatingTypeIds: selectedCoatingTypeIds,
        coatingCombination,
        sideConfiguration,
        receivedQuantity: qty,
        remarks: remarks.trim() || undefined,
      });

      // Reset form
      setCoatingBatchCardNumber('');
      setReceivedQuantity('');
      setRemarks('');
      setSelectedCoatingTypeIds([]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenReversal = (id: string) => {
    setReversingReceiptId(id);
    setReversalReason('');
    setReversalModalOpen(true);
  };

  const handleConfirmReversal = () => {
    if (!reversingReceiptId || !reversalReason.trim()) {
      alert('A valid reason is mandatory for controlled stock reversals.');
      return;
    }
    reverseCoatingReceipt(reversingReceiptId, reversalReason.trim());
    setReversalModalOpen(false);
    setReversingReceiptId(null);
  };

  // Filtered History
  const filteredReceipts = coatingReceipts.filter((cr) => {
    const q = searchFilter.toLowerCase();
    return (
      cr.coatingBatchCardNumber.toLowerCase().includes(q) ||
      cr.jobNumber.toLowerCase().includes(q) ||
      cr.itemCode.toLowerCase().includes(q) ||
      cr.receiptNumber.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Coating Receiving
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-700/50">
              Coated Sheet Stock Intake
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Record sheets received from lacquer coating lines. Increases Coated Sheet Stock for the assigned batch.
          </p>
        </div>
      </div>

      {/* RBAC Warning for Quality Users */}
      {isQualityUser && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs flex items-center space-x-3">
          <ShieldAlert className="w-5 h-5 shrink-0 text-amber-500" />
          <span>
            <strong>Access Restricted:</strong> Quality Department accounts have permission to submit and view Quality Returns. Coating stock receipt entry is restricted to Production operators and Administrators.
          </span>
        </div>
      )}

      {/* Coating Receiving Intake Form */}
      {!isQualityUser && (
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center space-x-2 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
            <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              New Coating Batch Receipt Entry
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 text-xs">
              {/* Receiving Date */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Receiving Date *
                </label>
                <input
                  type="date"
                  required
                  value={receivingDate}
                  onChange={(e) => setReceivingDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              {/* Job Dropdown */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Job Name / Job Number *
                </label>
                <select
                  required
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="">-- Select Job Order --</option>
                  {activeJobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.jobNumber} - {j.jobName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Coating Batch Card Number */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Coating Batch Card Number * (Required)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CBC-2026-001"
                  value={coatingBatchCardNumber}
                  onChange={(e) => setCoatingBatchCardNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white uppercase font-mono font-semibold"
                />
              </div>

              {/* Item Code Dropdown */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Item Code *
                </label>
                <select
                  required
                  value={selectedItemId}
                  onChange={(e) => setSelectedItemId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                >
                  <option value="">-- Select Item SKU --</option>
                  {activeItems.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.itemCode} - {i.itemName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Item Name (Auto-populated) */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Item Name (Auto-populated)
                </label>
                <input
                  type="text"
                  readOnly
                  disabled
                  value={selectedItem ? selectedItem.itemName : 'Select item above'}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-850 text-slate-600 dark:text-slate-400 cursor-not-allowed font-medium"
                />
              </div>

              {/* Sheet Size Dropdown */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Sheet Size (From Master Data)
                </label>
                <select
                  value={sheetSize}
                  onChange={(e) => setSheetSize(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                >
                  {sheetSizes.map((s) => (
                    <option key={s.id} value={s.size}>
                      {s.size}
                    </option>
                  ))}
                </select>
              </div>

              {/* Side Configuration */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Side Configuration *
                </label>
                <div className="flex space-x-2 pt-1">
                  {(['Single', 'Double'] as SideConfiguration[]).map((cfg) => (
                    <label
                      key={cfg}
                      className={`flex-1 flex items-center justify-center px-3 py-2 rounded-lg border cursor-pointer font-semibold transition-colors ${
                        sideConfiguration === cfg
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <input
                        type="radio"
                        name="sideConfig"
                        value={cfg}
                        checked={sideConfiguration === cfg}
                        onChange={() => setSideConfiguration(cfg)}
                        className="sr-only"
                      />
                      {cfg}
                    </label>
                  ))}
                </div>
              </div>

              {/* Received Quantity */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Received Quantity * (Sheets)
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="e.g. 15000"
                  value={receivedQuantity}
                  onChange={(e) =>
                    setReceivedQuantity(e.target.value === '' ? '' : Math.max(1, parseInt(e.target.value) || 0))
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                />
              </div>
            </div>

            {/* Coating Types Multi-Select Section */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850/60 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                <label className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Select Coating Formulations (Multi-Select):
                </label>
                <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                  Combination: {coatingCombination || 'None Selected'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
                Examples: Gold + Size, White + Gold + Size, LPVC + White, Silver + Black
              </p>

              <div className="flex flex-wrap gap-2">
                {activeCoatingTypes.map((cType) => {
                  const isSelected = selectedCoatingTypeIds.includes(cType.id);
                  return (
                    <button
                      type="button"
                      key={cType.id}
                      onClick={() => handleToggleCoatingType(cType.id)}
                      className={`flex items-center px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                      }`}
                    >
                      {isSelected ? (
                        <Check className="w-3.5 h-3.5 mr-1 text-white" />
                      ) : (
                        <Plus className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      )}
                      {cType.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Remarks */}
            <div className="text-xs">
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Remarks / Lacquer Batch Details (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. External gold lacquer + interior epoxyphenolic size"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            {/* Submit Action */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center px-5 py-2.5 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-900/30 transition-colors disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Confirm & Post Coating Receipt
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Coating Receiving History Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Coating Receiving Ledger & History
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Audited transaction records for Coated Sheet Stock
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search batch or job..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">Receipt No</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Coating Batch Card</th>
                <th className="px-4 py-3">Job Number</th>
                <th className="px-4 py-3">Item Code</th>
                <th className="px-4 py-3">Sheet Size</th>
                <th className="px-4 py-3">Coating Spec</th>
                <th className="px-4 py-3">Side</th>
                <th className="px-4 py-3 text-right">Received Qty</th>
                <th className="px-4 py-3">Status</th>
                {isAdmin && <th className="px-4 py-3 text-right">Admin Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredReceipts.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-4 py-8 text-center text-slate-400">
                    No coating receiving records found.
                  </td>
                </tr>
              ) : (
                filteredReceipts.map((cr) => (
                  <tr
                    key={cr.id}
                    className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/40 ${
                      cr.isReversed ? 'opacity-60 bg-rose-50/20 dark:bg-rose-950/10' : ''
                    }`}
                  >
                    <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-400">
                      {cr.receiptNumber}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{cr.receivingDate}</td>
                    <td className="px-4 py-3 font-mono font-bold text-blue-600 dark:text-blue-400">
                      <button
                        onClick={() => setInspectedBatchCard(cr.coatingBatchCardNumber)}
                        className="hover:underline text-left"
                      >
                        {cr.coatingBatchCardNumber}
                      </button>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                      {cr.jobNumber}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-700 dark:text-slate-300">
                      {cr.itemCode}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-500">{cr.sheetSize}</td>
                    <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">
                      {cr.coatingCombination}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {cr.sideConfiguration}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-slate-900 dark:text-white">
                      {cr.receivedQuantity.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      {cr.isReversed ? (
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300"
                          title={`Reversed: ${cr.reversedReason}`}
                        >
                          Reversed
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                          Active Stock
                        </span>
                      )}
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-3 text-right">
                        {!cr.isReversed && (
                          <button
                            onClick={() => handleOpenReversal(cr.id)}
                            className="px-2 py-1 rounded text-[10px] font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-800"
                            title="Controlled Reversal with Mandatory Reason"
                          >
                            Reverse
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Controlled Reversal Modal (Administrator Only) */}
      {reversalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-rose-50 dark:bg-rose-950/40">
              <div className="flex items-center space-x-2 text-rose-700 dark:text-rose-300 font-bold text-sm">
                <AlertTriangle className="w-5 h-5" />
                <span>Controlled Transaction Reversal</span>
              </div>
              <button
                onClick={() => setReversalModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs">
              <p className="text-slate-600 dark:text-slate-300">
                You are about to reverse this coating receipt. Silent overwrites are forbidden. A permanent audit log entry will be created and stock will be securely restored.
              </p>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Mandatory Reversal Reason *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Explain why this receipt is being reversed (e.g. incorrect lacquer mix entered, batch cancelled by plant manager)..."
                  value={reversalReason}
                  onChange={(e) => setReversalReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>
            <div className="px-6 py-3 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setReversalModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReversal}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-500 text-white"
              >
                Confirm Controlled Reversal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
