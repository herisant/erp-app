import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { X, Plus, Trash2, BookOpen, AlertCircle } from 'lucide-react';
import { formatIDR } from '../../utils/formatters';

interface ManualJournalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ManualJournalModal: React.FC<ManualJournalModalProps> = ({ isOpen, onClose }) => {
  const { chartOfAccounts, createManualJournalEntry } = useErp();

  const [description, setDescription] = useState('');
  const [refNo, setRefNo] = useState('');
  const [lines, setLines] = useState<
    { accountCode: string; debit: number; credit: number; memo: string }[]
  >([
    { accountCode: '6010', debit: 5000000, credit: 0, memo: 'Beban operasional berjalan' },
    { accountCode: '1020', debit: 0, credit: 5000000, memo: 'Pengeluaran rekening bank BCA' },
  ]);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const totalDebit = lines.reduce((sum, l) => sum + (Number(l.debit) || 0), 0);
  const totalCredit = lines.reduce((sum, l) => sum + (Number(l.credit) || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01 && totalDebit > 0;

  const handleAddLine = () => {
    setLines([...lines, { accountCode: '1010', debit: 0, credit: 0, memo: '' }]);
  };

  const handleRemoveLine = (idx: number) => {
    if (lines.length <= 2) return;
    setLines(lines.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!description.trim()) {
      setErrorMsg('Deskripsi jurnal umum wajib diisi');
      return;
    }
    if (!isBalanced) {
      setErrorMsg(
        `Jurnal tidak berimbang! Total Debet (${formatIDR(totalDebit)}) harus sama persis dengan Total Kredit (${formatIDR(totalCredit)}).`
      );
      return;
    }

    const success = createManualJournalEntry(
      description,
      refNo || `MEMO-${Math.floor(Math.random() * 9000 + 1000)}`,
      lines
    );
    if (success) {
      onClose();
    } else {
      setErrorMsg('Gagal memposting jurnal.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="text-base font-bold text-slate-900">Entri Jurnal Umum Manual (General Ledger)</h3>
              <p className="text-xs text-slate-500">
                Pembukuan berpasangan (Double-Entry Bookkeeping: Debet = Kredit)
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Keterangan / Deskripsi Transaksi *
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Contoh: Penyesuaian penyusutan aset tetap atau biaya sewa"
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-md focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nomor Dokumen / Memo</label>
              <input
                type="text"
                value={refNo}
                onChange={(e) => setRefNo(e.target.value)}
                placeholder="MEMO/2026/10/xxx"
                className="w-full px-3 py-2 border border-slate-200 rounded-md font-mono"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-semibold text-slate-700">Baris Jurnal Akun</label>
              <button
                type="button"
                onClick={handleAddLine}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-semibold text-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Akun</span>
              </button>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                  <tr>
                    <th className="py-2 px-3">Kode & Nama Akun (COA)</th>
                    <th className="py-2 px-3">Memo Baris</th>
                    <th className="py-2 px-3 w-32 text-right">Debet (IDR)</th>
                    <th className="py-2 px-3 w-32 text-right">Kredit (IDR)</th>
                    <th className="py-2 px-2 w-10 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {lines.map((line, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="p-2.5">
                        <select
                          value={line.accountCode}
                          onChange={(e) => {
                            const updated = [...lines];
                            updated[idx].accountCode = e.target.value;
                            setLines(updated);
                          }}
                          className="w-full px-2 py-1.5 border border-slate-200 rounded bg-white font-medium"
                        >
                          {chartOfAccounts.map((acc) => (
                            <option key={acc.code} value={acc.code}>
                              {acc.code} - {acc.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-2.5">
                        <input
                          type="text"
                          value={line.memo}
                          onChange={(e) => {
                            const updated = [...lines];
                            updated[idx].memo = e.target.value;
                            setLines(updated);
                          }}
                          placeholder="Memo catatan"
                          className="w-full px-2 py-1.5 border border-slate-200 rounded"
                        />
                      </td>
                      <td className="p-2.5">
                        <input
                          type="number"
                          min="0"
                          value={line.debit}
                          onChange={(e) => {
                            const updated = [...lines];
                            updated[idx].debit = Number(e.target.value);
                            if (Number(e.target.value) > 0) updated[idx].credit = 0;
                            setLines(updated);
                          }}
                          className="w-full px-2 py-1.5 border border-slate-200 rounded text-right font-mono tabular-nums"
                        />
                      </td>
                      <td className="p-2.5">
                        <input
                          type="number"
                          min="0"
                          value={line.credit}
                          onChange={(e) => {
                            const updated = [...lines];
                            updated[idx].credit = Number(e.target.value);
                            if (Number(e.target.value) > 0) updated[idx].debit = 0;
                            setLines(updated);
                          }}
                          className="w-full px-2 py-1.5 border border-slate-200 rounded text-right font-mono tabular-nums"
                        />
                      </td>
                      <td className="p-2.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveLine(idx)}
                          disabled={lines.length <= 2}
                          className="text-slate-400 hover:text-rose-600 disabled:opacity-30"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Balance Status Indicator */}
          <div className="flex flex-col sm:flex-row items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-lg gap-3">
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${isBalanced ? 'bg-emerald-500' : 'bg-rose-500'}`}
              />
              <span className="font-semibold text-slate-800">
                {isBalanced ? 'Jurnal Seimbang (Balanced)' : 'Belum Seimbang (Unbalanced)'}
              </span>
              {!isBalanced && (
                <span className="text-slate-500 text-[11px]">
                  (Selisih: {formatIDR(Math.abs(totalDebit - totalCredit))})
                </span>
              )}
            </div>

            <div className="flex items-center gap-6 font-mono text-xs tabular-nums">
              <div>
                <span className="text-slate-500 mr-2">Total Debet:</span>
                <span className="font-bold text-slate-900">{formatIDR(totalDebit)}</span>
              </div>
              <div>
                <span className="text-slate-500 mr-2">Total Kredit:</span>
                <span className="font-bold text-slate-900">{formatIDR(totalCredit)}</span>
              </div>
            </div>
          </div>

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
              disabled={!isBalanced}
              className="px-5 py-2 text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-lg font-semibold shadow-xs"
            >
              Posting Jurnal ke Buku Besar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
