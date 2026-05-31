"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { History as HistoryIcon, Package, Calendar, ArrowLeft, Filter } from "lucide-react";
import Breadcrumb from "@/components/common/Breadcrumb";
import Loading from "@/components/common/Loading";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface Stock {
    id: number;
    productId: number;
    quantity: number;
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

export default function StockHistoryPage() {
    const [stocks, setStocks] = useState<Stock[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    useEffect(() => {
        document.title = "Riwayat Stok - Insan Sehat Indonesia";
        fetchStockHistory(selectedProduct, startDate, endDate);
        fetchProducts();
    }, [page]);

    const fetchStockHistory = async (productFilter?: string, start?: string, end?: string, manualPage?: number) => {
        try {
            setIsLoading(true);
            const currentPage = manualPage || page;
            let url = `/api/stocks/history?page=${currentPage}&limit=20&`;
            if (productFilter) url += `productId=${productFilter}&`;
            if (start) url += `startDate=${start}&`;
            if (end) url += `endDate=${end}&`;

            const response = await fetch(url);
            if (response.ok) {
                const result = await response.json();
                setStocks(result.data || []);
                setTotalPages(result.meta?.totalPages || 1);
                if (manualPage) setPage(manualPage);
            }
        } catch (error) {
            console.error("Error fetching stock history:", error);
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
        fetchStockHistory(selectedProduct, startDate, endDate, 1);
    };

    const handleQuickFilter = (days: number) => {
        const today = new Date();
        const start = new Date(today);
        start.setDate(today.getDate() - days);

        setStartDate(start.toISOString().split('T')[0]);
        setEndDate(today.toISOString().split('T')[0]);
        fetchStockHistory(selectedProduct, start.toISOString().split('T')[0], today.toISOString().split('T')[0], 1);
    };

    const handleResetFilter = () => {
        setSelectedProduct("");
        setStartDate("");
        setEndDate("");
        setPage(1);
        fetchStockHistory("", "", "", 1);
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const getStockStatus = (quantity: number) => {
        if (quantity === 0) return { color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/20', label: 'Habis' };
        if (quantity < 10) return { color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900/20', label: 'Rendah' };
        if (quantity < 50) return { color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-900/20', label: 'Sedang' };
        return { color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/20', label: 'Aman' };
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
                        { label: "Stok", href: "/stocks" },
                        { label: "Riwayat" }
                    ]}
                />
            </div>

            <div className="mt-4 sm:mt-6">
                <div className="overflow-hidden rounded-none sm:rounded-2xl border-y sm:border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
                    <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-800">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h1 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                                    Riwayat Stok
                                </h1>
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    Lihat history perubahan stok
                                </p>
                            </div>
                            <Link
                                href="/stocks"
                                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                <span className="hidden sm:inline">Kembali ke Stok</span>
                            </Link>
                        </div>

                        {/* Filters */}
                        <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-end">
                            <div className="flex-1 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                                        Dari Tanggal
                                    </label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        Sampai Tanggal
                                    </label>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
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

                        {/* Quick filter & Reset */}
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
                                    className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 transition-all hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                                >
                                    {filter.label}
                                </button>
                            ))}
                            {(selectedProduct || startDate || endDate) && (
                                <button
                                    onClick={handleResetFilter}
                                    className="ml-auto text-xs font-medium text-red-600 hover:text-red-700 dark:text-red-400"
                                >
                                    Reset Filter
                                </button>
                            )}
                        </div>
                    </div>

                    {stocks.length === 0 ? (
                        <div className="py-12 text-center">
                            <HistoryIcon className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-600" />
                            <h3 className="mt-4 text-lg font-semibold text-gray-800 dark:text-white/90">
                                Belum ada riwayat
                            </h3>
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                Gunakan filter untuk mencari riwayat spesifik
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Desktop View - Table */}
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
                                                JUMLAH STOK
                                            </TableCell>
                                            <TableCell
                                                isHeader
                                                className="py-3 pr-6 font-medium text-gray-500 text-end text-xs uppercase tracking-wider dark:text-gray-400"
                                            >
                                                STATUS
                                            </TableCell>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                                        {stocks.map((stock) => {
                                            const status = getStockStatus(stock.quantity);
                                            return (
                                                <TableRow key={stock.id} className="transition-colors hover:bg-gray-50/50 dark:hover:bg-white/[0.02]">
                                                    <TableCell className="py-4 pl-6 text-sm text-gray-500 dark:text-gray-400">
                                                        <div className="flex items-center gap-2">
                                                            {formatDate(stock.date)}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                                                                {stock.product.imageUrl ? (
                                                                    <img
                                                                        src={stock.product.imageUrl}
                                                                        alt={stock.product.name}
                                                                        className="h-full w-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="flex h-full items-center justify-center">
                                                                        <Package className="h-5 w-5 text-gray-400" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <span className="font-medium text-gray-800 dark:text-white/90">
                                                                {stock.product.name}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="py-4 text-center">
                                                        <span className="font-semibold text-gray-700 dark:text-gray-300">
                                                            {stock.quantity}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="py-4 pr-6 text-end">
                                                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${status.bg} ${status.color}`}>
                                                            {status.label}
                                                        </span>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Mobile View - Cards */}
                            <div className="md:hidden p-4 space-y-3">
                                {stocks.map((stock) => {
                                    const status = getStockStatus(stock.quantity);
                                    return (
                                        <div
                                            key={stock.id}
                                            className="rounded-xl border border-gray-200 bg-white p-4 transition-all hover:shadow-md dark:border-gray-800 dark:bg-white/[0.02] dark:hover:bg-white/[0.04]"
                                        >
                                            <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-3 dark:border-gray-800">
                                                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                                    {formatDate(stock.date)}
                                                </div>
                                                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${status.bg} ${status.color}`}>
                                                    {status.label}
                                                </span>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                                                    {stock.product.imageUrl ? (
                                                        <img
                                                            src={stock.product.imageUrl}
                                                            alt={stock.product.name}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full items-center justify-center">
                                                            <Package className="h-5 w-5 text-gray-400" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="font-medium text-gray-800 dark:text-white/90">
                                                        {stock.product.name}
                                                    </h3>
                                                    <div className="mt-1 flex items-center gap-2">
                                                        <span className="text-xs uppercase tracking-wider text-gray-500">
                                                            Stok:
                                                        </span>
                                                        <span className="font-bold text-gray-700 dark:text-white">
                                                            {stock.quantity}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Pagination */}
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
                        </>
                    )}
                </div>
            </div>
        </div >
    );
}
