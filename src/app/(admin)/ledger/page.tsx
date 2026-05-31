"use client";

import { useEffect, useState, useMemo } from "react";
import { Book, Plus, Pencil, Trash2, X, Users, TrendingUp, AlertTriangle } from "lucide-react";
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

interface Ledger {
    id: number;
    schedulerId?: number | null;
    presenterId?: number | null;
    date: Date;
    month: number;
    year: number;

    // Basic Info
    session: number;

    // Expenses (Pengeluaran)
    bop: number;
    skl: number;

    // Products (internal - from DB)
    moringa60: number;
    moringa30: number;
    annora: number;
    alami: number;
    uramaxLaku: number;

    // Vitamin
    vitamin: number;

    // Repeat Order (RO)
    roMoringa: number;
    roUramax: number;
    roAnnora: number;

    // Bonus Produk
    bonusUramax: number;
    bonusMoringa: number;
    bonusAnnora: number;
    bonusAlami: number;

    // Retur Produk
    returMoringaTerpakai: number;
    returMoringaUtuh: number;
    returUramaxTerpakai: number;
    returUramaxUtuh: number;
    returAnnoraTerpakai: number;
    returAnnoraUtuh: number;

    // Other Income
    bonus: number;
    dp: number;

    // Calculated
    totalBop: number;
    revenue: number;
    penghasilan: number;
    komisiPenjadwal: number;
    komisiPresenter: number;
    performa: number;

    scheduler?: {
        id: number;
        name: string;
        email: string;
    } | null;
    presenter?: {
        id: number;
        name: string;
        email: string;
    } | null;
}

interface User {
    id: number;
    name: string;
    email: string;
}

