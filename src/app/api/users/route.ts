import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { ensureTenantActive } from '@/lib/license';

const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['USER', 'COMPANY_ADMIN']),
});

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const users = await prisma.user.findMany({
    where: { tenantId: session.tenantId },
    select: {
      id: true,
      email: true,
      role: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(users);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Only COMPANY_ADMIN or SUPER_ADMIN can add users
  const currentUser = await prisma.user.findUnique({
    where: { id: session.userId },
  });

  if (currentUser?.role !== 'COMPANY_ADMIN' && currentUser?.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Yetkiniz yok.' }, { status: 403 });
  }

  try {
    if (session.tenantId) {
      try {
        await ensureTenantActive(session.tenantId || '');
      } catch {
        return NextResponse.json({ error: 'Lisans süreniz dolmuştur.' }, { status: 403 });
      }
    }
    const body = await req.json();
    const result = userSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.format() }, { status: 400 });
    }

    const { email, password, role } = result.data;

    // Check if user already exists in this tenant
    const existingUser = await prisma.user.findUnique({
      where: {
        email_tenantId: {
          email,
          tenantId: session.tenantId,
        },
      },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Bu e-posta adresi ile kullanıcı zaten mevcut.' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
        tenantId: session.tenantId,
      },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(newUser);

  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json({ error: 'Kullanıcı oluşturulurken hata oluştu.' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    if (session.tenantId) {
      try {
        await ensureTenantActive(session.tenantId || '');
      } catch {
        return NextResponse.json({ error: 'Lisans süreniz dolmuştur.' }, { status: 403 });
      }
    }
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID gerekli.' }, { status: 400 });

    // Check permissions
    const currentUser = await prisma.user.findUnique({ where: { id: session.userId } });
    if (currentUser?.role !== 'COMPANY_ADMIN' && currentUser?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Yetkiniz yok.' }, { status: 403 });
    }

    // Prevent deleting self
    if (id === session.userId) {
      return NextResponse.json({ error: 'Kendinizi silemezsiniz.' }, { status: 400 });
    }

    // Ensure user belongs to tenant
    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser || targetUser.tenantId !== session.tenantId) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı.' }, { status: 404 });
    }

    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json({ error: 'Silme işlemi başarısız.' }, { status: 500 });
  }
}
