'use client';

import { useState } from 'react';
import Link from 'next/link';

type Material = {
  id: string;
  quantity: number;
  waste: number;
  material: {
    price: number;
    name: string;
    unit: string;
    currency: string;
  };
};

type ManualRecipeItem = {
  name: string;
  unit: string;
  quantity: number;
  waste: number;
  unitPrice: number;
  currency: string;
};

type Product = {
  id: string;
  name: string;
  code?: string | null;
  description?: string | null;
  image1?: string | null;
  image2?: string | null;
  image3?: string | null;
  image4?: string | null;
  image5?: string | null;
  laborCost: number;
  overheadCost: number;
  profitMargin: number;
  isActive: boolean;
  materials: Material[];
  createdAt: string;
  manualRecipe?: ManualRecipeItem[] | null;
};

export default function ProductsPageClient({ products, passiveProducts }: { products: Product[]; passiveProducts: Product[] }) {
  const [viewProduct, setViewProduct] = useState<Product | null>(null);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'active' | 'inactive'>('active');
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);
  const [deleteContext, setDeleteContext] = useState<'active' | 'inactive'>('active');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const calculateCost = (product: Product) => {
    let materialCost = 0;
    product.materials.forEach((pm) => {
      const usage = pm.quantity * (1 + pm.waste / 100);
      materialCost += usage * pm.material.price;
    });
    const totalCost = materialCost + product.laborCost + product.overheadCost;
    const finalPrice = totalCost * (1 + product.profitMargin / 100);
    return { totalCost, finalPrice };
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editProduct) return;
    setSaving(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const payload = {
      id: editProduct.id,
      name: String(form.get('name') || editProduct.name),
      code: String(form.get('code') || editProduct.code || ''),
      description: String(form.get('description') || editProduct.description || ''),
      laborCost: Number(form.get('laborCost') || editProduct.laborCost),
      overheadCost: Number(form.get('overheadCost') || editProduct.overheadCost),
      profitMargin: Number(form.get('profitMargin') || editProduct.profitMargin),
    };
    try {
      const res = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || 'Güncelleme hatası');
      }
      setEditProduct(null);
      location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hata');
    } finally {
      setSaving(false);
    }
  };

  const handleSoftDelete = async () => {
    if (!deleteProduct) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      const res = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: deleteProduct.id, isActive: false }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || 'Ürün pasife alınamadı');
      }
      setDeleteProduct(null);
      location.reload();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Hata');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleHardDelete = async () => {
    if (!deleteProduct) return;
    if (!window.confirm('Bu ürünü kalıcı olarak silmek istediğinize emin misiniz?')) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/products?id=${deleteProduct.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || 'Silme hatası');
      }
      setDeleteProduct(null);
      location.reload();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Hata');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleActivate = async (product: Product) => {
    if (!window.confirm('Bu ürünü tekrar aktif yapmak istediğinize emin misiniz?')) return;
    setSaving(true);
    try {
      const res = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: product.id, isActive: true }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || 'Aktif etme hatası');
      }
      location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hata');
    } finally {
      setSaving(false);
    }
  };

  const list = view === 'active' ? products : passiveProducts;

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">
            {view === 'active' ? 'Ürünler' : 'Pasif Ürünler'}
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            {view === 'active'
              ? 'Eklenen ürünlerin listesi ve maliyet bilgileri.'
              : 'Pasif kutusuna alınan ürünler.'}
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex gap-2">
          <button
            type="button"
            onClick={() => setView(view === 'active' ? 'inactive' : 'active')}
            className="rounded-md bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-200"
          >
            {view === 'active' ? 'Pasif Ürünler' : 'Aktif Ürünler'}
          </button>
          <Link
            href="/dashboard/products/create"
            className="rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Ürün Ekle
          </Link>
        </div>
      </div>

      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table className="min-w-full divide-y divide-gray-300">
              <thead>
                <tr>
                  <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">Görsel</th>
                  <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">Ürün Adı</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Kod</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Maliyet</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Satış Fiyatı</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Kar Oranı</th>
                  <th className="relative py-3.5 pl-3 pr-4 sm:pr-0"><span className="sr-only">İşlemler</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {list.map((product) => {
                  const { totalCost, finalPrice } = calculateCost(product);
                  return (
                    <tr key={product.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-500 sm:pl-0">
                        {product.image1 ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={product.image1} alt={product.name} className="h-12 w-12 rounded object-cover border border-gray-200" />
                        ) : (
                          <span className="text-xs text-gray-400">Yok</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">{product.name}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{product.code || '-'}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{totalCost.toFixed(2)}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm font-bold text-gray-900">{finalPrice.toFixed(2)}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">%{product.profitMargin}</td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0 space-x-3">
                        {view === 'active' ? (
                          <>
                            <button onClick={() => setEditProduct(product)} className="text-indigo-600 hover:text-indigo-900">Düzenle</button>
                            <button onClick={() => setViewProduct(product)} className="text-gray-600 hover:text-gray-900">Görüntüle</button>
                            <button
                              onClick={() => {
                                setDeleteContext('active');
                                setDeleteProduct(product);
                                setDeleteError(null);
                              }}
                              className="text-red-600 hover:text-red-900"
                            >
                              Sil
                            </button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => setViewProduct(product)} className="text-gray-600 hover:text-gray-900">Görüntüle</button>
                            <button onClick={() => handleActivate(product)} className="text-indigo-600 hover:text-indigo-900">Aktif Yap</button>
                            <button
                              onClick={() => {
                                setDeleteContext('inactive');
                                setDeleteProduct(product);
                                setDeleteError(null);
                              }}
                              className="text-red-600 hover:text-red-900"
                            >
                              Kalıcı Sil
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {viewProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setViewProduct(null)} />
            <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl sm:p-6">
              <div className="mb-5">
                <h3 className="text-base font-semibold leading-6 text-gray-900">Ürün Bilgileri</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {viewProduct.name} ({viewProduct.code || 'Kod yok'}) · Oluşturma:{' '}
                  {new Date(viewProduct.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="grid grid-cols-5 gap-2 mb-4">
                {[viewProduct.image1, viewProduct.image2, viewProduct.image3, viewProduct.image4, viewProduct.image5].map((src, idx) => (
                  <div key={idx} className="h-20 border rounded flex items-center justify-center bg-gray-50">
                    {src ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={src} alt={`Görsel ${idx + 1}`} className="h-full w-full object-cover rounded" />
                    ) : (
                      <span className="text-xs text-gray-400">Yok</span>
                    )}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700 mt-4">
                <div className="space-y-2">
                  <div><span className="font-medium">Açıklama:</span> {viewProduct.description || '-'}</div>
                  <div><span className="font-medium">İşçilik:</span> {viewProduct.laborCost.toFixed(2)}</div>
                  <div><span className="font-medium">Genel Gider:</span> {viewProduct.overheadCost.toFixed(2)}</div>
                  <div><span className="font-medium">Kar Marjı:</span> %{viewProduct.profitMargin}</div>
                </div>
                <div className="space-y-2">
                  {(() => {
                    const { totalCost, finalPrice } = calculateCost(viewProduct);
                    return (
                      <>
                        <div><span className="font-medium">Toplam Maliyet:</span> {totalCost.toFixed(2)}</div>
                        <div><span className="font-medium">Satış Fiyatı:</span> {finalPrice.toFixed(2)}</div>
                      </>
                    );
                  })()}
                </div>
              </div>

              <div className="mt-6">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Reçete / Malzemeler</h4>
                {viewProduct.materials.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-xs md:text-sm divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-2 py-2 text-left font-medium text-gray-700">Kalem</th>
                          <th className="px-2 py-2 text-left font-medium text-gray-700">Miktar</th>
                          <th className="px-2 py-2 text-left font-medium text-gray-700">Fire %</th>
                          <th className="px-2 py-2 text-left font-medium text-gray-700">Birim Fiyat</th>
                          <th className="px-2 py-2 text-left font-medium text-gray-700">Tutar</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {viewProduct.materials.map((pm) => {
                          const usage = pm.quantity * (1 + pm.waste / 100);
                          const lineCost = usage * pm.material.price;
                          return (
                            <tr key={pm.id}>
                              <td className="px-2 py-2 text-gray-900">
                                {pm.material.name} ({pm.material.unit})
                              </td>
                              <td className="px-2 py-2 text-gray-700">
                                {pm.quantity} {pm.material.unit}
                              </td>
                              <td className="px-2 py-2 text-gray-700">%{pm.waste}</td>
                              <td className="px-2 py-2 text-gray-700">
                                {pm.material.price.toFixed(2)} {pm.material.currency}
                              </td>
                              <td className="px-2 py-2 text-gray-900 font-medium">
                                {lineCost.toFixed(2)} {pm.material.currency}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : viewProduct.manualRecipe && viewProduct.manualRecipe.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-xs md:text-sm divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-2 py-2 text-left font-medium text-gray-700">Kalem</th>
                          <th className="px-2 py-2 text-left font-medium text-gray-700">Birim</th>
                          <th className="px-2 py-2 text-left font-medium text-gray-700">Miktar</th>
                          <th className="px-2 py-2 text-left font-medium text-gray-700">Fire %</th>
                          <th className="px-2 py-2 text-left font-medium text-gray-700">Birim Fiyat</th>
                          <th className="px-2 py-2 text-left font-medium text-gray-700">Para Birimi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {viewProduct.manualRecipe.map((it, idx) => (
                          <tr key={idx}>
                            <td className="px-2 py-2 text-gray-900">{it.name}</td>
                            <td className="px-2 py-2 text-gray-700">{it.unit}</td>
                            <td className="px-2 py-2 text-gray-700">{it.quantity}</td>
                            <td className="px-2 py-2 text-gray-700">%{it.waste}</td>
                            <td className="px-2 py-2 text-gray-700">{it.unitPrice.toFixed(2)}</td>
                            <td className="px-2 py-2 text-gray-700">{it.currency}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Bu ürüne bağlı reçete kaydı bulunmuyor.</p>
                )}
              </div>
              <div className="mt-6 text-right">
                <button onClick={() => setViewProduct(null)} className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
                  Kapat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setEditProduct(null)} />
            <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6">
              <div className="mb-5">
                <h3 className="text-base font-semibold leading-6 text-gray-900">Ürünü Düzenle</h3>
              </div>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Ürün Adı</label>
                  <input name="name" defaultValue={editProduct.name} className="mt-1 block w-full rounded-md border p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Kod</label>
                  <input name="code" defaultValue={editProduct.code || ''} className="mt-1 block w-full rounded-md border p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Açıklama</label>
                  <textarea name="description" defaultValue={editProduct.description || ''} className="mt-1 block w-full rounded-md border p-2" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">İşçilik Maliyeti</label>
                    <input
                      type="number"
                      step="0.01"
                      name="laborCost"
                      defaultValue={editProduct.laborCost}
                      className="mt-1 block w-full rounded-md border p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Diğer Genel Giderler</label>
                    <input
                      type="number"
                      step="0.01"
                      name="overheadCost"
                      defaultValue={editProduct.overheadCost}
                      className="mt-1 block w-full rounded-md border p-2"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Kar Marjı (%)</label>
                  <input type="number" step="0.1" name="profitMargin" defaultValue={editProduct.profitMargin} className="mt-1 block w-full rounded-md border p-2" />
                </div>

                {error && <div className="text-red-600 text-sm">{error}</div>}
                <div className="flex justify-end space-x-2">
                  <button type="button" onClick={() => setEditProduct(null)} className="rounded-md border bg-white px-3 py-2 text-sm font-semibold text-gray-700">
                    İptal
                  </button>
                  <button type="submit" disabled={saving} className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">
                    {saving ? 'Kaydediliyor...' : 'Kaydet'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {deleteProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => {
                if (!deleteLoading) {
                  setDeleteProduct(null);
                  setDeleteError(null);
                }
              }}
            />
            <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md sm:p-6">
              <div className="mb-4">
                <h3 className="text-base font-semibold leading-6 text-gray-900">Ürünü Sil</h3>
                <p className="mt-2 text-sm text-gray-600">
                  {deleteContext === 'active'
                    ? 'Bu ürün ürünler listesinden kaldırılacaktır. Ne yapmak istersiniz?'
                    : 'Bu ürün kalıcı olarak silinecektir.'}
                </p>
                <p className="mt-1 text-sm font-medium text-gray-900">{deleteProduct.name}</p>
              </div>
              {deleteError && <div className="mb-3 text-sm text-red-600">{deleteError}</div>}
              <div className="mt-4 flex justify-end gap-2">
                {deleteContext === 'active' && (
                  <button
                    type="button"
                    disabled={deleteLoading}
                    onClick={handleSoftDelete}
                    className="rounded-md bg-yellow-100 px-3 py-2 text-sm font-semibold text-yellow-800 shadow-sm hover:bg-yellow-200 disabled:opacity-50"
                  >
                    Pasif kutusuna at
                  </button>
                )}
                <button
                  type="button"
                  disabled={deleteLoading}
                  onClick={handleHardDelete}
                  className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 disabled:opacity-50"
                >
                  Kalıcı sil
                </button>
                <button
                  type="button"
                  disabled={deleteLoading}
                  onClick={() => {
                    setDeleteProduct(null);
                    setDeleteError(null);
                  }}
                  className="rounded-md border bg-white px-3 py-2 text-sm font-semibold text-gray-700"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
