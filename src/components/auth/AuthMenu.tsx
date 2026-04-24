import Link from 'next/link';
import { Locale } from '@/lib/i18n';

interface AuthMenuProps {
  locale: Locale;
  isAuthenticated: boolean;
  canAccessDashboard?: boolean;
  userName?: string | null;
}

export default function AuthMenu({
  locale,
  isAuthenticated,
  canAccessDashboard = false,
  userName,
}: AuthMenuProps) {
  const t = {
    en: {
      signIn: 'Sign In',
      signUp: 'Sign Up',
      hello: 'Hello',
    },
    km: {
      signIn: 'ចូលប្រើប្រាស់',
      signUp: 'ចុះឈ្មោះ',
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
    </div>
  );
}
