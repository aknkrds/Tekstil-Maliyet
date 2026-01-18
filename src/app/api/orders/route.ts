import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { z } from 'zod';
import { ensureTenantActive } from '@/lib/license';

const baseOrderSchema = z.object({
  orderNumber: z.string().min(1, 'Sipariş numarası zorunludur'),
  customerId: z.string().min(1, 'Müşteri seçimi zorunludur'),
  productId: z.string().min(1, 'Ürün seçimi zorunludur'),
  deadlineDate: z.string().min(1, 'Termin tarihi zorunludur'),
  quantity: z.number().min(1, 'Adet zorunludur'),
  marginType: z.enum(['PERCENT', 'AMOUNT']),
  marginValue: z.number().min(0),
});

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      await ensureTenantActive(session.tenantId);
    } catch {
      return NextResponse.json({ error: 'Lisans süreniz dolmuştur.' }, { status: 403 });
    }

    const body = await request.json();
    const result = baseOrderSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation Error', details: result.error.errors },
        { status: 400 }
      );
    }

    const { orderNumber, customerId, productId, deadlineDate, quantity, marginType, marginValue } = result.data;

    const product = await prisma.product.findFirst({
      where: { id: productId, tenantId: session.tenantId },
      include: {
        materials: {
          include: {
            material: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Ürün bulunamadı' }, { status: 400 });
    }

    let materialCost = 0;
    product.materials.forEach(pm => {
      const q = Number(pm.quantity);
      const waste = Number(pm.waste);
      const price = Number(pm.material.price);
      const usage = q * (1 + waste / 100);
      materialCost += usage * price;
    });

    const labor = Number(product.laborCost || 0);
    const overhead = Number(product.overheadCost || 0);
    const baseWithoutProductProfit = materialCost + labor + overhead;
    const productProfitMargin = Number(product.profitMargin || 0);
    const productBaseWithProfit = baseWithoutProductProfit * (1 + productProfitMargin / 100);

    // Birim fiyat üzerinden toplam taban fiyat
    const baseAmount = productBaseWithProfit;
    const totalBaseAmount = baseAmount * quantity;

    // Ekstra kar hesabı
    const extraProfit =
      marginType === 'PERCENT'
        ? totalBaseAmount * (marginValue / 100)
        : marginValue; // Eğer tutar seçildiyse toplam tutara eklenir

    const profitAmount = extraProfit;
    const vatRate = 0;
    const totalAmount = totalBaseAmount + profitAmount;

    const dueDate = new Date(deadlineDate);

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customer: { connect: { id: customerId } },
        product: { connect: { id: productId } },
        productType: product.code || product.name,
        fabricType: product.name,
        offerDate: new Date(),
        deadline: 1,
        deadlineDate: isNaN(dueDate.getTime()) ? null : dueDate,
        fabricConsumption: 1,
        fabricUnit: 'adet',
        fabricPrice: baseAmount,
        fabricCurrency: 'TRY',
        cuttingPrice: 0,
        cuttingCurrency: 'TRY',
        sewingPrice: 0,
        sewingCurrency: 'TRY',
        ironingPrice: 0,
        ironingCurrency: 'TRY',
        shippingPrice: 0,
        shippingCurrency: 'TRY',
        profitAmount,
        profitCurrency: 'TRY',
        baseAmount,
        quantity,
        marginType,
        marginValue,
        vatRate,
        totalAmount,
        currency: 'TRY',
        status: 'TEKLIF_OLUSTURULDU',
        tenantId: session.tenantId,
      },
      include: {
        customer: true,
        product: true,
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
        include: { customer: true, product: true },
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

        try {
            await ensureTenantActive(session.tenantId);
        } catch {
            return NextResponse.json({ error: 'Lisans süreniz dolmuştur.' }, { status: 403 });
        }

        const body = await request.json();
        const { id, ...data } = body;

        if (!id) {
            return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
        }
        if (Object.keys(data).length === 1 && data.status) {
             const order = await prisma.order.update({
               where: { id, tenantId: session.tenantId },
               data: { status: data.status },
             });
             return NextResponse.json(order);
        } else {
             const result = baseOrderSchema.safeParse(data);
             if (!result.success) {
                return NextResponse.json({ error: 'Validation Error', details: result.error.errors }, { status: 400 });
             }

             const { orderNumber, customerId, productId, deadlineDate, quantity, marginType, marginValue } = result.data;

             const product = await prisma.product.findFirst({
               where: { id: productId, tenantId: session.tenantId },
               include: {
                 materials: {
                   include: {
                     material: true,
                   },
                 },
               },
             });

             if (!product) {
               return NextResponse.json({ error: 'Ürün bulunamadı' }, { status: 400 });
             }

             let materialCost = 0;
             product.materials.forEach(pm => {
               const q = Number(pm.quantity);
               const waste = Number(pm.waste);
               const price = Number(pm.material.price);
               const usage = q * (1 + waste / 100);
               materialCost += usage * price;
             });

             const labor = Number(product.laborCost || 0);
             const overhead = Number(product.overheadCost || 0);
             const baseWithoutProductProfit = materialCost + labor + overhead;
             const productProfitMargin = Number(product.profitMargin || 0);
             const productBaseWithProfit = baseWithoutProductProfit * (1 + productProfitMargin / 100);

             const baseAmount = productBaseWithProfit;
             const totalBaseAmount = baseAmount * quantity;

             const extraProfit =
               marginType === 'PERCENT'
                 ? totalBaseAmount * (marginValue / 100)
                 : marginValue;

             const profitAmount = extraProfit;
             const vatRate = 0;
             const totalAmount = totalBaseAmount + profitAmount;

             const dueDate = new Date(deadlineDate);

             const updated = await prisma.order.update({
               where: { id, tenantId: session.tenantId },
               data: {
                 orderNumber,
                 customer: { connect: { id: customerId } },
                 product: { connect: { id: productId } },
                 productType: product.code || product.name,
                 fabricType: product.name,
                 deadline: 1,
                 deadlineDate: isNaN(dueDate.getTime()) ? null : dueDate,
                 fabricConsumption: 1,
                 fabricUnit: 'adet',
                 fabricPrice: baseAmount,
                 fabricCurrency: 'TRY',
                 cuttingPrice: 0,
                 cuttingCurrency: 'TRY',
                 sewingPrice: 0,
                 sewingCurrency: 'TRY',
                 ironingPrice: 0,
                 ironingCurrency: 'TRY',
                 shippingPrice: 0,
                 shippingCurrency: 'TRY',
                 profitAmount,
                 profitCurrency: 'TRY',
                 baseAmount,
                 quantity,
                 marginType,
                 marginValue,
                 vatRate,
                 totalAmount,
                 currency: 'TRY',
               },
               include: {
                 customer: true,
                 product: true,
               },
             });

             return NextResponse.json(updated);
        }
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

        try {
            await ensureTenantActive(session.tenantId);
        } catch {
            return NextResponse.json({ error: 'Lisans süreniz dolmuştur.' }, { status: 403 });
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
