"use client";

import { useEffect, useState } from "react";
import { Book, ChevronLeft, ChevronRight, TrendingUp, Users, Calendar } from "lucide-react";
import Breadcrumb from "@/components/common/Breadcrumb";
import Loading from "@/components/common/Loading";
import Link from "next/link";

interface MonthData {
    month: number;
    year: number;
    totalAmount: number;
    entryCount: number;
    userCount: number;
}

interface MonthlyData {
    year: number;
    months: MonthData[];
}

export default function MonthlyLedgerPage() {
    const [data, setData] = useState<MonthlyData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

    useEffect(() => {
        document.title = "Ringkasan Bulanan - Insan Sehat Indonesia";
        fetchMonthlyData();
    }, [currentYear]);

    const fetchMonthlyData = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`/api/ledger/monthly?year=${currentYear}`);
            if (response.ok) {
                const fetchedData = await response.json();
                setData(fetchedData);
            }
        } catch (error) {
            console.error("Error fetching monthly data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const getMonthName = (month: number) => {
        const months = [
            "Januari", "Februari", "Maret", "April", "Mei", "Juni",
            "Juli", "Agustus", "September", "Oktober", "November", "Desember"
        ];
        return months[month - 1];
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const totalYearlyAmount = data?.months.reduce((sum, month) => sum + month.totalAmount, 0) || 0;
    const totalYearlyEntries = data?.months.reduce((sum, month) => sum + month.entryCount, 0) || 0;

    if (isLoading) {
        return <Loading />;
    }

    return (
        <div className="p-0 sm:p-6">
            <div className="px-4 sm:px-0">
                <Breadcrumb
                    items={[
                        { label: "Dashboard", href: "/" },
                        { label: "Buku Besar", href: "/ledger" },
                        { label: "Ringkasan Bulanan" }
                    ]}
                />
            </div>

            <div className="mt-4 sm:mt-6 px-4 sm:px-0">
                <div className="mb-6">
                    <h1 className="text-xl font-bold text-gray-800 dark:text-white/90">
                        Ringkasan Bulanan
                    </h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Overview penghasilan per bulan tahun {currentYear}
                    </p>
                </div>

                {/* Year Navigator */}
                <div className="mb-6 flex items-center justify-between rounded-xl border border-gray-200 bg-white p-2 dark:border-gray-800 dark:bg-white/[0.03] shadow-sm">
                    <button
                        onClick={() => setCurrentYear(currentYear - 1)}
                        className="rounded-lg p-2 text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <div className="flex items-center gap-2 px-4">
                        <span className="text-base font-semibold text-gray-800 dark:text-white">
                            Tahun {currentYear}
                        </span>
                    </div>
                    <button
                        onClick={() => setCurrentYear(currentYear + 1)}
                        className="rounded-lg p-2 text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>

                {/* Yearly Summary */}
                <div className="mb-6 grid gap-4 sm:grid-cols-2">
                    <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-green-50 to-white p-6 shadow-sm dark:border-gray-800 dark:from-green-900/10 dark:to-gray-900">
                        <div className="relative z-10 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tahunan</p>
                                <p className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">
                                    {formatCurrency(totalYearlyAmount)}
                                </p>
                            </div>
                            <div className="rounded-full bg-green-100 p-3 text-green-600 dark:bg-green-900/20 dark:text-green-400">
                                <TrendingUp className="h-8 w-8" />
                            </div>
                        </div>
                    </div>
                    <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-blue-50 to-white p-6 shadow-sm dark:border-gray-800 dark:from-blue-900/10 dark:to-gray-900">
                        <div className="relative z-10 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Entri</p>
                                <p className="mt-2 text-3xl font-bold text-blue-600 dark:text-blue-400">
                                    {totalYearlyEntries}
                                </p>
                            </div>
                            <div className="rounded-full bg-blue-100 p-3 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                                <Book className="h-8 w-8" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {data?.months.map((monthData) => (
                        <Link
                            key={monthData.month}
                            href={`/ledger?month=${monthData.month}&year=${monthData.year}`}
                            className="group relative flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-5 transition-all hover:-translate-y-1 hover:border-blue-500 hover:shadow-lg dark:border-gray-800 dark:bg-white/[0.03] dark:hover:border-blue-500"
                        >
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                                    {getMonthName(monthData.month)}
                                </h3>
                                <div className="rounded-lg bg-gray-50 p-2 text-gray-400 transition-colors group-hover:bg-blue-50 group-hover:text-blue-600 dark:bg-gray-800 dark:group-hover:bg-blue-900/20 dark:group-hover:text-blue-400">
                                    <Calendar className="h-4 w-4" />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Penghasilan</p>
                                    <p className="mt-1 text-xl font-bold text-green-600 dark:text-green-400">
                                        {formatCurrency(monthData.totalAmount)}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between border-t border-gray-100 pt-3 dark:border-gray-800">
                                    <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                                        <Book className="h-3.5 w-3.5" />
                                        <span>{monthData.entryCount} Entri</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                                        <Users className="h-3.5 w-3.5" />
                                        <span>{monthData.userCount} Orang</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
