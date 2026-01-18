'use client';

import { useEffect, useState } from 'react';

type TenantRow = {
  id: string;
  name: string;
  shortName: string;
  email: string;
  adminEmail: string | null;
  createdAt: string;
  subscriptionEndDate: string | null;
};

type TenantDetail = {
  id: string;
  name: string;
  shortName: string;
  address: string;
  taxOffice: string;
  taxNumber: string;
  phone: string;
  authPersonName: string;
  authPersonMobile: string;
  email: string;
  createdAt: string;
};

export default function AdminDashboard() {
  const [tenants, setTenants] = useState<TenantRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTenant, setSelectedTenant] = useState<TenantDetail | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [licenseType, setLicenseType] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');
  const [createdLicenseKey, setCreatedLicenseKey] = useState('');
  const [isCreatingLicense, setIsCreatingLicense] = useState(false);

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/tenants');
      if (!res.ok) {
        return;
      }
      const data = await res.json();
      setTenants(data);
    } finally {
      setIsLoading(false);
    }
  };

  const openDetail = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/tenants?id=${id}`);
      if (!res.ok) return;
      const data = await res.json();
      const detail: TenantDetail = {
        id: data.id,
        name: data.name,
        shortName: data.shortName,
        address: data.address,
        taxOffice: data.taxOffice,
        taxNumber: data.taxNumber,
        phone: data.phone,
        authPersonName: data.authPersonName,
        authPersonMobile: data.authPersonMobile,
        email: data.email,
        createdAt: data.createdAt,
      };
      setSelectedTenant(detail);
      setShowDetail(true);
    } catch {
    }
  };

  const handleDelete = async (id: string) => {
    const ok = window.confirm('Bu firmayı ve tüm verilerini silmek istediğinize emin misiniz?');
    if (!ok) return;
    try {
      const res = await fetch(`/api/admin/tenants?id=${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        alert(data?.error || 'Silme sırasında hata oluştu');
        return;
      }
      setTenants((prev) => prev.filter((t) => t.id !== id));
    } catch {
      alert('Silme sırasında hata oluştu');
    }
  };

  const handleCreateLicense = async () => {
    setIsCreatingLicense(true);
    setCreatedLicenseKey('');
    try {
      const res = await fetch('/api/admin/license', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: licenseType }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Lisans oluşturulamadı');
        return;
      }
      setCreatedLicenseKey(data.key);
    } catch {
      alert('Lisans oluşturulamadı');
    } finally {
      setIsCreatingLicense(false);
    }
  };

  const formatDate = (value: string | null) => {
    if (!value) return '-';
    return new Date(value).toLocaleDateString('tr-TR');
  };

  const licenseStatus = (tenant: TenantRow) => {
    if (!tenant.subscriptionEndDate) return 'Lisans Yok';
    const end = new Date(tenant.subscriptionEndDate);
    const now = new Date();
    if (end > now) {
      return `Aktif (${end.toLocaleDateString('tr-TR')})`;
    }
    return `Süresi Dolmuş (${end.toLocaleDateString('tr-TR')})`;
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Paneli</h1>

      <div className="mb-8 rounded-lg bg-white p-6 shadow">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Lisans Anahtarı Oluştur</h2>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex gap-4">
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="radio"
                name="license-type"
                value="MONTHLY"
                checked={licenseType === 'MONTHLY'}
                onChange={() => setLicenseType('MONTHLY')}
                className="h-4 w-4 text-indigo-600"
              />
              <span>Aylık (30 gün)</span>
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="radio"
                name="license-type"
                value="YEARLY"
                checked={licenseType === 'YEARLY'}
                onChange={() => setLicenseType('YEARLY')}
                className="h-4 w-4 text-indigo-600"
              />
              <span>Yıllık (365 gün)</span>
            </label>
          </div>
          <button
            type="button"
            onClick={handleCreateLicense}
            disabled={isCreatingLicense}
            className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
          >
            {isCreatingLicense ? 'Oluşturuluyor...' : 'Lisans Anahtarı Oluştur'}
          </button>
        </div>
        {createdLicenseKey && (
          <div className="mt-4 rounded-md bg-gray-50 px-4 py-3 text-sm text-gray-900 break-all">
            <span className="font-semibold mr-2">Oluşturulan Anahtar:</span>
            {createdLicenseKey}
          </div>
        )}
      </div>

      <div className="rounded-lg bg-white p-6 shadow">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Kullanıcılar / Firmalar</h2>
        </div>
        {isLoading ? (
          <p className="text-sm text-gray-500">Yükleniyor...</p>
        ) : tenants.length === 0 ? (
          <p className="text-sm text-gray-500">Kayıtlı firma bulunamadı.</p>
        ) : (
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <table className="min-w-full divide-y divide-gray-300">
                <thead>
                  <tr>
                    <th className="py-3.5 pl-4 pr-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 sm:pl-0">
                      Firma
                    </th>
                    <th className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Kısa İsim
                    </th>
                    <th className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Mail
                    </th>
                    <th className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Kayıt Tarihi
                    </th>
                    <th className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Lisans Durumu
                    </th>
                    <th className="relative py-3.5 pl-3 pr-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500 sm:pr-0">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {tenants.map((tenant) => (
                    <tr key={tenant.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                        {tenant.name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {tenant.shortName}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {tenant.adminEmail || tenant.email}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {formatDate(tenant.createdAt)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {licenseStatus(tenant)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-right text-sm font-medium">
                        <button
                          type="button"
                          onClick={() => openDetail(tenant.id)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          Görüntüle
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(tenant.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Sil
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {showDetail && selectedTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Kullanıcı / Firma Detayı</h3>
            <div className="space-y-2 text-sm text-gray-700">
              <p>
                <span className="font-medium">Firma Ünvanı:</span> {selectedTenant.name}
              </p>
              <p>
                <span className="font-medium">Kısa İsim:</span> {selectedTenant.shortName}
              </p>
              <p>
                <span className="font-medium">Adres:</span> {selectedTenant.address}
              </p>
              <p>
                <span className="font-medium">Vergi Dairesi:</span> {selectedTenant.taxOffice}
              </p>
              <p>
                <span className="font-medium">Vergi No:</span> {selectedTenant.taxNumber}
              </p>
              <p>
                <span className="font-medium">Telefon:</span> {selectedTenant.phone}
              </p>
              <p>
                <span className="font-medium">Yetkili:</span> {selectedTenant.authPersonName}
              </p>
              <p>
                <span className="font-medium">Yetkili Mobil:</span> {selectedTenant.authPersonMobile}
              </p>
              <p>
                <span className="font-medium">E-posta:</span> {selectedTenant.email}
              </p>
              <p>
                <span className="font-medium">Kayıt Tarihi:</span> {formatDate(selectedTenant.createdAt)}
              </p>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setShowDetail(false)}
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

