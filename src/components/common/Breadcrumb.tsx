import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
    return (
        <nav className="mb-6 flex items-center gap-2 text-sm">
            {items.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                    {item.href ? (
                        <Link
                            href={item.href}
                            className="text-gray-500 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                        >
                            {item.label}
                        </Link>
                    ) : (
                        <span className="font-medium text-gray-800 dark:text-white/90">
                            {item.label}
                        </span>
                    )}
                    {index < items.length - 1 && (
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                    )}
                </div>
            ))}
        </nav>
    );
}
