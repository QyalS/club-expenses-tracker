'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Download,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Wallet,
  X,
} from 'lucide-react';
import {
  JENIS_TRANSAKSI_LIST,
  KATEGORI_LIST,
  TransaksiPayload,
  TransaksiRecord,
  formatRM,
  formatTarikh,
} from '@/lib/transaksi';
import { TransaksiModal } from '@/components/TransaksiModal';
import { DeleteConfirmModal } from '@/components/DeleteConfirmModal';
import { ToastContainer, ToastMessage } from '@/components/ToastContainer';

export default function ClubExpenseTrackerPage() {
  const [transaksiList, setTransaksiList] = useState<TransaksiRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [filterJenis, setFilterJenis] = useState<'Semua' | 'Pendapatan' | 'Perbelanjaan'>('Semua');
  const [filterKategori, setFilterKategori] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<TransaksiRecord | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<TransaksiRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const pushToast = useCallback(
    (type: 'success' | 'error', message: string) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev, { id, type, message }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((item) => item.id !== id));
      }, 4200);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const loadTransaksi = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await fetch('/api/transaksi', { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error || 'Gagal memuatkan rekod transaksi.');
      }
      setTransaksiList(Array.isArray(json.data) ? json.data : []);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Ralat rangkaian semasa memuatkan data.';
      setFetchError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function initialFetch() {
      try {
        const res = await fetch('/api/transaksi', { cache: 'no-store' });
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json?.error || 'Gagal memuatkan rekod transaksi.');
        }
        if (!cancelled) {
          setTransaksiList(Array.isArray(json.data) ? json.data : []);
          setFetchError(null);
        }
      } catch (err) {
        if (!cancelled) {
          const message =
            err instanceof Error
              ? err.message
              : 'Ralat rangkaian semasa memuatkan data.';
          setFetchError(message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    initialFetch();
    return () => {
      cancelled = true;
    };
  }, []);

  const summary = useMemo(() => {
    let jumlahPendapatan = 0;
    let jumlahPerbelanjaan = 0;
    let incomeCount = 0;
    let expenseCount = 0;

    for (const item of transaksiList) {
      if (item.jenis_transaksi === 'Pendapatan') {
        jumlahPendapatan += item.jumlah_rm;
        incomeCount += 1;
      } else {
        jumlahPerbelanjaan += item.jumlah_rm;
        expenseCount += 1;
      }
    }

    const bakiSemasa = jumlahPendapatan - jumlahPerbelanjaan;
    return {
      jumlahPendapatan,
      jumlahPerbelanjaan,
      bakiSemasa,
      incomeCount,
      expenseCount,
    };
  }, [transaksiList]);

  const filteredList = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return transaksiList.filter((item) => {
      if (filterJenis !== 'Semua' && item.jenis_transaksi !== filterJenis) {
        return false;
      }
      if (filterKategori !== 'Semua' && item.kategori !== filterKategori) {
        return false;
      }
      if (
        query &&
        !item.perkara.toLowerCase().includes(query) &&
        !item.kategori.toLowerCase().includes(query)
      ) {
        return false;
      }
      return true;
    });
  }, [transaksiList, filterJenis, filterKategori, searchQuery]);

  const filteredNetTotal = useMemo(() => {
    return filteredList.reduce((acc, item) => {
      return item.jenis_transaksi === 'Pendapatan'
        ? acc + item.jumlah_rm
        : acc - item.jumlah_rm;
    }, 0);
  }, [filteredList]);

  const handleOpenAdd = () => {
    setEditingRecord(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (record: TransaksiRecord) => {
    setEditingRecord(record);
    setModalOpen(true);
  };

  const handleSaveTransaksi = async (
    payload: TransaksiPayload,
    editId?: number
  ) => {
    setSubmitting(true);
    try {
      const isEdit = typeof editId === 'number';
      const url = isEdit ? `/api/transaksi/${editId}` : '/api/transaksi';
      const method = isEdit ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error || 'Gagal menyimpan transaksi.');
      }

      setModalOpen(false);
      setEditingRecord(null);
      pushToast(
        'success',
        isEdit
          ? 'Rekod transaksi berjaya dikemas kini.'
          : 'Rekod transaksi baru berjaya ditambah.'
      );
      await loadTransaksi();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Gagal menyimpan rekod transaksi.';
      pushToast('error', message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTransaksi = async (id: number) => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/transaksi/${id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error || 'Gagal memadam rekod transaksi.');
      }

      setDeleteTarget(null);
      pushToast('success', 'Rekod transaksi berjaya dipadam.');
      await loadTransaksi();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Gagal memadam rekod transaksi.';
      pushToast('error', message);
    } finally {
      setDeleting(false);
    }
  };

  const handleResetFilters = () => {
    setFilterJenis('Semua');
    setFilterKategori('Semua');
    setSearchQuery('');
  };

  const handleExportCsv = () => {
    if (filteredList.length === 0) {
      pushToast('error', 'Tiada rekod untuk dieksport.');
      return;
    }

    const headers = ['ID', 'Tarikh', 'Perkara', 'Kategori', 'Jenis', 'Jumlah (RM)'];
    const escapeCsv = (val: string) => `"${val.replace(/"/g, '""')}"`;

    const rows = filteredList.map((item) => [
      String(item.id),
      item.tarikh.slice(0, 10),
      escapeCsv(item.perkara),
      escapeCsv(item.kategori),
      escapeCsv(item.jenis_transaksi),
      item.jenis_transaksi === 'Pendapatan'
        ? item.jumlah_rm.toFixed(2)
        : `-${item.jumlah_rm.toFixed(2)}`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join(
      '\n'
    );
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `rekod-kewangan-kelab-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    pushToast('success', 'Fail CSV berjaya dimuat turun.');
  };

  const hasActiveFilters =
    filterJenis !== 'Semua' ||
    filterKategori !== 'Semua' ||
    searchQuery.trim().length > 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
          <a
            href="#ringkasan"
            className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
          >
            Club Expense Tracker
          </a>

          <nav
            aria-label="Navigasi utama"
            className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600"
          >
            <a
              href="#ringkasan"
              className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Ringkasan
            </a>
            <a
              href="#penapis"
              className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Penapis
            </a>
            <a
              href="#rekod"
              className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Rekod Transaksi
            </a>
          </nav>

          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>Tambah Transaksi</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        <section className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl text-balance">
              Sistem Penjejak Bajet &amp; Perbelanjaan Kelab
            </h1>
            <p className="mt-1.5 max-w-2xl text-sm text-slate-600">
              Buku kira digital untuk bendahari dan jawatankuasa program merekod
              dana masuk, perbelanjaan aktiviti, dan memantau baki semasa kelab.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 whitespace-nowrap shrink-0">
            <span>{transaksiList.length} jumlah rekod</span>
            <span aria-hidden="true">·</span>
            <span>Mata wang MYR</span>
          </div>
        </section>

        {/* 3 Main Statistic Cards */}
        <section
          id="ringkasan"
          aria-label="Ringkasan Kewangan Kelab"
          className="grid grid-cols-1 gap-4 md:grid-cols-3"
        >
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <p className="text-sm font-medium text-slate-600">
              Jumlah Pendapatan
            </p>
            {loading ? (
              <div className="mt-3 h-9 w-40 animate-pulse rounded-md bg-slate-100" />
            ) : (
              <p className="mt-2 font-mono text-2xl font-semibold tabular-nums text-emerald-700 sm:text-3xl">
                {formatRM(summary.jumlahPendapatan)}
              </p>
            )}
            <p className="mt-2 text-xs text-slate-500">
              + {summary.incomeCount} rekod wang masuk (tajaan &amp; yuran)
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <p className="text-sm font-medium text-slate-600">
              Jumlah Perbelanjaan
            </p>
            {loading ? (
              <div className="mt-3 h-9 w-40 animate-pulse rounded-md bg-slate-100" />
            ) : (
              <p className="mt-2 font-mono text-2xl font-semibold tabular-nums text-rose-700 sm:text-3xl">
                {formatRM(summary.jumlahPerbelanjaan)}
              </p>
            )}
            <p className="mt-2 text-xs text-slate-500">
              − {summary.expenseCount} rekod perbelanjaan program
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <p className="text-sm font-medium text-slate-600">Baki Semasa</p>
            {loading ? (
              <div className="mt-3 h-9 w-40 animate-pulse rounded-md bg-slate-100" />
            ) : (
              <p
                className={`mt-2 font-mono text-2xl font-semibold tabular-nums sm:text-3xl ${
                  summary.bakiSemasa < 0 ? 'text-rose-600' : 'text-slate-900'
                }`}
              >
                {formatRM(summary.bakiSemasa)}
              </p>
            )}
            <p
              className={`mt-2 text-xs font-medium ${
                summary.bakiSemasa < 0 ? 'text-rose-600' : 'text-slate-500'
              }`}
            >
              {summary.bakiSemasa < 0
                ? 'Defisit · Perbelanjaan melebihi pendapatan'
                : 'Baki bersih = Pendapatan − Perbelanjaan'}
            </p>
          </div>
        </section>

        {/* Filter & Ledger Section */}
        <section id="rekod" className="space-y-4">
          <div
            id="penapis"
            className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 lg:flex-row lg:items-center lg:justify-between"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <div
                role="group"
                aria-label="Tapis mengikut jenis transaksi"
                className="inline-flex items-center rounded-lg bg-slate-100 p-1"
              >
                {(['Semua', ...JENIS_TRANSAKSI_LIST] as const).map((jenis) => {
                  const active = filterJenis === jenis;
                  return (
                    <button
                      key={jenis}
                      type="button"
                      onClick={() => setFilterJenis(jenis)}
                      className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 ${
                        active
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {jenis}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2">
                <label htmlFor="filter-kategori" className="sr-only">
                  Tapis Kategori
                </label>
                <select
                  id="filter-kategori"
                  value={filterKategori}
                  onChange={(e) => setFilterKategori(e.target.value)}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                >
                  <option value="Semua">Semua Kategori</option>
                  {KATEGORI_LIST.map((kat) => (
                    <option key={kat} value={kat}>
                      {kat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative flex-1 sm:min-w-[220px]">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari perkara..."
                  aria-label="Cari perkara transaksi"
                  className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-8 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="Kosongkan carian"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 hover:text-slate-700"
                  >
                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap shrink-0"
                >
                  Set Semula
                </button>
              )}
              <button
                type="button"
                onClick={handleExportCsv}
                disabled={loading || filteredList.length === 0}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
              >
                <Download className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Eksport CSV</span>
              </button>
              <button
                type="button"
                onClick={loadTransaksi}
                disabled={loading}
                aria-label="Muat semula senarai transaksi"
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`}
                  aria-hidden="true"
                />
                <span>Segar Semula</span>
              </button>
            </div>
          </div>

          {fetchError && (
            <div
              role="alert"
              className="flex flex-col gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-start gap-3">
                <AlertCircle
                  className="mt-0.5 h-5 w-5 shrink-0 text-rose-600"
                  aria-hidden="true"
                />
                <div>
                  <p className="text-sm font-semibold text-rose-900">
                    Tidak dapat memuatkan data transaksi
                  </p>
                  <p className="mt-0.5 text-sm text-rose-700">{fetchError}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={loadTransaksi}
                className="rounded-lg border border-rose-300 bg-white px-3.5 py-2 text-xs font-medium text-rose-700 hover:bg-rose-100 whitespace-nowrap shrink-0"
              >
                Cuba Semula
              </button>
            </div>
          )}

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            {/* Loading State */}
            {loading && (
              <div className="divide-y divide-slate-100">
                {[1, 2, 3, 4, 5].map((row) => (
                  <div
                    key={row}
                    className="flex h-12 items-center justify-between gap-4 px-5"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="h-3.5 w-20 animate-pulse rounded bg-slate-100" />
                      <div className="h-3.5 w-48 animate-pulse rounded bg-slate-100" />
                      <div className="hidden sm:block h-3.5 w-24 animate-pulse rounded bg-slate-100" />
                    </div>
                    <div className="h-3.5 w-24 animate-pulse rounded bg-slate-100" />
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && !fetchError && filteredList.length === 0 && (
              <div className="px-6 py-14 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500">
                  <Wallet className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-slate-900">
                  {transaksiList.length === 0
                    ? 'Belum ada rekod transaksi'
                    : 'Tiada rekod sepadan dengan penapis'}
                </h3>
                <p className="mx-auto mt-1.5 max-w-md text-sm text-slate-500">
                  {transaksiList.length === 0
                    ? 'Mulakan pengurusan kewangan kelab dengan merekod pendapatan atau perbelanjaan pertama.'
                    : 'Cuba ubah pilihan kategori, jenis transaksi, atau kata kunci carian anda.'}
                </p>
                <div className="mt-6">
                  {transaksiList.length === 0 ? (
                    <button
                      type="button"
                      onClick={handleOpenAdd}
                      className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 whitespace-nowrap shrink-0"
                    >
                      <Plus className="h-4 w-4" aria-hidden="true" />
                      <span>Log Transaksi Pertama</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap shrink-0"
                    >
                      Set Semula Penapis
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Desktop Data Table */}
            {!loading && filteredList.length > 0 && (
              <>
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full border-collapse text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-semibold text-slate-600">
                        <th scope="col" className="px-5 py-3 w-32">
                          Tarikh
                        </th>
                        <th scope="col" className="px-5 py-3">
                          Perkara
                        </th>
                        <th scope="col" className="px-5 py-3 w-36">
                          Kategori
                        </th>
                        <th scope="col" className="px-5 py-3 w-36">
                          Jenis
                        </th>
                        <th scope="col" className="px-5 py-3 text-right w-44">
                          Jumlah (RM)
                        </th>
                        <th scope="col" className="px-5 py-3 text-right w-28">
                          Tindakan
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredList.map((item) => {
                        const isIncome = item.jenis_transaksi === 'Pendapatan';
                        return (
                          <tr
                            key={item.id}
                            className="h-12 transition-colors hover:bg-slate-50/80"
                          >
                            <td className="px-5 py-3 font-mono text-xs tabular-nums text-slate-600 whitespace-nowrap">
                              {formatTarikh(item.tarikh)}
                            </td>
                            <td className="px-5 py-3 font-medium text-slate-900">
                              {item.perkara}
                            </td>
                            <td className="px-5 py-3 text-slate-600 whitespace-nowrap">
                              {item.kategori}
                            </td>
                            <td className="px-5 py-3 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center gap-1 text-xs font-medium ${
                                  isIncome
                                    ? 'text-emerald-700'
                                    : 'text-rose-700'
                                }`}
                              >
                                <span aria-hidden="true">
                                  {isIncome ? '+' : '−'}
                                </span>
                                <span>{item.jenis_transaksi}</span>
                              </span>
                            </td>
                            <td
                              className={`px-5 py-3 text-right font-mono text-sm font-semibold tabular-nums whitespace-nowrap ${
                                isIncome ? 'text-emerald-700' : 'text-rose-700'
                              }`}
                            >
                              {isIncome ? '+' : '−'} {formatRM(item.jumlah_rm)}
                            </td>
                            <td className="px-5 py-3 text-right whitespace-nowrap">
                              <div className="inline-flex items-center justify-end gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEdit(item)}
                                  aria-label={`Edit ${item.perkara}`}
                                  title="Edit rekod"
                                  className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
                                >
                                  <Pencil
                                    className="h-4 w-4"
                                    aria-hidden="true"
                                  />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeleteTarget(item)}
                                  aria-label={`Padam ${item.perkara}`}
                                  title="Padam rekod"
                                  className="rounded-md p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600"
                                >
                                  <Trash2
                                    className="h-4 w-4"
                                    aria-hidden="true"
                                  />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card List */}
                <div className="divide-y divide-slate-100 md:hidden">
                  {filteredList.map((item) => {
                    const isIncome = item.jenis_transaksi === 'Pendapatan';
                    return (
                      <div key={item.id} className="p-4 space-y-2.5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-slate-900 leading-snug">
                              {item.perkara}
                            </p>
                            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                              <span>{item.kategori}</span>
                              <span aria-hidden="true">·</span>
                              <span className="font-mono tabular-nums">
                                {formatTarikh(item.tarikh)}
                              </span>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p
                              className={`font-mono text-sm font-semibold tabular-nums ${
                                isIncome ? 'text-emerald-700' : 'text-rose-700'
                              }`}
                            >
                              {isIncome ? '+' : '−'} {formatRM(item.jumlah_rm)}
                            </p>
                            <p
                              className={`mt-0.5 text-xs font-medium ${
                                isIncome ? 'text-emerald-700' : 'text-rose-700'
                              }`}
                            >
                              {item.jenis_transaksi}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(item)}
                            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                          >
                            <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(item)}
                            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>Padam</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Table Footer */}
                <div className="flex flex-col gap-2 border-t border-slate-200 bg-slate-50/70 px-5 py-3 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">
                  <span>
                    Menunjukkan{' '}
                    <strong className="font-semibold text-slate-900">
                      {filteredList.length}
                    </strong>{' '}
                    daripada{' '}
                    <strong className="font-semibold text-slate-900">
                      {transaksiList.length}
                    </strong>{' '}
                    rekod
                  </span>
                  <div className="flex items-center gap-2">
                    <span>Subjumlah tapisan:</span>
                    <span
                      className={`font-mono font-semibold tabular-nums ${
                        filteredNetTotal < 0
                          ? 'text-rose-600'
                          : 'text-slate-900'
                      }`}
                    >
                      {formatRM(filteredNetTotal)}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>
      </main>

      <footer className="mx-auto max-w-6xl px-4 py-8 text-xs text-slate-500 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-2 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p>Club Expense Tracker · Sistem Penjejak Bajet &amp; Perbelanjaan Kelab</p>
          <p>Dikuasakan oleh Next.js 15 &amp; Prisma PostgreSQL</p>
        </div>
      </footer>

      <TransaksiModal
        open={modalOpen}
        editingRecord={editingRecord}
        submitting={submitting}
        onClose={() => {
          setModalOpen(false);
          setEditingRecord(null);
        }}
        onSubmit={handleSaveTransaksi}
      />

      <DeleteConfirmModal
        record={deleteTarget}
        deleting={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDeleteTransaksi}
      />

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
