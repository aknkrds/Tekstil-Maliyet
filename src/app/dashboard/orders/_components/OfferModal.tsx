'use client';

import { useState } from 'react';
import { OfferType } from './OfferPdfGenerator';

interface OfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (type: OfferType, vatRate: number) => void;
}

export default function OfferModal({ isOpen, onClose, onGenerate }: OfferModalProps) {
  const [selectedType, setSelectedType] = useState<OfferType>('OFFER');
  const [vatRate, setVatRate] = useState<number>(20); // Default 20%

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        
        <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
          <div className="mb-5">
            <h3 className="text-lg font-semibold leading-6 text-gray-900">
              Teklif Oluştur
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Lütfen oluşturmak istediğiniz teklif tipini ve KDV oranını seçiniz.
            </p>
          </div>

          <div className="space-y-4">
            {/* Offer Type Selection */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Teklif Tipi</label>
              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={() => setSelectedType('OPEN_COST')}
                  className={`flex items-center justify-between p-3 border rounded-md text-sm ${
                    selectedType === 'OPEN_COST' 
                      ? 'border-sky-500 bg-sky-50 text-sky-700 ring-1 ring-sky-500' 
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <span className="font-medium">Açık Maliyet</span>
                  <span className="text-xs text-gray-500">Tüm kalemler ve fiyatlar görünür</span>
                </button>
                
                <button
                  onClick={() => setSelectedType('CLOSED_COST')}
                  className={`flex items-center justify-between p-3 border rounded-md text-sm ${
                    selectedType === 'CLOSED_COST' 
                      ? 'border-sky-500 bg-sky-50 text-sky-700 ring-1 ring-sky-500' 
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <span className="font-medium">Kapalı Maliyet</span>
                  <span className="text-xs text-gray-500">Kalem isimleri görünür, fiyatlar gizli</span>
                </button>
                
                <button
                  onClick={() => setSelectedType('OFFER')}
                  className={`flex items-center justify-between p-3 border rounded-md text-sm ${
                    selectedType === 'OFFER' 
                      ? 'border-sky-500 bg-sky-50 text-sky-700 ring-1 ring-sky-500' 
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <span className="font-medium">Teklif</span>
                  <span className="text-xs text-gray-500">Sadece ürün adı ve toplam tutar</span>
                </button>
              </div>
            </div>

            {/* VAT Rate Selection */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">KDV Oranı (%)</label>
              <select
                value={vatRate}
                onChange={(e) => setVatRate(Number(e.target.value))}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-sky-600 sm:text-sm sm:leading-6"
              >
                <option value={0}>%0</option>
                <option value={1}>%1</option>
                <option value={10}>%10</option>
                <option value={20}>%20</option>
              </select>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              onClick={onClose}
            >
              İptal
            </button>
            <button
              type="button"
              className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              onClick={() => onGenerate(selectedType, vatRate)}
            >
              PDF Oluştur
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
