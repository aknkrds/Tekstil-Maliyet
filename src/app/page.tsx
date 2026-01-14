import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-b from-indigo-100 to-white">
      <img src="/symi.png" alt="Symi Logo" className="h-32 w-auto mb-8" />
      <h1 className="text-6xl font-bold text-indigo-800 mb-8">Symi</h1>
      <p className="text-2xl text-gray-600 mb-12 text-center max-w-2xl">
        Tekstil Üretim Maliyet Hesaplama ve Yönetim Sistemi
      </p>
      
      <div className="flex gap-6">
        <Link 
          href="/login" 
          className="bg-indigo-600 text-white px-8 py-4 rounded-lg text-xl font-semibold hover:bg-indigo-700 transition shadow-lg"
        >
          Giriş Yap
        </Link>
        <Link 
          href="/register" 
          className="bg-white text-indigo-600 border-2 border-indigo-600 px-8 py-4 rounded-lg text-xl font-semibold hover:bg-indigo-50 transition shadow-lg"
        >
          Kayıt Ol
        </Link>
      </div>
    </div>
  );
}
