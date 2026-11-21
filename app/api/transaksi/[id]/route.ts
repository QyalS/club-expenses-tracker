import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { validateTransaksiInput } from '@/lib/transaksi';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

function parseTransactionId(rawId: string): number | null {
  if (!/^\d+$/.test(rawId)) return null;
  const parsed = Number(rawId);
  if (!Number.isSafeInteger(parsed) || parsed <= 0) return null;
  return parsed;
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const numericId = parseTransactionId(id);

  if (!numericId) {
    return NextResponse.json(
      { error: 'ID transaksi tidak sah.' },
      { status: 400 }
    );
  }

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
    const updated = await prisma.transaksi.update({
      where: { id: numericId },
      data: validation.data,
    });

    return NextResponse.json({ data: updated }, { status: 200 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      return NextResponse.json(
        { error: 'Rekod transaksi tidak dijumpai.' },
        { status: 404 }
      );
    }

    console.error('PATCH /api/transaksi/[id] error:', error);
    return NextResponse.json(
      { error: 'Gagal mengemas kini rekod transaksi.' },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const numericId = parseTransactionId(id);

  if (!numericId) {
    return NextResponse.json(
      { error: 'ID transaksi tidak sah.' },
      { status: 400 }
    );
  }

  try {
    await prisma.transaksi.delete({
      where: { id: numericId },
    });

    return NextResponse.json(
      { message: 'Rekod transaksi berjaya dipadam.' },
      { status: 200 }
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      return NextResponse.json(
        { error: 'Rekod transaksi tidak dijumpai.' },
        { status: 404 }
      );
    }

    console.error('DELETE /api/transaksi/[id] error:', error);
    return NextResponse.json(
      { error: 'Gagal memadam rekod transaksi.' },
      { status: 500 }
    );
  }
}
