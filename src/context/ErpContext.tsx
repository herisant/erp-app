import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  Account,
  BankAccount,
  CloudSyncState,
  CompanyProfile,
  InventoryItem,
  InvoiceStatus,
  JournalEntry,
  PurchaseBill,
  SalesInvoice,
  StockOpnameItem,
  StockTransaction,
  UserProfile,
  UserRole,
  Warehouse,
} from '../types/erp';
import {
  initialBankAccounts,
  initialChartOfAccounts,
  initialCompany,
  initialInventory,
  initialInvoices,
  initialJournalEntries,
  initialPurchaseBills,
  initialStockTransactions,
  initialUserProfile,
  initialWarehouses,
} from '../data/mockErpData';
import { generateId } from '../utils/formatters';

interface ErpContextType {
  company: CompanyProfile;
  userProfile: UserProfile;
  warehouses: Warehouse[];
  selectedWarehouseId: string; // 'ALL' or specific warehouse id
  inventory: InventoryItem[];
  stockTransactions: StockTransaction[];
  stockOpnameList: StockOpnameItem[];
  chartOfAccounts: Account[];
  bankAccounts: BankAccount[];
  invoices: SalesInvoice[];
  purchaseBills: PurchaseBill[];
  journalEntries: JournalEntry[];
  cloudSync: CloudSyncState;
  activeTab: 'dashboard' | 'inventory' | 'finance' | 'reports' | 'cloud';
  searchQuery: string;

  // Setters & Actions
  setSelectedWarehouseId: (id: string) => void;
  setActiveTab: (tab: 'dashboard' | 'inventory' | 'finance' | 'reports' | 'cloud') => void;
  setSearchQuery: (query: string) => void;
  setUserRole: (role: UserRole) => void;

  // Inventory Actions
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'lastUpdated'>) => void;
  updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => void;
  deleteInventoryItem: (id: string) => void;
  recordStockInbound: (data: {
    itemId: string;
    warehouseId: string;
    qty: number;
    unitCost: number;
    poNo: string;
    vendorName: string;
    notes: string;
  }) => void;
  recordStockOutbound: (data: {
    itemId: string;
    warehouseId: string;
    qty: number;
    refNo: string;
    notes: string;
  }) => boolean;
  recordStockTransfer: (data: {
    itemId: string;
    fromWarehouseId: string;
    toWarehouseId: string;
    qty: number;
    notes: string;
  }) => boolean;
  recordStockOpname: (data: {
    warehouseId: string;
    itemId: string;
    physicalQty: number;
    reason: string;
    applyAdjustment: boolean;
  }) => void;

  // Finance Actions
  createSalesInvoice: (invoice: Omit<SalesInvoice, 'id' | 'paidAmount' | 'status'>) => void;
  recordInvoicePayment: (invoiceId: string, amount: number, bankId: string, notes?: string) => void;
  recordBillPayment: (billId: string, amount: number, bankId: string) => void;
  createManualJournalEntry: (
    description: string,
    refNo: string,
    lines: { accountCode: string; debit: number; credit: number; memo?: string }[]
  ) => boolean;

  // Cloud & Maintenance
  triggerCloudSync: () => void;
  exportDatabaseJSON: () => string;
  importDatabaseJSON: (jsonStr: string) => boolean;
  resetToDefaultData: () => void;

  // Computed Aggregates
  getTotalInventoryValue: (warehouseId?: string) => number;
  getTotalItemsCount: (warehouseId?: string) => number;
  getLowStockItems: (warehouseId?: string) => InventoryItem[];
  getTotalCashAndBank: () => number;
  getTotalReceivables: () => number;
  getTotalPayables: () => number;
  getCurrentMonthRevenue: () => number;
  getCurrentMonthCOGS: () => number;
}

const ErpContext = createContext<ErpContextType | null>(null);

const STORAGE_KEY = 'aksara_erp_cloud_data_v1';

