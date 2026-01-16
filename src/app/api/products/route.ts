import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { z } from 'zod';

const manualRecipeItemSchema = z.object({
  name: z.string(),
  unit: z.string(),
  quantity: z.number(),
  waste: z.number(),
  unitPrice: z.number(),
  currency: z.string(),
});

const productSchema = z.object({
  name: z.string().min(1),
  code: z.string().optional(),
  description: z.string().optional(),
  image1: z.string().optional(),
  image2: z.string().optional(),
  image3: z.string().optional(),
  image4: z.string().optional(),
  image5: z.string().optional(),
  laborCost: z.number().min(0).default(0),
  overheadCost: z.number().min(0).default(0),
  profitMargin: z.number().min(0).default(0),
  isActive: z.boolean().optional(),
  manualRecipe: z.array(manualRecipeItemSchema).optional(),
  materials: z.array(z.object({
    materialId: z.string(),
    quantity: z.number().min(0),
    waste: z.number().min(0).default(0),
  })).optional(),
});

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const products = await prisma.product.findMany({
    where: { tenantId: session.tenantId },
    include: {
      materials: {
        include: {
          material: true
        }
      }
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(products);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const result = productSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.format() }, { status: 400 });
    }

    const { name, code, description, image1, image2, image3, image4, image5, laborCost, overheadCost, profitMargin, manualRecipe, materials } = result.data;

    const product = await prisma.product.create({
      data: {
        name,
        code,
        description,
        image1,
        image2,
        image3,
        image4,
        image5,
        laborCost,
        overheadCost,
        profitMargin,
        manualRecipe,
        tenantId: session.tenantId,
        materials: {
          create: materials?.map(m => ({
            materialId: m.materialId,
            quantity: m.quantity,
            waste: m.waste,
          }))
        }
      },
      include: {
        materials: true
      }
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Product Create Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { id, ...data } = body as { id?: string } & z.infer<typeof productSchema>;
    if (!id) {
      return NextResponse.json({ error: 'ID gerekli' }, { status: 400 });
    }
    // Validate update payload (partial allowed)
    const partialSchema = productSchema.partial();
    const result = partialSchema.safeParse(data);
    if (!result.success) {
      return NextResponse.json({ error: result.error.format() }, { status: 400 });
    }
    // Ensure product belongs to tenant
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing || existing.tenantId !== session.tenantId) {
      return NextResponse.json({ error: 'Ürün bulunamadı' }, { status: 404 });
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        ...result.data,
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Product Update Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID gerekli' }, { status: 400 });
    }

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing || existing.tenantId !== session.tenantId) {
      return NextResponse.json({ error: 'Ürün bulunamadı' }, { status: 404 });
    }

    const offerCount = await prisma.offerItem.count({ where: { productId: id } });
    const orderCount = await prisma.order.count({ where: { productId: id } });

    if (offerCount > 0 || orderCount > 0) {
      return NextResponse.json(
        { error: 'Bu ürün teklif veya siparişlerde kullanıldığı için kalıcı silinemez' },
        { status: 400 },
      );
    }

    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Product Delete Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
