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
    quantity: initialData ? Number(initialData.quantity) : 0,
    unit: initialData?.unit || 'Adet',
    unitPrice: initialData ? Number(initialData.unitPrice) : 0,
    currency: initialData?.currency || 'TRY',
    vatRate: initialData ? Number(initialData.vatRate) : 20,
    wasteAmount: initialData ? Number(initialData.wasteAmount || 0) : 0,
    status: initialData?.status || 'CREATED',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/supply-orders', {
        method: initialData ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(initialData ? { ...formData, id: initialData.id } : formData),
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
    const total = formData.quantity * formData.unitPrice;
    const vat = total * (formData.vatRate / 100);
    return {
        total,
        vat,
        grand: total + vat
    };
  };

  const totals = calculateTotal();

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-red-600 text-sm">{error}</div>}
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Tedarikçi</label>
          <select
            required
            value={formData.supplierId}
            onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
          >
            <option value="">Seçiniz</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>{s.name} ({s.type})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Ürün</label>
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
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
          >
            <option value="">Seçiniz</option>
            {materials.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Miktar</label>
          <input
            type="number"
            step="0.01"
            required
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Birim</label>
          <select
            required
            value={formData.unit}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
          >
            {['Adet', 'Kilo', 'Metre', 'Gram', 'Ton'].map(u => (
                <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Birim Fiyat</label>
          <div className="flex gap-2">
            <input
                type="number"
                step="0.01"
                required
                value={formData.unitPrice}
                onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
                placeholder="Fiyat"
            />
            <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="mt-1 block w-1/3 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
            >
                <option value="TRY">TL</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">KDV Oranı</label>
          <select
            required
            value={formData.vatRate}
            onChange={(e) => setFormData({ ...formData, vatRate: parseInt(e.target.value) })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
          >
            <option value={1}>%1</option>
            <option value={10}>%10</option>
            <option value={20}>%20</option>
          </select>
        </div>
        
        <div>
            <label className="block text-sm font-medium text-gray-700">Sipariş Durumu</label>
            <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
            >
                <option value="CREATED">Sipariş Oluşturuldu</option>
                <option value="ORDERED">Sipariş Verildi</option>
                <option value="RECEIVED">Sipariş Teslim Alındı</option>
            </select>
        </div>
        
        {formData.status === 'RECEIVED' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Fire/Hurda Miktarı (Stoktan Düşülecek)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.wasteAmount}
                onChange={(e) => setFormData({ ...formData, wasteAmount: parseFloat(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900 bg-red-50"
              />
              <p className="text-xs text-red-500 mt-1">Bu miktar mevcut stoktan düşülecektir.</p>
            </div>
        )}

      </div>
      
      <div className="bg-gray-50 p-4 rounded-md mt-4">
          <div className="flex justify-between text-sm">
              <span>Toplam:</span>
              <span>{totals.total.toFixed(2)} {formData.currency}</span>
          </div>
          <div className="flex justify-between text-sm">
              <span>KDV Tutarı:</span>
              <span>{totals.vat.toFixed(2)} {formData.currency}</span>
          </div>
          <div className="flex justify-between font-bold mt-2">
              <span>Genel Toplam:</span>
              <span>{totals.grand.toFixed(2)} {formData.currency}</span>
          </div>
      </div>

      <div className="flex justify-end gap-2 mt-4">
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
          className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
        >
          {loading ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </div>
    </form>
  );
}
