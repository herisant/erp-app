import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { InvoiceLineItem } from '../../types/erp';
import { X, Plus, Trash2, ReceiptText, AlertCircle } from 'lucide-react';
import { formatIDR, generateId } from '../../utils/formatters';

interface NewInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewInvoiceModal: React.FC<NewInvoiceModalProps> = ({ isOpen, onClose }) => {
  const { inventory, warehouses, selectedWarehouseId, createSalesInvoice } = useErp();

  const [customerName, setCustomerName] = useState('');
  const [customerTaxId, setCustomerTaxId] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [warehouseId, setWarehouseId] = useState(
    selectedWarehouseId !== 'ALL' ? selectedWarehouseId : warehouses[0]?.id || ''
  );
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentTerms, setPaymentTerms] = useState<'COD' | 'NET15' | 'NET30' | 'NET45'>('NET30');
  const [notes, setNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Initial line items
  const [lines, setLines] = useState<
    {
      itemId: string;
      qty: number;
      unitPrice: number;
      discountPct: number;
    }[]
  >([
    {
      itemId: inventory[0]?.id || '',
      qty: 1,
      unitPrice: inventory[0]?.sellingPrice || 100000,
      discountPct: 0,
    },
  ]);

  if (!isOpen) return null;

  // Calculate due date based on payment terms
  const calculateDueDate = () => {
    const d = new Date(date);
    const days = paymentTerms === 'COD' ? 0 : paymentTerms === 'NET15' ? 15 : paymentTerms === 'NET30' ? 30 : 45;
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  const handleAddLine = () => {
    const firstItem = inventory[0];
    setLines([
      ...lines,
      {
        itemId: firstItem ? firstItem.id : '',
        qty: 1,
        unitPrice: firstItem ? firstItem.sellingPrice : 0,
        discountPct: 0,
      },
    ]);
  };

  const handleRemoveLine = (index: number) => {
    if (lines.length === 1) return;
    setLines(lines.filter((_, i) => i !== index));
  };

  const handleLineItemChange = (index: number, itemId: string) => {
    const item = inventory.find((i) => i.id === itemId);
    const updated = [...lines];
    updated[index].itemId = itemId;
    if (item) {
      updated[index].unitPrice = item.sellingPrice;
    }
    setLines(updated);
  };

  // Calculations
  const processedItems: InvoiceLineItem[] = lines.map((line, idx) => {
    const item = inventory.find((i) => i.id === line.itemId);
    const sub = line.qty * line.unitPrice * (1 - line.discountPct / 100);
    return {
      id: `LINE-${idx + 1}`,
      itemId: line.itemId,
      sku: item?.sku || 'SKU',
      name: item?.name || 'Barang',
      qty: line.qty,
      unit: item?.unit || 'Pcs',
      unitPrice: line.unitPrice,
      discountPct: line.discountPct,
      subtotal: sub,
    };
  });

  const grossSubtotal = lines.reduce((sum, l) => sum + l.qty * l.unitPrice, 0);
  const subtotalAfterDiscount = processedItems.reduce((sum, l) => sum + l.subtotal, 0);
  const discountTotal = grossSubtotal - subtotalAfterDiscount;
  const taxRate = 0.11;
  const taxAmount = Math.round(subtotalAfterDiscount * taxRate);
  const grandTotal = subtotalAfterDiscount + taxAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!customerName.trim()) {
      setErrorMessage('Nama pelanggan wajib diisi');
      return;
    }
    if (lines.length === 0) {
      setErrorMessage('Minimal harus ada 1 item barang');
      return;
    }

    // Check stock availability
    for (const line of lines) {
      const invItem = inventory.find((i) => i.id === line.itemId);
      if (invItem) {
        const available = invItem.stockByWarehouse[warehouseId] || 0;
        if (available < line.qty) {
          setErrorMessage(
            `Stok [${invItem.sku}] tidak mencukupi di gudang terpilih! Tersedia: ${available} ${invItem.unit}, diminta: ${line.qty}.`
          );
          return;
        }
      }
    }

    const invoiceNo = `INV/${new Date().getFullYear()}/${(new Date().getMonth() + 1)
      .toString()
      .padStart(2, '0')}/${Math.floor(Math.random() * 9000 + 1000)}`;

    createSalesInvoice({
      invoiceNo,
      customerName,
      customerTaxId,
      customerPhone,
      customerAddress,
      date,
      dueDate: calculateDueDate(),
      paymentTerms,
      warehouseId,
      items: processedItems,
      subtotal: grossSubtotal,
      discountTotal,
      taxRate,
      taxAmount,
      grandTotal,
      notes,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <ReceiptText className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="text-base font-bold text-slate-900">Buat Faktur Penjualan Komersial (Sales Invoice)</h3>
              <p className="text-xs text-slate-500">
                Pencatatan piutang usaha, PPN 11%, dan pemotongan stok otomatis dari gudang
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Customer & Basic Information */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nama Pelanggan / Perusahaan *</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Contoh: PT Astra Otoparts Tbk"
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-md focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">NPWP Pelanggan</label>
              <input
                type="text"
                value={customerTaxId}
                onChange={(e) => setCustomerTaxId(e.target.value)}
                placeholder="01.234.567.8-000.000"
                className="w-full px-3 py-2 border border-slate-200 rounded-md font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Gudang Pemenuhan (Fulfillment) *</label>
              <select
                value={warehouseId}
                onChange={(e) => setWarehouseId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-md bg-white font-medium"
              >
                {warehouses.map((wh) => (
                  <option key={wh.id} value={wh.id}>
                    {wh.name} ({wh.city})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tanggal Faktur</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-md font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Termin Pembayaran</label>
              <select
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-200 rounded-md bg-white font-medium"
              >
                <option value="COD">Cash On Delivery (COD)</option>
                <option value="NET15">Net 15 Hari</option>
                <option value="NET30">Net 30 Hari</option>
                <option value="NET45">Net 45 Hari</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Telepon / Kontak</label>
              <input
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="021-xxxxxxx"
                className="w-full px-3 py-2 border border-slate-200 rounded-md"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block font-semibold text-slate-700 mb-1">Alamat Penagihan & Pengiriman</label>
              <input
                type="text"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                placeholder="Alamat lengkap fasilitas atau kantor pembeli"
                className="w-full px-3 py-2 border border-slate-200 rounded-md"
              />
            </div>
          </div>

          {/* Line Items Table */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-slate-900">Rincian Barang yang Dijual</h4>
              <button
                type="button"
                onClick={handleAddLine}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-semibold text-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Baris</span>
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                  <tr>
                    <th className="py-2 px-3">Barang / Deskripsi</th>
                    <th className="py-2 px-3 w-28 text-center">Stok Gudang</th>
                    <th className="py-2 px-3 w-24 text-right">Qty</th>
                    <th className="py-2 px-3 w-32 text-right">Harga Satuan</th>
                    <th className="py-2 px-3 w-20 text-right">Diskon %</th>
                    <th className="py-2 px-3 w-36 text-right">Subtotal</th>
                    <th className="py-2 px-2 w-10 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {lines.map((line, idx) => {
                    const selectedItem = inventory.find((i) => i.id === line.itemId);
                    const available = selectedItem?.stockByWarehouse[warehouseId] || 0;
                    const lineSub = line.qty * line.unitPrice * (1 - line.discountPct / 100);

                    return (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="p-2.5">
                          <select
                            value={line.itemId}
                            onChange={(e) => handleLineItemChange(idx, e.target.value)}
                            className="w-full px-2 py-1.5 border border-slate-200 rounded bg-white font-medium"
                          >
                            {inventory.map((item) => (
                              <option key={item.id} value={item.id}>
                                [{item.sku}] {item.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="p-2.5 text-center font-mono text-[11px] text-slate-500 tabular-nums">
                          {available} {selectedItem?.unit}
                        </td>
                        <td className="p-2.5">
                          <input
                            type="number"
                            min="1"
                            value={line.qty}
                            onChange={(e) => {
                              const updated = [...lines];
                              updated[idx].qty = Math.max(1, Number(e.target.value));
                              setLines(updated);
                            }}
                            className="w-full px-2 py-1.5 border border-slate-200 rounded text-right font-mono tabular-nums"
                          />
                        </td>
                        <td className="p-2.5">
                          <input
                            type="number"
                            min="0"
                            value={line.unitPrice}
                            onChange={(e) => {
                              const updated = [...lines];
                              updated[idx].unitPrice = Number(e.target.value);
                              setLines(updated);
                            }}
                            className="w-full px-2 py-1.5 border border-slate-200 rounded text-right font-mono tabular-nums"
                          />
                        </td>
                        <td className="p-2.5">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={line.discountPct}
                            onChange={(e) => {
                              const updated = [...lines];
                              updated[idx].discountPct = Number(e.target.value);
                              setLines(updated);
                            }}
                            className="w-full px-2 py-1.5 border border-slate-200 rounded text-right font-mono tabular-nums"
                          />
                        </td>
                        <td className="p-2.5 text-right font-mono font-semibold text-slate-900 tabular-nums">
                          {formatIDR(lineSub)}
                        </td>
                        <td className="p-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveLine(idx)}
                            disabled={lines.length === 1}
                            className="text-slate-400 hover:text-rose-600 disabled:opacity-30"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals Summary */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 pt-2 border-t border-slate-200">
            <div className="sm:w-1/2">
              <label className="block font-semibold text-slate-700 mb-1">Catatan Faktur</label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Instruksi transfer bank, nomor PO pelanggan, ketentuan garansi..."
                className="w-full px-3 py-2 border border-slate-200 rounded-md"
              />
            </div>

            <div className="sm:w-80 space-y-2 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal Barang:</span>
                <span className="font-mono tabular-nums">{formatIDR(grossSubtotal)}</span>
              </div>
              {discountTotal > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Potongan Diskon:</span>
                  <span className="font-mono tabular-nums">-{formatIDR(discountTotal)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>PPN 11% (Faktur Pajak):</span>
                <span className="font-mono tabular-nums">{formatIDR(taxAmount)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-200">
                <span>Total Tagihan:</span>
                <span className="font-mono text-blue-600 tabular-nums">{formatIDR(grandTotal)}</span>
              </div>
            </div>
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
              className="px-5 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold shadow-xs"
            >
              Terbitkan Faktur Penjualan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
