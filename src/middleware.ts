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

    // Handle root paths to avoid 404 and route based on auth state
    if (pathname === '/' || pathname === '/admin') {
        const dest = isUserLoggedIn
            ? `/admin${authenticatedRoutes[0]}` // /admin/dashboard
            : `/admin${unAuthenticatedRoutes[0]}`; // /admin/login
        return NextResponse.redirect(new URL(dest, req.url));
    }

    // Normalize plain /login to /admin/login
    if (pathname === '/login') {
        return NextResponse.redirect(new URL(`/admin${unAuthenticatedRoutes[0]}`, req.url));
    }

    // If we have a valid user object and trying to access login page, redirect to dashboard
    if (userObject && unAuthenticatedRoutes.includes(pathname.replace('/admin', ''))) {
        return NextResponse.redirect(new URL(`/admin${authenticatedRoutes[0]}`, req.url));
    }

    // If JWT doesn't exist but trying to access authenticated pages, redirect to login
    if (!jwt && authenticatedRoutes.includes(pathname.replace('/admin', ''))) {
        return NextResponse.redirect(new URL(`/admin${unAuthenticatedRoutes[0]}`, req.url));
    }

    // If JWT exists but is invalid, redirect to login
    if (jwt && !isValidToken(jwt)) {
        return NextResponse.redirect(new URL(`/admin${unAuthenticatedRoutes[0]}`, req.url));
    }

    // Handle unauthenticated users
    if (!isUserLoggedIn) {
        if (authenticatedRoutes.includes(pathname.replace('/admin', ''))) {
            return NextResponse.redirect(new URL(`/admin${unAuthenticatedRoutes[0]}`, req.url));
        }
    }

    // Handle authenticated users
    if (isUserLoggedIn) {
        if (unAuthenticatedRoutes.includes(pathname.replace('/admin', ''))) {
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
