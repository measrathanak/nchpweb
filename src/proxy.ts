import { defaultLocale, locales } from '@/lib/i18n';
import {
  getLocaleFromPathname,
  getProtectedRouteSlug,
  isProtectedLocalizedPath,
  protectedRouteRolePolicy,
} from '@/lib/auth/protected-routes';
import { getUserRole, hasRoleAccess } from '@/lib/auth/roles';
import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const protectedPath = isProtectedLocalizedPath(pathname);

  if (protectedPath) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      const localeInPath = getLocaleFromPathname(pathname);
      const signInUrl = new URL(`/${localeInPath}/auth/signin`, request.url);
      signInUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(signInUrl);
    }

    const protectedSlug = getProtectedRouteSlug(pathname);
    if (protectedSlug) {
      const requiredRole = protectedRouteRolePolicy[protectedSlug];
      const tokenEmail = typeof token.email === 'string' ? token.email : undefined;
      const userRole = getUserRole(tokenEmail);

      if (!hasRoleAccess(userRole, requiredRole)) {
        const localeInPath = getLocaleFromPathname(pathname);
        return NextResponse.redirect(new URL(`/${localeInPath}/forbidden`, request.url));
      }
    }
  }

  // Check if pathname starts with a supported locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) return NextResponse.next();

  // Redirect if there is no locale
  return NextResponse.redirect(
    new URL(`/${defaultLocale}${pathname}`, request.url)
  );
}

export const config = {
  matcher: [
    // Skip all internal paths (_next)
    '/((?!_next|api|public|favicon|sitemap|robots).*)',
  ],
};
