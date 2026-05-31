"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import ImageUpload from "@/components/common/ImageUpload";
import Breadcrumb from "@/components/common/Breadcrumb";
import Loading from "@/components/common/Loading";

export default function EditProductPage() {
    const router = useRouter();
    const params = useParams();
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [error, setError] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState("");
    const [originalImageUrl, setOriginalImageUrl] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        displayPrice: "",
        imageUrl: "",
    });

    const formatRupiah = (value: string) => {
        const number = value.replace(/[^\d]/g, "");
        if (!number) return "";
        return new Intl.NumberFormat("id-ID").format(parseInt(number));
    };

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^\d]/g, "");
        setFormData({
            ...formData,
            price: value,
            displayPrice: formatRupiah(value),
        });
    };

    useEffect(() => {
        fetchProduct();
    }, []);

    const fetchProduct = async () => {
        try {
            const response = await fetch(`/api/products/${params.id}`);
            if (!response.ok) throw new Error("Produk tidak ditemukan");

            const data = await response.json();
            setFormData({
                name: data.name,
                description: data.description,
                price: data.price.toString(),
                displayPrice: formatRupiah(data.price.toString()),
                imageUrl: data.imageUrl || "",
            });
            if (data.imageUrl) {
                setImagePreview(data.imageUrl);
                setOriginalImageUrl(data.imageUrl);
            }
            document.title = `Edit ${data.name} - Insan Sehat Indonesia`;
        } catch (error: any) {
            setError(error.message || "Gagal memuat produk");
        } finally {
            setIsFetching(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            let imageUrl = formData.imageUrl;

            if (imageFile) {
                if (originalImageUrl) {
                    try {
                        const urlParts = originalImageUrl.split('/');
                        const uploadIndex = urlParts.indexOf('upload');

                        if (uploadIndex !== -1 && urlParts.length > uploadIndex + 2) {
                            const filename = urlParts[urlParts.length - 1];
                            const folder = urlParts[urlParts.length - 2];
                            const publicId = `${folder}/${filename.split('.')[0]}`;

                            await fetch("/api/upload/delete", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ publicId }),
                            });
                        }
                    } catch (deleteError) {
                        console.error("Failed to delete old image:", deleteError);
                    }
                }

                const uploadFormData = new FormData();
                uploadFormData.append("file", imageFile);

                const uploadResponse = await fetch("/api/upload", {
                    method: "POST",
                    body: uploadFormData,
                });

                if (!uploadResponse.ok) {
                    throw new Error("Gagal upload gambar");
                }

                const uploadData = await uploadResponse.json();
                imageUrl = uploadData.url;
            }

            const response = await fetch(`/api/products/${params.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name,
                    description: formData.description,
                    price: parseFloat(formData.price),
                    imageUrl: imageUrl,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Gagal mengupdate produk");
            }

            router.push("/products");
            router.refresh();
        } catch (error: any) {
            setError(error.message || "Terjadi kesalahan");
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetching) {
        return <Loading />;
    }

    if (error && !formData.name) {
        return (
            <div className="p-0 sm:p-6">
                <div className="rounded-none sm:rounded-2xl border-y sm:border border-red-200 bg-red-50 p-6 text-center dark:border-red-900/50 dark:bg-red-900/10">
                    <div className="mx-auto h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-4">
                        <svg className="h-8 w-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">
                        Gagal Memuat Produk
                    </h3>
                    <p className="text-sm text-red-600 dark:text-red-400 mb-4">
                        {error}
                    </p>
                    <Link
                        href="/products"
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-all"
                    >
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
                        { label: "Edit Produk" }
                    ]}
                />
            </div>

            <div className="mt-4 sm:mt-6">
                <div className="overflow-hidden rounded-none sm:rounded-2xl border-y sm:border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
                    <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-800">
                        <h1 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                            Edit Produk
                        </h1>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            Perbarui informasi produk
                        </p>
                    </div>

                    <div className="p-4 sm:p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-900/10 dark:text-red-400">
                                    {error}
                                </div>
                            )}

                            <ImageUpload
                                file={imageFile}
                                preview={imagePreview}
                                onFileSelect={(file, preview) => {
                                    setImageFile(file);
                                    setImagePreview(preview);
                                }}
                                onRemove={() => {
                                    setImageFile(null);
                                    setImagePreview("");
                                    setFormData({ ...formData, imageUrl: "" });
                                }}
                            />

                            <div>
                                <label
                                    htmlFor="name"
                                    className="block text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2"
                                >
                                    Nama Produk *
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({ ...formData, name: e.target.value })
                                    }
                                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                    placeholder="Contoh: Minyak Kayu Putih Cap Lang"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="description"
                                    className="block text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2"
                                >
                                    Deskripsi *
                                </label>
                                <textarea
                                    id="description"
                                    required
                                    rows={4}
                                    value={formData.description}
                                    onChange={(e) =>
                                        setFormData({ ...formData, description: e.target.value })
                                    }
                                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white resize-none"
                                    placeholder="Deskripsikan produk secara detail..."
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="price"
                                    className="block text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2"
                                >
                                    Harga *
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-3 text-sm text-gray-500 dark:text-gray-400">Rp</span>
                                    <input
                                        id="price"
                                        type="text"
                                        required
                                        value={formData.displayPrice}
                                        onChange={handlePriceChange}
                                        className="w-full rounded-lg border border-gray-300 bg-white pl-14 pr-4 py-2.5 text-sm text-gray-800 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-6 border-t border-gray-200 dark:border-gray-800">
                                <Link
                                    href="/products"
                                    className="flex-1 sm:flex-initial inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 hover:border-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                                >
                                    Batal
                                </Link>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex-1 sm:flex-initial inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {isLoading ? "Menyimpan..." : "Update Produk"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
