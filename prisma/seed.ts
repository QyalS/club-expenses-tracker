import { prisma } from '../lib/prisma';

async function main() {
  await prisma.transaksi.deleteMany();

  await prisma.transaksi.createMany({
    data: [
      {
        perkara: 'Tajaan Korporat Alumni Kelab Teknologi',
        jenis_transaksi: 'Pendapatan',
        kategori: 'Tajaan',
        jumlah_rm: 2500.0,
        tarikh: new Date('2026-10-03T09:00:00.000Z'),
      },
      {
        perkara: 'Kutipan Yuran Keahlian Semester 1 (120 Ahli)',
        jenis_transaksi: 'Pendapatan',
        kategori: 'Yuran',
        jumlah_rm: 1800.0,
        tarikh: new Date('2026-10-08T10:30:00.000Z'),
      },
      {
        perkara: 'Jamuan Minum Petang Mesyuarat Agung Tahunan',
        jenis_transaksi: 'Perbelanjaan',
        kategori: 'Makanan',
        jumlah_rm: 420.5,
        tarikh: new Date('2026-10-14T15:00:00.000Z'),
      },
      {
        perkara: 'Cetakan Bunting, Poster & Buku Program Minggu Inovasi',
        jenis_transaksi: 'Perbelanjaan',
        kategori: 'Percetakan',
        jumlah_rm: 315.0,
        tarikh: new Date('2026-10-19T11:15:00.000Z'),
      },
      {
        perkara: 'Sewa Bas & Pengangkutan Lawatan Industri Putrajaya',
        jenis_transaksi: 'Perbelanjaan',
        kategori: 'Logistik',
        jumlah_rm: 850.0,
        tarikh: new Date('2026-10-25T08:00:00.000Z'),
      },
      {
        perkara: 'Plak Penghargaan & Cenderamata Penceramah Jemputan',
        jenis_transaksi: 'Perbelanjaan',
        kategori: 'Cenderamata',
        jumlah_rm: 240.0,
        tarikh: new Date('2026-11-02T14:00:00.000Z'),
      },
      {
        perkara: 'Sumbangan Dana Hal Ehwal Pelajar (HEP) — Bengkel Kerjaya',
        jenis_transaksi: 'Pendapatan',
        kategori: 'Tajaan',
        jumlah_rm: 1200.0,
        tarikh: new Date('2026-11-06T09:30:00.000Z'),
      },
      {
        perkara: 'Pek Makanan Tengahari Peserta Hackathon Kelab',
        jenis_transaksi: 'Perbelanjaan',
        kategori: 'Makanan',
        jumlah_rm: 685.75,
        tarikh: new Date('2026-11-11T12:30:00.000Z'),
      },
      {
        perkara: 'Yuran Penyertaan Bengkel Reka Bentuk UI/UX',
        jenis_transaksi: 'Pendapatan',
        kategori: 'Yuran',
        jumlah_rm: 540.0,
        tarikh: new Date('2026-11-14T16:00:00.000Z'),
      },
      {
        perkara: 'Alat Tulis, Kabel Sambungan & Kelengkapan Pendaftaran',
        jenis_transaksi: 'Perbelanjaan',
        kategori: 'Lain-lain',
        jumlah_rm: 148.9,
        tarikh: new Date('2026-11-18T10:00:00.000Z'),
      },
    ],
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error('Ralat semasa menyemai data:', error);
    await prisma.$disconnect();
    process.exit(1);
  });
