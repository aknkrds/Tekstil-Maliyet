import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { z } from 'zod';

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

    const { name, code, description, image1, image2, image3, image4, image5, laborCost, overheadCost, profitMargin, materials } = result.data;

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
