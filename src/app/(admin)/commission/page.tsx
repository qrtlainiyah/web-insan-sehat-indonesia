"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Percent, TrendingUp, Users } from "lucide-react";
import Breadcrumb from "@/components/common/Breadcrumb";
import Loading from "@/components/common/Loading";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface CommissionData {
    userId: number;
    userName: string;
    userEmail: string;
    role: string;
    totalIncome: number;
    totalSessions: number;
    totalProductsSold: number;
    totalBonusProducts: number;
    totalVitamins: number;
    totalRO: number;
    totalReturns: number;
    moringaSold: number;
    uramaxSold: number;
    annoraSold: number;
    alamiSold: number;
    roMoringa: number;
    roUramax: number;
    roAnnora: number;
}

interface CalculatedCommissionResponse {
    month: number;
    year: number;
    schedulers: CommissionData[];
    presenters: CommissionData[];
    totals: {
        schedulerIncome: number;
        presenterIncome: number;
        totalIncome: number;
    };
    ledgerCount: number;
}

export default function CommissionPage() {
    const [data, setData] = useState<CalculatedCommissionResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

    useEffect(() => {
        document.title = "Komisi - Insan Sehat Indonesia";
        fetchCommissionData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentMonth, currentYear]);

    const fetchCommissionData = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`/api/commission/calculate?month=${currentMonth}&year=${currentYear}`);
            if (response.ok) {
                const result = await response.json();
                setData(result);
            }
        } catch (error) {
            console.error("Error fetching commission data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePreviousMonth = () => {
        if (currentMonth === 1) {
            setCurrentMonth(12);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };

    const handleNextMonth = () => {
        if (currentMonth === 12) {
            setCurrentMonth(1);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
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

    if (isLoading) {
        return <Loading />;
    }

    return (
        <div className="p-0 sm:p-6">
            <div className="px-4 sm:px-0">
                <Breadcrumb
                    items={[
                        { label: "Dashboard", href: "/" },
                        { label: "Komisi" }
                    ]}
                />
            </div>

            <div className="mt-4 sm:mt-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
                    <div>
                        <h1 className="text-xl font-bold text-gray-800 dark:text-white/90">
                            Pencapaian Bulanan
                        </h1>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Ringkasan komisi dari data entri harian
                        </p>
                    </div>
                </div>

                {/* Month Selector */}
                <div className="mb-6 flex items-center justify-between rounded-xl border border-gray-200 bg-white p-2 dark:border-gray-800 dark:bg-white/[0.03] shadow-sm">
                    <button
                        onClick={handlePreviousMonth}
                        className="rounded-lg p-2 text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <div className="flex items-center gap-2 px-4">
                        <span className="text-base font-semibold text-gray-800 dark:text-white">
                            {getMonthName(currentMonth)} {currentYear}
                        </span>
                    </div>
                    <button
                        onClick={handleNextMonth}
                        className="rounded-lg p-2 text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-blue-50 to-white p-6 shadow-sm dark:border-gray-800 dark:from-blue-900/10 dark:to-gray-900">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Komisi Penjadwal</p>
                                <h2 className="mt-2 text-2xl font-bold text-blue-600 dark:text-blue-400">
                                    {formatCurrency(data?.totals.schedulerIncome || 0)}
                                </h2>
                            </div>
                            <div className="rounded-full bg-blue-100 p-3 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                                <Users className="h-6 w-6" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-purple-50 to-white p-6 shadow-sm dark:border-gray-800 dark:from-purple-900/10 dark:to-gray-900">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Komisi Presenter</p>
                                <h2 className="mt-2 text-2xl font-bold text-purple-600 dark:text-purple-400">
                                    {formatCurrency(data?.totals.presenterIncome || 0)}
                                </h2>
                            </div>
                            <div className="rounded-full bg-purple-100 p-3 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400">
                                <TrendingUp className="h-6 w-6" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-green-50 to-white p-6 shadow-sm dark:border-gray-800 dark:from-green-900/10 dark:to-gray-900">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Komisi</p>
                                <h2 className="mt-2 text-2xl font-bold text-green-600 dark:text-green-400">
                                    {formatCurrency(data?.totals.totalIncome || 0)}
                                </h2>
                            </div>
                            <div className="rounded-full bg-green-100 p-3 text-green-600 dark:bg-green-900/20 dark:text-green-400">
                                <Percent className="h-6 w-6" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Penjadwal Table */}
                {data && data.schedulers.length > 0 && (
                    <div className="mb-6 overflow-hidden rounded-none sm:rounded-2xl border-y sm:border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
                            <h2 className="text-lg font-bold text-white">PENCAPAIAN PENJADWAL {getMonthName(currentMonth).toUpperCase()} {currentYear}</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <Table className="min-w-max">
                                <TableHeader className="border-gray-100 dark:border-gray-800 border-y bg-gray-50/50 dark:bg-gray-800/50">
                                    <TableRow>
                                        <TableCell isHeader className="py-3 pl-6 font-medium text-gray-500 text-center text-xs uppercase tracking-wider dark:text-gray-400 w-16">NO</TableCell>
                                        <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-xs uppercase tracking-wider dark:text-gray-400 min-w-[150px]">NAMA</TableCell>
                                        <TableCell isHeader className="py-3 font-medium text-gray-500 text-end text-xs uppercase tracking-wider dark:text-gray-400 min-w-[130px]">PENDAPATAN</TableCell>
                                        <TableCell isHeader className="py-3 font-medium text-gray-500 text-center text-xs uppercase tracking-wider dark:text-gray-400 w-24">JUMLAH SESI</TableCell>
                                        <TableCell isHeader className="py-3 font-medium text-gray-500 text-center text-xs uppercase tracking-wider dark:text-gray-400 w-24">JUMLAH MORINGA</TableCell>
                                        <TableCell isHeader className="py-3 font-medium text-gray-500 text-center text-xs uppercase tracking-wider dark:text-gray-400 w-24">JUMLAH URAMAX</TableCell>
                                        <TableCell isHeader className="py-3 font-medium text-gray-500 text-center text-xs uppercase tracking-wider dark:text-gray-400 w-24">JUMLAH ANNORA</TableCell>
                                        <TableCell isHeader className="py-3 font-medium text-gray-500 text-center text-xs uppercase tracking-wider dark:text-gray-400 w-24">RO MORINGA</TableCell>
                                        <TableCell isHeader className="py-3 font-medium text-gray-500 text-center text-xs uppercase tracking-wider dark:text-gray-400 w-24">RO URAMAX</TableCell>
                                        <TableCell isHeader className="py-3 font-medium text-gray-500 text-center text-xs uppercase tracking-wider dark:text-gray-400 w-24">RO ANNORA</TableCell>
                                        <TableCell isHeader className="py-3 font-medium text-gray-500 text-center text-xs uppercase tracking-wider dark:text-gray-400 w-32">BONUS VITAMIN</TableCell>
                                        <TableCell isHeader className="py-3 font-medium text-gray-500 text-center text-xs uppercase tracking-wider dark:text-gray-400 w-32">BONUS PRODUK</TableCell>
                                        <TableCell isHeader className="py-3 pr-6 font-medium text-gray-500 text-center text-xs uppercase tracking-wider dark:text-gray-400 w-24">RETUR</TableCell>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {data.schedulers.map((scheduler, index) => (
                                        <TableRow key={scheduler.userId} className="transition-colors hover:bg-gray-50/50 dark:hover:bg-white/[0.02]">
                                            <TableCell className="py-4 pl-6 text-sm text-center text-gray-600 dark:text-gray-400">{index + 1}</TableCell>
                                            <TableCell className="py-4 text-sm font-medium text-gray-800 dark:text-white/90">{scheduler.userName}</TableCell>
                                            <TableCell className="py-4 text-end text-sm font-bold text-blue-600 dark:text-blue-400">{formatCurrency(scheduler.totalIncome)}</TableCell>
                                            <TableCell className="py-4 text-center text-sm text-gray-600 dark:text-gray-400">{scheduler.totalSessions}</TableCell>
                                            <TableCell className="py-4 text-center text-sm text-gray-600 dark:text-gray-400">{scheduler.moringaSold}</TableCell>
                                            <TableCell className="py-4 text-center text-sm text-gray-600 dark:text-gray-400">{scheduler.uramaxSold}</TableCell>
                                            <TableCell className="py-4 text-center text-sm text-gray-600 dark:text-gray-400">{scheduler.annoraSold}</TableCell>
                                            <TableCell className="py-4 text-center text-sm text-gray-600 dark:text-gray-400">{scheduler.roMoringa}</TableCell>
                                            <TableCell className="py-4 text-center text-sm text-gray-600 dark:text-gray-400">{scheduler.roUramax}</TableCell>
                                            <TableCell className="py-4 text-center text-sm text-gray-600 dark:text-gray-400">{scheduler.roAnnora}</TableCell>
                                            <TableCell className="py-4 text-center text-sm text-green-600 dark:text-green-400">{scheduler.totalVitamins}</TableCell>
                                            <TableCell className="py-4 text-center text-sm text-green-600 dark:text-green-400">{scheduler.totalBonusProducts}</TableCell>
                                            <TableCell className="py-4 pr-6 text-center text-sm text-red-600 dark:text-red-400">{scheduler.totalReturns}</TableCell>
                                        </TableRow>
                                    ))}
                                    {/* Total Row */}
                                    <TableRow className="bg-blue-50/70 dark:bg-blue-900/20 font-bold border-t-2 border-blue-200 dark:border-blue-800">
                                        <TableCell className="py-3 pl-6 text-sm text-blue-900 dark:text-blue-200" colSpan={2}>TOTAL</TableCell>
                                        <TableCell className="py-3 text-end text-sm text-blue-900 dark:text-blue-200">
                                            {formatCurrency(data.schedulers.reduce((sum, s) => sum + s.totalIncome, 0))}
                                        </TableCell>
                                        <TableCell className="py-3 text-center text-sm text-blue-900 dark:text-blue-200">
                                            {data.schedulers.reduce((sum, s) => sum + s.totalSessions, 0)}
                                        </TableCell>
                                        <TableCell className="py-3 text-center text-sm text-blue-900 dark:text-blue-200">
                                            {data.schedulers.reduce((sum, s) => sum + s.moringaSold, 0)}
                                        </TableCell>
                                        <TableCell className="py-3 text-center text-sm text-blue-900 dark:text-blue-200">
                                            {data.schedulers.reduce((sum, s) => sum + s.uramaxSold, 0)}
                                        </TableCell>
                                        <TableCell className="py-3 text-center text-sm text-blue-900 dark:text-blue-200">
                                            {data.schedulers.reduce((sum, s) => sum + s.annoraSold, 0)}
                                        </TableCell>
                                        <TableCell className="py-3 text-center text-sm text-blue-900 dark:text-blue-200">
                                            {data.schedulers.reduce((sum, s) => sum + s.roMoringa, 0)}
                                        </TableCell>
                                        <TableCell className="py-3 text-center text-sm text-blue-900 dark:text-blue-200">
                                            {data.schedulers.reduce((sum, s) => sum + s.roUramax, 0)}
                                        </TableCell>
                                        <TableCell className="py-3 text-center text-sm text-blue-900 dark:text-blue-200">
                                            {data.schedulers.reduce((sum, s) => sum + s.roAnnora, 0)}
                                        </TableCell>
                                        <TableCell className="py-3 text-center text-sm text-blue-900 dark:text-blue-200">
                                            {data.schedulers.reduce((sum, s) => sum + s.totalVitamins, 0)}
                                        </TableCell>
                                        <TableCell className="py-3 text-center text-sm text-blue-900 dark:text-blue-200">
                                            {data.schedulers.reduce((sum, s) => sum + s.totalBonusProducts, 0)}
                                        </TableCell>
                                        <TableCell className="py-3 pr-6 text-center text-sm text-blue-900 dark:text-blue-200">
                                            {data.schedulers.reduce((sum, s) => sum + s.totalReturns, 0)}
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                )}

                {/* Presenter Table */}
                {data && data.presenters.length > 0 && (
                    <div className="overflow-hidden rounded-none sm:rounded-2xl border-y sm:border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
                        <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4">
                            <h2 className="text-lg font-bold text-white">PENCAPAIAN PRESENTER {getMonthName(currentMonth).toUpperCase()} {currentYear}</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <Table className="min-w-max">
                                <TableHeader className="border-gray-100 dark:border-gray-800 border-y bg-gray-50/50 dark:bg-gray-800/50">
                                    <TableRow>
                                        <TableCell isHeader className="py-3 pl-6 font-medium text-gray-500 text-center text-xs uppercase tracking-wider dark:text-gray-400 w-16">NO</TableCell>
                                        <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-xs uppercase tracking-wider dark:text-gray-400 min-w-[150px]">NAMA</TableCell>
                                        <TableCell isHeader className="py-3 font-medium text-gray-500 text-end text-xs uppercase tracking-wider dark:text-gray-400 min-w-[130px]">PENDAPATAN</TableCell>
                                        <TableCell isHeader className="py-3 font-medium text-gray-500 text-center text-xs uppercase tracking-wider dark:text-gray-400 w-24">JUMLAH SESI</TableCell>
                                        <TableCell isHeader className="py-3 font-medium text-gray-500 text-center text-xs uppercase tracking-wider dark:text-gray-400 w-24">JUMLAH MORINGA</TableCell>
                                        <TableCell isHeader className="py-3 font-medium text-gray-500 text-center text-xs uppercase tracking-wider dark:text-gray-400 w-24">JUMLAH URAMAX</TableCell>
                                        <TableCell isHeader className="py-3 font-medium text-gray-500 text-center text-xs uppercase tracking-wider dark:text-gray-400 w-24">JUMLAH ANNORA</TableCell>
                                        <TableCell isHeader className="py-3 font-medium text-gray-500 text-center text-xs uppercase tracking-wider dark:text-gray-400 w-24">RO MORINGA</TableCell>
                                        <TableCell isHeader className="py-3 font-medium text-gray-500 text-center text-xs uppercase tracking-wider dark:text-gray-400 w-24">RO URAMAX</TableCell>
                                        <TableCell isHeader className="py-3 font-medium text-gray-500 text-center text-xs uppercase tracking-wider dark:text-gray-400 w-24">RO ANNORA</TableCell>
                                        <TableCell isHeader className="py-3 font-medium text-gray-500 text-center text-xs uppercase tracking-wider dark:text-gray-400 w-32">BONUS VITAMIN</TableCell>
                                        <TableCell isHeader className="py-3 font-medium text-gray-500 text-center text-xs uppercase tracking-wider dark:text-gray-400 w-32">BONUS PRODUK</TableCell>
                                        <TableCell isHeader className="py-3 pr-6 font-medium text-gray-500 text-center text-xs uppercase tracking-wider dark:text-gray-400 w-24">RETUR</TableCell>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {data.presenters.map((presenter, index) => (
                                        <TableRow key={presenter.userId} className="transition-colors hover:bg-gray-50/50 dark:hover:bg-white/[0.02]">
                                            <TableCell className="py-4 pl-6 text-sm text-center text-gray-600 dark:text-gray-400">{index + 1}</TableCell>
                                            <TableCell className="py-4 text-sm font-medium text-gray-800 dark:text-white/90">{presenter.userName}</TableCell>
                                            <TableCell className="py-4 text-end text-sm font-bold text-purple-600 dark:text-purple-400">{formatCurrency(presenter.totalIncome)}</TableCell>
                                            <TableCell className="py-4 text-center text-sm text-gray-600 dark:text-gray-400">{presenter.totalSessions}</TableCell>
                                            <TableCell className="py-4 text-center text-sm text-gray-600 dark:text-gray-400">{presenter.moringaSold}</TableCell>
                                            <TableCell className="py-4 text-center text-sm text-gray-600 dark:text-gray-400">{presenter.uramaxSold}</TableCell>
                                            <TableCell className="py-4 text-center text-sm text-gray-600 dark:text-gray-400">{presenter.annoraSold}</TableCell>
                                            <TableCell className="py-4 text-center text-sm text-gray-600 dark:text-gray-400">{presenter.roMoringa}</TableCell>
                                            <TableCell className="py-4 text-center text-sm text-gray-600 dark:text-gray-400">{presenter.roUramax}</TableCell>
                                            <TableCell className="py-4 text-center text-sm text-gray-600 dark:text-gray-400">{presenter.roAnnora}</TableCell>
                                            <TableCell className="py-4 text-center text-sm text-green-600 dark:text-green-400">{presenter.totalVitamins}</TableCell>
                                            <TableCell className="py-4 text-center text-sm text-green-600 dark:text-green-400">{presenter.totalBonusProducts}</TableCell>
                                            <TableCell className="py-4 pr-6 text-center text-sm text-red-600 dark:text-red-400">{presenter.totalReturns}</TableCell>
                                        </TableRow>
                                    ))}
                                    {/* Total Row */}
                                    <TableRow className="bg-purple-50/70 dark:bg-purple-900/20 font-bold border-t-2 border-purple-200 dark:border-purple-800">
                                        <TableCell className="py-3 pl-6 text-sm text-purple-900 dark:text-purple-200" colSpan={2}>TOTAL</TableCell>
                                        <TableCell className="py-3 text-end text-sm text-purple-900 dark:text-purple-200">
                                            {formatCurrency(data.presenters.reduce((sum, p) => sum + p.totalIncome, 0))}
                                        </TableCell>
                                        <TableCell className="py-3 text-center text-sm text-purple-900 dark:text-purple-200">
                                            {data.presenters.reduce((sum, p) => sum + p.totalSessions, 0)}
                                        </TableCell>
                                        <TableCell className="py-3 text-center text-sm text-purple-900 dark:text-purple-200">
                                            {data.presenters.reduce((sum, p) => sum + p.moringaSold, 0)}
                                        </TableCell>
                                        <TableCell className="py-3 text-center text-sm text-purple-900 dark:text-purple-200">
                                            {data.presenters.reduce((sum, p) => sum + p.uramaxSold, 0)}
                                        </TableCell>
                                        <TableCell className="py-3 text-center text-sm text-purple-900 dark:text-purple-200">
                                            {data.presenters.reduce((sum, p) => sum + p.annoraSold, 0)}
                                        </TableCell>
                                        <TableCell className="py-3 text-center text-sm text-purple-900 dark:text-purple-200">
                                            {data.presenters.reduce((sum, p) => sum + p.roMoringa, 0)}
                                        </TableCell>
                                        <TableCell className="py-3 text-center text-sm text-purple-900 dark:text-purple-200">
                                            {data.presenters.reduce((sum, p) => sum + p.roUramax, 0)}
                                        </TableCell>
                                        <TableCell className="py-3 text-center text-sm text-purple-900 dark:text-purple-200">
                                            {data.presenters.reduce((sum, p) => sum + p.roAnnora, 0)}
                                        </TableCell>
                                        <TableCell className="py-3 text-center text-sm text-purple-900 dark:text-purple-200">
                                            {data.presenters.reduce((sum, p) => sum + p.totalVitamins, 0)}
                                        </TableCell>
                                        <TableCell className="py-3 text-center text-sm text-purple-900 dark:text-purple-200">
                                            {data.presenters.reduce((sum, p) => sum + p.totalBonusProducts, 0)}
                                        </TableCell>
                                        <TableCell className="py-3 pr-6 text-center text-sm text-purple-900 dark:text-purple-200">
                                            {data.presenters.reduce((sum, p) => sum + p.totalReturns, 0)}
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {data && data.schedulers.length === 0 && data.presenters.length === 0 && (
                    <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center dark:border-gray-800 dark:bg-white/[0.03]">
                        <Percent className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-600" />
                        <h3 className="mt-4 text-lg font-semibold text-gray-800 dark:text-white/90">
                            Belum ada data pencapaian
                        </h3>
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            Tambahkan entri harian untuk melihat ringkasan komisi
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
