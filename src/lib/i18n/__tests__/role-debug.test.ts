import { describe, expect, it } from 'vitest';
import { getRoleDebugMessages } from '../role-debug';

describe('getRoleDebugMessages', () => {
  it('returns English messages for en locale', () => {
    const messages = getRoleDebugMessages('en');

    expect(messages.title).toBe('Role Debug');
    expect(messages.allowed).toBe('allowed');
    expect(messages.na).toBe('N/A');
  });

  it('returns Khmer messages for km locale', () => {
    const messages = getRoleDebugMessages('km');

    expect(messages.title).toBe('ពិនិត្យតួនាទី');
    expect(messages.allowed).toBe('អនុញ្ញាត');
    expect(messages.na).toBe('មិនមាន');
  });

  it('contains key simulation labels', () => {
    const messages = getRoleDebugMessages('en');

    expect(messages.simulateUser).toBeTruthy();
    expect(messages.simulateEditor).toBeTruthy();
    expect(messages.simulateAdmin).toBeTruthy();
    expect(messages.copyCurrentLink).toBeTruthy();
  });

  it('matches English snapshot shape', () => {
    expect(getRoleDebugMessages('en')).toMatchInlineSnapshot(`
      {
        "actualRole": "Actual role",
        "actualSource": "Actual source",
        "allowed": "allowed",
        "copied": "Link copied",
        "copyCurrentLink": "Copy current link",
        "denied": "denied",
        "devOnlySimulation": "Dev-only simulation. This does not change your real permissions.",
        "email": "Email",
        "na": "N/A",
        "openInNewTab": "Open in new tab",
        "role": "Role",
        "simulateAdmin": "Simulate admin",
        "simulateEditor": "Simulate editor",
        "simulateUser": "Simulate user",
        "source": "Source",
        "subtitle": "Inspect role resolution and your route access permissions",
        "tableAccess": "Access",
        "tableRequiredRole": "Required Role",
        "tableRoute": "Route",
        "title": "Role Debug",
        "useActualRole": "Use actual role",
      }
    `);
  });

  it('matches Khmer snapshot shape', () => {
    expect(getRoleDebugMessages('km')).toMatchInlineSnapshot(`
      {
        "actualRole": "តួនាទីពិត",
        "actualSource": "ប្រភពពិត",
        "allowed": "អនុញ្ញាត",
        "copied": "បានចម្លងតំណ",
        "copyCurrentLink": "ចម្លងតំណបច្ចុប្បន្ន",
        "denied": "បដិសេធ",
        "devOnlySimulation": "ជម្រើសនេះសម្រាប់ការអភិវឌ្ឍន៍ប៉ុណ្ណោះ។ វាមិនប្ដូរសិទ្ធិពិតប្រាកដរបស់អ្នកទេ។",
        "email": "អ៊ីមែល",
        "na": "មិនមាន",
        "openInNewTab": "បើកផ្ទាំងថ្មី",
        "role": "តួនាទី",
        "simulateAdmin": "សាកល្បងជា admin",
        "simulateEditor": "សាកល្បងជា editor",
        "simulateUser": "សាកល្បងជា user",
        "source": "ប្រភព",
        "subtitle": "មើលលទ្ធផលតួនាទី និងសិទ្ធិចូលប្រើរបស់អ្នក",
        "tableAccess": "សិទ្ធិចូលប្រើ",
        "tableRequiredRole": "តួនាទីត្រូវការ",
        "tableRoute": "ផ្លូវ",
        "title": "ពិនិត្យតួនាទី",
        "useActualRole": "ប្រើតួនាទីពិត",
      }
    `);
  });
});
