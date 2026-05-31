import { Session } from "next-auth";

/**
 * Check if user is an admin
 */
export function isAdmin(session: Session | null): boolean {
    return session?.user?.role === "ADMIN";
}

/**
 * Check if user can modify data (create, update, delete)
 * Only admins can modify data
 */
export function canModify(session: Session | null): boolean {
    return isAdmin(session);
}

/**
 * Check if user can view data
 * All authenticated users can view data
 */
export function canView(session: Session | null): boolean {
    return !!session?.user;
}

/**
 * Get user ID from session
 */
export function getUserId(session: Session | null): string | null {
    return session?.user?.id || null;
}

/**
 * Check if user can access admin-only features
 * (e.g., Cashflow, Staff Management)
 */
export function canAccessAdminFeatures(session: Session | null): boolean {
    return isAdmin(session);
}
