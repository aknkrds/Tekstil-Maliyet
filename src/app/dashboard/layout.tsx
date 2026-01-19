import Link from 'next/link';
import SupportBubble from './_components/SupportBubble';
import LogoutButton from './_components/LogoutButton';
import AutoLogout from './_components/AutoLogout';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  ShoppingCart, 
  Truck, 
  Settings, 
  Plus 
} from 'lucide-react';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  
  // Default values if session/tenant fetch fails (shouldn't happen in protected route)
  let tenantName = 'Symi Tekstil';
  let licenseDate = new Date();
  let adminName = 'Admin';

  if (session && session.tenantId) {
    const tenant = await prisma.tenant.findUnique({
      where: { id: session.tenantId },
      select: { name: true, subscriptionEndDate: true }
    });
    
    if (tenant) {
      tenantName = tenant.name;
      if (tenant.subscriptionEndDate) {
        licenseDate = new Date(tenant.subscriptionEndDate);
      }
    }

    if (session.email) {
      adminName = session.email.split('@')[0];
    }
  }

  const isExpired = licenseDate < new Date();
  const formattedDate = licenseDate.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="min-h-screen flex flex-col bg-sky-50">
      <SupportBubble />
      <AutoLogout />
      <header className="shadow-md">
        <div className="bg-sky-200 border-b border-orange-400">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  className="h-12 w-auto"
                  src="/symi.png"
                  alt="Symi"
                />
                <span className="text-lg font-bold text-orange-700">
                  Symi Tekstil Maliyet ve Sipariş Takip
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-700">
                <span className="font-semibold text-indigo-700">{tenantName}</span>
                <span className="hidden sm:inline text-gray-400">|</span>
                <span className={isExpired ? 'text-red-600 font-bold' : 'text-emerald-600 font-medium'}>
                  Lisans: {formattedDate}
                </span>
                <span className="hidden sm:inline text-gray-400">|</span>
                <span className="font-medium mr-2">Merhaba {adminName}</span>
                <LogoutButton />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <nav className="flex h-14 items-center gap-4 text-sm font-medium text-white overflow-x-auto">
              <Link 
                href="/dashboard/customers?new=true" 
                className="group flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-200 border border-white/10 whitespace-nowrap"
              >
                <div className="bg-sky-500 rounded-full p-1 group-hover:scale-110 transition-transform">
                  <Plus className="h-3 w-3 text-white" />
                </div>
                <span>Yeni Firma Ekle</span>
              </Link>

              <Link 
                href="/dashboard/products/create" 
                className="group flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-200 border border-white/10 whitespace-nowrap"
              >
                <div className="bg-emerald-500 rounded-full p-1 group-hover:scale-110 transition-transform">
                  <Plus className="h-3 w-3 text-white" />
                </div>
                <span>Yeni Ürün Ekle</span>
              </Link>

              <Link 
                href="/dashboard/orders?new=true" 
                className="group flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-200 border border-white/10 whitespace-nowrap"
              >
                <div className="bg-indigo-500 rounded-full p-1 group-hover:scale-110 transition-transform">
                  <Plus className="h-3 w-3 text-white" />
                </div>
                <span>Yeni Sipariş Oluştur</span>
              </Link>
              
              <Link 
                href="/dashboard/supplies?new=order" 
                className="group flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-200 border border-white/10 whitespace-nowrap"
              >
                <div className="bg-amber-500 rounded-full p-1 group-hover:scale-110 transition-transform">
                  <Plus className="h-3 w-3 text-white" />
                </div>
                <span>Yeni Tedarik Siparişi</span>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="hidden md:flex w-14 flex-col items-center gap-4 border-r border-slate-200 bg-sky-100 pt-6 z-40 relative">
          <Link href="/dashboard" className="group relative flex h-10 w-10 items-center justify-center rounded-md bg-orange-500 text-white text-sm font-semibold shadow-sm hover:scale-105 transition-all">
            DB
            <span className="absolute left-full ml-2 hidden whitespace-nowrap rounded bg-slate-800 px-2 py-1 text-xs text-white shadow-lg group-hover:block z-50">
              Dashboard
            </span>
          </Link>
          <Link href="/dashboard/customers" className="group relative flex h-10 w-10 items-center justify-center rounded-md bg-sky-500 text-white text-sm font-semibold shadow-sm hover:scale-105 transition-all">
            M
            <span className="absolute left-full ml-2 hidden whitespace-nowrap rounded bg-slate-800 px-2 py-1 text-xs text-white shadow-lg group-hover:block z-50">
              Müşteriler
            </span>
          </Link>
          <Link href="/dashboard/products" className="group relative flex h-10 w-10 items-center justify-center rounded-md bg-emerald-500 text-white text-sm font-semibold shadow-sm hover:scale-105 transition-all">
            Ü
            <span className="absolute left-full ml-2 hidden whitespace-nowrap rounded bg-slate-800 px-2 py-1 text-xs text-white shadow-lg group-hover:block z-50">
              Ürünler
            </span>
          </Link>
          <Link href="/dashboard/orders" className="group relative flex h-10 w-10 items-center justify-center rounded-md bg-indigo-500 text-white text-sm font-semibold shadow-sm hover:scale-105 transition-all">
            S
            <span className="absolute left-full ml-2 hidden whitespace-nowrap rounded bg-slate-800 px-2 py-1 text-xs text-white shadow-lg group-hover:block z-50">
              Siparişler
            </span>
          </Link>
          <Link href="/dashboard/supplies" className="group relative flex h-10 w-10 items-center justify-center rounded-md bg-amber-500 text-white text-sm font-semibold shadow-sm hover:scale-105 transition-all">
            T
            <span className="absolute left-full ml-2 hidden whitespace-nowrap rounded bg-slate-800 px-2 py-1 text-xs text-white shadow-lg group-hover:block z-50">
              Tedarik
            </span>
          </Link>
          <Link href="/dashboard/settings" className="group relative flex h-10 w-10 items-center justify-center rounded-md bg-slate-500 text-white text-sm font-semibold shadow-sm hover:scale-105 transition-all">
            A
            <span className="absolute left-full ml-2 hidden whitespace-nowrap rounded bg-slate-800 px-2 py-1 text-xs text-white shadow-lg group-hover:block z-50">
              Ayarlar
            </span>
          </Link>
        </aside>

        <main className="flex-1 py-6">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>

        <aside className="hidden lg:block w-56 border-l border-slate-200 bg-white py-6 px-4 space-y-3">
          <div className="rounded-md bg-emerald-500 text-white p-3">
            <div className="text-xs">Satış</div>
            <div className="text-lg font-bold">0 ₺</div>
          </div>
          <div className="rounded-md bg-sky-500 text-white p-3">
            <div className="text-xs">Teklif</div>
            <div className="text-lg font-bold">0 ₺</div>
          </div>
          <div className="rounded-md bg-amber-400 text-white p-3">
            <div className="text-xs">Yeni Müşteri</div>
            <div className="text-lg font-bold">0</div>
          </div>
          <div className="rounded-md bg-rose-500 text-white p-3">
            <div className="text-xs">Görüşme</div>
            <div className="text-lg font-bold">0</div>
          </div>
        </aside>
      </div>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-3 text-[11px] text-gray-500 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col sm:flex-row gap-1 sm:gap-4">
            <span>Lisans hakkı ve fikri mülkiyeti Symi Tekstil Bilişim ve Software Ltd.'ye aittir.</span>
            <span className="hidden sm:inline">|</span>
            <a href="https://www.symi.com.tr" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600">www.symi.com.tr</a>
            <span className="hidden sm:inline">|</span>
            <a href="mailto:info@symi.com.tr" className="hover:text-indigo-600">info@symi.com.tr</a>
          </div>
          <span>Telefon: +90 533 732 89 83</span>
        </div>
      </footer>
    </div>
  );
}