export default function LedgerPage() {
    const [ledgers, setLedgers] = useState<Ledger[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [editingId, setEditingId] = useState<number | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const [formData, setFormData] = useState({
        schedulerId: "",
        presenterId: "",
        date: new Date().toISOString().split('T')[0],
        sesi: "",                // Sesi
        bop: "",                 // BOP (Biaya Operasional)
        kelorLaku: "",           // Combined Moringa 60 + 30
        uramaxLaku: "",
        annAlLaku: "",           // Combined Annora + Alami
        roKelor: "",             // RO Moringa
        roUramax: "",
        roAnnAl: "",             // RO Annora
        bonusVitamin: "",        // Bonus Vitamin in Rp
        bonusKelor: "",          // Bonus Produk Kelor
        bonusUramax: "",         // Bonus Produk Uramax
        bonusAnnAl: "",          // Bonus Produk Ann/Al
        returKelorTerpakai: "",
        returKelorUtuh: "",
        returUramaxTerpakai: "",
        returUramaxUtuh: "",
        returAnnAlTerpakai: "",
        returAnnAlUtuh: "",
        dp: "",
    });

    // Calculate auto fields based on form input using NEW FORMULAS
    const calculatedFields = useMemo(() => {
        // Map simplified fields to calculation variables
        const kelorLaku = parseInt(formData.kelorLaku) || 0;
        const uramaxLaku = parseInt(formData.uramaxLaku) || 0;
        const annAlLaku = parseInt(formData.annAlLaku) || 0;
        const sesi = parseInt(formData.sesi) || 0;

        // For calculation purposes
        const totalMoringaLaku = kelorLaku;
        const annora = annAlLaku; // Combined Annora + Alami
        const alami = 0;

        // RO
        const roMoringa = parseInt(formData.roKelor) || 0;
        const roUramax = parseInt(formData.roUramax) || 0;
        const roAnnora = parseInt(formData.roAnnAl) || 0;


        // Bonus produk from form
        const bonusMoringa = parseInt(formData.bonusKelor) || 0;
        const bonusUramax = parseInt(formData.bonusUramax) || 0;
        const bonusAnnora = parseInt(formData.bonusAnnAl) || 0;
        const bonusAlami = 0; // Tidak digunakan

        // Retur using new field names
        const returMoringaTerpakai = parseInt(formData.returKelorTerpakai) || 0;
        const returMoringaUtuh = parseInt(formData.returKelorUtuh) || 0;
        const returUramaxTerpakai = parseInt(formData.returUramaxTerpakai) || 0;
        const returUramaxUtuh = parseInt(formData.returUramaxUtuh) || 0;
        const returAnnoraTerpakai = parseInt(formData.returAnnAlTerpakai) || 0;
        const returAnnoraUtuh = parseInt(formData.returAnnAlUtuh) || 0;

        // Calculate Total BOP - dalam RUPIAH PENUH
        const sesiCost = sesi * 7000; // 7.000 per sesi
        const vitaminQty = parseInt(formData.bonusVitamin) || 0; // Quantity vitamin
        const vitaminCost = vitaminQty * 2000; // Vitamin × 2.000
        const bopInput = parseFloat(formData.bop) || 0; // BOP input dalam rupiah

        // Bonus produk cost dalam rupiah penuh
        const bonusCost =
            (bonusMoringa * 110000) +  // Kelor bonus 110.000
            (bonusUramax * 90000) +    // Uramax bonus 90.000
            (bonusAnnora * 100000);    // Ann/Al bonus 100.000

        const totalBop = sesiCost + vitaminCost + bonusCost + bopInput;

        // Calculate Penghasilan dalam RUPIAH PENUH
        const moringaRevenue = (totalMoringaLaku + roMoringa) * 130000; // RO sama dengan harga produk laku
        const moringaCost =
            (returMoringaUtuh * 130000) +            // Retur utuh 130.000
            (returMoringaTerpakai * 130000);         // Retur terpakai 130.000
        const moringaNet = moringaRevenue - moringaCost;

        const uramaxRevenue = (uramaxLaku + roUramax) * 125000; // RO sama dengan harga produk laku
        const uramaxCost =
            (returUramaxUtuh * 125000) +             // Retur utuh 125.000
            (returUramaxTerpakai * 125000);           // Retur terpakai 125.000
        const uramaxNet = uramaxRevenue - uramaxCost;

        const annoraRevenue = (annora + roAnnora) * 140000; // RO sama dengan harga produk laku
        const angoraCost =
            (returAnnoraUtuh * 140000) +             // Retur utuh 140.000
            (returAnnoraTerpakai * 140000);          // Retur terpakai 140.000
        const annoraNet = annoraRevenue - angoraCost;

        const penghasilan = moringaNet + uramaxNet + annoraNet - totalBop;

        const komisiPenjadwal = penghasilan * 0.40;
        const komisiPresenter = penghasilan * 0.60;

        const totalProducts = totalMoringaLaku + annora + uramaxLaku;
        // Performa based on total main products sold, capped at 100
        const performa = Math.min(100, totalProducts);

        return {
            totalProducts,
            totalBop,
            penghasilan,
            komisiPenjadwal,
            komisiPresenter,
            performa
        };
    }, [formData]);

    useEffect(() => {
        document.title = "Entri Harian - Buku Besar";
        fetchLedgers();
        fetchUsers();
    }, [currentMonth, currentYear]);

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

    const fetchLedgers = async () => {
        try {
            setIsLoading(true);
            const url = `/api/ledger?month=${currentMonth}&year=${currentYear}`;
            const response = await fetch(url);
            if (response.ok) {
                const result = await response.json();
                setLedgers(result.data || []);
            }
        } catch (error) {
            console.error("Error fetching ledgers:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await fetch("/api/users?limit=1000");
            if (response.ok) {
                const result = await response.json();
                setUsers(result.data || []);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = editingId ? `/api/ledger/${editingId}` : "/api/ledger";
            const method = editingId ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    schedulerId: formData.schedulerId ? parseInt(formData.schedulerId) : undefined,
                    presenterId: formData.presenterId ? parseInt(formData.presenterId) : undefined,
                    date: formData.date,
                    // Map simplified fields to DB fields
                    session: parseInt(formData.sesi) || 1, // Sesi from form
                    audiens: 0, // Fixed value since no longer in form
                    bop: parseFloat(formData.bop) || 0, // BOP from form input
                    skl: 0, // Removed from form
                    moringa60: 0, // Will be calculated as part of kelorLaku
                    moringa30: parseInt(formData.kelorLaku) || 0, // Store kelorLaku in moringa30 for now
                    annora: parseInt(formData.annAlLaku) || 0, // Combined Annora + Alami
                    alami: 0, // Not used separately
                    uramaxLaku: parseInt(formData.uramaxLaku) || 0,
                    vitamin: parseInt(formData.bonusVitamin) || 0, // Quantity vitamin
                    roMoringa: parseInt(formData.roKelor) || 0,
                    roUramax: parseInt(formData.roUramax) || 0,
                    roAnnora: parseInt(formData.roAnnAl) || 0,
                    bonusUramax: parseInt(formData.bonusUramax) || 0,
                    bonusMoringa: parseInt(formData.bonusKelor) || 0,
                    bonusAnnora: parseInt(formData.bonusAnnAl) || 0,
                    bonusAlami: 0, // Not used separately
                    returMoringaTerpakai: parseInt(formData.returKelorTerpakai) || 0,
                    returMoringaUtuh: parseInt(formData.returKelorUtuh) || 0,
                    returUramaxTerpakai: parseInt(formData.returUramaxTerpakai) || 0,
                    returUramaxUtuh: parseInt(formData.returUramaxUtuh) || 0,
                    returAnnoraTerpakai: parseInt(formData.returAnnAlTerpakai) || 0,
                    returAnnoraUtuh: parseInt(formData.returAnnAlUtuh) || 0,
                    bonus: 0, // Not used anymore
                    dp: parseFloat(formData.dp) || 0,
                }),
            });

            if (response.ok) {
                await fetchLedgers();
                handleCancel();
            }
        } catch (error) {
            console.error("Error saving ledger:", error);
        }
    };

    const handleEdit = (ledger: Ledger) => {
        setEditingId(ledger.id);
        // Map DB fields to simplified form fields
        const kelorLaku = (ledger.moringa60 + ledger.moringa30).toString();
        const annAlLaku = (ledger.annora + ledger.alami).toString();

        setFormData({
            schedulerId: ledger.schedulerId?.toString() || "",
            presenterId: ledger.presenterId?.toString() || "",
            date: new Date(ledger.date).toISOString().split('T')[0],
            sesi: ledger.session.toString(),
            bop: ledger.bop.toString(),
            kelorLaku,
            uramaxLaku: ledger.uramaxLaku.toString(),
            annAlLaku,
            roKelor: ledger.roMoringa.toString(),
            roUramax: ledger.roUramax.toString(),
            roAnnAl: ledger.roAnnora.toString(),
            bonusVitamin: ledger.vitamin.toString(), // Quantity vitamin
            bonusKelor: ledger.bonusMoringa.toString(),
            bonusUramax: ledger.bonusUramax.toString(),
            bonusAnnAl: ledger.bonusAnnora.toString(),
            returKelorTerpakai: ledger.returMoringaTerpakai.toString(),
            returKelorUtuh: ledger.returMoringaUtuh.toString(),
            returUramaxTerpakai: ledger.returUramaxTerpakai.toString(),
            returUramaxUtuh: ledger.returUramaxUtuh.toString(),
            returAnnAlTerpakai: ledger.returAnnoraTerpakai.toString(),
            returAnnAlUtuh: ledger.returAnnoraUtuh.toString(),
            dp: ledger.dp.toString(),
        });
        setShowForm(true);
    };

    const handleDelete = async (id: number) => {
        try {
            const response = await fetch(`/api/ledger/${id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                await fetchLedgers();
                setDeleteId(null);
            }
        } catch (error) {
            console.error("Error deleting ledger:", error);
        }
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingId(null);
        setFormData({
            schedulerId: "",
            presenterId: "",
            date: new Date().toISOString().split('T')[0],
            sesi: "",
            bop: "",
            kelorLaku: "",
            uramaxLaku: "",
            annAlLaku: "",
            roKelor: "",
            roUramax: "",
            roAnnAl: "",
            bonusVitamin: "",
            bonusKelor: "",
            bonusUramax: "",
            bonusAnnAl: "",
            returKelorTerpakai: "",
            returKelorUtuh: "",
            returUramaxTerpakai: "",
            returUramaxUtuh: "",
            returAnnAlTerpakai: "",
            returAnnAlUtuh: "",
            dp: "",
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

    const getPerformaColor = (performa: number) => {
        if (performa >= 100) return "text-green-600 dark:text-green-400";
        if (performa >= 50) return "text-yellow-600 dark:text-yellow-400";
        return "text-red-600 dark:text-red-400";
    };

    const getPerformaLabel = (performa: number) => {
        if (performa >= 100) return "Sangat Baik";
        if (performa >= 75) return "Baik";
        if (performa >= 50) return "Cukup";
        return "Perlu Ditingkatkan";
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
                        { label: "Entri Harian Buku Besar" }
                    ]}
                />
            </div>

            <div className="mt-4 sm:mt-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
                    <div>
                        <h1 className="text-xl font-bold text-gray-800 dark:text-white/90">
                            Entri Harian Buku Besar
                        </h1>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Catat penghasilan harian dengan detail penjadwal, presenter, dan produk
                        </p>
                    </div>
                    <AdminOnly>
                        <button
                            onClick={() => setShowForm(true)}
                            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-blue-700"
                        >
                            <Plus className="h-4 w-4" />
                            Tambah Entri
                        </button>
                    </AdminOnly>
                </div>

                <div className="overflow-hidden rounded-none sm:rounded-2xl border-y sm:border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
                    {ledgers.length === 0 ? (
                        <div className="py-12 text-center">
                            <Book className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-600" />
                            <h3 className="mt-4 text-lg font-semibold text-gray-800 dark:text-white/90">
                                Belum ada entri bulan ini
                            </h3>
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                Mulai catat penghasilan harian
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto pb-4">
                            <Table className="min-w-[4000px]">
                                <TableHeader className="border-gray-100 dark:border-gray-800 border-y bg-gray-50/50 dark:bg-gray-800/50">
                                    <TableRow>
                                        <TableCell isHeader className="py-4 px-6 font-medium text-gray-500 text-start text-xs uppercase tracking-wider dark:text-gray-400 w-[120px] sticky left-0 bg-gray-50 dark:bg-gray-900 z-20">Tanggal</TableCell>
                                        <TableCell isHeader className="py-4 px-4 font-medium text-gray-500 text-start text-xs uppercase tracking-wider dark:text-gray-400 w-[180px]">Penjadwal</TableCell>
                                        <TableCell isHeader className="py-4 px-4 font-medium text-gray-500 text-start text-xs uppercase tracking-wider dark:text-gray-400 w-[180px]">Presenter</TableCell>
                                        <TableCell isHeader className="py-4 px-4 font-medium text-gray-500 text-center text-xs uppercase tracking-wider dark:text-gray-400 w-[80px]">Sesi</TableCell>
                                        <TableCell isHeader className="py-4 px-4 font-medium text-gray-500 text-end text-xs uppercase tracking-wider dark:text-gray-400 w-[140px]">BOP</TableCell>
                                        <TableCell isHeader className="py-4 px-4 font-medium text-gray-500 text-end text-xs uppercase tracking-wider dark:text-gray-400 w-[140px]">SKL</TableCell>
                                        <TableCell isHeader className="py-4 px-4 font-medium text-gray-500 text-center text-xs uppercase tracking-wider dark:text-gray-400 w-[90px]">M60</TableCell>
                                        <TableCell isHeader className="py-4 px-4 font-medium text-gray-500 text-center text-xs uppercase tracking-wider dark:text-gray-400 w-[90px]">Annora</TableCell>
                                        <TableCell isHeader className="py-4 px-4 font-medium text-gray-500 text-center text-xs uppercase tracking-wider dark:text-gray-400 w-[90px]">Alami</TableCell>
                                        <TableCell isHeader className="py-4 px-4 font-medium text-gray-500 text-center text-xs uppercase tracking-wider dark:text-gray-400 w-[90px]">M30</TableCell>
                                        <TableCell isHeader className="py-4 px-4 font-medium text-gray-500 text-end text-xs uppercase tracking-wider dark:text-gray-400 w-[140px]">Bonus</TableCell>
                                        <TableCell isHeader className="py-4 px-4 font-medium text-gray-500 text-end text-xs uppercase tracking-wider dark:text-gray-400 w-[140px]">DP</TableCell>
                                        <TableCell isHeader className="py-4 px-4 font-semibold text-gray-600 text-end text-xs uppercase tracking-wider dark:text-gray-300 w-[160px] bg-blue-50 dark:bg-blue-900/20">Total BOP</TableCell>
                                        <TableCell isHeader className="py-4 px-4 font-semibold text-gray-600 text-end text-xs uppercase tracking-wider dark:text-gray-300 w-[180px] bg-green-50 dark:bg-green-900/20">Penghasilan</TableCell>
                                        <TableCell isHeader className="py-4 px-4 font-medium text-gray-500 text-end text-xs uppercase tracking-wider dark:text-gray-400 w-[180px]">K. Penjadwal</TableCell>
                                        <TableCell isHeader className="py-4 px-4 font-medium text-gray-500 text-end text-xs uppercase tracking-wider dark:text-gray-400 w-[180px]">K. Presenter</TableCell>
                                        <TableCell isHeader className="py-4 px-4 font-medium text-gray-500 text-center text-xs uppercase tracking-wider dark:text-gray-400 w-[120px] bg-purple-50 dark:bg-purple-900/20">Performa</TableCell>
                                        <AdminOnly>
                                            <TableCell isHeader className="py-4 px-6 font-medium text-gray-500 text-end text-xs uppercase tracking-wider dark:text-gray-400 w-[120px] sticky right-0 bg-gray-50 dark:bg-gray-900 z-20">Aksi</TableCell>
                                        </AdminOnly>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {ledgers.map((ledger) => (
                                        <TableRow key={ledger.id} className="transition-colors hover:bg-gray-50/50 dark:hover:bg-white/[0.02]">
                                            <TableCell className="py-5 px-6 text-sm font-medium text-gray-700 dark:text-gray-300 sticky left-0 bg-white dark:bg-black z-10">{formatDate(ledger.date)}</TableCell>
                                            <TableCell className="py-5 px-4 text-sm text-gray-800 dark:text-white">{ledger.scheduler?.name || "-"}</TableCell>
                                            <TableCell className="py-5 px-4 text-sm text-gray-800 dark:text-white">{ledger.presenter?.name || "-"}</TableCell>
                                            <TableCell className="py-5 px-4 text-center text-sm font-medium text-gray-700 dark:text-gray-300">{ledger.session}</TableCell>
                                            <TableCell className="py-5 px-4 text-end text-sm text-red-600 dark:text-red-400">{formatCurrency(ledger.bop)}</TableCell>
                                            <TableCell className="py-5 px-4 text-end text-sm text-red-600 dark:text-red-400">{formatCurrency(ledger.skl)}</TableCell>
                                            <TableCell className="py-5 px-4 text-center text-sm font-medium text-gray-700 dark:text-gray-300">{ledger.moringa60}</TableCell>
                                            <TableCell className="py-5 px-4 text-center text-sm font-medium text-gray-700 dark:text-gray-300">{ledger.annora}</TableCell>
                                            <TableCell className="py-5 px-4 text-center text-sm font-medium text-gray-700 dark:text-gray-300">{ledger.alami}</TableCell>
                                            <TableCell className="py-5 px-4 text-center text-sm font-medium text-gray-700 dark:text-gray-300">{ledger.moringa30}</TableCell>
                                            <TableCell className="py-5 px-4 text-end text-sm text-green-600 dark:text-green-400">{formatCurrency(ledger.bonus)}</TableCell>
                                            <TableCell className="py-5 px-4 text-end text-sm text-blue-600 dark:text-blue-400">{formatCurrency(ledger.dp)}</TableCell>
                                            <TableCell className="py-5 px-4 text-end text-sm font-bold text-blue-700 dark:text-blue-300 bg-blue-50/50 dark:bg-blue-900/10">{formatCurrency(ledger.totalBop)}</TableCell>
                                            <TableCell className="py-5 px-4 text-end text-base font-bold text-green-700 dark:text-green-300 bg-green-50/50 dark:bg-green-900/10">{formatCurrency(ledger.penghasilan)}</TableCell>
                                            <TableCell className="py-5 px-4 text-end text-sm text-orange-600 dark:text-orange-400">{formatCurrency(ledger.komisiPenjadwal)}</TableCell>
                                            <TableCell className="py-5 px-4 text-end text-sm text-purple-600 dark:text-purple-400">{formatCurrency(ledger.komisiPresenter)}</TableCell>
                                            <TableCell className="py-5 px-4 text-center bg-purple-50/50 dark:bg-purple-900/10">
                                                <div className="flex flex-col items-center gap-1">
                                                    <span className={`text-sm font-bold ${getPerformaColor(ledger.performa)}`}>
                                                        {ledger.performa.toFixed(1)}%
                                                    </span>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        {getPerformaLabel(ledger.performa)}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <AdminOnly>
                                                <TableCell className="py-5 px-6 text-end sticky right-0 bg-white dark:bg-black z-10">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button onClick={() => handleEdit(ledger)} className="rounded-lg p-2 text-blue-600 transition-colors hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20">
                                                            <Pencil className="h-4 w-4" />
                                                        </button>
                                                        <button onClick={() => setDeleteId(ledger.id)} className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20">
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
                    )}
                </div>
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm">
                    <div className="relative w-full max-w-5xl rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900 max-h-[90vh] overflow-y-auto">
                        <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                                    {editingId ? "Edit Entri Harian" : "Tambah Entri Harian"}
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Semua perhitungan dilakukan otomatis</p>
                            </div>
                            <button onClick={handleCancel} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Basic Info */}
                            <div>
                                <h3 className="font-semibold text-gray-700 dark:text-gray-300 border-b pb-2 mb-4">Informasi Dasar</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Tanggal *</label>
                                        <input
                                            type="date"
                                            required
                                            value={formData.date}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Penjadwal</label>
                                        <select
                                            value={formData.schedulerId}
                                            onChange={(e) => setFormData({ ...formData, schedulerId: e.target.value })}
                                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                        >
                                            <option value="">Pilih Penjadwal</option>
                                            {users.map(user => (<option key={user.id} value={user.id}>{user.name}</option>))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Presenter</label>
                                        <select
                                            value={formData.presenterId}
                                            onChange={(e) => setFormData({ ...formData, presenterId: e.target.value })}
                                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                        >
                                            <option value="">Pilih Presenter</option>
                                            {users.map(user => (<option key={user.id} value={user.id}>{user.name}</option>))}
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                    <div>
                                        <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Sesi</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={formData.sesi}
                                            onChange={(e) => setFormData({ ...formData, sesi: e.target.value })}
                                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                            placeholder="1"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">BOP (Biaya Operasional) <span className="text-xs text-gray-400">(Rp)</span></label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={formData.bop}
                                            onChange={(e) => setFormData({ ...formData, bop: e.target.value })}
                                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Products */}
                            <div>
                                <h3 className="font-semibold text-gray-700 dark:text-gray-300 border-b pb-2 mb-4">Produk Laku</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Kelor Laku</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={formData.kelorLaku}
                                            onChange={(e) => setFormData({ ...formData, kelorLaku: e.target.value })}
                                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                            placeholder="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Uramax Laku</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={formData.uramaxLaku}
                                            onChange={(e) => setFormData({ ...formData, uramaxLaku: e.target.value })}
                                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                            placeholder="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Ann/Al Laku</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={formData.annAlLaku}
                                            onChange={(e) => setFormData({ ...formData, annAlLaku: e.target.value })}
                                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Bonus Vitamin */}
                            <div>
                                <h3 className="font-semibold text-gray-700 dark:text-gray-300 border-b pb-2 mb-4">Bonus Vitamin</h3>
                                <div className="grid grid-cols-1  gap-4">
                                    <div>
                                        <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Jumlah Vitamin <span className="text-xs text-gray-400">(@ Rp 2.000)</span></label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={formData.bonusVitamin}
                                            onChange={(e) => setFormData({ ...formData, bonusVitamin: e.target.value })}
                                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Bonus Produk */}
                            <div>
                                <h3 className="font-semibold text-gray-700 dark:text-gray-300 border-b pb-2 mb-4">Bonus Produk</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Bonus Kelor <span className="text-xs text-gray-400">(@ Rp 110)</span></label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={formData.bonusKelor}
                                            onChange={(e) => setFormData({ ...formData, bonusKelor: e.target.value })}
                                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                            placeholder="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Bonus Uramax <span className="text-xs text-gray-400">(@ Rp 90)</span></label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={formData.bonusUramax}
                                            onChange={(e) => setFormData({ ...formData, bonusUramax: e.target.value })}
                                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                            placeholder="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Bonus Ann/Al <span className="text-xs text-gray-400">(@ Rp 100)</span></label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={formData.bonusAnnAl}
                                            onChange={(e) => setFormData({ ...formData, bonusAnnAl: e.target.value })}
                                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Repeat Order (RO) Section */}
                            <div>
                                <h3 className="font-semibold text-gray-700 dark:text-gray-300 border-b pb-2 mb-4">Repeat Order (RO)</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">RO Kelor</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={formData.roKelor}
                                            onChange={(e) => setFormData({ ...formData, roKelor: e.target.value })}
                                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                            placeholder="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">RO Uramax</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={formData.roUramax}
                                            onChange={(e) => setFormData({ ...formData, roUramax: e.target.value })}
                                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                            placeholder="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">RO Ann/Al</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={formData.roAnnAl}
                                            onChange={(e) => setFormData({ ...formData, roAnnAl: e.target.value })}
                                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                            </div>


                            {/* Retur Produk Section */}
                            <div>
                                <h3 className="font-semibold text-gray-700 dark:text-gray-300 border-b pb-2 mb-4">Retur Produk</h3>
                                <div className="space-y-4">
                                    {/* Kelor Retur */}
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Kelor</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Terpakai <span className="text-xs text-gray-400">(@ Rp 130)</span></label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={formData.returKelorTerpakai}
                                                    onChange={(e) => setFormData({ ...formData, returKelorTerpakai: e.target.value })}
                                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                                    placeholder="0"
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Utuh <span className="text-xs text-gray-400">(@ Rp 130)</span></label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={formData.returKelorUtuh}
                                                    onChange={(e) => setFormData({ ...formData, returKelorUtuh: e.target.value })}
                                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                                    placeholder="0"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    {/* Uramax Retur */}
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Uramax</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Terpakai <span className="text-xs text-gray-400">(@ Rp 125)</span></label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={formData.returUramaxTerpakai}
                                                    onChange={(e) => setFormData({ ...formData, returUramaxTerpakai: e.target.value })}
                                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                                    placeholder="0"
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Utuh <span className="text-xs text-gray-400">(@ Rp 125)</span></label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={formData.returUramaxUtuh}
                                                    onChange={(e) => setFormData({ ...formData, returUramaxUtuh: e.target.value })}
                                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                                    placeholder="0"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    {/* Ann/Al Retur */}
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Ann/Al</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Terpakai <span className="text-xs text-gray-400">(@ Rp 140)</span></label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={formData.returAnnAlTerpakai}
                                                    onChange={(e) => setFormData({ ...formData, returAnnAlTerpakai: e.target.value })}
                                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                                    placeholder="0"
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Utuh <span className="text-xs text-gray-400">(@ Rp 140)</span></label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={formData.returAnnAlUtuh}
                                                    onChange={(e) => setFormData({ ...formData, returAnnAlUtuh: e.target.value })}
                                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                                    placeholder="0"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Other Income */}
                            <div>
                                <h3 className="font-semibold text-gray-700 dark:text-gray-300 border-b pb-2 mb-4">Pendapatan Lain</h3>
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">DP (Down Payment)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={formData.dp}
                                            onChange={(e) => setFormData({ ...formData, dp: e.target.value })}
                                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Calculated Fields Display */}
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                                <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-blue-600" />
                                    Perhitungan Otomatis
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4">
                                    <div>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Produk</p>
                                        <p className="text-lg font-bold text-gray-900 dark:text-white">{calculatedFields.totalProducts}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total BOP</p>
                                        <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{formatCurrency(calculatedFields.totalBop)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Penghasilan</p>
                                        <p className="text-lg font-bold text-green-600 dark:text-green-400">{formatCurrency(calculatedFields.penghasilan)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Komisi Penjadwal (40%)</p>
                                        <p className="text-lg font-bold text-orange-600 dark:text-orange-400">{formatCurrency(calculatedFields.komisiPenjadwal)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Komisi Presenter (60%)</p>
                                        <p className="text-lg font-bold text-purple-600 dark:text-purple-400">{formatCurrency(calculatedFields.komisiPresenter)}</p>
                                    </div>
                                    <div className="md:col-span-3 bg-white dark:bg-gray-800 rounded-lg p-3">
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-2">
                                            <AlertTriangle className="h-4 w-4" />
                                            Performa (Produk/Audiens)
                                        </p>
                                        <div className="flex items-center gap-3">
                                            <p className={`text-2xl font-bold ${getPerformaColor(calculatedFields.performa)}`}>
                                                {calculatedFields.performa.toFixed(1)}%
                                            </p>
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                {getPerformaLabel(calculatedFields.performa)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 border-t border-gray-200 pt-6 dark:border-gray-700">
                                <button type="submit" className="flex-1 rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition-all hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/20">
                                    {editingId ? "Update Entri" : "Simpan Entri"}
                                </button>
                                <button type="button" onClick={handleCancel} className="flex-1 rounded-lg border border-gray-300 px-4 py-3 font-semibold text-gray-700 transition-all hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
                                    Batal
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {deleteId && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="relative w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900">
                        <div className="mb-6 flex flex-col items-center text-center">
                            <div className="mb-4 rounded-full bg-red-100 p-3 dark:bg-red-900/20">
                                <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
                            </div>
                            <h3 className="mb-2 text-lg font-bold text-gray-800 dark:text-white">
                                Hapus Entri?
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Entri yang dihapus tidak dapat dikembalikan.
                            </p>
                        </div>
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
