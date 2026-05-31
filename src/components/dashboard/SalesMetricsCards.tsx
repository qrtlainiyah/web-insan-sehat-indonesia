"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Package, Calendar, BarChart3 } from "lucide-react";

interface SalesMetric {
    current: {
        value: number;
        count: number;
        period: string;
    };
    previous: {
        value: number;
        count: number;
        period: string;
    };
    trend: number;
}

export default function SalesMetricsCards() {
    const [dailyMetrics, setDailyMetrics] = useState<SalesMetric | null>(null);
    const [monthlyMetrics, setMonthlyMetrics] = useState<SalesMetric | null>(null);
    const [yearlyMetrics, setYearlyMetrics] = useState<SalesMetric | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchMetrics();
    }, []);

    const fetchMetrics = async () => {
        try {
            setIsLoading(true);
            const [daily, monthly, yearly] = await Promise.all([
                fetch("/api/dashboard/sales?period=day").then(r => r.json()),
                fetch("/api/dashboard/sales?period=month").then(r => r.json()),
                fetch("/api/dashboard/sales?period=year").then(r => r.json())
            ]);

            setDailyMetrics(daily);
            setMonthlyMetrics(monthly);
            setYearlyMetrics(yearly);
        } catch (error) {
            console.error("Error fetching metrics:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatNumber = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    const MetricCard = ({
        title,
        icon: Icon,
        metric,
        color
    }: {
        title: string;
        icon: any;
        metric: SalesMetric | null;
        color: string;
    }) => {
        if (isLoading || !metric) {
            return (
                <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                    <div className="animate-pulse">
                        <div className="h-4 w-32 bg-gray-200 rounded dark:bg-gray-700 mb-4"></div>
                        <div className="h-8 w-48 bg-gray-200 rounded dark:bg-gray-700"></div>
                    </div>
                </div>
            );
        }

        const isPositive = metric.trend >= 0;

        return (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${color}`}>
                            <Icon className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                {title}
                            </p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {formatNumber(metric.current.value)}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                produk terjual
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {isPositive ? (
                            <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                        ) : (
                            <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                        )}
                        <span className={`text-sm font-medium ${isPositive
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                            }`}>
                            {isPositive ? "+" : ""}{metric.trend.toFixed(1)}%
                        </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        {metric.current.count} entri
                    </p>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        vs {metric.previous.period}: {formatNumber(metric.previous.value)} produk
                    </p>
                </div>
            </div>
        );
    };

    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <MetricCard
                title="Produk Terjual Hari Ini"
                icon={Package}
                metric={dailyMetrics}
                color="bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
            />
            <MetricCard
                title="Produk Terjual Bulan Ini"
                icon={Calendar}
                metric={monthlyMetrics}
                color="bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400"
            />
            <MetricCard
                title="Produk Terjual Tahun Ini"
                icon={BarChart3}
                metric={yearlyMetrics}
                color="bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400"
            />
        </div>
    );
}
