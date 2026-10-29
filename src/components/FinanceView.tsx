import React, { useState } from 'react';
import { useErp } from '../context/ErpContext';
import { PurchaseBill, SalesInvoice } from '../types/erp';
import { formatIDR, formatDate } from '../utils/formatters';
import {
  Wallet,
  Receipt,
  FileText,
  BookOpen,
  Plus,
  Printer,
  CreditCard,
  Building2,
  CheckCircle,
  Clock,
  AlertTriangle,
} from 'lucide-react';

interface FinanceViewProps {
  onOpenNewInvoice: () => void;
  onOpenManualJournal: () => void;
  onOpenReceivePayment: (invoice?: SalesInvoice | null, bill?: PurchaseBill | null) => void;
  onOpenPrintInvoice: (invoice: SalesInvoice) => void;
}

export const FinanceView: React.FC<FinanceViewProps> = ({
  onOpenNewInvoice,
  onOpenManualJournal,
  onOpenReceivePayment,
  onOpenPrintInvoice,
}) => {
  const {
    invoices,
    purchaseBills,
    bankAccounts,
    chartOfAccounts,
    journalEntries,
    searchQuery,
    getTotalReceivables,
    getTotalPayables,
    getTotalCashAndBank,
  } = useErp();

  const [activeSubTab, setActiveSubTab] = useState<'ar' | 'ap' | 'bank' | 'coa' | 'journal'>('ar');
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState<string>('ALL');

  const totalReceivables = getTotalReceivables();
  const totalPayables = getTotalPayables();
  const totalCashBank = getTotalCashAndBank();

  // Filter invoices
  const filteredInvoices = invoices.filter((inv) => {
    const matchSearch =
      searchQuery === '' ||
      inv.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = invoiceStatusFilter === 'ALL' || inv.status === invoiceStatusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Financial Stat Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Saldo Kas & Bank Tersedia</span>
            <Wallet className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="font-mono text-xl font-bold text-slate-900 tabular-nums">
            {formatIDR(totalCashBank)}
          </div>
          <span className="text-[11px] text-slate-500 block">
            {bankAccounts.length} Rekening Aktif
          </span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Total Piutang Usaha (AR)</span>
            <Receipt className="w-4 h-4 text-blue-600" />
          </div>
          <div className="font-mono text-xl font-bold text-blue-600 tabular-nums">
            {formatIDR(totalReceivables)}
          </div>
          <span className="text-[11px] text-slate-500 block">
            {invoices.filter((i) => i.status !== 'PAID').length} Faktur Berjalan
          </span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Total Hutang Vendor (AP)</span>
            <FileText className="w-4 h-4 text-amber-600" />
          </div>
          <div className="font-mono text-xl font-bold text-amber-600 tabular-nums">
            {formatIDR(totalPayables)}
          </div>
          <span className="text-[11px] text-slate-500 block">
            {purchaseBills.filter((b) => b.status !== 'PAID').length} Tagihan Pemasok
          </span>
        </div>
      </div>

      {/* Sub Tabs Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('ar')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
              activeSubTab === 'ar'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Faktur Penjualan (AR)
          </button>
          <button
            onClick={() => setActiveSubTab('ap')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
              activeSubTab === 'ap'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tagihan Pembelian (AP)
          </button>
          <button
            onClick={() => setActiveSubTab('bank')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
              activeSubTab === 'bank'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Buku Kas & Bank
          </button>
          <button
            onClick={() => setActiveSubTab('coa')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
              activeSubTab === 'coa'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Bagan Akun (COA)
          </button>
          <button
            onClick={() => setActiveSubTab('journal')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
              activeSubTab === 'journal'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Jurnal Umum (General Ledger)
          </button>
        </div>

        <div className="flex items-center gap-2">
          {activeSubTab === 'journal' ? (
            <button
              onClick={onOpenManualJournal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Buat Jurnal Manual</span>
            </button>
          ) : (
            <button
              onClick={onOpenNewInvoice}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Buat Faktur Penjualan</span>
            </button>
          )}
        </div>
      </div>

      {/* 1. ACCOUNTS RECEIVABLE (INVOICES) */}
      {activeSubTab === 'ar' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white border border-slate-200 rounded-xl text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">Status Pembayaran:</span>
              <select
                value={invoiceStatusFilter}
                onChange={(e) => setInvoiceStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1 font-medium focus:outline-none"
              >
                <option value="ALL">Semua Status</option>
                <option value="UNPAID">Belum Dibayar</option>
                <option value="PARTIAL">Dibayar Sebagian</option>
                <option value="PAID">Lunas</option>
                <option value="OVERDUE">Lewat Jatuh Tempo</option>
              </select>
            </div>
            <div className="text-slate-500 font-mono text-[11px]">
              Menampilkan {filteredInvoices.length} Faktur
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3">Nomor Faktur</th>
                    <th className="py-3 px-3">Tanggal / Tempo</th>
                    <th className="py-3 px-3">Nama Pelanggan</th>
                    <th className="py-3 px-3 text-right">Subtotal</th>
                    <th className="py-3 px-3 text-right">PPN 11%</th>
                    <th className="py-3 px-3 text-right">Grand Total</th>
                    <th className="py-3 px-3 text-right">Terbayar</th>
                    <th className="py-3 px-3 text-right">Sisa Piutang</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInvoices.map((inv) => {
                    const remaining = inv.grandTotal - inv.paidAmount;
                    return (
                      <tr key={inv.id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-3">
                          <span className="font-mono font-bold text-slate-900 block">
                            {inv.invoiceNo}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Termin: {inv.paymentTerms}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono text-[11px] text-slate-600 tabular-nums">
                          <div>Tgl: {formatDate(inv.date)}</div>
                          <div className="text-slate-400">Jth: {formatDate(inv.dueDate)}</div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-semibold text-slate-900 block">{inv.customerName}</span>
                          <span className="text-[11px] text-slate-500 font-mono">
                            {inv.customerTaxId || 'Non-PKP'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-slate-700 tabular-nums">
                          {formatIDR(inv.subtotal)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-slate-600 tabular-nums">
                          {formatIDR(inv.taxAmount)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                          {formatIDR(inv.grandTotal)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-emerald-700 font-medium tabular-nums">
                          {formatIDR(inv.paidAmount)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-rose-700 tabular-nums">
                          {formatIDR(remaining)}
                        </td>
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <span
                            className={`font-semibold text-[11px] ${
                              inv.status === 'PAID'
                                ? 'text-emerald-700'
                                : inv.status === 'PARTIAL'
                                ? 'text-amber-700'
                                : inv.status === 'OVERDUE'
                                ? 'text-rose-700'
                                : 'text-blue-700'
                            }`}
                          >
                            {inv.status === 'PAID'
                              ? 'Lunas'
                              : inv.status === 'PARTIAL'
                              ? 'Sebagian'
                              : inv.status === 'OVERDUE'
                              ? 'Jatuh Tempo'
                              : 'Belum Lunas'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => onOpenPrintInvoice(inv)}
                              title="Cetak Faktur Penjualan"
                              className="p-1 text-slate-500 hover:text-blue-600 rounded"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                            {inv.status !== 'PAID' && (
                              <button
                                onClick={() => onOpenReceivePayment(inv, null)}
                                title="Catat Penerimaan Pembayaran"
                                className="px-2 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded transition-colors"
                              >
                                Bayar
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. ACCOUNTS PAYABLE (BILLS) */}
      {activeSubTab === 'ap' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3">Nomor Tagihan</th>
                    <th className="py-3 px-3">No. PO Referensi</th>
                    <th className="py-3 px-3">Nama Vendor / Pemasok</th>
                    <th className="py-3 px-3">Tanggal / Tempo</th>
                    <th className="py-3 px-3 text-right">Subtotal</th>
                    <th className="py-3 px-3 text-right">PPN Masukan</th>
                    <th className="py-3 px-3 text-right">Total Hutang</th>
                    <th className="py-3 px-3 text-right">Sisa Hutang</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {purchaseBills.map((bill) => {
                    const remaining = bill.grandTotal - bill.paidAmount;
                    return (
                      <tr key={bill.id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-3 font-mono font-bold text-slate-900">
                          {bill.billNo}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-600">{bill.poNo}</td>
                        <td className="py-3 px-3 font-semibold text-slate-800">{bill.vendorName}</td>
                        <td className="py-3 px-3 font-mono text-[11px] text-slate-600 tabular-nums">
                          <div>Tgl: {formatDate(bill.date)}</div>
                          <div className="text-slate-400">Jth: {formatDate(bill.dueDate)}</div>
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-slate-700 tabular-nums">
                          {formatIDR(bill.subtotal)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-slate-600 tabular-nums">
                          {formatIDR(bill.taxAmount)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                          {formatIDR(bill.grandTotal)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-amber-700 tabular-nums">
                          {formatIDR(remaining)}
                        </td>
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <span
                            className={`font-semibold text-[11px] ${
                              bill.status === 'PAID'
                                ? 'text-emerald-700'
                                : bill.status === 'PARTIAL'
                                ? 'text-amber-700'
                                : 'text-rose-700'
                            }`}
                          >
                            {bill.status === 'PAID' ? 'Lunas' : 'Belum Lunas'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          {bill.status !== 'PAID' && (
                            <button
                              onClick={() => onOpenReceivePayment(null, bill)}
                              className="px-2.5 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
                            >
                              Bayar Tagihan
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. CASH & BANK ACCOUNTS */}
      {activeSubTab === 'bank' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {bankAccounts.map((acc) => (
              <div
                key={acc.id}
                className="p-5 bg-white border border-slate-200 rounded-xl space-y-3 relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-slate-500" />
                    <span className="font-bold text-slate-900 text-sm">{acc.bankName}</span>
                  </div>
                  <span className="font-mono text-[11px] text-slate-400">COA: {acc.accountCode}</span>
                </div>

                <div>
                  <span className="text-[11px] text-slate-500 block">Nomor Rekening:</span>
                  <span className="font-mono text-sm font-semibold text-slate-800 tracking-wide">
                    {acc.accountNumber}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">a/n {acc.accountHolder}</span>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500">Saldo Riil:</span>
                  <span className="font-mono text-lg font-bold text-emerald-600 tabular-nums">
                    {formatIDR(acc.balance)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-1">
            <h4 className="font-bold text-slate-900">Rekonsiliasi Bank Otomatis</h4>
            <p>
              Setiap transaksi pelunasan faktur pelanggan (AR) atau pembayaran tagihan vendor (AP)
              langsung merefleksikan saldo rekening kas & bank secara real-time dan terposting ke Buku
              Besar akuntansi tanpa selisih rekonsiliasi.
            </p>
          </div>
        </div>
      )}

      {/* 4. CHART OF ACCOUNTS (COA) */}
      {activeSubTab === 'coa' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Bagan Akun Standar Akuntansi Keuangan (COA)
              </h3>
              <p className="text-xs text-slate-500">
                Struktur hierarki akun: 1000 Aset, 2000 Liabilitas, 3000 Ekuitas, 4000 Pendapatan, 5000 HPP, 6000 Beban
              </p>
            </div>
            <div className="text-slate-500 font-mono text-xs">
              Total {chartOfAccounts.length} Akun
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4 w-28">Kode Akun</th>
                  <th className="py-2.5 px-4">Nama Akun</th>
                  <th className="py-2.5 px-4">Kategori Akuntansi</th>
                  <th className="py-2.5 px-4">Klasifikasi</th>
                  <th className="py-2.5 px-4 text-center">Saldo Normal</th>
                  <th className="py-2.5 px-4 text-right">Saldo Berjalan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {chartOfAccounts.map((acc) => (
                  <tr key={acc.code} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-4 font-mono font-bold text-blue-600">{acc.code}</td>
                    <td className="py-2.5 px-4 font-semibold text-slate-800">{acc.name}</td>
                    <td className="py-2.5 px-4 text-slate-600">{acc.category}</td>
                    <td className="py-2.5 px-4 text-slate-500">{acc.subcategory}</td>
                    <td className="py-2.5 px-4 text-center font-mono text-[11px] text-slate-500">
                      {acc.normalBalance}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                      {formatIDR(acc.balance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. GENERAL LEDGER (JOURNAL ENTRIES) */}
      {activeSubTab === 'journal' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Buku Jurnal Umum (General Ledger)</h3>
              <p className="text-xs text-slate-500">
                Pencatatan double-entry seluruh transaksi operasional & voucher manual berimbang
              </p>
            </div>
            <button
              onClick={onOpenManualJournal}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Buat Jurnal Manual</span>
            </button>
          </div>

          <div className="space-y-3">
            {journalEntries.map((jrn) => (
              <div
                key={jrn.id}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs"
              >
                <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-slate-900">{jrn.voucherNo}</span>
                    <span className="text-slate-400">|</span>
                    <span className="text-slate-500 font-mono tabular-nums">{formatDate(jrn.date)}</span>
                    <span className="text-slate-400">|</span>
                    <span className="font-mono text-slate-600 font-medium">{jrn.refNo}</span>
                  </div>
                  <div className="text-slate-500 text-[11px]">Dibuat oleh: {jrn.createdBy}</div>
                </div>

                <div className="p-3">
                  <p className="text-xs font-medium text-slate-800 mb-2">{jrn.description}</p>
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-slate-400 border-b border-slate-100 text-[11px]">
                        <th className="py-1 px-2">Kode</th>
                        <th className="py-1 px-2">Nama Akun & Memo</th>
                        <th className="py-1 px-2 text-right w-36">Debet</th>
                        <th className="py-1 px-2 text-right w-36">Kredit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {jrn.lines.map((line, idx) => (
                        <tr key={idx}>
                          <td className="py-1.5 px-2 font-mono text-slate-600">{line.accountCode}</td>
                          <td className="py-1.5 px-2">
                            <span className="font-medium text-slate-800">{line.accountName}</span>
                            {line.memo && (
                              <span className="text-[10px] text-slate-400 block italic">
                                {line.memo}
                              </span>
                            )}
                          </td>
                          <td className="py-1.5 px-2 text-right font-mono tabular-nums text-slate-900">
                            {line.debit > 0 ? formatIDR(line.debit) : '-'}
                          </td>
                          <td className="py-1.5 px-2 text-right font-mono tabular-nums text-slate-900">
                            {line.credit > 0 ? formatIDR(line.credit) : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-slate-200 font-mono font-bold text-slate-900 text-[11px]">
                        <td colSpan={2} className="py-1.5 px-2 text-right">
                          Total Berimbang:
                        </td>
                        <td className="py-1.5 px-2 text-right tabular-nums text-blue-700">
                          {formatIDR(jrn.totalDebit)}
                        </td>
                        <td className="py-1.5 px-2 text-right tabular-nums text-blue-700">
                          {formatIDR(jrn.totalCredit)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
