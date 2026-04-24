import { describe, expect, it } from 'vitest';
import { getGuardAuditMessages } from '../guard-audit';

describe('getGuardAuditMessages', () => {
  it('returns English messages for en locale', () => {
    const messages = getGuardAuditMessages('en');

    expect(messages.title).toBe('Guard Audit');
    expect(messages.allow).toBe('allow');
    expect(messages.na).toBe('N/A');
  });

  it('returns Khmer messages for km locale', () => {
    const messages = getGuardAuditMessages('km');

    expect(messages.title).toBe('សេចក្តីពិនិត្យការពារ');
    expect(messages.allow).toBe('អនុញ្ញាត');
    expect(messages.na).toBe('មិនមាន');
  });

  it('contains decision labels', () => {
    const messages = getGuardAuditMessages('en');

    expect(messages.middlewareAuthCheck).toBeTruthy();
    expect(messages.middlewareRoleCheck).toBeTruthy();
    expect(messages.pageAuthCheck).toBeTruthy();
    expect(messages.pageRoleCheck).toBeTruthy();
    expect(messages.finalAccessDecision).toBeTruthy();
  });

  it('matches English snapshot shape', () => {
    expect(getGuardAuditMessages('en')).toMatchInlineSnapshot(`
      {
        "allow": "allow",
        "deny": "deny",
        "email": "Email",
        "fail": "fail",
        "finalAccessDecision": "Final access decision",
        "middlewareAuthCheck": "Middleware auth check",
        "middlewareRoleCheck": "Middleware role check",
        "na": "N/A",
        "pageAuthCheck": "Page auth check",
        "pageRoleCheck": "Page role check",
        "pass": "pass",
        "requiredRole": "Required role",
        "role": "Role",
        "roleSource": "Role source",
        "route": "Route",
        "title": "Guard Audit",
      }
    `);
  });

  it('matches Khmer snapshot shape', () => {
    expect(getGuardAuditMessages('km')).toMatchInlineSnapshot(`
      {
        "allow": "អនុញ្ញាត",
        "deny": "បដិសេធ",
        "email": "អ៊ីមែល",
        "fail": "បរាជ័យ",
        "finalAccessDecision": "សេចក្តីសម្រេចចុងក្រោយ",
        "middlewareAuthCheck": "ការត្រួតពិនិត្យអត្តសញ្ញាណ (Middleware)",
        "middlewareRoleCheck": "ការត្រួតពិនិត្យតួនាទី (Middleware)",
        "na": "មិនមាន",
        "pageAuthCheck": "ការត្រួតពិនិត្យអត្តសញ្ញាណ (ទំព័រ)",
        "pageRoleCheck": "ការត្រួតពិនិត្យតួនាទី (ទំព័រ)",
        "pass": "ឆ្លង",
        "requiredRole": "តួនាទីត្រូវការ",
        "role": "តួនាទី",
        "roleSource": "ប្រភពតួនាទី",
        "route": "ផ្លូវ",
        "title": "សេចក្តីពិនិត្យការពារ",
      }
    `);
  });
});
