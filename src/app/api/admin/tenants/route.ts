import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function GET(req: Request) {
  const session = await getSession();
  if (!session || session.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Yetkisiz işlem' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (id) {
    const tenant = await prisma.tenant.findUnique({
      where: { id },
      include: {
        users: true,
      },
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Kayıt bulunamadı' }, { status: 404 });
    }

    return NextResponse.json(tenant);
  }

  const tenants = await prisma.tenant.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      users: {
        where: { role: 'COMPANY_ADMIN' },
        take: 1,
      },
    },
  });

  return NextResponse.json(
    tenants.map((t: any) => ({
      id: t.id,
      name: t.name,
      shortName: t.shortName,
      email: t.email,
      createdAt: t.createdAt,
      subscriptionEndDate: t.subscriptionEndDate,
      adminEmail: t.users[0]?.email || null,
    }))
  );
}

export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session || session.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Yetkisiz işlem' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID gerekli' }, { status: 400 });
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.offerItem.deleteMany({
        where: {
          offer: {
            tenantId: id,
          },
        },
      });

      await tx.offer.deleteMany({
        where: { tenantId: id },
      });

      await tx.order.deleteMany({
        where: { tenantId: id },
      });

      await tx.productMaterial.deleteMany({
        where: {
          product: {
            tenantId: id,
          },
        },
      });

      await tx.product.deleteMany({
        where: { tenantId: id },
      });

      await tx.supplyOrder.deleteMany({
        where: { tenantId: id },
      });

      await tx.material.deleteMany({
        where: { tenantId: id },
      });

      await tx.supplier.deleteMany({
        where: { tenantId: id },
      });

      await tx.customer.deleteMany({
        where: { tenantId: id },
      });

      await tx.user.deleteMany({
        where: { tenantId: id },
      });

      await tx.license.updateMany({
        where: { usedByTenantId: id },
        data: {
          usedByTenantId: null,
          status: 'CREATED',
          activatedAt: null,
          expiresAt: null,
        },
      });

      await tx.tenant.delete({
        where: { id },
      });
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Silme sırasında hata oluştu' }, { status: 500 });
  }
}
