import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import path from 'path';
import { promises as fs } from 'fs';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.formData();

    const name = String(formData.get('name') || '').trim();
    if (!name) {
      return NextResponse.json({ error: 'Ürün adı zorunludur' }, { status: 400 });
    }

    const code = String(formData.get('code') || '').trim() || undefined;
    const description = String(formData.get('description') || '').trim() || undefined;

    const files = formData.getAll('images').filter((f): f is File => f instanceof File);

    const product = await prisma.product.create({
      data: {
        name,
        code,
        description,
        tenantId: session.tenantId,
      },
    });

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'products', product.id);
    await fs.mkdir(uploadDir, { recursive: true });

    const imagePaths: string[] = [];

    for (let i = 0; i < files.length && i < 5; i++) {
      const file = files[i];
      const originalName = file.name || `image-${i + 1}.jpg`;
      const ext = path.extname(originalName) || '.jpg';
      const fileName = `image-${i + 1}-${Date.now()}${ext}`;
      const fullPath = path.join(uploadDir, fileName);

      const buffer = Buffer.from(await file.arrayBuffer());
      await fs.writeFile(fullPath, buffer);

      const publicPath = `/uploads/products/${product.id}/${fileName}`;
      imagePaths.push(publicPath);
    }

    const updated = await prisma.product.update({
      where: { id: product.id },
      data: {
        image1: imagePaths[0],
        image2: imagePaths[1],
        image3: imagePaths[2],
        image4: imagePaths[3],
        image5: imagePaths[4],
      },
    });

    return NextResponse.json({ product: updated });
  } catch (error) {
    console.error('Product image upload error:', error);
    return NextResponse.json({ error: 'Ürün kaydedilirken bir hata oluştu' }, { status: 500 });
  }
}

