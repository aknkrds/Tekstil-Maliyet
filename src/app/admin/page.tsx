'use client';

import { useState } from 'react';

export default function AdminPage() {
  const [generatedKey, setGeneratedKey] = useState('');
  const [loading, setLoading] = useState(false);

  const generateLicense = async (type: 'MONTHLY' | 'YEARLY') => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/license', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });
      const data = await res.json();
      setGeneratedKey(data.key);
    } catch (e) {
      alert('Hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-6">Admin Paneli</h1>
      
      <div className="bg-white p-6 rounded-lg shadow max-w-md">
        <h2 className="text-lg font-semibold mb-4">Lisans Oluştur</h2>
        
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => generateLicense('MONTHLY')}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Aylık Lisans Üret
          </button>
          <button
            onClick={() => generateLicense('YEARLY')}
            disabled={loading}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          >
            Yıllık Lisans Üret
          </button>
        </div>

        {generatedKey && (
          <div className="mt-4 p-4 bg-gray-100 rounded border">
            <p className="text-sm text-gray-600">Oluşturulan Anahtar:</p>
            <p className="font-mono text-lg font-bold select-all">{generatedKey}</p>
          </div>
        )}
      </div>
    </div>
  );
}
