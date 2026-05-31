"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const currentYear = new Date().getFullYear();

    useEffect(() => {
        document.title = "Login - Insan Sehat Indonesia";
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const result = await signIn("credentials", {
                email: email.toLowerCase().trim(),
                password,
                redirect: false,
            });

            if (result?.error) {
                setPassword(""); // Reset password on failure
                if (result.error.includes("Terlalu banyak")) {
                    setError(result.error);
                } else {
                    setError("Email atau password salah");
                }
            } else {
                router.push("/");
                router.refresh();
            }
        } catch (error: any) {
            setPassword(""); // Reset password on error
            if (error?.message?.includes("Terlalu banyak")) {
                setError(error.message);
            } else {
                setError("Terjadi kesalahan. Silakan coba lagi.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
            <div className="w-full max-w-sm">
                <div className="mb-8 flex flex-col items-center text-center">
                    <div className="relative mb-6 h-20 w-20 overflow-hidden rounded-full border-4 border-white shadow-lg dark:border-gray-800">
                        <Image
                            src="/images/logo/logo-isi.webp"
                            alt="Insan Sehat Indonesia"
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Selamat Datang
                    </h1>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        Masuk untuk mengakses dashboard admin
                    </p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="animate-shake rounded-xl bg-red-50 p-3 text-sm font-medium text-red-600 dark:bg-red-900/20 dark:text-red-400">
                                {error}
                            </div>
                        )}

                        <div>
                            <label
                                htmlFor="email"
                                className="mb-2 block text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                            >
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoComplete="email"
                                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-gray-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                placeholder="nama@email.com"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="mb-2 block text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                            >
                                Kata Sandi
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    autoComplete="current-password"
                                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 pr-12 text-gray-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                    aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full rounded-xl bg-blue-600 px-4 py-2.5 font-medium text-white transition-all hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-blue-400"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg
                                        className="h-4 w-4 animate-spin text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        />
                                    </svg>
                                    Memuat...
                                </span>
                            ) : (
                                "Masuk"
                            )}
                        </button>

                        <div className="text-center">
                            <button
                                type="button"
                                onClick={() => router.push("/reset-password")}
                                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                                Lupa password?
                            </button>
                        </div>
                    </form>
                </div>

                <div className="mt-8 text-center text-xs text-gray-400 dark:text-gray-600">
                    <p>© {currentYear} Insan Sehat Indonesia</p>
                </div>
            </div>
        </div>
    );
}
