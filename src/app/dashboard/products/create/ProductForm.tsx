'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type Material = {
  id: string;
  name: string;
  unit: string;
  price: string | number;
  currency: string;
};

export default function ProductForm({ materials }: { materials: Material[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const currencyOptions = ['TRY', 'USD', 'EUR', 'GBP'] as const;
  type Currency = typeof currencyOptions[number];
  const [baseCurrency, setBaseCurrency] = useState<Currency>('TRY');
  const [vatRate, setVatRate] = useState<number>(20);
  
  // Form State
  const [selectedMaterials, setSelectedMaterials] = useState<Array<{
    materialId: string;
    quantity: number;
    waste: number;
  }>>([]);

  const [laborCost, setLaborCost] = useState(0);
  const [profitMargin, setProfitMargin] = useState(0);

  // İş kalemleri (iş başı)
  const [cuttingPrice, setCuttingPrice] = useState(0);
  const [cuttingCurrency, setCuttingCurrency] = useState<Currency>('TRY');

  const [sewingPrice, setSewingPrice] = useState(0);
  const [sewingCurrency, setSewingCurrency] = useState<Currency>('TRY');

  const [ironingPackagingPrice, setIroningPackagingPrice] = useState(0);
  const [ironingPackagingCurrency, setIroningPackagingCurrency] = useState<Currency>('TRY');

  const [samplePrice, setSamplePrice] = useState(0);
  const [sampleCurrency, setSampleCurrency] = useState<Currency>('TRY');

  const [shippingPrice, setShippingPrice] = useState(0);
  const [shippingCurrency, setShippingCurrency] = useState<Currency>('TRY');

  // Calculations
  const calculateTotal = () => {
    let materialCost = 0;
    selectedMaterials.forEach(sm => {
      const mat = materials.find(m => m.id === sm.materialId);
      if (mat) {
        const usage = sm.quantity * (1 + sm.waste / 100);
        materialCost += usage * Number(mat.price);
      }
    });
    const jobCost = cuttingPrice + sewingPrice + ironingPackagingPrice;
    const extrasCost = samplePrice + shippingPrice;
    const aggregatedLabor = jobCost; // işçilik olarak say
    const aggregatedOverhead = overheadCost + extrasCost; // genel giderlere ekle
    const totalCost = materialCost + aggregatedLabor + aggregatedOverhead;
    const finalPrice = totalCost * (1 + profitMargin / 100);
    const grandTotalWithVat = finalPrice * (1 + vatRate / 100);
    return { materialCost, totalCost, finalPrice, grandTotalWithVat, jobCost, extrasCost };
  };

  const { materialCost, totalCost, finalPrice, grandTotalWithVat, jobCost, extrasCost } = calculateTotal();

  const addMaterialRow = () => {
    if (materials.length > 0) {
      setSelectedMaterials([...selectedMaterials, { materialId: materials[0].id, quantity: 1, waste: 0 }]);
    }
  };

  const removeMaterialRow = (index: number) => {
    const newMats = [...selectedMaterials];
    newMats.splice(index, 1);
    setSelectedMaterials(newMats);
  };

  const updateMaterialRow = (
    index: number,
    field: 'materialId' | 'quantity' | 'waste',
    value: string | number
  ) => {
    const newMats = [...selectedMaterials];
    if (field === 'materialId') {
      newMats[index].materialId = String(value);
    } else if (field === 'quantity') {
      newMats[index].quantity = Number(value);
    } else if (field === 'waste') {
      newMats[index].waste = Number(value);
    }
    setSelectedMaterials(newMats);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data: {
      name: FormDataEntryValue | null;
      code: FormDataEntryValue | null;
      laborCost: number;
      overheadCost: number;
      profitMargin: number;
      materials: Array<{ materialId: string; quantity: number; waste: number }>;
    } = {
      name: formData.get('name'),
      code: formData.get('code'),
      laborCost: jobCost, // Kesim + Dikim + Ütü&Paket
      overheadCost: 0 + extrasCost, // Genel giderler (ek alan kullanılmadığı için 0) + Numune + Sevkiyat
      profitMargin,
      materials: selectedMaterials,
    };

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error?.message || 'Bir hata oluştu');
      }

      router.push('/dashboard/products');
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
            <h3 className="text-base font-semibold leading-6 text-gray-900">Ürün Bilgileri</h3>
            <p className="mt-1 text-sm text-gray-500">Temel ürün bilgileri.</p>
          </div>
          
          <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label className="block text-sm font-medium leading-6 text-gray-900">Ürün Adı</label>
              <div className="mt-2">
                <input
                  type="text"
                  name="name"
                  required
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 p-2"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label className="block text-sm font-medium leading-6 text-gray-900">Ürün Kodu</label>
              <div className="mt-2">
                <input
                  type="text"
                  name="code"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 p-2"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label className="block text-sm font-medium leading-6 text-gray-900">Genel Para Birimi</label>
              <div className="mt-2">
                <select
                  value={baseCurrency}
                  onChange={(e) => setBaseCurrency(e.target.value as Currency)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                >
                  {currencyOptions.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="sm:col-span-3">
              <label className="block text-sm font-medium leading-6 text-gray-900">KDV Oranı</label>
              <div className="mt-2">
                <select
                  value={vatRate}
                  onChange={(e) => setVatRate(Number(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                >
                  <option value={1}>%1</option>
                  <option value={10}>%10</option>
                  <option value={20}>%20</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8">
          <div>
            <h3 className="text-base font-semibold leading-6 text-gray-900">Reçete / Malzemeler</h3>
            <p className="mt-1 text-sm text-gray-500">Üründe kullanılan malzemeler ve fire oranları.</p>
          </div>

          <div className="mt-6">
            {selectedMaterials.map((sm, index) => (
              <div key={index} className="flex gap-4 mb-4 items-end bg-gray-50 p-4 rounded-lg">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">Malzeme</label>
                  <select
                    value={sm.materialId}
                    onChange={(e) => updateMaterialRow(index, 'materialId', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                  >
                    {materials.map((m) => (
                      <option key={m.id} value={m.id}>{m.name} ({m.unit} - {Number(m.price).toFixed(2)} {m.currency})</option>
                    ))}
                  </select>
                </div>
                <div className="w-36">
                  <label className="block text-sm font-medium text-gray-700">Birim</label>
                  <select
                    value={materials.find(m => m.id === sm.materialId)?.unit || 'adet'}
                    onChange={() => {}}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                  >
                    <option value="adet">Adet</option>
                    <option value="gram">Gram</option>
                    <option value="kilo">Kilo</option>
                    <option value="metre">Metre</option>
                    <option value="top">Top</option>
                  </select>
                </div>
                <div className="w-32">
                  <label className="block text-sm font-medium text-gray-700">Miktar</label>
                  <input
                    type="number"
                    value={sm.quantity}
                    onChange={(e) => updateMaterialRow(index, 'quantity', Number(e.target.value))}
                    min="0"
                    step="0.01"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                  />
                </div>
                <div className="w-32">
                  <label className="block text-sm font-medium text-gray-700">Fire %</label>
                  <input
                    type="number"
                    value={sm.waste}
                    onChange={(e) => updateMaterialRow(index, 'waste', Number(e.target.value))}
                    min="0"
                    step="0.1"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeMaterialRow(index)}
                  className="bg-red-100 text-red-600 p-2 rounded hover:bg-red-200"
                >
                  Sil
                </button>
              </div>
            ))}
            
            <button
              type="button"
              onClick={addMaterialRow}
              className="mt-2 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              + Malzeme Ekle
            </button>
          </div>
        </div>

        <div className="pt-8">
          <div>
            <h3 className="text-base font-semibold leading-6 text-gray-900">İş Kalemleri (İş başına)</h3>
            <p className="mt-1 text-sm text-gray-500">Kesim, dikim, ütü/paket; numune ve sevkiyat.</p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Kesim Fiyatı</label>
              <div className="mt-1 flex gap-2">
                <input
                  type="number"
                  value={cuttingPrice}
                  onChange={(e) => setCuttingPrice(Number(e.target.value))}
                  min="0"
                  step="0.01"
                  className="block w-full rounded-md border-gray-300 pl-3 pr-12 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                />
                <select
                  value={cuttingCurrency}
                  onChange={(e) => setCuttingCurrency(e.target.value as Currency)}
                  className="rounded-md border-gray-300 p-2"
                >
                  {currencyOptions.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Dikim Fiyatı</label>
              <div className="mt-1 flex gap-2">
                <input
                  type="number"
                  value={sewingPrice}
                  onChange={(e) => setSewingPrice(Number(e.target.value))}
                  min="0"
                  step="0.01"
                  className="block w-full rounded-md border-gray-300 pl-3 pr-12 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                />
                <select
                  value={sewingCurrency}
                  onChange={(e) => setSewingCurrency(e.target.value as Currency)}
                  className="rounded-md border-gray-300 p-2"
                >
                  {currencyOptions.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Ütü & Paket Fiyatı</label>
              <div className="mt-1 flex gap-2">
                <input
                  type="number"
                  value={ironingPackagingPrice}
                  onChange={(e) => setIroningPackagingPrice(Number(e.target.value))}
                  min="0"
                  step="0.01"
                  className="block w-full rounded-md border-gray-300 pl-3 pr-12 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                />
                <select
                  value={ironingPackagingCurrency}
                  onChange={(e) => setIroningPackagingCurrency(e.target.value as Currency)}
                  className="rounded-md border-gray-300 p-2"
                >
                  {currencyOptions.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Numune Fiyatı</label>
              <div className="mt-1 flex gap-2">
                <input
                  type="number"
                  value={samplePrice}
                  onChange={(e) => setSamplePrice(Number(e.target.value))}
                  min="0"
                  step="0.01"
                  className="block w-full rounded-md border-gray-300 pl-3 pr-12 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                />
                <select
                  value={sampleCurrency}
                  onChange={(e) => setSampleCurrency(e.target.value as Currency)}
                  className="rounded-md border-gray-300 p-2"
                >
                  {currencyOptions.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Sevkiyat Fiyatı</label>
              <div className="mt-1 flex gap-2">
                <input
                  type="number"
                  value={shippingPrice}
                  onChange={(e) => setShippingPrice(Number(e.target.value))}
                  min="0"
                  step="0.01"
                  className="block w-full rounded-md border-gray-300 pl-3 pr-12 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                />
                <select
                  value={shippingCurrency}
                  onChange={(e) => setShippingCurrency(e.target.value as Currency)}
                  className="rounded-md border-gray-300 p-2"
                >
                  {currencyOptions.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8">
          <div>
            <h3 className="text-base font-semibold leading-6 text-gray-900">Maliyet ve Fiyatlandırma</h3>
            <p className="mt-1 text-sm text-gray-500">İşçilik, genel giderler ve kar marjı.</p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">İşçilik Maliyeti</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  type="number"
                  value={jobCost}
                  readOnly
                  min="0"
                  step="0.01"
                  className="block w-full rounded-md border-gray-300 pl-3 pr-12 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Genel Giderler</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  type="number"
                  value={overheadCost + extrasCost}
                  readOnly
                  min="0"
                  step="0.01"
                  className="block w-full rounded-md border-gray-300 pl-3 pr-12 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Kar Marjı (%)</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  type="number"
                  value={profitMargin}
                  onChange={(e) => setProfitMargin(Number(e.target.value))}
                  min="0"
                  step="0.1"
                  className="block w-full rounded-md border-gray-300 pl-3 pr-12 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Summary Box */}
        <div className="pt-8">
           <div className="bg-indigo-50 rounded-lg p-6">
             <h4 className="text-lg font-medium text-indigo-900 mb-4">Maliyet Özeti</h4>
             <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
               <div className="sm:col-span-1">
                 <dt className="text-sm font-medium text-indigo-500">Toplam Malzeme Maliyeti</dt>
                 <dd className="mt-1 text-2xl font-semibold text-indigo-900">{materialCost.toFixed(2)} {baseCurrency}</dd>
               </div>
               <div className="sm:col-span-1">
                 <dt className="text-sm font-medium text-indigo-500">Toplam Üretim Maliyeti</dt>
                 <dd className="mt-1 text-2xl font-semibold text-indigo-900">{totalCost.toFixed(2)} {baseCurrency}</dd>
               </div>
               <div className="sm:col-span-2 border-t border-indigo-200 pt-4 mt-2">
                 <dt className="text-base font-medium text-indigo-600">Satış Fiyatı</dt>
                 <dd className="mt-1 text-4xl font-bold text-indigo-900">{finalPrice.toFixed(2)} {baseCurrency}</dd>
               </div>
               <div className="sm:col-span-2">
                 <dt className="text-sm font-medium text-indigo-500">KDV Dahil Toplam</dt>
                 <dd className="mt-1 text-2xl font-semibold text-indigo-900">{grandTotalWithVat.toFixed(2)} {baseCurrency}</dd>
               </div>
             </dl>
              <p className="mt-3 text-xs text-indigo-700">
                Not: Farklı para birimleri ile giriş yaparsanız toplam hesapta uyuşmazlık olabilir. Aynı para birimini kullanmanız önerilir.
              </p>
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
            {loading ? 'Kaydediliyor...' : 'Kaydet'}
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
