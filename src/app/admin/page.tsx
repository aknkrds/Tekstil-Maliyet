import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import AdminDashboard from './AdminDashboard';

export default async function AdminPage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  if (session.role !== 'SUPER_ADMIN') {
    redirect('/dashboard');
  }

  return <AdminDashboard />;
}

