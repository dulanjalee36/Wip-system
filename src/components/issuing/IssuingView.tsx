/**
 * UNIMAK WIP STOCK MANAGEMENT SYSTEM
 * Issuing to Factories Module
 * Covers Section 7 (Coated Sheet Issue) and Section 11 (Approved Printed Sheet Issue)
 */

import React, { useState, useMemo } from 'react';
import {
  Send,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Printer,
  Layers,
  Search,
  ShieldAlert,
  ArrowRight,
  Info,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { IssueType } from '../../types';

export const IssuingView: React.FC = () => {
  const {
    jobs,
    items,
    factories,
    factoryIssues,
    postFactoryIssue,
    currentUser,
    itemCoatingSummaries,
    allPrintingBatchStocks,
    setInspectedBatchCard,
  } = useApp();

  const isQualityUser = currentUser.role === 'Quality Department';
  const isAdmin = currentUser.role === 'Administrator';

  // Issue Type Selector
  const [issueType, setIssueType] = useState<IssueType>('Coated Sheet Issue');

  // Form Fields
  const [issueDate, setIssueDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [selectedDestinationFactory, setSelectedDestinationFactory] = useState('');
  const [selectedBatchCard, setSelectedBatchCard] = useState('');
  const [issueQuantity, setIssueQuantity] = useState<number | ''>('');
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Table filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'Coated Sheet Issue' | 'Approved Printed Sheet Issue'>('ALL');

  // Active Jobs
  const activeJobs = jobs.filter((j) => j.active);

  // Available Coating Batches for selected Job
  const eligibleCoatingBatches = useMemo(() => {
    if (issueType !== 'Coated Sheet Issue') return [];
    const batches: any[] = [];
    itemCoatingSummaries.forEach((sum) => {
      sum.batches.forEach((b) => {
        if ((!selectedJobId || b.jobId === selectedJobId) && b.remainingBalance > 0) {
          batches.push(b);
        }
      });
    });
    return batches;
  }, [issueType, itemCoatingSummaries, selectedJobId]);

  // Available Printing Batches for selected Job (with Approved Good Stock > 0)
  const eligiblePrintingBatches = useMemo(() => {
    if (issueType !== 'Approved Printed Sheet Issue') return [];
    return allPrintingBatchStocks.filter(
      (pb) => (!selectedJobId || pb.jobId === selectedJobId) && pb.approvedGoodPrintingStock > 0
    );
  }, [issueType, allPrintingBatchStocks, selectedJobId]);

  // Selected Batch Information
  const selectedCoatingBatch = eligibleCoatingBatches.find(
    (b) => b.coatingBatchCardNumber === selectedBatchCard
  );
  const selectedPrintingBatch = eligiblePrintingBatches.find(
    (pb) => pb.printingBatchCardNumber === selectedBatchCard
  );

  // Filtered Factory options:
  // For Coated Sheet Issue: Crown Line, Plant 2, Plant 3, Printing Line
  // For Approved Printed Sheet Issue: Crown Line, Plant 2, Plant 3 (Printing Line is NOT allowed)
  const availableFactories = factories.filter((fac) => {
    if (!fac.active) return false;
    if (issueType === 'Approved Printed Sheet Issue' && fac.isPrintingLine) {
      return false;
    }
    return true;
  });

  const availableBalance =
    issueType === 'Coated Sheet Issue'
      ? selectedCoatingBatch?.remainingBalance || 0
      : selectedPrintingBatch?.approvedGoodPrintingStock || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isQualityUser) return;

    if (!selectedDestinationFactory) {
      alert('Please select a destination factory/line.');
      return;
    }
    if (!selectedBatchCard) {
      alert('Please select a valid source batch with stock.');
      return;
    }
    const qty = Number(issueQuantity);
    if (!qty || qty <= 0) {
      alert('Issue quantity must be a positive number.');
      return;
    }
    if (qty > availableBalance) {
      alert(`Issue quantity (${qty.toLocaleString()}) exceeds available stock (${availableBalance.toLocaleString()}).`);
      return;
    }

    const job =
      issueType === 'Coated Sheet Issue'
        ? jobs.find((j) => j.id === selectedCoatingBatch?.jobId)
        : jobs.find((j) => j.id === selectedPrintingBatch?.jobId);

    if (!job) {
      alert('Linked job order not found.');
      return;
    }

    const isPrintingLine = selectedDestinationFactory === 'Printing Line';

    setIsSubmitting(true);
    try {
      if (issueType === 'Coated Sheet Issue') {
        postFactoryIssue({
          issueType,
          issueDate,
          jobId: job.id,
          jobNumber: job.jobNumber,
          jobName: job.jobName,
          destinationFactory: selectedDestinationFactory,
          isPrintingLine,
          itemId: selectedCoatingBatch!.itemId,
          itemCode: selectedCoatingBatch!.itemCode,
          itemName: selectedCoatingBatch!.itemName,
          sheetSize: selectedCoatingBatch!.sheetSize,
          coatingCombination: selectedCoatingBatch!.coatingCombination,
          sideConfiguration: selectedCoatingBatch!.sideConfiguration,
          coatingBatchCardNumber: selectedCoatingBatch!.coatingBatchCardNumber,
          issueQuantity: qty,
          remarks: remarks.trim() || undefined,
        });
      } else {
        postFactoryIssue({
          issueType,
          issueDate,
          jobId: job.id,
          jobNumber: job.jobNumber,
          jobName: job.jobName,
          destinationFactory: selectedDestinationFactory,
          isPrintingLine: false,
          itemId: selectedPrintingBatch!.itemId,
          itemCode: selectedPrintingBatch!.itemCode,
          itemName: selectedPrintingBatch!.itemName,
          sheetSize: selectedPrintingBatch!.sheetSize,
          coatingCombination: selectedPrintingBatch!.coatingCombination,
          sideConfiguration: selectedPrintingBatch!.sideConfiguration,
          coatingBatchCardNumber: selectedPrintingBatch!.originalCoatingBatchCardNumber,
          printingBatchCardNumber: selectedPrintingBatch!.printingBatchCardNumber,
          issueQuantity: qty,
          remarks: remarks.trim() || undefined,
        });
      }

      // Reset
      setSelectedBatchCard('');
      setIssueQuantity('');
      setRemarks('');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered issues
  const filteredIssues = factoryIssues.filter((i) => {
    if (filterType !== 'ALL' && i.issueType !== filterType) return false;
    const q = searchQuery.toLowerCase();
    return (
      i.issueNumber.toLowerCase().includes(q) ||
      i.jobNumber.toLowerCase().includes(q) ||
      i.itemCode.toLowerCase().includes(q) ||
      i.destinationFactory.toLowerCase().includes(q) ||
      i.coatingBatchCardNumber.toLowerCase().includes(q) ||
      (i.printingBatchCardNumber && i.printingBatchCardNumber.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Issuing to Factories
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-700/50">
              Stock Dispatch
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Dispatch coated sheets to Printing Line or dispatch approved good printed sheets to Crown & Stamping Plants.
          </p>
        </div>
      </div>

      {/* Quality User restriction banner */}
      {isQualityUser && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs flex items-center space-x-3">
          <ShieldAlert className="w-5 h-5 shrink-0 text-amber-500" />
          <span>
            <strong>Access Restricted:</strong> Quality Department personnel cannot issue stock. Only Production and Administrators can dispatch sheets.
          </span>
        </div>
      )}

      {/* Issue Form */}
      {!isQualityUser && (
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          {/* Issue Type Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800 gap-3">
            <div className="flex items-center space-x-2">
              <Send className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Record Stock Dispatch
              </h2>
            </div>

            {/* Dual Type Selector Button Pill */}
            <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => {
                  setIssueType('Coated Sheet Issue');
                  setSelectedBatchCard('');
                  setSelectedDestinationFactory('');
                }}
                className={`flex items-center px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  issueType === 'Coated Sheet Issue'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5 mr-1.5" />
                Coated Sheet Issue
              </button>
              <button
                type="button"
                onClick={() => {
                  setIssueType('Approved Printed Sheet Issue');
                  setSelectedBatchCard('');
                  setSelectedDestinationFactory('');
                }}
                className={`flex items-center px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  issueType === 'Approved Printed Sheet Issue'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                <Printer className="w-3.5 h-3.5 mr-1.5" />
                Approved Printed Sheet Issue
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 text-xs">
              {/* Issue Date */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Issue Date *
                </label>
                <input
                  type="date"
                  required
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              {/* Destination Factory */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Factory / Department *
                </label>
                <select
                  required
                  value={selectedDestinationFactory}
                  onChange={(e) => setSelectedDestinationFactory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                >
                  <option value="">-- Select Destination --</option>
                  {availableFactories.map((fac) => (
                    <option key={fac.id} value={fac.name}>
                      {fac.name} {fac.isPrintingLine ? '(Printing Line -> Generates WIP)' : '(Final Plant)'}
                    </option>
                  ))}
                </select>
                {issueType === 'Approved Printed Sheet Issue' && (
                  <p className="text-[10px] text-slate-400 mt-1">
                    * Printing Line is disabled for approved printed sheets
                  </p>
                )}
              </div>

              {/* Filter Job */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Filter by Job Order (Optional)
                </label>
                <select
                  value={selectedJobId}
                  onChange={(e) => {
                    setSelectedJobId(e.target.value);
                    setSelectedBatchCard('');
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="">-- All Active Jobs --</option>
                  {activeJobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.jobNumber} - {j.jobName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Batch Card Selection Dropdown */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {issueType === 'Coated Sheet Issue'
                    ? 'Eligible Coating Batch *'
                    : 'Approved Printing Batch *'}
                </label>
                <select
                  required
                  value={selectedBatchCard}
                  onChange={(e) => setSelectedBatchCard(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-semibold"
                >
                  <option value="">-- Select Source Batch with Available Stock --</option>
                  {issueType === 'Coated Sheet Issue'
                    ? eligibleCoatingBatches.map((b) => (
                        <option key={b.coatingBatchCardNumber} value={b.coatingBatchCardNumber}>
                          {b.coatingBatchCardNumber} | Job: {b.jobNumber} | Item: {b.itemCode} (Avail: {b.remainingBalance.toLocaleString()})
                        </option>
                      ))
                    : eligiblePrintingBatches.map((pb) => (
                        <option key={pb.printingBatchCardNumber} value={pb.printingBatchCardNumber}>
                          {pb.printingBatchCardNumber} | Job: {pb.jobNumber} | Item: {pb.itemCode} (Avail: {pb.approvedGoodPrintingStock.toLocaleString()})
                        </option>
                      ))}
                </select>
              </div>
            </div>

            {/* Auto-populated details card */}
            {(selectedCoatingBatch || selectedPrintingBatch) && (
              <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/20 text-xs">
                <div className="flex items-center space-x-2 text-blue-800 dark:text-blue-300 font-bold mb-2">
                  <Info className="w-4 h-4" />
                  <span>Batch Stock & Specification Details:</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                  <div>
                    <span className="text-slate-400 block">Job:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {selectedCoatingBatch?.jobNumber || selectedPrintingBatch?.jobNumber}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Item Code:</span>
                    <span className="font-mono font-semibold text-slate-900 dark:text-white">
                      {selectedCoatingBatch?.itemCode || selectedPrintingBatch?.itemCode}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Item Name:</span>
                    <span className="truncate block font-medium text-slate-800 dark:text-slate-200">
                      {selectedCoatingBatch?.itemName || selectedPrintingBatch?.itemName}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Sheet Size:</span>
                    <span className="font-mono text-slate-900 dark:text-white">
                      {selectedCoatingBatch?.sheetSize || selectedPrintingBatch?.sheetSize}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Coating Spec:</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {selectedCoatingBatch?.coatingCombination ||
                        selectedPrintingBatch?.coatingCombination}{' '}
                      (
                      {selectedCoatingBatch?.sideConfiguration ||
                        selectedPrintingBatch?.sideConfiguration}
                      )
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800">
                    <span className="text-emerald-800 dark:text-emerald-300 font-bold block uppercase text-[10px]">
                      Available Balance:
                    </span>
                    <span className="text-base font-extrabold text-emerald-700 dark:text-emerald-300">
                      {availableBalance.toLocaleString()} sheets
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Quantity & Remarks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Issue Quantity * (Max: {availableBalance.toLocaleString()})
                </label>
                <input
                  type="number"
                  min="1"
                  max={availableBalance || undefined}
                  required
                  placeholder={`Enter quantity up to ${availableBalance.toLocaleString()}`}
                  value={issueQuantity}
                  onChange={(e) =>
                    setIssueQuantity(e.target.value === '' ? '' : Math.max(1, parseInt(e.target.value) || 0))
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Dispatch Remarks (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sent for 4-color offset printing batch 1"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Submit Action */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSubmitting || !selectedBatchCard || availableBalance === 0}
                className="flex items-center px-5 py-2.5 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-900/30 transition-colors disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Confirm Stock Issue ({issueType})
              </button>
            </div>
          </form>
        </div>
      )}

      {/* History Ledger Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Factory Issue Ledger & Tracking
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Complete dispatch audit trail for coated and approved printed sheets
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="ALL">All Issue Types</option>
              <option value="Coated Sheet Issue">Coated Sheet Issue</option>
              <option value="Approved Printed Sheet Issue">Approved Printed Sheet Issue</option>
            </select>

            <div className="relative w-48 sm:w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search issue or batch..."
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
                <th className="px-4 py-3">Issue Number</th>
                <th className="px-4 py-3">Issue Type</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Destination</th>
                <th className="px-4 py-3">Job Number</th>
                <th className="px-4 py-3">Item Code</th>
                <th className="px-4 py-3">Coating Batch</th>
                <th className="px-4 py-3">Printing Batch Generated</th>
                <th className="px-4 py-3 text-right">Issue Qty</th>
                <th className="px-4 py-3">Issued By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredIssues.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-slate-400">
                    No factory issues found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredIssues.map((issue) => (
                  <tr key={issue.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">
                      {issue.issueNumber}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          issue.issueType === 'Coated Sheet Issue'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300'
                            : 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300'
                        }`}
                      >
                        {issue.issueType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{issue.issueDate}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                      {issue.destinationFactory}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">
                      {issue.jobNumber}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-300">
                      {issue.itemCode}
                    </td>
                    <td className="px-4 py-3 font-mono">
                      <button
                        onClick={() => setInspectedBatchCard(issue.coatingBatchCardNumber)}
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {issue.coatingBatchCardNumber}
                      </button>
                    </td>
                    <td className="px-4 py-3 font-mono">
                      {issue.printingBatchCardNumber ? (
                        <button
                          onClick={() => setInspectedBatchCard(issue.printingBatchCardNumber!)}
                          className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          {issue.printingBatchCardNumber}
                        </button>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-slate-900 dark:text-white">
                      {issue.issueQuantity.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{issue.createdByName}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
