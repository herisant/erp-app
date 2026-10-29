import React, { useState } from 'react';
import { useErp } from '../context/ErpContext';
import { InventoryCategory, InventoryItem } from '../types/erp';
import { formatIDR, formatNumber, formatDate } from '../utils/formatters';
import {
  Boxes,
  Plus,
  ArrowDownRight,
  ArrowUpRight,
  ArrowLeftRight,
  ClipboardCheck,
  Search,
  Edit2,
  Trash2,
  AlertCircle,
  Warehouse as WarehouseIcon,
} from 'lucide-react';

interface InventoryViewProps {
  onOpenNewItem: (editItem?: InventoryItem) => void;
  onOpenStockMovement: (defaultType?: 'INBOUND' | 'OUTBOUND' | 'TRANSFER') => void;
  onOpenStockOpname: () => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  onOpenNewItem,
  onOpenStockMovement,
  onOpenStockOpname,
}) => {
  const {
    inventory,
    warehouses,
    selectedWarehouseId,
    stockTransactions,
    stockOpnameList,
    searchQuery,
    deleteInventoryItem,
    getTotalInventoryValue,
  } = useErp();

  const [subTab, setSubTab] = useState<'catalog' | 'history' | 'opname' | 'transfer'>('catalog');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [stockStatusFilter, setStockStatusFilter] = useState<'ALL' | 'LOW' | 'NORMAL'>('ALL');

  // Filter inventory
  const filteredInventory = inventory.filter((item) => {
    // Search query
    const matchSearch =
      searchQuery === '' ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.barcode.includes(searchQuery);

    // Category
    const matchCategory = categoryFilter === 'ALL' || item.category === categoryFilter;

    // Stock Status
    let qty = 0;
    if (selectedWarehouseId === 'ALL') {
      qty = Object.values(item.stockByWarehouse).reduce((a, b) => a + b, 0);
    } else {
      qty = item.stockByWarehouse[selectedWarehouseId] || 0;
    }

    const isLow = qty <= item.reorderPoint;
    const matchStatus =
      stockStatusFilter === 'ALL' ||
      (stockStatusFilter === 'LOW' && isLow) ||
      (stockStatusFilter === 'NORMAL' && !isLow);

    return matchSearch && matchCategory && matchStatus;
  });

  const categories: InventoryCategory[] = [
    'Bahan Baku',
    'Komponen Mekanikal',
    'Komponen Elektronik',
    'Produk Jadi',
    'Kemasan',
    'Alat & Perlengkapan',
  ];

  return (
    <div className="space-y-6">
      {/* Sub-navigation tabs & Action buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium">
          <button
            onClick={() => setSubTab('catalog')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              subTab === 'catalog'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Katalog Master Barang ({inventory.length})
          </button>
          <button
            onClick={() => setSubTab('history')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              subTab === 'history'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Mutasi & Riwayat Stok
          </button>
          <button
            onClick={() => setSubTab('opname')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              subTab === 'opname'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Stock Opname & Rekonsiliasi
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onOpenStockMovement('INBOUND')}
            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-semibold transition-colors border border-emerald-200"
          >
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>+ Stok Masuk (PO)</span>
          </button>
          <button
            onClick={() => onOpenStockMovement('TRANSFER')}
            className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Mutasi Cabang</span>
          </button>
          <button
            onClick={() => onOpenStockOpname()}
            className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors"
          >
            <ClipboardCheck className="w-3.5 h-3.5" />
            <span>Audit Opname</span>
          </button>
          <button
            onClick={() => onOpenNewItem()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Master Baru</span>
          </button>
        </div>
      </div>

      {/* CATALOG VIEW */}
      {subTab === 'catalog' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white border border-slate-200 rounded-xl text-xs">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-medium">Kategori:</span>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1 font-medium focus:outline-none"
                >
                  <option value="ALL">Semua Kategori</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-medium">Status Stok:</span>
                <select
                  value={stockStatusFilter}
                  onChange={(e) => setStockStatusFilter(e.target.value as any)}
                  className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1 font-medium focus:outline-none"
                >
                  <option value="ALL">Semua Status</option>
                  <option value="LOW">Stok Kritis (≤ ROP)</option>
                  <option value="NORMAL">Stok Aman</option>
                </select>
              </div>
            </div>

            <div className="text-slate-500 font-mono text-[11px]">
              Menampilkan {filteredInventory.length} dari {inventory.length} item
            </div>
          </div>

          {/* Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3">Kode SKU & Barcode</th>
                    <th className="py-3 px-3">Nama Barang / Material</th>
                    <th className="py-3 px-3">Kategori</th>
                    <th className="py-3 px-3 text-center">Rak</th>
                    <th className="py-3 px-3 text-right">HPP (Beli)</th>
                    <th className="py-3 px-3 text-right">Harga Jual</th>
                    <th className="py-3 px-3 text-right">Stok Fisik</th>
                    <th className="py-3 px-3 text-right">Valuasi Stok</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInventory.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-12 text-center text-slate-400">
                        Tidak ada barang yang sesuai filter pencarian.
                      </td>
                    </tr>
                  ) : (
                    filteredInventory.map((item) => {
                      let qty = 0;
                      if (selectedWarehouseId === 'ALL') {
                        qty = Object.values(item.stockByWarehouse).reduce((a, b) => a + b, 0);
                      } else {
                        qty = item.stockByWarehouse[selectedWarehouseId] || 0;
                      }

                      const valuation = qty * item.unitCost;
                      const isLowStock = qty <= item.reorderPoint;
                      const margin = item.sellingPrice - item.unitCost;
                      const marginPct = ((margin / item.sellingPrice) * 100).toFixed(0);

                      return (
                        <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-3">
                            <span className="font-mono font-bold text-slate-900 block">
                              {item.sku}
                            </span>
                            <span className="font-mono text-[10px] text-slate-400">
                              {item.barcode}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-semibold text-slate-900 block max-w-xs truncate">
                              {item.name}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              Satuan: {item.unit} · Lead Time: {item.leadTimeDays} Hari
                            </span>
                          </td>
                          <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                            {item.category}
                          </td>
                          <td className="py-3 px-3 text-center font-mono text-slate-500">
                            {item.locationRack}
                          </td>
                          <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700">
                            {formatIDR(item.unitCost)}
                          </td>
                          <td className="py-3 px-3 text-right font-mono tabular-nums">
                            <span className="font-semibold text-slate-900">
                              {formatIDR(item.sellingPrice)}
                            </span>
                            <span className="text-[10px] text-emerald-600 block">+{marginPct}%</span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <span
                              className={`font-mono font-bold text-sm tabular-nums ${
                                isLowStock ? 'text-rose-600' : 'text-slate-900'
                              }`}
                            >
                              {formatNumber(qty)} {item.unit}
                            </span>
                            <span className="text-[10px] text-slate-400 block font-mono">
                              Min: {item.minStock} / ROP: {item.reorderPoint}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-semibold text-slate-900 tabular-nums">
                            {formatIDR(valuation)}
                          </td>
                          <td className="py-3 px-3 text-center whitespace-nowrap">
                            {isLowStock ? (
                              <span className="text-[11px] text-rose-700 font-semibold">
                                Reorder Segera
                              </span>
                            ) : (
                              <span className="text-[11px] text-emerald-700 font-medium">
                                Aman
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => onOpenNewItem(item)}
                                title="Edit master barang"
                                className="p-1 text-slate-400 hover:text-blue-600 rounded"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Yakin ingin menghapus ${item.name}?`)) {
                                    deleteInventoryItem(item.id);
                                  }
                                }}
                                title="Hapus barang"
                                className="p-1 text-slate-400 hover:text-rose-600 rounded"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* HISTORY / MOVEMENTS VIEW */}
      {subTab === 'history' && (
        <div className="space-y-4">
          <div className="p-4 bg-white border border-slate-200 rounded-xl">
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Buku Mutasi Barang Masuk & Keluar
            </h3>
            <p className="text-xs text-slate-500">
              Audit trail transaksi fisik pergudangan lengkap dengan nilai perolehan dan referensi
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3">Tanggal / Waktu</th>
                    <th className="py-3 px-3">Tipe Mutasi</th>
                    <th className="py-3 px-3">No. Dokumen Ref</th>
                    <th className="py-3 px-3">Barang & SKU</th>
                    <th className="py-3 px-3">Gudang</th>
                    <th className="py-3 px-3 text-right">Kuantitas</th>
                    <th className="py-3 px-3 text-right">Biaya Satuan</th>
                    <th className="py-3 px-3 text-right">Total Nilai</th>
                    <th className="py-3 px-3">Catatan</th>
                    <th className="py-3 px-3">Operator</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stockTransactions.map((trx) => (
                    <tr key={trx.id} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500 tabular-nums">
                        {formatDate(trx.date)}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`font-semibold ${
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
                            : 'Opname Fisik'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-medium text-slate-900">{trx.refNo}</td>
                      <td className="py-2.5 px-3">
                        <span className="font-semibold text-slate-800 block">{trx.itemName}</span>
                        <span className="font-mono text-[10px] text-slate-400">{trx.sku}</span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">
                        {warehouses.find((w) => w.id === trx.warehouseId)?.city || trx.warehouseId}
                        {trx.targetWarehouseId && (
                          <span className="text-blue-600 font-medium">
                            {' '}
                            →{' '}
                            {warehouses.find((w) => w.id === trx.targetWarehouseId)?.city ||
                              trx.targetWarehouseId}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold tabular-nums">
                        {trx.qty > 0 ? `+${trx.qty}` : trx.qty}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-600 tabular-nums">
                        {formatIDR(trx.unitCost)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                        {formatIDR(Math.abs(trx.totalValue))}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 max-w-xs truncate">{trx.notes}</td>
                      <td className="py-2.5 px-3 text-slate-600">{trx.operator}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* STOCK OPNAME VIEW */}
      {subTab === 'opname' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white border border-slate-200 rounded-xl">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Riwayat Rekonsiliasi Stock Opname
              </h3>
              <p className="text-xs text-slate-500">
                Pencocokan stok fisik berkala dan penyesuaian otomatis ke Buku Besar
              </p>
            </div>
            <button
              onClick={onOpenStockOpname}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
            >
              <ClipboardCheck className="w-3.5 h-3.5" />
              <span>+ Mulai Audit Opname Baru</span>
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3">Tanggal Audit</th>
                    <th className="py-3 px-3">Gudang</th>
                    <th className="py-3 px-3">Barang & SKU</th>
                    <th className="py-3 px-3 text-right">Stok Sistem</th>
                    <th className="py-3 px-3 text-right">Stok Fisik</th>
                    <th className="py-3 px-3 text-right">Selisih Unit</th>
                    <th className="py-3 px-3 text-right">Dampak Finansial</th>
                    <th className="py-3 px-3">Catatan / Alasan</th>
                    <th className="py-3 px-3">Auditor</th>
                    <th className="py-3 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stockOpnameList.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-12 text-center text-slate-400">
                        Belum ada laporan stock opname periode ini. Klik "+ Mulai Audit Opname Baru"
                        untuk mencatat hasil audit fisik.
                      </td>
                    </tr>
                  ) : (
                    stockOpnameList.map((opn) => (
                      <tr key={opn.id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-3 font-mono text-[11px] text-slate-500 tabular-nums">
                          {formatDate(opn.date)}
                        </td>
                        <td className="py-3 px-3 font-medium text-slate-700">
                          {warehouses.find((w) => w.id === opn.warehouseId)?.name}
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-semibold text-slate-900 block">{opn.itemName}</span>
                          <span className="font-mono text-[10px] text-slate-400">{opn.sku}</span>
                        </td>
                        <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700">
                          {opn.systemQty}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-blue-600 tabular-nums">
                          {opn.physicalQty}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold tabular-nums">
                          <span
                            className={
                              opn.differenceQty === 0
                                ? 'text-slate-500'
                                : opn.differenceQty < 0
                                ? 'text-rose-600'
                                : 'text-amber-600'
                            }
                          >
                            {opn.differenceQty > 0 ? `+${opn.differenceQty}` : opn.differenceQty}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold tabular-nums">
                          <span
                            className={
                              opn.differenceValue === 0
                                ? 'text-slate-500'
                                : opn.differenceValue < 0
                                ? 'text-rose-600'
                                : 'text-amber-600'
                            }
                          >
                            {formatIDR(opn.differenceValue)}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-600 max-w-xs">{opn.reason}</td>
                        <td className="py-3 px-3 text-slate-700">{opn.auditor}</td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`font-semibold text-[11px] ${
                              opn.status === 'APPLIED' ? 'text-emerald-700' : 'text-slate-500'
                            }`}
                          >
                            {opn.status === 'APPLIED' ? 'Sudah Disesuaikan' : 'Draft'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
