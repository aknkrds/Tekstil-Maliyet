import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import ProductsPageClient from './ProductsPageClient';

export default async function ProductsPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const [activeProducts, passiveProducts] = await Promise.all([
    prisma.product.findMany({
      where: { tenantId: session.tenantId, isActive: true },
      include: {
        materials: {
          include: {
            material: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.product.findMany({
      where: { tenantId: session.tenantId, isActive: false },
      include: {
        materials: {
          include: {
            material: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const safeActiveProducts = activeProducts.map(p => ({
    ...p,
    laborCost: Number(p.laborCost),
    overheadCost: Number(p.overheadCost),
    profitMargin: Number(p.profitMargin),
    isActive: p.isActive,
    materials: p.materials.map(pm => ({
      ...pm,
      quantity: Number(pm.quantity),
      waste: Number(pm.waste),
      material: {
        ...pm.material,
        price: Number(pm.material.price)
      }
    }))
  }));

  const safePassiveProducts = passiveProducts.map(p => ({
    ...p,
    laborCost: Number(p.laborCost),
    overheadCost: Number(p.overheadCost),
    profitMargin: Number(p.profitMargin),
    isActive: p.isActive,
    materials: p.materials.map(pm => ({
      ...pm,
      quantity: Number(pm.quantity),
      waste: Number(pm.waste),
      material: {
        ...pm.material,
        price: Number(pm.material.price),
      },
    })),
  }));

  return (
    <ProductsPageClient products={safeActiveProducts} passiveProducts={safePassiveProducts} />
  );
}
