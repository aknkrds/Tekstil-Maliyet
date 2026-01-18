import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await getSession();
  if (!session || !session.tenantId) {
    return NextResponse.json(
      { isActive: false, isLocked: true },
      { status: 401 }
    );
  }

  const tenant = await prisma.tenant.findUnique({
    where: { id: session.tenantId },
    select: {
      subscriptionEndDate: true,
    },
  });

  if (!tenant || !tenant.subscriptionEndDate) {
    return NextResponse.json(
      {
        isActive: false,
        isLocked: true,
        subscriptionEndDate: null,
      },
      { status: 200 }
    );
  }

  const endDate = new Date(tenant.subscriptionEndDate);
  const isActive = endDate > new Date();

  return NextResponse.json({
    isActive,
    isLocked: !isActive,
    subscriptionEndDate: tenant.subscriptionEndDate,
  });
}

