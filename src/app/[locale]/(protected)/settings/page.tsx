import { redirect } from 'next/navigation';
import { Locale } from '@/lib/i18n';
import { auth } from '@/auth';
import GuardAuditPanel from '@/components/debug/GuardAuditPanel';
import PreferencesPanel from '@/components/settings/PreferencesPanel';
import ManagementPageShell from '@/components/layout/ManagementPageShell';
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

  // Default preferences (always use defaults for now - preferences are managed via API)
  const initialPrefs = {
    notificationsEnabled: true,
    theme: 'light',
    fontSize: 'medium',
    articlesPerPage: 10,
  };

  const labels = {
    title: localeValue === 'km' ? 'ការកំណត់' : 'Settings',
    subtitle:
      localeValue === 'km'
        ? 'គ្រប់គ្រងគណនី សុវត្ថិភាព និងចំណូលចិត្តរបស់អ្នកនៅកន្លែងតែមួយ។'
        : 'Manage your account, security, and preferences from one place.',
    account: localeValue === 'km' ? 'ព័ត៌មានគណនី' : 'Account overview',
    role: localeValue === 'km' ? 'តួនាទី' : 'Role',
    source: localeValue === 'km' ? 'ប្រភពតួនាទី' : 'Role source',
    security: localeValue === 'km' ? 'សុវត្ថិភាព' : 'Security',
    sessionSecurity: localeValue === 'km' ? 'សុវត្ថិភាពសម័យប្រើប្រាស់' : 'Session security',
    sessionHint:
      localeValue === 'km'
        ? 'ពិនិត្យឧបករណ៍ដែលបានចូលប្រើ ហើយចេញពីសម័យដែលមិនស្គាល់។'
        : 'Review active devices and sign out unknown sessions.',
    passwordSecurity: localeValue === 'km' ? 'សុវត្ថិភាពពាក្យសម្ងាត់' : 'Password security',
    passwordHint:
      localeValue === 'km'
        ? 'ផ្លាស់ប្តូរពាក្យសម្ងាត់របស់អ្នកជាប្រចាំដើម្បីការពារគណនី។'
        : 'Change your password regularly to keep your account protected.',
    devAudit: localeValue === 'km' ? 'ព័ត៌មាន Guard (សម្រាប់ Dev)' : 'Guard audit (Dev only)',
  };

  return (
    <ManagementPageShell
      title={labels.title}
      subtitle={labels.subtitle}
      main={
        <div className="space-y-8">
          <section id="preferences" className="scroll-mt-24">
            <PreferencesPanel initial={initialPrefs} locale={localeValue} />
          </section>
        </div>
      }
      aside={
        <>
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">{labels.account}</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-slate-500">Email</dt>
                <dd className="font-medium text-slate-900">{roleDetails.normalizedEmail}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-slate-500">{labels.role}</dt>
                <dd className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold uppercase text-indigo-700">{role}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-slate-500">{labels.source}</dt>
                <dd className="text-xs font-semibold uppercase text-slate-700">{roleDetails.source}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">{labels.security}</h2>
            <div className="mt-4 space-y-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="font-medium text-slate-900">{labels.sessionSecurity}</p>
                <p className="mt-1 text-sm text-slate-500">{labels.sessionHint}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="font-medium text-slate-900">{labels.passwordSecurity}</p>
                <p className="mt-1 text-sm text-slate-500">{labels.passwordHint}</p>
              </div>
            </div>
          </section>
        </>
      }
      footer={
        isDev ? (
          <details className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <summary className="cursor-pointer text-sm font-semibold text-slate-700">{labels.devAudit}</summary>
            <div className="mt-4">
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
            </div>
          </details>
        ) : null
      }
    />
  );
}
