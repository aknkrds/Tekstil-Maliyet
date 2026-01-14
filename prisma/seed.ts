import { prisma } from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

// const prisma = new PrismaClient(); // Removed

async function main() {
  const password = await bcrypt.hash('DorukNaz2010', 10);

  // Create Admin Tenant
  const tenant = await prisma.tenant.upsert({
    where: { shortName: 'symi' },
    update: {},
    create: {
      name: 'Symi System',
      shortName: 'symi',
      address: 'System Address',
      taxOffice: 'System',
      taxNumber: '0000000000',
      phone: '0000000000',
      authPersonName: 'System Admin',
      authPersonMobile: '0000000000',
      email: 'admin@symi.com',
      isActive: true,
      subscriptionEndDate: new Date('2099-12-31'),
    },
  });

  // Create Admin User
  const user = await prisma.user.upsert({
    where: {
      email_tenantId: {
        email: 'aknkrds@hotmail.com',
        tenantId: tenant.id,
      },
    },
    update: {
      password: password,
      role: 'SUPER_ADMIN',
    },
    create: {
      email: 'aknkrds@hotmail.com',
      password: password,
      role: 'SUPER_ADMIN',
      tenantId: tenant.id,
    },
  });

  console.log({ tenant, user });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
