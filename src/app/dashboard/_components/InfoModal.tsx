'use client';

import { useState, useEffect } from 'react';

export default function InfoModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if seen in this session
    const hasSeen = sessionStorage.getItem('hasSeenInfoModal');
    if (!hasSeen) {
      setIsOpen(true);
      sessionStorage.setItem('hasSeenInfoModal', 'true');
    }
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      {/* Background backdrop */}
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity backdrop-blur-sm" 
          aria-hidden="true"
        />

        {/* Modal panel */}
        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl border border-gray-200">
          <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4 max-h-[80vh] overflow-y-auto">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                <h3 className="text-2xl font-bold leading-6 text-sky-900 mb-6 border-b pb-4" id="modal-title">
                  Hoş Geldiniz - Kullanım ve Yasal Bilgilendirme
                </h3>
                
                <div className="mt-4 space-y-6 text-sm text-gray-600">
                  
                  {/* Bölüm 1: Kullanım Amacı ve Şartlar */}
                  <section className="bg-sky-50 p-4 rounded-lg border border-sky-100">
                    <h4 className="font-bold text-sky-800 text-lg mb-2">🎯 Kullanım Amacı ve Kapsamı</h4>
                    <p className="mb-2">
                      Bu uygulama, <span className="font-semibold">Tekstil, Ayakkabı ve benzeri üretim sektörleri</span> için özel olarak tasarlanmış, kapsamlı bir maliyet hesaplama ve yönetim sistemidir.
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Ürün maliyet analizi ve hesaplaması,</li>
                      <li>Müşteri teklif oluşturma ve yönetimi,</li>
                      <li>Sipariş takibi ve durum yönetimi</li>
                    </ul>
                    <p className="mt-2 text-xs text-sky-700">
                      Bu sistem, işletmenizin verimliliğini artırmak ve maliyet süreçlerini dijitalleştirmek amacıyla geliştirilmiştir.
                    </p>
                  </section>

                  {/* Bölüm 2: Lisans ve Fikri Mülkiyet */}
                  <section className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                    <h4 className="font-bold text-amber-800 text-lg mb-2">⚖️ Lisans ve Fikri Mülkiyet</h4>
                    <p>
                      Bu yazılımın tüm fikri mülkiyet hakları tarafımıza aittir ve <span className="font-semibold">lisanslıdır.</span> Yazılımın izinsiz kopyalanması, çoğaltılması, tersine mühendislik yapılması veya yetkisiz dağıtılması yasaktır ve yasal suç teşkil eder.
                    </p>
                  </section>

                  {/* Bölüm 3: Kullanım Kılavuzu */}
                  <section>
                    <h4 className="font-bold text-gray-900 text-lg mb-3">📘 Hızlı Kullanım Rehberi</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="border p-3 rounded hover:bg-gray-50 transition-colors">
                        <span className="font-bold text-sky-600 block mb-1">1. Müşteri Oluşturma</span>
                        Sürece başlamadan önce "Müşteriler" ekranından çalışacağınız firmayı kaydedin.
                      </div>
                      <div className="border p-3 rounded hover:bg-gray-50 transition-colors">
                        <span className="font-bold text-sky-600 block mb-1">2. Ürün ve Maliyet</span>
                        Ürünlerinizi oluştururken girdiğiniz fiyatların <span className="underline decoration-red-400 decoration-2">saf maliyet fiyatı</span> olduğunu unutmayın.
                      </div>
                      <div className="border p-3 rounded hover:bg-gray-50 transition-colors">
                        <span className="font-bold text-sky-600 block mb-1">3. Sipariş ve Fiyatlandırma</span>
                        Sipariş ekranında Müşteri ve Ürünü eşleştirin. Kar marjınızı ekleyerek müşteriye verilecek nihai satış fiyatını burada belirleyin.
                      </div>
                      <div className="border p-3 rounded hover:bg-gray-50 transition-colors">
                        <span className="font-bold text-sky-600 block mb-1">4. Durum Yönetimi</span>
                        İptal edilen siparişler "İptal" listesine düşer. Silinen ürünler ise "Pasif" olarak saklanır, veri kaybı yaşanmaz.
                      </div>
                    </div>
                  </section>

                  {/* Bölüm 4: Hesap ve Lisanslama */}
                  <section className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-bold text-gray-900 text-base mb-2">⚙️ Hesap Yönetimi ve Lisanslama</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <span className="mr-2">👥</span>
                        <span><span className="font-semibold">Kullanıcı Ekleme:</span> Aynı firma altında çalışanlarınız için "Ayarlar" sekmesinden yeni kullanıcılar oluşturabilirsiniz.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">⏳</span>
                        <span><span className="font-semibold">Deneme Sürümü:</span> Yeni hesaplar 7 günlük tam özellikli deneme süresine sahiptir. Süre bitiminde sistem "Salt Okunur" moda geçer.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">💳</span>
                        <span><span className="font-semibold">Lisans Satın Alma:</span> Kesintisiz kullanım için lisans satın al butonunu kullanabilirsiniz. Aylık veya Yıllık planlarımız mevcuttur.</span>
                      </li>
                    </ul>
                  </section>

                  {/* Bölüm 5: Gizlilik ve Güvenlik */}
                  <section className="text-xs text-gray-500 border-t pt-4">
                    <h4 className="font-bold text-gray-700 text-sm mb-1">🔒 Gizlilik ve Güvenlik Beyanı</h4>
                    <p className="mb-2">
                      Tüm verileriniz yüksek güvenlikli sunucularda şifrelenmiş olarak saklanmaktadır. Girilen hiçbir ticari veri, müşteri bilgisi veya maliyet detayı üçüncü şahıs veya firmalarla paylaşılmaz. Veri gizliliği esastır.
                    </p>
                    <p>
                      Kullanıcı hesabı güvenliği (şifre koruması) kullanıcının sorumluluğundadır. Şüpheli durumlarda derhal şifrenizi değiştiriniz.
                    </p>
                  </section>

                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 border-t border-gray-200">
            <button
              type="button"
              className="inline-flex w-full justify-center rounded-md bg-sky-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-sky-500 sm:ml-3 sm:w-auto transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Okudum, Anladım ve Kabul Ediyorum
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
