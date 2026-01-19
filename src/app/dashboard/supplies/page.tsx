'use client';

import { useState, useEffect } from 'react';
import SupplierForm from './_components/SupplierForm';
import MaterialDefinitionForm from './_components/MaterialDefinitionForm';
import SupplyOrderForm from './_components/SupplyOrderForm';

export default function SuppliesPage() {
  
  // Modals
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any>(null);

  // Data
  const [suppliers, setSuppliers] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get('new') === 'order') {
        setShowOrderModal(true);
      }
    }
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
        const [suppRes, matRes, orderRes] = await Promise.all([
            fetch('/api/suppliers'),
            fetch('/api/materials'),
            fetch(`/api/supply-orders?page=${page}`)
        ]);
        
        if (suppRes.ok) setSuppliers(await suppRes.json());
        if (matRes.ok) setMaterials(await matRes.json());
        if (orderRes.ok) {
            const data = await orderRes.json();
            setOrders(data.orders);
            setTotalPages(data.pagination.totalPages);
        }
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page]);

  const handleDeleteOrder = async (id: string) => {
      if(!confirm('Bu siparişi silmek istediğinize emin misiniz?')) return;
      try {
          const res = await fetch(`/api/supply-orders?id=${id}`, { method: 'DELETE' });
          if(res.ok) fetchData();
          else alert('Silinemedi');
      } catch(e) { console.error(e); }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 space-y-8">
      
      {/* Header & Actions */}
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold leading-6 text-gray-900">Tedarik Yönetimi</h1>
          <p className="mt-2 text-sm text-gray-700">
            Tedarikçi, ürün ve sipariş takibi.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none space-x-2">
          <button
            onClick={() => setShowSupplierModal(true)}
            className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            Tedarikçi Ekle
          </button>
          <button
            onClick={() => setShowMaterialModal(true)}
            className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            Tedarik Edilen Ürün
          </button>
          <button
            onClick={() => setShowOrderModal(true)}
            className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Yeni Sipariş Ekle
          </button>
        </div>
      </div>

      {/* Suppliers List */}
      <div>
        <h2 className="text-lg font-semibold leading-6 text-gray-900 mb-4">Tedarikçi Listesi</h2>
        <div className="flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <table className="min-w-full divide-y divide-gray-300">
                <thead>
                  <tr>
                    <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Firma Ünvanı</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Tedarik Türü</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Yetkili</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Telefon</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Çalışma Şekli</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Bakiye</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {suppliers.map((sup: any) => (
                    <tr key={sup.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">{sup.name}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{sup.type}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{sup.contactName || '-'}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{sup.phone || sup.mobile || '-'}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {sup.paymentMethod} {sup.paymentMethod === 'Vadeli' && `(${sup.termDays} Gün)`}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 font-bold">
                        {/* Bakiye hesaplama mantığı eklenebilir, şimdilik - */}
                        -
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div>
        <h2 className="text-lg font-semibold leading-6 text-gray-900 mb-4">Tedarik Siparişleri</h2>
        <div className="flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <table className="min-w-full divide-y divide-gray-300">
                <thead>
                  <tr>
                    <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Tedarikçi</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Ürün</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Miktar</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Birim Fiyat</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">KDV</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Genel Toplam</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Durum</th>
                    <th className="relative py-3.5 pl-3 pr-4 sm:pr-0"><span className="sr-only">İşlemler</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orders.map((order: any) => (
                    <tr 
                      key={order.id}
                      className={
                        order.status === 'ORDERED' ? 'bg-orange-50' : 
                        order.status === 'RECEIVED' ? 'bg-green-50' : 'bg-white'
                      }
                    >
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">{order.supplier.name}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{order.material.name}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{Number(order.quantity)} {order.unit}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{Number(order.unitPrice).toFixed(2)} {order.currency}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">%{Number(order.vatRate)}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm font-bold text-gray-900">{Number(order.grandTotal).toFixed(2)} {order.currency}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {order.status === 'CREATED' ? 'Oluşturuldu' : 
                         order.status === 'ORDERED' ? 'Sipariş Verildi' : 'Teslim Alındı'}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                        <button 
                          onClick={() => { setEditingOrder(order); setShowOrderModal(true); }}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          Düzenle
                        </button>
                        <button onClick={() => handleDeleteOrder(order.id)} className="text-red-600 hover:text-red-900">Sil</button>
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
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="relative inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:outline-offset-0 disabled:opacity-50"
            >
              Önceki
            </button>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page >= totalPages}
              className="relative ml-3 inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:outline-offset-0 disabled:opacity-50"
            >
              Sonraki
            </button>
          </div>
        </div>
      </div>

      {/* Stock List */}
      <div>
        <h2 className="text-lg font-semibold leading-6 text-gray-900 mb-4">Stok Listesi</h2>
        <div className="flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <table className="min-w-full divide-y divide-gray-300">
                <thead>
                  <tr>
                    <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Ürün Adı</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Mevcut Stok</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Birim</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {materials.map((mat: any) => (
                    <tr key={mat.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">{mat.name}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 font-bold">{Number(mat.stock)}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{mat.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showSupplierModal && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
             <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                 <h3 className="text-base font-semibold leading-6 text-gray-900 mb-4">Yeni Tedarikçi Ekle</h3>
                 <SupplierForm onSuccess={() => { setShowSupplierModal(false); fetchData(); }} onCancel={() => setShowSupplierModal(false)} />
             </div>
          </div>
        </div>
      )}

      {showMaterialModal && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
             <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                 <h3 className="text-base font-semibold leading-6 text-gray-900 mb-4">Yeni Ürün Tanımı Ekle</h3>
                 <MaterialDefinitionForm onSuccess={() => { setShowMaterialModal(false); fetchData(); }} onCancel={() => setShowMaterialModal(false)} />
             </div>
          </div>
        </div>
      )}

      {showOrderModal && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
             <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6">
                 <h3 className="text-base font-semibold leading-6 text-gray-900 mb-4">
                    {editingOrder ? 'Siparişi Düzenle' : 'Yeni Tedarik Siparişi Ekle'}
                 </h3>
                 <SupplyOrderForm 
                    suppliers={suppliers}
                    materials={materials}
                    initialData={editingOrder}
                    onSuccess={() => { setShowOrderModal(false); setEditingOrder(null); fetchData(); }} 
                    onCancel={() => { setShowOrderModal(false); setEditingOrder(null); }} 
                 />
             </div>
          </div>
        </div>
      )}

    </div>
  );
}
