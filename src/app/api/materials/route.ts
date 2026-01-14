import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { z } from 'zod';

const materialSchema = z.object({
  name: z.string().min(1),
  unit: z.string().default('kg'),
  price: z.number().min(0),
  currency: z.string().default('TRY'),
});

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const materials = await prisma.material.findMany({
    where: { tenantId: session.tenantId },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(materials);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const result = materialSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.format() }, { status: 400 });
    }

    const { name, unit, price, currency } = result.data;

    const material = await prisma.material.create({
      data: {
        name,
        unit,
        price,
        currency,
        tenantId: session.tenantId,
      },
    });

    return NextResponse.json(material);
  } catch (error) {
    console.error('Material Create Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
