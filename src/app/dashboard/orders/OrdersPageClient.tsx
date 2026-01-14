'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import OrderForm from './_components/OrderForm';
import ProductQuickForm from './_components/ProductQuickForm';

interface OrdersPageClientProps {
  customers: any[];
}

export default function OrdersPageClient({ customers }: OrdersPageClientProps) {
  const [orders, setOrders] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any>(null);

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

  const handleEdit = (order: any) => {
    setEditingOrder(order);
    setIsOrderModalOpen(true);
  };

  const handleCreateOrder = () => {
    setEditingOrder(null);
    setIsOrderModalOpen(true);
  };

  const handleOrderSuccess = () => {
    setIsOrderModalOpen(false);
    fetchOrders(pagination.page);
  };

  const handleCreateProduct = () => {
    setIsProductModalOpen(true);
  };

  const handleProductSuccess = () => {
    setIsProductModalOpen(false);
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
      'TEKLIF_HAZIRLANDI': 'Teklif Hazırlandı',
      'TEKLIF_ILETILDI': 'Teklif İletildi',
      'TEKLIF_ONAYLANDI': 'Teklif Onaylandı',
      'URETIME_GIRDI': 'Üretime Girdi',
      'TESLIM_EDILDI': 'Teslim Edildi'
  };

  const statusColors: Record<string, string> = {
      'TEKLIF_HAZIRLANDI': 'bg-gray-100 text-gray-800',
      'TEKLIF_ILETILDI': 'bg-blue-100 text-blue-800',
      'TEKLIF_ONAYLANDI': 'bg-green-100 text-green-800',
      'URETIME_GIRDI': 'bg-yellow-100 text-yellow-800',
      'TESLIM_EDILDI': 'bg-indigo-100 text-indigo-800'
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">Siparişler</h1>
          <p className="mt-2 text-sm text-gray-700">
            Sipariş ve maliyet yönetimi.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none space-x-2">
          <button
            onClick={handleCreateProduct}
            className="inline-flex rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            Ürün Ekle
          </button>
          <Link
            href="/dashboard/products"
            className="inline-flex rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            Ürünleri Görüntüle
          </Link>
          <button
            onClick={handleCreateOrder}
            className="inline-flex rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
          >
            Yeni Sipariş Ekle
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
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Ürün / Kumaş</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Teklif Tarihi</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Tutar</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Durum</th>
                  <th className="relative py-3.5 pl-3 pr-4 sm:pr-0"><span className="sr-only">İşlemler</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {isLoading ? (
                  <tr><td colSpan={7} className="text-center py-4">Yükleniyor...</td></tr>
                ) : orders.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-4">Kayıt bulunamadı.</td></tr>
                ) : orders.map((order) => (
                  <tr key={order.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">{order.orderNumber}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{order.customer?.name}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {order.productType} <br/>
                        <span className="text-xs text-gray-400">{order.fabricType}</span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {new Date(order.offerDate).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                        {Number(order.totalAmount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {order.currency}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <select 
                            value={order.status} 
                            onChange={(e) => updateStatus(order.id, e.target.value)}
                            className={`rounded-md border-0 py-1 pl-2 pr-8 text-xs font-semibold ring-1 ring-inset focus:ring-2 focus:ring-indigo-600 sm:leading-6 ${statusColors[order.status] || 'text-gray-700 ring-gray-300'}`}
                        >
                            {Object.entries(statusLabels).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
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
                onSuccess={handleOrderSuccess}
                onCancel={() => setIsOrderModalOpen(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Ürün Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setIsProductModalOpen(false)} />

            <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-3xl sm:p-6">
              <div className="mb-5">
                <h3 className="text-base font-semibold leading-6 text-gray-900">
                  Ürün Ekle
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Ürün kodu, adı, açıklaması ve görsellerini ekleyebilirsiniz.
                </p>
              </div>
              <ProductQuickForm
                onSuccess={handleProductSuccess}
                onCancel={() => setIsProductModalOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
