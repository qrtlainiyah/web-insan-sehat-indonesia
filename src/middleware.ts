import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { applySecurityHeaders } from "@/lib/security-headers";

export async function middleware(request: NextRequest) {
    const session = await auth();
    const { pathname } = request.nextUrl;

    // Public routes: login and reset-password
    const publicRoutes = ["/login", "/reset-password"];
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

    if (isPublicRoute) {
        if (pathname.startsWith("/login") && session) {
            // Redirect logged-in users from login to home
            const response = NextResponse.redirect(new URL("/", request.url));
            return applySecurityHeaders(response);
        }
        // Allow access to public routes
        const response = NextResponse.next();
        return applySecurityHeaders(response);
    }

    // Protect all other routes
    if (!session && !pathname.startsWith("/api/auth") && !pathname.startsWith("/api/seed") && !pathname.startsWith("/api/reset-password")) {
        const response = NextResponse.redirect(new URL("/login", request.url));
        return applySecurityHeaders(response);
    }

    const response = NextResponse.next();
    return applySecurityHeaders(response);
}

export const config = {
    matcher: [
        "/((?!api/auth|api/seed|_next/static|_next/image|images|favicon.ico).*)",
    ],
};
