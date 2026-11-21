'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AlertTriangle, Loader2, X } from 'lucide-react';
import { TransaksiRecord, formatRM, formatTarikh } from '@/lib/transaksi';

interface DeleteConfirmModalProps {
  record: TransaksiRecord | null;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: (id: number) => Promise<void>;
}

export function DeleteConfirmModal({
  record,
  deleting,
  onCancel,
  onConfirm,
}: DeleteConfirmModalProps) {
  useEffect(() => {
    if (!record) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !deleting) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [record, deleting, onCancel]);

  return (
    <AnimatePresence>
      {record && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-modal-title"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            className="fixed inset-0 bg-slate-900/45 backdrop-blur-[1px]"
            onClick={() => {
              if (!deleting) onCancel();
            }}
          />

          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                  <AlertTriangle className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <h2
                    id="delete-modal-title"
                    className="text-base font-semibold text-slate-900"
                  >
                    Padam Rekod Transaksi?
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Tindakan ini tidak boleh dipulihkan selepas dipadam.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onCancel}
                disabled={deleting}
                aria-label="Tutup dialog pengesahan"
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
              <p className="font-medium text-slate-900">{record.perkara}</p>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span>{record.kategori}</span>
                <span aria-hidden="true">·</span>
                <span>{formatTarikh(record.tarikh)}</span>
                <span aria-hidden="true">·</span>
                <span
                  className={`font-mono font-semibold tabular-nums ${
                    record.jenis_transaksi === 'Pendapatan'
                      ? 'text-emerald-700'
                      : 'text-rose-700'
                  }`}
                >
                  {record.jenis_transaksi === 'Pendapatan' ? '+' : '−'}{' '}
                  {formatRM(record.jumlah_rm)}
                </span>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onCancel}
                disabled={deleting}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => onConfirm(record.id)}
                disabled={deleting}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-60 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 focus-visible:ring-offset-2"
              >
                {deleting && (
                  <Loader2
                    className="h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                )}
                <span>{deleting ? 'Memadam...' : 'Padam Rekod'}</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
