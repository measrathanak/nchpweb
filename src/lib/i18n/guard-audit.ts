import { Locale } from '@/lib/i18n';

export interface GuardAuditMessages {
  title: string;
  route: string;
  email: string;
  role: string;
  roleSource: string;
  requiredRole: string;
  middlewareAuthCheck: string;
  middlewareRoleCheck: string;
  pageAuthCheck: string;
  pageRoleCheck: string;
  finalAccessDecision: string;
  pass: string;
  fail: string;
  allow: string;
  deny: string;
  na: string;
}

const guardAuditMessages: Record<Locale, GuardAuditMessages> = {
  en: {
    title: 'Guard Audit',
    route: 'Route',
    email: 'Email',
    role: 'Role',
    roleSource: 'Role source',
    requiredRole: 'Required role',
    middlewareAuthCheck: 'Middleware auth check',
    middlewareRoleCheck: 'Middleware role check',
    pageAuthCheck: 'Page auth check',
    pageRoleCheck: 'Page role check',
    finalAccessDecision: 'Final access decision',
    pass: 'pass',
    fail: 'fail',
    allow: 'allow',
    deny: 'deny',
    na: 'N/A',
  },
  km: {
    title: 'សេចក្តីពិនិត្យការពារ',
    route: 'ផ្លូវ',
    email: 'អ៊ីមែល',
    role: 'តួនាទី',
    roleSource: 'ប្រភពតួនាទី',
    requiredRole: 'តួនាទីត្រូវការ',
    middlewareAuthCheck: 'ការត្រួតពិនិត្យអត្តសញ្ញាណ (Middleware)',
    middlewareRoleCheck: 'ការត្រួតពិនិត្យតួនាទី (Middleware)',
    pageAuthCheck: 'ការត្រួតពិនិត្យអត្តសញ្ញាណ (ទំព័រ)',
    pageRoleCheck: 'ការត្រួតពិនិត្យតួនាទី (ទំព័រ)',
    finalAccessDecision: 'សេចក្តីសម្រេចចុងក្រោយ',
    pass: 'ឆ្លង',
    fail: 'បរាជ័យ',
    allow: 'អនុញ្ញាត',
    deny: 'បដិសេធ',
    na: 'មិនមាន',
  },
};

export function getGuardAuditMessages(locale: Locale): GuardAuditMessages {
  return guardAuditMessages[locale] ?? guardAuditMessages.en;
}
