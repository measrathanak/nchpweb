import { Locale } from '@/lib/i18n';

export interface RoleDebugMessages {
  title: string;
  subtitle: string;
  email: string;
  role: string;
  source: string;
  devOnlySimulation: string;
  simulateUser: string;
  simulateEditor: string;
  simulateAdmin: string;
  useActualRole: string;
  copyCurrentLink: string;
  copied: string;
  openInNewTab: string;
  actualRole: string;
  actualSource: string;
  tableRoute: string;
  tableRequiredRole: string;
  tableAccess: string;
  allowed: string;
  denied: string;
  na: string;
}

const roleDebugMessages: Record<Locale, RoleDebugMessages> = {
  en: {
    title: 'Role Debug',
    subtitle: 'Inspect role resolution and your route access permissions',
    email: 'Email',
    role: 'Role',
    source: 'Source',
    devOnlySimulation: 'Dev-only simulation. This does not change your real permissions.',
    simulateUser: 'Simulate user',
    simulateEditor: 'Simulate editor',
    simulateAdmin: 'Simulate admin',
    useActualRole: 'Use actual role',
    copyCurrentLink: 'Copy current link',
    copied: 'Link copied',
    openInNewTab: 'Open in new tab',
    actualRole: 'Actual role',
    actualSource: 'Actual source',
    tableRoute: 'Route',
    tableRequiredRole: 'Required Role',
    tableAccess: 'Access',
    allowed: 'allowed',
    denied: 'denied',
    na: 'N/A',
  },
  km: {
    title: 'ពិនិត្យតួនាទី',
    subtitle: 'មើលលទ្ធផលតួនាទី និងសិទ្ធិចូលប្រើរបស់អ្នក',
    email: 'អ៊ីមែល',
    role: 'តួនាទី',
    source: 'ប្រភព',
    devOnlySimulation: 'ជម្រើសនេះសម្រាប់ការអភិវឌ្ឍន៍ប៉ុណ្ណោះ។ វាមិនប្ដូរសិទ្ធិពិតប្រាកដរបស់អ្នកទេ។',
    simulateUser: 'សាកល្បងជា user',
    simulateEditor: 'សាកល្បងជា editor',
    simulateAdmin: 'សាកល្បងជា admin',
    useActualRole: 'ប្រើតួនាទីពិត',
    copyCurrentLink: 'ចម្លងតំណបច្ចុប្បន្ន',
    copied: 'បានចម្លងតំណ',
    openInNewTab: 'បើកផ្ទាំងថ្មី',
    actualRole: 'តួនាទីពិត',
    actualSource: 'ប្រភពពិត',
    tableRoute: 'ផ្លូវ',
    tableRequiredRole: 'តួនាទីត្រូវការ',
    tableAccess: 'សិទ្ធិចូលប្រើ',
    allowed: 'អនុញ្ញាត',
    denied: 'បដិសេធ',
    na: 'មិនមាន',
  },
};

export function getRoleDebugMessages(locale: Locale): RoleDebugMessages {
  return roleDebugMessages[locale] ?? roleDebugMessages.en;
}
