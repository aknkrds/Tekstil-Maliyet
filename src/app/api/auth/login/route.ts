import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { comparePassword, generateToken } from '@/lib/auth';
import { z } from 'zod';
import { cookies } from 'next/headers';

const loginSchema = z.object({
  email: z.string().email(),
  companyShortName: z.string().min(1),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Eksik bilgi' }, { status: 400 });
    }

    const { email, companyShortName, password } = result.data;

    // 1. Find Tenant
    const tenant = await prisma.tenant.findUnique({
      where: { shortName: companyShortName },
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Firma bulunamadı' }, { status: 404 });
    }

    // 2. Find User in that Tenant
    const user = await prisma.user.findFirst({
      where: {
        email: email,
        tenantId: tenant.id,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 401 });
    }

    // 3. Verify Password
    const isValid = await comparePassword(password, user.password);

    if (!isValid) {
      return NextResponse.json({ error: 'Hatalı şifre' }, { status: 401 });
    }

    // 4. Generate Token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      tenantId: tenant.id,
      tenantName: tenant.name,
    });

    // 5. Set Cookie
    (await cookies()).set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
    });

    return NextResponse.json({
      message: 'Giriş başarılı',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        tenantId: tenant.id,
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
