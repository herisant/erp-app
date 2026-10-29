import React, { useState } from 'react';
import { useErp } from '../context/ErpContext';
import { UserRole } from '../types/erp';
import {
  Cloud,
  RefreshCw,
  Download,
  Upload,
  RotateCcw,
  Shield,
  Building2,
  CheckCircle2,
  Server,
  Warehouse as WarehouseIcon,
  HardDrive,
} from 'lucide-react';

export const CloudSettingsView: React.FC = () => {
  const {
    company,
    userProfile,
    setUserRole,
    cloudSync,
    triggerCloudSync,
    exportDatabaseJSON,
    importDatabaseJSON,
    resetToDefaultData,
    warehouses,
  } = useErp();

  const [importJsonText, setImportJsonText] = useState('');
  const [showImportArea, setShowImportArea] = useState(false);
  const [importMessage, setImportMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleDownloadBackup = () => {
    const jsonStr = exportDatabaseJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Aksara_ERP_Cloud_Backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleApplyImport = () => {
    if (!importJsonText.trim()) return;
    const ok = importDatabaseJSON(importJsonText);
    if (ok) {
      setImportMessage({ type: 'success', text: 'Data cadangan berhasil dipulihkan secara penuh!' });
      setImportJsonText('');
      setShowImportArea(false);
    } else {
      setImportMessage({ type: 'error', text: 'Format file JSON tidak valid atau struktur tidak sesuai.' });
    }
  };

  const roles: { role: UserRole; title: string; desc: string }[] = [
    {
      role: 'DIREKTUR',
      title: 'Direktur Operasional & Keuangan (CFO)',
      desc: 'Akses penuh ke seluruh modul, persetujuan anggaran, jurnal penyesuaian, dan laporan keuangan komprehensif.',
    },
    {
      role: 'FINANCE_MANAGER',
      title: 'Manajer Akuntansi & Perpajakan',
      desc: 'Mengelola faktur penjualan, tagihan pembelian, rekonsiliasi kas/bank, dan pengakuan PPN 11%.',
    },
    {
      role: 'KEPALA_GUDANG',
      title: 'Kepala Manajemen Gudang & Logistik',
      desc: 'Pencatatan penerimaan PO, pengeluaran Surat Jalan DO, mutasi antar cabang, dan stock opname fisik.',
    },
    {
      role: 'AUDITOR',
      title: 'Auditor Internal & Kepatuhan Sistem',
      desc: 'Pemeriksaan audit trail pergerakan stok, verifikasi saldo akun, dan uji kelayakan pembukuan.',
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-xs">
      {/* Cloud Status Banner */}
      <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">
                  Infrastruktur Cloud Aksara ERP
                </h3>
                <span className="text-[11px] font-semibold text-emerald-700">
                  {cloudSync.status === 'SYNCING' ? 'Menyinkronkan...' : 'Terhubung Aktif'}
                </span>
              </div>
              <p className="text-slate-500 text-[11px]">
                Region: <span className="font-mono text-slate-700">{cloudSync.cloudRegion}</span> · {cloudSync.activeNodes} Node Gudang Terhubung
              </p>
            </div>
          </div>

          <button
            onClick={triggerCloudSync}
            disabled={cloudSync.status === 'SYNCING'}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-semibold shadow-xs transition-colors shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${cloudSync.status === 'SYNCING' ? 'animate-spin' : ''}`} />
            <span>Sinkronisasi Sekarang</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-[11px]">
          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-500 block">Status Node Multicabang</span>
            <span className="font-semibold text-slate-900">4 Fasilitas Sinkron Real-Time</span>
          </div>
          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-500 block">Waktu Terakhir Sinkron</span>
            <span className="font-mono font-medium text-slate-900 tabular-nums">
              {new Date(cloudSync.lastSyncedAt).toLocaleTimeString('id-ID')} WIB
            </span>
          </div>
          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-500 block">Protokol Keamanan Data</span>
            <span className="font-semibold text-slate-900">TLS 1.3 / AES-256 Cloud Storage</span>
          </div>
        </div>
      </div>

      {/* User Profile & Role Switcher */}
      <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Profil Pengguna & Kontrol Peran (RBAC)</h3>
            <p className="text-slate-500 text-[11px]">
              Ganti peran sistem untuk menguji hierarki otorisasi operasional
            </p>
          </div>
          <span className="font-mono text-slate-500 text-[11px]">ID: {userProfile.id}</span>
        </div>

        <div className="flex items-center gap-4">
          <img
            src={userProfile.avatarUrl}
            alt={userProfile.name}
            referrerPolicy="no-referrer"
            className="w-16 h-16 rounded-xl object-cover border-2 border-slate-200 shrink-0"
          />
          <div>
            <h4 className="font-bold text-base text-slate-900">{userProfile.name}</h4>
            <p className="text-slate-600 font-medium">{userProfile.roleTitle}</p>
            <p className="text-slate-500 text-[11px] font-mono">{userProfile.email} · {userProfile.branch}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {roles.map((r) => (
            <div
              key={r.role}
              onClick={() => setUserRole(r.role)}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                userProfile.role === r.role
                  ? 'bg-blue-50/70 border-blue-400 ring-1 ring-blue-400'
                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-slate-900">{r.title}</span>
                {userProfile.role === r.role && (
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                )}
              </div>
              <p className="text-slate-500 text-[11px]">{r.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Backup, Restore & Data Management */}
      <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Manajemen Database & Cadangan (Backup / Restore)</h3>
          <p className="text-slate-500 text-[11px]">
            Simpan salinan snapshot data lokal, pulihkan data sebelumnya, atau reset demo
          </p>
        </div>

        {importMessage && (
          <div
            className={`p-3 rounded-lg border flex items-center justify-between text-xs ${
              importMessage.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            <span>{importMessage.text}</span>
            <button
              onClick={() => setImportMessage(null)}
              className="text-slate-500 hover:text-slate-900 font-semibold"
            >
              Tutup
            </button>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleDownloadBackup}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh Backup Database (JSON)</span>
          </button>

          <button
            onClick={() => setShowImportArea(!showImportArea)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-semibold transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Pulihkan dari File Cadangan</span>
          </button>

          <button
            onClick={() => {
              if (confirm('Apakah Anda yakin ingin mereset seluruh data kembali ke kondisi demo awal?')) {
                resetToDefaultData();
              }
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg font-semibold transition-colors ml-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>
        </div>

        {showImportArea && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
            <label className="font-semibold text-slate-800 block">
              Tempel (Paste) Konten Backup JSON:
            </label>
            <textarea
              rows={4}
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              placeholder="Paste JSON hasil ekspor di sini..."
              className="w-full p-2 border border-slate-300 rounded font-mono text-[11px] focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowImportArea(false)}
                className="px-3 py-1.5 text-slate-600 hover:bg-slate-200 rounded"
              >
                Batal
              </button>
              <button
                onClick={handleApplyImport}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded shadow-xs"
              >
                Terapkan Pemulihan
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Company Profile Details */}
      <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Legalitas & Profil Perusahaan</h3>
          </div>
          <span className="font-mono text-slate-500">Mata Uang Buku: {company.currency}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-slate-700">
          <div>
            <span className="text-slate-400 text-[11px] block">Nama Badan Usaha:</span>
            <span className="font-bold text-slate-900 text-sm">{company.name}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] block">Nomor Pokok Wajib Pajak (NPWP):</span>
            <span className="font-mono font-bold text-slate-900">{company.taxId}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] block">Nomor Induk Berusaha (NIB):</span>
            <span className="font-mono text-slate-800">{company.nib}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] block">Kontak & Website:</span>
            <span className="text-slate-800">{company.phone} · {company.website}</span>
          </div>
          <div className="sm:col-span-2">
            <span className="text-slate-400 text-[11px] block">Alamat Fasilitas Utama:</span>
            <span className="text-slate-800">{company.address}, {company.city}</span>
          </div>
        </div>
      </div>

      {/* Warehouses Network */}
      <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-3">
        <h3 className="text-sm font-bold text-slate-900">Jaringan Fasilitas Gudang & Hub Logistik</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {warehouses.map((wh) => (
            <div key={wh.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-900">{wh.name}</span>
                <span className="font-mono text-[11px] text-blue-600 font-semibold">{wh.code}</span>
              </div>
              <p className="text-slate-600 text-[11px]">{wh.address}, {wh.city}</p>
              <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1 border-t border-slate-200/60 font-mono">
                <span>Kapasitas: {wh.capacitySqM} m²</span>
                <span>PIC: {wh.manager} ({wh.phone})</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
