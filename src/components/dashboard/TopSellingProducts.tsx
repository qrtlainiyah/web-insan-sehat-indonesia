"use client";

import { useEffect, useState } from "react";
import { Package, TrendingUp } from "lucide-react";

interface Product {
    name: string;
    quantity: number;
    percentage: number;
}

interface TopProductsData {
    period: string;
    total: number;
    products: Product[];
}

export default function TopSellingProducts() {
    const [data, setData] = useState<TopProductsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [period, setPeriod] = useState<"month" | "year">("month");

    useEffect(() => {
        fetchData();
    }, [period]);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`/api/dashboard/products?period=${period}`);
            const result = await response.json();
            setData(result);
        } catch (error) {
            console.error("Error fetching top products:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const getProductColor = (index: number) => {
        const colors = [
            "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
            "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
            "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400",
            "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400",
            "bg-pink-100 text-pink-700 dark:bg-pink-900/20 dark:text-pink-400"
        ];
        return colors[index] || colors[0];
    };

    if (isLoading || !data) {
        return (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                <div className="animate-pulse">
                    <div className="h-6 w-48 bg-gray-200 rounded dark:bg-gray-700 mb-6"></div>
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-16 bg-gray-200 rounded dark:bg-gray-700"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Produk Terlaris
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Total terjual: {data.total} unit
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setPeriod("month")}
                        className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${period === "month"
                                ? "bg-blue-600 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                            }`}
                    >
                        Bulan Ini
                    </button>
                    <button
                        onClick={() => setPeriod("year")}
                        className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${period === "year"
                                ? "bg-blue-600 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                            }`}
                    >
                        Tahun Ini
                    </button>
                </div>
            </div>

            {data.total === 0 ? (
                <div className="py-12 text-center">
                    <Package className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
                    <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                        Belum ada data penjualan produk
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {data.products.map((product, index) => (
                        <div
                            key={product.name}
                            className="flex items-center gap-4 rounded-xl border border-gray-200 p-4 transition-all hover:shadow-md dark:border-gray-800 dark:hover:bg-white/[0.02]"
                        >
                            <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${getProductColor(index)}`}>
                                <span className="text-xl font-bold">#{index + 1}</span>
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <h4 className="font-semibold text-gray-900 dark:text-white">
                                        {product.name}
                                    </h4>
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {product.quantity} unit
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                                        <div
                                            className="h-full rounded-full bg-blue-600 transition-all duration-500"
                                            style={{ width: `${product.percentage}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 w-10 text-right">
                                        {product.percentage}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
