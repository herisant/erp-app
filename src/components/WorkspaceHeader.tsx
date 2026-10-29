import React from 'react';
import { useErp } from '../context/ErpContext';
import { Warehouse as WarehouseIcon, Search, Shield, Building2 } from 'lucide-react';
import { UserRole } from '../types/erp';

export const WorkspaceHeader: React.FC = () => {
  const {
    company,
    warehouses,
    selectedWarehouseId,
    setSelectedWarehouseId,
    activeTab,
    searchQuery,
    setSearchQuery,
    userProfile,
    setUserRole,
  } = useErp();

  const tabLabels: Record<string, string> = {
    dashboard: 'Ringkasan Eksekutif & KPI',
    inventory: 'Manajemen Inventaris & Mutasi Gudang',
    finance: 'Keuangan, Kas/Bank & Pembukuan',
    reports: 'Laporan Keuangan & Audit Inventaris',
    cloud: 'Pusat Cloud, Hak Akses & Pengaturan',
  };

  const roles: { id: UserRole; label: string }[] = [
    { id: 'DIREKTUR', label: 'Direktur (CFO)' },
    { id: 'FINANCE_MANAGER', label: 'Finance Mgr' },
    { id: 'KEPALA_GUDANG', label: 'Kepala Gudang' },
    { id: 'AUDITOR', label: 'Auditor' },
  ];

  return (
    <div className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        {/* Left: Breadcrumbs & Current context */}
        <div className="flex items-center gap-2 text-slate-500 overflow-x-auto whitespace-nowrap">
          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="font-semibold text-slate-800">{company.name}</span>
          <span className="text-slate-300">/</span>
          <span className="text-blue-600 font-medium">{tabLabels[activeTab]}</span>
        </div>

        {/* Center / Right controls: Warehouse Switcher, Search, Role Switcher */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Warehouse Selector */}
          <div className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200/80 rounded-md px-2.5 py-1 transition-colors">
            <WarehouseIcon className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedWarehouseId}
              onChange={(e) => setSelectedWarehouseId(e.target.value)}
              className="bg-transparent text-slate-800 font-medium text-xs focus:outline-none cursor-pointer pr-1"
            >
              <option value="ALL">Semua Gudang (Konsolidasi Nasional)</option>
              {warehouses.map((wh) => (
                <option key={wh.id} value={wh.id}>
                  {wh.name} ({wh.city})
                </option>
              ))}
            </select>
          </div>

          {/* Quick Search across data */}
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari SKU, Barang, Invoice..."
              className="w-full bg-slate-100 hover:bg-slate-200/60 focus:bg-white focus:ring-1 focus:ring-blue-500 pl-8 pr-2.5 py-1 rounded-md text-xs placeholder:text-slate-400 border border-transparent focus:border-blue-500 transition-all focus:outline-none"
            />
          </div>

          {/* Role Access Switcher for testing RBAC */}
          <div className="hidden lg:flex items-center gap-1 bg-slate-100 p-0.5 rounded-md text-[11px]">
            <span className="px-1.5 text-slate-500 flex items-center gap-1">
              <Shield className="w-3 h-3 text-slate-400" />
              Role:
            </span>
            {roles.map((r) => (
              <button
                key={r.id}
                onClick={() => setUserRole(r.id)}
                className={`px-2 py-0.5 rounded font-medium transition-colors ${
                  userProfile.role === r.id
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
