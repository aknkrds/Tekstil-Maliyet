import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import OrdersPageClient from './OrdersPageClient';

export default async function OrdersPage() {
    const session = await getSession();
    if (!session) redirect('/login');
    
    const customers = await prisma.customer.findMany({
        where: { tenantId: session.tenantId },
        orderBy: { name: 'asc' }
    });
    
    return <OrdersPageClient customers={customers} />;
}
