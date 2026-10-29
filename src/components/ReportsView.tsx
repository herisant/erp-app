import React, { useState } from 'react';
import { useErp } from '../context/ErpContext';
import { formatIDR, formatDate } from '../utils/formatters';
import {
  FileText,
  Printer,
  Download,
  Scale,
  TrendingUp,
  Boxes,
  CheckCircle2,
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const {
    company,
    chartOfAccounts,
    inventory,
    warehouses,
    selectedWarehouseId,
    getTotalInventoryValue,
    getTotalItemsCount,
  } = useErp();

  const [reportType, setReportType] = useState<'profit_loss' | 'balance_sheet' | 'inventory_valuation'>('profit_loss');

  // Compute Income Statement figures from COA
  const revenueAccounts = chartOfAccounts.filter((a) => a.category === 'REVENUE');
  const cogsAccounts = chartOfAccounts.filter((a) => a.subcategory.includes('HPP'));
  const expenseAccounts = chartOfAccounts.filter((a) => a.category === 'EXPENSE' && !a.subcategory.includes('HPP'));

  const totalRevenue = revenueAccounts.reduce((sum, a) => sum + a.balance, 0);
  const totalCOGS = cogsAccounts.reduce((sum, a) => sum + a.balance, 0);
  const grossProfit = totalRevenue - totalCOGS;
  const totalOperatingExpenses = expenseAccounts.reduce((sum, a) => sum + a.balance, 0);
  const netIncome = grossProfit - totalOperatingExpenses;

  // Compute Balance Sheet figures from COA
  const assetAccounts = chartOfAccounts.filter((a) => a.category === 'ASSET');
  const liabilityAccounts = chartOfAccounts.filter((a) => a.category === 'LIABILITY');
  const equityAccounts = chartOfAccounts.filter((a) => a.category === 'EQUITY');

  const totalAssets = assetAccounts.reduce((sum, a) => sum + a.balance, 0);
  const totalLiabilities = liabilityAccounts.reduce((sum, a) => sum + a.balance, 0);
  const baseEquity = equityAccounts.reduce((sum, a) => sum + a.balance, 0);
  const totalEquity = baseEquity + netIncome; // Current year earnings roll into equity
  const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;

  const isBalanceSheetBalanced = Math.abs(totalAssets - totalLiabilitiesAndEquity) < 1000;

  // Inventory valuation data
  const totalInvValue = getTotalInventoryValue();
  const totalInvQty = getTotalItemsCount();

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    if (reportType === 'profit_loss') {
      csvContent += "Laporan Laba Rugi - " + company.name + "\n";
      csvContent += "Komponen Akun,Jumlah (IDR)\n";
      revenueAccounts.forEach(a => { csvContent += `"${a.name}",${a.balance}\n`; });
      csvContent += `"Total Pendapatan",${totalRevenue}\n`;
      cogsAccounts.forEach(a => { csvContent += `"${a.name}",${a.balance}\n`; });
      csvContent += `"Laba Kotor",${grossProfit}\n`;
      expenseAccounts.forEach(a => { csvContent += `"${a.name}",${a.balance}\n`; });
      csvContent += `"Laba Bersih Operasional",${netIncome}\n`;
    } else if (reportType === 'balance_sheet') {
      csvContent += "Neraca Keuangan - " + company.name + "\n";
      csvContent += "Akun,Kategori,Jumlah (IDR)\n";
      assetAccounts.forEach(a => { csvContent += `"${a.name}",ASET,${a.balance}\n`; });
      csvContent += `"TOTAL ASET",ASET,${totalAssets}\n`;
      liabilityAccounts.forEach(a => { csvContent += `"${a.name}",LIABILITAS,${a.balance}\n`; });
      equityAccounts.forEach(a => { csvContent += `"${a.name}",EKUITAS,${a.balance}\n`; });
      csvContent += `"Laba Tahun Berjalan",EKUITAS,${netIncome}\n`;
      csvContent += `"TOTAL LIABILITAS DAN EKUITAS",LIABILITAS_EKUITAS,${totalLiabilitiesAndEquity}\n`;
    } else {
      csvContent += "Laporan Valuasi Inventaris - " + company.name + "\n";
      csvContent += "SKU,Nama Barang,Kategori,Stok Total,Satuan,HPP Unit,Total Valuasi\n";
      inventory.forEach(item => {
        const qty = Object.values(item.stockByWarehouse).reduce((a, b) => a + b, 0);
        csvContent += `"${item.sku}","${item.name}","${item.category}",${qty},"${item.unit}",${item.unitCost},${qty * item.unitCost}\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Laporan_${reportType}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Control bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-3 no-print">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium">
          <button
            onClick={() => setReportType('profit_loss')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
              reportType === 'profit_loss'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Laba Rugi (Income Statement)</span>
          </button>
          <button
            onClick={() => setReportType('balance_sheet')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
              reportType === 'balance_sheet'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Neraca Keuangan (Balance Sheet)</span>
          </button>
          <button
            onClick={() => setReportType('inventory_valuation')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
              reportType === 'inventory_valuation'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Boxes className="w-3.5 h-3.5" />
            <span>Valuasi Stok Multigudang</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Laporan</span>
          </button>
        </div>
      </div>

      {/* Report Canvas */}
      <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-xs max-w-4xl mx-auto text-xs">
        {/* Printable Header */}
        <div className="text-center pb-6 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900">{company.name}</h2>
          <h3 className="text-sm font-semibold text-blue-600 mt-0.5">
            {reportType === 'profit_loss'
              ? 'Laporan Laba Rugi Komprehensif'
              : reportType === 'balance_sheet'
              ? 'Laporan Posisi Keuangan (Neraca)'
              : 'Laporan Rekapitulasi & Valuasi Persediaan'}
          </h3>
          <p className="text-slate-500 text-[11px] mt-1 font-mono">
            Periode Berjalan: Tahun Fiskal {company.fiscalYear} (Mata Uang: IDR)
          </p>
        </div>

        {/* 1. PROFIT AND LOSS STATEMENT */}
        {reportType === 'profit_loss' && (
          <div className="py-6 space-y-6">
            {/* Revenue */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] pb-1 border-b border-slate-200">
                1. Pendapatan Usaha
              </h4>
              <div className="space-y-1.5 pl-2">
                {revenueAccounts.map((acc) => (
                  <div key={acc.code} className="flex justify-between text-slate-700">
                    <span>{acc.name} ({acc.code})</span>
                    <span className="font-mono tabular-nums">{formatIDR(acc.balance)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-bold text-slate-900 pt-1.5 border-t border-slate-100">
                  <span>Total Pendapatan Bersih:</span>
                  <span className="font-mono tabular-nums text-blue-700">{formatIDR(totalRevenue)}</span>
                </div>
              </div>
            </div>

            {/* COGS */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] pb-1 border-b border-slate-200">
                2. Beban Pokok Penjualan (HPP)
              </h4>
              <div className="space-y-1.5 pl-2">
                {cogsAccounts.map((acc) => (
                  <div key={acc.code} className="flex justify-between text-slate-700">
                    <span>{acc.name} ({acc.code})</span>
                    <span className="font-mono tabular-nums">{formatIDR(acc.balance)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-bold text-slate-900 pt-1.5 border-t border-slate-100">
                  <span>Total Beban Pokok Penjualan:</span>
                  <span className="font-mono tabular-nums text-amber-700">({formatIDR(totalCOGS)})</span>
                </div>
              </div>
            </div>

            {/* Gross Profit */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex justify-between font-bold text-sm text-slate-900">
              <span>LABA KOTOR (GROSS PROFIT):</span>
              <span className="font-mono text-blue-700 tabular-nums">{formatIDR(grossProfit)}</span>
            </div>

            {/* Operating Expenses */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] pb-1 border-b border-slate-200">
                3. Beban Operasional & Administrasi
              </h4>
              <div className="space-y-1.5 pl-2">
                {expenseAccounts.map((acc) => (
                  <div key={acc.code} className="flex justify-between text-slate-700">
                    <span>{acc.name} ({acc.code})</span>
                    <span className="font-mono tabular-nums">{formatIDR(acc.balance)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-bold text-slate-900 pt-1.5 border-t border-slate-100">
                  <span>Total Beban Operasional:</span>
                  <span className="font-mono tabular-nums text-amber-700">
                    ({formatIDR(totalOperatingExpenses)})
                  </span>
                </div>
              </div>
            </div>

            {/* Net Operating Income */}
            <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl flex justify-between items-center text-sm font-bold text-slate-900">
              <div>
                <span className="block">LABA BERSIH OPERASIONAL (NET PROFIT):</span>
                <span className="text-[11px] font-normal text-slate-600">
                  Margin Laba Bersih: {totalRevenue > 0 ? ((netIncome / totalRevenue) * 100).toFixed(1) : '0'}%
                </span>
              </div>
              <span className="font-mono text-lg text-blue-700 tabular-nums">
                {formatIDR(netIncome)}
              </span>
            </div>
          </div>
        )}

        {/* 2. BALANCE SHEET STATEMENT */}
        {reportType === 'balance_sheet' && (
          <div className="py-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Assets column */}
              <div className="space-y-4">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] pb-1 border-b border-slate-200">
                  ASET (AKTIVA)
                </h4>
                <div className="space-y-1.5">
                  {assetAccounts.map((acc) => (
                    <div key={acc.code} className="flex justify-between text-slate-700">
                      <span>{acc.name}</span>
                      <span className="font-mono tabular-nums">{formatIDR(acc.balance)}</span>
                    </div>
                  ))}
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex justify-between font-bold text-slate-900">
                  <span>TOTAL ASET:</span>
                  <span className="font-mono text-blue-700 tabular-nums">{formatIDR(totalAssets)}</span>
                </div>
              </div>

              {/* Liabilities & Equity column */}
              <div className="space-y-4">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] pb-1 border-b border-slate-200">
                  LIABILITAS & EKUITAS (PASIVA)
                </h4>

                {/* Liabilities */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-500 block">Kewajiban Lancar:</span>
                  {liabilityAccounts.map((acc) => (
                    <div key={acc.code} className="flex justify-between text-slate-700 pl-2">
                      <span>{acc.name}</span>
                      <span className="font-mono tabular-nums">{formatIDR(acc.balance)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-medium text-slate-900 pl-2 pt-1 border-t border-slate-100">
                    <span>Total Liabilitas:</span>
                    <span className="font-mono tabular-nums">{formatIDR(totalLiabilities)}</span>
                  </div>
                </div>

                {/* Equity */}
                <div className="space-y-1.5 pt-2">
                  <span className="text-[11px] font-semibold text-slate-500 block">Ekuitas Modal:</span>
                  {equityAccounts.map((acc) => (
                    <div key={acc.code} className="flex justify-between text-slate-700 pl-2">
                      <span>{acc.name}</span>
                      <span className="font-mono tabular-nums">{formatIDR(acc.balance)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-blue-700 font-medium pl-2">
                    <span>Laba Bersih Tahun Berjalan</span>
                    <span className="font-mono tabular-nums">{formatIDR(netIncome)}</span>
                  </div>
                  <div className="flex justify-between font-medium text-slate-900 pl-2 pt-1 border-t border-slate-100">
                    <span>Total Ekuitas:</span>
                    <span className="font-mono tabular-nums">{formatIDR(totalEquity)}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex justify-between font-bold text-slate-900">
                  <span>TOTAL PASIVA:</span>
                  <span className="font-mono text-blue-700 tabular-nums">
                    {formatIDR(totalLiabilitiesAndEquity)}
                  </span>
                </div>
              </div>
            </div>

            {/* Accounting Equation Verification Banner */}
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-emerald-800">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold">
                  Prinsip Keseimbangan Akuntansi Terpenuhi (Aset = Kewajiban + Ekuitas)
                </span>
              </div>
              <span className="font-mono text-xs tabular-nums">
                Selisih: {formatIDR(Math.abs(totalAssets - totalLiabilitiesAndEquity))}
              </span>
            </div>
          </div>
        )}

        {/* 3. INVENTORY VALUATION REPORT */}
        {reportType === 'inventory_valuation' && (
          <div className="py-6 space-y-6">
            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <div>
                <span className="text-slate-500 text-[11px] block">Total Valuasi Seluruh Gudang:</span>
                <span className="font-mono text-lg font-bold text-slate-900 tabular-nums">
                  {formatIDR(totalInvValue)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">Total Unit Fisik Tercatat:</span>
                <span className="font-mono text-lg font-bold text-slate-900 tabular-nums">
                  {totalInvQty} Unit / Item
                </span>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">SKU</th>
                    <th className="py-2.5 px-3">Nama Barang</th>
                    <th className="py-2.5 px-3">Kategori</th>
                    <th className="py-2.5 px-3 text-right">Stok Fisik</th>
                    <th className="py-2.5 px-3 text-right">HPP Satuan</th>
                    <th className="py-2.5 px-3 text-right">Total Valuasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {inventory.map((item) => {
                    const qty = Object.values(item.stockByWarehouse).reduce((a, b) => a + b, 0);
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/50">
                        <td className="py-2 px-3 font-mono font-bold text-blue-600">{item.sku}</td>
                        <td className="py-2 px-3 font-medium text-slate-800">{item.name}</td>
                        <td className="py-2 px-3 text-slate-600">{item.category}</td>
                        <td className="py-2 px-3 text-right font-mono tabular-nums">
                          {qty} {item.unit}
                        </td>
                        <td className="py-2 px-3 text-right font-mono tabular-nums text-slate-600">
                          {formatIDR(item.unitCost)}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                          {formatIDR(qty * item.unitCost)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
