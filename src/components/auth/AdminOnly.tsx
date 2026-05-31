"use client";

import { useSession } from "next-auth/react";
import { ReactNode } from "react";

interface AdminOnlyProps {
    children: ReactNode;
    fallback?: ReactNode;
}

/**
 * Component that only renders its children if the user is an admin.
 * Useful for hiding add/edit/delete buttons from STAFF users.
 */
export function AdminOnly({ children, fallback = null }: AdminOnlyProps) {
    const { data: session } = useSession();
    const isAdmin = session?.user?.role === "ADMIN";

    if (!isAdmin) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}

/**
 * Hook to check if current user is admin
 */
export function useIsAdmin() {
    const { data: session } = useSession();
    return session?.user?.role === "ADMIN";
}
