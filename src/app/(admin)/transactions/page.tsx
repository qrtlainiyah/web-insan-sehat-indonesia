"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeftRight, Package, Plus, Pencil, Trash2, X, ArrowDownCircle, ArrowUpCircle, Calendar } from "lucide-react";
import { AdminOnly } from "@/components/auth/AdminOnly";
import Breadcrumb from "@/components/common/Breadcrumb";
import Loading from "@/components/common/Loading";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface Transaction {
    id: number;
    productId: number;
    type: string;
    quantity: number;
    description: string | null;
    date: Date;
    product: {
        id: number;
        name: string;
        imageUrl: string | null;
    };
}

interface Product {
    id: number;
    name: string;
}

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [activeQuickFilter, setActiveQuickFilter] = useState<number | null>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState("");
    const [selectedType, setSelectedType] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [editingId, setEditingId] = useState<number | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const [formData, setFormData] = useState({
        productId: "",
        type: "IN",
        quantity: "",
        description: "",
        date: new Date().toISOString().split('T')[0],
    });

    useEffect(() => {
        document.title = "Transaksi Barang - Insan Sehat Indonesia";
        fetchTransactions(selectedProduct, selectedType, startDate, endDate);
        fetchProducts();
    }, [page]);

    useEffect(() => {
        if (showForm || deleteId) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [showForm, deleteId]);

    const fetchTransactions = async (productFilter?: string, typeFilter?: string, start?: string, end?: string, manualPage?: number) => {
        try {
            setIsLoading(true);
            const currentPage = manualPage || page;
            let url = `/api/transactions?page=${currentPage}&limit=20&`;
            if (productFilter) url += `productId=${productFilter}&`;
            if (typeFilter) url += `type=${typeFilter}&`;
            if (start) url += `startDate=${start}&`;
            if (end) url += `endDate=${end}&`;

            const response = await fetch(url);
            if (response.ok) {
                const result = await response.json();
                setTransactions(result.data || []);
                setTotalPages(result.meta?.totalPages || 1);
                if (manualPage) setPage(manualPage);
            }
        } catch (error) {
            console.error("Error fetching transactions:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await fetch("/api/products");
            if (response.ok) {
                const result = await response.json();
                setProducts(result.data || []);
            }
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };

    const handleFilter = () => {
        fetchTransactions(selectedProduct, selectedType, startDate, endDate, 1);
    };

    const handleQuickFilter = (days: number) => {
        setActiveQuickFilter(days);
        const today = new Date();
        const start = new Date(today);
        start.setDate(today.getDate() - days);

        const startStr = start.toISOString().split('T')[0];
        const endStr = today.toISOString().split('T')[0];

        setStartDate(startStr);
        setEndDate(endStr);
        fetchTransactions(selectedProduct, selectedType, startStr, endStr, 1);
    };

    const handleResetFilter = () => {
        setSelectedProduct("");
        setSelectedType("");
        setStartDate("");
        setEndDate("");
        setActiveQuickFilter(null);
        setPage(1);
        fetchTransactions("", "", "", "", 1);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = editingId ? `/api/transactions/${editingId}` : "/api/transactions";
            const method = editingId ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    productId: parseInt(formData.productId),
                    type: formData.type,
                    quantity: parseInt(formData.quantity),
                    description: formData.description || null,
                    date: formData.date,
                }),
            });

            if (response.ok) {
                await fetchTransactions(selectedProduct, selectedType, startDate, endDate);
                handleCancel();
            }
        } catch (error) {
            console.error("Error saving transaction:", error);
        }
    };

    const handleEdit = (transaction: Transaction) => {
        setEditingId(transaction.id);
        setFormData({
            productId: transaction.productId.toString(),
            type: transaction.type,
            quantity: transaction.quantity.toString(),
            description: transaction.description || "",
            date: new Date(transaction.date).toISOString().split('T')[0],
        });
        setShowForm(true);
    };

    const handleDelete = async (id: number) => {
        try {
            const response = await fetch(`/api/transactions/${id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                await fetchTransactions(selectedProduct, selectedType, startDate, endDate);
                setDeleteId(null);
            }
        } catch (error) {
            console.error("Error deleting transaction:", error);
        }
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingId(null);
        setFormData({
            productId: "",
            type: "IN",
            quantity: "",
            description: "",
            date: new Date().toISOString().split('T')[0],
        });
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    if (isLoading) {
        return <Loading />;
    }

    return (
        <div className="p-0 sm:p-6">
            <div className="px-4 sm:px-0">
                <Breadcrumb
                    items={[
                        { label: "Dashboard", href: "/" },
                        { label: "Transaksi Barang" }
                    ]}
                />
            </div>

            <div className="mt-4 sm:mt-6">
                <div className="overflow-hidden rounded-none sm:rounded-2xl border-y sm:border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
                    <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-800">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h1 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                                    Transaksi Barang
                                </h1>
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    Kelola transaksi keluar masuk barang
                                </p>
                            </div>
                            <AdminOnly>
                                <button
                                    onClick={() => setShowForm(true)}
                                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-blue-700"
                                >
                                    <Plus className="h-4 w-4" />
                                    <span className="hidden sm:inline">Tambah Transaksi</span>
                                    <span className="sm:hidden">Tambah</span>
                                </button>
                            </AdminOnly>
                        </div>

                        {/* Filters */}
                        <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-end">
                            <div className="flex-1 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                                <div>
                                    <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        Produk
                                    </label>
                                    <select
                                        value={selectedProduct}
                                        onChange={(e) => setSelectedProduct(e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                    >
                                        <option value="">Semua Produk</option>
                                        {products.map(product => (
                                            <option key={product.id} value={product.id}>{product.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        Tipe
                                    </label>
                                    <select
                                        value={selectedType}
                                        onChange={(e) => setSelectedType(e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                    >
                                        <option value="">Semua Tipe</option>
                                        <option value="IN">Masuk</option>
                                        <option value="OUT">Keluar</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        Dari
                                    </label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => {
                                            setStartDate(e.target.value);
                                            setActiveQuickFilter(null);
                                        }}
                                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        Sampai
                                    </label>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => {
                                            setEndDate(e.target.value);
                                            setActiveQuickFilter(null);
                                        }}
                                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                    />
                                </div>
                                <div className="flex items-end">
                                    <button
                                        onClick={handleFilter}
                                        className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-blue-700"
                                    >
                                        Filter
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 flex flex-wrap items-center gap-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400">Quick:</span>
                            {[
                                { label: 'Hari Ini', days: 0 },
                                { label: '7 Hari', days: 7 },
                                { label: '30 Hari', days: 30 }
                            ].map((filter) => (
                                <button
                                    key={filter.label}
                                    onClick={() => handleQuickFilter(filter.days)}
                                    className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${activeQuickFilter === filter.days
                                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                                        }`}
                                >
                                    {filter.label}
                                </button>
                            ))}
                            {(selectedProduct || selectedType || startDate || endDate) && (
                                <button
                                    onClick={handleResetFilter}
                                    className="ml-auto text-xs font-medium text-red-600 hover:text-red-700 dark:text-red-400"
                                >
                                    Reset Filter
                                </button>
                            )}
                        </div>
                    </div>

                    {transactions.length === 0 ? (
                        <div className="py-12 text-center">
                            <ArrowLeftRight className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-600" />
                            <h3 className="mt-4 text-lg font-semibold text-gray-800 dark:text-white/90">
                                Belum ada transaksi
                            </h3>
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                Mulai catat transaksi keluar masuk barang
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="hidden md:block overflow-x-auto">
                                <Table>
                                    <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                                        <TableRow>
                                            <TableCell
                                                isHeader
                                                className="py-3 pl-6 font-medium text-gray-500 text-start text-xs uppercase tracking-wider dark:text-gray-400"
                                            >
                                                TANGGAL
                                            </TableCell>
                                            <TableCell
                                                isHeader
                                                className="py-3 font-medium text-gray-500 text-start text-xs uppercase tracking-wider dark:text-gray-400"
                                            >
                                                PRODUK
                                            </TableCell>
                                            <TableCell
                                                isHeader
                                                className="py-3 font-medium text-gray-500 text-center text-xs uppercase tracking-wider dark:text-gray-400"
                                            >
                                                TIPE
                                            </TableCell>
                                            <TableCell
                                                isHeader
                                                className="py-3 font-medium text-gray-500 text-center text-xs uppercase tracking-wider dark:text-gray-400"
                                            >
                                                JUMLAH
                                            </TableCell>
                                            <TableCell
                                                isHeader
                                                className="py-3 font-medium text-gray-500 text-start text-xs uppercase tracking-wider dark:text-gray-400"
                                            >
                                                KETERANGAN
                                            </TableCell>
                                            <AdminOnly>
                                                <TableCell
                                                    isHeader
                                                    className="py-3 pr-6 font-medium text-gray-500 text-end text-xs uppercase tracking-wider dark:text-gray-400"
                                                >
                                                    AKSI
                                                </TableCell>
                                            </AdminOnly>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                                        {transactions.map((transaction) => (
                                            <TableRow key={transaction.id} className="transition-colors hover:bg-gray-50/50 dark:hover:bg-white/[0.02]">
                                                <TableCell className="py-4 pl-6 text-sm text-gray-500 dark:text-gray-400">
                                                    <div className="flex items-center gap-2">
                                                        {formatDate(transaction.date)}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                                                            {transaction.product.imageUrl ? (
                                                                <img
                                                                    src={transaction.product.imageUrl}
                                                                    alt={transaction.product.name}
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="flex h-full items-center justify-center">
                                                                    <Package className="h-5 w-5 text-gray-400" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <span className="font-medium text-gray-800 dark:text-white/90">
                                                            {transaction.product.name}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-4 text-center">
                                                    <div className="flex justify-center">
                                                        {transaction.type === "IN" ? (
                                                            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/20 dark:text-green-400">
                                                                <ArrowDownCircle className="h-3.5 w-3.5" />
                                                                Masuk
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/20 dark:text-red-400">
                                                                <ArrowUpCircle className="h-3.5 w-3.5" />
                                                                Keluar
                                                            </span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-4 text-center">
                                                    <span className={`text-sm font-bold ${transaction.type === "IN" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                                                        {transaction.type === "IN" ? "+" : "-"}{transaction.quantity}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="py-4 text-sm text-gray-500 dark:text-gray-400">
                                                    {transaction.description || "-"}
                                                </TableCell>
                                                <AdminOnly>
                                                    <TableCell className="py-4 pr-6 text-end">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                onClick={() => handleEdit(transaction)}
                                                                className="rounded-lg p-2 text-blue-600 transition-colors hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => setDeleteId(transaction.id)}
                                                                className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </TableCell>
                                                </AdminOnly>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Mobile View - Cards */}
                            <div className="md:hidden p-4 space-y-3">
                                {transactions.map((transaction) => (
                                    <div
                                        key={transaction.id}
                                        className="rounded-xl border border-gray-200 bg-white p-4 transition-all hover:shadow-md dark:border-gray-800 dark:bg-white/[0.02] dark:hover:bg-white/[0.04]"
                                    >
                                        <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-3 dark:border-gray-800">
                                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                                <Calendar className="h-4 w-4" />
                                                {formatDate(transaction.date)}
                                            </div>
                                            {transaction.type === "IN" ? (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/20 dark:text-green-400">
                                                    <ArrowDownCircle className="h-3.5 w-3.5" />
                                                    Masuk
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/20 dark:text-red-400">
                                                    <ArrowUpCircle className="h-3.5 w-3.5" />
                                                    Keluar
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex gap-3">
                                            <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                                                {transaction.product.imageUrl ? (
                                                    <img
                                                        src={transaction.product.imageUrl}
                                                        alt={transaction.product.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full items-center justify-center">
                                                        <Package className="h-5 w-5 text-gray-400" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h3 className="font-medium text-gray-800 dark:text-white/90">
                                                            {transaction.product.name}
                                                        </h3>
                                                        <div className="mt-1 flex items-center gap-2">
                                                            <span className="text-xs uppercase tracking-wider text-gray-500">
                                                                Jumlah:
                                                            </span>
                                                            <span className={`font-bold ${transaction.type === "IN" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                                                                {transaction.type === "IN" ? "+" : "-"}{transaction.quantity}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                {transaction.description && (
                                                    <p className="mt-2 text-sm text-gray-500 line-clamp-2 dark:text-gray-400">
                                                        {transaction.description}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <AdminOnly>
                                            <div className="mt-4 flex justify-end gap-2 border-t border-gray-100 pt-3 dark:border-gray-800">
                                                <button
                                                    onClick={() => handleEdit(transaction)}
                                                    className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 transition-colors hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
                                                >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => setDeleteId(transaction.id)}
                                                    className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 transition-colors hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                    Hapus
                                                </button>
                                            </div>
                                        </AdminOnly>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {/* Pagination */}
                    {transactions.length > 0 && (
                        <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4 dark:border-gray-800">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Halaman {page} dari {totalPages}
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="rounded-lg border border-gray-300 px-3 py-1 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                                >
                                    Sebelumnya
                                </button>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="rounded-lg border border-gray-300 px-3 py-1 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                                >
                                    Selanjutnya
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {showForm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm">
                    <div className="relative w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                                {editingId ? "Edit Transaksi" : "Tambah Transaksi"}
                            </h2>
                            <button
                                onClick={handleCancel}
                                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                    Produk *
                                </label>
                                <select
                                    required
                                    value={formData.productId}
                                    onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-800 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                >
                                    <option value="">Pilih Produk</option>
                                    {products.map(product => (
                                        <option key={product.id} value={product.id}>{product.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                    Tipe *
                                </label>
                                <div className="flex gap-4">
                                    <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 p-3 flex-1 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
                                        <input
                                            type="radio"
                                            value="IN"
                                            checked={formData.type === "IN"}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            className="h-4 w-4 text-blue-600"
                                        />
                                        <span className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                            <ArrowDownCircle className="h-4 w-4 text-green-600" />
                                            Masuk
                                        </span>
                                    </label>
                                    <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 p-3 flex-1 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
                                        <input
                                            type="radio"
                                            value="OUT"
                                            checked={formData.type === "OUT"}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            className="h-4 w-4 text-blue-600"
                                        />
                                        <span className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                            <ArrowUpCircle className="h-4 w-4 text-red-600" />
                                            Keluar
                                        </span>
                                    </label>
                                </div>
                            </div>
                            <div>
                                <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                    Jumlah *
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    value={formData.quantity}
                                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-800 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                    placeholder="0"
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                    Tanggal *
                                </label>
                                <input
                                    type="date"
                                    required
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-800 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                    Keterangan
                                </label>
                                <textarea
                                    rows={3}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-800 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                    placeholder="Opsional"
                                />
                            </div>
                            <div className="flex gap-3 border-t border-gray-200 pt-4 dark:border-gray-700">
                                <button
                                    type="submit"
                                    className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white transition-all hover:bg-blue-700"
                                >
                                    {editingId ? "Update" : "Simpan"}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="rounded-lg border border-gray-300 px-4 py-2.5 font-medium text-gray-700 transition-all hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                                >
                                    Batal
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            {deleteId && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="relative w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900">
                        <h3 className="mb-2 text-lg font-bold text-gray-800 dark:text-white">
                            Hapus Transaksi?
                        </h3>
                        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
                            Transaksi yang dihapus tidak dapat dikembalikan.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => handleDelete(deleteId)}
                                className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 font-medium text-white transition-all hover:bg-red-700"
                            >
                                Hapus
                            </button>
                            <button
                                onClick={() => setDeleteId(null)}
                                className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 font-medium text-gray-700 transition-all hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                            >
                                Batal
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
