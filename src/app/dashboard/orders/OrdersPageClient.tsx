'use client';

import { useState, useEffect } from 'react';
import OrderForm from './_components/OrderForm';

interface Customer {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  code?: string | null;
  description?: string | null;
}

interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customer?: Customer;
  productId?: string | null;
  product?: Product;
  productType: string;
  fabricType: string;
  deadlineDate?: string | Date | null;
  quantity?: number;
  totalAmount: number;
  currency: string;
  status: string;
  baseAmount?: number | null;
  marginType?: string | null;
  marginValue?: number | null;
  profitAmount?: number | null;
}

interface OrdersPageClientProps {
  customers: Customer[];
  products: Product[];
}

export default function OrdersPageClient({ customers, products }: OrdersPageClientProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);

  const fetchOrders = async (page = 1) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/orders?page=${page}`);
      const data = await res.json();
      setOrders(data.orders || []);
      setPagination(data.pagination || { page: 1, totalPages: 1 });
    } catch (error) {
      console.error('Failed to fetch orders', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(pagination.page);
  }, [pagination.page]);

  const handleEdit = (order: Order) => {
    setEditingOrder(order);
    setViewingOrder(null);
    setIsOrderModalOpen(true);
  };

  const handleCreateOrder = () => {
    setEditingOrder(null);
    setViewingOrder(null);
    setIsOrderModalOpen(true);
  };

  const handleOrderSuccess = () => {
    setIsOrderModalOpen(false);
    fetchOrders(pagination.page);
  };

  const updateStatus = async (id: string, newStatus: string) => {
      try {
          const res = await fetch('/api/orders', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id, status: newStatus })
          });
          if (res.ok) {
              fetchOrders(pagination.page);
          }
      } catch (error) {
          console.error('Status update failed', error);
      }
  };

  const statusLabels: Record<string, string> = {
      'TEKLIF_OLUSTURULDU': 'Teklif Oluşturuldu',
      'TEKLIF_ILETILDI': 'Teklif İletildi',
      'TEKLIF_KABUL_EDILDI': 'Teklif Kabul Edildi',
      'URETIM_YAPILDI': 'Üretim Yapıldı',
      'TESLIMAT_YAPILDI': 'Teslimat Yapıldı',
      'IPTAL': 'İptal'
  };

  const statusColors: Record<string, string> = {
      'TEKLIF_OLUSTURULDU': '',
      'TEKLIF_ILETILDI': 'bg-yellow-50',
      'TEKLIF_KABUL_EDILDI': 'bg-green-50',
      'URETIM_YAPILDI': 'bg-green-50',
      'TESLIMAT_YAPILDI': 'bg-blue-50',
      'IPTAL': 'bg-red-50'
  };

  const getRowClass = (status: string) => {
    return statusColors[status] || '';
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">Siparişler</h1>
          <p className="mt-2 text-sm text-gray-700">
            Sipariş listesi ve yönetimi.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            onClick={handleCreateOrder}
            className="inline-flex rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
          >
            Yeni Sipariş Oluştur
          </button>
        </div>
      </div>

      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table className="min-w-full divide-y divide-gray-300">
              <thead>
                <tr>
                  <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">Sipariş No</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Müşteri</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Ürün Numarası</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Ürün Açıklaması</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Adet</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Termin Tarihi</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Tutar</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Durum</th>
                  <th className="relative py-3.5 pl-3 pr-4 sm:pr-0">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {isLoading ? (
                  <tr><td colSpan={8} className="text-center py-4">Yükleniyor...</td></tr>
                ) : orders.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-4">Kayıt bulunamadı.</td></tr>
                ) : orders.map((order) => (
                  <tr key={order.id} className={getRowClass(order.status)}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">{order.orderNumber}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{order.customer?.name}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {order.product?.code || order.productType}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {order.product?.name || order.fabricType}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {order.quantity || 1}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                        {order.deadlineDate ? new Date(order.deadlineDate).toLocaleDateString('tr-TR') : '-'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                        {Number(order.totalAmount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {order.currency}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <select 
                            value={order.status} 
                            onChange={(e) => updateStatus(order.id, e.target.value)}
                            aria-label="Sipariş durumu"
                            className={`rounded-md border-0 py-1 pl-2 pr-8 text-xs font-semibold ring-1 ring-inset focus:ring-2 focus:ring-indigo-600 sm:leading-6 ${statusColors[order.status] || 'text-gray-700 ring-gray-300'}`}
                        >
                            {Object.entries(statusLabels).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                      <button
                        onClick={() => setViewingOrder(order)}
                        className="text-gray-600 hover:text-gray-900 mr-3"
                      >
                        Görüntüle
                      </button>
                      <button onClick={() => handleEdit(order)} className="text-indigo-600 hover:text-indigo-900">Düzenle</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4">
        <div className="flex flex-1 justify-between sm:justify-end">
          <button
            onClick={() => setPagination(p => ({ ...p, page: Math.max(1, p.page - 1) }))}
            disabled={pagination.page === 1}
            className="relative inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:outline-offset-0 disabled:opacity-50"
          >
            Önceki
          </button>
          <button
            onClick={() => setPagination(p => ({ ...p, page: Math.min(p.totalPages, p.page + 1) }))}
            disabled={pagination.page === pagination.totalPages}
            className="relative ml-3 inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:outline-offset-0 disabled:opacity-50"
          >
            Sonraki
          </button>
        </div>
      </div>

      {/* Sipariş Modal */}
      {isOrderModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setIsOrderModalOpen(false)} />
            
            <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl sm:p-6">
              <div className="mb-5">
                <h3 className="text-base font-semibold leading-6 text-gray-900">
                  {editingOrder ? 'Sipariş Düzenle' : 'Yeni Sipariş Ekle'}
                </h3>
              </div>
              <OrderForm
                initialData={editingOrder}
                customers={customers}
                products={products}
                onSuccess={handleOrderSuccess}
                onCancel={() => setIsOrderModalOpen(false)}
              />
            </div>
          </div>
        </div>
      )}

      {viewingOrder && (
        <div className="fixed inset-0 z-40 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setViewingOrder(null)} />
            <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6">
              <div className="mb-4 flex justify-between items-center">
                <h3 className="text-base font-semibold leading-6 text-gray-900">Sipariş Detayı</h3>
                <button onClick={() => setViewingOrder(null)} className="text-sm text-gray-500 hover:text-gray-700">
                  Kapat
                </button>
              </div>
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-gray-500">Sipariş No</div>
                    <div className="font-medium text-gray-900">{viewingOrder.orderNumber}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Müşteri</div>
                    <div className="font-medium text-gray-900">{viewingOrder.customer?.name}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Ürün Numarası</div>
                    <div className="font-medium text-gray-900">{viewingOrder.product?.code || viewingOrder.productType}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Ürün Açıklaması</div>
                    <div className="font-medium text-gray-900">{viewingOrder.product?.name || viewingOrder.fabricType}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Adet</div>
                    <div className="font-medium text-gray-900">{viewingOrder.quantity || 1}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Termin Tarihi</div>
                    <div className="font-medium text-gray-900">
                      {viewingOrder.deadlineDate ? new Date(viewingOrder.deadlineDate).toLocaleDateString('tr-TR') : '-'}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">Durum</div>
                    <div className="font-medium text-gray-900">
                      {statusLabels[viewingOrder.status] || viewingOrder.status}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">Temel Tutar (Birim)</div>
                    <div className="font-medium text-gray-900">
                      {Number(viewingOrder.baseAmount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {viewingOrder.currency}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">Kar ({viewingOrder.marginType === 'PERCENT' ? '%' : 'Tutar'})</div>
                    <div className="font-medium text-gray-900">
                       {viewingOrder.marginType === 'PERCENT' ? `%${viewingOrder.marginValue}` : `${viewingOrder.marginValue} ${viewingOrder.currency}`} 
                       <span className="text-gray-400 text-xs ml-1">
                         ({Number(viewingOrder.profitAmount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {viewingOrder.currency})
                       </span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 rounded-md bg-gray-50 p-4 border border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Genel Toplam</span>
                    <span className="text-lg font-bold text-indigo-600">
                      {Number(viewingOrder.totalAmount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {viewingOrder.currency}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
