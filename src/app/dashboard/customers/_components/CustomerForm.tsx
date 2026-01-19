'use client';

import { useState } from 'react';

type Customer = {
    id: string;
    name: string;
    address?: string;
    billingCity?: string;
    billingCountry?: string;
    shippingAddress?: string;
    shippingCity?: string;
    shippingCountry?: string;
    taxOffice?: string;
    taxNumber?: string;
    email?: string;
    phone?: string;
    contactName?: string;
    contactPhone?: string;
    paymentMethod?: string;
};

type Props = {
    initialData?: Customer;
    onSuccess: () => void;
    onCancel: () => void;
};

export default function CustomerForm({ initialData, onSuccess, onCancel }: Props) {
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        address: initialData?.address || '',
        billingCity: initialData?.billingCity || '',
        billingCountry: initialData?.billingCountry || '',
        shippingAddress: initialData?.shippingAddress || '',
        shippingCity: initialData?.shippingCity || '',
        shippingCountry: initialData?.shippingCountry || '',
        taxOffice: initialData?.taxOffice || '',
        taxNumber: initialData?.taxNumber || '',
        email: initialData?.email || '',
        phone: initialData?.phone || '',
        contactName: initialData?.contactName || '',
        contactPhone: initialData?.contactPhone || '',
        paymentMethod: initialData?.paymentMethod || 'Peşin',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/customers', {
                method: initialData ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(initialData ? { ...formData, id: initialData.id } : formData),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error?.formatted?.name?._errors?.[0] || data.error || 'Bir hata oluştu');
            }

            onSuccess();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCopyBillingToShipping = () => {
        setFormData(prev => ({
            ...prev,
            shippingAddress: prev.address,
            shippingCity: prev.billingCity,
            shippingCountry: prev.billingCountry,
        }));
    };

    const inputClassName = "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900";

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                    {error}
                </div>
            )}

            <div className="bg-white rounded-lg space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {/* Temel Bilgiler */}
                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Müşteri Ünvanı</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className={inputClassName}
                        />
                    </div>

                    {/* Fatura Adresi Bölümü */}
                    <div className="sm:col-span-2 space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <h3 className="text-sm font-semibold text-gray-900">Fatura Bilgileri</h3>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Fatura Adresi</label>
                                <textarea
                                    rows={2}
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className={inputClassName}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Şehir</label>
                                <input
                                    type="text"
                                    value={formData.billingCity}
                                    onChange={(e) => setFormData({ ...formData, billingCity: e.target.value })}
                                    className={inputClassName}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Ülke</label>
                                <input
                                    type="text"
                                    value={formData.billingCountry}
                                    onChange={(e) => setFormData({ ...formData, billingCountry: e.target.value })}
                                    className={inputClassName}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Teslimat Adresi Bölümü */}
                    <div className="sm:col-span-2 space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-gray-900">Teslimat Bilgileri</h3>
                            <button
                                type="button"
                                onClick={handleCopyBillingToShipping}
                                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                                    <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                                </svg>
                                Fatura Adresi ile Aynı
                            </button>
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Teslimat Adresi</label>
                                <textarea
                                    rows={2}
                                    value={formData.shippingAddress}
                                    onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
                                    className={inputClassName}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Şehir</label>
                                <input
                                    type="text"
                                    value={formData.shippingCity}
                                    onChange={(e) => setFormData({ ...formData, shippingCity: e.target.value })}
                                    className={inputClassName}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Ülke</label>
                                <input
                                    type="text"
                                    value={formData.shippingCountry}
                                    onChange={(e) => setFormData({ ...formData, shippingCountry: e.target.value })}
                                    className={inputClassName}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Diğer Bilgiler */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Vergi Dairesi</label>
                        <input
                            type="text"
                            value={formData.taxOffice}
                            onChange={(e) => setFormData({ ...formData, taxOffice: e.target.value })}
                            className={inputClassName}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Vergi Numarası</label>
                        <input
                            type="text"
                            value={formData.taxNumber}
                            onChange={(e) => setFormData({ ...formData, taxNumber: e.target.value })}
                            className={inputClassName}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Mail Adresi</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className={inputClassName}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Firma Telefonu</label>
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className={inputClassName}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Yetkili Adı Soyad</label>
                        <input
                            type="text"
                            value={formData.contactName}
                            onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                            className={inputClassName}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Yetkili Telefonu</label>
                        <input
                            type="tel"
                            value={formData.contactPhone}
                            onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                            className={inputClassName}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Ödeme Şekli</label>
                        <select
                            value={formData.paymentMethod}
                            onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                            className={inputClassName}
                        >
                            <option value="Peşin">Peşin</option>
                            <option value="Çek">Çek</option>
                            <option value="Vadeli">Vadeli</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                    type="button"
                    onClick={onCancel}
                    className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                >
                    İptal
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
                >
                    {loading ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
            </div>
        </form>
    );
}
