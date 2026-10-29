import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { X, Check, ClipboardCheck, AlertTriangle } from 'lucide-react';
import { formatIDR } from '../../utils/formatters';

interface StockOpnameModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StockOpnameModal: React.FC<StockOpnameModalProps> = ({ isOpen, onClose }) => {
  const { warehouses, inventory, selectedWarehouseId, recordStockOpname } = useErp();

  const [warehouseId, setWarehouseId] = useState<string>(
    selectedWarehouseId !== 'ALL' ? selectedWarehouseId : warehouses[0]?.id || ''
  );
  const [itemId, setItemId] = useState<string>(inventory[0]?.id || '');
  const [physicalQty, setPhysicalQty] = useState<number>(0);
  const [reason, setReason] = useState<string>('Audit berkala akhir bulan');
  const [applyAdjustment, setApplyAdjustment] = useState<boolean>(true);

  if (!isOpen) return null;

  const currentItem = inventory.find((i) => i.id === itemId);
  const systemQty = currentItem ? currentItem.stockByWarehouse[warehouseId] || 0 : 0;
  const diffQty = physicalQty - systemQty;
  const diffValue = currentItem ? diffQty * currentItem.unitCost : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentItem) return;

    recordStockOpname({
      warehouseId,
      itemId,
      physicalQty: Number(physicalQty),
      reason,
      applyAdjustment,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="text-base font-bold text-slate-900">Audit Fisik Stok (Stock Opname)</h3>
              <p className="text-xs text-slate-500">
                Pencocokan stok fisik di gudang dengan catatan sistem
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Gudang Diaudit *</label>
              <select
                value={warehouseId}
                onChange={(e) => setWarehouseId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-md focus:ring-1 focus:ring-blue-500 bg-white"
              >
                {warehouses.map((wh) => (
                  <option key={wh.id} value={wh.id}>
                    {wh.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Barang Diperiksa *</label>
              <select
                value={itemId}
                onChange={(e) => setItemId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-md focus:ring-1 focus:ring-blue-500 bg-white"
              >
                {inventory.map((item) => (
                  <option key={item.id} value={item.id}>
                    [{item.sku}] {item.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Variance Comparison Box */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <span className="text-[11px] text-slate-500 block">Stok Sistem</span>
                <span className="font-mono text-base font-bold text-slate-900 tabular-nums">
                  {systemQty} {currentItem?.unit}
                </span>
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <span className="text-[11px] text-slate-500 block">Stok Fisik Aktual</span>
                <input
                  type="number"
                  min="0"
                  value={physicalQty}
                  onChange={(e) => setPhysicalQty(Math.max(0, Number(e.target.value)))}
                  className="w-full text-center font-mono text-base font-bold text-blue-600 tabular-nums border-b border-blue-400 focus:outline-none"
                />
              </div>
              <div
                className={`p-2 rounded-lg border ${
                  diffQty === 0
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : diffQty < 0
                    ? 'bg-rose-50 border-rose-200 text-rose-800'
                    : 'bg-amber-50 border-amber-200 text-amber-800'
                }`}
              >
                <span className="text-[11px] block">Selisih Fisik</span>
                <span className="font-mono text-base font-bold tabular-nums">
                  {diffQty > 0 ? `+${diffQty}` : diffQty} {currentItem?.unit}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200 text-slate-600">
              <span>Valuasi Dampak Selisih:</span>
              <span
                className={`font-mono font-bold tabular-nums ${
                  diffValue < 0 ? 'text-rose-600' : diffValue > 0 ? 'text-amber-600' : 'text-slate-700'
                }`}
              >
                {formatIDR(diffValue)}
              </span>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Alasan / Catatan Temuan Selisih
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Contoh: Barang susut, rusak saat pemindahan, atau salah hitung awal"
              className="w-full px-3 py-2 border border-slate-200 rounded-md focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Automatic Adjustment Checkbox */}
          <label className="flex items-start gap-2.5 p-3 bg-blue-50/70 border border-blue-100 rounded-lg cursor-pointer">
            <input
              type="checkbox"
              checked={applyAdjustment}
              onChange={(e) => setApplyAdjustment(e.target.checked)}
              className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
            />
            <div className="text-xs text-slate-700">
              <span className="font-semibold text-slate-900 block">
                Otomatis Sesuaikan Saldo Stok & Jurnal Akuntansi
              </span>
              <span className="text-slate-500 text-[11px]">
                Jika dicentang, sistem langsung mengoreksi stok gudang dan mencatat beban selisih opname
                ke Buku Besar (COA Akun 5020 & 1200).
              </span>
            </div>
          </label>

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
              <span>Simpan Laporan Opname</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
