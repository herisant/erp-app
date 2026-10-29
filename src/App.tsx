import React, { useState } from 'react';
import { ErpProvider, useErp } from './context/ErpContext';
import { Navbar } from './components/Navbar';
import { WorkspaceHeader } from './components/WorkspaceHeader';
import { DashboardView } from './components/DashboardView';
import { InventoryView } from './components/InventoryView';
import { FinanceView } from './components/FinanceView';
import { ReportsView } from './components/ReportsView';
import { CloudSettingsView } from './components/CloudSettingsView';

import { NewItemModal } from './components/modals/NewItemModal';
import { StockMovementModal } from './components/modals/StockMovementModal';
import { StockOpnameModal } from './components/modals/StockOpnameModal';
import { NewInvoiceModal } from './components/modals/NewInvoiceModal';
import { ReceivePaymentModal } from './components/modals/ReceivePaymentModal';
import { PrintInvoiceModal } from './components/modals/PrintInvoiceModal';
import { ManualJournalModal } from './components/modals/ManualJournalModal';
import { InventoryItem, PurchaseBill, SalesInvoice } from './types/erp';

const MainLayout: React.FC = () => {
  const { activeTab, setActiveTab } = useErp();

  // Modals state
  const [isNewItemOpen, setIsNewItemOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  const [isStockMovementOpen, setIsStockMovementOpen] = useState(false);
  const [stockMovementDefaultType, setStockMovementDefaultType] = useState<'INBOUND' | 'OUTBOUND' | 'TRANSFER'>('INBOUND');

  const [isStockOpnameOpen, setIsStockOpnameOpen] = useState(false);
  const [isNewInvoiceOpen, setIsNewInvoiceOpen] = useState(false);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentTargetInvoice, setPaymentTargetInvoice] = useState<SalesInvoice | null>(null);
  const [paymentTargetBill, setPaymentTargetBill] = useState<PurchaseBill | null>(null);

  const [isPrintInvoiceOpen, setIsPrintInvoiceOpen] = useState(false);
  const [printInvoiceData, setPrintInvoiceData] = useState<SalesInvoice | null>(null);

  const [isManualJournalOpen, setIsManualJournalOpen] = useState(false);

  // Quick action router from Navbar
  const handleOpenQuickAction = (actionType: 'INBOUND' | 'OUTBOUND' | 'INVOICE' | 'NEW_ITEM') => {
    if (actionType === 'NEW_ITEM') {
      setEditingItem(null);
      setIsNewItemOpen(true);
    } else if (actionType === 'INVOICE') {
      setIsNewInvoiceOpen(true);
    } else if (actionType === 'INBOUND') {
      setStockMovementDefaultType('INBOUND');
      setIsStockMovementOpen(true);
    } else if (actionType === 'OUTBOUND') {
      setStockMovementDefaultType('OUTBOUND');
      setIsStockMovementOpen(true);
    }
  };

  const handleOpenEditItem = (item?: InventoryItem) => {
    setEditingItem(item || null);
    setIsNewItemOpen(true);
  };

  const handleOpenStockMovement = (defaultType?: 'INBOUND' | 'OUTBOUND' | 'TRANSFER') => {
    setStockMovementDefaultType(defaultType || 'INBOUND');
    setIsStockMovementOpen(true);
  };

  const handleOpenPayment = (invoice?: SalesInvoice | null, bill?: PurchaseBill | null) => {
    setPaymentTargetInvoice(invoice || null);
    setPaymentTargetBill(bill || null);
    setIsPaymentModalOpen(true);
  };

  const handleOpenPrintInvoice = (invoice: SalesInvoice) => {
    setPrintInvoiceData(invoice);
    setIsPrintInvoiceOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Bar adhering to the Top Bar Contract */}
      <Navbar onOpenQuickAction={handleOpenQuickAction} />

      {/* Contextual Sub-bar */}
      <WorkspaceHeader />

      {/* Main Content Workspace Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            onOpenQuickAction={handleOpenQuickAction}
            onOpenReceivePayment={(inv) => handleOpenPayment(inv, null)}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryView
            onOpenNewItem={handleOpenEditItem}
            onOpenStockMovement={handleOpenStockMovement}
            onOpenStockOpname={() => setIsStockOpnameOpen(true)}
          />
        )}

        {activeTab === 'finance' && (
          <FinanceView
            onOpenNewInvoice={() => setIsNewInvoiceOpen(true)}
            onOpenManualJournal={() => setIsManualJournalOpen(true)}
            onOpenReceivePayment={handleOpenPayment}
            onOpenPrintInvoice={handleOpenPrintInvoice}
          />
        )}

        {activeTab === 'reports' && <ReportsView />}

        {activeTab === 'cloud' && <CloudSettingsView />}
      </main>

      {/* Quiet Corporate Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 px-6 text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            © {new Date().getFullYear()} Aksara Cloud ERP · PT Nusantara Dinamika Persada. Hak cipta dilindungi.
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Standar Akuntansi Keuangan (SAK)</span>
            <span aria-hidden="true">·</span>
            <span>Integrasi Multigudang Otomatis</span>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setActiveTab('cloud')}
              className="text-blue-600 hover:underline"
            >
              Pengaturan Sistem
            </button>
          </div>
        </div>
      </footer>

      {/* Modals Container */}
      <NewItemModal
        isOpen={isNewItemOpen}
        onClose={() => {
          setIsNewItemOpen(false);
          setEditingItem(null);
        }}
        editItem={editingItem}
      />

      <StockMovementModal
        isOpen={isStockMovementOpen}
        onClose={() => setIsStockMovementOpen(false)}
        defaultType={stockMovementDefaultType}
      />

      <StockOpnameModal
        isOpen={isStockOpnameOpen}
        onClose={() => setIsStockOpnameOpen(false)}
      />

      <NewInvoiceModal
        isOpen={isNewInvoiceOpen}
        onClose={() => setIsNewInvoiceOpen(false)}
      />

      <ReceivePaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setPaymentTargetInvoice(null);
          setPaymentTargetBill(null);
        }}
        targetInvoice={paymentTargetInvoice}
        targetBill={paymentTargetBill}
      />

      <PrintInvoiceModal
        isOpen={isPrintInvoiceOpen}
        onClose={() => {
          setIsPrintInvoiceOpen(false);
          setPrintInvoiceData(null);
        }}
        invoice={printInvoiceData}
      />

      <ManualJournalModal
        isOpen={isManualJournalOpen}
        onClose={() => setIsManualJournalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <ErpProvider>
      <MainLayout />
    </ErpProvider>
  );
}
