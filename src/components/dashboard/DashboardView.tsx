/**
 * UNIMAK WIP STOCK MANAGEMENT SYSTEM
 * Operational Dashboard
 * Real Database Records, 14 KPI Cards, 8 Analytical Recharts, and Multi-Filter Engine
 */

import React, { useState, useMemo } from 'react';
import {
  Layers,
  Boxes,
  Send,
  Building2,
  Clock,
  CheckCircle2,
  AlertOctagon,
  RotateCcw,
  Printer,
  Briefcase,
  FileText,
  Filter,
  Calendar,
  BarChart3,
  TrendingUp,
  PieChart as PieIcon,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';
import { useApp } from '../../context/AppContext';

export const DashboardView: React.FC = () => {
  const {
    jobs,
    items,
    coatingReceipts,
    factoryIssues,
    qualityReturns,
    allPrintingBatchStocks,
    itemCoatingSummaries,
    setActivePage,
    theme,
  } = useApp();

  // Filters State
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'this_week' | 'this_month' | 'custom'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedJob, setSelectedJob] = useState('ALL');
  const [selectedItem, setSelectedItem] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'COATING' | 'PRINTING'>('ALL');

  // Filtered Transactions
  const filteredData = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    // Helper to test date
    const matchesDate = (dateStr: string) => {
      if (dateFilter === 'all') return true;
      if (dateFilter === 'today') return dateStr === todayStr;
      if (dateFilter === 'this_week') {
        const d = new Date(dateStr);
        const dayOfWeek = now.getDay();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - dayOfWeek);
        return d >= startOfWeek;
      }
      if (dateFilter === 'this_month') {
        return dateStr.startsWith(todayStr.slice(0, 7));
      }
      if (dateFilter === 'custom' && startDate && endDate) {
        return dateStr >= startDate && dateStr <= endDate;
      }
      return true;
    };

    const receipts = coatingReceipts.filter(
      (r) =>
        !r.isReversed &&
        matchesDate(r.receivingDate) &&
        (selectedJob === 'ALL' || r.jobNumber === selectedJob) &&
        (selectedItem === 'ALL' || r.itemCode === selectedItem)
    );

    const issues = factoryIssues.filter(
      (i) =>
        !i.isReversed &&
        matchesDate(i.issueDate) &&
        (selectedJob === 'ALL' || i.jobNumber === selectedJob) &&
        (selectedItem === 'ALL' || i.itemCode === selectedItem)
    );

    const qReturns = qualityReturns.filter(
      (q) =>
        matchesDate(q.returnDate) &&
        (selectedJob === 'ALL' || q.jobNumber === selectedJob) &&
        (selectedItem === 'ALL' || q.itemCode === selectedItem)
    );

    return { receipts, issues, qReturns };
  }, [coatingReceipts, factoryIssues, qualityReturns, dateFilter, startDate, endDate, selectedJob, selectedItem]);

  // Mandatory KPI Calculations
  const totalCoatingReceived = useMemo(() => {
    return filteredData.receipts.reduce((sum, r) => sum + r.receivedQuantity, 0);
  }, [filteredData.receipts]);

  const coatedIssues = useMemo(() => {
    return filteredData.issues.filter((i) => i.issueType === 'Coated Sheet Issue');
  }, [filteredData.issues]);

  const totalIssuedToPrinting = useMemo(() => {
    return coatedIssues.filter((i) => i.isPrintingLine).reduce((sum, i) => sum + i.issueQuantity, 0);
  }, [coatedIssues]);

  const totalIssuedToOtherFactories = useMemo(() => {
    return coatedIssues.filter((i) => !i.isPrintingLine).reduce((sum, i) => sum + i.issueQuantity, 0);
  }, [coatedIssues]);

  const currentCoatingStock = Math.max(0, totalCoatingReceived - (totalIssuedToPrinting + totalIssuedToOtherFactories));

  const approvedReturns = useMemo(() => {
    return filteredData.qReturns.filter((q) => q.status === 'Approved');
  }, [filteredData.qReturns]);

  const totalGoodSheetsReturned = useMemo(() => {
    return approvedReturns.reduce((sum, q) => sum + q.goodQuantity, 0);
  }, [approvedReturns]);

  const totalRejectedSheetsReturned = useMemo(() => {
    return approvedReturns.reduce((sum, q) => sum + q.rejectedQuantity, 0);
  }, [approvedReturns]);

  const totalReturnedQuantity = totalGoodSheetsReturned + totalRejectedSheetsReturned;

  const currentPrintingWIP = Math.max(0, totalIssuedToPrinting - totalReturnedQuantity);

  const finalFactoryIssues = useMemo(() => {
    return filteredData.issues.filter((i) => i.issueType === 'Approved Printed Sheet Issue');
  }, [filteredData.issues]);

  const totalFinalFactoryIssues = useMemo(() => {
    return finalFactoryIssues.reduce((sum, i) => sum + i.issueQuantity, 0);
  }, [finalFactoryIssues]);

  const approvedGoodPrintingStock = Math.max(0, totalGoodSheetsReturned - totalFinalFactoryIssues);
  const rejectedPrintingStock = totalRejectedSheetsReturned;

  const pendingQualityApprovals = useMemo(() => {
    return filteredData.qReturns.filter((q) => q.status === 'Submitted').length;
  }, [filteredData.qReturns]);

  const activeJobsCount = jobs.filter((j) => j.active).length;
  const activeItemsCount = items.filter((i) => i.active).length;
  const activePrintingBatchesCount = allPrintingBatchStocks.filter((b) => b.outstandingPrintingWIP > 0).length;

  // Colors for Recharts
  const isDark = theme === 'dark';
  const axisColor = isDark ? '#94a3b8' : '#64748b';
  const gridColor = isDark ? '#334155' : '#e2e8f0';

  // Chart 1: Item-wise Coating Stock
  const itemCoatingChartData = useMemo(() => {
    return itemCoatingSummaries.slice(0, 8).map((it) => ({
      name: it.itemCode,
      Stock: it.currentCoatingStock,
      Issued: it.totalIssuedQuantity,
    }));
  }, [itemCoatingSummaries]);

  // Chart 2: Item-wise Printing Stock
  const itemPrintingChartData = useMemo(() => {
    const itemMap = new Map<string, { good: number; rejected: number; wip: number }>();
    allPrintingBatchStocks.forEach((pb) => {
      if (!itemMap.has(pb.itemCode)) {
        itemMap.set(pb.itemCode, { good: 0, rejected: 0, wip: 0 });
      }
      const cur = itemMap.get(pb.itemCode)!;
      cur.good += pb.approvedGoodPrintingStock;
      cur.rejected += pb.rejectedPrintingStock;
      cur.wip += pb.outstandingPrintingWIP;
    });

    return Array.from(itemMap.entries()).map(([code, val]) => ({
      name: code,
      'Approved Good': val.good,
      'Rejected Stock': val.rejected,
      'Printing WIP': val.wip,
    }));
  }, [allPrintingBatchStocks]);

  // Chart 3: Coating Received vs Issued
  const coatingComparisonData = useMemo(() => {
    return [
      { name: 'Received', value: totalCoatingReceived, fill: '#3b82f6' },
      { name: 'Issued to Printing', value: totalIssuedToPrinting, fill: '#8b5cf6' },
      { name: 'Issued to Other', value: totalIssuedToOtherFactories, fill: '#6366f1' },
      { name: 'Current Stock', value: currentCoatingStock, fill: '#10b981' },
    ];
  }, [totalCoatingReceived, totalIssuedToPrinting, totalIssuedToOtherFactories, currentCoatingStock]);

  // Chart 4: Factory-wise Issued Quantity
  const factoryDistributionData = useMemo(() => {
    const map = new Map<string, number>();
    filteredData.issues.forEach((i) => {
      map.set(i.destinationFactory, (map.get(i.destinationFactory) || 0) + i.issueQuantity);
    });
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];
    return Array.from(map.entries()).map(([name, value], idx) => ({
      name,
      value,
      color: colors[idx % colors.length],
    }));
  }, [filteredData.issues]);

  // Chart 5: Good vs Rejected Sheets
  const goodVsRejectedData = useMemo(() => {
    return [
      { name: 'Good Sheets', value: totalGoodSheetsReturned, fill: '#10b981' },
      { name: 'Rejected Sheets', value: totalRejectedSheetsReturned, fill: '#ef4444' },
    ];
  }, [totalGoodSheetsReturned, totalRejectedSheetsReturned]);

  // Chart 6: Monthly Stock Movement
  const monthlyMovementData = useMemo(() => {
    const map = new Map<string, { received: number; issued: number; returned: number }>();
    filteredData.receipts.forEach((r) => {
      const m = r.receivingDate.slice(0, 7);
      if (!map.has(m)) map.set(m, { received: 0, issued: 0, returned: 0 });
      map.get(m)!.received += r.receivedQuantity;
    });
    filteredData.issues.forEach((i) => {
      const m = i.issueDate.slice(0, 7);
      if (!map.has(m)) map.set(m, { received: 0, issued: 0, returned: 0 });
      map.get(m)!.issued += i.issueQuantity;
    });
    filteredData.qReturns.forEach((q) => {
      if (q.status === 'Approved') {
        const m = q.returnDate.slice(0, 7);
        if (!map.has(m)) map.set(m, { received: 0, issued: 0, returned: 0 });
        map.get(m)!.returned += q.totalReturnedQuantity;
      }
    });

    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, data]) => ({
        month,
        Received: data.received,
        Issued: data.issued,
        'QA Returned': data.returned,
      }));
  }, [filteredData]);

  // Chart 7: Job-wise Stock Distribution
  const jobDistributionData = useMemo(() => {
    const map = new Map<string, number>();
    filteredData.receipts.forEach((r) => {
      map.set(r.jobNumber, (map.get(r.jobNumber) || 0) + r.receivedQuantity);
    });
    return Array.from(map.entries()).map(([job, qty]) => ({
      name: job,
      Received: qty,
    }));
  }, [filteredData.receipts]);

  // Chart 8: Rejection Trend
  const rejectionTrendData = useMemo(() => {
    return approvedReturns.map((qr) => ({
      date: qr.returnDate,
      RejectionRate:
        qr.totalReturnedQuantity > 0
          ? Number(((qr.rejectedQuantity / qr.totalReturnedQuantity) * 100).toFixed(1))
          : 0,
      RejectedSheets: qr.rejectedQuantity,
    }));
  }, [approvedReturns]);

  const hasAnyData =
    coatingReceipts.length > 0 || factoryIssues.length > 0 || qualityReturns.length > 0;

  return (
    <div className="space-y-6">
      {/* Page Title & Operational Status */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Executive WIP Stock Dashboard
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-700/50">
              Live Production
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time material balances, coating inventory, printing WIP, and quality return reconciliation.
          </p>
        </div>

        {/* Global Filter Bar */}
        <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center space-x-1.5 px-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
            <Filter className="w-3.5 h-3.5 text-blue-500" />
            <span>Filters:</span>
          </div>

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as any)}
            className="text-xs py-1 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:outline-hidden focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="this_week">This Week</option>
            <option value="this_month">This Month</option>
            <option value="custom">Custom Date Range</option>
          </select>

          {dateFilter === 'custom' && (
            <div className="flex items-center space-x-1">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="text-xs py-1 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
              <span className="text-xs text-slate-400">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="text-xs py-1 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
          )}

          <select
            value={selectedJob}
            onChange={(e) => setSelectedJob(e.target.value)}
            className="text-xs py-1 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:outline-hidden focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">All Jobs</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.jobNumber}>
                {j.jobNumber} - {j.jobName}
              </option>
            ))}
          </select>

          <select
            value={selectedItem}
            onChange={(e) => setSelectedItem(e.target.value)}
            className="text-xs py-1 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:outline-hidden focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">All Items</option>
            {items.map((it) => (
              <option key={it.id} value={it.itemCode}>
                {it.itemCode} - {it.itemName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Empty State Banner if no transactions entered yet */}
      {!hasAnyData && (
        <div className="p-6 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-center">
          <div className="w-12 h-12 mx-auto rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
            <Boxes className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Clean Manufacturing Operational Slate
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto mt-1">
            As specified in system requirements, no fake transactions or invented demo stock are loaded.
            Authorized operators can configure Master Data, post Coating Receipts, issue to lines, and approve Quality Returns.
          </p>
          <div className="flex justify-center gap-3 mt-4">
            <button
              onClick={() => setActivePage('master-data')}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors"
            >
              Configure Master Data
            </button>
            <button
              onClick={() => setActivePage('coating-receiving')}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors"
            >
              Post First Coating Receipt
            </button>
          </div>
        </div>
      )}

      {/* 14 Mandated KPI Cards in Clean High-Density Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
        {/* 1. Total Coating Received */}
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Coating Received
            </span>
            <Layers className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-white mt-1">
            {totalCoatingReceived.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-400">Sheets Confirmed</span>
        </div>

        {/* 2. Current Coating Stock */}
        <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Current Coating Stock
            </span>
            <Boxes className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {currentCoatingStock.toLocaleString()}
          </div>
          <span className="text-[10px] text-emerald-600/70 dark:text-emerald-400/70">Available for Issue</span>
        </div>

        {/* 3. Total Issued to Printing Line */}
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Issued to Printing
            </span>
            <Send className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mt-1">
            {totalIssuedToPrinting.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-400">Decorating Line</span>
        </div>

        {/* 4. Total Issued to Other Factories */}
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Issued to Plants
            </span>
            <Building2 className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-lg font-bold text-purple-600 dark:text-purple-400 mt-1">
            {totalIssuedToOtherFactories.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-400">Crown, PL2, PL3</span>
        </div>

        {/* 5. Current Printing WIP */}
        <div className="p-3.5 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/40 dark:bg-amber-950/20 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
              Current Printing WIP
            </span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-lg font-bold text-amber-600 dark:text-amber-400 mt-1">
            {currentPrintingWIP.toLocaleString()}
          </div>
          <span className="text-[10px] text-amber-600/70 dark:text-amber-400/70">On Line (Unapproved)</span>
        </div>

        {/* 6. Approved Good Printing Stock */}
        <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Approved Good Stock
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {approvedGoodPrintingStock.toLocaleString()}
          </div>
          <span className="text-[10px] text-emerald-600/70 dark:text-emerald-400/70">QA Approved Good</span>
        </div>

        {/* 7. Rejected Printing Stock */}
        <div className="p-3.5 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/40 dark:bg-rose-950/20 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-700 dark:text-rose-400">
              Rejected Printing Stock
            </span>
            <AlertOctagon className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-lg font-bold text-rose-600 dark:text-rose-400 mt-1">
            {rejectedPrintingStock.toLocaleString()}
          </div>
          <span className="text-[10px] text-rose-600/70 dark:text-rose-400/70">Non-Conforming</span>
        </div>

        {/* 8. Total Good Sheets Returned */}
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Good Returned
            </span>
            <RotateCcw className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-white mt-1">
            {totalGoodSheetsReturned.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-400">Approved QA Passes</span>
        </div>

        {/* 9. Total Rejected Sheets Returned */}
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Rejections
            </span>
            <RotateCcw className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-white mt-1">
            {totalRejectedSheetsReturned.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-400">Cumulative Rejects</span>
        </div>

        {/* 10. Total Final Factory Issues */}
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Final Factory Issues
            </span>
            <Send className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="text-lg font-bold text-cyan-600 dark:text-cyan-400 mt-1">
            {totalFinalFactoryIssues.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-400">Approved Printed Out</span>
        </div>

        {/* 11. Pending Quality Approvals */}
        <div
          onClick={() => setActivePage('quality-return')}
          className="p-3.5 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-100/50 dark:bg-amber-950/40 shadow-2xs cursor-pointer hover:border-amber-400 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
              Pending QA Approvals
            </span>
            <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-ping" />
          </div>
          <div className="text-lg font-bold text-amber-700 dark:text-amber-300 mt-1">
            {pendingQualityApprovals}
          </div>
          <span className="text-[10px] text-amber-700/80 dark:text-amber-400/80 font-medium underline flex items-center mt-0.5">
            Review Submissions <ExternalLink className="w-2.5 h-2.5 ml-1" />
          </span>
        </div>

        {/* 12. Active Jobs */}
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Active Jobs
            </span>
            <Briefcase className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-white mt-1">
            {activeJobsCount}
          </div>
          <span className="text-[10px] text-slate-400">Production Orders</span>
        </div>

        {/* 13. Active Items */}
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Active Items
            </span>
            <FileText className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-white mt-1">
            {activeItemsCount}
          </div>
          <span className="text-[10px] text-slate-400">SKUs in Master Data</span>
        </div>

        {/* 14. Active Printing Batches */}
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Active Print Batches
            </span>
            <Printer className="w-4 h-4 text-violet-500" />
          </div>
          <div className="text-lg font-bold text-violet-600 dark:text-violet-400 mt-1">
            {activePrintingBatchesCount}
          </div>
          <span className="text-[10px] text-slate-400">In-Process WIP Batches</span>
        </div>
      </div>

      {/* 8 Analytical Charts in 2x4 Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graph 1: Item-wise Coating Stock */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                1. Item-wise Coating Stock
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Available vs Issued coated sheets</p>
            </div>
            <BarChart3 className="w-4 h-4 text-blue-500" />
          </div>
          <div className="h-64">
            {itemCoatingChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No coating data matching active filters
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={itemCoatingChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="name" stroke={axisColor} fontSize={11} />
                  <YAxis stroke={axisColor} fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#0f172a' : '#ffffff',
                      borderColor: isDark ? '#334155' : '#cbd5e1',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="Stock" fill="#3b82f6" name="Current Stock" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Issued" fill="#94a3b8" name="Total Issued" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Graph 2: Item-wise Printing Stock */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                2. Item-wise Printing Stock Breakdown
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Approved Good vs Rejected vs WIP</p>
            </div>
            <Printer className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="h-64">
            {itemPrintingChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No printing batches matching active filters
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={itemPrintingChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="name" stroke={axisColor} fontSize={11} />
                  <YAxis stroke={axisColor} fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#0f172a' : '#ffffff',
                      borderColor: isDark ? '#334155' : '#cbd5e1',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="Approved Good" fill="#10b981" stackId="a" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="Rejected Stock" fill="#ef4444" stackId="a" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="Printing WIP" fill="#f59e0b" stackId="a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Graph 3: Coating Received vs Issued */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                3. Coating Material Flow
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Received vs Line Issues vs Remaining</p>
            </div>
            <TrendingUp className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="h-64">
            {totalCoatingReceived === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No coating flow records
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={coatingComparisonData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis type="number" stroke={axisColor} fontSize={11} />
                  <YAxis dataKey="name" type="category" stroke={axisColor} fontSize={11} width={120} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#0f172a' : '#ffffff',
                      borderColor: isDark ? '#334155' : '#cbd5e1',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="value" name="Sheets" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                    {coatingComparisonData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Graph 4: Factory-wise Issued Quantity */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                4. Factory-wise Material Distribution
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Cumulative sheets issued per plant/line</p>
            </div>
            <PieIcon className="w-4 h-4 text-purple-500" />
          </div>
          <div className="h-64 flex items-center justify-center">
            {factoryDistributionData.length === 0 ? (
              <div className="text-xs text-slate-400">No factory issues recorded</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={factoryDistributionData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                    fontSize={11}
                  >
                    {factoryDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#0f172a' : '#ffffff',
                      borderColor: isDark ? '#334155' : '#cbd5e1',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Graph 5: Good vs Rejected Sheets */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                5. Quality Inspection Yield (Good vs Rejected)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Approved Quality Return conformance</p>
            </div>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="h-64 flex items-center justify-center">
            {totalGoodSheetsReturned === 0 && totalRejectedSheetsReturned === 0 ? (
              <div className="text-xs text-slate-400">No approved quality returns yet</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={goodVsRejectedData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(1)}%`}
                    fontSize={11}
                  >
                    {goodVsRejectedData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#0f172a' : '#ffffff',
                      borderColor: isDark ? '#334155' : '#cbd5e1',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Graph 6: Monthly Stock Movement */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                6. Monthly Stock Velocity
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Receiving, line issuing, and QA return rate</p>
            </div>
            <Calendar className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="h-64">
            {monthlyMovementData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No monthly transactions recorded
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyMovementData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="month" stroke={axisColor} fontSize={11} />
                  <YAxis stroke={axisColor} fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#0f172a' : '#ffffff',
                      borderColor: isDark ? '#334155' : '#cbd5e1',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Area type="monotone" dataKey="Received" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                  <Area type="monotone" dataKey="Issued" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} />
                  <Area type="monotone" dataKey="QA Returned" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Graph 7: Job-wise Stock Distribution */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                7. Job-wise Material Distribution
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Total coating intake per production job</p>
            </div>
            <Briefcase className="w-4 h-4 text-amber-500" />
          </div>
          <div className="h-64">
            {jobDistributionData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No job data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={jobDistributionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="name" stroke={axisColor} fontSize={11} />
                  <YAxis stroke={axisColor} fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#0f172a' : '#ffffff',
                      borderColor: isDark ? '#334155' : '#cbd5e1',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="Received" fill="#f59e0b" name="Sheets Received" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Graph 8: Rejection Trend Over Time */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                8. Rejection Trend Over Time (%)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Quality rejection percentage per approved lot</p>
            </div>
            <AlertOctagon className="w-4 h-4 text-rose-500" />
          </div>
          <div className="h-64">
            {rejectionTrendData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No rejection data recorded yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={rejectionTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="date" stroke={axisColor} fontSize={11} />
                  <YAxis stroke={axisColor} fontSize={11} unit="%" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#0f172a' : '#ffffff',
                      borderColor: isDark ? '#334155' : '#cbd5e1',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Line
                    type="monotone"
                    dataKey="RejectionRate"
                    name="Rejection %"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
