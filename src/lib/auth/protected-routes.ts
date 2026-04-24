import { Locale } from '@/lib/i18n';
import { AppRole } from '@/lib/auth/roles';

export const protectedRouteSlugs = ['saved', 'profile', 'settings', 'dashboard', 'role-debug', 'users', 'roles'] as const;
export type ProtectedRouteSlug = typeof protectedRouteSlugs[number];

export const protectedRouteRolePolicy: Record<ProtectedRouteSlug, AppRole> = {
  saved: 'user',
  profile: 'user',
  settings: 'user',
  dashboard: 'editor',
  'role-debug': 'user',
  users: 'admin',
  roles: 'admin',
};

export function isProtectedLocalizedPath(pathname: string) {
  return /^\/(en|km)\/(saved|profile|settings|dashboard|role-debug|users|roles)(?:\/|$)/.test(pathname);
}

export function getProtectedRouteSlug(pathname: string): ProtectedRouteSlug | null {
  const matched = pathname.match(/^\/(en|km)\/(saved|profile|settings|dashboard|role-debug|users|roles)(?:\/|$)/);
  const slug = matched?.[2] as ProtectedRouteSlug | undefined;
  return slug ?? null;
}

export function getLocaleFromPathname(pathname: string): Locale {
  return pathname.startsWith('/km') ? 'km' : 'en';
}
