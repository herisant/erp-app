import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { PurchaseBill, SalesInvoice } from '../../types/erp';
import { X, Check, CreditCard } from 'lucide-react';
import { formatIDR } from '../../utils/formatters';

interface ReceivePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetInvoice?: SalesInvoice | null;
  targetBill?: PurchaseBill | null;
}

export const ReceivePaymentModal: React.FC<ReceivePaymentModalProps> = ({
  isOpen,
  onClose,
  targetInvoice,
  targetBill,
}) => {
  const { bankAccounts, recordInvoicePayment, recordBillPayment } = useErp();

  const isInvoice = !!targetInvoice;
  const remaining = isInvoice
    ? targetInvoice.grandTotal - targetInvoice.paidAmount
    : targetBill
    ? targetBill.grandTotal - targetBill.paidAmount
    : 0;

  const [amount, setAmount] = useState<number>(remaining);
  const [bankId, setBankId] = useState<string>(bankAccounts[0]?.id || '');
  const [notes, setNotes] = useState<string>('');

  if (!isOpen || (!targetInvoice && !targetBill)) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0 || !bankId) return;

    if (isInvoice && targetInvoice) {
      recordInvoicePayment(targetInvoice.id, Number(amount), bankId, notes);
    } else if (targetBill) {
      recordBillPayment(targetBill.id, Number(amount), bankId);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isInvoice ? 'Penerimaan Pembayaran Piutang' : 'Pembayaran Tagihan Hutang'}
              </h3>
              <p className="text-xs text-slate-500">
                {isInvoice
                  ? `Faktur: ${targetInvoice?.invoiceNo}`
                  : `Tagihan: ${targetBill?.billNo}`}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
            <div className="flex justify-between text-slate-600">
              <span>{isInvoice ? 'Pelanggan:' : 'Pemasok:'}</span>
              <span className="font-semibold text-slate-900">
                {isInvoice ? targetInvoice?.customerName : targetBill?.vendorName}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Total Nilai Faktur:</span>
              <span className="font-mono tabular-nums">
                {formatIDR(isInvoice ? targetInvoice?.grandTotal || 0 : targetBill?.grandTotal || 0)}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Sisa Belum Dibayar:</span>
              <span className="font-mono font-bold text-blue-600 tabular-nums">
                {formatIDR(remaining)}
              </span>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Rekening Kas / Bank Penampung *
            </label>
            <select
              value={bankId}
              onChange={(e) => setBankId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-md bg-white font-medium focus:ring-1 focus:ring-blue-500"
            >
              {bankAccounts.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.bankName} - Saldo: {formatIDR(b.balance)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Jumlah Pembayaran (IDR) *</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-slate-400 font-medium">Rp</span>
              <input
                type="number"
                min="1000"
                max={remaining}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                required
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-md font-mono text-sm font-bold text-slate-900 tabular-nums focus:ring-1 focus:ring-blue-500"
              />
            </div>
            {amount < remaining && (
              <p className="mt-1 text-[11px] text-amber-600">
                * Pembayaran parsial. Sisa saldo akan tercatat sebagai status Sebagian (Partial).
              </p>
            )}
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Nomor Referensi Transfer & Catatan
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Ref BCA 981240 / Kliring SKN"
              className="w-full px-3 py-2 border border-slate-200 rounded-md focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg font-medium"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold shadow-xs"
            >
              <Check className="w-4 h-4" />
              <span>Konfirmasi Pembayaran</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
