import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateTransaksiInput } from '@/lib/transaksi';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const transaksi = await prisma.transaksi.findMany({
      orderBy: [{ tarikh: 'desc' }, { createdAt: 'desc' }, { id: 'desc' }],
    });

    return NextResponse.json({ data: transaksi }, { status: 200 });
  } catch (error) {
    console.error('GET /api/transaksi error:', error);
    return NextResponse.json(
      {
        error:
          'Gagal memuatkan rekod transaksi daripada pangkalan data. Sila pastikan DATABASE_URL dikonfigurasi dengan betul.',
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Format JSON permintaan tidak sah.' },
      { status: 400 }
    );
  }

  const validation = validateTransaksiInput(body);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  try {
    const created = await prisma.transaksi.create({
      data: validation.data,
    });

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    console.error('POST /api/transaksi error:', error);
    return NextResponse.json(
      {
        error:
          'Gagal menyimpan transaksi ke pangkalan data. Sila cuba sebentar lagi.',
      },
      { status: 500 }
    );
  }
}
