import React from 'react';
import { useErp } from '../context/ErpContext';
import {
  formatIDR,
  formatShortIDR,
  formatNumber,
  formatDate,
} from '../utils/formatters';
import {
  Boxes,
  Wallet,
  TrendingUp,
  Receipt,
  FileCheck,
  AlertTriangle,
  ArrowRight,
  PackagePlus,
  ArrowDownRight,
  ArrowUpRight,
  Warehouse as WarehouseIcon,
} from 'lucide-react';

interface DashboardViewProps {
  onOpenQuickAction: (actionType: 'INBOUND' | 'OUTBOUND' | 'INVOICE' | 'NEW_ITEM') => void;
  onOpenReceivePayment: (invoice: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenQuickAction,
  onOpenReceivePayment,
}) => {
  const {
    selectedWarehouseId,
    warehouses,
    inventory,
    invoices,
    stockTransactions,
    getTotalInventoryValue,
    getTotalItemsCount,
    getLowStockItems,
    getTotalCashAndBank,
    getTotalReceivables,
    getTotalPayables,
    getCurrentMonthRevenue,
    getCurrentMonthCOGS,
    setActiveTab,
  } = useErp();

  const totalInvValue = getTotalInventoryValue();
  const totalItemCount = getTotalItemsCount();
  const lowStockItems = getLowStockItems();
  const totalCashBank = getTotalCashAndBank();
  const totalReceivables = getTotalReceivables();
  const totalPayables = getTotalPayables();
  const monthlyRevenue = getCurrentMonthRevenue();
  const monthlyCOGS = getCurrentMonthCOGS();
  const grossProfit = monthlyRevenue - monthlyCOGS;
  const grossMarginPct = monthlyRevenue > 0 ? ((grossProfit / monthlyRevenue) * 100).toFixed(1) : '0';

  const currentWarehouseName =
    selectedWarehouseId === 'ALL'
      ? 'Semua Fasilitas (Konsolidasi)'
      : warehouses.find((w) => w.id === selectedWarehouseId)?.name || 'Gudang';

  // Category Breakdown Data for Inventory
  const categoryStats = React.useMemo(() => {
    const map: Record<string, { count: number; value: number }> = {};
    inventory.forEach((item) => {
      let qty = 0;
      if (selectedWarehouseId === 'ALL') {
        qty = Object.values(item.stockByWarehouse).reduce((a, b) => a + b, 0);
      } else {
        qty = item.stockByWarehouse[selectedWarehouseId] || 0;
      }
      const val = qty * item.unitCost;
      if (!map[item.category]) map[item.category] = { count: 0, value: 0 };
      map[item.category].count += qty;
      map[item.category].value += val;
    });
    return Object.entries(map).sort((a, b) => b[1].value - a[1].value);
  }, [inventory, selectedWarehouseId]);

  // Unpaid invoices due soon
  const pendingInvoices = invoices.filter((i) => i.status !== 'PAID').slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Scope Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white border border-slate-200 rounded-xl">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Lingkup Operasional</span>
            <span aria-hidden="true">·</span>
            <span>Tahun Fiskal 2026</span>
            <span aria-hidden="true">·</span>
            <span className="text-blue-600 font-medium">Standar SAK Indonesia</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            {currentWarehouseName}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenQuickAction('INBOUND')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-medium transition-colors"
          >
            <ArrowDownRight className="w-3.5 h-3.5 text-emerald-600" />
            <span>Penerimaan PO</span>
          </button>
          <button
            onClick={() => onOpenQuickAction('INVOICE')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>+ Buat Faktur</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Inventory Value */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Valuasi Inventaris</span>
            <Boxes className="w-4 h-4 text-blue-600" />
          </div>
          <div className="font-mono text-2xl font-bold text-slate-900 tabular-nums">
            {formatShortIDR(totalInvValue)}
          </div>
          <div className="text-xs text-slate-500 flex items-center justify-between">
            <span>Total Kuantitas Fisik</span>
            <span className="font-mono font-medium text-slate-700 tabular-nums">
              {formatNumber(totalItemCount)} Unit
            </span>
          </div>
        </div>

        {/* Cash & Bank Balance */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Kas & Giro Bank Tersedia</span>
            <Wallet className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="font-mono text-2xl font-bold text-slate-900 tabular-nums">
            {formatShortIDR(totalCashBank)}
          </div>
          <div className="text-xs text-slate-500 flex items-center justify-between">
            <span>Likuiditas Lancar</span>
            <span className="font-mono font-medium text-emerald-600 tabular-nums">
              100% Siap Operasional
            </span>
          </div>
        </div>

        {/* Current Month Revenue */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Pendapatan Penjualan</span>
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="font-mono text-2xl font-bold text-slate-900 tabular-nums">
            {formatShortIDR(monthlyRevenue)}
          </div>
          <div className="text-xs text-slate-500 flex items-center justify-between">
            <span>Estimasi Margin Kotor</span>
            <span className="font-mono font-medium text-indigo-600 tabular-nums">
              {grossMarginPct}% HPP
            </span>
          </div>
        </div>

        {/* Receivables vs Payables */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Piutang (AR) vs Hutang (AP)</span>
            <FileCheck className="w-4 h-4 text-amber-600" />
          </div>
          <div className="font-mono text-xl font-bold text-slate-900 tabular-nums">
            {formatShortIDR(totalReceivables)}
          </div>
          <div className="text-xs text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
            <span>Hutang Vendor (AP):</span>
            <span className="font-mono text-slate-700 font-semibold tabular-nums">
              {formatShortIDR(totalPayables)}
            </span>
          </div>
        </div>
      </div>

      {/* Main Charts & Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cash Flow & Revenue Simulation Graph (2 cols) */}
        <div className="lg:col-span-2 p-5 bg-white border border-slate-200 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Arus Pendapatan vs Beban Pokok (HPP)</h3>
              <p className="text-xs text-slate-500">Performa keuangan 6 bulan kalender berjalan (IDR)</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 bg-blue-600 rounded-sm" />
                Pendapatan
              </span>
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 bg-amber-500 rounded-sm" />
                HPP & Logistik
              </span>
            </div>
          </div>

          {/* Interactive SVG Bar & Trend Chart */}
          <div className="h-64 w-full pt-4">
            <svg viewBox="0 0 600 220" className="w-full h-full overflow-visible">
              {/* Grid Lines */}
              <line x1="40" y1="30" x2="580" y2="30" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="40" y1="80" x2="580" y2="80" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="40" y1="130" x2="580" y2="130" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="40" y1="180" x2="580" y2="180" stroke="#e2e8f0" strokeWidth="1.5" />

              {/* Y Axis Labels */}
              <text x="32" y="34" textAnchor="end" className="text-[10px] fill-slate-400 font-mono">600 Jt</text>
              <text x="32" y="84" textAnchor="end" className="text-[10px] fill-slate-400 font-mono">400 Jt</text>
              <text x="32" y="134" textAnchor="end" className="text-[10px] fill-slate-400 font-mono">200 Jt</text>
              <text x="32" y="184" textAnchor="end" className="text-[10px] fill-slate-400 font-mono">0</text>

              {/* Bars for 6 Months */}
              {[
                { month: 'Mei', rev: 380, exp: 230, x: 70 },
                { month: 'Jun', rev: 410, exp: 260, x: 155 },
                { month: 'Jul', rev: 450, exp: 275, x: 240 },
                { month: 'Agu', rev: 430, exp: 270, x: 325 },
                { month: 'Sep', rev: 490, exp: 300, x: 410 },
                { month: 'Okt', rev: 485, exp: 295, x: 495 },
              ].map((b, i) => {
                const revHeight = (b.rev / 600) * 150;
                const expHeight = (b.exp / 600) * 150;
                return (
                  <g key={i}>
                    {/* Revenue Bar */}
                    <rect
                      x={b.x}
                      y={180 - revHeight}
                      width="26"
                      height={revHeight}
                      rx="3"
                      className="fill-blue-600 hover:fill-blue-700 transition-colors cursor-pointer"
                    >
                      <title>{`Pendapatan ${b.month}: Rp ${b.rev} Juta`}</title>
                    </rect>
                    {/* COGS Bar */}
                    <rect
                      x={b.x + 30}
                      y={180 - expHeight}
                      width="26"
                      height={expHeight}
                      rx="3"
                      className="fill-amber-500 hover:fill-amber-600 transition-colors cursor-pointer"
                    >
                      <title>{`HPP ${b.month}: Rp ${b.exp} Juta`}</title>
                    </rect>
                    {/* Month Label */}
                    <text
                      x={b.x + 28}
                      y="202"
                      textAnchor="middle"
                      className="text-[11px] fill-slate-600 font-medium"
                    >
                      {b.month}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
            <span>Rata-rata Margin Laba Kotor 6 Bulan: 38,4%</span>
            <button
              onClick={() => setActiveTab('reports')}
              className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              <span>Buka Laporan Laba Rugi</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Category Valuation Breakdown (1 col) */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Komposisi Kategori Inventaris</h3>
            <span className="text-xs text-slate-500 font-mono">{categoryStats.length} Kategori</span>
          </div>

          <div className="space-y-3.5 pt-2">
            {categoryStats.map(([catName, stats], idx) => {
              const pct = totalInvValue > 0 ? ((stats.value / totalInvValue) * 100).toFixed(1) : '0';
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-slate-800">{catName}</span>
                    <span className="font-mono text-slate-600 tabular-nums">
                      {formatShortIDR(stats.value)} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, Math.max(5, Number(pct)))}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100">
            <button
              onClick={() => setActiveTab('inventory')}
              className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold transition-colors text-center block"
            >
              Kelola Seluruh Katalog Barang
            </button>
          </div>
        </div>
      </div>

      {/* Critical Action Grids: Low Stock & Unpaid Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Warning List */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Peringatan Stok Menipis (Di Bawah Reorder Point)
              </h3>
            </div>
            <span className="text-xs font-mono text-amber-700 font-semibold tabular-nums">
              {lowStockItems.length} Item
            </span>
          </div>

          {lowStockItems.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-lg">
              Semua stok berada di atas batas aman reorder point.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {lowStockItems.slice(0, 4).map((item) => {
                let currentQty = 0;
                if (selectedWarehouseId === 'ALL') {
                  currentQty = Object.values(item.stockByWarehouse).reduce((a, b) => a + b, 0);
                } else {
                  currentQty = item.stockByWarehouse[selectedWarehouseId] || 0;
                }

                return (
                  <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-slate-800">{item.name}</div>
                      <div className="text-slate-500 font-mono text-[11px]">
                        SKU: {item.sku} · Min: {item.minStock} {item.unit} · Lead Time: {item.leadTimeDays} Hari
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="font-mono text-sm font-bold text-rose-600 tabular-nums">
                          {currentQty} {item.unit}
                        </span>
                        <span className="text-[11px] text-slate-400 block font-mono">
                          ROP: {item.reorderPoint}
                        </span>
                      </div>
                      <button
                        onClick={() => onOpenQuickAction('INBOUND')}
                        className="px-2.5 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                      >
                        Reorder PO
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pending Receivables Invoices */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Faktur Penjualan Menunggu Pembayaran (AR)
              </h3>
            </div>
            <span className="text-xs font-mono text-blue-700 font-semibold tabular-nums">
              {pendingInvoices.length} Faktur
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {pendingInvoices.map((inv) => {
              const remaining = inv.grandTotal - inv.paidAmount;
              return (
                <div key={inv.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-slate-800">{inv.customerName}</div>
                    <div className="text-slate-500 font-mono text-[11px]">
                      {inv.invoiceNo} · Jatuh Tempo: {formatDate(inv.dueDate)}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-mono font-bold text-slate-900 tabular-nums">
                        {formatIDR(remaining)}
                      </div>
                      <span className="text-[10px] text-amber-700 font-medium">
                        {inv.status === 'OVERDUE'
                          ? 'Lewat Jatuh Tempo'
                          : inv.status === 'PARTIAL'
                          ? 'Sebagian'
                          : 'Belum Dibayar'}
                      </span>
                    </div>
                    <button
                      onClick={() => onOpenReceivePayment(inv)}
                      className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors"
                    >
                      Catat Bayar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Activity Audit Feed */}
      <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Aktivitas Transaksi Gudang Terakhir</h3>
            <p className="text-xs text-slate-500">Mutasi barang masuk, pengeluaran pesanan, dan transfer</p>
          </div>
          <button
            onClick={() => setActiveTab('inventory')}
            className="text-xs font-medium text-blue-600 hover:text-blue-700"
          >
            Lihat Semua Riwayat
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold text-[11px] border-y border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Tanggal / Waktu</th>
                <th className="py-2.5 px-3">Tipe Mutasi</th>
                <th className="py-2.5 px-3">Nomor Ref</th>
                <th className="py-2.5 px-3">Barang & SKU</th>
                <th className="py-2.5 px-3 text-right">Kuantitas</th>
                <th className="py-2.5 px-3 text-right">Nilai Total</th>
                <th className="py-2.5 px-3">Operator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stockTransactions.slice(0, 5).map((trx) => (
                <tr key={trx.id} className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500 tabular-nums">
                    {formatDate(trx.date)}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`font-medium ${
                        trx.type === 'IN_PURCHASE'
                          ? 'text-emerald-700'
                          : trx.type === 'OUT_SALES'
                          ? 'text-amber-700'
                          : trx.type === 'TRANSFER'
                          ? 'text-blue-700'
                          : 'text-purple-700'
                      }`}
                    >
                      {trx.type === 'IN_PURCHASE'
                        ? 'Masuk (PO)'
                        : trx.type === 'OUT_SALES'
                        ? 'Keluar (DO)'
                        : trx.type === 'TRANSFER'
                        ? 'Transfer Antar Gudang'
                        : 'Penyesuaian Opname'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono font-medium text-slate-800">{trx.refNo}</td>
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-slate-800">{trx.itemName}</div>
                    <span className="text-[10px] font-mono text-slate-400">{trx.sku}</span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold tabular-nums">
                    {trx.qty > 0 ? `+${trx.qty}` : trx.qty}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-medium text-slate-800 tabular-nums">
                    {formatIDR(Math.abs(trx.totalValue))}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">{trx.operator}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
