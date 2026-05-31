import Image from "next/image";

export default function Loading() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-white dark:bg-gray-950">
            <div className="relative flex flex-col items-center">
                <div className="relative mb-8 h-24 w-24">
                    <div className="relative h-full w-full overflow-hidden rounded-full border-4 border-white shadow-lg dark:border-gray-900">
                        <Image
                            src="/images/logo/logo-isi.webp"
                            alt="ISI Logo"
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>
                </div>
                <div className="text-center">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        Insan Sehat Indonesia
                    </h3>
                    <div className="mt-2 flex items-center justify-center gap-1">
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-500 [animation-delay:-0.3s]"></span>
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-500 [animation-delay:-0.15s]"></span>
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-500"></span>
                    </div>
                </div>
            </div>
        </div>
    );
}