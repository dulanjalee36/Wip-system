/**
 * UNIMAK WIP STOCK MANAGEMENT SYSTEM
 * Quality Return Module (ONLY FOR PRINTING LINE ISSUED SHEETS)
 * Section 8 Implementation: Strict Outstanding & Pending Validation, UPS Math, Draft/Submit Workflow & Admin Approvals
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  FileEdit,
  Send,
  Printer,
  ShieldCheck,
  Search,
  Filter,
  Check,
  X,
  MessageSquare,
  HelpCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { QualityReturn, QualityReturnStatus } from '../../types';

export const QualityReturnView: React.FC = () => {
  const {
    jobs,
    items,
    qualityReturns,
    allPrintingBatchStocks,
    saveQualityReturn,
    approveQualityReturn,
    returnQualityForCorrection,
    currentUser,
    setInspectedBatchCard,
  } = useApp();

  const isAdmin = currentUser.role === 'Administrator';
  const isQualityUser = currentUser.role === 'Quality Department';
  const isViewer = currentUser.role === 'Viewer';

  // Form State
  const [returnDate, setReturnDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [selectedPrintingBatchCard, setSelectedPrintingBatchCard] = useState('');
  const [goodQuantity, setGoodQuantity] = useState<number | ''>('');
  const [rejectedQuantity, setRejectedQuantity] = useState<number | ''>('');
  const [upsPerSheet, setUpsPerSheet] = useState<number | ''>('');
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Selected printing batch details
  const selectedBatchStock = useMemo(() => {
    return allPrintingBatchStocks.find(
      (pb) => pb.printingBatchCardNumber === selectedPrintingBatchCard
    );
  }, [allPrintingBatchStocks, selectedPrintingBatchCard]);

  // Form calculations
  const numGood = typeof goodQuantity === 'number' ? goodQuantity : 0;
  const numRejected = typeof rejectedQuantity === 'number' ? rejectedQuantity : 0;
  const totalReturnedQuantity = numGood + numRejected;

  const numUPS = typeof upsPerSheet === 'number' && upsPerSheet > 0 ? upsPerSheet : undefined;
  const goodUPS = numUPS ? numGood * numUPS : undefined;
  const rejectedUPS = numUPS ? numRejected * numUPS : undefined;
  const totalUPS = numUPS ? totalReturnedQuantity * numUPS : undefined;

  // Outstanding calculations
  const printingIssuedQty = selectedBatchStock?.printingLineIssueQuantity || 0;
  const previouslyApprovedReturned = selectedBatchStock?.totalApprovedReturnedQuantity || 0;
  const outstandingPrintingQuantity = selectedBatchStock?.outstandingPrintingWIP || 0;

  // Pending submissions from all returns for this batch
  const pendingReturnQuantity = useMemo(() => {
    if (!selectedPrintingBatchCard) return 0;
    return qualityReturns
      .filter((q) => q.printingBatchCardNumber === selectedPrintingBatchCard && q.status === 'Submitted')
      .reduce((sum, q) => sum + q.totalReturnedQuantity, 0);
  }, [qualityReturns, selectedPrintingBatchCard]);

  const maxEligibleReturn = Math.max(0, outstandingPrintingQuantity - pendingReturnQuantity);

  // Correction Modal State (for Admin)
  const [correctionModalOpen, setCorrectionModalOpen] = useState(false);
  const [correctionReturnId, setCorrectionReturnId] = useState<string | null>(null);
  const [correctionReason, setCorrectionReason] = useState('');

  // Table Filters
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Eligible printing batches (only batches with outstanding WIP > 0)
  const eligiblePrintingBatches = useMemo(() => {
    return allPrintingBatchStocks.filter(
      (pb) => (!selectedJobId || pb.jobId === selectedJobId) && pb.outstandingPrintingWIP > 0
    );
  }, [allPrintingBatchStocks, selectedJobId]);

  const handleSaveForm = (submitDirectly: boolean) => {
    if (isViewer) return;
    if (!selectedPrintingBatchCard) {
      alert('Please select an eligible Printing Batch Card Number.');
      return;
    }
    if (numGood < 0 || numRejected < 0) {
      alert('Good and Rejected quantities cannot be negative.');
      return;
    }
    if (totalReturnedQuantity <= 0) {
      alert('Total Returned Quantity (Good + Rejected) must be greater than zero.');
      return;
    }
    if (totalReturnedQuantity > maxEligibleReturn) {
      alert(
        `Total Returned Quantity (${totalReturnedQuantity.toLocaleString()}) exceeds the eligible outstanding balance (${maxEligibleReturn.toLocaleString()}). Pending submissions from other inspections are held in reserve.`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      saveQualityReturn({
        returnDate,
        jobId: selectedBatchStock!.jobId,
        jobNumber: selectedBatchStock!.jobNumber,
        jobName: selectedBatchStock!.jobName,
        printingBatchCardNumber: selectedBatchStock!.printingBatchCardNumber,
        originalCoatingBatchCardNumber: selectedBatchStock!.originalCoatingBatchCardNumber,
        itemId: selectedBatchStock!.itemId,
        itemCode: selectedBatchStock!.itemCode,
        itemName: selectedBatchStock!.itemName,
        sheetSize: selectedBatchStock!.sheetSize,
        coatingCombination: selectedBatchStock!.coatingCombination,
        sideConfiguration: selectedBatchStock!.sideConfiguration,
        printingLineIssueQuantity: printingIssuedQty,
        previouslyApprovedReturnedQuantity: previouslyApprovedReturned,
        pendingReturnQuantity,
        outstandingPrintingQuantity,
        goodQuantity: numGood,
        rejectedQuantity: numRejected,
        totalReturnedQuantity,
        upsPerSheet: numUPS,
        goodUPS,
        rejectedUPS,
        totalUPS,
        remarks: remarks.trim() || undefined,
        status: submitDirectly ? 'Submitted' : 'Draft',
      });

      // Reset
      setSelectedPrintingBatchCard('');
      setGoodQuantity('');
      setRejectedQuantity('');
      setUpsPerSheet('');
      setRemarks('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = (id: string, submittedBy: string) => {
    if (submittedBy === currentUser.id) {
      alert('Quality users and record originators cannot approve their own submissions.');
      return;
    }
    approveQualityReturn(id);
  };

  const handleOpenCorrection = (id: string) => {
    setCorrectionReturnId(id);
    setCorrectionReason('');
    setCorrectionModalOpen(true);
  };

  const handleConfirmCorrection = () => {
    if (!correctionReturnId || !correctionReason.trim()) {
      alert('A mandatory reason is required when returning a record for correction.');
      return;
    }
    returnQualityForCorrection(correctionReturnId, correctionReason.trim());
    setCorrectionModalOpen(false);
    setCorrectionReturnId(null);
  };

  // Filtered Returns list
  const filteredReturns = qualityReturns.filter((qr) => {
    if (statusFilter !== 'ALL' && qr.status !== statusFilter) return false;
    const q = searchQuery.toLowerCase();
    return (
      qr.returnNumber.toLowerCase().includes(q) ||
      qr.printingBatchCardNumber.toLowerCase().includes(q) ||
      qr.jobNumber.toLowerCase().includes(q) ||
      qr.itemCode.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Quality Return
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-semibold border border-amber-300 dark:border-amber-800">
              Printing Line Return & QA Conformance
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Strictly for sheets issued to Printing Line. Quality Return approval atomically deducts Printing WIP and credits Approved Good and Rejected Stock.
          </p>
        </div>
      </div>

      {/* Quality Return Entry Form (Quality Dept & Admin) */}
      {!isViewer && (
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center space-x-2 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
            <RotateCcw className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Quality Return Inspection Submission
            </h2>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSaveForm(true);
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 text-xs">
              {/* Return Date */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Return Date *
                </label>
                <input
                  type="date"
                  required
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              {/* Filter Job */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Job Name / Job Number
                </label>
                <select
                  value={selectedJobId}
                  onChange={(e) => {
                    setSelectedJobId(e.target.value);
                    setSelectedPrintingBatchCard('');
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="">-- All Jobs with Outstanding Printing WIP --</option>
                  {jobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.jobNumber} - {j.jobName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Printing Batch Card Dropdown (ONLY eligible batches) */}
              <div className="md:col-span-2">
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Printing Batch Card Number * (Only Eligible Printing Line Batches)
                </label>
                <select
                  required
                  value={selectedPrintingBatchCard}
                  onChange={(e) => setSelectedPrintingBatchCard(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-semibold"
                >
                  <option value="">-- Select Eligible Printing Batch --</option>
                  {eligiblePrintingBatches.map((pb) => (
                    <option key={pb.printingBatchCardNumber} value={pb.printingBatchCardNumber}>
                      {pb.printingBatchCardNumber} | Job: {pb.jobNumber} | Item: {pb.itemCode} (Outstanding WIP: {pb.outstandingPrintingWIP.toLocaleString()})
                    </option>
                  ))}
                </select>
                {eligiblePrintingBatches.length === 0 && (
                  <p className="text-[11px] text-amber-500 mt-1">
                    No active printing line issues with outstanding WIP found.
                  </p>
                )}
              </div>
            </div>

            {/* Auto-populated Specifications and Outstanding Math */}
            {selectedBatchStock && (
              <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 text-xs space-y-3">
                <div className="flex items-center justify-between text-amber-800 dark:text-amber-300 font-bold">
                  <span>Batch Card Linked Technical Specifications:</span>
                  <span className="font-mono text-[11px]">
                    Orig. Coating Batch: {selectedBatchStock.originalCoatingBatchCardNumber}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-700 dark:text-slate-300">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                      Item SKU:
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {selectedBatchStock.itemCode}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                      Item Name:
                    </span>
                    <span className="truncate block font-medium">
                      {selectedBatchStock.itemName}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                      Sheet Size:
                    </span>
                    <span className="font-mono">{selectedBatchStock.sheetSize}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                      Coating Spec:
                    </span>
                    <span>
                      {selectedBatchStock.coatingCombination} (
                      {selectedBatchStock.sideConfiguration})
                    </span>
                  </div>
                </div>

                {/* Outstanding Math Pill Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-amber-200 dark:border-amber-900/60">
                  <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-400 block text-[10px] font-semibold uppercase">
                      Line Issued Qty
                    </span>
                    <span className="text-base font-bold text-slate-900 dark:text-white">
                      {printingIssuedQty.toLocaleString()}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-400 block text-[10px] font-semibold uppercase">
                      Prev. Approved Returned
                    </span>
                    <span className="text-base font-bold text-blue-600 dark:text-blue-400">
                      {previouslyApprovedReturned.toLocaleString()}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-amber-600 dark:text-amber-400 block text-[10px] font-semibold uppercase">
                      Pending In-Review
                    </span>
                    <span className="text-base font-bold text-amber-600 dark:text-amber-400">
                      {pendingReturnQuantity.toLocaleString()}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800">
                    <span className="text-emerald-800 dark:text-emerald-300 block text-[10px] font-bold uppercase">
                      Available to Return
                    </span>
                    <span className="text-base font-extrabold text-emerald-700 dark:text-emerald-300">
                      {maxEligibleReturn.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Inspection Quantities & UPS Calculations */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
              {/* Good Quantity */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Good Quantity * (Sheets)
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  placeholder="0"
                  value={goodQuantity}
                  onChange={(e) =>
                    setGoodQuantity(e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value) || 0))
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-sm"
                />
              </div>

              {/* Rejected Quantity */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Rejected Quantity * (Sheets)
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  placeholder="0"
                  value={rejectedQuantity}
                  onChange={(e) =>
                    setRejectedQuantity(e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value) || 0))
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-sm"
                />
              </div>

              {/* Total Returned Quantity (Calculated) */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Total Returned Quantity
                </label>
                <input
                  type="text"
                  readOnly
                  disabled
                  value={`${totalReturnedQuantity.toLocaleString()} Sheets`}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-850 text-slate-800 dark:text-slate-200 font-extrabold text-sm cursor-not-allowed"
                />
              </div>

              {/* UPS per Sheet (Optional) */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  UPS per Sheet (Optional)
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g. 24"
                  value={upsPerSheet}
                  onChange={(e) =>
                    setUpsPerSheet(e.target.value === '' ? '' : Math.max(1, parseInt(e.target.value) || 0))
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              {/* Good UPS */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Good UPS (Auto)
                </label>
                <input
                  type="text"
                  readOnly
                  disabled
                  value={goodUPS !== undefined ? goodUPS.toLocaleString() : '-'}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-850 text-slate-600 dark:text-slate-400 cursor-not-allowed"
                />
              </div>

              {/* Rejected UPS */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Rejected UPS (Auto)
                </label>
                <input
                  type="text"
                  readOnly
                  disabled
                  value={rejectedUPS !== undefined ? rejectedUPS.toLocaleString() : '-'}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-850 text-slate-600 dark:text-slate-400 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Remarks */}
            <div className="text-xs">
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Quality Inspection Remarks & Defect Classifications (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Scratch marks near margin, color registration deviation on side B"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            {/* Actions: Save Draft vs Submit for Approval */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-2 border-t border-slate-100 dark:border-slate-800 gap-3">
              <span className="text-[11px] text-slate-400 italic">
                * Drafts do not reserve stock. Submitted records hold eligible stock. Only Approved records alter stock balances.
              </span>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  disabled={isSubmitting || !selectedPrintingBatchCard}
                  onClick={() => handleSaveForm(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors disabled:opacity-50"
                >
                  Save as Draft
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !selectedPrintingBatchCard || totalReturnedQuantity === 0}
                  className="flex items-center px-5 py-2 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-900/30 transition-colors disabled:opacity-50"
                >
                  <Send className="w-4 h-4 mr-1.5" />
                  Submit for Approval
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Quality Return Submissions & Approval Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Quality Return Workflow Ledger
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Drafts, Submissions, Administrator Review & Stock Posting
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
            >
              <option value="ALL">All Statuses</option>
              <option value="Submitted">Pending Approval (Submitted)</option>
              <option value="Approved">Approved</option>
              <option value="Draft">Drafts</option>
              <option value="Correction Required">Correction Required</option>
            </select>

            <div className="relative w-48 sm:w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search returns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">Return No</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Job Number</th>
                <th className="px-4 py-3">Printing Batch Card</th>
                <th className="px-4 py-3">Item Code</th>
                <th className="px-4 py-3 text-right">Good Qty</th>
                <th className="px-4 py-3 text-right">Rejected Qty</th>
                <th className="px-4 py-3 text-right">Total Returned</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Submitted By</th>
                <th className="px-4 py-3">Approved By</th>
                {isAdmin && <th className="px-4 py-3 text-right">Admin Approval</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredReturns.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-4 py-8 text-center text-slate-400">
                    No Quality Return records matching criteria.
                  </td>
                </tr>
              ) : (
                filteredReturns.map((qr) => (
                  <tr key={qr.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">
                      {qr.returnNumber}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{qr.returnDate}</td>
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                      {qr.jobNumber}
                    </td>
                    <td className="px-4 py-3 font-mono">
                      <button
                        onClick={() => setInspectedBatchCard(qr.printingBatchCardNumber)}
                        className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                      >
                        {qr.printingBatchCardNumber}
                      </button>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-700 dark:text-slate-300">
                      {qr.itemCode}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                      {qr.goodQuantity.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-rose-600 dark:text-rose-400">
                      {qr.rejectedQuantity.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right font-black text-slate-900 dark:text-white">
                      {qr.totalReturnedQuantity.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                          qr.status === 'Approved'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : qr.status === 'Submitted'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 animate-pulse'
                            : qr.status === 'Correction Required'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {qr.status}
                      </span>
                      {qr.correctionReason && (
                        <p className="text-[10px] text-rose-600 dark:text-rose-400 mt-0.5 max-w-xs truncate">
                          Reason: {qr.correctionReason}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{qr.submittedByName}</td>
                    <td className="px-4 py-3 text-slate-500">
                      {qr.approvedByName ? (
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          {qr.approvedByName}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-3 text-right">
                        {qr.status === 'Submitted' && (
                          <div className="flex items-center justify-end space-x-1">
                            {qr.submittedBy === currentUser.id ? (
                              <span
                                className="text-[10px] text-slate-400 italic"
                                title="Cannot approve own submission"
                              >
                                Self-submission
                              </span>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleApprove(qr.id, qr.submittedBy)}
                                  className="px-2 py-1 rounded text-[10px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-colors"
                                  title="Approve into stock"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleOpenCorrection(qr.id)}
                                  className="px-2 py-1 rounded text-[10px] font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-xs transition-colors"
                                  title="Return for correction"
                                >
                                  Return
                                </button>
                              </>
                            )}
                          </div>
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

      {/* Mandatory Correction Reason Modal (Admin Only) */}
      {correctionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-rose-50 dark:bg-rose-950/40">
              <div className="flex items-center space-x-2 text-rose-700 dark:text-rose-300 font-bold text-sm">
                <AlertTriangle className="w-5 h-5" />
                <span>Return Submission for Correction</span>
              </div>
              <button
                onClick={() => setCorrectionModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs">
              <p className="text-slate-600 dark:text-slate-300">
                You are returning this Quality Return to the Quality Inspector. A mandatory reason must be provided so they can adjust quantities and resubmit.
              </p>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Mandatory Correction Reason *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Good quantity does not tally with pallet count; please re-verify lot 2 with packing department..."
                  value={correctionReason}
                  onChange={(e) => setCorrectionReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>
            <div className="px-6 py-3 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setCorrectionModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmCorrection}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-500 text-white"
              >
                Return for Correction
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
