import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Locale } from '@/lib/i18n';
import { auth } from '@/auth';
import { AppRole, getRoleDetails, hasRoleAccess } from '@/lib/auth/roles';
import { protectedRouteRolePolicy } from '@/lib/auth/protected-routes';
import CopyRoleDebugLinkButton from '@/components/debug/CopyRoleDebugLinkButton';
import GuardAuditPanel from '@/components/debug/GuardAuditPanel';
import ManagementPageShell from '@/components/layout/ManagementPageShell';
import { getRoleDebugMessages } from '@/lib/i18n/role-debug';

interface RoleDebugPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ as?: string }>;
}

function toSimulatedRole(value?: string): AppRole | null {
  if (value === 'user' || value === 'editor' || value === 'admin') {
    return value;
  }

  return null;
}

export default async function RoleDebugPage({ params, searchParams }: RoleDebugPageProps) {
  const { locale } = await params;
  const query = await searchParams;
  const localeValue = locale as Locale;
  const session = await auth();

  if (!session?.user?.email) {
    redirect(`/${localeValue}/auth/signin`);
  }

  const isDev = process.env.NODE_ENV !== 'production';
  const details = getRoleDetails(session.user.email);
  const simulatedRole = isDev ? toSimulatedRole(query.as) : null;
  const effectiveRole = simulatedRole ?? details.role;
  const effectiveSource = simulatedRole ? `simulated:${simulatedRole}` : details.source;
  const entries = Object.entries(protectedRouteRolePolicy);
  const roleDebugRequiredRole = protectedRouteRolePolicy['role-debug'];

  const middlewareAuthCheck = true;
  const middlewareRoleCheck = hasRoleAccess(effectiveRole, roleDebugRequiredRole);
  const pageAuthCheck = true;
  const pageRoleCheck = hasRoleAccess(effectiveRole, roleDebugRequiredRole);
  const finalAccessDecision = middlewareAuthCheck && middlewareRoleCheck && pageAuthCheck && pageRoleCheck;
  const t = getRoleDebugMessages(localeValue);

  return (
    <ManagementPageShell
      title="Role Debug"
      subtitle="Inspect role resolution and access decisions for protected routes."
      main={
        <div className="space-y-6">
          {isDev ? (
            <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
              <p className="text-sm text-amber-900">{t.devOnlySimulation}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href={`/${localeValue}/role-debug?as=user`}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm hover:bg-slate-50"
                >
                  {t.simulateUser}
                </Link>
                <Link
                  href={`/${localeValue}/role-debug?as=editor`}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm hover:bg-slate-50"
                >
                  {t.simulateEditor}
                </Link>
                <Link
                  href={`/${localeValue}/role-debug?as=admin`}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm hover:bg-slate-50"
                >
                  {t.simulateAdmin}
                </Link>
                <Link
                  href={`/${localeValue}/role-debug`}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm hover:bg-slate-50"
                >
                  {t.useActualRole}
                </Link>
                <CopyRoleDebugLinkButton
                  locale={localeValue}
                  labels={{
                    copyCurrentLink: t.copyCurrentLink,
                    copied: t.copied,
                    openInNewTab: t.openInNewTab,
                  }}
                />
              </div>
            </section>
          ) : null}

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">{t.tableRoute}</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">{t.tableRequiredRole}</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">{t.tableAccess}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {entries.map(([slug, requiredRole]) => {
                  const allowed = hasRoleAccess(effectiveRole, requiredRole);
                  return (
                    <tr key={slug}>
                      <td className="px-4 py-3 text-slate-700">/{localeValue}/{slug}</td>
                      <td className="px-4 py-3 text-slate-700">{requiredRole}</td>
                      <td className="px-4 py-3">
                        <span className={allowed ? 'text-emerald-700' : 'text-rose-700'}>
                          {allowed ? t.allowed : t.denied}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>
        </div>
      }
      aside={
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Role snapshot</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-slate-500">{t.email}</dt>
              <dd className="text-right font-medium text-slate-900">{details.normalizedEmail ?? t.na}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-slate-500">{t.role}</dt>
              <dd className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold uppercase text-indigo-700">{effectiveRole}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-slate-500">{t.source}</dt>
              <dd className="text-xs font-semibold uppercase text-slate-700">{effectiveSource}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-slate-500">{t.actualRole}</dt>
              <dd className="font-medium text-slate-900">{details.role}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-slate-500">{t.actualSource}</dt>
              <dd className="text-xs font-semibold uppercase text-slate-700">{details.source}</dd>
            </div>
          </dl>
        </section>
      }
      footer={
        isDev ? (
          <details className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <summary className="cursor-pointer text-sm font-semibold text-slate-700">Guard audit (Dev only)</summary>
            <div className="mt-4">
              <GuardAuditPanel
                locale={localeValue}
                route={`/${localeValue}/role-debug`}
                email={details.normalizedEmail}
                role={effectiveRole}
                roleSource={effectiveSource}
                requiredRole={roleDebugRequiredRole}
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
