import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Locale } from '@/lib/i18n';
import { auth } from '@/auth';
import { AppRole, getRoleDetails, hasRoleAccess } from '@/lib/auth/roles';
import { protectedRouteRolePolicy } from '@/lib/auth/protected-routes';
import CopyRoleDebugLinkButton from '@/components/debug/CopyRoleDebugLinkButton';
import GuardAuditPanel from '@/components/debug/GuardAuditPanel';
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
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 p-5 space-y-2">
        <p><span className="font-semibold">{t.email}:</span> {details.normalizedEmail ?? t.na}</p>
        <p><span className="font-semibold">{t.role}:</span> {effectiveRole}</p>
        <p><span className="font-semibold">{t.source}:</span> {effectiveSource}</p>
      </div>

      {isDev ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-5 space-y-3">
          <p className="text-sm text-amber-900">{t.devOnlySimulation}</p>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/${localeValue}/role-debug?as=user`}
              className="px-3 py-1 rounded border border-gray-300 bg-white hover:bg-gray-100"
            >
              {t.simulateUser}
            </Link>
            <Link
              href={`/${localeValue}/role-debug?as=editor`}
              className="px-3 py-1 rounded border border-gray-300 bg-white hover:bg-gray-100"
            >
              {t.simulateEditor}
            </Link>
            <Link
              href={`/${localeValue}/role-debug?as=admin`}
              className="px-3 py-1 rounded border border-gray-300 bg-white hover:bg-gray-100"
            >
              {t.simulateAdmin}
            </Link>
            <Link
              href={`/${localeValue}/role-debug`}
              className="px-3 py-1 rounded border border-gray-300 bg-white hover:bg-gray-100"
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
        </div>
      ) : null}

      <div className="rounded-lg border border-gray-200 p-5 space-y-2">
        <p><span className="font-semibold">{t.actualRole}:</span> {details.role}</p>
        <p><span className="font-semibold">{t.actualSource}:</span> {details.source}</p>
      </div>

      {isDev ? (
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
      ) : null}

      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3">{t.tableRoute}</th>
              <th className="text-left px-4 py-3">{t.tableRequiredRole}</th>
              <th className="text-left px-4 py-3">{t.tableAccess}</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(([slug, requiredRole]) => {
              const allowed = hasRoleAccess(effectiveRole, requiredRole);
              return (
                <tr key={slug} className="border-t border-gray-200">
                  <td className="px-4 py-3">/{localeValue}/{slug}</td>
                  <td className="px-4 py-3">{requiredRole}</td>
                  <td className="px-4 py-3">
                    <span className={allowed ? 'text-green-700' : 'text-red-700'}>
                      {allowed ? t.allowed : t.denied}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
