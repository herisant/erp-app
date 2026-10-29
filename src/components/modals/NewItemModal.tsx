import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { InventoryCategory, InventoryItem } from '../../types/erp';
import { X, Check } from 'lucide-react';

interface NewItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  editItem?: InventoryItem | null;
}

const CATEGORIES: InventoryCategory[] = [
  'Bahan Baku',
  'Komponen Mekanikal',
  'Komponen Elektronik',
  'Produk Jadi',
  'Kemasan',
  'Alat & Perlengkapan',
];

const UNITS = ['Pcs', 'Unit', 'Lembar', 'Sak', 'Roll', 'Kg', 'Liter', 'Box'];

export const NewItemModal: React.FC<NewItemModalProps> = ({ isOpen, onClose, editItem }) => {
  const { warehouses, addInventoryItem, updateInventoryItem } = useErp();

  const [sku, setSku] = useState(editItem ? editItem.sku : '');
  const [name, setName] = useState(editItem ? editItem.name : '');
  const [barcode, setBarcode] = useState(editItem ? editItem.barcode : '');
  const [category, setCategory] = useState<InventoryCategory>(editItem ? editItem.category : 'Komponen Elektronik');
  const [unit, setUnit] = useState(editItem ? editItem.unit : 'Pcs');
  const [unitCost, setUnitCost] = useState(editItem ? editItem.unitCost : 100000);
  const [sellingPrice, setSellingPrice] = useState(editItem ? editItem.sellingPrice : 150000);
  const [minStock, setMinStock] = useState(editItem ? editItem.minStock : 10);
  const [reorderPoint, setReorderPoint] = useState(editItem ? editItem.reorderPoint : 20);
  const [locationRack, setLocationRack] = useState(editItem ? editItem.locationRack : 'A-01-01');
  const [leadTimeDays, setLeadTimeDays] = useState(editItem ? editItem.leadTimeDays : 7);
  const [notes, setNotes] = useState(editItem ? editItem.notes || '' : '');

  // Stocks by warehouse
  const [stockByWarehouse, setStockByWarehouse] = useState<Record<string, number>>(
    editItem
      ? editItem.stockByWarehouse
      : warehouses.reduce((acc, wh) => ({ ...acc, [wh.id]: 0 }), {})
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sku.trim() || !name.trim()) return;

    if (editItem) {
      updateInventoryItem(editItem.id, {
        sku,
        name,
        barcode: barcode || `899${Date.now().toString().slice(-10)}`,
        category,
        unit,
        unitCost: Number(unitCost),
        sellingPrice: Number(sellingPrice),
        minStock: Number(minStock),
        reorderPoint: Number(reorderPoint),
        locationRack,
        leadTimeDays: Number(leadTimeDays),
        stockByWarehouse,
        notes,
      });
    } else {
      addInventoryItem({
        sku,
        name,
        barcode: barcode || `899${Date.now().toString().slice(-10)}`,
        category,
        unit,
        unitCost: Number(unitCost),
        sellingPrice: Number(sellingPrice),
        minStock: Number(minStock),
        reorderPoint: Number(reorderPoint),
        locationRack,
        leadTimeDays: Number(leadTimeDays),
        stockByWarehouse,
        notes,
      });
    }
    onClose();
  };

  const generateAutoSku = () => {
    const catPrefix = category.slice(0, 3).toUpperCase();
    const rand = Math.floor(Math.random() * 900 + 100);
    setSku(`${catPrefix}-${rand}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {editItem ? 'Edit Data Barang Inventaris' : 'Tambah Master Barang Baru'}
            </h3>
            <p className="text-xs text-slate-500">
              Registrasi katalog produk, spesifikasi teknis, harga & alokasi gudang
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* General Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-700">Kode SKU *</label>
                <button
                  type="button"
                  onClick={generateAutoSku}
                  className="text-blue-600 hover:underline text-[11px]"
                >
                  Generate SKU
                </button>
              </div>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="Contoh: ELC-VFD-005"
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Barcode / EAN-13</label>
              <input
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="Otomatis jika kosong"
                className="w-full px-3 py-2 border border-slate-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Nama Barang / Deskripsi Teknis *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama resmi barang dan spesifikasi"
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kategori Persediaan</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as InventoryCategory)}
                className="w-full px-3 py-2 border border-slate-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Satuan Dasar</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white"
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Pricing & Valuation */}
          <div className="pt-2 border-t border-slate-100">
            <h4 className="font-semibold text-slate-900 mb-2.5">Harga Pokok (HPP) & Harga Jual</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Biaya Perolehan / HPP Beli (IDR)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-400 font-medium">Rp</span>
                  <input
                    type="number"
                    min="0"
                    value={unitCost}
                    onChange={(e) => setUnitCost(Number(e.target.value))}
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none font-mono tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Harga Jual Satuan Standar (IDR)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-400 font-medium">Rp</span>
                  <input
                    type="number"
                    min="0"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(Number(e.target.value))}
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none font-mono tabular-nums"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Reorder & Logistics */}
          <div className="pt-2 border-t border-slate-100">
            <h4 className="font-semibold text-slate-900 mb-2.5">Parameter Ambang Stok & Pergudangan</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-600 mb-1">Stok Minimum</label>
                <input
                  type="number"
                  min="0"
                  value={minStock}
                  onChange={(e) => setMinStock(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md font-mono tabular-nums"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1">Reorder Point</label>
                <input
                  type="number"
                  min="0"
                  value={reorderPoint}
                  onChange={(e) => setReorderPoint(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md font-mono tabular-nums"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1">Lead Time (Hari)</label>
                <input
                  type="number"
                  min="1"
                  value={leadTimeDays}
                  onChange={(e) => setLeadTimeDays(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md font-mono tabular-nums"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1">Lokasi Rak / Bin</label>
                <input
                  type="text"
                  value={locationRack}
                  onChange={(e) => setLocationRack(e.target.value)}
                  placeholder="A-01-01"
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md font-mono"
                />
              </div>
            </div>
          </div>

          {/* Multi-Warehouse Stock Distribution */}
          <div className="pt-2 border-t border-slate-100">
            <h4 className="font-semibold text-slate-900 mb-2.5">Alokasi Stok Awal Per Gudang</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {warehouses.map((wh) => (
                <div
                  key={wh.id}
                  className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-slate-800">{wh.name}</p>
                    <p className="text-[11px] text-slate-500">{wh.city}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min="0"
                      value={stockByWarehouse[wh.id] || 0}
                      onChange={(e) =>
                        setStockByWarehouse({
                          ...stockByWarehouse,
                          [wh.id]: Math.max(0, Number(e.target.value)),
                        })
                      }
                      className="w-20 px-2 py-1 text-right border border-slate-300 rounded bg-white font-mono tabular-nums"
                    />
                    <span className="text-slate-500">{unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-medium text-slate-700 mb-1">Catatan Tambahan</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Catatan teknis, spesifikasi material, nomor garansi..."
              className="w-full px-3 py-2 border border-slate-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg font-medium transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors shadow-xs"
            >
              <Check className="w-4 h-4" />
              <span>{editItem ? 'Simpan Perubahan' : 'Simpan Barang Baru'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
