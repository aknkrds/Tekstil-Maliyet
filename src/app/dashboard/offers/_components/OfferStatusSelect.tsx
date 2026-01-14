'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OfferStatusSelect({ offer }: { offer: any }) {
  const [status, setStatus] = useState(offer.status);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = async (newStatus: string) => {
    if (newStatus === status) return;
    if (newStatus === 'ACCEPTED' && !confirm('Teklifi onaylamak üzeresiniz. Bu işlem üretim için gerekli stokları düşecektir. Onaylıyor musunuz?')) return;
    
    setLoading(true);
    try {
        const res = await fetch('/api/offers/status', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: offer.id, status: newStatus })
        });

        if (res.ok) {
            setStatus(newStatus);
            router.refresh();
        } else {
            alert('Güncelleme başarısız');
        }
    } catch (e) {
        console.error(e);
        alert('Hata oluştu');
    } finally {
        setLoading(false);
    }
  };

  const getStatusColor = (s: string) => {
      switch (s) {
          case 'DRAFT': return 'bg-gray-50 text-gray-600 ring-gray-500/10';
          case 'SENT': return 'bg-blue-50 text-blue-700 ring-blue-700/10';
          case 'ACCEPTED': return 'bg-green-50 text-green-700 ring-green-600/20';
          case 'REJECTED': return 'bg-red-50 text-red-700 ring-red-600/10';
          default: return '';
      }
  };

  return (
    <select
        value={status}
        onChange={(e) => handleChange(e.target.value)}
        disabled={loading || status === 'ACCEPTED'} 
        className={`block w-full rounded-md border-0 py-1.5 text-xs font-medium shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs ${getStatusColor(status)}`}
    >
        <option value="DRAFT">Taslak</option>
        <option value="SENT">Gönderildi</option>
        <option value="ACCEPTED">Onaylandı</option>
        <option value="REJECTED">Reddedildi</option>
    </select>
  );
}
