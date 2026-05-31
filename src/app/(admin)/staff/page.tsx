"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, Plus, Pencil, Trash2, Mail, UserCircle, ChevronLeft, ChevronRight } from "lucide-react";
import Breadcrumb from "@/components/common/Breadcrumb";
import Loading from "@/components/common/Loading";

interface User {
    id: number;
    name: string;
    email: string;
    createdAt: Date;
}

interface PaginationMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export default function StaffPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [pagination, setPagination] = useState<PaginationMeta>({
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 1
    });

    useEffect(() => {
        document.title = "Daftar Staff - Insan Sehat Indonesia";
        fetchUsers();
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

    const fetchUsers = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`/api/users?page=${pagination.page}&limit=${pagination.limit}`);
            if (response.ok) {
                const result = await response.json();
                setUsers(result.data);
                setPagination(prev => ({
                    ...prev,
                    ...result.meta
                }));
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            const response = await fetch(`/api/users/${id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                await fetchUsers();
                setDeleteId(null);
            }
        } catch (error) {
            console.error("Error deleting user:", error);
        }
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
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
                        { label: "Daftar Staff" }
                    ]}
                />
            </div>

            {deleteId && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="relative w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900">
                        <div className="mb-6 flex flex-col items-center text-center">
                            <div className="mb-4 rounded-full bg-red-100 p-3 dark:bg-red-900/20">
                                <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
                            </div>
                            <h3 className="mb-2 text-lg font-bold text-gray-800 dark:text-white">
                                Hapus Staff?
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Data staff yang dihapus tidak dapat dikembalikan.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => handleDelete(deleteId)}
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

            <div className="mt-4 sm:mt-6">
                <div className="overflow-hidden rounded-none sm:rounded-2xl border-y sm:border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
                    <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-800">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                                    Daftar Staff
                                </h1>
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    Kelola data staff dan karyawan ({pagination.total} total)
                                </p>
                            </div>
                            <Link
                                href="/staff/new"
                                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/20"
                            >
                                <Plus className="h-4 w-4" />
                                <span className="hidden sm:inline">Tambah Staff</span>
                            </Link>
                        </div>
                    </div>

                    {users.length === 0 ? (
                        <div className="py-12 text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/10">
                                <Users className="h-8 w-8 text-blue-500 dark:text-blue-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                                Belum ada staff
                            </h3>
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                Tambahkan staff pertama Anda
                            </p>
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
                                                Nama Staff
                                            </TableCell>
                                            <TableCell
                                                isHeader
                                                className="py-3 font-medium text-gray-500 text-start text-xs uppercase tracking-wider dark:text-gray-400"
                                            >
                                                Email
                                            </TableCell>
                                            <TableCell
                                                isHeader
                                                className="py-3 font-medium text-gray-500 text-start text-xs uppercase tracking-wider dark:text-gray-400"
                                            >
                                                Bergabung
                                            </TableCell>
                                            <TableCell
                                                isHeader
                                                className="py-3 pr-6 font-medium text-gray-500 text-end text-xs uppercase tracking-wider dark:text-gray-400"
                                            >
                                                Aksi
                                            </TableCell>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                                        {users.map((user) => (
                                            <TableRow key={user.id} className="transition-colors hover:bg-gray-50/50 dark:hover:bg-white/[0.02]">
                                                <TableCell className="py-4 pl-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
                                                            <UserCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                                        </div>
                                                        <span className="font-medium text-gray-800 dark:text-white/90">
                                                            {user.name}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-4 text-gray-500 text-sm dark:text-gray-400">
                                                    {user.email}
                                                </TableCell>
                                                <TableCell className="py-4 text-gray-500 text-sm dark:text-gray-400">
                                                    {formatDate(user.createdAt)}
                                                </TableCell>
                                                <TableCell className="py-4 pr-6">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Link
                                                            href={`/staff/${user.id}/edit`}
                                                            className="rounded-lg p-2 text-blue-600 transition-colors hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                                                            title="Edit staff"
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Link>
                                                        <button
                                                            onClick={() => setDeleteId(user.id)}
                                                            className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                                                            title="Hapus staff"
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

                            {/* Mobile View - Cards */}
                            <div className="md:hidden p-4 space-y-3">
                                {users.map((user) => (
                                    <div
                                        key={user.id}
                                        className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 transition-all hover:shadow-sm dark:border-gray-800 dark:bg-white/[0.02]"
                                    >
                                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
                                            <UserCircle className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h3 className="font-semibold text-gray-800 dark:text-white/90">
                                                        {user.name}
                                                    </h3>
                                                    <div className="mt-1 flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                                                        <Mail className="h-3.5 w-3.5" />
                                                        <span className="truncate">{user.email}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                                                Bergabung: {formatDate(user.createdAt)}
                                            </p>

                                            <div className="mt-3 flex items-center gap-2">
                                                <Link
                                                    href={`/staff/${user.id}/edit`}
                                                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 hover:border-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                    Edit
                                                </Link>
                                                <button
                                                    onClick={() => setDeleteId(user.id)}
                                                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 transition-all hover:bg-red-50 hover:border-red-400 dark:border-red-900/30 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-red-900/10"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    Hapus
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
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
