import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { z } from 'zod';

const offerSchema = z.object({
  customerId: z.string().min(1, 'Müşteri seçimi zorunludur'),
  validUntil: z.string().optional(), // Date string
  items: z.array(z.object({
    productId: z.string().min(1),
    quantity: z.number().min(0.01),
    unitPrice: z.number().min(0),
  })).min(1, 'En az bir ürün eklemelisiniz'),
});

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const offers = await prisma.offer.findMany({
      where: { tenantId: session.tenantId },
      include: {
        customer: true,
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(offers);
  } catch (error) {
    console.error('Offers Fetch Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const result = offerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.format() }, { status: 400 });
    }

    const { customerId, validUntil, items } = result.data;

    // Calculate totals
    let totalAmount = 0;
    const offerItems = items.map(item => {
      const lineTotal = item.quantity * item.unitPrice;
      totalAmount += lineTotal;
      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: lineTotal,
      };
    });

    // Generate a simple code (e.g., TEK-2024-001) - for now just random string or timestamp
    const code = `TEK-${Date.now().toString().slice(-6)}`;

    const offer = await prisma.offer.create({
      data: {
        code,
        customerId,
        tenantId: session.tenantId,
        totalAmount,
        validUntil: validUntil ? new Date(validUntil) : null,
        status: 'DRAFT',
        items: {
          create: offerItems,
        },
      },
      include: {
        items: true,
      }
    });

    return NextResponse.json(offer);
  } catch (error) {
    console.error('Offer Create Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
