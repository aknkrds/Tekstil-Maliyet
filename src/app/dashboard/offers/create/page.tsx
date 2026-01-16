import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import OfferForm from './OfferForm';

export default async function CreateOfferPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const [customers, products] = await Promise.all([
    prisma.customer.findMany({
      where: { tenantId: session.tenantId },
      orderBy: { name: 'asc' },
    }),
    prisma.product.findMany({
      where: { tenantId: session.tenantId, isActive: true },
      include: {
        materials: {
          include: {
            material: true
          }
        }
      },
      orderBy: { name: 'asc' },
    }),
  ]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-8">Yeni Fiyat Teklifi</h1>
      <OfferForm 
        customers={customers} 
        products={products.map(p => ({
            ...p,
            laborCost: Number(p.laborCost),
            overheadCost: Number(p.overheadCost),
            profitMargin: Number(p.profitMargin),
            materials: p.materials.map(m => ({
                ...m,
                quantity: Number(m.quantity),
                waste: Number(m.waste),
                material: {
                    ...m.material,
                    price: Number(m.material.price)
                }
            }))
        }))} 
      />
    </div>
  );
}
