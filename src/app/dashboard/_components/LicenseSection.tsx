'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LicenseSection({ tenant }: { tenant: any }) {
  const [licenseKey, setLicenseKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');
  const router = useRouter();

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/license/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ licenseKey }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Aktivasyon başarısız.');
      }

      setMessage('Lisans başarıyla aktifleştirildi!');
      setLicenseKey('');
      router.refresh();
    } catch (error: any) {
      setMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const endDate = tenant.subscriptionEndDate ? new Date(tenant.subscriptionEndDate) : null;
  const isActive = endDate && endDate > new Date();

  const handleOpenPurchase = () => {
    setIsModalOpen(true);
  };

  const handlePurchase = () => {
    const planText = selectedPlan === 'MONTHLY' ? 'Aylık (24.99 USD)' : 'Yıllık (240.99 USD)';
    const text = encodeURIComponent(`Symi lisans satın alma talebi: ${planText}`);
    const phone = '905337328983';
    const url = `https://wa.me/${phone}?text=${text}`;
    window.open(url, '_blank');
  };

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-base font-semibold leading-6 text-gray-900">Lisans Durumu</h3>
        <div className="mt-2 max-w-xl text-sm text-gray-500">
          <p>
            Mevcut Durum: {' '}
            <span className={`font-bold ${isActive ? 'text-green-600' : 'text-red-600'}`}>
              {isActive ? 'Aktif' : 'Pasif / Süresi Dolmuş'}
            </span>
          </p>
          <p>
            Bitiş Tarihi: {tenant.subscriptionEndDate ? new Date(tenant.subscriptionEndDate).toLocaleDateString('tr-TR') : '-'}
          </p>
        </div>
        <form onSubmit={handleActivate} className="mt-5 sm:flex sm:items-center">
          <div className="w-full sm:max-w-xs">
            <label htmlFor="license-key" className="sr-only">
              Lisans Anahtarı
            </label>
            <input
              type="text"
              name="license-key"
              id="license-key"
              value={licenseKey}
              onChange={(e) => setLicenseKey(e.target.value)}
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              placeholder="Lisans kodunu giriniz"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="mt-3 inline-flex w-full items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:ml-3 sm:mt-0 sm:w-auto disabled:opacity-50"
          >
            {isLoading ? 'İşleniyor...' : 'Lisansı Aktifleştir'}
          </button>
        </form>
        <div className="mt-4">
          <button
            type="button"
            onClick={handleOpenPurchase}
            className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
          >
            Lisans Satın Al
          </button>
        </div>
        {message && (
          <p className={`mt-2 text-sm ${message.includes('başarıyla') ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Lisans Seçimi</h4>
            <div className="space-y-3">
              <label className="flex items-center justify-between rounded-md border px-3 py-2">
                <div>
                  <p className="text-sm font-medium text-gray-900">Aylık</p>
                  <p className="text-xs text-gray-500">24.99 USD / 30 gün</p>
                </div>
                <input
                  type="radio"
                  name="plan"
                  value="MONTHLY"
                  checked={selectedPlan === 'MONTHLY'}
                  onChange={() => setSelectedPlan('MONTHLY')}
                  className="h-4 w-4 text-indigo-600"
                />
              </label>
              <label className="flex items-center justify-between rounded-md border px-3 py-2">
                <div>
                  <p className="text-sm font-medium text-gray-900">Yıllık</p>
                  <p className="text-xs text-gray-500">240.99 USD / 365 gün</p>
                </div>
                <input
                  type="radio"
                  name="plan"
                  value="YEARLY"
                  checked={selectedPlan === 'YEARLY'}
                  onChange={() => setSelectedPlan('YEARLY')}
                  className="h-4 w-4 text-indigo-600"
                />
              </label>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-md bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200"
              >
                İptal
              </button>
              <button
                type="button"
                onClick={handlePurchase}
                className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500"
              >
                Satın Al
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
