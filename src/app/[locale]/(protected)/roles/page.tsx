import { redirect } from 'next/navigation';
import { Locale } from '@/lib/i18n';
import { auth } from '@/auth';
import GuardAuditPanel from '@/components/debug/GuardAuditPanel';
import ManagementPageShell from '@/components/layout/ManagementPageShell';
import { getRoleDetails, getUserRole, hasRoleAccess } from '@/lib/auth/roles';
import { protectedRouteRolePolicy } from '@/lib/auth/protected-routes';

interface RolesPageProps {
  params: Promise<{ locale: string }>;
}

export default async function RolesPage({ params }: RolesPageProps) {
  const { locale } = await params;
  const localeValue = locale as Locale;
  const session = await auth();
  const isDev = process.env.NODE_ENV !== 'production';

  if (!session?.user?.email) {
    redirect(`/${localeValue}/auth/signin`);
  }

  const requiredRole = protectedRouteRolePolicy.roles;
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

  const labels = {
    title: localeValue === 'km' ? 'តួនាទី' : 'Roles',
    subtitle:
      localeValue === 'km'
        ? 'គ្រប់គ្រងតួនាទី និងសិទ្ធិចូលប្រើសម្រាប់អ្នកប្រើប្រាស់។'
        : 'Manage roles and access permissions for users.',
    overview: localeValue === 'km' ? 'ទិដ្ឋភាពទូទៅ' : 'Overview',
    currentRole: localeValue === 'km' ? 'តួនាទីបច្ចុប្បន្ន' : 'Current role',
    roleSource: localeValue === 'km' ? 'ប្រភពតួនាទី' : 'Role source',
    noteTitle: localeValue === 'km' ? 'ស្ថានភាព' : 'Status',
    noteBody:
      localeValue === 'km'
        ? 'ទំព័រគ្រប់គ្រងតួនាទីកំពុងរៀបចំ។ បច្ចុប្បន្ន សិទ្ធិត្រូវបានគ្រប់គ្រងតាមអ៊ីមែលក្នុង ENV។'
        : 'Role administration is being prepared. For now, permissions are managed through email lists in environment variables.',
    devAudit: localeValue === 'km' ? 'ព័ត៌មាន Guard (សម្រាប់ Dev)' : 'Guard audit (Dev only)',
  };

  return (
    <ManagementPageShell
      title={labels.title}
      subtitle={labels.subtitle}
      main={
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">{labels.noteTitle}</h2>
          <p className="mt-3 text-sm text-slate-600">{labels.noteBody}</p>
        </section>
      }
      aside={
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">{labels.overview}</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-slate-500">{labels.currentRole}</dt>
              <dd className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold uppercase text-indigo-700">{role}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-slate-500">{labels.roleSource}</dt>
              <dd className="text-xs font-semibold uppercase text-slate-700">{roleDetails.source}</dd>
            </div>
          </dl>
        </section>
      }
      footer={
        isDev ? (
          <details className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <summary className="cursor-pointer text-sm font-semibold text-slate-700">{labels.devAudit}</summary>
            <div className="mt-4">
              <GuardAuditPanel
                locale={localeValue}
                route={`/${localeValue}/roles`}
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
