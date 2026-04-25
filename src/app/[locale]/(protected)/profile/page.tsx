import { redirect } from 'next/navigation';
import { Locale } from '@/lib/i18n';
import { auth } from '@/auth';
import prisma from '@/lib/db';
import GuardAuditPanel from '@/components/debug/GuardAuditPanel';
import ManagementPageShell from '@/components/layout/ManagementPageShell';
import ProfileEditor from '@/components/settings/ProfileEditor';
import { getRoleDetails, getUserRole, hasRoleAccess } from '@/lib/auth/roles';
import { protectedRouteRolePolicy } from '@/lib/auth/protected-routes';

interface ProfilePageProps {
  params: Promise<{ locale: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { locale } = await params;
  const localeValue = locale as Locale;
  const session = await auth();
  const isDev = process.env.NODE_ENV !== 'production';

  if (!session?.user?.email) {
    redirect(`/${localeValue}/auth/signin`);
  }

  const requiredRole = protectedRouteRolePolicy.profile;
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

  const userProfile = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      email: true,
      name: true,
      firstName: true,
      lastName: true,
      phone: true,
      avatar: true,
      language: true,
    },
  });

  const labels = {
    title: localeValue === 'km' ? 'ប្រវត្តិរូប' : 'Profile',
    subtitle:
      localeValue === 'km'
        ? 'មើល និងគ្រប់គ្រងព័ត៌មានគណនីរបស់អ្នកនៅកន្លែងតែមួយ។'
        : 'View and manage your account information in one place.',
    account: localeValue === 'km' ? 'ព័ត៌មានគណនី' : 'Account details',
    displayName: localeValue === 'km' ? 'ឈ្មោះបង្ហាញ' : 'Display name',
    email: localeValue === 'km' ? 'អ៊ីមែល' : 'Email',
    role: localeValue === 'km' ? 'តួនាទី' : 'Role',
    roleSource: localeValue === 'km' ? 'ប្រភពតួនាទី' : 'Role source',
    security: localeValue === 'km' ? 'សុវត្ថិភាព' : 'Security',
    securityHint:
      localeValue === 'km'
        ? 'ពិនិត្យសម័យប្រើប្រាស់ និងកែប្រែពាក្យសម្ងាត់ជាប្រចាំ។'
        : 'Review your active sessions and update your password regularly.',
    devAudit: localeValue === 'km' ? 'ព័ត៌មាន Guard (សម្រាប់ Dev)' : 'Guard audit (Dev only)',
  };

  return (
    <ManagementPageShell
      title={labels.title}
      subtitle={labels.subtitle}
      main={userProfile ? <ProfileEditor initial={userProfile} /> : null}
      aside={
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">{labels.security}</h2>
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-600">{labels.securityHint}</p>
          </div>
        </section>
      }
      footer={
        isDev ? (
          <details className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <summary className="cursor-pointer text-sm font-semibold text-slate-700">{labels.devAudit}</summary>
            <div className="mt-4">
              <GuardAuditPanel
                locale={localeValue}
                route={`/${localeValue}/profile`}
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
