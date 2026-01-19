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

  // Common styles
  const sectionClassName = "bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4";
  const labelClassName = "block text-sm font-medium text-slate-700 mb-1";
  const inputClassName = "block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm";
  const selectClassName = "block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm";

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
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md border border-red-200">{error}</div>}
      
      <div className={sectionClassName}>
        <h3 className="text-sm font-semibold text-gray-900 border-b border-slate-200 pb-2 mb-2">Firma Bilgileri</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="col-span-1 sm:col-span-2">
                <label className={labelClassName}>Firma Ünvanı</label>
                <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={inputClassName}
                    placeholder="Örn: ABC Tekstil Ltd. Şti."
                />
            </div>
            
            <div>
                <label className={labelClassName}>Tedarik Türü</label>
                {!isCustomType ? (
                    <div className="flex gap-2">
                        <select
                            value={formData.type}
                            onChange={(e) => setFormData({...formData, type: e.target.value})}
                            className={selectClassName}
                        >
                            {supplierTypes.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <button type="button" onClick={() => setIsCustomType(true)} className="mt-1 text-sm text-sky-600 hover:text-sky-900 whitespace-nowrap font-medium">
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
                            className={inputClassName}
                        />
                        <button type="button" onClick={() => setIsCustomType(false)} className="mt-1 text-sm text-red-600 hover:text-red-900 font-medium">
                            İptal
                        </button>
                    </div>
                )}
            </div>
        </div>
      </div>

      <div className={sectionClassName}>
        <h3 className="text-sm font-semibold text-gray-900 border-b border-slate-200 pb-2 mb-2">İletişim Bilgileri</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <label className={labelClassName}>Yetkili Adı Soyadı</label>
                <input type="text" value={formData.contactName} onChange={(e) => setFormData({...formData, contactName: e.target.value})} className={inputClassName} />
            </div>
            <div>
                <label className={labelClassName}>Firma Telefonu</label>
                <input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className={inputClassName} />
            </div>
            <div>
                <label className={labelClassName}>Yetkili Mobil</label>
                <input type="text" value={formData.mobile} onChange={(e) => setFormData({...formData, mobile: e.target.value})} className={inputClassName} />
            </div>
        </div>
      </div>

      <div className={sectionClassName}>
        <h3 className="text-sm font-semibold text-gray-900 border-b border-slate-200 pb-2 mb-2">Fatura & Adres</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <label className={labelClassName}>Vergi Dairesi</label>
                <input type="text" value={formData.taxOffice} onChange={(e) => setFormData({...formData, taxOffice: e.target.value})} className={inputClassName} />
            </div>
            <div>
                <label className={labelClassName}>Vergi Numarası</label>
                <input type="text" value={formData.taxNumber} onChange={(e) => setFormData({...formData, taxNumber: e.target.value})} className={inputClassName} />
            </div>
            <div className="col-span-1 sm:col-span-2">
                <label className={labelClassName}>Adres</label>
                <textarea value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className={inputClassName} rows={3} />
            </div>
        </div>
      </div>

      <div className={sectionClassName}>
        <h3 className="text-sm font-semibold text-gray-900 border-b border-slate-200 pb-2 mb-2">Çalışma Şekli</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <label className={labelClassName}>Ödeme Yöntemi</label>
                <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                    className={selectClassName}
                >
                    <option value="Peşin">Peşin</option>
                    <option value="Çek">Çek</option>
                    <option value="Vadeli">Vadeli</option>
                </select>
            </div>

            {formData.paymentMethod === 'Vadeli' && (
                 <div>
                    <label className={labelClassName}>Vade Günü</label>
                    <input
                        type="number"
                        value={formData.termDays}
                        onChange={(e) => setFormData({ ...formData, termDays: parseInt(e.target.value) })}
                        className={inputClassName}
                    />
                 </div>
            )}
        </div>
      </div>

      <div className="flex justify-end gap-x-3 pt-4 border-t border-slate-100">
        <button type="button" onClick={onCancel} className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-gray-50">İptal</button>
        <button type="submit" disabled={loading} className="rounded-md bg-sky-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-500 disabled:opacity-50">Kaydet</button>
      </div>
    </form>
  );
}
