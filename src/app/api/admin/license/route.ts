import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { randomUUID } from 'crypto';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    // In a real app, check if session.role === 'SUPER_ADMIN'
    // For now, allow any logged in user to test (or restrict to ADMIN role)
    if (!session) {
      return NextResponse.json({ error: 'Yetkisiz işlem' }, { status: 401 });
    }

    const { type } = await req.json();

    const key = randomUUID(); // Simple UUID as key

    const license = await prisma.license.create({
      data: {
        key,
        type: type || 'MONTHLY',
        status: 'CREATED',
      },
    });

    return NextResponse.json(license);
  } catch (error) {
    return NextResponse.json({ error: 'Hata' }, { status: 500 });
  }
}
