import { redirect } from 'next/navigation';
import { Locale } from '@/lib/i18n';
import { auth } from '@/auth';
import GuardAuditPanel from '@/components/debug/GuardAuditPanel';
import { getRoleDetails, getUserRole, hasRoleAccess } from '@/lib/auth/roles';
import { protectedRouteRolePolicy } from '@/lib/auth/protected-routes';

interface SettingsPageProps {
  params: Promise<{ locale: string }>;
}

export default async function SettingsPage({ params }: SettingsPageProps) {
  const { locale } = await params;
  const localeValue = locale as Locale;
  const session = await auth();
  const isDev = process.env.NODE_ENV !== 'production';

  if (!session?.user?.email) {
    redirect(`/${localeValue}/auth/signin`);
  }

  const requiredRole = protectedRouteRolePolicy.settings;
  const role = getUserRole(session.user.email);
  const roleDetails = getRoleDetails(session.user.email);
  const middlewareAuthCheck = true;
  const middlewareRoleCheck = hasRoleAccess(role, requiredRole);
  const pageAuthCheck = true;
  const pageRoleCheck = hasRoleAccess(role, requiredRole);
  const finalAccessDecision = middlewareAuthCheck && middlewareRoleCheck && pageAuthCheck && pageRoleCheck;

  if (!middlewareRoleCheck) {
    redirect(`/${localeValue}/forbidden`);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{localeValue === 'km' ? 'ការកំណត់' : 'Settings'}</h1>
      <div className="rounded-lg border border-gray-200 p-6 text-gray-700">
        {localeValue === 'km'
          ? 'ទំព័រកំណត់សម្រាប់គណនីរបស់អ្នក (អាចបន្ថែមការកំណត់ភាសា និងការជូនដំណឹងបាន)'
          : 'Settings page for your account (ready for language and notification preferences).'}
      </div>

      {isDev ? (
        <GuardAuditPanel
          locale={localeValue}
          route={`/${localeValue}/settings`}
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
