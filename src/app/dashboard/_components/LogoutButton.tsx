'use client';

import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-1 rounded bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-500 transition-colors"
      title="Güvenli Çıkış"
    >
      <LogOut className="h-3 w-3" />
      <span>Çıkış</span>
    </button>
  );
}
