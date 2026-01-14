import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { z } from 'zod';

const orderSchema = z.object({
  orderNumber: z.string().min(1, 'Sipariş numarası zorunludur'),
  customerId: z.string().min(1, 'Müşteri seçimi zorunludur'),
  productType: z.string().min(1, 'Ürün türü zorunludur'),
  fabricType: z.string().min(1, 'Kumaş türü zorunludur'),
  deadline: z.number().min(1, 'Termin süresi zorunludur'),
  
  fabricConsumption: z.number().min(0),
  fabricUnit: z.string().min(1),
  fabricPrice: z.number().min(0),
  fabricCurrency: z.string().min(1),
  
  accessory1Type: z.string().optional(),
  accessory1Consumption: z.number().optional(),
  accessory1Unit: z.string().optional(),
  accessory1Price: z.number().optional(),
  accessory1Currency: z.string().optional(),
  
  accessory2Type: z.string().optional(),
  accessory2Consumption: z.number().optional(),
  accessory2Unit: z.string().optional(),
  accessory2Price: z.number().optional(),
  accessory2Currency: z.string().optional(),
  
  accessory3Type: z.string().optional(),
  accessory3Consumption: z.number().optional(),
  accessory3Unit: z.string().optional(),
  accessory3Price: z.number().optional(),
  accessory3Currency: z.string().optional(),
  
  cuttingPrice: z.number().min(0),
  cuttingCurrency: z.string().min(1),
  
  sewingPrice: z.number().min(0),
  sewingCurrency: z.string().min(1),
  
  ironingPrice: z.number().min(0),
  ironingCurrency: z.string().min(1),
  
  shippingPrice: z.number().min(0),
  shippingCurrency: z.string().min(1),
  
  profitAmount: z.number().min(0),
  profitCurrency: z.string().min(1),
  
  vatRate: z.number().refine(val => [1, 10, 20].includes(val), 'Geçersiz KDV oranı'),
  
  totalAmount: z.number().min(0),
  currency: z.string().default("TRY"),
  
  status: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const result = orderSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation Error', details: result.error.errors },
        { status: 400 }
      );
    }

    const { data } = result;

    const order = await prisma.order.create({
      data: {
        ...data,
        tenantId: session.tenantId,
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 15;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { tenantId: session.tenantId },
        include: { customer: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.order.count({ where: { tenantId: session.tenantId } }),
    ]);

    return NextResponse.json({
      orders,
      pagination: {
        page,
        totalPages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    console.error('Fetch orders error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { id, ...data } = body;

        if (!id) {
            return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
        }
        
        // If updating status only, validation might be partial or strict depending on needs.
        // For simplicity, we assume full update or partial update handled by Prisma but we validate schema if full data provided.
        // If partial, we might need a partial schema.
        // Let's assume we use this for both status update and full edit.
        
        // For status update, we might just check if status is valid.
        // If the body contains only status, we skip full validation.
        
        let updateData = data;
        if (Object.keys(data).length === 1 && data.status) {
             // Just status update
        } else {
             const result = orderSchema.partial().safeParse(data); // partial allow updates
             if (!result.success) {
                return NextResponse.json({ error: 'Validation Error', details: result.error.errors }, { status: 400 });
             }
             updateData = result.data;
        }

        const order = await prisma.order.update({
            where: { id, tenantId: session.tenantId },
            data: updateData,
        });

        return NextResponse.json(order);

    } catch (error) {
        console.error('Update order error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
        }

        await prisma.order.delete({
            where: { id, tenantId: session.tenantId },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete order error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
