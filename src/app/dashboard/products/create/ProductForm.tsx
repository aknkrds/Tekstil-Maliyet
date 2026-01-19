'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function ProductForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const currencyOptions = ['TRY', 'USD', 'EUR', 'GBP'] as const;
  type Currency = typeof currencyOptions[number];
  type NumericInput = number | '';

  const [baseCurrency, setBaseCurrency] = useState<Currency>('USD');
  const [vatRate, setVatRate] = useState<number>(20);
  
  // Form State
  const [items, setItems] = useState<Array<{
    name: string;
    unit: string;
    quantity: NumericInput;
    waste: NumericInput;
    unitPrice: NumericInput;
    currency: Currency;
  }>>([]);

  const [overheadCost, setOverheadCost] = useState<NumericInput>('');
  const [profitMargin, setProfitMargin] = useState<NumericInput>('');

  // İş kalemleri (iş başı)
  const [cuttingPrice, setCuttingPrice] = useState<NumericInput>('');
  const [cuttingCurrency, setCuttingCurrency] = useState<Currency>('USD');

  const [sewingPrice, setSewingPrice] = useState<NumericInput>('');
  const [sewingCurrency, setSewingCurrency] = useState<Currency>('USD');

  const [ironingPackagingPrice, setIroningPackagingPrice] = useState<NumericInput>('');
  const [ironingPackagingCurrency, setIroningPackagingCurrency] = useState<Currency>('USD');

  const [samplePrice, setSamplePrice] = useState<NumericInput>('');
  const [sampleCurrency, setSampleCurrency] = useState<Currency>('USD');

  const [shippingPrice, setShippingPrice] = useState<NumericInput>('');
  const [shippingCurrency, setShippingCurrency] = useState<Currency>('USD');

  const [imagePreviews, setImagePreviews] = useState<(string | null)[]>([null, null, null, null, null]);
  const image1Ref = useRef<HTMLInputElement | null>(null);
  const image2Ref = useRef<HTMLInputElement | null>(null);
  const image3Ref = useRef<HTMLInputElement | null>(null);
  const image4Ref = useRef<HTMLInputElement | null>(null);
  const image5Ref = useRef<HTMLInputElement | null>(null);

  // Helper to convert NumericInput to number for calculations
  const val = (v: NumericInput) => (v === '' ? 0 : v);

  // Calculations
  const calculateTotal = () => {
    let materialCost = 0;
    items.forEach(it => {
      const q = val(it.quantity);
      const w = val(it.waste);
      const p = val(it.unitPrice);
      const usage = q * (1 + w / 100);
      // Not: Farklı para birimlerinde toplama yapılırsa uyarı metni aşağıda gösteriliyor.
      materialCost += usage * p;
    });
    const jobCost = val(cuttingPrice) + val(sewingPrice) + val(ironingPackagingPrice);
    const extrasCost = val(samplePrice) + val(shippingPrice);
    const aggregatedLabor = jobCost; // işçilik olarak say
    const aggregatedOverhead = val(overheadCost) + extrasCost; // genel giderlere ekle
    const totalCost = materialCost + aggregatedLabor + aggregatedOverhead;
    const finalPrice = totalCost * (1 + val(profitMargin) / 100);
    const grandTotalWithVat = finalPrice * (1 + vatRate / 100);
    return { materialCost, totalCost, finalPrice, grandTotalWithVat, jobCost, extrasCost };
  };

  const { materialCost, totalCost, finalPrice, grandTotalWithVat, jobCost, extrasCost } = calculateTotal();

  const addItemRow = () => {
    setItems([...items, { name: '', unit: 'adet', quantity: 1, waste: '', unitPrice: '', currency: 'USD' }]);
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
      newItems[index].quantity = value === '' ? '' : Number(value);
    } else if (field === 'waste') {
      newItems[index].waste = value === '' ? '' : Number(value);
    } else if (field === 'unitPrice') {
      newItems[index].unitPrice = value === '' ? '' : Number(value);
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
      overheadCost: val(overheadCost) + extrasCost,
      profitMargin: val(profitMargin),
      manualRecipe: items.map((it) => ({
        name: it.name,
        unit: it.unit,
        quantity: val(it.quantity),
        waste: val(it.waste),
        unitPrice: val(it.unitPrice),
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

  const inputClassName = "block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border";
  const sectionClassName = "bg-white rounded-lg shadow-sm p-6 border border-gray-200 space-y-6";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-6">
        
        {/* Ürün Bilgileri Section */}
        <div className={sectionClassName}>
          <div>
            <h3 className="text-base font-semibold leading-6 text-gray-900">Ürün Bilgileri</h3>
            <p className="mt-1 text-sm text-gray-500">Temel ürün bilgileri.</p>
          </div>
          
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label className="block text-sm font-medium leading-6 text-gray-900">Ürün Adı</label>
              <div className="mt-2">
                <input
                  type="text"
                  name="name"
                  required
                  className={inputClassName}
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label className="block text-sm font-medium leading-6 text-gray-900">Ürün Kodu</label>
              <div className="mt-2">
                <input
                  type="text"
                  name="code"
                  className={inputClassName}
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
                  className={inputClassName}
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label className="block text-sm font-medium leading-6 text-gray-900">Genel Para Birimi</label>
              <div className="mt-2">
                <select
                  value={baseCurrency}
                  onChange={(e) => setBaseCurrency(e.target.value as Currency)}
                  className={inputClassName}
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
                  className={inputClassName}
                >
                  <option value={1}>%1</option>
                  <option value={10}>%10</option>
                  <option value={20}>%20</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Reçete / Kalemler Section */}
        <div className={sectionClassName}>
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-semibold leading-6 text-gray-900">Reçete / Kalemler</h3>
              <p className="mt-1 text-sm text-gray-500">Kumaş ve aksesuarları elle giriniz.</p>
            </div>
            <button
              type="button"
              onClick={addItemRow}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              + Kalem Ekle
            </button>
          </div>

          <div className="space-y-4">
            {items.map((it, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Kalem Adı / Türü</label>
                  <input
                    type="text"
                    value={it.name}
                    onChange={(e) => updateMaterialRow(index, 'name', e.target.value)}
                    className={inputClassName}
                    placeholder="Örn. Kumaş - Pamuk"
                  />
                </div>
                <div className="flex flex-wrap gap-4 items-end">
                  <div className="flex-1 min-w-[120px]">
                    <label className="block text-sm font-medium text-gray-700">Birim</label>
                    <select
                      value={it.unit}
                      onChange={(e) => updateMaterialRow(index, 'unit', e.target.value)}
                      className={inputClassName}
                    >
                      <option value="adet">Adet</option>
                      <option value="gram">Gram</option>
                      <option value="kilo">Kilo</option>
                      <option value="metre">Metre</option>
                      <option value="top">Top</option>
                    </select>
                  </div>
                  <div className="flex-1 min-w-[100px]">
                    <label className="block text-sm font-medium text-gray-700">Miktar</label>
                    <input
                      type="number"
                      value={it.quantity}
                      onChange={(e) => updateMaterialRow(index, 'quantity', e.target.value)}
                      min="0"
                      step="0.01"
                      className={inputClassName}
                    />
                  </div>
                  <div className="flex-1 min-w-[100px]">
                    <label className="block text-sm font-medium text-gray-700">Fire %</label>
                    <input
                      type="number"
                      value={it.waste}
                      onChange={(e) => updateMaterialRow(index, 'waste', e.target.value)}
                      min="0"
                      step="0.1"
                      className={inputClassName}
                    />
                  </div>
                  <div className="flex-1 min-w-[120px]">
                    <label className="block text-sm font-medium text-gray-700">Birim Fiyat</label>
                    <input
                      type="number"
                      value={it.unitPrice}
                      onChange={(e) => updateMaterialRow(index, 'unitPrice', e.target.value)}
                      min="0"
                      step="0.01"
                      className={inputClassName}
                    />
                  </div>
                  <div className="flex-1 min-w-[100px]">
                    <label className="block text-sm font-medium text-gray-700">Para Birimi</label>
                    <select
                      value={it.currency}
                      onChange={(e) => updateMaterialRow(index, 'currency', e.target.value)}
                      className={inputClassName}
                    >
                      {currencyOptions.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItemRow(index)}
                    className="bg-red-100 text-red-600 px-3 py-2 rounded hover:bg-red-200 text-sm h-[38px]"
                  >
                    Sil
                  </button>
                </div>
              </div>
            ))}
            {items.length === 0 && (
                <div className="text-center py-6 text-gray-500 text-sm bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    Henüz reçete kalemi eklenmedi.
                </div>
            )}
          </div>
        </div>

        {/* İş Kalemleri Section */}
        <div className={sectionClassName}>
          <div>
            <h3 className="text-base font-semibold leading-6 text-gray-900">İş Kalemleri (İş başına)</h3>
            <p className="mt-1 text-sm text-gray-500">Kesim, dikim, ütü/paket; numune ve sevkiyat.</p>
          </div>

          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Kesim Fiyatı</label>
              <div className="mt-1 flex gap-2">
                <input
                  type="number"
                  value={cuttingPrice}
                  onChange={(e) => setCuttingPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  min="0"
                  step="0.01"
                  className={inputClassName}
                />
                <select
                  value={cuttingCurrency}
                  onChange={(e) => setCuttingCurrency(e.target.value as Currency)}
                  className={`${inputClassName} w-24`}
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
                  onChange={(e) => setSewingPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  min="0"
                  step="0.01"
                  className={inputClassName}
                />
                <select
                  value={sewingCurrency}
                  onChange={(e) => setSewingCurrency(e.target.value as Currency)}
                  className={`${inputClassName} w-24`}
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
                  onChange={(e) => setIroningPackagingPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  min="0"
                  step="0.01"
                  className={inputClassName}
                />
                <select
                  value={ironingPackagingCurrency}
                  onChange={(e) => setIroningPackagingCurrency(e.target.value as Currency)}
                  className={`${inputClassName} w-24`}
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
                  onChange={(e) => setSamplePrice(e.target.value === '' ? '' : Number(e.target.value))}
                  min="0"
                  step="0.01"
                  className={inputClassName}
                />
                <select
                  value={sampleCurrency}
                  onChange={(e) => setSampleCurrency(e.target.value as Currency)}
                  className={`${inputClassName} w-24`}
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
                  onChange={(e) => setShippingPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  min="0"
                  step="0.01"
                  className={inputClassName}
                />
                <select
                  value={shippingCurrency}
                  onChange={(e) => setShippingCurrency(e.target.value as Currency)}
                  className={`${inputClassName} w-24`}
                >
                  {currencyOptions.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Maliyet ve Fiyatlandırma Section */}
        <div className={sectionClassName}>
          <div>
            <h3 className="text-base font-semibold leading-6 text-gray-900">Maliyet ve Fiyatlandırma</h3>
            <p className="mt-1 text-sm text-gray-500">İşçilik, genel giderler ve kar marjı.</p>
          </div>

          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">İşçilik Maliyeti</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  type="number"
                  value={jobCost}
                  readOnly
                  className={`${inputClassName} bg-gray-50`}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Diğer Genel Giderler</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  type="number"
                  value={overheadCost}
                  onChange={(e) => setOverheadCost(e.target.value === '' ? '' : Number(e.target.value))}
                  min="0"
                  step="0.01"
                  className={inputClassName}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Kar Marjı (%)</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  type="number"
                  value={profitMargin}
                  onChange={(e) => setProfitMargin(e.target.value === '' ? '' : Number(e.target.value))}
                  min="0"
                  step="0.1"
                  className={inputClassName}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Ürün Görselleri Section */}
        <div className={sectionClassName}>
          <div>
            <h3 className="text-base font-semibold leading-6 text-gray-900">Ürün Görselleri ve Kalıp</h3>
            <p className="mt-1 text-sm text-gray-500">En fazla 5 görsel ekleyiniz. Kalıp resmi opsiyonel.</p>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
            {[
              { label: 'Görsel 1', name: 'image1', ref: image1Ref },
              { label: 'Görsel 2', name: 'image2', ref: image2Ref },
              { label: 'Görsel 3', name: 'image3', ref: image3Ref },
              { label: 'Görsel 4', name: 'image4', ref: image4Ref },
              { label: 'Kalıp Resmi', name: 'image5', ref: image5Ref },
            ].map((slot, index) => (
              <div key={slot.name} className="border border-gray-200 rounded-lg p-3 flex flex-col items-center bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="w-full aspect-square rounded-md bg-white border border-gray-200 flex items-center justify-center overflow-hidden relative">
                  {imagePreviews[index] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imagePreviews[index] as string} alt={slot.label} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-xs text-gray-400 text-center px-2">Görsel yok</span>
                  )}
                </div>
                <div className="mt-2 text-xs font-medium text-gray-700 text-center">{slot.label}</div>
                <div className="mt-2 flex justify-center gap-2 w-full">
                  <button
                    type="button"
                    onClick={() => slot.ref.current && slot.ref.current.click()}
                    className="flex-1 px-2 py-1 text-xs rounded-md bg-indigo-600 text-white hover:bg-indigo-500 transition-colors"
                  >
                    Ekle
                  </button>
                  {imagePreviews[index] && (
                    <button
                      type="button"
                      onClick={() => handleImageClear(index)}
                      className="px-2 py-1 text-xs rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
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
        <div className="bg-indigo-50 rounded-lg p-6 border border-indigo-100">
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

      <div className="pt-5 flex justify-end gap-3 border-t border-gray-200">
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
            className="rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
      </div>
      
      {error && (
        <div className="rounded-md bg-red-50 p-4 border border-red-200">
           <div className="flex">
             <div className="ml-3">
               <h3 className="text-sm font-medium text-red-800">Bir hata oluştu</h3>
               <div className="mt-2 text-sm text-red-700">
                 <p>{error}</p>
               </div>
             </div>
           </div>
        </div>
      )}
    </form>
  );
}
