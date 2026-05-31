"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Pencil, Trash2, Package, ChevronLeft, ChevronRight } from "lucide-react";
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

interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    imageUrl: string | null;
    createdAt: string;
    updatedAt: string;
}

interface PaginationMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [pagination, setPagination] = useState<PaginationMeta>({
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 1
    });

    useEffect(() => {
        document.title = "Produk - Insan Sehat Indonesia";
        fetchProducts();
    }, [pagination.page]);

    useEffect(() => {
        if (deleteId) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [deleteId]);

    const fetchProducts = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`/api/products?page=${pagination.page}&limit=${pagination.limit}`);
            if (response.ok) {
                const result = await response.json();
                setProducts(result.data);
                setPagination(prev => ({
                    ...prev,
                    ...result.meta
                }));
            }
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;

        try {
            const response = await fetch(`/api/products/${deleteId}`, {
                method: "DELETE",
            });

            if (response.ok) {
                // Refresh data to handle pagination correctly after deletion
                fetchProducts();
                setDeleteId(null);
            }
        } catch (error) {
            console.error("Error deleting product:", error);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(price);
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
            <Breadcrumb
                items={[
                    { label: "Dashboard", href: "/" },
                    { label: "Produk" }
                ]}
            />

            {deleteId && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="relative w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900">
                        <div className="mb-6 flex flex-col items-center text-center">
                            <div className="mb-4 rounded-full bg-red-100 p-3 dark:bg-red-900/20">
                                <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
                            </div>
                            <h3 className="mb-2 text-lg font-bold text-gray-800 dark:text-white">
                                Hapus Produk?
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Data produk yang dihapus tidak dapat dikembalikan.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleDelete}
                                className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 font-medium text-white transition-all hover:bg-red-700"
                            >
                                Hapus
                            </button>
                            <button
                                onClick={() => setDeleteId(null)}
                                className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 font-medium text-gray-700 transition-all hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                            >
                                Batal
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                            Daftar Produk
                        </h3>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            Kelola semua produk Anda ({pagination.total} total)
                        </p>
                    </div>

                    <AdminOnly>
                        <Link
                            href="/products/new"
                            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/20"
                        >
                            <Plus className="h-4 w-4" />
                            Tambah Produk
                        </Link>
                    </AdminOnly>
                </div>

                {products.length === 0 ? (
                    <div className="py-12 text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                            <Package className="h-8 w-8 text-gray-400 dark:text-gray-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                            Belum ada produk
                        </h3>
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            Mulai tambahkan produk pertama Anda
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
                                            className="py-3 pl-4 font-medium text-gray-500 text-start text-xs uppercase tracking-wider dark:text-gray-400"
                                        >
                                            Produk
                                        </TableCell>
                                        <TableCell
                                            isHeader
                                            className="py-3 font-medium text-gray-500 text-start text-xs uppercase tracking-wider dark:text-gray-400"
                                        >
                                            Harga
                                        </TableCell>
                                        <TableCell
                                            isHeader
                                            className="hidden lg:table-cell py-3 font-medium text-gray-500 text-start text-xs uppercase tracking-wider dark:text-gray-400"
                                        >
                                            Deskripsi
                                        </TableCell>
                                        <AdminOnly>
                                            <TableCell
                                                isHeader
                                                className="py-3 pr-4 font-medium text-gray-500 text-end text-xs uppercase tracking-wider dark:text-gray-400"
                                            >
                                                Aksi
                                            </TableCell>
                                        </AdminOnly>
                                    </TableRow>
                                </TableHeader>

                                <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {products.map((product) => (
                                        <TableRow key={product.id} className="transition-colors hover:bg-gray-50/50 dark:hover:bg-white/[0.02]">
                                            <TableCell className="py-4 pl-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 border border-gray-200 dark:border-gray-700 dark:bg-gray-800">
                                                        {product.imageUrl ? (
                                                            <Image
                                                                width={40}
                                                                height={40}
                                                                src={product.imageUrl}
                                                                className="h-full w-full object-cover"
                                                                alt={product.name}
                                                            />
                                                        ) : (
                                                            <div className="flex h-full items-center justify-center">
                                                                <Package className="h-5 w-5 text-gray-400" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <Link
                                                            href={`/products/${product.id}`}
                                                            className="block font-medium text-gray-900 text-sm hover:text-blue-600 transition-colors dark:text-white/90 dark:hover:text-blue-400"
                                                        >
                                                            {product.name}
                                                        </Link>
                                                        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 lg:hidden line-clamp-1">
                                                            {product.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4 text-sm font-semibold text-gray-700 whitespace-nowrap dark:text-gray-300">
                                                {formatPrice(product.price)}
                                            </TableCell>
                                            <TableCell className="hidden lg:table-cell py-4 text-sm text-gray-500 dark:text-gray-400">
                                                <div className="max-w-md line-clamp-1">
                                                    {product.description}
                                                </div>
                                            </TableCell>
                                            <AdminOnly>
                                                <TableCell className="py-4 pr-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Link
                                                            href={`/products/${product.id}/edit`}
                                                            className="rounded-lg p-2 text-blue-600 transition-colors hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                                                            title="Edit produk"
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Link>
                                                        <button
                                                            onClick={() => setDeleteId(product.id)}
                                                            className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                                                            title="Hapus produk"
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

                        <div className="md:hidden space-y-3">
                            {products.map((product) => (
                                <div
                                    key={product.id}
                                    className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-3 transition-all hover:shadow-sm dark:border-gray-800 dark:bg-white/[0.02]"
                                >
                                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 border border-gray-200 dark:border-gray-700 dark:bg-gray-800">
                                        {product.imageUrl ? (
                                            <Image
                                                width={64}
                                                height={64}
                                                src={product.imageUrl}
                                                className="h-full w-full object-cover"
                                                alt={product.name}
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center">
                                                <Package className="h-6 w-6 text-gray-400" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex justify-between items-start">
                                            <Link
                                                href={`/products/${product.id}`}
                                                className="block font-medium text-gray-900 text-sm hover:text-blue-600 transition-colors dark:text-white/90 dark:hover:text-blue-400 line-clamp-1"
                                            >
                                                {product.name}
                                            </Link>
                                            <AdminOnly>
                                                <div className="flex gap-1 ml-2">
                                                    <Link
                                                        href={`/products/${product.id}/edit`}
                                                        className="p-1.5 text-blue-600 rounded-md hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                                                    >
                                                        <Pencil className="h-3.5 w-3.5" />
                                                    </Link>
                                                    <button
                                                        onClick={() => setDeleteId(product.id)}
                                                        className="p-1.5 text-red-600 rounded-md hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            </AdminOnly>
                                        </div>
                                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                            {formatPrice(product.price)}
                                        </p>
                                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                                            {product.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 flex flex-col gap-4 border-t border-gray-100 pt-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
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
    );
}
