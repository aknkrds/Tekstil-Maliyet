'use client';

import { useState, useEffect } from 'react';

interface Customer {
  id: string;
  name: string;
}

interface Material {
  price: number;
}

interface ProductMaterial {
  quantity: number;
  waste: number;
  material: Material;
}

interface Product {
  id: string;
  name: string;
  code?: string | null;
  description?: string | null;
  laborCost?: number;
  overheadCost?: number;
  profitMargin?: number;
  materials: ProductMaterial[];
  manualRecipe?: any[] | null;
}

interface Order {
  id?: string;
  orderNumber?: string;
  customerId?: string;
  customer?: Customer;
  productId?: string | null;
  product?: Product;
  quantity?: number;
  status?: string;
  deadlineDate?: string | Date | null;
  marginType?: string | null;
  marginValue?: number | null;
  baseAmount?: number | null;
  totalAmount?: number | null;
  profitAmount?: number | null;
}

interface OrderFormProps {
  initialData?: Order | null;
  customers: Customer[];
  products: Product[];
  onSuccess: () => void;
  onCancel: () => void;
}

type MarginType = 'PERCENT' | 'AMOUNT';

type NumericInput = number | '';
const val = (v: NumericInput) => (v === '' ? 0 : v);

export default function OrderForm({ initialData, customers, products, onSuccess, onCancel }: OrderFormProps) {
  const [loading, setLoading] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState<NumericInput>(1);
  const [deadlineDate, setDeadlineDate] = useState('');
  const [marginType, setMarginType] = useState<MarginType>('PERCENT');
  const [marginValue, setMarginValue] = useState<NumericInput>('');
  const [baseAmount, setBaseAmount] = useState<number>(0);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [status, setStatus] = useState<string>('TEKLIF_OLUSTURULDU');

  // Common styles
  const sectionClassName = "bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4";
  const labelClassName = "block text-sm font-medium text-slate-700 mb-1";
  const inputClassName = "block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm";
  const selectClassName = "block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm";

  useEffect(() => {
    if (initialData) {
      setOrderNumber(initialData.orderNumber || '');
      setCustomerId(initialData.customerId || initialData.customer?.id || '');
      setProductId(initialData.productId || initialData.product?.id || '');
      setQuantity(initialData.quantity || 1);
      setStatus(initialData.status || 'TEKLIF_OLUSTURULDU');
      if (initialData.deadlineDate) {
        const d = new Date(initialData.deadlineDate);
        if (!isNaN(d.getTime())) {
          setDeadlineDate(d.toISOString().split('T')[0]);
        }
      }
      if (typeof initialData.marginType === 'string') {
        if (initialData.marginType === 'PERCENT' || initialData.marginType === 'AMOUNT') {
          setMarginType(initialData.marginType);
        }
      }
      if (initialData.marginValue != null) {
        setMarginValue(Number(initialData.marginValue));
      }
      if (initialData.baseAmount != null) {
        setBaseAmount(Number(initialData.baseAmount));
      } else if (initialData.totalAmount != null && initialData.profitAmount != null) {
        const base = Number(initialData.totalAmount) - Number(initialData.profitAmount);
        setBaseAmount(base);
      }
      if (initialData.totalAmount != null) {
        setTotalAmount(Number(initialData.totalAmount));
      }
    }
  }, [initialData]);

  useEffect(() => {
    const product = products.find(p => p.id === productId);
    if (!product) {
      setBaseAmount(0);
      setTotalAmount(0);
      return;
    }

    let materialCost = 0;
    product.materials.forEach((pm: ProductMaterial) => {
      const quantity = Number(pm.quantity);
      const waste = Number(pm.waste);
      const price = Number(pm.material.price);
      const usage = quantity * (1 + waste / 100);
      materialCost += usage * price;
    });

    if (product.manualRecipe && Array.isArray(product.manualRecipe)) {
      product.manualRecipe.forEach((item: any) => {
        const q = Number(item.quantity || 0);
        const w = Number(item.waste || 0);
        const p = Number(item.unitPrice || 0);
        const usage = q * (1 + w / 100);
        materialCost += usage * p;
      });
    }

    const labor = Number(product.laborCost || 0);
    const overhead = Number(product.overheadCost || 0);
    const baseWithoutProductProfit = materialCost + labor + overhead;
    const productProfitMargin = Number(product.profitMargin || 0);
    const productBaseWithProfit = baseWithoutProductProfit * (1 + productProfitMargin / 100);

    setBaseAmount(productBaseWithProfit);
  }, [productId, products]);

  useEffect(() => {
    if (!baseAmount) {
      setTotalAmount(0);
      return;
    }
    const q = val(quantity);
    const mv = val(marginValue);
    
    const totalBase = baseAmount * q;
    const extra =
      marginType === 'PERCENT'
        ? totalBase * (mv / 100 || 0)
        : mv || 0;
    setTotalAmount(totalBase + extra);
  }, [baseAmount, quantity, marginType, marginValue]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload: Partial<Order> = {
        orderNumber,
        customerId,
        productId,
        deadlineDate,
        quantity: val(quantity),
        marginType,
        marginValue: val(marginValue),
      };

      let method: 'POST' | 'PUT' = 'POST';
      if (initialData && initialData.id) {
        method = 'PUT';
        payload.id = initialData.id;
      }

      const res = await fetch('/api/orders', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error || 'Sipariş kaydedilemedi');
      }

      onSuccess();
    } catch (error) {
      console.error(error);
      alert('Bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const selectedProduct = products.find(p => p.id === productId);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* Sipariş Temel Bilgileri */}
      <div className={sectionClassName}>
        <h3 className="text-sm font-semibold text-gray-900 border-b border-slate-200 pb-2 mb-2">Sipariş Bilgileri</h3>
        <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          <div>
            <label className={labelClassName}>Sipariş Numarası</label>
            <input
              type="text"
              required
              value={orderNumber}
              onChange={e => setOrderNumber(e.target.value)}
              className={inputClassName}
              placeholder="Örn: SIP-2024-001"
            />
          </div>

          <div>
            <label className={labelClassName}>Müşteri</label>
            <select
              required
              value={customerId}
              onChange={e => setCustomerId(e.target.value)}
              className={selectClassName}
            >
              <option value="">Seçiniz</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClassName}>Termin Tarihi</label>
            <input
              type="date"
              required
              value={deadlineDate}
              onChange={e => setDeadlineDate(e.target.value)}
              className={inputClassName}
            />
          </div>

          <div>
            <label className={labelClassName}>Adet</label>
            <input
              type="number"
              min="1"
              required
              value={quantity}
              onChange={e => setQuantity(e.target.value === '' ? '' : parseInt(e.target.value))}
              className={inputClassName}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={labelClassName}>Ürün</label>
            <select
              required
              value={productId}
              onChange={e => setProductId(e.target.value)}
              className={selectClassName}
            >
              <option value="">Ürün seçiniz</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.code ? `(${p.code})` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Fiyatlandırma Detayları */}
      <div className={sectionClassName}>
        <h3 className="text-sm font-semibold text-gray-900 border-b border-slate-200 pb-2 mb-2">Fiyatlandırma</h3>
        
        {selectedProduct && (
          <div className="rounded-md bg-white p-4 border border-slate-200 space-y-1 text-sm mb-4">
            <div className="font-medium text-gray-900">
              {selectedProduct.name} {selectedProduct.code ? `(${selectedProduct.code})` : ''}
            </div>
            <div className="text-gray-600">
              Ürünün birim maliyeti ve ürün kartında tanımlı kar oranı dikkate alınarak hesaplanmış birim fiyat:
            </div>
            <div className="text-lg font-semibold text-indigo-600">
              {baseAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD / Adet
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-1">
            <label className={labelClassName}>Kar Oranı Tipi</label>
            <div className="flex rounded-md shadow-sm">
              <button
                type="button"
                onClick={() => setMarginType('PERCENT')}
                className={`flex-1 px-3 py-2 text-sm border border-slate-300 rounded-l-md ${
                  marginType === 'PERCENT' ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                % Oran
              </button>
              <button
                type="button"
                onClick={() => setMarginType('AMOUNT')}
                className={`flex-1 px-3 py-2 text-sm border border-slate-300 border-l-0 rounded-r-md ${
                  marginType === 'AMOUNT' ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Tutar
              </button>
            </div>
          </div>
          
          <div className="sm:col-span-1">
            <label className={labelClassName}>
              {marginType === 'PERCENT' ? 'Kar Oranı (%)' : 'Kar Tutarı (USD)'}
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={marginValue}
              onChange={e => setMarginValue(e.target.value === '' ? '' : parseFloat(e.target.value))}
              className={inputClassName}
            />
          </div>
          
          <div className="sm:col-span-1">
            <label className={labelClassName}>Genel Toplam</label>
            <div className="rounded-md bg-white border border-slate-200 px-3 py-2 text-right font-semibold text-indigo-700 h-[38px] flex items-center justify-end">
              {totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
            </div>
          </div>
        </div>
      </div>

      {initialData && (
        <div className={sectionClassName}>
           <h3 className="text-sm font-semibold text-gray-900 border-b border-slate-200 pb-2 mb-2">Durum</h3>
           <div>
            <label className={labelClassName}>Sipariş Durumu</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              className={selectClassName}
            >
              <option value="TEKLIF_OLUSTURULDU">Teklif Oluşturuldu</option>
              <option value="TEKLIF_ILETILDI">Teklif İletildi</option>
              <option value="TEKLIF_KABUL_EDILDI">Teklif Kabul Edildi</option>
              <option value="URETIM_YAPILDI">Üretim Yapıldı</option>
              <option value="TESLIMAT_YAPILDI">Teslimat Yapıldı</option>
              <option value="IPTAL">İptal</option>
            </select>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-x-3 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-gray-50"
        >
          İptal
        </button>
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-sky-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 disabled:opacity-50"
        >
          {loading ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </div>
    </form>
  );
}
