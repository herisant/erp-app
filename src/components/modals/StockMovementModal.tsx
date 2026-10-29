import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { X, ArrowDownRight, ArrowUpRight, ArrowLeftRight, AlertCircle } from 'lucide-react';
import { formatIDR } from '../../utils/formatters';

interface StockMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: 'INBOUND' | 'OUTBOUND' | 'TRANSFER';
}

export const StockMovementModal: React.FC<StockMovementModalProps> = ({
  isOpen,
  onClose,
  defaultType = 'INBOUND',
}) => {
  const {
    inventory,
    warehouses,
    selectedWarehouseId,
    recordStockInbound,
    recordStockOutbound,
    recordStockTransfer,
  } = useErp();

  const [movementType, setMovementType] = useState<'INBOUND' | 'OUTBOUND' | 'TRANSFER'>(defaultType);
  const [selectedItemId, setSelectedItemId] = useState<string>(inventory[0]?.id || '');
  const [sourceWarehouseId, setSourceWarehouseId] = useState<string>(
    selectedWarehouseId !== 'ALL' ? selectedWarehouseId : warehouses[0]?.id || ''
  );
  const [targetWarehouseId, setTargetWarehouseId] = useState<string>(
    warehouses.find((w) => w.id !== sourceWarehouseId)?.id || warehouses[1]?.id || ''
  );
  const [qty, setQty] = useState<number>(10);
  const [unitCost, setUnitCost] = useState<number>(0);
  const [refNo, setRefNo] = useState<string>('');
  const [vendorName, setVendorName] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  if (!isOpen) return null;

  const currentItem = inventory.find((i) => i.id === selectedItemId);
  const availableStockInSource = currentItem
    ? currentItem.stockByWarehouse[sourceWarehouseId] || 0
    : 0;

  // Auto-fill cost when item selected
  const handleItemChange = (itemId: string) => {
    setSelectedItemId(itemId);
    const item = inventory.find((i) => i.id === itemId);
    if (item && unitCost === 0) {
      setUnitCost(item.unitCost);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!selectedItemId) {
      setErrorMessage('Pilih barang terlebih dahulu');
      return;
    }
    if (qty <= 0) {
      setErrorMessage('Kuantitas harus lebih besar dari 0');
      return;
    }

    if (movementType === 'INBOUND') {
      const actualUnitCost = unitCost > 0 ? unitCost : currentItem?.unitCost || 0;
      recordStockInbound({
        itemId: selectedItemId,
        warehouseId: sourceWarehouseId,
        qty: Number(qty),
        unitCost: actualUnitCost,
        poNo: refNo || `PO-${new Date().getFullYear()}-${Math.floor(Math.random() * 900 + 100)}`,
        vendorName: vendorName || 'Pemasok Terdaftar',
        notes,
      });
      onClose();
    } else if (movementType === 'OUTBOUND') {
      if (availableStockInSource < qty) {
        setErrorMessage(
          `Stok tidak mencukupi! Tersedia hanya ${availableStockInSource} ${currentItem?.unit} di gudang terpilih.`
        );
        return;
      }
      const success = recordStockOutbound({
        itemId: selectedItemId,
        warehouseId: sourceWarehouseId,
        qty: Number(qty),
        refNo: refNo || `DO-${new Date().getFullYear()}-${Math.floor(Math.random() * 900 + 100)}`,
        notes,
      });
      if (success) onClose();
      else setErrorMessage('Gagal mencatat pengeluaran stok.');
    } else if (movementType === 'TRANSFER') {
      if (sourceWarehouseId === targetWarehouseId) {
        setErrorMessage('Gudang asal dan gudang tujuan tidak boleh sama');
        return;
      }
      if (availableStockInSource < qty) {
        setErrorMessage(
          `Stok tidak mencukupi di gudang asal! Tersedia: ${availableStockInSource} ${currentItem?.unit}`
        );
        return;
      }
      const success = recordStockTransfer({
        itemId: selectedItemId,
        fromWarehouseId: sourceWarehouseId,
        toWarehouseId: targetWarehouseId,
        qty: Number(qty),
        notes,
      });
      if (success) onClose();
      else setErrorMessage('Gagal memproses mutasi antar gudang.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h3 className="text-base font-bold text-slate-900">Catat Mutasi & Pergerakan Stok</h3>
            <p className="text-xs text-slate-500">
              Penerimaan PO, Pengeluaran Surat Jalan, atau Mutasi Antar Cabang
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Segmented type switcher */}
        <div className="p-6 pb-0">
          <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-lg text-xs font-medium">
            <button
              type="button"
              onClick={() => {
                setMovementType('INBOUND');
                setErrorMessage('');
              }}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-md transition-colors ${
                movementType === 'INBOUND'
                  ? 'bg-white text-emerald-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>Masuk (PO)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMovementType('OUTBOUND');
                setErrorMessage('');
              }}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-md transition-colors ${
                movementType === 'OUTBOUND'
                  ? 'bg-white text-amber-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Keluar (DO)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMovementType('TRANSFER');
                setErrorMessage('');
              }}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-md transition-colors ${
                movementType === 'TRANSFER'
                  ? 'bg-white text-blue-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>Pindah Gudang</span>
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Select Item */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Pilih Barang / Material *</label>
            <select
              value={selectedItemId}
              onChange={(e) => handleItemChange(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white font-medium"
            >
              {inventory.map((item) => (
                <option key={item.id} value={item.id}>
                  [{item.sku}] {item.name} ({item.unit})
                </option>
              ))}
            </select>
          </div>

          {/* Warehouses Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {movementType === 'INBOUND'
                  ? 'Gudang Penerima *'
                  : movementType === 'TRANSFER'
                  ? 'Gudang Asal (Pengirim) *'
                  : 'Gudang Pengeluaran *'}
              </label>
              <select
                value={sourceWarehouseId}
                onChange={(e) => setSourceWarehouseId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white"
              >
                {warehouses.map((wh) => (
                  <option key={wh.id} value={wh.id}>
                    {wh.name} ({wh.city})
                  </option>
                ))}
              </select>
              {movementType !== 'INBOUND' && currentItem && (
                <p className="mt-1 text-[11px] text-slate-500">
                  Stok saat ini di gudang ini:{' '}
                  <span className="font-semibold text-slate-800 font-mono">
                    {availableStockInSource} {currentItem.unit}
                  </span>
                </p>
              )}
            </div>

            {movementType === 'TRANSFER' && (
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Gudang Tujuan *</label>
                <select
                  value={targetWarehouseId}
                  onChange={(e) => setTargetWarehouseId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white"
                >
                  {warehouses
                    .filter((wh) => wh.id !== sourceWarehouseId)
                    .map((wh) => (
                      <option key={wh.id} value={wh.id}>
                        {wh.name} ({wh.city})
                      </option>
                    ))}
                </select>
              </div>
            )}

            {movementType === 'INBOUND' && (
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Vendor / Pemasok *</label>
                <input
                  type="text"
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  placeholder="Contoh: PT Krakatau Steel / PT Omron"
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* Quantity & Unit Cost */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Kuantitas ({currentItem?.unit || 'Unit'}) *
              </label>
              <input
                type="number"
                min="1"
                value={qty}
                onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
                className="w-full px-3 py-2 border border-slate-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none font-mono tabular-nums text-sm font-semibold"
              />
            </div>

            {movementType === 'INBOUND' ? (
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Harga Beli Satuan (HPP Masuk)
                </label>
                <input
                  type="number"
                  min="0"
                  value={unitCost || currentItem?.unitCost || 0}
                  onChange={(e) => setUnitCost(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none font-mono tabular-nums"
                />
              </div>
            ) : (
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nomor Referensi Dokumen</label>
                <input
                  type="text"
                  value={refNo}
                  onChange={(e) => setRefNo(e.target.value)}
                  placeholder={movementType === 'OUTBOUND' ? 'DO-2026-xxx' : 'TRF-2026-xxx'}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md font-mono"
                />
              </div>
            )}
          </div>

          {movementType === 'INBOUND' && (
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nomor PO Pembelian</label>
              <input
                type="text"
                value={refNo}
                onChange={(e) => setRefNo(e.target.value)}
                placeholder="PO-2026-10-xxx"
                className="w-full px-3 py-2 border border-slate-200 rounded-md font-mono"
              />
            </div>
          )}

          {/* Total Value Summary */}
          {currentItem && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs">
              <span className="text-slate-600">Estimasi Nilai Transaksi:</span>
              <span className="font-mono font-bold text-slate-900 tabular-nums">
                {formatIDR(qty * (movementType === 'INBOUND' && unitCost > 0 ? unitCost : currentItem.unitCost))}
              </span>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Keterangan / Alasan Mutasi</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Catatan pengiriman, no kendaraan, kondisi barang..."
              className="w-full px-3 py-2 border border-slate-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg font-medium transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors shadow-xs"
            >
              {movementType === 'INBOUND'
                ? 'Posting Penerimaan Barang'
                : movementType === 'OUTBOUND'
                ? 'Posting Pengeluaran Barang'
                : 'Proses Pindah Gudang'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
