import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Locale } from '@/lib/i18n';
import { auth } from '@/auth';
import { getRoleDetails, hasRoleAccess, getUserRole } from '@/lib/auth/roles';
import { protectedRouteRolePolicy } from '@/lib/auth/protected-routes';
import GuardAuditPanel from '@/components/debug/GuardAuditPanel';

interface DashboardPageProps {
  params: Promise<{ locale: string }>;
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { locale } = await params;
  const localeValue = locale as Locale;
  const session = await auth();
  const isDev = process.env.NODE_ENV !== 'production';
  const requiredRole = protectedRouteRolePolicy.dashboard;
  const role = getUserRole(session?.user?.email ?? null);
  const roleDetails = getRoleDetails(session?.user?.email ?? null);

  const middlewareAuthCheck = Boolean(session?.user?.email);
  const middlewareRoleCheck = hasRoleAccess(role, requiredRole);
  const pageAuthCheck = middlewareAuthCheck;
  const pageRoleCheck = hasRoleAccess(role, requiredRole);
  const finalAccessDecision = middlewareAuthCheck && middlewareRoleCheck && pageAuthCheck && pageRoleCheck;

  if (!middlewareAuthCheck) {
    redirect(`/${localeValue}/auth/signin`);
  }

  if (!middlewareRoleCheck) {
    redirect(`/${localeValue}/forbidden`);
  }

  const t = {
    en: {
      title: 'Dashboard',
      subtitle: 'Quick access to your account areas',
      saved: 'Saved Articles',
      profile: 'Profile',
      settings: 'Settings',
    },
    km: {
      title: 'ផ្ទាំងគ្រប់គ្រង',
      subtitle: 'ចូលប្រើផ្នែកគណនីរបស់អ្នកយ៉ាងឆាប់រហ័ស',
      saved: 'អត្ថបទដែលបានរក្សាទុក',
      profile: 'ប្រវត្តិរូប',
      settings: 'ការកំណត់',
    },
  }[localeValue === 'km' ? 'km' : 'en'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t.title}</h1>
        <p className="text-gray-600 mt-1">{t.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href={`/${localeValue}/saved`} className="rounded-lg border border-gray-200 p-5 hover:border-blue-400">
          {t.saved}
        </Link>
        <Link href={`/${localeValue}/profile`} className="rounded-lg border border-gray-200 p-5 hover:border-blue-400">
          {t.profile}
        </Link>
        <Link href={`/${localeValue}/settings`} className="rounded-lg border border-gray-200 p-5 hover:border-blue-400">
          {t.settings}
        </Link>
      </div>

      {isDev ? (
        <GuardAuditPanel
          locale={localeValue}
          route={`/${localeValue}/dashboard`}
          email={roleDetails.normalizedEmail}
          role={role}
          roleSource={roleDetails.source}
          requiredRole={requiredRole}
          middlewareAuthCheck={middlewareAuthCheck}
          middlewareRoleCheck={middlewareRoleCheck}
          pageAuthCheck={pageAuthCheck}
          pageRoleCheck={pageRoleCheck}
          finalAccessDecision={finalAccessDecision}
        />
      ) : null}
    </div>
  );
}
