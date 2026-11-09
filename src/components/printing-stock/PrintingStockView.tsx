/**
 * UNIMAK WIP STOCK MANAGEMENT SYSTEM
 * Printing Stock Module
 * Section 10 Implementation: Batch-wise Printing Stock with Outstanding WIP, Approved Good, Rejected & Remaining Balances
 */

import React, { useState, useMemo } from 'react';
import {
  Printer,
  Boxes,
  Search,
  Filter,
  Download,
  FileSpreadsheet,
  ExternalLink,
  Clock,
  CheckCircle2,
  AlertOctagon,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { exportToExcel, exportToPDF } from '../../lib/exportUtils';

export const PrintingStockView: React.FC = () => {
  const { allPrintingBatchStocks, setInspectedBatchCard, currentUser, settings } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [wipOnlyFilter, setWipOnlyFilter] = useState(false);

  const canExport = currentUser.role !== 'Viewer' || currentUser.canExportReports;

  // Filtered printing stock
  const filteredBatches = useMemo(() => {
    return allPrintingBatchStocks.filter((b) => {
      if (wipOnlyFilter && b.outstandingPrintingWIP <= 0) return false;
      const q = searchQuery.toLowerCase();
      if (!q) return true;
      return (
        b.printingBatchCardNumber.toLowerCase().includes(q) ||
        b.originalCoatingBatchCardNumber.toLowerCase().includes(q) ||
        b.jobNumber.toLowerCase().includes(q) ||
        b.itemCode.toLowerCase().includes(q) ||
        b.itemName.toLowerCase().includes(q)
      );
    });
  }, [allPrintingBatchStocks, searchQuery, wipOnlyFilter]);

  // Grand totals
  const totals = useMemo(() => {
    return filteredBatches.reduce(
      (acc, cur) => {
        acc.issued += cur.printingLineIssueQuantity;
        acc.approvedGood += cur.goodQuantityReturnedApproved;
        acc.approvedRejected += cur.rejectedQuantityReturnedApproved;
        acc.approvedTotal += cur.totalApprovedReturnedQuantity;
        acc.wip += cur.outstandingPrintingWIP;
        acc.pending += cur.pendingReturnQuantity;
        acc.finalIssued += cur.finalFactoryIssuedQuantity;
        acc.remainingGood += cur.remainingGoodPrintingStock;
        return acc;
      },
      {
        issued: 0,
        approvedGood: 0,
        approvedRejected: 0,
        approvedTotal: 0,
        wip: 0,
        pending: 0,
        finalIssued: 0,
        remainingGood: 0,
      }
    );
  }, [filteredBatches]);

  const handleExportExcel = () => {
    const columns = [
      { header: 'Job Number', dataKey: 'jobNumber' },
      { header: 'Printing Batch Card', dataKey: 'printingBatchCardNumber' },
      { header: 'Orig. Coating Batch', dataKey: 'originalCoatingBatchCardNumber' },
      { header: 'Item Code', dataKey: 'itemCode' },
      { header: 'Item Name', dataKey: 'itemName' },
      { header: 'Sheet Size', dataKey: 'sheetSize' },
      { header: 'Coating Spec', dataKey: 'coatingCombination' },
      { header: 'Side', dataKey: 'sideConfiguration' },
      { header: 'Line Issued Qty', dataKey: 'printingLineIssueQuantity' },
      { header: 'Good QA Returned', dataKey: 'goodQuantityReturnedApproved' },
      { header: 'Rejected QA Returned', dataKey: 'rejectedQuantityReturnedApproved' },
      { header: 'Total QA Returned', dataKey: 'totalApprovedReturnedQuantity' },
      { header: 'Outstanding Printing WIP', dataKey: 'outstandingPrintingWIP' },
      { header: 'Pending Returns', dataKey: 'pendingReturnQuantity' },
      { header: 'Final Factory Issued', dataKey: 'finalFactoryIssuedQuantity' },
      { header: 'Remaining Good Stock', dataKey: 'remainingGoodPrintingStock' },
    ];

    exportToExcel({
      title: 'Printing Stock Summary Report',
      companyName: settings.companyName,
      filename: 'Printing_Stock_Summary',
      columns,
      data: filteredBatches,
      summaryTotals: {
        printingLineIssueQuantity: totals.issued,
        goodQuantityReturnedApproved: totals.approvedGood,
        rejectedQuantityReturnedApproved: totals.approvedRejected,
        totalApprovedReturnedQuantity: totals.approvedTotal,
        outstandingPrintingWIP: totals.wip,
        pendingReturnQuantity: totals.pending,
        finalFactoryIssuedQuantity: totals.finalIssued,
        remainingGoodPrintingStock: totals.remainingGood,
      },
    });
  };

  const handleExportPDF = () => {
    const columns = [
      { header: 'Job', dataKey: 'jobNumber' },
      { header: 'Printing Batch', dataKey: 'printingBatchCardNumber' },
      { header: 'Item', dataKey: 'itemCode' },
      { header: 'Issued', dataKey: 'printingLineIssueQuantity' },
      { header: 'Good Ret', dataKey: 'goodQuantityReturnedApproved' },
      { header: 'Reject Ret', dataKey: 'rejectedQuantityReturnedApproved' },
      { header: 'Printing WIP', dataKey: 'outstandingPrintingWIP' },
      { header: 'Final Issued', dataKey: 'finalFactoryIssuedQuantity' },
      { header: 'Good Balance', dataKey: 'remainingGoodPrintingStock' },
    ];

    exportToPDF({
      title: 'Printing Stock Summary Report',
      companyName: settings.companyName,
      filename: 'Printing_Stock_Summary',
      columns,
      data: filteredBatches,
      summaryTotals: {
        printingLineIssueQuantity: totals.issued,
        goodQuantityReturnedApproved: totals.approvedGood,
        rejectedQuantityReturnedApproved: totals.approvedRejected,
        outstandingPrintingWIP: totals.wip,
        finalFactoryIssuedQuantity: totals.finalIssued,
        remainingGoodPrintingStock: totals.remainingGood,
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Printing Stock & WIP Ledger
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/60 text-violet-800 dark:text-violet-300 font-semibold border border-violet-200 dark:border-violet-700/50">
              Printing Line WIP & Approved Stock
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Batch-wise tracking of Printing Line issues, in-process WIP, approved good inventory, and factory dispatch.
          </p>
        </div>

        {/* Actions */}
        {canExport && (
          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportExcel}
              className="flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5" />
              Export Excel
            </button>
            <button
              onClick={handleExportPDF}
              className="flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 text-white shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Export PDF
            </button>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center space-x-3">
          <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={wipOnlyFilter}
              onChange={(e) => setWipOnlyFilter(e.target.checked)}
              className="rounded text-blue-600"
            />
            <span>Show Only Active WIP Batches (WIP &gt; 0)</span>
          </label>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search Printing Batch, Job, Item..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-3.5 py-3">Job Number</th>
                <th className="px-3.5 py-3">Printing Batch Card</th>
                <th className="px-3.5 py-3">Orig. Coating Batch</th>
                <th className="px-3.5 py-3">Item Code</th>
                <th className="px-3.5 py-3">Sheet Size</th>
                <th className="px-3.5 py-3">Coating Spec</th>
                <th className="px-3.5 py-3 text-right">Line Issued</th>
                <th className="px-3.5 py-3 text-right text-emerald-600 dark:text-emerald-400">
                  Approved Good
                </th>
                <th className="px-3.5 py-3 text-right text-rose-600 dark:text-rose-400">
                  Rejected Stock
                </th>
                <th className="px-3.5 py-3 text-right">Total Returned</th>
                <th className="px-3.5 py-3 text-right text-amber-600 dark:text-amber-400">
                  Printing WIP
                </th>
                <th className="px-3.5 py-3 text-right text-slate-400">Pending Review</th>
                <th className="px-3.5 py-3 text-right">Final Issued</th>
                <th className="px-3.5 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                  Remaining Good Stock
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredBatches.length === 0 ? (
                <tr>
                  <td colSpan={14} className="px-4 py-8 text-center text-slate-400">
                    No printing batch stock records found. Issue coated sheets to Printing Line to initiate printing WIP batches.
                  </td>
                </tr>
              ) : (
                filteredBatches.map((pb) => (
                  <tr key={pb.printingBatchCardNumber} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                    <td className="px-3.5 py-3 font-medium text-slate-900 dark:text-white">
                      {pb.jobNumber}
                    </td>
                    <td className="px-3.5 py-3 font-mono font-bold text-blue-600 dark:text-blue-400">
                      <button
                        onClick={() => setInspectedBatchCard(pb.printingBatchCardNumber)}
                        className="hover:underline flex items-center"
                        title="Click to view full chronological lifecycle"
                      >
                        {pb.printingBatchCardNumber}
                        <ExternalLink className="w-2.5 h-2.5 ml-1" />
                      </button>
                    </td>
                    <td className="px-3.5 py-3 font-mono text-slate-500">
                      <button
                        onClick={() => setInspectedBatchCard(pb.originalCoatingBatchCardNumber)}
                        className="hover:underline"
                      >
                        {pb.originalCoatingBatchCardNumber}
                      </button>
                    </td>
                    <td className="px-3.5 py-3 font-mono text-slate-800 dark:text-slate-200">
                      {pb.itemCode}
                    </td>
                    <td className="px-3.5 py-3 font-mono text-slate-500">{pb.sheetSize}</td>
                    <td className="px-3.5 py-3 text-slate-700 dark:text-slate-300">
                      {pb.coatingCombination}
                    </td>
                    <td className="px-3.5 py-3 text-right font-semibold text-slate-900 dark:text-white">
                      {pb.printingLineIssueQuantity.toLocaleString()}
                    </td>
                    <td className="px-3.5 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                      {pb.goodQuantityReturnedApproved.toLocaleString()}
                    </td>
                    <td className="px-3.5 py-3 text-right font-bold text-rose-600 dark:text-rose-400">
                      {pb.rejectedPrintingStock.toLocaleString()}
                    </td>
                    <td className="px-3.5 py-3 text-right font-semibold text-slate-700 dark:text-slate-300">
                      {pb.totalApprovedReturnedQuantity.toLocaleString()}
                    </td>
                    <td className="px-3.5 py-3 text-right font-bold text-amber-600 dark:text-amber-400 bg-amber-50/30 dark:bg-amber-950/20">
                      {pb.outstandingPrintingWIP.toLocaleString()}
                    </td>
                    <td className="px-3.5 py-3 text-right text-slate-400 font-mono">
                      {pb.pendingReturnQuantity > 0 ? (
                        <span className="text-amber-500 font-bold">
                          +{pb.pendingReturnQuantity.toLocaleString()}
                        </span>
                      ) : (
                        '0'
                      )}
                    </td>
                    <td className="px-3.5 py-3 text-right text-slate-600 dark:text-slate-300">
                      {pb.finalFactoryIssuedQuantity.toLocaleString()}
                    </td>
                    <td className="px-3.5 py-3 text-right font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50/30 dark:bg-emerald-950/20">
                      {pb.remainingGoodPrintingStock.toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>

            {/* Total Row */}
            {filteredBatches.length > 0 && (
              <tfoot className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold border-t-2 border-slate-300 dark:border-slate-700">
                <tr>
                  <td colSpan={6} className="px-3.5 py-3 uppercase tracking-wider text-right">
                    Grand Total Printing Balances:
                  </td>
                  <td className="px-3.5 py-3 text-right">
                    {totals.issued.toLocaleString()}
                  </td>
                  <td className="px-3.5 py-3 text-right text-emerald-600 dark:text-emerald-400">
                    {totals.approvedGood.toLocaleString()}
                  </td>
                  <td className="px-3.5 py-3 text-right text-rose-600 dark:text-rose-400">
                    {totals.approvedRejected.toLocaleString()}
                  </td>
                  <td className="px-3.5 py-3 text-right">
                    {totals.approvedTotal.toLocaleString()}
                  </td>
                  <td className="px-3.5 py-3 text-right text-amber-600 dark:text-amber-400">
                    {totals.wip.toLocaleString()}
                  </td>
                  <td className="px-3.5 py-3 text-right text-slate-400">
                    {totals.pending.toLocaleString()}
                  </td>
                  <td className="px-3.5 py-3 text-right">
                    {totals.finalIssued.toLocaleString()}
                  </td>
                  <td className="px-3.5 py-3 text-right text-emerald-600 dark:text-emerald-400">
                    {totals.remainingGood.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};
