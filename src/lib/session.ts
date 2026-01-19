import { cookies } from 'next/headers';
import { verifyToken } from './auth';
import { prisma } from './prisma';

type SessionPayload = {
  userId: string;
  email: string;
  role: string;
  tenantId?: string;
  tenantName?: string;
};

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) return null;

  const payload = verifyToken(token) as SessionPayload | null;
  if (!payload) return null;

  if (!payload.tenantId && payload.userId) {
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { tenant: true },
    });

    if (user?.tenantId) {
      const enhanced: SessionPayload = {
        ...payload,
        tenantId: user.tenantId,
        tenantName: user.tenant?.name,
      };
      return enhanced;
    }
  }

  return payload;
}
