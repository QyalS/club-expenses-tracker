'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Loader2, X } from 'lucide-react';
import {
  JENIS_TRANSAKSI_LIST,
  KATEGORI_LIST,
  JenisTransaksi,
  KategoriTransaksi,
  TransaksiPayload,
  TransaksiRecord,
  toDateInputValue,
} from '@/lib/transaksi';

interface TransaksiModalProps {
  open: boolean;
  editingRecord: TransaksiRecord | null;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (payload: TransaksiPayload, editId?: number) => Promise<void>;
}

interface TransaksiFormBodyProps {
  editingRecord: TransaksiRecord | null;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (payload: TransaksiPayload, editId?: number) => Promise<void>;
}

function TransaksiFormBody({
  editingRecord,
  submitting,
  onClose,
  onSubmit,
}: TransaksiFormBodyProps) {
  const [perkara, setPerkara] = useState(
    () => editingRecord?.perkara ?? ''
  );
  const [jenisTransaksi, setJenisTransaksi] = useState<JenisTransaksi>(
    () => editingRecord?.jenis_transaksi ?? 'Perbelanjaan'
  );
  const [kategori, setKategori] = useState<KategoriTransaksi>(
    () => editingRecord?.kategori ?? 'Makanan'
  );
  const [jumlahInput, setJumlahInput] = useState(() =>
    editingRecord ? editingRecord.jumlah_rm.toFixed(2) : ''
  );
  const [tarikh, setTarikh] = useState(() =>
    editingRecord
      ? toDateInputValue(editingRecord.tarikh)
      : new Date().toISOString().slice(0, 10)
  );
  const [formError, setFormError] = useState<string | null>(null);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedPerkara = perkara.trim();
    if (trimmedPerkara.length < 2) {
      setFormError('Sila masukkan penerangan perkara sekurang-kurangnya 2 aksara.');
      return;
    }

    const parsedAmount = Number(jumlahInput);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setFormError('Sila masukkan jumlah RM yang sah (lebih besar daripada 0).');
      return;
    }

    if (!tarikh) {
      setFormError('Sila pilih tarikh transaksi.');
      return;
    }

    await onSubmit(
      {
        perkara: trimmedPerkara,
        jenis_transaksi: jenisTransaksi,
        kategori,
        jumlah_rm: Math.round(parsedAmount * 100) / 100,
        tarikh: new Date(`${tarikh}T12:00:00.000Z`).toISOString(),
      },
      editingRecord?.id
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.98 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      className="relative z-10 w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-xl"
    >
      <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2
            id="transaksi-modal-title"
            className="text-lg font-semibold text-slate-900"
          >
            {editingRecord ? 'Edit Rekod Transaksi' : 'Tambah Transaksi Baru'}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {editingRecord
              ? 'Kemas kini butiran pendapatan atau perbelanjaan kelab.'
              : 'Rekodkan wang masuk atau wang keluar ke dalam buku kira kelab.'}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          aria-label="Tutup tetingkap"
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <form onSubmit={handleFormSubmit} className="mt-5 space-y-4">
        {formError && (
          <div
            role="alert"
            className="rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700"
          >
            {formError}
          </div>
        )}

        <div>
          <span className="block text-sm font-medium text-slate-700">
            Jenis Transaksi
          </span>
          <div className="mt-1.5 grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1">
            {JENIS_TRANSAKSI_LIST.map((jenis) => {
              const active = jenisTransaksi === jenis;
              const isIncome = jenis === 'Pendapatan';
              return (
                <button
                  key={jenis}
                  type="button"
                  onClick={() => setJenisTransaksi(jenis)}
                  className={`flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 ${
                    active
                      ? isIncome
                        ? 'bg-white text-emerald-700 shadow-sm'
                        : 'bg-white text-rose-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span aria-hidden="true">{isIncome ? '+' : '−'}</span>
                  <span>{jenis}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label
            htmlFor="input-perkara"
            className="block text-sm font-medium text-slate-700"
          >
            Perkara
          </label>
          <input
            id="input-perkara"
            type="text"
            required
            maxLength={200}
            value={perkara}
            onChange={(e) => setPerkara(e.target.value)}
            placeholder="cth. Tajaan Alumni atau Jamuan Mesyuarat Agung"
            className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="select-kategori"
              className="block text-sm font-medium text-slate-700"
            >
              Kategori
            </label>
            <select
              id="select-kategori"
              value={kategori}
              onChange={(e) =>
                setKategori(e.target.value as KategoriTransaksi)
              }
              className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              {KATEGORI_LIST.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="input-jumlah"
              className="block text-sm font-medium text-slate-700"
            >
              Jumlah (RM)
            </label>
            <div className="relative mt-1.5">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 font-mono text-sm text-slate-500">
                RM
              </span>
              <input
                id="input-jumlah"
                type="number"
                step="0.01"
                min="0.01"
                required
                value={jumlahInput}
                onChange={(e) => setJumlahInput(e.target.value)}
                placeholder="0.00"
                className="block w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-11 pr-3.5 font-mono text-sm tabular-nums text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>
        </div>

        <div>
          <label
            htmlFor="input-tarikh"
            className="block text-sm font-medium text-slate-700"
          >
            Tarikh Transaksi
          </label>
          <input
            id="input-tarikh"
            type="date"
            required
            value={tarikh}
            onChange={(e) => setTarikh(e.target.value)}
            className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 font-mono text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
          >
            {submitting && (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            )}
            <span>
              {submitting
                ? 'Menyimpan...'
                : editingRecord
                  ? 'Simpan Perubahan'
                  : 'Simpan Transaksi'}
            </span>
          </button>
        </div>
      </form>
    </motion.div>
  );
}

export function TransaksiModal({
  open,
  editingRecord,
  submitting,
  onClose,
  onSubmit,
}: TransaksiModalProps) {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !submitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, submitting, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="transaksi-modal-title"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            className="fixed inset-0 bg-slate-900/45 backdrop-blur-[1px]"
            onClick={() => {
              if (!submitting) onClose();
            }}
          />

          <TransaksiFormBody
            key={editingRecord ? `edit-${editingRecord.id}` : 'create-new'}
            editingRecord={editingRecord}
            submitting={submitting}
            onClose={onClose}
            onSubmit={onSubmit}
          />
        </div>
      )}
    </AnimatePresence>
  );
}
