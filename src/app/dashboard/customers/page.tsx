'use client';

import { useState, useEffect } from 'react';
import CustomerForm from './_components/CustomerForm';

export default function CustomersPage() {
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
            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                    <h1 className="text-base font-semibold leading-6 text-gray-900">Müşteriler</h1>
                    <p className="mt-2 text-sm text-gray-700">
                        Müşteri listesi ve yönetimi.
                    </p>
                </div>
                <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                    <button
                        onClick={handleCreate}
                        className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                    >
                        Yeni Müşteri Ekle
                    </button>
                </div>
            </div>

            <div className="mt-8 flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                        <table className="min-w-full divide-y divide-gray-300">
                            <thead>
                                <tr>
                                    <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">Müşteri Ünvanı</th>
                                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">E-posta</th>
                                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Telefon</th>
                                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Yetkili</th>
                                    <th className="relative py-3.5 pl-3 pr-4 sm:pr-0"><span className="sr-only">Düzenle</span></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {isLoading ? (
                                    <tr><td colSpan={5} className="text-center py-4">Yükleniyor...</td></tr>
                                ) : customers.length === 0 ? (
                                    <tr><td colSpan={5} className="text-center py-4">Kayıt bulunamadı.</td></tr>
                                ) : customers.map((customer) => (
                                    <tr key={customer.id}>
                                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">{customer.name}</td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{customer.email || '-'}</td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{customer.phone || '-'}</td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{customer.contactName || '-'}</td>
                                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                                            <button onClick={() => handleEdit(customer)} className="text-indigo-600 hover:text-indigo-900">Düzenle</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4">
                <div className="flex flex-1 justify-between sm:justify-end">
                    <button
                        onClick={() => setPagination(p => ({ ...p, page: Math.max(1, p.page - 1) }))}
                        disabled={pagination.page === 1}
                        className="relative inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:outline-offset-0 disabled:opacity-50"
                    >
                        Önceki
                    </button>
                    <button
                        onClick={() => setPagination(p => ({ ...p, page: Math.min(p.totalPages, p.page + 1) }))}
                        disabled={pagination.page === pagination.totalPages}
                        className="relative ml-3 inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:outline-offset-0 disabled:opacity-50"
                    >
                        Sonraki
                    </button>
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
