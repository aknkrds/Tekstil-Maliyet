'use client';

import { useState } from 'react';

type Supplier = {
  id: string;
  name: string;
  type: string;
};

type Material = {
  id: string;
  name: string;
  unit: string;
  currency?: string;
  price?: number;
};

export default function SupplyOrderForm({
  suppliers,
  materials,
  initialData,
  onSuccess,
  onCancel,
}: {
  suppliers: Supplier[];
  materials: Material[];
  initialData?: any;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    supplierId: initialData?.supplierId || '',
    materialId: initialData?.materialId || '',
    quantity: initialData ? Number(initialData.quantity) : '',
    unit: initialData?.unit || 'Adet',
    unitPrice: initialData ? Number(initialData.unitPrice) : '',
    currency: initialData?.currency || 'USD',
    vatRate: initialData ? Number(initialData.vatRate) : 20,
    wasteAmount: initialData ? Number(initialData.wasteAmount || 0) : '',
    status: initialData?.status || 'CREATED',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Common styles
  const sectionClassName = "bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4";
  const labelClassName = "block text-sm font-medium text-slate-700 mb-1";
  const inputClassName = "block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm";
  const selectClassName = "block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
          ...formData,
          quantity: formData.quantity === '' ? 0 : Number(formData.quantity),
          unitPrice: formData.unitPrice === '' ? 0 : Number(formData.unitPrice),
          wasteAmount: formData.wasteAmount === '' ? 0 : Number(formData.wasteAmount),
      };

      const res = await fetch('/api/supply-orders', {
        method: initialData ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(initialData ? { ...payload, id: initialData.id } : payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.formatted || data.error || 'Bir hata oluştu');
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    const qty = formData.quantity === '' ? 0 : Number(formData.quantity);
    const price = formData.unitPrice === '' ? 0 : Number(formData.unitPrice);
    
    const total = qty * price;
    const vat = total * (formData.vatRate / 100);
    return {
        total,
        vat,
        grand: total + vat
    };
  };

  const totals = calculateTotal();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md border border-red-200">{error}</div>}
      
      <div className={sectionClassName}>
        <h3 className="text-sm font-semibold text-gray-900 border-b border-slate-200 pb-2 mb-2">Sipariş Detayları</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClassName}>Tedarikçi</label>
            <select
              required
              value={formData.supplierId}
              onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
              className={selectClassName}
            >
              <option value="">Seçiniz</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.type})</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClassName}>Ürün</label>
            <select
              required
              value={formData.materialId}
              onChange={(e) => {
                  const mat = materials.find(m => m.id === e.target.value);
                  setFormData({ 
                      ...formData, 
                      materialId: e.target.value,
                      unit: mat ? mat.unit : formData.unit,
                      currency: mat?.currency || formData.currency,
                      unitPrice: mat?.price ? Number(mat.price) : formData.unitPrice
                  });
              }}
              className={selectClassName}
            >
              <option value="">Seçiniz</option>
              {materials.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClassName}>Miktar</label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value === '' ? '' : parseFloat(e.target.value) })}
              className={inputClassName}
            />
          </div>

          <div>
            <label className={labelClassName}>Birim</label>
            <select
              required
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              className={selectClassName}
            >
              {['Adet', 'Kilo', 'Metre', 'Gram', 'Ton'].map(u => (
                  <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className={sectionClassName}>
        <h3 className="text-sm font-semibold text-gray-900 border-b border-slate-200 pb-2 mb-2">Fiyatlandırma</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClassName}>Birim Fiyat</label>
            <div className="flex gap-2">
              <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.unitPrice}
                  onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value === '' ? '' : parseFloat(e.target.value) })}
                  className={inputClassName}
                  placeholder="Fiyat"
              />
              <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="block w-1/3 rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
              >
                  <option value="USD">USD</option>
                  <option value="TRY">TL</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
              </select>
            </div>
          </div>

          <div>
            <label className={labelClassName}>KDV Oranı</label>
            <select
              required
              value={formData.vatRate}
              onChange={(e) => setFormData({ ...formData, vatRate: parseInt(e.target.value) })}
              className={selectClassName}
            >
              <option value={1}>%1</option>
              <option value={10}>%10</option>
              <option value={20}>%20</option>
            </select>
          </div>
        </div>

        <div className="bg-white p-4 rounded-md border border-slate-200 mt-2">
            <div className="flex justify-between text-sm text-slate-600 mb-1">
                <span>Ara Toplam:</span>
                <span>{totals.total.toLocaleString('en-US', { minimumFractionDigits: 2 })} {formData.currency}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-600 mb-2">
                <span>KDV Tutarı:</span>
                <span>{totals.vat.toLocaleString('en-US', { minimumFractionDigits: 2 })} {formData.currency}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 border-t border-slate-100 pt-2">
                <span>Genel Toplam:</span>
                <span>{totals.grand.toLocaleString('en-US', { minimumFractionDigits: 2 })} {formData.currency}</span>
            </div>
        </div>
      </div>
      
      <div className={sectionClassName}>
         <h3 className="text-sm font-semibold text-gray-900 border-b border-slate-200 pb-2 mb-2">Durum</h3>
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <label className={labelClassName}>Sipariş Durumu</label>
                <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className={selectClassName}
                >
                    <option value="CREATED">Sipariş Oluşturuldu</option>
                    <option value="ORDERED">Sipariş Verildi</option>
                    <option value="RECEIVED">Sipariş Teslim Alındı</option>
                </select>
            </div>
            
            {formData.status === 'RECEIVED' && (
                <div>
                  <label className={labelClassName}>Fire/Hurda Miktarı (Stoktan Düşülecek)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.wasteAmount}
                    onChange={(e) => setFormData({ ...formData, wasteAmount: e.target.value === '' ? '' : parseFloat(e.target.value) })}
                    className={`${inputClassName} bg-red-50 border-red-200 focus:border-red-500 focus:ring-red-500`}
                  />
                  <p className="text-xs text-red-500 mt-1">Bu miktar mevcut stoktan düşülecektir.</p>
                </div>
            )}
         </div>
      </div>

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
          className="rounded-md bg-sky-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-500 disabled:opacity-50"
        >
          {loading ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </div>
    </form>
  );
}
