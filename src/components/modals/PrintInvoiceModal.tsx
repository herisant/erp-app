import React from 'react';
import { useErp } from '../../context/ErpContext';
import { SalesInvoice } from '../../types/erp';
import { X, Printer, Download } from 'lucide-react';
import { formatDate, formatIDR } from '../../utils/formatters';

interface PrintInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: SalesInvoice | null;
}

export const PrintInvoiceModal: React.FC<PrintInvoiceModalProps> = ({ isOpen, onClose, invoice }) => {
  const { company, bankAccounts } = useErp();

  if (!isOpen || !invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[94vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-200 no-print">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Pratinjau Dokumen Faktur Komersial
            </h3>
            <p className="text-xs text-slate-500">Nomor: {invoice.invoiceNo}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Printable Sheet */}
        <div className="p-8 overflow-y-auto flex-1 bg-white text-slate-900 text-xs">
          {/* Header */}
          <div className="flex justify-between items-start pb-6 border-b-2 border-slate-900">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">{company.name}</h1>
              <p className="text-[11px] text-slate-600 mt-0.5">{company.tagline}</p>
              <p className="text-[11px] text-slate-500 mt-1 max-w-sm">{company.address}, {company.city}</p>
              <p className="text-[11px] text-slate-500">
                NPWP: <span className="font-mono">{company.taxId}</span> · Telp: {company.phone}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block">
                Faktur Penjualan Komersial
              </span>
              <span className="font-mono text-sm font-bold block mt-1">{invoice.invoiceNo}</span>
              <div className="mt-2 text-[11px] text-slate-600 space-y-0.5">
                <div>Tanggal: <span className="font-medium text-slate-900">{formatDate(invoice.date)}</span></div>
                <div>Jatuh Tempo: <span className="font-medium text-slate-900">{formatDate(invoice.dueDate)}</span></div>
                <div>Termin: <span className="font-medium text-slate-900">{invoice.paymentTerms}</span></div>
              </div>
            </div>
          </div>

          {/* Customer info */}
          <div className="grid grid-cols-2 gap-8 my-6">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Ditagihkan Kepada (Customer):
              </span>
              <h4 className="font-bold text-sm text-slate-900">{invoice.customerName}</h4>
              {invoice.customerAddress && (
                <p className="text-slate-600 text-[11px] mt-0.5">{invoice.customerAddress}</p>
              )}
              {invoice.customerTaxId && (
                <p className="text-slate-500 text-[11px] mt-1 font-mono">
                  NPWP: {invoice.customerTaxId}
                </p>
              )}
              {invoice.customerPhone && (
                <p className="text-slate-500 text-[11px]">Telp: {invoice.customerPhone}</p>
              )}
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Informasi Rekening Pembayaran:
              </span>
              {bankAccounts.slice(0, 2).map((bank) => (
                <div key={bank.id} className="text-[11px] mb-1.5 last:mb-0">
                  <span className="font-semibold text-slate-800">{bank.bankName}</span>
                  <div className="font-mono text-slate-900">{bank.accountNumber}</div>
                  <div className="text-slate-500 text-[10px]">a/n {bank.accountHolder}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Items Table */}
          <div className="border border-slate-200 rounded-lg overflow-hidden my-6">
            <table className="w-full text-left">
              <thead className="bg-slate-100 text-slate-700 font-semibold text-[11px]">
                <tr>
                  <th className="py-2.5 px-3 w-10 text-center">No</th>
                  <th className="py-2.5 px-3">Kode SKU & Deskripsi Barang</th>
                  <th className="py-2.5 px-3 w-20 text-right">Qty</th>
                  <th className="py-2.5 px-3 w-16 text-center">Satuan</th>
                  <th className="py-2.5 px-3 w-28 text-right">Harga Satuan</th>
                  <th className="py-2.5 px-3 w-20 text-right">Diskon</th>
                  <th className="py-2.5 px-3 w-32 text-right">Jumlah</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {invoice.items.map((item, idx) => (
                  <tr key={item.id} className="text-slate-800">
                    <td className="py-2 px-3 text-center text-slate-500 font-mono text-[11px]">
                      {idx + 1}
                    </td>
                    <td className="py-2 px-3">
                      <div className="font-semibold text-slate-900">{item.name}</div>
                      <div className="text-[10px] font-mono text-slate-500">SKU: {item.sku}</div>
                    </td>
                    <td className="py-2 px-3 text-right font-mono tabular-nums">{item.qty}</td>
                    <td className="py-2 px-3 text-center text-slate-500">{item.unit}</td>
                    <td className="py-2 px-3 text-right font-mono tabular-nums">{formatIDR(item.unitPrice)}</td>
                    <td className="py-2 px-3 text-right font-mono text-slate-500 tabular-nums">
                      {item.discountPct > 0 ? `${item.discountPct}%` : '-'}
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-medium tabular-nums">
                      {formatIDR(item.subtotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals & Signatures */}
          <div className="grid grid-cols-2 gap-8 pt-4">
            <div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <span className="font-semibold text-slate-800 block">Ketentuan Transaksi:</span>
                <p>1. Pembayaran dianggap sah jika dana telah efektif masuk ke rekening terdaftar.</p>
                <p>2. Barang yang telah diterima dengan Surat Jalan resmi tidak dapat dikembalikan tanpa persetujuan tertulis.</p>
                {invoice.notes && <p className="italic text-slate-700 mt-1">Catatan: {invoice.notes}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4 mt-8 text-center text-[11px]">
                <div>
                  <p className="text-slate-500">Diterima Oleh,</p>
                  <div className="h-14"></div>
                  <p className="border-t border-slate-300 pt-1 font-semibold text-slate-800">
                    ({invoice.customerName})
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Hormat Kami,</p>
                  <div className="h-14"></div>
                  <p className="border-t border-slate-300 pt-1 font-semibold text-slate-800">
                    (Bagian Keuangan & Pajak)
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2 p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs self-start">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal Penjualan:</span>
                <span className="font-mono tabular-nums">{formatIDR(invoice.subtotal)}</span>
              </div>
              {invoice.discountTotal > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Total Potongan Diskon:</span>
                  <span className="font-mono tabular-nums">-{formatIDR(invoice.discountTotal)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>PPN 11% (Faktur Pajak):</span>
                <span className="font-mono tabular-nums">{formatIDR(invoice.taxAmount)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-300">
                <span>Total Tagihan Bersih:</span>
                <span className="font-mono text-blue-700 tabular-nums">{formatIDR(invoice.grandTotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600 pt-1">
                <span>Telah Dibayar:</span>
                <span className="font-mono tabular-nums">{formatIDR(invoice.paidAmount)}</span>
              </div>
              <div className="flex justify-between font-semibold text-slate-900 border-t border-slate-200 pt-1">
                <span>Sisa Piutang Berjalan:</span>
                <span className="font-mono text-rose-700 tabular-nums">
                  {formatIDR(invoice.grandTotal - invoice.paidAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
