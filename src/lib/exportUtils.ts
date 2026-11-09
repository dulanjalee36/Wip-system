/**
 * UNIMAK WIP STOCK MANAGEMENT SYSTEM
 * Export Utilities (Excel, PDF, Print)
 * Production-ready formatting for Unimak (Pvt) Ltd
 */

import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ExportOptions {
  title: string;
  companyName?: string;
  filtersApplied?: string;
  filename: string;
  columns: { header: string; dataKey: string }[];
  data: Record<string, any>[];
  summaryTotals?: Record<string, number | string>;
}

export function exportToExcel(options: ExportOptions): void {
  const { title, companyName = 'Unimak (Pvt) Ltd', filtersApplied, filename, columns, data, summaryTotals } = options;

  // Header rows
  const worksheetData: any[][] = [
    [companyName.toUpperCase()],
    [`${title.toUpperCase()} - GENERATED ON: ${new Date().toLocaleString()}`],
    [filtersApplied ? `Filters: ${filtersApplied}` : 'All Records'],
    [], // empty row
    columns.map((c) => c.header),
  ];

  // Data rows
  data.forEach((row) => {
    const rowValues = columns.map((c) => {
      const val = row[c.dataKey];
      return val !== undefined && val !== null ? val : '';
    });
    worksheetData.push(rowValues);
  });

  // Summary Totals row
  if (summaryTotals) {
    const totalsRow = columns.map((c, idx) => {
      if (idx === 0) return 'TOTAL';
      return summaryTotals[c.dataKey] !== undefined ? summaryTotals[c.dataKey] : '';
    });
    worksheetData.push(totalsRow);
  }

  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');

  XLSX.writeFile(workbook, `${filename}_${Date.now()}.xlsx`);
}

export function exportToPDF(options: ExportOptions): void {
  const { title, companyName = 'Unimak (Pvt) Ltd', filtersApplied, filename, columns, data, summaryTotals } = options;

  // Landscape for wide manufacturing tabular reports
  const doc = new jsPDF({ orientation: columns.length > 7 ? 'landscape' : 'portrait' });

  // Header branding
  doc.setFontSize(16);
  doc.setTextColor(26, 54, 93); // Dark Navy Unimak branding
  doc.text(companyName, 14, 15);

  doc.setFontSize(11);
  doc.setTextColor(71, 85, 105);
  doc.text(title, 14, 22);

  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Generated: ${new Date().toLocaleString()} | ${filtersApplied ? `Filters: ${filtersApplied}` : 'All Records'}`,
    14,
    27
  );

  const tableHead = [columns.map((c) => c.header)];
  const tableBody = data.map((row) =>
    columns.map((c) => {
      const val = row[c.dataKey];
      return val !== undefined && val !== null ? String(val) : '';
    })
  );

  if (summaryTotals) {
    const totalsRow = columns.map((c, idx) => {
      if (idx === 0) return 'TOTAL';
      return summaryTotals[c.dataKey] !== undefined ? String(summaryTotals[c.dataKey]) : '';
    });
    tableBody.push(totalsRow);
  }

  autoTable(doc, {
    head: tableHead,
    body: tableBody,
    startY: 32,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2,
      font: 'helvetica',
      textColor: [30, 41, 59],
    },
    headStyles: {
      fillColor: [30, 58, 138], // Unimak Dark Blue
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    didDrawPage: (dataObj) => {
      // Footer page numbering
      const pageCount = (doc as any).internal.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `Page ${dataObj.pageNumber} of ${pageCount} - UNIMAK WIP STOCK MANAGEMENT SYSTEM - Confidential`,
        14,
        doc.internal.pageSize.height - 10
      );
    },
  });

  doc.save(`${filename}_${Date.now()}.pdf`);
}
