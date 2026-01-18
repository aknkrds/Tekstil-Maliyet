import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { comparePassword, generateToken, hashPassword } from '@/lib/auth';
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

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminCompany = process.env.ADMIN_COMPANY_SHORT_NAME;

    if (adminEmail && adminPassword && adminCompany && companyShortName === adminCompany && email === adminEmail) {
      if (password !== adminPassword) {
        return NextResponse.json({ error: 'Hatalı şifre' }, { status: 401 });
      }

      let adminUser = await prisma.user.findFirst({
        where: {
          email: adminEmail,
          role: 'SUPER_ADMIN',
          tenantId: null,
        },
      });

      if (!adminUser) {
        const hashed = await hashPassword(adminPassword);
        adminUser = await prisma.user.create({
          data: {
            email: adminEmail,
            password: hashed,
            role: 'SUPER_ADMIN',
          },
        });
      }

      const token = generateToken({
        userId: adminUser.id,
        email: adminUser.email,
        role: adminUser.role,
      });

      (await cookies()).set('token', token, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24,
        path: '/',
      });

      return NextResponse.json({
        message: 'Giriş başarılı',
        user: {
          id: adminUser.id,
          email: adminUser.email,
          role: adminUser.role,
        },
      });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { shortName: companyShortName },
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Firma bulunamadı' }, { status: 404 });
    }

    const user = await prisma.user.findFirst({
      where: {
        email: email,
        tenantId: tenant.id,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 401 });
    }

    const isValid = await comparePassword(password, user.password);

    if (!isValid) {
      return NextResponse.json({ error: 'Hatalı şifre' }, { status: 401 });
    }

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
      secure: false, // Yerel ağda (HTTP) çalışabilmesi için false yapıldı (SSL yoksa secure cookie çalışmaz)
      sameSite: 'lax',
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
