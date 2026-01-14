import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';

export default async function ProductsPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const products = await prisma.product.findMany({
    where: { tenantId: session.tenantId },
    include: {
      materials: {
        include: {
          material: true
        }
      }
    },
    orderBy: { createdAt: 'desc' },
  });

  const calculateCost = (product: any) => {
    let materialCost = 0;
    product.materials.forEach((pm: any) => {
      const quantity = Number(pm.quantity);
      const waste = Number(pm.waste);
      const price = Number(pm.material.price);
      // Usage = quantity * (1 + waste/100)
      const usage = quantity * (1 + waste / 100);
      materialCost += usage * price;
    });
    
    const labor = Number(product.laborCost);
    const overhead = Number(product.overheadCost);
    const totalCost = materialCost + labor + overhead;
    const profit = Number(product.profitMargin);
    const finalPrice = totalCost * (1 + profit / 100);
    
    return { totalCost, finalPrice };
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">Ürünler ve Maliyetler</h1>
          <p className="mt-2 text-sm text-gray-700">
            Ürünlerin maliyet ve fiyat listesi.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <Link
            href="/dashboard/products/create"
            className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Yeni Ürün Hesapla
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
                    Görsel
                  </th>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                    Ürün Adı
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Kod
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Maliyet
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Satış Fiyatı
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Kar Oranı
                  </th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                    <span className="sr-only">Detay</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.map((product) => {
                  const { totalCost, finalPrice } = calculateCost(product);
                  return (
                    <tr key={product.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-500 sm:pl-0">
                        {product.image1 ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={product.image1}
                            alt={product.name}
                            className="h-12 w-12 rounded object-cover border border-gray-200"
                          />
                        ) : (
                          <span className="text-xs text-gray-400">Yok</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                        {product.name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{product.code || '-'}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{totalCost.toFixed(2)}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm font-bold text-gray-900">{finalPrice.toFixed(2)}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">%{Number(product.profitMargin)}</td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                        <a href="#" className="text-indigo-600 hover:text-indigo-900">
                          Detay
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