export const ErpProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [company, setCompany] = useState<CompanyProfile>(initialCompany);
  const [userProfile, setUserProfile] = useState<UserProfile>(initialUserProfile);
  const [warehouses, setWarehouses] = useState<Warehouse[]>(initialWarehouses);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>('ALL');
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
  const [stockTransactions, setStockTransactions] = useState<StockTransaction[]>(initialStockTransactions);
  const [stockOpnameList, setStockOpnameList] = useState<StockOpnameItem[]>([]);
  const [chartOfAccounts, setChartOfAccounts] = useState<Account[]>(initialChartOfAccounts);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(initialBankAccounts);
  const [invoices, setInvoices] = useState<SalesInvoice[]>(initialInvoices);
  const [purchaseBills, setPurchaseBills] = useState<PurchaseBill[]>(initialPurchaseBills);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(initialJournalEntries);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'finance' | 'reports' | 'cloud'>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [cloudSync, setCloudSync] = useState<CloudSyncState>({
    status: 'ONLINE',
    lastSyncedAt: new Date().toISOString(),
    pendingSyncCount: 0,
    cloudRegion: 'asia-southeast1 (Jakarta)',
    activeNodes: 4,
  });

  // Load from LocalStorage once on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.inventory) setInventory(parsed.inventory);
        if (parsed.stockTransactions) setStockTransactions(parsed.stockTransactions);
        if (parsed.chartOfAccounts) setChartOfAccounts(parsed.chartOfAccounts);
        if (parsed.bankAccounts) setBankAccounts(parsed.bankAccounts);
        if (parsed.invoices) setInvoices(parsed.invoices);
        if (parsed.purchaseBills) setPurchaseBills(parsed.purchaseBills);
        if (parsed.journalEntries) setJournalEntries(parsed.journalEntries);
        if (parsed.stockOpnameList) setStockOpnameList(parsed.stockOpnameList);
        if (parsed.warehouses) setWarehouses(parsed.warehouses);
        if (parsed.company) setCompany(parsed.company);
      }
    } catch {
      // Fallback to initial mock data if corrupted
    }
  }, []);

  // Save to LocalStorage on updates
  const persistState = (newState: {
    inventory?: InventoryItem[];
    stockTransactions?: StockTransaction[];
    chartOfAccounts?: Account[];
    bankAccounts?: BankAccount[];
    invoices?: SalesInvoice[];
    purchaseBills?: PurchaseBill[];
    journalEntries?: JournalEntry[];
    stockOpnameList?: StockOpnameItem[];
    warehouses?: Warehouse[];
  }) => {
    try {
      const current = {
        inventory: newState.inventory || inventory,
        stockTransactions: newState.stockTransactions || stockTransactions,
        chartOfAccounts: newState.chartOfAccounts || chartOfAccounts,
        bankAccounts: newState.bankAccounts || bankAccounts,
        invoices: newState.invoices || invoices,
        purchaseBills: newState.purchaseBills || purchaseBills,
        journalEntries: newState.journalEntries || journalEntries,
        stockOpnameList: newState.stockOpnameList || stockOpnameList,
        warehouses: newState.warehouses || warehouses,
        company,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    } catch {
      // Ignore quota errors
    }
  };

  const triggerCloudSync = () => {
    setCloudSync((prev) => ({ ...prev, status: 'SYNCING' }));
    setTimeout(() => {
      setCloudSync({
        status: 'ONLINE',
        lastSyncedAt: new Date().toISOString(),
        pendingSyncCount: 0,
        cloudRegion: 'asia-southeast1 (Jakarta)',
        activeNodes: 4,
      });
    }, 600);
  };

  const setUserRole = (role: UserRole) => {
    const titles: Record<UserRole, string> = {
      DIREKTUR: 'Direktur Operasional & Keuangan (CFO)',
      FINANCE_MANAGER: 'Manajer Akuntansi & Perpajakan',
      KEPALA_GUDANG: 'Kepala Manajemen Gudang & Logistik',
      AUDITOR: 'Auditor Internal & Kepatuhan Sistem',
    };
    setUserProfile((prev) => ({
      ...prev,
      role,
      roleTitle: titles[role],
    }));
  };

  // Helper to update COA balance
  const adjustAccountBalance = (code: string, debit: number, credit: number, accountsList: Account[]): Account[] => {
    return accountsList.map((acc) => {
      if (acc.code === code) {
        const netChange = acc.normalBalance === 'DEBIT' ? debit - credit : credit - debit;
        return { ...acc, balance: acc.balance + netChange };
      }
      return acc;
    });
  };

  // --- Inventory Operations ---
  const addInventoryItem = (itemData: Omit<InventoryItem, 'id' | 'lastUpdated'>) => {
    const newItem: InventoryItem = {
      ...itemData,
      id: generateId('ITEM'),
      lastUpdated: new Date().toISOString(),
    };
    const updated = [newItem, ...inventory];
    setInventory(updated);
    persistState({ inventory: updated });
    triggerCloudSync();
  };

  const updateInventoryItem = (id: string, updates: Partial<InventoryItem>) => {
    const updated = inventory.map((item) =>
      item.id === id ? { ...item, ...updates, lastUpdated: new Date().toISOString() } : item
    );
    setInventory(updated);
    persistState({ inventory: updated });
    triggerCloudSync();
  };

  const deleteInventoryItem = (id: string) => {
    const updated = inventory.filter((item) => item.id !== id);
    setInventory(updated);
    persistState({ inventory: updated });
    triggerCloudSync();
  };

  const recordStockInbound = (data: {
    itemId: string;
    warehouseId: string;
    qty: number;
    unitCost: number;
    poNo: string;
    vendorName: string;
    notes: string;
  }) => {
    const item = inventory.find((i) => i.id === data.itemId);
    if (!item) return;

    // 1. Update stock in warehouse
    const currentStock = item.stockByWarehouse[data.warehouseId] || 0;
    const updatedStockByWarehouse = {
      ...item.stockByWarehouse,
      [data.warehouseId]: currentStock + data.qty,
    };
    const updatedInventory = inventory.map((i) =>
      i.id === data.itemId ? { ...i, stockByWarehouse: updatedStockByWarehouse, unitCost: data.unitCost } : i
    );
    setInventory(updatedInventory);

    // 2. Add Stock Transaction
    const totalValue = data.qty * data.unitCost;
    const newTrx: StockTransaction = {
      id: generateId('TRX'),
      date: new Date().toISOString(),
      refNo: data.poNo,
      type: 'IN_PURCHASE',
      itemId: data.itemId,
      sku: item.sku,
      itemName: item.name,
      warehouseId: data.warehouseId,
      qty: data.qty,
      unitCost: data.unitCost,
      totalValue,
      notes: data.notes || `Penerimaan PO dari ${data.vendorName}`,
      operator: userProfile.name,
      status: 'COMPLETED',
    };
    const updatedTrx = [newTrx, ...stockTransactions];
    setStockTransactions(updatedTrx);

    // 3. Create Purchase Bill
    const taxAmount = Math.round(totalValue * 0.11);
    const grandTotal = totalValue + taxAmount;
    const newBill: PurchaseBill = {
      id: generateId('BILL'),
      billNo: `BILL/${new Date().getFullYear()}/${generateId('B').slice(-4)}`,
      vendorName: data.vendorName,
      poNo: data.poNo,
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      paymentTerms: 'NET30',
      warehouseId: data.warehouseId,
      items: [
        {
          id: generateId('BL'),
          itemId: item.id,
          sku: item.sku,
          name: item.name,
          qty: data.qty,
          unit: item.unit,
          unitPrice: data.unitCost,
          discountPct: 0,
          subtotal: totalValue,
        },
      ],
      subtotal: totalValue,
      taxAmount,
      grandTotal,
      paidAmount: 0,
      status: 'UNPAID',
      notes: data.notes,
    };
    const updatedBills = [newBill, ...purchaseBills];
    setPurchaseBills(updatedBills);

    // 4. Record Double-Entry Accounting
    // Debet: 1200 Persediaan (totalValue)
    // Debet: 2020 Hutang Pajak PPN / PPN Masukan (taxAmount)
    // Kredit: 2010 Hutang Usaha (grandTotal)
    let updatedCOA = adjustAccountBalance('1200', totalValue, 0, chartOfAccounts);
    updatedCOA = adjustAccountBalance('2020', taxAmount, 0, updatedCOA);
    updatedCOA = adjustAccountBalance('2010', 0, grandTotal, updatedCOA);
    setChartOfAccounts(updatedCOA);

    const newJournal: JournalEntry = {
      id: generateId('JRN'),
      voucherNo: `JV/${new Date().getFullYear()}/${generateId('V').slice(-4)}`,
      date: new Date().toISOString().split('T')[0],
      refNo: data.poNo,
      description: `Penerimaan stok PO ${data.poNo} - ${item.name} (${data.qty} ${item.unit}) dari ${data.vendorName}`,
      source: 'PURCHASE',
      lines: [
        {
          accountCode: '1200',
          accountName: 'Persediaan Barang Dagang & Bahan Baku',
          debit: totalValue,
          credit: 0,
          memo: `Stok masuk ${data.qty} ${item.unit}`,
        },
        {
          accountCode: '2020',
          accountName: 'Hutang Pajak PPN & PPh Keluaran',
          debit: taxAmount,
          credit: 0,
          memo: 'PPN Masukan 11%',
        },
        {
          accountCode: '2010',
          accountName: 'Hutang Usaha (Accounts Payable)',
          debit: 0,
          credit: grandTotal,
          memo: `Tagihan ${data.vendorName}`,
        },
      ],
      totalDebit: grandTotal,
      totalCredit: grandTotal,
      createdBy: userProfile.name,
    };
    const updatedJournals = [newJournal, ...journalEntries];
    setJournalEntries(updatedJournals);

    persistState({
      inventory: updatedInventory,
      stockTransactions: updatedTrx,
      purchaseBills: updatedBills,
      chartOfAccounts: updatedCOA,
      journalEntries: updatedJournals,
    });
    triggerCloudSync();
  };

  const recordStockOutbound = (data: {
    itemId: string;
    warehouseId: string;
    qty: number;
    refNo: string;
    notes: string;
  }): boolean => {
    const item = inventory.find((i) => i.id === data.itemId);
    if (!item) return false;
    const currentStock = item.stockByWarehouse[data.warehouseId] || 0;
    if (currentStock < data.qty) {
      return false; // Insufficient stock
    }

    const updatedStockByWarehouse = {
      ...item.stockByWarehouse,
      [data.warehouseId]: currentStock - data.qty,
    };
    const updatedInventory = inventory.map((i) =>
      i.id === data.itemId ? { ...i, stockByWarehouse: updatedStockByWarehouse } : i
    );
    setInventory(updatedInventory);

    const cogsValue = data.qty * item.unitCost;
    const newTrx: StockTransaction = {
      id: generateId('TRX'),
      date: new Date().toISOString(),
      refNo: data.refNo,
      type: 'OUT_SALES',
      itemId: data.itemId,
      sku: item.sku,
      itemName: item.name,
      warehouseId: data.warehouseId,
      qty: data.qty,
      unitCost: item.unitCost,
      totalValue: cogsValue,
      notes: data.notes || `Pengeluaran barang Surat Jalan ${data.refNo}`,
      operator: userProfile.name,
      status: 'COMPLETED',
    };
    const updatedTrx = [newTrx, ...stockTransactions];
    setStockTransactions(updatedTrx);

    // COGS journal
    let updatedCOA = adjustAccountBalance('5010', cogsValue, 0, chartOfAccounts);
    updatedCOA = adjustAccountBalance('1200', 0, cogsValue, updatedCOA);
    setChartOfAccounts(updatedCOA);

    const newJournal: JournalEntry = {
      id: generateId('JRN'),
      voucherNo: `JV/${new Date().getFullYear()}/${generateId('V').slice(-4)}`,
      date: new Date().toISOString().split('T')[0],
      refNo: data.refNo,
      description: `HPP Pengeluaran Barang DO ${data.refNo} - ${item.name} (${data.qty} ${item.unit})`,
      source: 'MANUAL',
      lines: [
        {
          accountCode: '5010',
          accountName: 'Beban Pokok Penjualan (HPP)',
          debit: cogsValue,
          credit: 0,
          memo: `HPP pengeluaran barang ${item.name}`,
        },
        {
          accountCode: '1200',
          accountName: 'Persediaan Barang Dagang & Bahan Baku',
          debit: 0,
          credit: cogsValue,
          memo: `Pengurangan nilai stok ${data.qty} ${item.unit}`,
        },
      ],
      totalDebit: cogsValue,
      totalCredit: cogsValue,
      createdBy: userProfile.name,
    };
    const updatedJournals = [newJournal, ...journalEntries];
    setJournalEntries(updatedJournals);

    persistState({
      inventory: updatedInventory,
      stockTransactions: updatedTrx,
      chartOfAccounts: updatedCOA,
      journalEntries: updatedJournals,
    });
    triggerCloudSync();
    return true;
  };

  const recordStockTransfer = (data: {
    itemId: string;
    fromWarehouseId: string;
    toWarehouseId: string;
    qty: number;
    notes: string;
  }): boolean => {
    const item = inventory.find((i) => i.id === data.itemId);
    if (!item) return false;
    const sourceStock = item.stockByWarehouse[data.fromWarehouseId] || 0;
    if (sourceStock < data.qty) return false;

    const destStock = item.stockByWarehouse[data.toWarehouseId] || 0;
    const updatedStockByWarehouse = {
      ...item.stockByWarehouse,
      [data.fromWarehouseId]: sourceStock - data.qty,
      [data.toWarehouseId]: destStock + data.qty,
    };

    const updatedInventory = inventory.map((i) =>
      i.id === data.itemId ? { ...i, stockByWarehouse: updatedStockByWarehouse } : i
    );
    setInventory(updatedInventory);

    const transferRef = `TRF-${new Date().getFullYear()}-${generateId('T').slice(-4)}`;
    const newTrx: StockTransaction = {
      id: generateId('TRX'),
      date: new Date().toISOString(),
      refNo: transferRef,
      type: 'TRANSFER',
      itemId: data.itemId,
      sku: item.sku,
      itemName: item.name,
      warehouseId: data.fromWarehouseId,
      targetWarehouseId: data.toWarehouseId,
      qty: data.qty,
      unitCost: item.unitCost,
      totalValue: data.qty * item.unitCost,
      notes: data.notes || `Mutasi stok ${item.sku} antar gudang`,
      operator: userProfile.name,
      status: 'COMPLETED',
    };
    const updatedTrx = [newTrx, ...stockTransactions];
    setStockTransactions(updatedTrx);

    persistState({ inventory: updatedInventory, stockTransactions: updatedTrx });
    triggerCloudSync();
    return true;
  };

  const recordStockOpname = (data: {
    warehouseId: string;
    itemId: string;
    physicalQty: number;
    reason: string;
    applyAdjustment: boolean;
  }) => {
    const item = inventory.find((i) => i.id === data.itemId);
    if (!item) return;

    const systemQty = item.stockByWarehouse[data.warehouseId] || 0;
    const diffQty = data.physicalQty - systemQty;
    const diffValue = diffQty * item.unitCost;

    const opnameItem: StockOpnameItem = {
      id: generateId('OPN'),
      date: new Date().toISOString(),
      warehouseId: data.warehouseId,
      itemId: item.id,
      sku: item.sku,
      itemName: item.name,
      systemQty,
      physicalQty: data.physicalQty,
      differenceQty: diffQty,
      unitCost: item.unitCost,
      differenceValue: diffValue,
      reason: data.reason,
      status: data.applyAdjustment ? 'APPLIED' : 'DRAFT',
      auditor: userProfile.name,
    };

    const updatedOpnameList = [opnameItem, ...stockOpnameList];
    setStockOpnameList(updatedOpnameList);

    if (data.applyAdjustment && diffQty !== 0) {
      // Update inventory stock
      const updatedStockByWarehouse = {
        ...item.stockByWarehouse,
        [data.warehouseId]: data.physicalQty,
      };
      const updatedInventory = inventory.map((i) =>
        i.id === item.id ? { ...i, stockByWarehouse: updatedStockByWarehouse } : i
      );
      setInventory(updatedInventory);

      // Add transaction
      const opnRef = `OPN-${new Date().getFullYear()}-${generateId('O').slice(-4)}`;
      const newTrx: StockTransaction = {
        id: generateId('TRX'),
        date: new Date().toISOString(),
        refNo: opnRef,
        type: 'ADJUSTMENT_OPNAME',
        itemId: item.id,
        sku: item.sku,
        itemName: item.name,
        warehouseId: data.warehouseId,
        qty: diffQty,
        unitCost: item.unitCost,
        totalValue: diffValue,
        notes: `Penyesuaian audit opname fisik: ${data.reason}`,
        operator: userProfile.name,
        status: 'COMPLETED',
      };
      const updatedTrx = [newTrx, ...stockTransactions];
      setStockTransactions(updatedTrx);

      // Double-entry accounting for adjustment:
      // If diffQty < 0 (loss):
      //   Debet 5020 Beban Selisih Opname (Math.abs(diffValue))
      //   Kredit 1200 Persediaan (Math.abs(diffValue))
      // If diffQty > 0 (surplus):
      //   Debet 1200 Persediaan (diffValue)
      //   Kredit 5020 Beban Selisih Opname (diffValue)
      const absDiff = Math.abs(diffValue);
      let updatedCOA = chartOfAccounts;
      if (diffQty < 0) {
        updatedCOA = adjustAccountBalance('5020', absDiff, 0, updatedCOA);
        updatedCOA = adjustAccountBalance('1200', 0, absDiff, updatedCOA);
      } else {
        updatedCOA = adjustAccountBalance('1200', absDiff, 0, updatedCOA);
        updatedCOA = adjustAccountBalance('5020', 0, absDiff, updatedCOA);
      }
      setChartOfAccounts(updatedCOA);

      const newJournal: JournalEntry = {
        id: generateId('JRN'),
        voucherNo: `JV/${new Date().getFullYear()}/${generateId('V').slice(-4)}`,
        date: new Date().toISOString().split('T')[0],
        refNo: opnRef,
        description: `Penyesuaian Selisih Audit Opname Stok ${item.name} (${diffQty > 0 ? '+' : ''}${diffQty} ${item.unit})`,
        source: 'STOCK_OPNAME',
        lines:
          diffQty < 0
            ? [
                {
                  accountCode: '5020',
                  accountName: 'Beban Selisih Opname & Kerusakan Barang',
                  debit: absDiff,
                  credit: 0,
                  memo: `Kerugian susut/selisih fisik ${item.name}`,
                },
                {
                  accountCode: '1200',
                  accountName: 'Persediaan Barang Dagang & Bahan Baku',
                  debit: 0,
                  credit: absDiff,
                  memo: 'Penyesuaian nilai persediaan',
                },
              ]
            : [
                {
                  accountCode: '1200',
                  accountName: 'Persediaan Barang Dagang & Bahan Baku',
                  debit: absDiff,
                  credit: 0,
                  memo: 'Penambahan nilai persediaan lebih fisik',
                },
                {
                  accountCode: '5020',
                  accountName: 'Beban Selisih Opname & Kerusakan Barang',
                  debit: 0,
                  credit: absDiff,
                  memo: `Koreksi surplus audit ${item.name}`,
                },
              ],
        totalDebit: absDiff,
        totalCredit: absDiff,
        createdBy: userProfile.name,
      };
      const updatedJournals = [newJournal, ...journalEntries];
      setJournalEntries(updatedJournals);

      persistState({
        inventory: updatedInventory,
        stockTransactions: updatedTrx,
        stockOpnameList: updatedOpnameList,
        chartOfAccounts: updatedCOA,
        journalEntries: updatedJournals,
      });
    } else {
      persistState({ stockOpnameList: updatedOpnameList });
    }
    triggerCloudSync();
  };

  // --- Financial & Invoicing Operations ---
  const createSalesInvoice = (invoiceData: Omit<SalesInvoice, 'id' | 'paidAmount' | 'status'>) => {
    const newInvoice: SalesInvoice = {
      ...invoiceData,
      id: generateId('INV'),
      paidAmount: 0,
      status: 'UNPAID',
    };
    const updatedInvoices = [newInvoice, ...invoices];
    setInvoices(updatedInvoices);

    // 1. Deduct inventory for all items on this invoice from the specified warehouse
    let updatedInventory = [...inventory];
    let totalCOGS = 0;
    const newTrxList: StockTransaction[] = [];

    invoiceData.items.forEach((itemLine) => {
      const invItem = updatedInventory.find((i) => i.id === itemLine.itemId);
      if (invItem) {
        const curStock = invItem.stockByWarehouse[invoiceData.warehouseId] || 0;
        const newStock = Math.max(0, curStock - itemLine.qty);
        invItem.stockByWarehouse = {
          ...invItem.stockByWarehouse,
          [invoiceData.warehouseId]: newStock,
        };
        const cogsLine = itemLine.qty * invItem.unitCost;
        totalCOGS += cogsLine;

        newTrxList.push({
          id: generateId('TRX'),
          date: new Date().toISOString(),
          refNo: newInvoice.invoiceNo,
          type: 'OUT_SALES',
          itemId: invItem.id,
          sku: invItem.sku,
          itemName: invItem.name,
          warehouseId: invoiceData.warehouseId,
          qty: itemLine.qty,
          unitCost: invItem.unitCost,
          totalValue: cogsLine,
          notes: `Pengeluaran pesanan faktur ${newInvoice.invoiceNo} untuk ${newInvoice.customerName}`,
          operator: userProfile.name,
          status: 'COMPLETED',
        });
      }
    });
    setInventory(updatedInventory);
    const updatedTrx = [...newTrxList, ...stockTransactions];
    setStockTransactions(updatedTrx);

    // 2. Journal Entry: Sales Recognition
    // Debet 1100 Piutang Usaha (grandTotal)
    // Kredit 4010 Pendapatan Penjualan (subtotal - discountTotal)
    // Kredit 2020 Hutang Pajak PPN (taxAmount)
    const netRevenue = newInvoice.subtotal - newInvoice.discountTotal;
    let updatedCOA = adjustAccountBalance('1100', newInvoice.grandTotal, 0, chartOfAccounts);
    updatedCOA = adjustAccountBalance('4010', 0, netRevenue, updatedCOA);
    updatedCOA = adjustAccountBalance('2020', 0, newInvoice.taxAmount, updatedCOA);

    // Also post COGS
    if (totalCOGS > 0) {
      updatedCOA = adjustAccountBalance('5010', totalCOGS, 0, updatedCOA);
      updatedCOA = adjustAccountBalance('1200', 0, totalCOGS, updatedCOA);
    }
    setChartOfAccounts(updatedCOA);

    const salesJournal: JournalEntry = {
      id: generateId('JRN'),
      voucherNo: `JV/${new Date().getFullYear()}/${generateId('V').slice(-4)}`,
      date: newInvoice.date,
      refNo: newInvoice.invoiceNo,
      description: `Faktur Penjualan ${newInvoice.invoiceNo} - ${newInvoice.customerName}`,
      source: 'INVOICE',
      lines: [
        {
          accountCode: '1100',
          accountName: 'Piutang Usaha (Accounts Receivable)',
          debit: newInvoice.grandTotal,
          credit: 0,
          memo: `Tagihan ke ${newInvoice.customerName}`,
        },
        {
          accountCode: '4010',
          accountName: 'Pendapatan Penjualan Produk & Komponen',
          debit: 0,
          credit: netRevenue,
          memo: 'Pendapatan penjualan bersih',
        },
        {
          accountCode: '2020',
          accountName: 'Hutang Pajak PPN & PPh Keluaran',
          debit: 0,
          credit: newInvoice.taxAmount,
          memo: 'PPN Keluaran 11%',
        },
      ],
      totalDebit: newInvoice.grandTotal,
      totalCredit: newInvoice.grandTotal,
      createdBy: userProfile.name,
    };

    const updatedJournals = [salesJournal, ...journalEntries];
    setJournalEntries(updatedJournals);

    persistState({
      invoices: updatedInvoices,
      inventory: updatedInventory,
      stockTransactions: updatedTrx,
      chartOfAccounts: updatedCOA,
      journalEntries: updatedJournals,
    });
    triggerCloudSync();
  };

  const recordInvoicePayment = (invoiceId: string, amount: number, bankId: string, notes?: string) => {
    const inv = invoices.find((i) => i.id === invoiceId);
    const bank = bankAccounts.find((b) => b.id === bankId);
    if (!inv || !bank || amount <= 0) return;

    const newPaid = inv.paidAmount + amount;
    const newStatus: InvoiceStatus = newPaid >= inv.grandTotal ? 'PAID' : 'PARTIAL';

    const updatedInvoices = invoices.map((i) =>
      i.id === invoiceId ? { ...i, paidAmount: newPaid, status: newStatus } : i
    );
    setInvoices(updatedInvoices);

    // Update bank balance
    const updatedBanks = bankAccounts.map((b) => (b.id === bankId ? { ...b, balance: b.balance + amount } : b));
    setBankAccounts(updatedBanks);

    // COA: Debet Bank Account, Kredit 1100 Piutang
    let updatedCOA = adjustAccountBalance(bank.accountCode, amount, 0, chartOfAccounts);
    updatedCOA = adjustAccountBalance('1100', 0, amount, updatedCOA);
    setChartOfAccounts(updatedCOA);

    const payJournal: JournalEntry = {
      id: generateId('JRN'),
      voucherNo: `JV/${new Date().getFullYear()}/${generateId('V').slice(-4)}`,
      date: new Date().toISOString().split('T')[0],
      refNo: inv.invoiceNo,
      description: `Penerimaan Pelunasan Faktur ${inv.invoiceNo} dari ${inv.customerName} via ${bank.bankName}`,
      source: 'PAYMENT',
      lines: [
        {
          accountCode: bank.accountCode,
          accountName: bank.bankName,
          debit: amount,
          credit: 0,
          memo: notes || `Penerimaan dana ${inv.customerName}`,
        },
        {
          accountCode: '1100',
          accountName: 'Piutang Usaha (Accounts Receivable)',
          debit: 0,
          credit: amount,
          memo: `Pelunasan piutang faktur ${inv.invoiceNo}`,
        },
      ],
      totalDebit: amount,
      totalCredit: amount,
      createdBy: userProfile.name,
    };
    const updatedJournals = [payJournal, ...journalEntries];
    setJournalEntries(updatedJournals);

    persistState({
      invoices: updatedInvoices,
      bankAccounts: updatedBanks,
      chartOfAccounts: updatedCOA,
      journalEntries: updatedJournals,
    });
    triggerCloudSync();
  };

  const recordBillPayment = (billId: string, amount: number, bankId: string) => {
    const bill = purchaseBills.find((b) => b.id === billId);
    const bank = bankAccounts.find((b) => b.id === bankId);
    if (!bill || !bank || amount <= 0) return;

    const newPaid = bill.paidAmount + amount;
    const newStatus: InvoiceStatus = newPaid >= bill.grandTotal ? 'PAID' : 'PARTIAL';

    const updatedBills = purchaseBills.map((b) =>
      b.id === billId ? { ...b, paidAmount: newPaid, status: newStatus } : b
    );
    setPurchaseBills(updatedBills);

    // Decrease bank
    const updatedBanks = bankAccounts.map((b) => (b.id === bankId ? { ...b, balance: b.balance - amount } : b));
    setBankAccounts(updatedBanks);

    // COA: Debet 2010 Hutang Usaha, Kredit Bank Account
    let updatedCOA = adjustAccountBalance('2010', amount, 0, chartOfAccounts);
    updatedCOA = adjustAccountBalance(bank.accountCode, 0, amount, updatedCOA);
    setChartOfAccounts(updatedCOA);

    const billJournal: JournalEntry = {
      id: generateId('JRN'),
      voucherNo: `JV/${new Date().getFullYear()}/${generateId('V').slice(-4)}`,
      date: new Date().toISOString().split('T')[0],
      refNo: bill.billNo,
      description: `Pembayaran Tagihan Hutang Vendor ${bill.vendorName} via ${bank.bankName}`,
      source: 'PAYMENT',
      lines: [
        {
          accountCode: '2010',
          accountName: 'Hutang Usaha (Accounts Payable)',
          debit: amount,
          credit: 0,
          memo: `Pelunasan hutang bill ${bill.billNo}`,
        },
        {
          accountCode: bank.accountCode,
          accountName: bank.bankName,
          debit: 0,
          credit: amount,
          memo: `Pengeluaran kas/giro ${bank.bankName}`,
        },
      ],
      totalDebit: amount,
      totalCredit: amount,
      createdBy: userProfile.name,
    };
    const updatedJournals = [billJournal, ...journalEntries];
    setJournalEntries(updatedJournals);

    persistState({
      purchaseBills: updatedBills,
      bankAccounts: updatedBanks,
      chartOfAccounts: updatedCOA,
      journalEntries: updatedJournals,
    });
    triggerCloudSync();
  };

  const createManualJournalEntry = (
    description: string,
    refNo: string,
    lines: { accountCode: string; debit: number; credit: number; memo?: string }[]
  ): boolean => {
    const totalDebit = lines.reduce((sum, l) => sum + (Number(l.debit) || 0), 0);
    const totalCredit = lines.reduce((sum, l) => sum + (Number(l.credit) || 0), 0);

    // Verify balance
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      return false; // Not balanced
    }

    let updatedCOA = [...chartOfAccounts];
    const journalLines = lines.map((l) => {
      const acc = chartOfAccounts.find((a) => a.code === l.accountCode);
      const accName = acc ? acc.name : 'Akun Tidak Dikenal';
      updatedCOA = adjustAccountBalance(l.accountCode, Number(l.debit) || 0, Number(l.credit) || 0, updatedCOA);
      return {
        accountCode: l.accountCode,
        accountName: accName,
        debit: Number(l.debit) || 0,
        credit: Number(l.credit) || 0,
        memo: l.memo || '',
      };
    });
    setChartOfAccounts(updatedCOA);

    const newJournal: JournalEntry = {
      id: generateId('JRN'),
      voucherNo: `JV/${new Date().getFullYear()}/${generateId('V').slice(-4)}`,
      date: new Date().toISOString().split('T')[0],
      refNo: refNo || 'MEMO-MANUAL',
      description,
      source: 'MANUAL',
      lines: journalLines,
      totalDebit,
      totalCredit,
      createdBy: userProfile.name,
    };
    const updatedJournals = [newJournal, ...journalEntries];
    setJournalEntries(updatedJournals);

    persistState({
      chartOfAccounts: updatedCOA,
      journalEntries: updatedJournals,
    });
    triggerCloudSync();
    return true;
  };

  // --- Backup & Restore ---
  const exportDatabaseJSON = (): string => {
    const dump = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      company,
      warehouses,
      inventory,
      stockTransactions,
      stockOpnameList,
      chartOfAccounts,
      bankAccounts,
      invoices,
      purchaseBills,
      journalEntries,
    };
    return JSON.stringify(dump, null, 2);
  };

  const importDatabaseJSON = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.inventory && parsed.chartOfAccounts) {
        setCompany(parsed.company || initialCompany);
        setWarehouses(parsed.warehouses || initialWarehouses);
        setInventory(parsed.inventory);
        setStockTransactions(parsed.stockTransactions || []);
        setStockOpnameList(parsed.stockOpnameList || []);
        setChartOfAccounts(parsed.chartOfAccounts);
        setBankAccounts(parsed.bankAccounts || initialBankAccounts);
        setInvoices(parsed.invoices || []);
        setPurchaseBills(parsed.purchaseBills || []);
        setJournalEntries(parsed.journalEntries || []);
        persistState(parsed);
        triggerCloudSync();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const resetToDefaultData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setCompany(initialCompany);
    setUserProfile(initialUserProfile);
    setWarehouses(initialWarehouses);
    setInventory(initialInventory);
    setStockTransactions(initialStockTransactions);
    setStockOpnameList([]);
    setChartOfAccounts(initialChartOfAccounts);
    setBankAccounts(initialBankAccounts);
    setInvoices(initialInvoices);
    setPurchaseBills(initialPurchaseBills);
    setJournalEntries(initialJournalEntries);
    setSelectedWarehouseId('ALL');
    triggerCloudSync();
  };

  // --- Aggregates ---
  const getTotalInventoryValue = (whId?: string): number => {
    const targetWh = whId !== undefined ? whId : selectedWarehouseId;
    return inventory.reduce((total, item) => {
      let qty = 0;
      if (targetWh === 'ALL') {
        qty = Object.values(item.stockByWarehouse).reduce((s, q) => s + q, 0);
      } else {
        qty = item.stockByWarehouse[targetWh] || 0;
      }
      return total + qty * item.unitCost;
    }, 0);
  };

  const getTotalItemsCount = (whId?: string): number => {
    const targetWh = whId !== undefined ? whId : selectedWarehouseId;
    return inventory.reduce((total, item) => {
      if (targetWh === 'ALL') {
        return total + Object.values(item.stockByWarehouse).reduce((s, q) => s + q, 0);
      }
      return total + (item.stockByWarehouse[targetWh] || 0);
    }, 0);
  };

  const getLowStockItems = (whId?: string): InventoryItem[] => {
    const targetWh = whId !== undefined ? whId : selectedWarehouseId;
    return inventory.filter((item) => {
      let qty = 0;
      if (targetWh === 'ALL') {
        qty = Object.values(item.stockByWarehouse).reduce((s, q) => s + q, 0);
      } else {
        qty = item.stockByWarehouse[targetWh] || 0;
      }
      return qty <= item.reorderPoint;
    });
  };

  const getTotalCashAndBank = (): number => {
    return bankAccounts.reduce((sum, b) => sum + b.balance, 0);
  };

  const getTotalReceivables = (): number => {
    return invoices
      .filter((i) => i.status !== 'PAID')
      .reduce((sum, i) => sum + (i.grandTotal - i.paidAmount), 0);
  };

  const getTotalPayables = (): number => {
    return purchaseBills
      .filter((b) => b.status !== 'PAID')
      .reduce((sum, b) => sum + (b.grandTotal - b.paidAmount), 0);
  };

  const getCurrentMonthRevenue = (): number => {
    return invoices.reduce((sum, i) => sum + (i.subtotal - i.discountTotal), 0);
  };

  const getCurrentMonthCOGS = (): number => {
    const cogsAccount = chartOfAccounts.find((a) => a.code === '5010');
    return cogsAccount ? cogsAccount.balance : 0;
  };

  return (
    <ErpContext.Provider
      value={{
        company,
        userProfile,
        warehouses,
        selectedWarehouseId,
        inventory,
        stockTransactions,
        stockOpnameList,
        chartOfAccounts,
        bankAccounts,
        invoices,
        purchaseBills,
        journalEntries,
        cloudSync,
        activeTab,
        searchQuery,
        setSelectedWarehouseId,
        setActiveTab,
        setSearchQuery,
        setUserRole,
        addInventoryItem,
        updateInventoryItem,
        deleteInventoryItem,
        recordStockInbound,
        recordStockOutbound,
        recordStockTransfer,
        recordStockOpname,
        createSalesInvoice,
        recordInvoicePayment,
        recordBillPayment,
        createManualJournalEntry,
        triggerCloudSync,
        exportDatabaseJSON,
        importDatabaseJSON,
        resetToDefaultData,
        getTotalInventoryValue,
        getTotalItemsCount,
        getLowStockItems,
        getTotalCashAndBank,
        getTotalReceivables,
        getTotalPayables,
        getCurrentMonthRevenue,
        getCurrentMonthCOGS,
      }}
    >
      {children}
    </ErpContext.Provider>
  );
};

export const useErp = (): ErpContextType => {
  const context = useContext(ErpContext);
  if (!context) {
    throw new Error('useErp must be used within an ErpProvider');
  }
  return context;
};
