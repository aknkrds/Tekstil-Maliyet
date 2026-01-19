'use client';

import { useState } from 'react';

export default function SupportBubble() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {isOpen && (
        <div className="mb-2 w-72 rounded-lg bg-white p-4 shadow-xl ring-1 ring-gray-900/5 transition-all duration-200 animate-in fade-in slide-in-from-bottom-4">
          <div className="mb-3 border-b border-gray-100 pb-2">
            <h3 className="text-sm font-semibold text-gray-900">Symi Destek Hattı</h3>
            <p className="text-xs text-gray-500">Size nasıl yardımcı olabiliriz?</p>
          </div>
          
          <div className="space-y-3">
            <a 
              href="tel:+905337328983" 
              className="flex items-center gap-3 rounded-md p-2 text-sm text-gray-700 hover:bg-sky-50 transition-colors"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-sky-600">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                  <path fillRule="evenodd" d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="font-medium">Telefon</span>
                <span className="text-xs text-gray-500">+90 533 732 89 83</span>
              </div>
            </a>

            <a 
              href="mailto:info@symi.com.tr" 
              className="flex items-center gap-3 rounded-md p-2 text-sm text-gray-700 hover:bg-orange-50 transition-colors"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                  <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
                  <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="font-medium">E-posta</span>
                <span className="text-xs text-gray-500">info@symi.com.tr</span>
              </div>
            </a>

            <a 
              href="https://wa.me/905337328983?text=Yardıma%20ihtiyacım%20var" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-md p-2 text-sm text-gray-700 hover:bg-green-50 transition-colors"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                  <path fillRule="evenodd" d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="font-medium">WhatsApp</span>
                <span className="text-xs text-gray-500">Hızlı Destek</span>
              </div>
            </a>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 transition-all hover:bg-indigo-500 hover:scale-110 active:scale-95"
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-7 w-7">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
          </svg>
        )}
      </button>
    </div>
  );
}
