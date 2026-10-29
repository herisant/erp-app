/**
 * Aksara Cloud ERP - Core Type Definitions
 * Indonesian Enterprise Inventory & Financial Management Schema
 */

export type UserRole = 'DIREKTUR' | 'FINANCE_MANAGER' | 'KEPALA_GUDANG' | 'AUDITOR';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleTitle: string;
  branch: string;
  avatarUrl: string;
}

export interface CompanyProfile {
  name: string;
  tagline: string;
  taxId: string; // NPWP
  nib: string; // Nomor Induk Berusaha
  address: string;
  city: string;
  phone: string;
  email: string;
  website: string;
  currency: string;
  fiscalYear: number;
}

export interface Warehouse {
  id: string;
  code: string;
  name: string;
  city: string;
  address: string;
  capacitySqM: number;
  manager: string;
  phone: string;
  isActive: boolean;
}

export type InventoryCategory =
  | 'Bahan Baku'
  | 'Komponen Mekanikal'
  | 'Komponen Elektronik'
  | 'Produk Jadi'
  | 'Kemasan'
  | 'Alat & Perlengkapan';

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  barcode: string;
  category: InventoryCategory;
  unit: string; // Pcs, Unit, Box, Roll, Kg, Liter
  unitCost: number; // IDR (HPP / Biaya Perolehan)
  sellingPrice: number; // IDR
  minStock: number;
  reorderPoint: number;
  locationRack: string;
  leadTimeDays: number;
  stockByWarehouse: Record<string, number>; // { 'WH-JKT': 120, 'WH-SBY': 45 }
  notes?: string;
  lastUpdated: string;
}

export type StockMovementType =
  | 'IN_PURCHASE' // Penerimaan Barang dari Pemasok (PO)
  | 'OUT_SALES' // Pengeluaran untuk Pengiriman Penjualan (DO)
  | 'TRANSFER' // Mutasi Antar Gudang
  | 'ADJUSTMENT_OPNAME' // Penyesuaian Hasil Audit Fisik
  | 'SCRAP'; // Pemusnahan / Rusak

export interface StockTransaction {
  id: string;
  date: string;
  refNo: string;
  type: StockMovementType;
  itemId: string;
  sku: string;
  itemName: string;
  warehouseId: string;
  targetWarehouseId?: string;
  qty: number;
  unitCost: number;
  totalValue: number;
  notes: string;
  operator: string;
  status: 'COMPLETED' | 'IN_TRANSIT' | 'DRAFT';
}

export interface StockOpnameItem {
  id: string;
  date: string;
  warehouseId: string;
  itemId: string;
  sku: string;
  itemName: string;
  systemQty: number;
  physicalQty: number;
  differenceQty: number;
  unitCost: number;
  differenceValue: number;
  reason: string;
  status: 'DRAFT' | 'APPLIED';
  auditor: string;
}

export type AccountCategory = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';

export interface Account {
  code: string;
  name: string;
  category: AccountCategory;
  subcategory: string;
  normalBalance: 'DEBIT' | 'CREDIT';
  balance: number;
  isHeader?: boolean;
  description?: string;
}

export interface JournalEntryLine {
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  memo?: string;
}

export interface JournalEntry {
  id: string;
  voucherNo: string;
  date: string;
  refNo: string;
  description: string;
  source: 'MANUAL' | 'INVOICE' | 'PURCHASE' | 'STOCK_OPNAME' | 'PAYMENT' | 'BANK';
  lines: JournalEntryLine[];
  totalDebit: number;
  totalCredit: number;
  createdBy: string;
}

export interface InvoiceLineItem {
  id: string;
  itemId: string;
  sku: string;
  name: string;
  qty: number;
  unit: string;
  unitPrice: number;
  discountPct: number;
  subtotal: number;
}

export type InvoiceStatus = 'DRAFT' | 'UNPAID' | 'PARTIAL' | 'PAID' | 'OVERDUE';

export interface SalesInvoice {
  id: string;
  invoiceNo: string;
  customerName: string;
  customerTaxId?: string;
  customerPhone?: string;
  customerAddress?: string;
  date: string;
  dueDate: string;
  paymentTerms: 'COD' | 'NET15' | 'NET30' | 'NET45';
  warehouseId: string;
  items: InvoiceLineItem[];
  subtotal: number;
  discountTotal: number;
  taxRate: number; // e.g. 0.11 for PPN 11%
  taxAmount: number;
  grandTotal: number;
  paidAmount: number;
  status: InvoiceStatus;
  notes?: string;
}

export interface PurchaseBill {
  id: string;
  billNo: string;
  vendorName: string;
  vendorTaxId?: string;
  vendorPhone?: string;
  poNo: string;
  date: string;
  dueDate: string;
  paymentTerms: 'COD' | 'NET15' | 'NET30' | 'NET60';
  warehouseId: string;
  items: InvoiceLineItem[];
  subtotal: number;
  taxAmount: number;
  grandTotal: number;
  paidAmount: number;
  status: InvoiceStatus;
  notes?: string;
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  type: 'GIRO' | 'TABUNGAN' | 'KAS_KECIL';
  balance: number;
  accountCode: string; // Linked to COA (e.g. 1010, 1020, 1030)
}

export interface BankTransaction {
  id: string;
  date: string;
  bankId: string;
  type: 'IN' | 'OUT';
  amount: number;
  counterpartName: string;
  refNo: string;
  accountCode: string;
  notes: string;
}

export interface CloudSyncState {
  status: 'ONLINE' | 'SYNCING' | 'OFFLINE';
  lastSyncedAt: string;
  pendingSyncCount: number;
  cloudRegion: string;
  activeNodes: number;
}
