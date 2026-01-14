'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();
  const [key, setKey] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const res = await fetch('/api/licenses/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || 'Etkinleştirme başarısız');
      }

      setMessage('Lisans başarıyla etkinleştirildi!');
      setKey('');
      router.refresh(); // Update layout data if shown
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Ayarlar
          </h2>
        </div>
      </div>

      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-base font-semibold leading-6 text-gray-900">
            Lisans Etkinleştirme
          </h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>Admin tarafından verilen lisans anahtarını giriniz.</p>
          </div>
          <form className="mt-5 sm:flex sm:items-center" onSubmit={handleActivate}>
            <div className="w-full sm:max-w-xs">
              <label htmlFor="license-key" className="sr-only">
                Lisans Anahtarı
              </label>
              <input
                type="text"
                name="key"
                id="license-key"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                placeholder="XXXX-XXXX-XXXX-XXXX"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mt-3 inline-flex w-full items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:ml-3 sm:mt-0 sm:w-auto"
            >
              {loading ? 'Etkinleştiriliyor...' : 'Etkinleştir'}
            </button>
          </form>
          {message && <p className="mt-2 text-sm text-green-600">{message}</p>}
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
      </div>
    </div>
  );
}
