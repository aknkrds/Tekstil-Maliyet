'use client';

import { useState } from 'react';

export default function MaterialDefinitionForm({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    unit: 'Adet',
    price: '',
    currency: 'USD',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const defaultItems = ['Kumaş', 'İplik', 'Tül', 'Baskı', 'Düğme', 'Fermuar', 'Poşet'];
  const [isCustom, setIsCustom] = useState(false);

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
          price: formData.price === '' ? 0 : Number(formData.price)
      };

      const res = await fetch('/api/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md border border-red-200">{error}</div>}
      
      <div className={sectionClassName}>
        <h3 className="text-sm font-semibold text-gray-900 border-b border-slate-200 pb-2 mb-2">Ürün Bilgileri</h3>
        <div>
            <label className={labelClassName}>Ürün Tanımı</label>
            {!isCustom ? (
                <div className="flex gap-2">
                    <select
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className={selectClassName}
                    >
                        <option value="">Seçiniz</option>
                        {defaultItems.map(item => <option key={item} value={item}>{item}</option>)}
                    </select>
                    <button type="button" onClick={() => setIsCustom(true)} className="mt-1 text-sm text-sky-600 hover:text-sky-900 whitespace-nowrap font-medium">
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
                        className={inputClassName}
                        required
                    />
                    <button type="button" onClick={() => setIsCustom(false)} className="mt-1 text-sm text-red-600 hover:text-red-900 font-medium">
                        İptal
                    </button>
                </div>
            )}
        </div>
      </div>

      <div className={sectionClassName}>
        <h3 className="text-sm font-semibold text-gray-900 border-b border-slate-200 pb-2 mb-2">Birim & Fiyat</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <label className={labelClassName}>Varsayılan Birim</label>
                <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className={selectClassName}
                >
                    {['Adet', 'Kilo', 'Metre', 'Gram', 'Ton'].map(u => (
                        <option key={u} value={u}>{u}</option>
                    ))}
                </select>
            </div>
            
            <div>
                <label className={labelClassName}>Varsayılan Birim Fiyat (Opsiyonel)</label>
                <div className="flex gap-2">
                    <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value === '' ? '' : e.target.value })}
                        className={inputClassName}
                        placeholder="0.00"
                    />
                    <div className="flex items-center justify-center bg-slate-100 border border-slate-300 rounded-md px-3 text-sm text-slate-600 font-medium">
                        USD
                    </div>
                </div>
            </div>
        </div>
      </div>

      <div className="flex justify-end gap-x-3 pt-4 border-t border-slate-100">
        <button type="button" onClick={onCancel} className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-gray-50">İptal</button>
        <button type="submit" disabled={loading} className="rounded-md bg-sky-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-500 disabled:opacity-50">Kaydet</button>
      </div>
    </form>
  );
}
