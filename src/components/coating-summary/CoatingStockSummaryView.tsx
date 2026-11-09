/**
 * UNIMAK WIP STOCK MANAGEMENT SYSTEM
 * Coating Stock Summary Module
 * Section 9 Implementation: Unique Item-wise Aggregations, Expandable Batch Breakdowns, Totals, and Exports
 */

import React, { useState, useMemo } from 'react';
import {
  Boxes,
  Layers,
  ChevronDown,
  ChevronRight,
  Search,
  Filter,
  Download,
  FileSpreadsheet,
  Printer,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { exportToExcel, exportToPDF } from '../../lib/exportUtils';

export const CoatingStockSummaryView: React.FC = () => {
  const { itemCoatingSummaries, setInspectedBatchCard, currentUser, settings } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSizeFilter, setSelectedSizeFilter] = useState('ALL');
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const canExport = currentUser.role !== 'Viewer' || currentUser.canExportReports;

  // Toggle item expansion
  const toggleExpand = (itemCode: string) => {
    setExpandedItems((prev) => ({ ...prev, [itemCode]: !prev[itemCode] }));
  };

  // Unique Sheet Sizes for filter
  const sheetSizesInStock = useMemo(() => {
    return Array.from(new Set(itemCoatingSummaries.map((s) => s.sheetSize)));
  }, [itemCoatingSummaries]);

  // Filtered Summaries
  const filteredSummaries = useMemo(() => {
    return itemCoatingSummaries.filter((sum) => {
      if (selectedSizeFilter !== 'ALL' && sum.sheetSize !== selectedSizeFilter) return false;
      const q = searchQuery.toLowerCase();
      if (!q) return true;
      const matchesItem =
        sum.itemCode.toLowerCase().includes(q) || sum.itemName.toLowerCase().includes(q);
      const matchesBatch = sum.batches.some(
        (b) =>
          b.coatingBatchCardNumber.toLowerCase().includes(q) ||
          b.jobNumber.toLowerCase().includes(q) ||
          b.coatingCombination.toLowerCase().includes(q)
      );
      return matchesItem || matchesBatch;
    });
  }, [itemCoatingSummaries, searchQuery, selectedSizeFilter]);

  // Grand Totals
  const grandTotals = useMemo(() => {
    return filteredSummaries.reduce(
      (acc, cur) => {
        acc.totalReceived += cur.totalReceivedQuantity;
        acc.totalIssued += cur.totalIssuedQuantity;
        acc.currentStock += cur.currentCoatingStock;
        acc.batchCount += cur.activeCoatingBatchCount;
        return acc;
      },
      { totalReceived: 0, totalIssued: 0, currentStock: 0, batchCount: 0 }
    );
  }, [filteredSummaries]);

  // Export handlers
  const handleExportExcel = () => {
    const columns = [
      { header: 'Item Code', dataKey: 'itemCode' },
      { header: 'Item Name', dataKey: 'itemName' },
      { header: 'Sheet Size', dataKey: 'sheetSize' },
      { header: 'Total Received (Sheets)', dataKey: 'totalReceivedQuantity' },
      { header: 'Total Issued (Sheets)', dataKey: 'totalIssuedQuantity' },
      { header: 'Current Coating Stock', dataKey: 'currentCoatingStock' },
      { header: 'Active Batch Count', dataKey: 'activeCoatingBatchCount' },
    ];

    exportToExcel({
      title: 'Coating Stock Summary Report',
      companyName: settings.companyName,
      filename: 'Coating_Stock_Summary',
      columns,
      data: filteredSummaries,
      summaryTotals: {
        totalReceivedQuantity: grandTotals.totalReceived,
        totalIssuedQuantity: grandTotals.totalIssued,
        currentCoatingStock: grandTotals.currentStock,
        activeCoatingBatchCount: grandTotals.batchCount,
      },
    });
  };

  const handleExportPDF = () => {
    const columns = [
      { header: 'Item Code', dataKey: 'itemCode' },
      { header: 'Item Name', dataKey: 'itemName' },
      { header: 'Sheet Size', dataKey: 'sheetSize' },
      { header: 'Received', dataKey: 'totalReceivedQuantity' },
      { header: 'Issued', dataKey: 'totalIssuedQuantity' },
      { header: 'Stock Balance', dataKey: 'currentCoatingStock' },
      { header: 'Active Batches', dataKey: 'activeCoatingBatchCount' },
    ];

    exportToPDF({
      title: 'Coating Stock Summary Report',
      companyName: settings.companyName,
      filename: 'Coating_Stock_Summary',
      columns,
      data: filteredSummaries,
      summaryTotals: {
        totalReceivedQuantity: grandTotals.totalReceived,
        totalIssuedQuantity: grandTotals.totalIssued,
        currentCoatingStock: grandTotals.currentStock,
        activeCoatingBatchCount: grandTotals.batchCount,
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
              Coating Stock Summary
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-700/50">
              Coated Warehouse Balances
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Aggregated item-wise inventory with multi-specification and coating batch card drill-down.
          </p>
        </div>

        {/* Export Buttons */}
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
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Filter Sheet Size:
          </span>
          <select
            value={selectedSizeFilter}
            onChange={(e) => setSelectedSizeFilter(e.target.value)}
            className="text-xs py-1 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
          >
            <option value="ALL">All Sheet Sizes</option>
            {sheetSizesInStock.map((sz) => (
              <option key={sz} value={sz}>
                {sz}
              </option>
            ))}
          </select>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search Item, Job, or Batch Card..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* Main Item-wise Aggregation Table with Drill-Down */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="w-10 px-4 py-3"></th>
                <th className="px-4 py-3">Item Code</th>
                <th className="px-4 py-3">Item Name</th>
                <th className="px-4 py-3">Sheet Size</th>
                <th className="px-4 py-3 text-right">Total Received (Sheets)</th>
                <th className="px-4 py-3 text-right">Total Issued (Sheets)</th>
                <th className="px-4 py-3 text-right">Current Coating Stock</th>
                <th className="px-4 py-3 text-center">Active Batches</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredSummaries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                    No coating stock records found. Receive coated sheets to generate balances.
                  </td>
                </tr>
              ) : (
                filteredSummaries.map((itemSum) => {
                  const isExpanded = !!expandedItems[itemSum.itemCode];
                  return (
                    <React.Fragment key={itemSum.itemCode}>
                      {/* Item-level Summary Row */}
                      <tr
                        onClick={() => toggleExpand(itemSum.itemCode)}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 cursor-pointer font-medium transition-colors"
                      >
                        <td className="px-4 py-3 text-center">
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-blue-600 dark:text-blue-400 inline" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-slate-400 inline" />
                          )}
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-blue-600 dark:text-blue-400">
                          {itemSum.itemCode}
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                          {itemSum.itemName}
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-300">
                          {itemSum.sheetSize}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-white">
                          {itemSum.totalReceivedQuantity.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-slate-600 dark:text-slate-300">
                          {itemSum.totalIssuedQuantity.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                          {itemSum.currentCoatingStock.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300">
                            {itemSum.activeCoatingBatchCount} Batches
                          </span>
                        </td>
                      </tr>

                      {/* Drill-down: Coating Batch-wise Breakdown */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={8} className="p-0 bg-slate-50/50 dark:bg-slate-950/40">
                            <div className="p-4 pl-12 border-y border-slate-200 dark:border-slate-800 space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                  Batch-wise Stock Breakdown for SKU: {itemSum.itemCode}
                                </span>
                                <span className="text-[11px] text-slate-400">
                                  Click batch card to view full chronological audit lifecycle
                                </span>
                              </div>

                              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
                                <table className="w-full text-left text-[11px]">
                                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700">
                                    <tr>
                                      <th className="px-3 py-2">Job Number</th>
                                      <th className="px-3 py-2">Coating Batch Card</th>
                                      <th className="px-3 py-2">Coating Combination</th>
                                      <th className="px-3 py-2">Side</th>
                                      <th className="px-3 py-2 text-right">Received Qty</th>
                                      <th className="px-3 py-2 text-right">To Printing</th>
                                      <th className="px-3 py-2 text-right">To Crown</th>
                                      <th className="px-3 py-2 text-right">To Plant 2</th>
                                      <th className="px-3 py-2 text-right">To Plant 3</th>
                                      <th className="px-3 py-2 text-right">Total Issued</th>
                                      <th className="px-3 py-2 text-right">Balance</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {itemSum.batches.map((batch) => (
                                      <tr
                                        key={batch.coatingBatchCardNumber}
                                        className="hover:bg-slate-50 dark:hover:bg-slate-800/40"
                                      >
                                        <td className="px-3 py-2 font-medium">{batch.jobNumber}</td>
                                        <td className="px-3 py-2 font-mono font-bold text-blue-600 dark:text-blue-400">
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setInspectedBatchCard(batch.coatingBatchCardNumber);
                                            }}
                                            className="hover:underline flex items-center"
                                          >
                                            {batch.coatingBatchCardNumber}
                                            <ExternalLink className="w-2.5 h-2.5 ml-1" />
                                          </button>
                                        </td>
                                        <td className="px-3 py-2 font-medium">{batch.coatingCombination}</td>
                                        <td className="px-3 py-2">{batch.sideConfiguration}</td>
                                        <td className="px-3 py-2 text-right font-semibold">
                                          {batch.receivedQuantity.toLocaleString()}
                                        </td>
                                        <td className="px-3 py-2 text-right text-indigo-600 dark:text-indigo-400">
                                          {batch.issuedToPrintingLine.toLocaleString()}
                                        </td>
                                        <td className="px-3 py-2 text-right text-slate-500">
                                          {batch.issuedToCrownLine.toLocaleString()}
                                        </td>
                                        <td className="px-3 py-2 text-right text-slate-500">
                                          {batch.issuedToPlant2.toLocaleString()}
                                        </td>
                                        <td className="px-3 py-2 text-right text-slate-500">
                                          {batch.issuedToPlant3.toLocaleString()}
                                        </td>
                                        <td className="px-3 py-2 text-right font-medium">
                                          {batch.totalIssuedQuantity.toLocaleString()}
                                        </td>
                                        <td className="px-3 py-2 text-right font-bold text-emerald-600 dark:text-emerald-400">
                                          {batch.remainingBalance.toLocaleString()}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>

            {/* Mandated Grand Total Row at Bottom */}
            {filteredSummaries.length > 0 && (
              <tfoot className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold border-t-2 border-slate-300 dark:border-slate-700">
                <tr>
                  <td colSpan={4} className="px-4 py-3 uppercase tracking-wider text-right">
                    Grand Total Coated Stock:
                  </td>
                  <td className="px-4 py-3 text-right">
                    {grandTotals.totalReceived.toLocaleString()} Sheets
                  </td>
                  <td className="px-4 py-3 text-right">
                    {grandTotals.totalIssued.toLocaleString()} Sheets
                  </td>
                  <td className="px-4 py-3 text-right text-emerald-600 dark:text-emerald-400">
                    {grandTotals.currentStock.toLocaleString()} Sheets
                  </td>
                  <td className="px-4 py-3 text-center">
                    {grandTotals.batchCount} Active Batches
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
