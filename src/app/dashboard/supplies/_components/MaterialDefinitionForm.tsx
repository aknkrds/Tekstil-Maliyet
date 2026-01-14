'use client';

import { useState } from 'react';

export default function MaterialDefinitionForm({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    unit: 'Adet',
    price: 0,
    currency: 'TRY',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const defaultItems = ['Kumaş', 'İplik', 'Tül', 'Baskı', 'Düğme', 'Fermuar', 'Poşet'];
  const [isCustom, setIsCustom] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Hata oluştu');

      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-red-600 text-sm">{error}</div>}
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Ürün Tanımı</label>
        {!isCustom ? (
            <div className="flex gap-2">
                <select
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
                >
                    <option value="">Seçiniz</option>
                    {defaultItems.map(item => <option key={item} value={item}>{item}</option>)}
                </select>
                <button type="button" onClick={() => setIsCustom(true)} className="mt-1 text-sm text-indigo-600 hover:text-indigo-900 whitespace-nowrap">
                    + Özel Ekle
                </button>
            </div>
        ) : (
            <div className="flex gap-2">
                <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Örn: Kırmızı Düğme"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
                    required
                />
                <button type="button" onClick={() => setIsCustom(false)} className="mt-1 text-sm text-red-600 hover:text-red-900">
                    İptal
                </button>
            </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Varsayılan Birim</label>
        <select
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
        <label className="block text-sm font-medium text-gray-700">Varsayılan Birim Fiyat (Opsiyonel)</label>
        <input
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
        />
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <button type="button" onClick={onCancel} className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">İptal</button>
        <button type="submit" disabled={loading} className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50">Kaydet</button>
      </div>
    </form>
  );
}
