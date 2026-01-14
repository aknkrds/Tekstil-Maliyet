'use client';

import { useState } from 'react';

interface ProductQuickFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ProductQuickForm({ onSuccess, onCancel }: ProductQuickFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
  });
  const [files, setFiles] = useState<FileList | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const form = new FormData();
      form.append('name', formData.name);
      if (formData.code) form.append('code', formData.code);
      if (formData.description) form.append('description', formData.description);

      if (files && files.length > 0) {
        const max = Math.min(files.length, 5);
        for (let i = 0; i < max; i++) {
          form.append('images', files.item(i) as File);
        }
      }

      const res = await fetch('/api/products/upload-images', {
        method: 'POST',
        body: form,
      });

      if (!res.ok) {
        throw new Error('Ürün kaydedilemedi');
      }

      onSuccess();
    } catch (error) {
      console.error(error);
      alert('Bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6';
  const textareaClass =
    'block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium leading-6 text-gray-900">Ürün Kodu</label>
          <input
            type="text"
            value={formData.code}
            onChange={e => setFormData({ ...formData, code: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium leading-6 text-gray-900">Ürün Adı</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium leading-6 text-gray-900">Ürün Açıklaması</label>
        <textarea
          rows={3}
          value={formData.description}
          onChange={e => setFormData({ ...formData, description: e.target.value })}
          className={textareaClass}
        />
      </div>

      <div>
        <h3 className="text-sm font-semibold leading-6 text-gray-900 mb-2">Ürün Görselleri (en fazla 5 adet)</h3>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={e => setFiles(e.target.files)}
          className="block w-full text-sm text-gray-900 file:mr-4 file:rounded-md file:border-0 file:bg-indigo-50 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-indigo-700 hover:file:bg-indigo-100"
        />
        <p className="mt-2 text-xs text-gray-500">
          Bilgisayarınızdan en fazla 5 adet resim seçebilirsiniz.
        </p>
      </div>

      <div className="mt-6 flex items-center justify-end gap-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        >
          Vazgeç
        </button>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
        >
          {loading ? 'Kaydediliyor...' : 'Ürünü Kaydet'}
        </button>
      </div>
    </form>
  );
}
