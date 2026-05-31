"use client";

import { useEffect, useState } from "react";
import { DollarSign, Plus, Pencil, Trash2, X, ArrowDownCircle, ArrowUpCircle, Filter, TrendingUp, TrendingDown, Calendar } from "lucide-react";
import Breadcrumb from "@/components/common/Breadcrumb";
import Loading from "@/components/common/Loading";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface CashFlow {
    id: number;
    type: string;
    amount: number;
    description: string;
    balance: number;
    date: Date;
}

export default function CashFlowPage() {
    const [cashFlows, setCashFlows] = useState<CashFlow[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [selectedType, setSelectedType] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [editingId, setEditingId] = useState<number | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const [formData, setFormData] = useState({
        type: "IN",
        amount: "",
        displayAmount: "",
        description: "",
        date: new Date().toISOString().split('T')[0],
    });

    useEffect(() => {
        document.title = "Arus Kas - Insan Sehat Indonesia";
        fetchCashFlows();
    }, []);

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

    const fetchCashFlows = async (typeFilter?: string, start?: string, end?: string) => {
        try {
            setIsLoading(true);
            let url = "/api/cashflow?";
            if (typeFilter) url += `type=${typeFilter}&`;
            if (start) url += `startDate=${start}&`;
            if (end) url += `endDate=${end}&`;

            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                setCashFlows(data);
            }
        } catch (error) {
            console.error("Error fetching cash flows:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatRupiah = (value: string) => {
        const number = value.replace(/[^\d]/g, "");
        if (!number) return "";
        return new Intl.NumberFormat("id-ID").format(parseInt(number));
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^\d]/g, "");
        setFormData({
            ...formData,
            amount: value,
            displayAmount: formatRupiah(value),
        });
    };

    const handleFilter = () => {
        fetchCashFlows(selectedType, startDate, endDate);
    };

    const handleQuickFilter = (days: number) => {
        const today = new Date();
        const start = new Date(today);
        start.setDate(today.getDate() - days);

        const startStr = start.toISOString().split('T')[0];
        const endStr = today.toISOString().split('T')[0];

        setStartDate(startStr);
        setEndDate(endStr);
        fetchCashFlows(selectedType, startStr, endStr);
    };

    const handleResetFilter = () => {
        setSelectedType("");
        setStartDate("");
        setEndDate("");
        fetchCashFlows();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = editingId ? `/api/cashflow/${editingId}` : "/api/cashflow";
            const method = editingId ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: formData.type,
                    amount: parseFloat(formData.amount),
                    description: formData.description,
                    date: formData.date,
                }),
            });

            if (response.ok) {
                await fetchCashFlows(selectedType, startDate, endDate);
                handleCancel();
            }
        } catch (error) {
            console.error("Error saving cash flow:", error);
        }
    };

    const handleEdit = (cashFlow: CashFlow) => {
        setEditingId(cashFlow.id);
        setFormData({
            type: cashFlow.type,
            amount: cashFlow.amount.toString(),
            displayAmount: formatRupiah(cashFlow.amount.toString()),
            description: cashFlow.description,
            date: new Date(cashFlow.date).toISOString().split('T')[0],
        });
        setShowForm(true);
    };

    const handleDelete = async (id: number) => {
        try {
            const response = await fetch(`/api/cashflow/${id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                await fetchCashFlows(selectedType, startDate, endDate);
                setDeleteId(null);
            }
        } catch (error) {
            console.error("Error deleting cash flow:", error);
        }
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingId(null);
        setFormData({
            type: "IN",
            amount: "",
            displayAmount: "",
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

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const currentBalance = cashFlows.length > 0 ? cashFlows[cashFlows.length - 1].balance : 0;

    if (isLoading) {
        return <Loading />;
    }

    return (
        <div className="p-0 sm:p-6">
            <div className="px-4 sm:px-0">
                <Breadcrumb
                    items={[
                        { label: "Dashboard", href: "/" },
                        { label: "Arus Kas" }
                    ]}
                />
            </div>

            <div className="mt-4 sm:mt-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
                    <div>
                        <h1 className="text-xl font-bold text-gray-800 dark:text-white/90">
                            Arus Kas
                        </h1>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Kelola pemasukan dan pengeluaran keuangan
                        </p>
                    </div>
                    <button
                        onClick={() => setShowForm(true)}
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-blue-700"
                    >
                        <Plus className="h-4 w-4" />
                        <span className="hidden sm:inline">Tambah Transaksi</span>
                        <span className="sm:hidden">Tambah</span>
                    </button>
                </div>

                {/* Balance Card */}
                <div className="mb-6 rounded-2xl border border-gray-200 bg-gradient-to-br from-blue-50 to-white p-6 dark:border-gray-800 dark:from-gray-800 dark:to-gray-900 shadow-sm relative overflow-hidden">
                    <div className="absolute right-0 top-0 h-32 w-32 translate-x-10 translate-y-[-20%] opacity-10">
                        <DollarSign className="h-32 w-32 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="relative z-10 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Saldo Saat Ini</p>
                            <h2 className={`mt-2 text-3xl font-bold ${currentBalance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                {formatCurrency(currentBalance)}
                            </h2>
                        </div>
                        <div className={`rounded-full p-3 ${currentBalance >= 0 ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'}`}>
                            {currentBalance >= 0 ? (
                                <TrendingUp className="h-8 w-8" />
                            ) : (
                                <TrendingDown className="h-8 w-8" />
                            )}
                        </div>
                    </div>
                </div>

                <div className="overflow-hidden rounded-none sm:rounded-2xl border-y sm:border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
                    <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-800">
                        <div className="flex items-center gap-2 mb-4">
                            <Filter className="h-4 w-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter Data</span>
                        </div>

                        {/* Filters */}
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <select
                                value={selectedType}
                                onChange={(e) => setSelectedType(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                            >
                                <option value="">Semua Tipe</option>
                                <option value="IN">Pemasukan</option>
                                <option value="OUT">Pengeluaran</option>
                            </select>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                            />
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                            />
                            <button
                                onClick={handleFilter}
                                className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-blue-700"
                            >
                                Terapkan Filter
                            </button>
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
                            {(selectedType || startDate || endDate) && (
                                <button
                                    onClick={handleResetFilter}
                                    className="ml-auto text-xs font-medium text-red-600 hover:text-red-700 dark:text-red-400"
                                >
                                    Reset Filter
                                </button>
                            )}
                        </div>
                    </div>

                    {cashFlows.length === 0 ? (
                        <div className="py-12 text-center">
                            <DollarSign className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-600" />
                            <h3 className="mt-4 text-lg font-semibold text-gray-800 dark:text-white/90">
                                Belum ada transaksi
                            </h3>
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                Mulai catat transaksi pemasukan dan pengeluaran
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Desktop View - Table */}
                            <div className="hidden md:block overflow-x-auto">
                                <Table>
                                    <TableHeader className="border-gray-100 dark:border-gray-800 border-y bg-gray-50/50 dark:bg-gray-800/50">
                                        <TableRow>
                                            <TableCell
                                                isHeader
                                                className="py-4 px-6 font-medium text-gray-500 text-start text-xs uppercase tracking-wider dark:text-gray-400 w-[140px]"
                                            >
                                                TANGGAL
                                            </TableCell>
                                            <TableCell
                                                isHeader
                                                className="py-4 px-4 font-medium text-gray-500 text-start text-xs uppercase tracking-wider dark:text-gray-400 w-[350px]"
                                            >
                                                KETERANGAN
                                            </TableCell>
                                            <TableCell
                                                isHeader
                                                className="py-4 px-4 font-medium text-gray-500 text-end text-xs uppercase tracking-wider dark:text-gray-400 w-[180px]"
                                            >
                                                MASUK
                                            </TableCell>
                                            <TableCell
                                                isHeader
                                                className="py-4 px-4 font-medium text-gray-500 text-end text-xs uppercase tracking-wider dark:text-gray-400 w-[180px]"
                                            >
                                                KELUAR
                                            </TableCell>
                                            <TableCell
                                                isHeader
                                                className="py-4 px-4 font-semibold text-gray-600 text-end text-xs uppercase tracking-wider dark:text-gray-300 w-[200px]"
                                            >
                                                SALDO
                                            </TableCell>
                                            <TableCell
                                                isHeader
                                                className="py-4 px-6 font-medium text-gray-500 text-end text-xs uppercase tracking-wider dark:text-gray-400 w-[120px]"
                                            >
                                                AKSI
                                            </TableCell>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                                        {cashFlows.map((cashFlow) => (
                                            <TableRow key={cashFlow.id} className="transition-colors hover:bg-gray-50/50 dark:hover:bg-white/[0.02]">
                                                <TableCell className="py-5 px-6 text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    <div className="flex items-center gap-2">
                                                        {formatDate(cashFlow.date)}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-5 px-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${cashFlow.type === "IN" ? "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400" : "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400"}`}>
                                                            {cashFlow.type === "IN" ? <ArrowDownCircle className="h-4 w-4" /> : <ArrowUpCircle className="h-4 w-4" />}
                                                        </div>
                                                        <span className="font-medium text-gray-800 dark:text-white/90">
                                                            {cashFlow.description}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-5 px-4 text-end">
                                                    {cashFlow.type === "IN" ? (
                                                        <span className="text-base font-bold text-green-600 dark:text-green-400">
                                                            {formatCurrency(cashFlow.amount)}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400">-</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="py-5 px-4 text-end">
                                                    {cashFlow.type === "OUT" ? (
                                                        <span className="text-base font-bold text-red-600 dark:text-red-400">
                                                            {formatCurrency(cashFlow.amount)}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400">-</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="py-5 px-4 text-end">
                                                    <span className={`text-base font-bold ${cashFlow.balance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`}>
                                                        {formatCurrency(cashFlow.balance)}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="py-5 px-6 text-end">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => handleEdit(cashFlow)}
                                                            className="rounded-lg p-2 text-blue-600 transition-colors hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteId(cashFlow.id)}
                                                            className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            <div className="md:hidden p-4 space-y-3">
                                {cashFlows.map((cashFlow) => (
                                    <div
                                        key={cashFlow.id}
                                        className="rounded-xl border border-gray-200 bg-white p-4 transition-all hover:shadow-md dark:border-gray-800 dark:bg-white/[0.02] dark:hover:bg-white/[0.04]"
                                    >
                                        <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-3 dark:border-gray-800">
                                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                                {formatDate(cashFlow.date)}
                                            </div>
                                            {cashFlow.type === "IN" ? (
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

                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-start justify-between">
                                                <span className="font-medium text-gray-800 dark:text-white/90">
                                                    {cashFlow.description}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-500 dark:text-gray-400">Jumlah</span>
                                                <span className={`font-bold ${cashFlow.type === "IN" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                                                    {cashFlow.type === "IN" ? "+" : "-"}{formatCurrency(cashFlow.amount)}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-100 dark:border-gray-800/50">
                                                <span className="text-gray-500 dark:text-gray-400">Saldo Akhir</span>
                                                <span className={`font-bold ${cashFlow.balance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`}>
                                                    {formatCurrency(cashFlow.balance)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mt-4 flex justify-end gap-2 border-t border-gray-100 pt-3 dark:border-gray-800">
                                            <button
                                                onClick={() => handleEdit(cashFlow)}
                                                className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 transition-colors hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
                                            >
                                                <Pencil className="h-3.5 w-3.5" />
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => setDeleteId(cashFlow.id)}
                                                className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 transition-colors hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                                Hapus
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
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
                                    Tipe *
                                </label>
                                <div className="flex gap-4">
                                    <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 p-3 flex-1 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 transition-colors">
                                        <input
                                            type="radio"
                                            value="IN"
                                            checked={formData.type === "IN"}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            className="h-4 w-4 text-blue-600"
                                        />
                                        <span className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                            <ArrowDownCircle className="h-4 w-4 text-green-600" />
                                            Pemasukan
                                        </span>
                                    </label>
                                    <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 p-3 flex-1 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 transition-colors">
                                        <input
                                            type="radio"
                                            value="OUT"
                                            checked={formData.type === "OUT"}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            className="h-4 w-4 text-blue-600"
                                        />
                                        <span className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                            <ArrowUpCircle className="h-4 w-4 text-red-600" />
                                            Pengeluaran
                                        </span>
                                    </label>
                                </div>
                            </div>
                            <div>
                                <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                    Jumlah *
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-3 text-gray-500 dark:text-gray-400 font-medium">Rp</span>
                                    <input
                                        type="text"
                                        required
                                        value={formData.displayAmount}
                                        onChange={handleAmountChange}
                                        className="w-full rounded-lg border border-gray-300 bg-white pl-12 pr-4 py-2.5 text-gray-800 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                        placeholder="0"
                                    />
                                </div>
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
                                    Keterangan *
                                </label>
                                <textarea
                                    required
                                    rows={3}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-800 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                    placeholder="Deskripsi transaksi"
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
            {deleteId && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="relative w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900">
                        <h3 className="mb-2 text-lg font-bold text-gray-800 dark:text-white">
                            Hapus Transaksi?
                        </h3>
                        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
                            Saldo akan diperbarui setelah transaksi dihapus.
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
