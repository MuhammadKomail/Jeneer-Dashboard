import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
    unAuthenticatedRoutes,
    authenticatedRoutes
} from './utils/routes/routes';

export function middleware(req: NextRequest): NextResponse | void {
    const isUserLoggedIn = req.cookies.get('UserAuthenticated')?.value;
    const { pathname } = req.nextUrl;
    const jwt = req.cookies.get('AuthToken')?.value;
    const userObject = req.cookies.get('user_object')?.value;

    // Remove /admin prefix from pathname for route matching since basePath handles it
    const normalizedPath = pathname.replace('/admin', '') || '/';

    // Handle root path and redirect based on auth state
    if (normalizedPath === '/') {
        const dest = isUserLoggedIn
            ? authenticatedRoutes[0] // /dashboard
            : unAuthenticatedRoutes[0]; // /login
        return NextResponse.redirect(new URL(`/admin${dest}`, req.url));
    }

    // If we have a valid user object and trying to access login page, redirect to dashboard
    if (userObject && unAuthenticatedRoutes.includes(normalizedPath)) {
        return NextResponse.redirect(new URL(`/admin${authenticatedRoutes[0]}`, req.url));
    }

    // If JWT doesn't exist but trying to access authenticated pages, redirect to login
    if (!jwt && authenticatedRoutes.includes(normalizedPath)) {
        return NextResponse.redirect(new URL(`/admin${unAuthenticatedRoutes[0]}`, req.url));
    }

    // If JWT exists but is invalid, redirect to login
    if (jwt && !isValidToken(jwt)) {
        return NextResponse.redirect(new URL(`/admin${unAuthenticatedRoutes[0]}`, req.url));
    }

    // Handle unauthenticated users
    if (!isUserLoggedIn) {
        if (authenticatedRoutes.includes(normalizedPath)) {
            return NextResponse.redirect(new URL(`/admin${unAuthenticatedRoutes[0]}`, req.url));
        }
    }

    // Handle authenticated users
    if (isUserLoggedIn) {
        if (unAuthenticatedRoutes.includes(normalizedPath)) {
            return NextResponse.redirect(new URL(`/admin${authenticatedRoutes[0]}`, req.url));
        }
    }

    // Allow the request to proceed if no conditions are met
    return NextResponse.next();
}

// Function to validate JWT (replace with actual validation logic)
function isValidToken(token: string): boolean {
    return token.length > 10; // Example: Just check that token length is > 10
}
