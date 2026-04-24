/**
 * Role helper based on email allowlist.
 * Configure admins with ADMIN_EMAILS="a@example.com,b@example.com".
 */

export type AppRole = 'user' | 'editor' | 'admin';

const roleRank: Record<AppRole, number> = {
  user: 1,
  editor: 2,
  admin: 3,
};

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function getAdminEmails() {
  const raw = process.env.ADMIN_EMAILS ?? '';
  if (!raw.trim()) return [] as string[];

  return raw
    .split(',')
    .map(normalizeEmail)
    .filter(Boolean);
}

export function getEditorEmails() {
  const raw = process.env.EDITOR_EMAILS ?? '';
  if (!raw.trim()) return [] as string[];

  return raw
    .split(',')
    .map(normalizeEmail)
    .filter(Boolean);
}

export function isAdminEmail(email?: string | null) {
  if (!email) return false;
  const admins = getAdminEmails();
  return admins.includes(normalizeEmail(email));
}

export function isEditorEmail(email?: string | null) {
  if (!email) return false;
  const editors = getEditorEmails();
  return editors.includes(normalizeEmail(email));
}

export function getUserRole(email?: string | null): AppRole {
  if (isAdminEmail(email)) return 'admin';
  if (isEditorEmail(email)) return 'editor';
  return 'user';
}

export function getRoleDetails(email?: string | null) {
  if (!email) {
    return {
      role: 'user' as AppRole,
      source: 'no-email',
      normalizedEmail: null as string | null,
    };
  }

  const normalizedEmail = normalizeEmail(email);
  if (isAdminEmail(normalizedEmail)) {
    return {
      role: 'admin' as AppRole,
      source: 'ADMIN_EMAILS',
      normalizedEmail,
    };
  }

  if (isEditorEmail(normalizedEmail)) {
    return {
      role: 'editor' as AppRole,
      source: 'EDITOR_EMAILS',
      normalizedEmail,
    };
  }

  return {
    role: 'user' as AppRole,
    source: 'default-user',
    normalizedEmail,
  };
}

export function hasRoleAccess(userRole: AppRole, requiredRole: AppRole) {
  return roleRank[userRole] >= roleRank[requiredRole];
}
