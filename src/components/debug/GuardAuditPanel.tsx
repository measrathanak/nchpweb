import { Locale } from '@/lib/i18n';
import { getGuardAuditMessages } from '@/lib/i18n/guard-audit';

interface GuardAuditPanelProps {
  locale: Locale;
  route: string;
  email?: string | null;
  role: string;
  roleSource: string;
  requiredRole: string;
  middlewareAuthCheck: boolean;
  middlewareRoleCheck: boolean;
  pageAuthCheck: boolean;
  pageRoleCheck: boolean;
  finalAccessDecision: boolean;
}

export default function GuardAuditPanel({
  locale,
  route,
  email,
  role,
  roleSource,
  requiredRole,
  middlewareAuthCheck,
  middlewareRoleCheck,
  pageAuthCheck,
  pageRoleCheck,
  finalAccessDecision,
}: GuardAuditPanelProps) {
  const t = getGuardAuditMessages(locale);

  return (
    <div className="rounded-lg border border-sky-200 bg-sky-50 p-5 space-y-2">
      <h2 className="text-lg font-semibold text-sky-900">{t.title}</h2>
      <p><span className="font-semibold">{t.route}:</span> {route}</p>
      <p><span className="font-semibold">{t.email}:</span> {email ?? t.na}</p>
      <p><span className="font-semibold">{t.role}:</span> {role}</p>
      <p><span className="font-semibold">{t.roleSource}:</span> {roleSource}</p>
      <p><span className="font-semibold">{t.requiredRole}:</span> {requiredRole}</p>
      <p><span className="font-semibold">{t.middlewareAuthCheck}:</span> {middlewareAuthCheck ? t.pass : t.fail}</p>
      <p><span className="font-semibold">{t.middlewareRoleCheck}:</span> {middlewareRoleCheck ? t.pass : t.fail}</p>
      <p><span className="font-semibold">{t.pageAuthCheck}:</span> {pageAuthCheck ? t.pass : t.fail}</p>
      <p><span className="font-semibold">{t.pageRoleCheck}:</span> {pageRoleCheck ? t.pass : t.fail}</p>
      <p><span className="font-semibold">{t.finalAccessDecision}:</span> {finalAccessDecision ? t.allow : t.deny}</p>
    </div>
  );
}
