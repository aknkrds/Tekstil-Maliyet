'use server';

import { prisma } from './prisma';

export async function ensureTenantActive(tenantId: string) {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { subscriptionEndDate: true },
  });

  if (!tenant || !tenant.subscriptionEndDate) {
    throw new Error('LICENSE_INACTIVE');
  }

  const endDate = new Date(tenant.subscriptionEndDate);
  if (endDate <= new Date()) {
    throw new Error('LICENSE_EXPIRED');
  }
}

