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

  const checks = [
    { label: t.middlewareAuthCheck, value: middlewareAuthCheck },
    { label: t.middlewareRoleCheck, value: middlewareRoleCheck },
    { label: t.pageAuthCheck, value: pageAuthCheck },
    { label: t.pageRoleCheck, value: pageRoleCheck },
    { label: t.finalAccessDecision, value: finalAccessDecision, allowDeny: true },
  ];

  return (
    <div className="rounded-xl border border-sky-200 bg-gradient-to-b from-sky-50 to-white p-5">
      <h2 className="text-base font-semibold text-sky-900">{t.title}</h2>

      <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
        <div className="rounded-md border border-sky-100 bg-white p-3">
          <dt className="text-xs font-semibold uppercase tracking-wide text-sky-700">{t.route}</dt>
          <dd className="mt-1 text-slate-800">{route}</dd>
        </div>
        <div className="rounded-md border border-sky-100 bg-white p-3">
          <dt className="text-xs font-semibold uppercase tracking-wide text-sky-700">{t.email}</dt>
          <dd className="mt-1 text-slate-800">{email ?? t.na}</dd>
        </div>
        <div className="rounded-md border border-sky-100 bg-white p-3">
          <dt className="text-xs font-semibold uppercase tracking-wide text-sky-700">{t.role}</dt>
          <dd className="mt-1 text-slate-800">{role}</dd>
        </div>
        <div className="rounded-md border border-sky-100 bg-white p-3">
          <dt className="text-xs font-semibold uppercase tracking-wide text-sky-700">{t.roleSource}</dt>
          <dd className="mt-1 text-slate-800">{roleSource}</dd>
        </div>
        <div className="rounded-md border border-sky-100 bg-white p-3 sm:col-span-2">
          <dt className="text-xs font-semibold uppercase tracking-wide text-sky-700">{t.requiredRole}</dt>
          <dd className="mt-1 text-slate-800">{requiredRole}</dd>
        </div>
      </dl>

      <div className="mt-4 space-y-2">
        {checks.map((check) => {
          const passed = check.value;
          const text = check.allowDeny ? (passed ? t.allow : t.deny) : passed ? t.pass : t.fail;

          return (
            <div key={check.label} className="flex items-center justify-between rounded-md border border-sky-100 bg-white px-3 py-2 text-sm">
              <span className="font-medium text-slate-700">{check.label}</span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  passed ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                }`}
              >
                {text}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
