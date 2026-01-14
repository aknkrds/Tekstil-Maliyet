import { cookies } from 'next/headers';
import { verifyToken } from './auth';

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) return null;

  const payload = verifyToken(token);
  return payload as any; // Type this properly if possible
}
