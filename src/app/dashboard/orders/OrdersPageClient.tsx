'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import OrderForm from './_components/OrderForm';

interface Customer {
  id: string;
  name: string;
}

interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customer?: Customer;
  productId?: string | null;
  product?: any;
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
  products: any[];
}

export default function OrdersPageClient({ customers, products }: OrdersPageClientProps) {
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedOrderForStatus, setSelectedOrderForStatus] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');
  const [viewMode, setViewMode] = useState<'active' | 'cancelled' | 'deleted'>('active');

  const fetchOrders = async (page = 1) => {
    setIsLoading(true);
    try {
      let url = `/api/orders?page=${page}`;
      if (viewMode === 'cancelled') {
        url += '&status=IPTAL';
      } else if (viewMode === 'deleted') {
        url += '&deleted=true';
      }
      
      const res = await fetch(url);
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
  }, [pagination.page, viewMode]);

  useEffect(() => {
    if (searchParams.get('new') === 'true') {
      setIsOrderModalOpen(true);
    }
  }, [searchParams]);

  const handleEdit = (order: any) => {
    setEditingOrder(order);
    setViewingOrder(null);
    setIsOrderModalOpen(true);
  };

  const handleCreateOrder = () => {
    setEditingOrder(null);
    setViewingOrder(null);
    setIsOrderModalOpen(true);
  };
  
  const handleCopyOrder = (order: Order) => {
    // Kopyalama işlemi: ID'yi kaldır, sipariş numarasını boşalt
    const { id, orderNumber, ...rest } = order;
    // initialData olarak verilecek nesne oluştur
    const copyData = {
        ...rest,
        orderNumber: '',
        status: 'TEKLIF_OLUSTURULDU' // Varsayılan başlangıç statüsü
    };
    setEditingOrder(copyData);
    setViewingOrder(null);
    setIsOrderModalOpen(true);
  };

  const handleActivateOrder = async (order: Order) => {
      if (confirm('Bu siparişi tekrar aktif listeye almak istiyor musunuz?')) {
          await updateStatus(order.id, 'TEKLIF_OLUSTURULDU');
      }
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
              setIsStatusModalOpen(false);
          }
      } catch (error) {
          console.error('Status update failed', error);
      }
  };

  const openStatusModal = (order: Order) => {
    setSelectedOrderForStatus(order);
    setNewStatus(order.status);
    setIsStatusModalOpen(true);
  };

  const handleSaveStatus = async () => {
    if (selectedOrderForStatus && newStatus) {
      await updateStatus(selectedOrderForStatus.id, newStatus);
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
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-gray-800 mr-4">Sipariş Listesi</h1>
            <button
                onClick={() => setViewMode('active')}
                className={`px-3 py-1 text-sm rounded-full ${viewMode === 'active' ? 'bg-sky-100 text-sky-700 font-medium' : 'text-gray-500 hover:bg-gray-100'}`}
            >
                Aktif
            </button>
            <button
                onClick={() => setViewMode('cancelled')}
                className={`px-3 py-1 text-sm rounded-full ${viewMode === 'cancelled' ? 'bg-red-100 text-red-700 font-medium' : 'text-gray-500 hover:bg-gray-100'}`}
            >
                İptal Edilenler
            </button>
            <button
                onClick={() => setViewMode('deleted')}
                className={`px-3 py-1 text-sm rounded-full ${viewMode === 'deleted' ? 'bg-gray-200 text-gray-700 font-medium' : 'text-gray-500 hover:bg-gray-100'}`}
            >
                Silinenler
            </button>
        </div>
        <button
          onClick={handleCreateOrder}
          className="inline-flex items-center rounded bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-sky-500"
        >
          + Yeni Sipariş
        </button>
      </div>

      <div className="mb-2 flex items-center justify-between rounded-t border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-gray-600">
        <div className="flex items-center gap-2">
          <span>Tarih:</span>
          <input type="date" className="rounded border border-slate-300 px-2 py-1 text-xs" />
          <input type="date" className="rounded border border-slate-300 px-2 py-1 text-xs" />
        </div>
        <div className="flex items-center gap-2">
          <span>Arama:</span>
          <input
            type="text"
            className="h-7 rounded border border-slate-300 px-2 text-xs"
            placeholder="Müşteri veya sipariş no ara..."
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-b border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-sky-100">
              <tr>
                <th className="w-8 border-r border-slate-200 px-2 py-2 text-left text-xs font-semibold text-gray-700">
                  <input type="checkbox" className="h-4 w-4" />
                </th>
                <th className="border-r border-slate-200 px-3 py-2 text-left text-xs font-semibold text-gray-700">
                  Tarih
                </th>
                <th className="border-r border-slate-200 px-3 py-2 text-left text-xs font-semibold text-gray-700">
                  Firma Adı
                </th>
                <th className="border-r border-slate-200 px-3 py-2 text-left text-xs font-semibold text-gray-700">
                  Sipariş Durumu
                </th>
                <th className="border-r border-slate-200 px-3 py-2 text-left text-xs font-semibold text-gray-700">
                  Ürün
                </th>
                <th className="border-r border-slate-200 px-3 py-2 text-right text-xs font-semibold text-gray-700">
                  Adet
                </th>
                <th className="border-r border-slate-200 px-3 py-2 text-right text-xs font-semibold text-gray-700">
                  Tutar
                </th>
                <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700">
                  İşlem
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-sm text-gray-500">
                    Yükleniyor...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-sm text-gray-500">
                    Kayıt bulunamadı.
                  </td>
                </tr>
              ) : (
                orders.map((order, index) => (
                  <tr
                    key={order.id}
                    className={`${getRowClass(order.status)} ${
                      index % 2 === 0 ? 'bg-white' : 'bg-sky-50/40'
                    }`}
                  >
                    <td className="border-t border-slate-200 px-2 py-2">
                      <input type="checkbox" className="h-4 w-4" />
                    </td>
                    <td className="border-t border-slate-200 px-3 py-2 text-xs text-gray-700">
                      {order.deadlineDate
                        ? new Date(order.deadlineDate).toLocaleDateString('tr-TR')
                        : '-'}
                    </td>
                    <td className="border-t border-slate-200 px-3 py-2 text-xs text-sky-800 underline cursor-pointer">
                      {order.customer?.name}
                    </td>
                    <td className="border-t border-slate-200 px-3 py-2 text-xs">
                      <span className="inline-flex rounded px-2 py-1 text-[11px] font-semibold text-white"
                        style={{
                          backgroundColor:
                            order.status === 'TEKLIF_KABUL_EDILDI'
                              ? '#16a34a'
                              : order.status === 'TEKLIF_ILETILDI'
                              ? '#f59e0b'
                              : order.status === 'IPTAL'
                              ? '#ef4444'
                              : '#3b82f6',
                        }}
                      >
                        {statusLabels[order.status] || order.status}
                      </span>
                    </td>
                    <td className="border-t border-slate-200 px-3 py-2 text-xs text-gray-700">
                      {order.product?.name || order.fabricType}
                    </td>
                    <td className="border-t border-slate-200 px-3 py-2 text-right text-xs text-gray-700">
                      {order.quantity || 1}
                    </td>
                    <td className="border-t border-slate-200 px-3 py-2 text-right text-xs font-semibold text-gray-800">
                      {Number(order.totalAmount).toLocaleString('tr-TR', {
                        minimumFractionDigits: 2,
                      })}{' '}
                      {order.currency}
                    </td>
                    <td className="border-t border-slate-200 px-3 py-2 text-right text-xs">
                      <button
                        onClick={() => setViewingOrder(order)}
                        className="mr-2 rounded bg-slate-500 px-2 py-1 text-[11px] font-semibold text-white hover:bg-slate-400"
                      >
                        Görüntüle
                      </button>
                      
                      {viewMode === 'active' && (
                        <>
                            <button
                                onClick={() => handleEdit(order)}
                                className="mr-2 rounded bg-sky-500 px-2 py-1 text-[11px] font-semibold text-white hover:bg-sky-400"
                            >
                                Düzenle
                            </button>
                            <button
                                onClick={() => openStatusModal(order)}
                                className="rounded bg-orange-500 px-2 py-1 text-[11px] font-semibold text-white hover:bg-orange-400"
                            >
                                Durumu Değiştir
                            </button>
                        </>
                      )}

                      {viewMode === 'cancelled' && (
                          <button
                              onClick={() => handleActivateOrder(order)}
                              className="rounded bg-green-600 px-2 py-1 text-[11px] font-semibold text-white hover:bg-green-500"
                          >
                              Aktif Sipariş Al
                          </button>
                      )}

                      {viewMode === 'deleted' && (
                          <button
                              onClick={() => handleCopyOrder(order)}
                              className="rounded bg-indigo-500 px-2 py-1 text-[11px] font-semibold text-white hover:bg-indigo-400"
                          >
                              Kopyala
                          </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-3 py-2 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <span>10</span>
            <span>20</span>
            <span>50</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPagination(p => ({ ...p, page: Math.max(1, p.page - 1) }))}
              disabled={pagination.page === 1}
              className="rounded border border-slate-300 px-2 py-1 disabled:opacity-50"
            >
              Önceki
            </button>
            <span>
              Sayfa {pagination.page} / {pagination.totalPages || 1}
            </span>
            <button
              onClick={() => setPagination(p => ({ ...p, page: Math.min(p.totalPages, p.page + 1) }))}
              disabled={pagination.page === pagination.totalPages}
              className="rounded border border-slate-300 px-2 py-1 disabled:opacity-50"
            >
              Sonraki
            </button>
          </div>
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

      {/* Status Modal */}
      {isStatusModalOpen && selectedOrderForStatus && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setIsStatusModalOpen(false)} />
            <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
              <div className="mb-5">
                <h3 className="text-base font-semibold leading-6 text-gray-900">
                  Sipariş Durumunu Güncelle
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {selectedOrderForStatus.orderNumber} numaralı siparişin durumunu değiştiriyorsunuz.
                </p>
              </div>
              <div className="mt-4">
                <label htmlFor="status" className="block text-sm font-medium leading-6 text-gray-900">
                  Yeni Durum
                </label>
                <select
                  id="status"
                  name="status"
                  className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-sky-600 sm:text-sm sm:leading-6"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  {Object.entries(statusLabels).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mt-6 flex items-center justify-end gap-x-4">
                <button
                  type="button"
                  className="text-sm font-semibold leading-6 text-gray-900"
                  onClick={() => setIsStatusModalOpen(false)}
                >
                  İptal
                </button>
                <button
                  type="button"
                  className="rounded-md bg-sky-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
                  onClick={handleSaveStatus}
                >
                  Kaydet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
