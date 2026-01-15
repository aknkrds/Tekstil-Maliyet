import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import ProductForm from './ProductForm';

export default async function CreateProductPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-8">Yeni Ürün ve Maliyet Hesabı</h1>
      <ProductForm />
    </div>
  );
}
