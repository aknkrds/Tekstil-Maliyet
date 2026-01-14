'use client';

import { useState } from 'react';

export default function SupplierForm({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    taxNumber: '',
    taxOffice: '',
    address: '',
    contactName: '',
    phone: '',
    mobile: '',
    paymentMethod: 'Peşin',
    termDays: 0,
    type: 'Kumaşçı', // Default
  });
  
  const [customType, setCustomType] = useState('');
  const [isCustomType, setIsCustomType] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const supplierTypes = ['Kumaşçı', 'İplikçi', 'Tülcü', 'Düğmeci', 'Fermuarcı', 'Poşetçi', 'Aksesuarcı'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const finalType = isCustomType ? customType : formData.type;
    if (!finalType) {
        setError('Tedarik türü girilmelidir.');
        setLoading(false);
        return;
    }

    try {
      const res = await fetch('/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, type: finalType }),
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
      
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">Firma Ünvanı</label>
            <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
            />
        </div>
        
        {/* Contact Info */}
        <div>
            <label className="block text-sm font-medium text-gray-700">Yetkili Adı Soyadı</label>
            <input type="text" value={formData.contactName} onChange={(e) => setFormData({...formData, contactName: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm text-gray-900" />
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700">Firma Telefonu</label>
            <input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm text-gray-900" />
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700">Yetkili Mobil</label>
            <input type="text" value={formData.mobile} onChange={(e) => setFormData({...formData, mobile: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm text-gray-900" />
        </div>

        {/* Tax Info */}
        <div>
            <label className="block text-sm font-medium text-gray-700">Vergi Dairesi</label>
            <input type="text" value={formData.taxOffice} onChange={(e) => setFormData({...formData, taxOffice: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm text-gray-900" />
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700">Vergi Numarası</label>
            <input type="text" value={formData.taxNumber} onChange={(e) => setFormData({...formData, taxNumber: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm text-gray-900" />
        </div>
        <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">Adres</label>
            <textarea value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm text-gray-900" rows={2} />
        </div>

        {/* Payment & Type */}
        <div>
            <label className="block text-sm font-medium text-gray-700">Çalışma Şekli</label>
            <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
            >
                <option value="Peşin">Peşin</option>
                <option value="Çek">Çek</option>
                <option value="Vadeli">Vadeli</option>
            </select>
        </div>

        {formData.paymentMethod === 'Vadeli' && (
             <div>
                <label className="block text-sm font-medium text-gray-700">Vade Günü</label>
                <input
                    type="number"
                    value={formData.termDays}
                    onChange={(e) => setFormData({ ...formData, termDays: parseInt(e.target.value) })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
                />
             </div>
        )}

        <div>
            <label className="block text-sm font-medium text-gray-700">Tedarik Türü</label>
            {!isCustomType ? (
                <div className="flex gap-2">
                    <select
                        value={formData.type}
                        onChange={(e) => setFormData({...formData, type: e.target.value})}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
                    >
                        {supplierTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <button type="button" onClick={() => setIsCustomType(true)} className="mt-1 text-sm text-indigo-600 hover:text-indigo-900 whitespace-nowrap">
                        + Ekle
                    </button>
                </div>
            ) : (
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Yeni tür giriniz"
                        value={customType}
                        onChange={(e) => setCustomType(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
                    />
                    <button type="button" onClick={() => setIsCustomType(false)} className="mt-1 text-sm text-red-600 hover:text-red-900">
                        İptal
                    </button>
                </div>
            )}
        </div>

      </div>

      <div className="flex justify-end gap-2 mt-4">
        <button type="button" onClick={onCancel} className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">İptal</button>
        <button type="submit" disabled={loading} className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50">Kaydet</button>
      </div>
    </form>
  );
}
