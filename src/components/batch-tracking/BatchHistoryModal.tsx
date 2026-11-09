/**
 * UNIMAK WIP STOCK MANAGEMENT SYSTEM
 * Batch Card Traceability & Chronological History Modal
 * Fulfills Section 13 Lifecycle Requirements
 */

import React from 'react';
import {
  X,
  History,
  CheckCircle,
  Clock,
  Layers,
  Send,
  RotateCcw,
  Boxes,
  Printer,
  AlertOctagon,
  ArrowRight,
  ShieldCheck,
  Building,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const BatchHistoryModal: React.FC = () => {
  const {
    inspectedBatchCard,
    setInspectedBatchCard,
    coatingReceipts,
    factoryIssues,
    qualityReturns,
    getCoatingBatchStock,
    getPrintingBatchStock,
  } = useApp();

  if (!inspectedBatchCard) return null;

  // Determine if it's a coating batch or printing batch
  const coatingReceipt = coatingReceipts.find(
    (c) => c.coatingBatchCardNumber.toLowerCase() === inspectedBatchCard.toLowerCase()
  );

  const isCoating = !!coatingReceipt;

  // All linked issues
  const relatedIssues = factoryIssues.filter((i) =>
    isCoating
      ? i.coatingBatchCardNumber.toLowerCase() === inspectedBatchCard.toLowerCase()
      : i.printingBatchCardNumber?.toLowerCase() === inspectedBatchCard.toLowerCase()
  );

  // Linked quality returns
  const relatedReturns = qualityReturns.filter((q) =>
    isCoating
      ? q.originalCoatingBatchCardNumber.toLowerCase() === inspectedBatchCard.toLowerCase()
      : q.printingBatchCardNumber.toLowerCase() === inspectedBatchCard.toLowerCase()
  );

  const coatingStock = isCoating ? getCoatingBatchStock(inspectedBatchCard) : null;
  const printingStock = !isCoating ? getPrintingBatchStock(inspectedBatchCard) : null;

  // For printing batch, also grab the root coating receipt
  const rootCoatingBatch = !isCoating && relatedIssues.length > 0 ? relatedIssues[0].coatingBatchCardNumber : null;
  const rootCoatingReceipt = rootCoatingBatch
    ? coatingReceipts.find((c) => c.coatingBatchCardNumber === rootCoatingBatch)
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/80 text-blue-800 dark:text-blue-300">
                  {isCoating ? 'Coating Batch Card' : 'Printing Batch Card'}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {inspectedBatchCard}
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Complete End-to-End Chronological Manufacturing Lifecycle
              </p>
            </div>
          </div>
          <button
            onClick={() => setInspectedBatchCard(null)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {isCoating && coatingStock && (
              <>
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block uppercase">
                    Coating Received
                  </span>
                  <span className="text-xl font-bold text-slate-900 dark:text-white mt-1 block">
                    {coatingStock.receivedQuantity.toLocaleString()}{' '}
                    <span className="text-xs font-normal text-slate-400">sheets</span>
                  </span>
                </div>
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block uppercase">
                    Issued to Printing
                  </span>
                  <span className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1 block">
                    {coatingStock.issuedToPrintingLine.toLocaleString()}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block uppercase">
                    Issued to Other Factories
                  </span>
                  <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-1 block">
                    {(
                      coatingStock.issuedToCrownLine +
                      coatingStock.issuedToPlant2 +
                      coatingStock.issuedToPlant3
                    ).toLocaleString()}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20">
                  <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 block uppercase">
                    Remaining Coated Stock
                  </span>
                  <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
                    {coatingStock.remainingBalance.toLocaleString()}{' '}
                    <span className="text-xs font-normal text-emerald-500">sheets</span>
                  </span>
                </div>
              </>
            )}

            {!isCoating && printingStock && (
              <>
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block uppercase">
                    Printing Line Issue
                  </span>
                  <span className="text-xl font-bold text-slate-900 dark:text-white mt-1 block">
                    {printingStock.printingLineIssueQuantity.toLocaleString()}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20">
                  <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 block uppercase">
                    Current Printing WIP
                  </span>
                  <span className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1 block">
                    {printingStock.outstandingPrintingWIP.toLocaleString()}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20">
                  <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 block uppercase">
                    Approved Good Stock
                  </span>
                  <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
                    {printingStock.approvedGoodPrintingStock.toLocaleString()}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20">
                  <span className="text-[11px] font-semibold text-rose-700 dark:text-rose-400 block uppercase">
                    Rejected Stock
                  </span>
                  <span className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-1 block">
                    {printingStock.rejectedPrintingStock.toLocaleString()}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Chronological Event Timeline */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center">
              <Clock className="w-4 h-4 mr-2 text-blue-500" />
              Chronological Audit Trail & Movements
            </h4>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
              {/* Event 1: Originating Coating Receiving */}
              {(coatingReceipt || rootCoatingReceipt) && (
                <div className="relative">
                  <div className="absolute -left-[27px] top-1 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold ring-4 ring-white dark:ring-slate-900">
                    <Layers className="w-3.5 h-3.5" />
                  </div>
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 shadow-xs">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                          1. Coating Receipt Confirmation
                        </span>
                        <h5 className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
                          Batch Card: {(coatingReceipt || rootCoatingReceipt)?.coatingBatchCardNumber}
                        </h5>
                      </div>
                      <span className="text-xs text-slate-400">
                        {(coatingReceipt || rootCoatingReceipt)?.receivingDate}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300">
                      <div>
                        <span className="text-slate-400 block">Job:</span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {(coatingReceipt || rootCoatingReceipt)?.jobNumber}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Item:</span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {(coatingReceipt || rootCoatingReceipt)?.itemCode}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Coating Spec:</span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {(coatingReceipt || rootCoatingReceipt)?.coatingCombination} (
                          {(coatingReceipt || rootCoatingReceipt)?.sideConfiguration})
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Received Quantity:</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          {(coatingReceipt || rootCoatingReceipt)?.receivedQuantity.toLocaleString()}{' '}
                          Sheets
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Event 2: Issues to Factories */}
              {relatedIssues.map((issue, idx) => (
                <div key={issue.id} className="relative">
                  <div className="absolute -left-[27px] top-1 w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold ring-4 ring-white dark:ring-slate-900">
                    <Send className="w-3.5 h-3.5" />
                  </div>
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 shadow-xs">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                          Factory Issue ({issue.issueType})
                        </span>
                        <h5 className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
                          Issued to: {issue.destinationFactory}
                        </h5>
                      </div>
                      <span className="text-xs text-slate-400">{issue.issueDate}</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300">
                      <div>
                        <span className="text-slate-400 block">Issue Number:</span>
                        <span className="font-mono">{issue.issueNumber}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Issue Quantity:</span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {issue.issueQuantity.toLocaleString()} Sheets
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Printing Batch Generated:</span>
                        <span className="font-mono text-blue-600 dark:text-blue-400">
                          {issue.printingBatchCardNumber || 'N/A (Final Factory Issue)'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Event 3: Quality Returns */}
              {relatedReturns.map((qr) => (
                <div key={qr.id} className="relative">
                  <div
                    className={`absolute -left-[27px] top-1 w-6 h-6 rounded-full text-white flex items-center justify-center text-xs font-bold ring-4 ring-white dark:ring-slate-900 ${
                      qr.status === 'Approved'
                        ? 'bg-emerald-600'
                        : qr.status === 'Submitted'
                        ? 'bg-amber-600'
                        : 'bg-slate-600'
                    }`}
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </div>
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 shadow-xs">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                              qr.status === 'Approved'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : qr.status === 'Submitted'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                                : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                            }`}
                          >
                            Status: {qr.status}
                          </span>
                          <span className="text-xs text-slate-500 font-mono">
                            {qr.returnNumber}
                          </span>
                        </div>
                        <h5 className="text-sm font-semibold text-slate-900 dark:text-white mt-1">
                          Returned: {qr.totalReturnedQuantity.toLocaleString()} Sheets (Good:{' '}
                          {qr.goodQuantity.toLocaleString()}, Rejected:{' '}
                          {qr.rejectedQuantity.toLocaleString()})
                        </h5>
                      </div>
                      <span className="text-xs text-slate-400">{qr.returnDate}</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300">
                      <div>
                        <span className="text-slate-400 block">Submitted By:</span>
                        <span>{qr.submittedByName}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Approved By:</span>
                        <span className="font-medium text-emerald-600 dark:text-emerald-400">
                          {qr.approvedByName || 'Pending Approval'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Stock Effect:</span>
                        <span className="italic">
                          {qr.status === 'Approved'
                            ? 'Deducted Printing WIP; Added Good & Rejected Stock'
                            : 'No Stock Change (Pending)'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={() => setInspectedBatchCard(null)}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors"
          >
            Close Traceability View
          </button>
        </div>
      </div>
    </div>
  );
};
