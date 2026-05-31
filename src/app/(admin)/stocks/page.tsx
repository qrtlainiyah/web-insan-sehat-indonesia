"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, Calendar, Plus, Minus, Check, X, ChevronLeft, ChevronRight } from "lucide-react";
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

interface StockSummary {
    id: number;
    name: string;
    imageUrl: string | null;
    currentStock: number;
    hasStockToday: boolean;
}

interface PaginationMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export default function StocksPage() {
    const [summary, setSummary] = useState<StockSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editQuantity, setEditQuantity] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [pagination, setPagination] = useState<PaginationMeta>({
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 1
    });

    useEffect(() => {
        document.title = "Stok Barang - Insan Sehat Indonesia";
        fetchStockSummary();
    }, [selectedDate, pagination.page]);

    // Reset page to 1 when date changes
    useEffect(() => {
        setPagination(prev => ({ ...prev, page: 1 }));
    }, [selectedDate]);

    const fetchStockSummary = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`/api/stocks/summary?date=${selectedDate}&page=${pagination.page}&limit=${pagination.limit}`);
            if (response.ok) {
                const data = await response.json();
                setSummary(data.summary);
                if (data.meta) {
                    setPagination(prev => ({
                        ...prev,
                        ...data.meta
                    }));
                }
            }
        } catch (error) {
            console.error("Error fetching stock summary:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (product: StockSummary) => {
        setEditingId(product.id);
        setEditQuantity(product.currentStock.toString());
    };

    const handleCancel = () => {
        setEditingId(null);
        setEditQuantity("");
    };

    const handleSave = async (productId: number) => {
        setIsSaving(true);
        try {
            const response = await fetch("/api/stocks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    productId,
                    date: selectedDate,
                    quantity: parseInt(editQuantity),
                }),
            });

            if (response.ok) {
                await fetchStockSummary();
                setEditingId(null);
                setEditQuantity("");
            }
        } catch (error) {
            console.error("Error updating stock:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const getStockColor = (quantity: number) => {
        if (quantity === 0) return "text-gray-500";
        if (quantity < 10) return "text-red-600 dark:text-red-400";
        if (quantity < 50) return "text-yellow-600 dark:text-yellow-400";
        return "text-green-600 dark:text-green-400";
    };

    const getStockBadge = (quantity: number) => {
        if (quantity === 0) return { label: "Habis", color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" };
        if (quantity < 10) return { label: "Rendah", color: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400" };
        if (quantity < 50) return { label: "Sedang", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400" };
        return { label: "Aman", color: "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400" };
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            setPagination(prev => ({ ...prev, page: newPage }));
        }
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
                        { label: "Stok Barang" }
                    ]}
                />
            </div>

            <div className="mt-4 sm:mt-6">
                <div className="overflow-hidden rounded-none sm:rounded-2xl border-y sm:border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
                    <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-800">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h1 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                                    Stok Barang
                                </h1>
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    Kelola stok barang harian ({pagination.total} total)
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-gray-500" />
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-800 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                />
                            </div>
                        </div>
                    </div>

                    {summary.length === 0 ? (
                        <div className="py-12 text-center">
                            <Package className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-600" />
                            <h3 className="mt-4 text-lg font-semibold text-gray-800 dark:text-white/90">
                                Belum ada produk
                            </h3>
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                Tambahkan produk terlebih dahulu
                            </p>
                            <Link
                                href="/products/new"
                                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-blue-700"
                            >
                                <Plus className="h-4 w-4" />
                                Tambah Produk
                            </Link>
                        </div>
                    ) : (
                        <>
                            {/* Desktop/Tablet View - Table */}
                            <div className="hidden md:block overflow-x-auto">
                                <Table>
                                    <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                                        <TableRow>
                                            <TableCell
                                                isHeader
                                                className="py-3 pl-6 font-medium text-gray-500 text-start text-xs uppercase tracking-wider dark:text-gray-400"
                                            >
                                                Produk
                                            </TableCell>
                                            <TableCell
                                                isHeader
                                                className="py-3 font-medium text-gray-500 text-center text-xs uppercase tracking-wider dark:text-gray-400"
                                            >
                                                Stok Saat Ini
                                            </TableCell>
                                            <TableCell
                                                isHeader
                                                className="py-3 font-medium text-gray-500 text-center text-xs uppercase tracking-wider dark:text-gray-400"
                                            >
                                                Status
                                            </TableCell>
                                            <AdminOnly>
                                                <TableCell
                                                    isHeader
                                                    className="py-3 pr-6 font-medium text-gray-500 text-end text-xs uppercase tracking-wider dark:text-gray-400"
                                                >
                                                    Aksi
                                                </TableCell>
                                            </AdminOnly>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                                        {summary.map((product) => (
                                            <TableRow key={product.id} className="transition-colors hover:bg-gray-50/50 dark:hover:bg-white/[0.02]">
                                                <TableCell className="py-4 pl-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                                                            {product.imageUrl ? (
                                                                <img
                                                                    src={product.imageUrl}
                                                                    alt={product.name}
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="flex h-full items-center justify-center">
                                                                    <Package className="h-5 w-5 text-gray-400" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <span className="font-medium text-gray-800 dark:text-white/90">
                                                            {product.name}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-4 text-center">
                                                    {editingId === product.id ? (
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button
                                                                onClick={() => setEditQuantity((prev) => Math.max(0, parseInt(prev || "0") - 1).toString())}
                                                                disabled={parseInt(editQuantity || "0") === 0}
                                                                className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-600 transition-colors hover:bg-red-200 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-red-900/20 dark:text-red-400"
                                                            >
                                                                <Minus className="h-3.5 w-3.5" />
                                                            </button>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                value={editQuantity}
                                                                onChange={(e) => setEditQuantity(e.target.value)}
                                                                className="w-20 rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-center text-sm font-medium text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                                            />
                                                            <button
                                                                onClick={() => setEditQuantity((prev) => (parseInt(prev || "0") + 1).toString())}
                                                                className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 text-green-600 transition-colors hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400"
                                                            >
                                                                <Plus className="h-3.5 w-3.5" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className={`text-lg font-bold ${getStockColor(product.currentStock)}`}>
                                                            {product.currentStock}
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell className="py-4 text-center">
                                                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getStockBadge(product.currentStock).color}`}>
                                                        {getStockBadge(product.currentStock).label}
                                                    </span>
                                                </TableCell>
                                                <AdminOnly>
                                                    <TableCell className="py-4 pr-6">
                                                        {editingId === product.id ? (
                                                            <div className="flex items-center justify-end gap-2">
                                                                <button
                                                                    onClick={() => handleSave(product.id)}
                                                                    disabled={isSaving}
                                                                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                                                                >
                                                                    <Check className="h-4 w-4" />
                                                                </button>
                                                                <button
                                                                    onClick={handleCancel}
                                                                    disabled={isSaving}
                                                                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 disabled:opacity-50"
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center justify-end">
                                                                <button
                                                                    onClick={() => handleEdit(product)}
                                                                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                                                                >
                                                                    Update Stok
                                                                </button>
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                </AdminOnly>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Mobile View - Cards */}
                            <div className="md:hidden p-4 space-y-3">
                                {summary.map((product) => (
                                    <div
                                        key={product.id}
                                        className="rounded-xl border border-gray-200 bg-white p-4 transition-all hover:shadow-md dark:border-gray-800 dark:bg-white/[0.02] dark:hover:bg-white/[0.04]"
                                    >
                                        <div className="flex items-start gap-3 mb-4">
                                            <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                                                {product.imageUrl ? (
                                                    <img
                                                        src={product.imageUrl}
                                                        alt={product.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full items-center justify-center">
                                                        <Package className="h-5 w-5 text-gray-400" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h3 className="font-semibold text-gray-800 truncate dark:text-white/90">
                                                    {product.name}
                                                </h3>
                                                <div className="mt-1 flex items-center gap-2">
                                                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${getStockBadge(product.currentStock).color}`}>
                                                        {getStockBadge(product.currentStock).label}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <AdminOnly>
                                            <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                                        Stok Saat Ini
                                                    </span>
                                                    {!editingId && (
                                                        <span className={`text-lg font-bold ${getStockColor(product.currentStock)}`}>
                                                            {product.currentStock}
                                                        </span>
                                                    )}
                                                </div>

                                                {editingId === product.id ? (
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => setEditQuantity((prev) => Math.max(0, parseInt(prev || "0") - 1).toString())}
                                                            disabled={parseInt(editQuantity || "0") === 0}
                                                            className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 text-red-600 transition-colors hover:bg-red-200 disabled:opacity-50 dark:bg-red-900/20 dark:text-red-400"
                                                        >
                                                            <Minus className="h-4 w-4" />
                                                        </button>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={editQuantity}
                                                            onChange={(e) => setEditQuantity(e.target.value)}
                                                            className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-center text-base font-medium text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                                        />
                                                        <button
                                                            onClick={() => setEditQuantity((prev) => (parseInt(prev || "0") + 1).toString())}
                                                            className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600 transition-colors hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400"
                                                        >
                                                            <Plus className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => handleEdit(product)}
                                                        className="w-full rounded-lg border border-gray-300 bg-white py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                                                    >
                                                        Update Stok
                                                    </button>
                                                )}

                                                {editingId === product.id && (
                                                    <div className="grid grid-cols-2 gap-2 mt-3">
                                                        <button
                                                            onClick={handleCancel}
                                                            disabled={isSaving}
                                                            className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                                                        >
                                                            <X className="h-4 w-4" />
                                                            Batal
                                                        </button>
                                                        <button
                                                            onClick={() => handleSave(product.id)}
                                                            disabled={isSaving}
                                                            className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700"
                                                        >
                                                            <Check className="h-4 w-4" />
                                                            Simpan
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </AdminOnly>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination Controls */}
                            <div className="mt-4 flex flex-col gap-4 border-t border-gray-100 p-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                                <p className="text-center text-sm text-gray-500 dark:text-gray-400 sm:text-left">
                                    Halaman <span className="font-medium text-gray-900 dark:text-white">{pagination.page}</span> dari <span className="font-medium text-gray-900 dark:text-white">{pagination.totalPages}</span>
                                </p>

                                <div className="flex justify-center gap-2">
                                    <button
                                        onClick={() => handlePageChange(pagination.page - 1)}
                                        disabled={pagination.page <= 1}
                                        className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        Sebelumnya
                                    </button>
                                    <button
                                        onClick={() => handlePageChange(pagination.page + 1)}
                                        disabled={pagination.page >= pagination.totalPages}
                                        className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                                    >
                                        Selanjutnya
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
