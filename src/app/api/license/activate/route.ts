import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { licenseKey } = await req.json();

    if (!licenseKey) {
      return NextResponse.json({ error: 'Lisans anahtarı gereklidir.' }, { status: 400 });
    }

    // 1. Find the license
    const license = await prisma.license.findUnique({
      where: { key: licenseKey },
    });

    if (!license) {
      return NextResponse.json({ error: 'Geçersiz lisans anahtarı.' }, { status: 404 });
    }

    if (license.status !== 'CREATED') {
      return NextResponse.json({ error: 'Bu lisans anahtarı daha önce kullanılmış.' }, { status: 400 });
    }

    // 2. Calculate new subscription end date
    const tenant = await prisma.tenant.findUnique({
      where: { id: session.tenantId },
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Firma bulunamadı.' }, { status: 404 });
    }

    let currentEndDate = tenant.subscriptionEndDate ? new Date(tenant.subscriptionEndDate) : new Date();
    if (currentEndDate < new Date()) {
      currentEndDate = new Date();
    }

    const durationDays = license.type === 'MONTHLY' ? 30 : 365;
    const newEndDate = new Date(currentEndDate);
    newEndDate.setDate(newEndDate.getDate() + durationDays);

    // 3. Update License and Tenant in a transaction
    await prisma.$transaction([
      prisma.license.update({
        where: { id: license.id },
        data: {
          status: 'USED',
          usedByTenantId: session.tenantId,
          activatedAt: new Date(),
          expiresAt: newEndDate,
        },
      }),
      prisma.tenant.update({
        where: { id: session.tenantId },
        data: {
          isActive: true,
          subscriptionEndDate: newEndDate,
        },
      }),
    ]);

    return NextResponse.json({ 
      success: true, 
      newEndDate: newEndDate.toISOString() 
    });

  } catch (error) {
    console.error('License activation error:', error);
    return NextResponse.json({ error: 'Lisans aktivasyonu sırasında bir hata oluştu.' }, { status: 500 });
  }
}
