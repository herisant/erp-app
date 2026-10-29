import React, { useState } from 'react';
import { useErp } from '../context/ErpContext';
import { Cloud, Plus, RefreshCw, ChevronDown } from 'lucide-react';

interface NavbarProps {
  onOpenQuickAction: (actionType: 'INBOUND' | 'OUTBOUND' | 'INVOICE' | 'NEW_ITEM') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenQuickAction }) => {
  const { activeTab, setActiveTab, cloudSync, triggerCloudSync, userProfile } = useErp();
  const [showQuickMenu, setShowQuickMenu] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'inventory', label: 'Inventaris' },
    { id: 'finance', label: 'Keuangan' },
    { id: 'reports', label: 'Laporan' },
    { id: 'cloud', label: 'Cloud & Sistem' },
  ] as const;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-6 py-3.5">
        {/* Zone 1: Single text element brand wordmark */}
        <button
          onClick={() => setActiveTab('dashboard')}
          className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 hover:text-blue-600 transition-colors text-left"
        >
          Aksara ERP
        </button>

        {/* Zone 2: 4-5 clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`whitespace-nowrap shrink-0 py-1 transition-colors relative ${
                activeTab === item.id
                  ? 'text-blue-600 font-semibold'
                  : 'hover:text-slate-900'
              }`}
            >
              {item.label}
              {activeTab === item.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
              )}
            </button>
          ))}
        </nav>

        {/* Zone 3: 1 primary action control with quick-action dropdown & profile avatar */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={triggerCloudSync}
            title={`Status: ${cloudSync.status} (${cloudSync.cloudRegion})`}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors whitespace-nowrap shrink-0"
          >
            <Cloud className={`w-3.5 h-3.5 ${cloudSync.status === 'SYNCING' ? 'text-blue-600 animate-spin' : 'text-emerald-600'}`} />
            <span className="font-mono text-[11px] tabular-nums">Cloud Aktif</span>
          </button>

          <div className="relative">
            <button
              onClick={() => setShowQuickMenu(!showQuickMenu)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Transaksi Baru</span>
              <ChevronDown className="w-3 h-3 opacity-80" />
            </button>

            {showQuickMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowQuickMenu(false)}
                />
                <div className="absolute right-0 mt-1.5 w-52 bg-white rounded-lg shadow-lg border border-slate-200 py-1.5 z-50 text-xs">
                  <button
                    onClick={() => {
                      setShowQuickMenu(false);
                      onOpenQuickAction('INVOICE');
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 hover:text-blue-600 font-medium transition-colors"
                  >
                    + Buat Faktur Penjualan (AR)
                  </button>
                  <button
                    onClick={() => {
                      setShowQuickMenu(false);
                      onOpenQuickAction('INBOUND');
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 hover:text-blue-600 font-medium transition-colors"
                  >
                    + Penerimaan Barang (PO Masuk)
                  </button>
                  <button
                    onClick={() => {
                      setShowQuickMenu(false);
                      onOpenQuickAction('OUTBOUND');
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 hover:text-blue-600 font-medium transition-colors"
                  >
                    + Pengeluaran Barang (Surat Jalan)
                  </button>
                  <div className="border-t border-slate-100 my-1" />
                  <button
                    onClick={() => {
                      setShowQuickMenu(false);
                      onOpenQuickAction('NEW_ITEM');
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 hover:text-blue-600 font-medium transition-colors"
                  >
                    + Tambah Master Barang Baru
                  </button>
                </div>
              </>
            )}
          </div>

          {/* User profile picture */}
          <div
            onClick={() => setActiveTab('cloud')}
            className="flex items-center gap-2 pl-2 border-l border-slate-200 cursor-pointer"
            title={`${userProfile.name} (${userProfile.roleTitle})`}
          >
            <img
              src={userProfile.avatarUrl}
              alt={userProfile.name}
              referrerPolicy="no-referrer"
              className="w-8 h-8 rounded-full object-cover border border-slate-300"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
