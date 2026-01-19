import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import LicenseSection from './_components/LicenseSection';
import InfoModal from './_components/InfoModal';

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) redirect('/login');

  if (session.role === 'SUPER_ADMIN') {
    redirect('/admin');
  }

  const tenantId = session.tenantId;

  const [
    tenant,
    customersCount,
    productsCount,
    ordersCount,
    supplyOrdersCount,
    recentCustomers,
    recentProducts,
    recentOrders,
    recentSupplyOrders,
    deadlineOrders,
  ] = await Promise.all([
    prisma.tenant.findUnique({ where: { id: tenantId } }),
    prisma.customer.count({ where: { tenantId } }),
    prisma.product.count({ where: { tenantId } }),
    prisma.order.count({ where: { tenantId } }),
    prisma.supplyOrder.count({ where: { tenantId } }),
    prisma.customer.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.product.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.order.findMany({
      where: { tenantId },
      include: { customer: true, product: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.supplyOrder.findMany({
      where: { tenantId },
      include: { supplier: true, material: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.order.findMany({
      where: { 
        tenantId,
        status: { notIn: ['TESLIM_EDILDI', 'IPTAL'] },
        deletedAt: null,
        deadlineDate: { not: null }
      },
      include: { customer: true, product: true },
      orderBy: { deadlineDate: 'asc' },
      take: 10,
    }),
  ]);

  if (!tenant) return <div>Firma bulunamadı.</div>;

  const getOrderRowStyle = (status: string) => {
    switch (status) {
      case 'IPTAL': return 'bg-red-50 text-red-700';
      case 'TEKLIF_OLUSTURULDU': return 'bg-blue-50 text-blue-700';
      case 'TEKLIF_KABUL_EDILDI': return 'bg-green-50 text-green-700';
      case 'URETIM_YAPILDI': return 'bg-green-50 text-green-700';
      default: return '';
    }
  };

  const stats = [
    { name: 'Toplam Müşteri Sayısı', stat: customersCount, color: 'bg-sky-500' },
    { name: 'Toplam Ürün Sayısı', stat: productsCount, color: 'bg-blue-500' },
    { name: 'Toplam Sipariş Sayısı', stat: ordersCount, color: 'bg-indigo-500' },
    { name: 'Toplam Tedarik Kaydı', stat: supplyOrdersCount, color: 'bg-amber-500' },
  ];

  return (
    <div className="space-y-8">
      <InfoModal />
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Panel - {tenant.name}
          </h2>
        </div>
      </div>

      <div>
        <h3 className="text-base font-semibold leading-6 text-gray-900">Genel Durum</h3>
        <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((item) => (
            <div
              key={item.name}
              className="relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:px-6 sm:pt-6"
            >
              <dt>
                <div className={`absolute rounded-md p-3 ${item.color}`}>
                  <svg
                    className="h-6 w-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
                    />
                  </svg>
                </div>
                <p className="ml-16 truncate text-sm font-medium text-gray-500">{item.name}</p>
              </dt>
              <dd className="ml-16 flex items-baseline pb-1 sm:pb-7">
                <p className="text-2xl font-semibold text-gray-900">{item.stat}</p>
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <LicenseSection tenant={tenant} />

        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-base font-semibold leading-6 text-gray-900">Firma Bilgileri</h3>
            <div className="mt-2 text-sm text-gray-500 space-y-1">
              <p>
                <span className="font-medium">Yetkili:</span> {tenant.authPersonName}
              </p>
              <p>
                <span className="font-medium">Email:</span> {tenant.email}
              </p>
              <p>
                <span className="font-medium">Telefon:</span> {tenant.phone}
              </p>
              <p>
                <span className="font-medium">Vergi No:</span> {tenant.taxNumber}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-base font-semibold leading-6 text-gray-900">Son Müşteriler</h3>
            <div className="mt-4 overflow-x-auto">
              {recentCustomers.length === 0 ? (
                <p className="text-sm text-gray-500">Bu firma için henüz müşteri kaydı yok.</p>
              ) : (
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Firma</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Telefon</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentCustomers.map((c) => (
                      <tr key={c.id} className="border-t border-slate-100">
                        <td className="px-3 py-2 text-xs text-gray-800">{c.name}</td>
                        <td className="px-3 py-2 text-xs text-gray-600">{c.phone || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-base font-semibold leading-6 text-gray-900">Son Ürünler</h3>
            <div className="mt-4 overflow-x-auto">
              {recentProducts.length === 0 ? (
                <p className="text-sm text-gray-500">Bu firma için henüz ürün kaydı yok.</p>
              ) : (
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Ürün</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Kod</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentProducts.map((p) => (
                      <tr key={p.id} className="border-t border-slate-100">
                        <td className="px-3 py-2 text-xs text-gray-800">{p.name}</td>
                        <td className="px-3 py-2 text-xs text-gray-600">{p.code || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-base font-semibold leading-6 text-gray-900">Son Siparişler</h3>
            <div className="mt-4 overflow-x-auto">
              {recentOrders.length === 0 ? (
                <p className="text-sm text-gray-500">Bu firma için henüz sipariş kaydı yok.</p>
              ) : (
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Sipariş No</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Müşteri</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Ürün</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((o) => (
                      <tr key={o.id} className={`border-t border-slate-100 ${getOrderRowStyle(o.status)}`}>
                        <td className="px-3 py-2 text-xs text-gray-800">{o.orderNumber}</td>
                        <td className="px-3 py-2 text-xs text-gray-600">{o.customer?.name || '-'}</td>
                        <td className="px-3 py-2 text-xs text-gray-600">
                          {o.product?.code || o.product?.name || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-base font-semibold leading-6 text-gray-900">Son Tedarik Siparişleri</h3>
            <div className="mt-4 overflow-x-auto">
              {recentSupplyOrders.length === 0 ? (
                <p className="text-sm text-gray-500">Bu firma için henüz tedarik siparişi kaydı yok.</p>
              ) : (
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Tedarikçi</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Ürün</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Miktar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentSupplyOrders.map((s) => (
                      <tr key={s.id} className="border-t border-slate-100">
                        <td className="px-3 py-2 text-xs text-gray-800">{s.supplier?.name || '-'}</td>
                        <td className="px-3 py-2 text-xs text-gray-600">{s.material?.name || '-'}</td>
                        <td className="px-3 py-2 text-xs text-gray-600">
                          {Number(s.quantity)} {s.unit}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-base font-semibold leading-6 text-gray-900">Yaklaşan Teslimatlar (Termin Listesi)</h3>
          <div className="mt-4 overflow-x-auto">
            {deadlineOrders.length === 0 ? (
              <p className="text-sm text-gray-500">Yaklaşan teslimat bulunmamaktadır.</p>
            ) : (
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Sipariş No</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Müşteri</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Ürün</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Termin</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Kalan Süre</th>
                  </tr>
                </thead>
                <tbody>
                  {deadlineOrders.map((o) => {
                    const deadline = new Date(o.deadlineDate!);
                    const now = new Date();
                    const diffTime = deadline.getTime() - now.getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    const isUrgent = diffDays <= 3 && diffDays >= 0;
                    const isOverdue = diffDays < 0;
                    
                    return (
                      <tr key={o.id} className={`border-t border-slate-100 ${isUrgent ? 'bg-yellow-100' : ''} ${isOverdue ? 'bg-red-50' : ''}`}>
                        <td className="px-3 py-2 text-xs text-gray-800">{o.orderNumber}</td>
                        <td className="px-3 py-2 text-xs text-gray-600">{o.customer?.name || '-'}</td>
                        <td className="px-3 py-2 text-xs text-gray-600">{o.product?.code || o.product?.name || '-'}</td>
                        <td className="px-3 py-2 text-xs text-gray-600">{deadline.toLocaleDateString('tr-TR')}</td>
                        <td className={`px-3 py-2 text-xs font-medium ${isUrgent || isOverdue ? 'text-red-600' : 'text-gray-600'}`}>
                          {diffDays < 0 ? 'Gecikmiş' : `${diffDays} gün`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
