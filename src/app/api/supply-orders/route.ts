import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { ensureTenantActive } from '@/lib/license';

const supplyOrderSchema = z.object({
  supplierId: z.string().min(1, 'Tedarikçi seçilmelidir'),
  materialId: z.string().min(1, 'Ürün seçilmelidir'),
  quantity: z.number().min(0.01, 'Miktar 0 dan büyük olmalıdır'),
  unit: z.string().min(1, 'Birim seçilmelidir'),
  unitPrice: z.number().min(0, 'Birim fiyat 0 dan küçük olamaz'),
  currency: z.enum(['TRY', 'USD', 'EUR', 'GBP']).default('TRY'),
  vatRate: z.number().refine(val => [1, 10, 20].includes(val), { message: 'Geçersiz KDV oranı' }),
  status: z.enum(['CREATED', 'ORDERED', 'RECEIVED']),
  wasteAmount: z.number().min(0, 'Fire miktarı 0 dan küçük olamaz').optional().default(0),
});

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = 10;
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    prisma.supplyOrder.findMany({
      where: { tenantId: session.tenantId },
      include: {
        supplier: true,
        material: true,
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.supplyOrder.count({ where: { tenantId: session.tenantId } }),
  ]);

  return NextResponse.json({
    orders,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    try {
      await ensureTenantActive(session.tenantId || '');
    } catch {
      return NextResponse.json({ error: 'Lisans süreniz dolmuştur.' }, { status: 403 });
    }
    const body = await req.json();
    const result = supplyOrderSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.format() }, { status: 400 });
    }

    const { quantity, unitPrice, vatRate, status, materialId, wasteAmount } = result.data;
    
    const totalPrice = quantity * unitPrice;
    const vatAmount = totalPrice * (vatRate / 100);
    const grandTotal = totalPrice + vatAmount;

    // Use transaction to ensure data integrity
    const resultOrder = await prisma.$transaction(async (tx) => {
      // Create Order
      const order = await tx.supplyOrder.create({
        data: {
          ...result.data,
          totalPrice,
          vatAmount,
          grandTotal,
          tenantId: session.tenantId,
        },
        include: { supplier: true, material: true }
      });

      // If status is RECEIVED, update stock (Quantity - Waste)
      if (status === 'RECEIVED') {
        const netQuantity = quantity - (wasteAmount || 0);
        await tx.material.update({
          where: { id: materialId },
          data: {
            stock: { increment: netQuantity }
          }
        });
      }

      return order;
    });

    return NextResponse.json(resultOrder);

  } catch (error) {
    console.error('Create supply order error:', error);
    return NextResponse.json({ error: 'Sipariş oluşturulurken hata oluştu' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
    try {
      try {
        await ensureTenantActive(session.tenantId || '');
      } catch {
        return NextResponse.json({ error: 'Lisans süreniz dolmuştur.' }, { status: 403 });
      }
      const body = await req.json();
      const { id, ...data } = body;
      
      if (!id) return NextResponse.json({ error: 'ID gerekli' }, { status: 400 });

      // Validate input
      const result = supplyOrderSchema.safeParse(data);
      if (!result.success) return NextResponse.json({ error: result.error.format() }, { status: 400 });

      const { quantity, unitPrice, vatRate, status, materialId, wasteAmount } = result.data;
      const totalPrice = quantity * unitPrice;
      const vatAmount = totalPrice * (vatRate / 100);
      const grandTotal = totalPrice + vatAmount;

      // Get existing order to check previous status
      const existingOrder = await prisma.supplyOrder.findUnique({
        where: { id },
      });

      if (!existingOrder) return NextResponse.json({ error: 'Sipariş bulunamadı' }, { status: 404 });

      // Handle Stock Logic
      await prisma.$transaction(async (tx) => {
        const newWaste = wasteAmount || 0;
        const oldWaste = Number(existingOrder.wasteAmount || 0);

        // If transitioning TO Received
        if (existingOrder.status !== 'RECEIVED' && status === 'RECEIVED') {
           const netQuantity = quantity - newWaste;
           await tx.material.update({
             where: { id: materialId },
             data: { stock: { increment: netQuantity } }
           });
        }
        // If transitioning FROM Received TO something else (undo stock)
        else if (existingOrder.status === 'RECEIVED' && status !== 'RECEIVED') {
           const oldNetQuantity = Number(existingOrder.quantity) - oldWaste;
           await tx.material.update({
             where: { id: existingOrder.materialId },
             data: { stock: { decrement: oldNetQuantity } } 
           });
        }
        // If Staying RECEIVED but quantity or waste changed
        else if (existingOrder.status === 'RECEIVED' && status === 'RECEIVED') {
            const oldNet = Number(existingOrder.quantity) - oldWaste;
            const newNet = quantity - newWaste;
            const diff = newNet - oldNet;

            if (diff !== 0) {
                await tx.material.update({
                    where: { id: materialId },
                    data: { stock: { increment: diff } }
                });
            }
        }

        // Update Order
        await tx.supplyOrder.update({
          where: { id },
          data: {
            ...result.data,
            totalPrice,
            vatAmount,
            grandTotal,
          }
        });
      });

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Update order error:', error);
      return NextResponse.json({ error: 'Güncelleme hatası' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        await ensureTenantActive(session.tenantId || '');
    } catch {
        return NextResponse.json({ error: 'Lisans süreniz dolmuştur.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) return NextResponse.json({ error: 'ID gerekli' }, { status: 400 });

    try {
        const existingOrder = await prisma.supplyOrder.findUnique({ where: { id } });
        if (!existingOrder) return NextResponse.json({ error: 'Sipariş bulunamadı' }, { status: 404 });

        await prisma.$transaction(async (tx) => {
            // If it was received, reverse stock
            if (existingOrder.status === 'RECEIVED') {
                const waste = Number(existingOrder.wasteAmount || 0);
                const netQuantity = Number(existingOrder.quantity) - waste;
                await tx.material.update({
                    where: { id: existingOrder.materialId },
                    data: { stock: { decrement: netQuantity } }
                });
            }
            await tx.supplyOrder.delete({ where: { id } });
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Silme hatası' }, { status: 500 });
    }
}
