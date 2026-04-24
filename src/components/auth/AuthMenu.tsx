import Link from 'next/link';
import { Locale } from '@/lib/i18n';
import { signOut } from '@/auth';
import { AppRole } from '@/lib/auth/roles';

interface AuthMenuProps {
  locale: Locale;
  isAuthenticated: boolean;
  canAccessDashboard?: boolean;
  role?: AppRole;
  userName?: string | null;
}

export default function AuthMenu({
  locale,
  isAuthenticated,
  canAccessDashboard = false,
  role = 'user',
  userName,
}: AuthMenuProps) {
  const t = {
    en: {
      signIn: 'Sign In',
      signUp: 'Sign Up',
      dashboard: 'Dashboard',
      roleDebug: 'Role Debug',
      profile: 'Profile',
      settings: 'Settings',
      saved: 'Saved',
      signOut: 'Sign Out',
      hello: 'Hello',
    },
    km: {
      signIn: 'ចូលប្រើប្រាស់',
      signUp: 'ចុះឈ្មោះ',
      dashboard: 'ផ្ទាំងគ្រប់គ្រង',
      roleDebug: 'ពិនិត្យតួនាទី',
      profile: 'ប្រវត្តិរូប',
      settings: 'ការកំណត់',
      saved: 'បានរក្សាទុក',
      signOut: 'ចាកចេញ',
      hello: 'សួស្តី',
    },
  }[locale === 'km' ? 'km' : 'en'];

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href={`/${locale}/auth/signin`}
          className="px-3 py-1 rounded bg-gray-200 text-gray-800 hover:bg-gray-300"
        >
          {t.signIn}
        </Link>
        <Link
          href={`/${locale}/auth/signup`}
          className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          {t.signUp}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600 hidden md:inline">
        {t.hello}, {userName ?? 'User'}
      </span>
      {process.env.NODE_ENV !== 'production' ? (
        <>
          <span className="px-2 py-1 text-xs rounded bg-amber-100 text-amber-800 border border-amber-300">
            role: {role}
          </span>
          <Link
            href={`/${locale}/role-debug`}
            className="px-3 py-1 rounded bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200"
          >
            {t.roleDebug}
          </Link>
        </>
      ) : null}
      {canAccessDashboard ? (
        <Link
          href={`/${locale}/dashboard`}
          className="px-3 py-1 rounded bg-gray-200 text-gray-800 hover:bg-gray-300"
        >
          {t.dashboard}
        </Link>
      ) : null}
      <Link
        href={`/${locale}/profile`}
        className="px-3 py-1 rounded bg-gray-200 text-gray-800 hover:bg-gray-300"
      >
        {t.profile}
      </Link>
      <Link
        href={`/${locale}/settings`}
        className="px-3 py-1 rounded bg-gray-200 text-gray-800 hover:bg-gray-300"
      >
        {t.settings}
      </Link>
      <Link
        href={`/${locale}/saved`}
        className="px-3 py-1 rounded bg-gray-200 text-gray-800 hover:bg-gray-300"
      >
        {t.saved}
      </Link>
      <form
        action={async () => {
          'use server';
          await signOut({ redirectTo: `/${locale}` });
        }}
      >
        <button
          type="submit"
          className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
        >
          {t.signOut}
        </button>
      </form>
    </div>
  );
}
