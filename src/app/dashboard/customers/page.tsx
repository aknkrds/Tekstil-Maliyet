'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import CustomerForm from './_components/CustomerForm';

export default function CustomersPage() {
    const searchParams = useSearchParams();
    const [customers, setCustomers] = useState<any[]>([]);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<any>(null);

    const fetchCustomers = async (page = 1) => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/customers?page=${page}`);
            const data = await res.json();
            setCustomers(data.customers || []);
            setPagination(data.pagination || { page: 1, totalPages: 1 });
        } catch (error) {
            console.error('Failed to fetch customers', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers(pagination.page);
    }, [pagination.page]);

    useEffect(() => {
        if (searchParams.get('new') === 'true') {
            setIsModalOpen(true);
        }
    }, [searchParams]);

    const handleEdit = (customer: any) => {
        setEditingCustomer(customer);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setEditingCustomer(null);
        setIsModalOpen(true);
    };

    const handleSuccess = () => {
        setIsModalOpen(false);
        fetchCustomers(pagination.page);
    };

    return (
        <div className="px-4 sm:px-6 lg:px-8">
            <div className="mb-3 flex items-center justify-between">
                <h1 className="text-lg font-semibold text-gray-800">Firma Listesi</h1>
                <button
                    onClick={handleCreate}
                    className="inline-flex items-center rounded bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-sky-500"
                >
                    + Yeni Firma
                </button>
            </div>

            <div className="mb-2 flex items-center justify-between rounded-t border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                    <span>Satır sayısı:</span>
                    <select className="rounded border border-slate-300 bg-white px-2 py-1 text-xs">
                        <option>10</option>
                        <option>20</option>
                        <option>50</option>
                    </select>
                </div>
                <div className="flex items-center gap-2">
                    <span>Arama:</span>
                    <input
                        type="text"
                        className="h-7 rounded border border-slate-300 px-2 text-xs"
                        placeholder="Ara..."
                    />
                </div>
            </div>

            <div className="overflow-hidden rounded-b border border-slate-200 bg-white">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-sky-100">
                            <tr>
                                <th className="w-8 border-r border-slate-200 px-2 py-2 text-left text-xs font-semibold text-gray-700">
                                    <input type="checkbox" className="h-4 w-4" />
                                </th>
                                <th className="border-r border-slate-200 px-3 py-2 text-left text-xs font-semibold text-gray-700">
                                    Firma Adı
                                </th>
                                <th className="border-r border-slate-200 px-3 py-2 text-left text-xs font-semibold text-gray-700">
                                    Telefon
                                </th>
                                <th className="border-r border-slate-200 px-3 py-2 text-left text-xs font-semibold text-gray-700">
                                    Şehir
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">
                                    Yetkili
                                </th>
                                <th className="w-24 border-l border-slate-200 px-3 py-2 text-right text-xs font-semibold text-gray-700">
                                    İşlem
                                </th>
                            </tr>
                            <tr className="bg-sky-50">
                                <th />
                                <th className="border-r border-slate-200 px-3 py-1">
                                    <input
                                        className="w-full rounded border border-slate-300 px-2 py-1 text-xs"
                                        placeholder="Ara..."
                                    />
                                </th>
                                <th className="border-r border-slate-200 px-3 py-1">
                                    <input
                                        className="w-full rounded border border-slate-300 px-2 py-1 text-xs"
                                        placeholder="Ara..."
                                    />
                                </th>
                                <th className="border-r border-slate-200 px-3 py-1">
                                    <input
                                        className="w-full rounded border border-slate-300 px-2 py-1 text-xs"
                                        placeholder="Ara..."
                                    />
                                </th>
                                <th className="px-3 py-1" />
                                <th />
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="py-6 text-center text-sm text-gray-500">
                                        Yükleniyor...
                                    </td>
                                </tr>
                            ) : customers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-6 text-center text-sm text-gray-500">
                                        Kayıt bulunamadı.
                                    </td>
                                </tr>
                            ) : (
                                customers.map((customer, index) => (
                                    <tr
                                        key={customer.id}
                                        className={index % 2 === 0 ? 'bg-white' : 'bg-sky-50/40'}
                                    >
                                        <td className="border-t border-slate-200 px-2 py-2">
                                            <input type="checkbox" className="h-4 w-4" />
                                        </td>
                                        <td className="border-t border-slate-200 px-3 py-2 text-xs text-sky-800 underline cursor-pointer">
                                            {customer.name}
                                        </td>
                                        <td className="border-t border-slate-200 px-3 py-2 text-xs text-gray-700">
                                            {customer.phone || '-'}
                                        </td>
                                        <td className="border-t border-slate-200 px-3 py-2 text-xs text-gray-700">
                                            {customer.billingCity || '-'}
                                        </td>
                                        <td className="border-t border-slate-200 px-3 py-2 text-xs text-gray-700">
                                            {customer.contactName || '-'}
                                        </td>
                                        <td className="border-t border-l border-slate-200 px-3 py-2 text-right text-xs">
                                            <button
                                                onClick={() => handleEdit(customer)}
                                                className="rounded bg-sky-500 px-2 py-1 text-[11px] font-semibold text-white hover:bg-sky-400"
                                            >
                                                Düzenle
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-3 py-2 text-xs text-gray-600">
                    <div className="flex items-center gap-2">
                        <span>10</span>
                        <span>20</span>
                        <span>50</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPagination(p => ({ ...p, page: Math.max(1, p.page - 1) }))}
                            disabled={pagination.page === 1}
                            className="rounded border border-slate-300 px-2 py-1 disabled:opacity-50"
                        >
                            Önceki
                        </button>
                        <span>
                            Sayfa {pagination.page} / {pagination.totalPages || 1}
                        </span>
                        <button
                            onClick={() => setPagination(p => ({ ...p, page: Math.min(p.totalPages, p.page + 1) }))}
                            disabled={pagination.page === pagination.totalPages}
                            className="rounded border border-slate-300 px-2 py-1 disabled:opacity-50"
                        >
                            Sonraki
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setIsModalOpen(false)} />
                        
                        <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6">
                            <div className="mb-5">
                                <h3 className="text-base font-semibold leading-6 text-gray-900">
                                    {editingCustomer ? 'Müşteri Düzenle' : 'Yeni Müşteri Ekle'}
                                </h3>
                            </div>
                            <CustomerForm
                                initialData={editingCustomer}
                                onSuccess={handleSuccess}
                                onCancel={() => setIsModalOpen(false)}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
