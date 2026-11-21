export const JENIS_TRANSAKSI_LIST = ['Pendapatan', 'Perbelanjaan'] as const;
export type JenisTransaksi = (typeof JENIS_TRANSAKSI_LIST)[number];

export const KATEGORI_LIST = [
  'Tajaan',
  'Yuran',
  'Makanan',
  'Percetakan',
  'Logistik',
  'Cenderamata',
  'Lain-lain',
] as const;
export type KategoriTransaksi = (typeof KATEGORI_LIST)[number];

export interface TransaksiRecord {
  id: number;
  perkara: string;
  jenis_transaksi: JenisTransaksi;
  kategori: KategoriTransaksi;
  jumlah_rm: number;
  tarikh: string;
  createdAt: string;
}

export interface TransaksiPayload {
  perkara: string;
  jenis_transaksi: JenisTransaksi;
  kategori: KategoriTransaksi;
  jumlah_rm: number;
  tarikh: string;
}

export function formatRM(amount: number): string {
  const absFormatted = new Intl.NumberFormat('en-MY', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount));
  return amount < 0 ? `− RM ${absFormatted}` : `RM ${absFormatted}`;
}

export function formatTarikh(isoDate: string): string {
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) return '—';
  return new Intl.DateTimeFormat('ms-MY', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(parsed);
}

export function toDateInputValue(isoDate: string): string {
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) {
    return new Date().toISOString().slice(0, 10);
  }
  return parsed.toISOString().slice(0, 10);
}

export function validateTransaksiInput(body: unknown):
  | { ok: true; data: { perkara: string; jenis_transaksi: JenisTransaksi; kategori: KategoriTransaksi; jumlah_rm: number; tarikh: Date } }
  | { ok: false; error: string } {
  if (!body || typeof body !== 'object') {
    return { ok: false, error: 'Permintaan tidak sah.' };
  }

  const record = body as Record<string, unknown>;

  if (typeof record.perkara !== 'string' || record.perkara.trim().length < 2) {
    return { ok: false, error: 'Perkara mestilah sekurang-kurangnya 2 aksara.' };
  }
  const perkara = record.perkara.trim();
  if (perkara.length > 200) {
    return { ok: false, error: 'Perkara tidak boleh melebihi 200 aksara.' };
  }

  if (
    typeof record.jenis_transaksi !== 'string' ||
    !(JENIS_TRANSAKSI_LIST as readonly string[]).includes(record.jenis_transaksi)
  ) {
    return { ok: false, error: 'Jenis transaksi mestilah Pendapatan atau Perbelanjaan.' };
  }
  const jenis_transaksi = record.jenis_transaksi as JenisTransaksi;

  if (
    typeof record.kategori !== 'string' ||
    !(KATEGORI_LIST as readonly string[]).includes(record.kategori)
  ) {
    return { ok: false, error: 'Kategori yang dipilih tidak sah.' };
  }
  const kategori = record.kategori as KategoriTransaksi;

  const rawAmount =
    typeof record.jumlah_rm === 'number'
      ? record.jumlah_rm
      : typeof record.jumlah_rm === 'string'
        ? Number(record.jumlah_rm)
        : NaN;

  if (!Number.isFinite(rawAmount) || rawAmount <= 0 || rawAmount > 10_000_000) {
    return { ok: false, error: 'Jumlah (RM) mestilah nombor positif yang sah.' };
  }
  const jumlah_rm = Math.round(rawAmount * 100) / 100;

  if (typeof record.tarikh !== 'string' || !record.tarikh.trim()) {
    return { ok: false, error: 'Tarikh transaksi diperlukan.' };
  }
  const tarikh = new Date(record.tarikh);
  if (Number.isNaN(tarikh.getTime())) {
    return { ok: false, error: 'Format tarikh tidak sah.' };
  }

  return {
    ok: true,
    data: {
      perkara,
      jenis_transaksi,
      kategori,
      jumlah_rm,
      tarikh,
    },
  };
}
