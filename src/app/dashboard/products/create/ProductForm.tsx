'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function ProductForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const currencyOptions = ['TRY', 'USD', 'EUR', 'GBP'] as const;
  type Currency = typeof currencyOptions[number];
  const [baseCurrency, setBaseCurrency] = useState<Currency>('TRY');
  const [vatRate, setVatRate] = useState<number>(20);
  
  // Form State
  const [items, setItems] = useState<Array<{
    name: string;
    unit: string;
    quantity: number;
    waste: number;
    unitPrice: number;
    currency: Currency;
  }>>([]);

  const [overheadCost, setOverheadCost] = useState(0);
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

  const [imagePreviews, setImagePreviews] = useState<(string | null)[]>([null, null, null, null, null]);
  const image1Ref = useRef<HTMLInputElement | null>(null);
  const image2Ref = useRef<HTMLInputElement | null>(null);
  const image3Ref = useRef<HTMLInputElement | null>(null);
  const image4Ref = useRef<HTMLInputElement | null>(null);
  const image5Ref = useRef<HTMLInputElement | null>(null);

  // Calculations
  const calculateTotal = () => {
    let materialCost = 0;
    items.forEach(it => {
      const usage = it.quantity * (1 + it.waste / 100);
      // Not: Farklı para birimlerinde toplama yapılırsa uyarı metni aşağıda gösteriliyor.
      materialCost += usage * it.unitPrice;
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

  const addItemRow = () => {
    setItems([...items, { name: '', unit: 'adet', quantity: 1, waste: 0, unitPrice: 0, currency: 'TRY' }]);
  };

  const removeItemRow = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const updateMaterialRow = (
    index: number,
    field: 'name' | 'unit' | 'quantity' | 'waste' | 'unitPrice' | 'currency',
    value: string | number
  ) => {
    const newItems = [...items];
    if (field === 'name') {
      newItems[index].name = String(value);
    } else if (field === 'unit') {
      newItems[index].unit = String(value);
    } else if (field === 'quantity') {
      newItems[index].quantity = Number(value);
    } else if (field === 'waste') {
      newItems[index].waste = Number(value);
    } else if (field === 'unitPrice') {
      newItems[index].unitPrice = Number(value);
    } else if (field === 'currency') {
      newItems[index].currency = String(value) as Currency;
    }
    setItems(newItems);
  };

  const imageRefs = [image1Ref, image2Ref, image3Ref, image4Ref, image5Ref];

  const handleImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
    setImagePreviews((prev) => {
      const next = [...prev];
      next[index] = file ? URL.createObjectURL(file) : null;
      return next;
    });
  };

  const handleImageClear = (index: number) => {
    const input = imageRefs[index].current;
    if (input) {
      input.value = '';
    }
    setImagePreviews((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formElement = e.currentTarget;
    const formData = new FormData(formElement);
    const data: {
      name: FormDataEntryValue | null;
      code: FormDataEntryValue | null;
      description?: string;
      laborCost: number;
      overheadCost: number;
      profitMargin: number;
      manualRecipe?: Array<{
        name: string;
        unit: string;
        quantity: number;
        waste: number;
        unitPrice: number;
        currency: string;
      }>;
      materials?: Array<{ materialId: string; quantity: number; waste: number }>;
    } = {
      name: formData.get('name'),
      code: formData.get('code'),
      description: String(formData.get('description') || '').trim() || undefined,
      laborCost: jobCost,
      overheadCost: overheadCost + extrasCost,
      profitMargin,
      manualRecipe: items.map((it) => ({
        name: it.name,
        unit: it.unit,
        quantity: it.quantity,
        waste: it.waste,
        unitPrice: it.unitPrice,
        currency: it.currency,
      })),
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

      const created = await res.json();
      const productId: string | undefined = created?.id;

      const files: File[] = [];
      ['image1', 'image2', 'image3', 'image4', 'image5'].forEach((name) => {
        const input = formElement.elements.namedItem(name) as HTMLInputElement | null;
        const file = input && input.files && input.files[0] ? input.files[0] : undefined;
        if (file) files.push(file);
      });

      // Görseller varsa yükle
      if (productId && files.length > 0) {
        const uploadForm = new FormData();
        uploadForm.set('productId', productId);
        files.forEach((f) => uploadForm.append('images', f));

        const uploadRes = await fetch('/api/products/upload-images', {
          method: 'POST',
          body: uploadForm,
        });
        if (!uploadRes.ok) {
          const j = await uploadRes.json().catch(() => ({}));
          throw new Error(j.error || 'Görseller yüklenemedi');
        }
      }

      router.push('/dashboard/products');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
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

            <div className="sm:col-span-6">
              <label className="block text-sm font-medium leading-6 text-gray-900">Açıklama</label>
              <div className="mt-2">
                <textarea
                  name="description"
                  rows={3}
                  placeholder="Ürün ve maliyet kalıbı ile ilgili açıklama"
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
            <h3 className="text-base font-semibold leading-6 text-gray-900">Reçete / Kalemler</h3>
            <p className="mt-1 text-sm text-gray-500">Kumaş ve aksesuarları elle giriniz.</p>
          </div>

          <div className="mt-6">
            {items.map((it, index) => (
              <div key={index} className="mb-4 bg-gray-50 p-4 rounded-lg space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Kalem Adı / Türü</label>
                  <textarea
                    value={it.name}
                    onChange={(e) => updateMaterialRow(index, 'name', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm sm:text-sm p-2 border min-h-24"
                    placeholder="Örn. Kumaş - Pamuk"
                    rows={4}
                  />
                </div>
                <div className="flex flex-wrap gap-4 items-end">
                  <div className="w-36">
                    <label className="block text-sm font-medium text-gray-700">Birim</label>
                    <select
                      value={it.unit}
                      onChange={(e) => updateMaterialRow(index, 'unit', e.target.value)}
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
                      value={it.quantity}
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
                      value={it.waste}
                      onChange={(e) => updateMaterialRow(index, 'waste', Number(e.target.value))}
                      min="0"
                      step="0.1"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                    />
                  </div>
                  <div className="w-40">
                    <label className="block text-sm font-medium text-gray-700">Birim Fiyat</label>
                    <input
                      type="number"
                      value={it.unitPrice}
                      onChange={(e) => updateMaterialRow(index, 'unitPrice', Number(e.target.value))}
                      min="0"
                      step="0.01"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                    />
                  </div>
                  <div className="w-28">
                    <label className="block text-sm font-medium text-gray-700">Para Birimi</label>
                    <select
                      value={it.currency}
                      onChange={(e) => updateMaterialRow(index, 'currency', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                    >
                      {currencyOptions.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItemRow(index)}
                    className="bg-red-100 text-red-600 px-3 py-2 rounded hover:bg-red-200 text-sm"
                  >
                    Sil
                  </button>
                </div>
              </div>
            ))}
            
            <button
              type="button"
              onClick={addItemRow}
              className="mt-2 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              + Kalem Ekle
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
              <label className="block text-sm font-medium text-gray-700">Diğer Genel Giderler</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  type="number"
                  value={overheadCost}
                  onChange={(e) => setOverheadCost(Number(e.target.value))}
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

        <div className="pt-8">
          <div>
            <h3 className="text-base font-semibold leading-6 text-gray-900">Ürün Görselleri ve Kalıp</h3>
            <p className="mt-1 text-sm text-gray-500">En fazla 5 görsel ekleyiniz. Kalıp resmi opsiyonel.</p>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-5">
            {[
              { label: 'Görsel 1', name: 'image1', ref: image1Ref },
              { label: 'Görsel 2', name: 'image2', ref: image2Ref },
              { label: 'Görsel 3', name: 'image3', ref: image3Ref },
              { label: 'Görsel 4', name: 'image4', ref: image4Ref },
              { label: 'Kalıp Resmi', name: 'image5', ref: image5Ref },
            ].map((slot, index) => (
              <div key={slot.name} className="border rounded-lg p-3 flex flex-col items-stretch">
                <div className="w-full aspect-square rounded-md bg-gray-50 flex items-center justify-center overflow-hidden">
                  {imagePreviews[index] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imagePreviews[index] as string} alt={slot.label} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-xs text-gray-400 text-center px-2">Görsel yok</span>
                  )}
                </div>
                <div className="mt-2 text-xs font-medium text-gray-700 text-center">{slot.label}</div>
                <div className="mt-2 flex justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => slot.ref.current && slot.ref.current.click()}
                    className="px-2 py-1 text-xs rounded-md bg-indigo-600 text-white hover:bg-indigo-500"
                  >
                    Ekle
                  </button>
                  {imagePreviews[index] && (
                    <button
                      type="button"
                      onClick={() => handleImageClear(index)}
                      className="px-2 py-1 text-xs rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300"
                    >
                      Sil
                    </button>
                  )}
                </div>
                <input
                  ref={slot.ref}
                  type="file"
                  name={slot.name}
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageChange(index, e)}
                />
              </div>
            ))}
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
