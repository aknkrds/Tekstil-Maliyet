'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Customer = {
  id: string;
  name: string;
};

type Product = {
  id: string;
  name: string;
  code: string | null;
  laborCost: number | string;
  overheadCost: number | string;
  profitMargin: number | string;
  materials: any[];
  manualRecipe?: any[] | null;
};

export default function OfferForm({ customers, products }: { customers: Customer[], products: Product[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [items, setItems] = useState<Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
  }>>([]);

  const calculateProductPrice = (product: Product) => {
    // Re-calculate price on client side to be safe, or just use a pre-calculated value passed from server.
    // For now, let's roughly approximate or rely on what the user enters.
    // Ideally, we should fetch the price or calculate it.
    // Let's implement the same logic as in ProductsPage roughly.
    let materialCost = 0;
    
    if (product.materials && Array.isArray(product.materials)) {
      product.materials.forEach((pm: any) => {
        const quantity = Number(pm.quantity);
        const waste = Number(pm.waste);
        const price = Number(pm.material.price);
        const usage = quantity * (1 + waste / 100);
        materialCost += usage * price;
      });
    }

    if (product.manualRecipe && Array.isArray(product.manualRecipe)) {
      product.manualRecipe.forEach((item: any) => {
        const quantity = Number(item.quantity || 0);
        const waste = Number(item.waste || 0);
        const price = Number(item.unitPrice || 0);
        const usage = quantity * (1 + waste / 100);
        materialCost += usage * price;
      });
    }
    
    const labor = Number(product.laborCost);
    const overhead = Number(product.overheadCost);
    const totalCost = materialCost + labor + overhead;
    const profit = Number(product.profitMargin);
    const finalPrice = totalCost * (1 + profit / 100);
    return finalPrice;
  };

  const addItemRow = () => {
    if (products.length > 0) {
      const product = products[0];
      const price = calculateProductPrice(product);
      setItems([...items, { productId: product.id, quantity: 1, unitPrice: Number(price.toFixed(2)) }]);
    }
  };

  const removeItemRow = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const updateItemRow = (index: number, field: string, value: any) => {
    const newItems = [...items];
    // @ts-ignore
    newItems[index][field] = value;

    if (field === 'productId') {
        const product = products.find(p => p.id === value);
        if (product) {
            const price = calculateProductPrice(product);
            newItems[index].unitPrice = Number(price.toFixed(2));
        }
    }

    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const data = {
      customerId: selectedCustomerId,
      validUntil,
      items,
    };

    try {
      const res = await fetch('/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error?.message || 'Bir hata oluştu');
      }

      router.push('/dashboard/offers');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 divide-y divide-gray-200">
      <div className="space-y-8 divide-y divide-gray-200">
        <div>
          <div>
            <h3 className="text-base font-semibold leading-6 text-gray-900">Teklif Bilgileri</h3>
            <p className="mt-1 text-sm text-gray-500">Müşteri ve geçerlilik tarihi.</p>
          </div>
          
          <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label className="block text-sm font-medium leading-6 text-gray-900">Müşteri</label>
              <div className="mt-2">
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  required
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 p-2"
                >
                  <option value="">Seçiniz...</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="sm:col-span-3">
              <label className="block text-sm font-medium leading-6 text-gray-900">Geçerlilik Tarihi</label>
              <div className="mt-2">
                <input
                  type="date"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 p-2"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8">
          <div>
            <h3 className="text-base font-semibold leading-6 text-gray-900">Ürünler</h3>
            <p className="mt-1 text-sm text-gray-500">Teklife eklenecek ürünler.</p>
          </div>

          <div className="mt-6">
            {items.map((item, index) => (
              <div key={index} className="flex gap-4 mb-4 items-end bg-gray-50 p-4 rounded-lg">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">Ürün</label>
                  <select
                    value={item.productId}
                    onChange={(e) => updateItemRow(index, 'productId', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                    ))}
                  </select>
                </div>
                <div className="w-32">
                  <label className="block text-sm font-medium text-gray-700">Miktar</label>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateItemRow(index, 'quantity', Number(e.target.value))}
                    min="1"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                  />
                </div>
                <div className="w-32">
                  <label className="block text-sm font-medium text-gray-700">Birim Fiyat</label>
                  <input
                    type="number"
                    value={item.unitPrice}
                    onChange={(e) => updateItemRow(index, 'unitPrice', Number(e.target.value))}
                    min="0"
                    step="0.01"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                  />
                </div>
                <div className="w-32">
                   <label className="block text-sm font-medium text-gray-700">Toplam</label>
                   <div className="mt-1 p-2 bg-gray-100 rounded text-right">
                     {(item.quantity * item.unitPrice).toFixed(2)}
                   </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeItemRow(index)}
                  className="bg-red-100 text-red-600 p-2 rounded hover:bg-red-200"
                >
                  Sil
                </button>
              </div>
            ))}
            
            <button
              type="button"
              onClick={addItemRow}
              className="mt-2 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              + Ürün Ekle
            </button>
          </div>
        </div>

        <div className="pt-8">
           <div className="bg-indigo-50 rounded-lg p-6 flex justify-between items-center">
             <h4 className="text-lg font-medium text-indigo-900">Genel Toplam</h4>
             <span className="text-3xl font-bold text-indigo-900">{calculateTotal().toFixed(2)} TRY</span>
           </div>
        </div>
      </div>

      <div className="pt-5">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            İptal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? 'Kaydediliyor...' : 'Teklifi Oluştur'}
          </button>
        </div>
      </div>
      
      {error && (
        <div className="text-red-600 mt-2 text-center">
          {error}
        </div>
      )}
    </form>
  );
}
