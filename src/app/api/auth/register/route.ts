import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { z } from 'zod';

const registerSchema = z.object({
  companyFullName: z.string().min(1, "Firma ünvanı gerekli"),
  companyShortName: z.string().min(1, "Firma kısa ismi gerekli"),
  companyAddress: z.string().min(1, "Adres gerekli"),
  taxOffice: z.string().min(1, "Vergi dairesi gerekli"),
  taxNumber: z.string().min(1, "Vergi numarası gerekli"),
  companyPhone: z.string().min(1, "Telefon gerekli"),
  authPersonName: z.string().min(1, "Yetkili adı gerekli"),
  authPersonMobile: z.string().min(1, "Yetkili mobil gerekli"),
  email: z.string().email("Geçerli bir mail adresi giriniz"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalı"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Geçersiz veri', details: result.error.format() },
        { status: 400 }
      );
    }

    const {
      companyFullName,
      companyShortName,
      companyAddress,
      taxOffice,
      taxNumber,
      companyPhone,
      authPersonName,
      authPersonMobile,
      email,
      password,
    } = result.data;

    // Check if shortName exists
    const existingTenant = await prisma.tenant.findUnique({
      where: { shortName: companyShortName },
    });

    if (existingTenant) {
      return NextResponse.json(
        { error: 'Bu firma kısa ismi zaten kullanılıyor.' },
        { status: 409 }
      );
    }

    // Check if email exists (globally for safety, though schema allows per tenant, 
    // for a new company registration, the admin email should probably be unique to avoid confusion)
    // Actually, let's check if this email is already an admin for another company? 
    // Simplify: Check if email exists at all.
    const existingUser = await prisma.user.findFirst({
        where: { email: email }
    });
    
    if (existingUser) {
        // If user exists, we might block or allow. For now, block to keep it simple.
         return NextResponse.json(
            { error: 'Bu mail adresi zaten kayıtlı.' },
            { status: 409 }
          );
    }

    const hashedPassword = await hashPassword(password);

    // Transaction to create Tenant and User
    const newTenant = await prisma.tenant.create({
      data: {
        name: companyFullName,
        shortName: companyShortName,
        address: companyAddress,
        taxOffice: taxOffice,
        taxNumber: taxNumber,
        phone: companyPhone,
        authPersonName: authPersonName,
        authPersonMobile: authPersonMobile,
        email: email, // Using admin email as company email for now
        users: {
          create: {
            email: email,
            password: hashedPassword,
            role: 'COMPANY_ADMIN',
          },
        },
      },
    });

    return NextResponse.json(
      { message: 'Kayıt başarılı', tenantId: newTenant.id },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration Error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası oluştu' },
      { status: 500 }
    );
  }
}
