"use client";

import { Upload, X } from "lucide-react";

interface ImageUploadProps {
    file: File | null;
    preview: string;
    onFileSelect: (file: File, preview: string) => void;
    onRemove: () => void;
}

export default function ImageUpload({
    file,
    preview,
    onFileSelect,
    onRemove,
}: ImageUploadProps) {
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        if (!selectedFile.type.startsWith("image/")) {
            alert("Hanya file gambar yang diperbolehkan");
            return;
        }

        if (selectedFile.size > 10 * 1024 * 1024) {
            alert("Ukuran file maksimal 10MB");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            onFileSelect(selectedFile, reader.result as string);
        };
        reader.readAsDataURL(selectedFile);
    };

    return (
        <div>
            <label className="mb-2.5 block text-sm font-medium text-gray-800 dark:text-white/90">
                Gambar Produk
            </label>

            {preview ? (
                <div className="relative">
                    <img
                        src={preview}
                        alt="Preview"
                        className="h-64 w-full rounded-xl object-cover"
                    />
                    <button
                        type="button"
                        onClick={onRemove}
                        className="absolute right-2 top-2 rounded-full bg-red-600 p-2 text-white transition-colors hover:bg-red-700"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            ) : (
                <label className="flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-750">
                    <Upload className="h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Klik untuk pilih gambar
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                        PNG, JPG, WEBP (Maks. 10MB)
                    </p>
                    <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                </label>
            )}
        </div>
    );
}
