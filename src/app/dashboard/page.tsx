import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import LicenseSection from './_components/LicenseSection';
import UserManagement from './_components/UserManagement';

export default async function DashboardPage() {
  const session = await getSession();
  
  if (!session) redirect('/login');

  if (session.role === 'SUPER_ADMIN') {
    redirect('/admin');
  }

  const tenantId = session.tenantId;

  // Fetch all required data in parallel
  const [
    tenant,
    productsCount,
    offersCount,
    acceptedOffers
  ] = await Promise.all([
    prisma.tenant.findUnique({ where: { id: tenantId } }),
    prisma.product.count({ where: { tenantId } }),
    prisma.offer.count({ where: { tenantId } }),
    prisma.offer.findMany({
      where: { tenantId, status: 'ACCEPTED' },
      include: {
        items: {
          include: {
            product: {
              include: {
                materials: {
                  include: { material: true }
                }
              }
            }
          }
        }
      }
    })
  ]);

  if (!tenant) return <div>Firma bulunamadı.</div>;

  // Calculate Financial Stats
  let totalSales = 0;
  let totalCost = 0;

  acceptedOffers.forEach(offer => {
    totalSales += Number(offer.totalAmount);
    
    offer.items.forEach(item => {
        const product = item.product;
        const labor = Number(product.laborCost);
        const overhead = Number(product.overheadCost);
        
        // Calculate material cost for one unit of product
        let materialCost = 0;
        product.materials.forEach(pm => {
            materialCost += Number(pm.quantity) * Number(pm.material.price);
        });

        // Unit cost of the product
        const unitCost = labor + overhead + materialCost;
        
        // Total cost for this item line
        totalCost += Number(item.quantity) * unitCost;
    });
  });

  const totalProfit = totalSales - totalCost;

  const stats = [
    { name: 'Toplam Ürün Sayısı', stat: productsCount, color: 'bg-blue-500' },
    { name: 'Verilen Teklif Sayısı', stat: offersCount, color: 'bg-indigo-500' },
    { name: 'Kabul Edilen Teklifler', stat: acceptedOffers.length, color: 'bg-green-500' },
    { name: 'Toplam Maliyet (Tedarik + Masraf)', stat: `${totalCost.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TRY`, color: 'bg-orange-500' },
    { name: 'Toplam Satış Tutarı', stat: `${totalSales.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TRY`, color: 'bg-teal-500' },
    { name: 'Toplam Kar / Zarar', stat: `${totalProfit.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TRY`, color: totalProfit >= 0 ? 'bg-emerald-600' : 'bg-red-600' },
  ];

  return (
    <div className="space-y-8">
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Panel - {tenant.name}
          </h2>
        </div>
      </div>

      {/* Stats Grid */}
      <div>
        <h3 className="text-base font-semibold leading-6 text-gray-900">Genel Durum</h3>
        <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((item) => (
            <div
              key={item.name}
              className="relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:px-6 sm:pt-6"
            >
              <dt>
                <div className={`absolute rounded-md p-3 ${item.color}`}>
                  {/* Icon placeholder if needed */}
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
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
        {/* License Section */}
        <LicenseSection tenant={tenant} />
        
        {/* Company Info (Simplified) */}
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-base font-semibold leading-6 text-gray-900">Firma Bilgileri</h3>
            <div className="mt-2 text-sm text-gray-500">
              <p><span className="font-medium">Yetkili:</span> {tenant.authPersonName}</p>
              <p><span className="font-medium">Email:</span> {tenant.email}</p>
              <p><span className="font-medium">Telefon:</span> {tenant.phone}</p>
              <p><span className="font-medium">Vergi No:</span> {tenant.taxNumber}</p>
            </div>
          </div>
        </div>
      </div>

      {/* User Management */}
      <UserManagement />

    </div>
  );
}
