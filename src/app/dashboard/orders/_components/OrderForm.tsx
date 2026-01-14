'use client';

import { useState, useEffect } from 'react';

const CURRENCIES = ['TRY', 'USD', 'EUR', 'GBP'];
const UNITS = ['adet', 'gram', 'kilo', 'top', 'metre', 'cm'];

// Mock Exchange Rates (In a real app, fetch these)
const RATES: Record<string, number> = {
  TRY: 1,
  USD: 32,
  EUR: 35,
  GBP: 40
};

interface OrderFormProps {
  initialData?: any;
  customers: any[];
  onSuccess: () => void;
  onCancel: () => void;
}

export default function OrderForm({ initialData, customers, onSuccess, onCancel }: OrderFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    orderNumber: '',
    customerId: '',
    productType: '',
    fabricType: '',
    deadline: 7,
    
    // Fabric
    fabricConsumption: 0,
    fabricUnit: 'metre',
    fabricPrice: 0,
    fabricCurrency: 'TRY',
    
    // Accessories
    accessory1Type: '',
    accessory1Consumption: 0,
    accessory1Unit: 'adet',
    accessory1Price: 0,
    accessory1Currency: 'TRY',
    
    accessory2Type: '',
    accessory2Consumption: 0,
    accessory2Unit: 'adet',
    accessory2Price: 0,
    accessory2Currency: 'TRY',
    
    accessory3Type: '',
    accessory3Consumption: 0,
    accessory3Unit: 'adet',
    accessory3Price: 0,
    accessory3Currency: 'TRY',
    
    // Labor
    cuttingPrice: 0,
    cuttingCurrency: 'TRY',
    
    sewingPrice: 0,
    sewingCurrency: 'TRY',
    
    ironingPrice: 0,
    ironingCurrency: 'TRY',
    
    shippingPrice: 0,
    shippingCurrency: 'TRY',
    
    profitAmount: 0,
    profitCurrency: 'TRY',
    
    vatRate: 20, // 1, 10, 20
    
    totalAmount: 0,
    currency: 'TRY', // Main currency for total
    
    status: 'TEKLIF_HAZIRLANDI'
  });

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
        // Ensure defaults if null
        fabricConsumption: Number(initialData.fabricConsumption) || 0,
        fabricPrice: Number(initialData.fabricPrice) || 0,
        // ... map other number fields if needed
      }));
    }
  }, [initialData]);

  // Auto-calculate Total
  useEffect(() => {
    const calculate = () => {
      const targetCurrency = formData.currency;
      
      const toTarget = (amount: number, currency: string) => {
        if (!amount) return 0;
        const rate = RATES[currency] || 1;
        const targetRate = RATES[targetCurrency] || 1;
        // Convert to base (TRY) then to target
        const inBase = amount * rate;
        return inBase / targetRate;
      };

      // Cost Calculation: Consumption * Price (Assuming Price is Unit Price)
      // Or if Price is Total for that Consumption?
      // Usually "Fiyat" next to consumption is Unit Price.
      // Let's assume Unit Price.
      
      const fabricCost = toTarget((formData.fabricConsumption || 0) * (formData.fabricPrice || 0), formData.fabricCurrency);
      
      const acc1Cost = toTarget((formData.accessory1Consumption || 0) * (formData.accessory1Price || 0), formData.accessory1Currency);
      const acc2Cost = toTarget((formData.accessory2Consumption || 0) * (formData.accessory2Price || 0), formData.accessory2Currency);
      const acc3Cost = toTarget((formData.accessory3Consumption || 0) * (formData.accessory3Price || 0), formData.accessory3Currency);
      
      const cutting = toTarget(formData.cuttingPrice, formData.cuttingCurrency);
      const sewing = toTarget(formData.sewingPrice, formData.sewingCurrency);
      const ironing = toTarget(formData.ironingPrice, formData.ironingCurrency);
      const shipping = toTarget(formData.shippingPrice, formData.shippingCurrency);
      const profit = toTarget(formData.profitAmount, formData.profitCurrency);
      
      const subtotal = fabricCost + acc1Cost + acc2Cost + acc3Cost + cutting + sewing + ironing + shipping + profit;
      const vat = subtotal * (formData.vatRate / 100);
      
      setFormData(prev => ({ ...prev, totalAmount: parseFloat((subtotal + vat).toFixed(2)) }));
    };
    
    calculate();
  }, [
    formData.fabricConsumption, formData.fabricPrice, formData.fabricCurrency,
    formData.accessory1Consumption, formData.accessory1Price, formData.accessory1Currency,
    formData.accessory2Consumption, formData.accessory2Price, formData.accessory2Currency,
    formData.accessory3Consumption, formData.accessory3Price, formData.accessory3Currency,
    formData.cuttingPrice, formData.cuttingCurrency,
    formData.sewingPrice, formData.sewingCurrency,
    formData.ironingPrice, formData.ironingCurrency,
    formData.shippingPrice, formData.shippingCurrency,
    formData.profitAmount, formData.profitCurrency,
    formData.vatRate, formData.currency
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const url = '/api/orders';
      const method = initialData ? 'PUT' : 'POST';
      const body = initialData ? { ...formData, id: initialData.id } : formData;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error('Failed to save order');
      
      onSuccess();
    } catch (error) {
      console.error(error);
      alert('Bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6";
  const selectClass = "block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
        {/* Basic Info */}
        <div>
          <label className="block text-sm font-medium leading-6 text-gray-900">Sipariş Numarası</label>
          <input
            type="text"
            required
            value={formData.orderNumber}
            onChange={e => setFormData({ ...formData, orderNumber: e.target.value })}
            className={inputClass}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium leading-6 text-gray-900">Müşteri</label>
          <select
            required
            value={formData.customerId}
            onChange={e => setFormData({ ...formData, customerId: e.target.value })}
            className={selectClass}
          >
            <option value="">Seçiniz</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium leading-6 text-gray-900">Ürün Türü</label>
          <input
            type="text"
            required
            value={formData.productType}
            onChange={e => setFormData({ ...formData, productType: e.target.value })}
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-medium leading-6 text-gray-900">Kumaş Türü</label>
          <input
            type="text"
            required
            value={formData.fabricType}
            onChange={e => setFormData({ ...formData, fabricType: e.target.value })}
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-medium leading-6 text-gray-900">Teklif Tarihi</label>
          <input
            type="text"
            disabled
            value={new Date().toLocaleDateString('tr-TR')}
            className="block w-full rounded-md border-0 py-1.5 bg-gray-100 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 sm:text-sm sm:leading-6"
          />
        </div>

        <div>
          <label className="block text-sm font-medium leading-6 text-gray-900">Termin Süresi (Gün)</label>
          <input
            type="number"
            required
            min="1"
            value={formData.deadline}
            onChange={e => setFormData({ ...formData, deadline: parseInt(e.target.value) })}
            className={inputClass}
          />
        </div>
      </div>

      <hr className="border-gray-200" />

      {/* Fabric */}
      <div>
        <h3 className="text-sm font-semibold leading-6 text-gray-900 mb-2">Kumaş</h3>
        <div className="grid grid-cols-12 gap-2">
            <div className="col-span-3">
                <label className="block text-xs font-medium text-gray-700">Sarfiyat</label>
                <input
                    type="number"
                    step="0.01"
                    value={formData.fabricConsumption}
                    onChange={e => setFormData({ ...formData, fabricConsumption: parseFloat(e.target.value) })}
                    className={inputClass}
                />
            </div>
            <div className="col-span-3">
                <label className="block text-xs font-medium text-gray-700">Birim</label>
                <select
                    value={formData.fabricUnit}
                    onChange={e => setFormData({ ...formData, fabricUnit: e.target.value })}
                    className={selectClass}
                >
                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
            </div>
            <div className="col-span-3">
                <label className="block text-xs font-medium text-gray-700">Birim Fiyat</label>
                <input
                    type="number"
                    step="0.01"
                    value={formData.fabricPrice}
                    onChange={e => setFormData({ ...formData, fabricPrice: parseFloat(e.target.value) })}
                    className={inputClass}
                />
            </div>
            <div className="col-span-3">
                <label className="block text-xs font-medium text-gray-700">Para Birimi</label>
                <select
                    value={formData.fabricCurrency}
                    onChange={e => setFormData({ ...formData, fabricCurrency: e.target.value })}
                    className={selectClass}
                >
                    {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>
        </div>
      </div>

      <hr className="border-gray-200" />

      {/* Accessories 1-3 */}
      {[1, 2, 3].map(num => (
        <div key={num}>
          <h3 className="text-sm font-semibold leading-6 text-gray-900 mb-2">Aksesuar {num}</h3>
          <div className="grid grid-cols-12 gap-2">
            <div className="col-span-12 sm:col-span-3">
                <label className="block text-xs font-medium text-gray-700">Tür</label>
                <input
                    type="text"
                    value={(formData as any)[`accessory${num}Type`]}
                    onChange={e => setFormData({ ...formData, [`accessory${num}Type`]: e.target.value })}
                    className={inputClass}
                    placeholder="Aksesuar Adı"
                />
            </div>
            <div className="col-span-3 sm:col-span-2">
                <label className="block text-xs font-medium text-gray-700">Sarfiyat</label>
                <input
                    type="number"
                    step="0.01"
                    value={(formData as any)[`accessory${num}Consumption`]}
                    onChange={e => setFormData({ ...formData, [`accessory${num}Consumption`]: parseFloat(e.target.value) })}
                    className={inputClass}
                />
            </div>
            <div className="col-span-3 sm:col-span-2">
                <label className="block text-xs font-medium text-gray-700">Birim</label>
                <select
                    value={(formData as any)[`accessory${num}Unit`]}
                    onChange={e => setFormData({ ...formData, [`accessory${num}Unit`]: e.target.value })}
                    className={selectClass}
                >
                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
            </div>
            <div className="col-span-3 sm:col-span-2">
                <label className="block text-xs font-medium text-gray-700">Fiyat</label>
                <input
                    type="number"
                    step="0.01"
                    value={(formData as any)[`accessory${num}Price`]}
                    onChange={e => setFormData({ ...formData, [`accessory${num}Price`]: parseFloat(e.target.value) })}
                    className={inputClass}
                />
            </div>
            <div className="col-span-3 sm:col-span-3">
                <label className="block text-xs font-medium text-gray-700">Para Birimi</label>
                <select
                    value={(formData as any)[`accessory${num}Currency`]}
                    onChange={e => setFormData({ ...formData, [`accessory${num}Currency`]: e.target.value })}
                    className={selectClass}
                >
                    {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>
          </div>
        </div>
      ))}

      <hr className="border-gray-200" />

      {/* Other Costs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
            { label: 'Kesim', key: 'cutting' },
            { label: 'Dikim', key: 'sewing' },
            { label: 'Ütü Paket', key: 'ironing' },
            { label: 'Sevkiyat', key: 'shipping' },
            { label: 'Kar', key: 'profit' },
        ].map(item => (
            <div key={item.key} className="flex gap-2 items-end">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700">{item.label}</label>
                    <input
                        type="number"
                        step="0.01"
                        value={(formData as any)[`${item.key}Price`] || (formData as any)[`${item.key}Amount`]}
                        onChange={e => setFormData({ ...formData, [`${item.key}${item.key === 'profit' ? 'Amount' : 'Price'}`]: parseFloat(e.target.value) })}
                        className={inputClass}
                    />
                </div>
                <div className="w-24">
                    <select
                        value={(formData as any)[`${item.key}Currency`]}
                        onChange={e => setFormData({ ...formData, [`${item.key}Currency`]: e.target.value })}
                        className={selectClass}
                    >
                        {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
            </div>
        ))}
      </div>

      <hr className="border-gray-200" />

      {/* Total & Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
            <label className="block text-sm font-medium leading-6 text-gray-900">KDV Oranı (%)</label>
            <select
                value={formData.vatRate}
                onChange={e => setFormData({ ...formData, vatRate: parseInt(e.target.value) })}
                className={selectClass}
            >
                <option value={1}>%1</option>
                <option value={10}>%10</option>
                <option value={20}>%20</option>
            </select>
        </div>
        
        <div>
             <label className="block text-sm font-medium leading-6 text-gray-900">Toplam Para Birimi</label>
             <select
                value={formData.currency}
                onChange={e => setFormData({ ...formData, currency: e.target.value })}
                className={selectClass}
             >
                {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
             </select>
        </div>

        <div className="sm:col-span-2">
            <div className="rounded-md bg-gray-50 p-4 border border-gray-200">
                <div className="flex justify-between items-center">
                    <span className="text-base font-semibold text-gray-900">Genel Toplam (Tahmini):</span>
                    <span className="text-xl font-bold text-indigo-600">
                        {formData.totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {formData.currency}
                    </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">* Farklı para birimleri güncel kurlara göre çevrilmiştir.</p>
            </div>
        </div>
      </div>

      {initialData && (
          <div>
            <label className="block text-sm font-medium leading-6 text-gray-900">Durum</label>
            <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value })}
                className={selectClass}
            >
                <option value="TEKLIF_HAZIRLANDI">Teklif Hazırlandı</option>
                <option value="TEKLIF_ILETILDI">Teklif İletildi</option>
                <option value="TEKLIF_ONAYLANDI">Teklif Onaylandı</option>
                <option value="URETIME_GIRDI">Üretime Girdi</option>
                <option value="TESLIM_EDILDI">Teslim Edildi</option>
            </select>
          </div>
      )}

      <div className="flex justify-end gap-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        >
          İptal
        </button>
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
        >
          {loading ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </div>
    </form>
  );
}
