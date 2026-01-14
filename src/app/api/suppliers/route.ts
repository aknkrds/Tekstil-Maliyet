import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const supplierSchema = z.object({
  name: z.string().min(1, 'Firma ünvanı zorunludur'),
  taxNumber: z.string().optional(),
  taxOffice: z.string().optional(),
  address: z.string().optional(),
  contactName: z.string().optional(),
  phone: z.string().optional(),
  mobile: z.string().optional(),
  paymentMethod: z.enum(['Peşin', 'Çek', 'Vadeli']),
  termDays: z.number().optional(),
  type: z.string().min(1, 'Tedarik türü zorunludur'),
});

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const suppliers = await prisma.supplier.findMany({
    where: { tenantId: session.tenantId },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(suppliers);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const result = supplierSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.format() }, { status: 400 });
    }

    const supplier = await prisma.supplier.create({
      data: {
        ...result.data,
        tenantId: session.tenantId,
      },
    });

    return NextResponse.json(supplier);
  } catch (error) {
    console.error('Create supplier error:', error);
    return NextResponse.json({ error: 'Tedarikçi oluşturulurken hata oluştu' }, { status: 500 });
  }
}
