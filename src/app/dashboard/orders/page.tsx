import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import OrdersPageClient from './OrdersPageClient';

export default async function OrdersPage() {
    const session = await getSession();
    if (!session) redirect('/login');
    
    const [customers, products] = await Promise.all([
        prisma.customer.findMany({
            where: { tenantId: session.tenantId },
            orderBy: { name: 'asc' }
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
            orderBy: { name: 'asc' }
        })
    ]);
    
    return (
        <OrdersPageClient 
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
    );
}
