import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';

const locales = ['en', 'ar'];
const defaultLocale = 'en';

const PUBLIC_FILE = /\.(.*)$/;

// All admin routes require authentication
const PROTECTED_SEGMENTS = ['/admin'];

export default async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // 1. Skip public files (images, fonts, etc)
    if (PUBLIC_FILE.test(pathname)) {
        return NextResponse.next();
    }

    // 2. Check if route is protected
    // Remove locale prefix (e.g. /en/admin -> /admin) to check
    const pathWithoutLocale = pathname.replace(/^\/(en|ar)/, '') || '/';
    const isProtected = PROTECTED_SEGMENTS.some(segment => pathWithoutLocale.startsWith(segment));

    if (isProtected) {
        // ROUTING HINT: Use the 'isLoggedIn' client-side cookie as a navigation gate.
        //
        // The isLoggedIn cookie is:
        // - Set client-side via document.cookie on path=/ (same domain)
        // - A non-sensitive boolean hint — it does NOT grant API access
        // - Cleared on logout and on RBAC failures
        //
        // SECURITY: Real auth is enforced by the backend on every API call via
        // JWT validation. This cookie only prevents flashing the admin shell.
        const hasSessionHint = req.cookies.has('isLoggedIn');

        if (!hasSessionHint) {
            // Redirect to login with proper locale
            const locale = pathname.match(/^\/(en|ar)/)?.[1] || defaultLocale;
            const loginUrl = new URL(`/${locale}/login`, req.url);
            loginUrl.searchParams.set('redirect', pathWithoutLocale);
            return NextResponse.redirect(loginUrl);
        }
    }

    // 3. Continue with next-intl middleware for localization
    return createMiddleware({
        locales,
        defaultLocale,
        localePrefix: 'always',
    })(req);
}

export const config = {
    // Match internationalized pathnames, skip internals
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)',
    ]
};
