import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { z } from 'zod';

const customerSchema = z.object({
  name: z.string().min(1, 'Müşteri ünvanı zorunludur'),
  address: z.string().optional(),
  shippingAddress: z.string().optional(),
  taxOffice: z.string().optional(),
  taxNumber: z.string().optional(),
  email: z.string().email('Geçerli bir e-posta adresi giriniz').optional().or(z.literal('')),
  phone: z.string().optional(),
  contactName: z.string().optional(),
  contactPhone: z.string().optional(),
  paymentMethod: z.string().optional(),
});

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = 15;
  const skip = (page - 1) * limit;

  try {
    const [customers, total] = await Promise.all([
        prisma.customer.findMany({
            where: { tenantId: session.tenantId },
            orderBy: { name: 'asc' }, // Alphabetical order
            skip,
            take: limit,
        }),
        prisma.customer.count({ where: { tenantId: session.tenantId } })
    ]);

    return NextResponse.json({
        customers,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    });
  } catch (error) {
    console.error('Customers Fetch Error:', error);
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
    const result = customerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.format() }, { status: 400 });
    }

    const customer = await prisma.customer.create({
      data: {
        ...result.data,
        email: result.data.email || null,
        tenantId: session.tenantId,
      },
    });

    return NextResponse.json(customer);
  } catch (error) {
    console.error('Customer Create Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await req.json();
        const { id, ...data } = body;
        
        if(!id) return NextResponse.json({ error: 'ID gerekli' }, { status: 400 });

        const result = customerSchema.safeParse(data);
        if(!result.success) return NextResponse.json({ error: result.error.format() }, { status: 400 });

        const existing = await prisma.customer.findUnique({ where: { id } });
        if(!existing || existing.tenantId !== session.tenantId) {
            return NextResponse.json({ error: 'Müşteri bulunamadı' }, { status: 404 });
        }

        const customer = await prisma.customer.update({
            where: { id },
            data: {
                ...result.data,
                email: result.data.email || null,
            }
        });

        return NextResponse.json(customer);
    } catch(error) {
        console.error('Customer Update Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if(!id) return NextResponse.json({ error: 'ID gerekli' }, { status: 400 });

    try {
        const existing = await prisma.customer.findUnique({ where: { id } });
        if(!existing || existing.tenantId !== session.tenantId) {
            return NextResponse.json({ error: 'Müşteri bulunamadı' }, { status: 404 });
        }

        await prisma.customer.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch(error) {
        console.error('Customer Delete Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
