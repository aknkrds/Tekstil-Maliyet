import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';

export default async function OffersPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const offers = await prisma.offer.findMany({
    where: { tenantId: session.tenantId },
    include: {
      customer: true,
      items: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">Teklifler</h1>
          <p className="mt-2 text-sm text-gray-700">
            Hazırlanan fiyat teklifleri.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <Link
            href="/dashboard/offers/create"
            className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Yeni Teklif Oluştur
          </Link>
        </div>
      </div>
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table className="min-w-full divide-y divide-gray-300">
              <thead>
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                    Teklif Kodu
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Müşteri
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Durum
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Toplam Tutar
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Tarih
                  </th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                    <span className="sr-only">Detay</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {offers.map((offer) => (
                  <tr key={offer.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                      {offer.code}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{offer.customer.name}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                        offer.status === 'DRAFT' ? 'bg-gray-50 text-gray-600 ring-gray-500/10' :
                        offer.status === 'SENT' ? 'bg-blue-50 text-blue-700 ring-blue-700/10' :
                        offer.status === 'ACCEPTED' ? 'bg-green-50 text-green-700 ring-green-600/20' :
                        'bg-red-50 text-red-700 ring-red-600/10'
                      }`}>
                        {offer.status === 'DRAFT' ? 'Taslak' :
                         offer.status === 'SENT' ? 'Gönderildi' :
                         offer.status === 'ACCEPTED' ? 'Onaylandı' : 'Reddedildi'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm font-bold text-gray-900">
                      {Number(offer.totalAmount).toFixed(2)} {offer.currency}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {new Date(offer.createdAt).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                      <a href="#" className="text-indigo-600 hover:text-indigo-900">
                        Görüntüle
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
