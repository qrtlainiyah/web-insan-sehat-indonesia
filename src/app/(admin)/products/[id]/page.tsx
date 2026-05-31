"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil, Trash2, Package } from "lucide-react";
import Breadcrumb from "@/components/common/Breadcrumb";
import Loading from "@/components/common/Loading";

interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    imageUrl: string | null;
    createdAt: string;
    updatedAt: string;
}

export default function ProductDetailPage() {
    const router = useRouter();
    const params = useParams();
    const [product, setProduct] = useState<Product | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchProduct();
    }, []);

    const fetchProduct = async () => {
        try {
            const response = await fetch(`/api/products/${params.id}`);
            if (!response.ok) throw new Error("Produk tidak ditemukan");

            const data = await response.json();
            setProduct(data);
            document.title = `${data.name} - Insan Sehat Indonesia`;
        } catch (error: any) {
            setError(error.message || "Gagal memuat produk");
        } finally {
            setIsLoading(false);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(price);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    if (isLoading) {
        return <Loading />;
    }

    if (error || !product) {
        return (
            <div className="p-0 sm:p-6">
                <div className="rounded-none sm:rounded-2xl border-y sm:border border-red-200 bg-red-50 p-6 text-center dark:border-red-900/50 dark:bg-red-900/10">
                    <Package className="mx-auto h-16 w-16 text-red-400 dark:text-red-500 mb-4" />
                    <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">
                        Produk Tidak Ditemukan
                    </h3>
                    <p className="text-sm text-red-600 dark:text-red-400 mb-4">
                        {error || "Produk yang Anda cari tidak tersedia"}
                    </p>
                    <Link
                        href="/products"
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-all"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Kembali ke Produk
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="p-0 sm:p-6">
            <div className="px-4 sm:px-0">
                <Breadcrumb
                    items={[
                        { label: "Dashboard", href: "/" },
                        { label: "Produk", href: "/products" },
                        { label: product.name }
                    ]}
                />
            </div>

            <div className="mt-4 sm:mt-6">
                <div className="overflow-hidden rounded-none sm:rounded-2xl border-y sm:border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
                    <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-800">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                                    Detail Produk
                                </h1>
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    Informasi lengkap produk
                                </p>
                            </div>
                            <Link
                                href="/products"
                                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 hover:border-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                <span className="hidden sm:inline">Kembali</span>
                            </Link>
                        </div>
                    </div>

                    <div className="p-4 sm:p-6">
                        <div className="grid gap-6 lg:grid-cols-5">
                            <div className="lg:col-span-2">
                                <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/50">
                                    <div className="aspect-square w-full">
                                        {product.imageUrl ? (
                                            <img
                                                src={product.imageUrl}
                                                alt={product.name}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center">
                                                <Package className="h-20 w-20 text-gray-400 dark:text-gray-600" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="lg:col-span-3 space-y-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">
                                        {product.name}
                                    </h2>
                                    <p className="mt-2 text-3xl font-bold text-blue-600 dark:text-blue-400">
                                        {formatPrice(product.price)}
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                            Deskripsi
                                        </h3>
                                        <p className="mt-2 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                                            {product.description}
                                        </p>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2 pt-4 border-t border-gray-200 dark:border-gray-800">
                                        <div>
                                            <h3 className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                                Dibuat
                                            </h3>
                                            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                                                {formatDate(product.createdAt)}
                                            </p>
                                        </div>
                                        <div>
                                            <h3 className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                                Terakhir Diupdate
                                            </h3>
                                            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                                                {formatDate(product.updatedAt)}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-800">
                                    <Link
                                        href={`/products/${product.id}/edit`}
                                        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-blue-700"
                                    >
                                        <Pencil className="h-4 w-4" />
                                        Edit Produk
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
