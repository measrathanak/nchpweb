'use client';

import { useState, useRef, useEffect, useTransition, useMemo } from 'react';

export interface UserRow {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
}

interface ActionMenuProps {
  user: UserRow;
  onEdit: (user: UserRow) => void;
  onDelete: (user: UserRow) => void;
  onPermission: (user: UserRow) => void;
  onResetPassword: (user: UserRow) => void;
}

function ActionMenu({ user, onEdit, onDelete, onPermission, onResetPassword }: ActionMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700"
        aria-label="Actions"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
          <circle cx="12" cy="5" r="1.5" />
          <circle cx="12" cy="12" r="1.5" />
          <circle cx="12" cy="19" r="1.5" />
        </svg>
      </button>
      {open && (
        <div className="absolute left-0 top-9 z-10 min-w-[190px] rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
          <button
            className="flex w-full items-center gap-2 whitespace-nowrap px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            onClick={() => { setOpen(false); onEdit(user); }}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Edit
          </button>
          <button
            className="flex w-full items-center gap-2 whitespace-nowrap px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            onClick={() => { setOpen(false); onDelete(user); }}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14H6L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4h6v2" />
            </svg>
            Delete
          </button>
          <button
            className="flex w-full items-center gap-2 whitespace-nowrap px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            onClick={() => { setOpen(false); onPermission(user); }}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="9" cy="8" r="2.5" />
              <path d="M3.5 18c0-2.3 2.4-4 5.5-4s5.5 1.7 5.5 4" />
              <path d="M15 8h6" />
              <path d="M18 5v6" />
            </svg>
            Permission
          </button>
          <button
            className="flex w-full items-center gap-2 whitespace-nowrap px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            onClick={() => { setOpen(false); onResetPassword(user); }}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="7.5" cy="12" r="2.5" />
              <path d="M10 12h10" />
              <path d="M16 9l4 3-4 3" />
            </svg>
            Reset Password
          </button>
        </div>
      )}
    </div>
  );
}

interface UserModalProps {
  mode: 'add' | 'edit';
  initial?: UserRow;
  onClose: () => void;
  onSave: (data: { email: string; firstName: string; lastName: string; phone: string; password?: string }) => Promise<void>;
}

function UserModal({ mode, initial, onClose, onSave }: UserModalProps) {
  const [form, setForm] = useState({
    email: initial?.email ?? '',
    firstName: initial?.firstName ?? '',
    lastName: initial?.lastName ?? '',
    phone: initial?.phone ?? '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  function handleChange(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError('');
  }

  function submit() {
    if (!form.email.trim() || !form.email.includes('@')) {
      setError('A valid email is required.');
      return;
    }
    startTransition(async () => {
      try {
        await onSave({
          email: form.email.trim(),
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          phone: form.phone.trim(),
          ...(form.password ? { password: form.password } : {}),
        });
        onClose();
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to save user.');
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="mb-5 text-lg font-semibold text-slate-800">
          {mode === 'add' ? 'Add User' : 'Edit User'}
        </h2>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              disabled={mode === 'edit'}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none disabled:bg-slate-50 disabled:text-slate-400"
              placeholder="user@example.com"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">First Name</label>
              <input
                type="text"
                value={form.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none"
                placeholder="First name"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Last Name</label>
              <input
                type="text"
                value={form.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none"
                placeholder="Last name"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Mobile Number</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none"
              placeholder="012 345 678"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              {mode === 'add' ? 'Password' : 'New Password (leave blank to keep)'}
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => handleChange('password', e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none"
              placeholder={mode === 'add' ? 'Password' : 'Leave blank to keep current'}
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={isPending}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {isPending ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

interface ConfirmDeleteProps {
  user: UserRow;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
}

function ConfirmDelete({ user, onCancel, onConfirm }: ConfirmDeleteProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="mb-2 text-lg font-semibold text-slate-800">Delete User</h2>
        <p className="mb-5 text-sm text-slate-600">
          Are you sure you want to delete <span className="font-medium">{user.email}</span>? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            disabled={isPending}
            onClick={() => startTransition(async () => { await onConfirm(); })}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
          >
            {isPending ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

interface PermissionModalProps {
  user: UserRow;
  onClose: () => void;
  onSave: (permissions: string[]) => Promise<void>;
}

interface PermissionGroup {
  title: string;
  permissions: { code: string; label: string }[];
}

function PermissionModal({ user, onClose, onSave }: PermissionModalProps) {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  const permissionGroups: PermissionGroup[] = [
    {
      title: 'Dashboard',
      permissions: [{ code: 'dashboard.view', label: 'View Dashboard' }],
    },
    {
      title: 'Users',
      permissions: [
        { code: 'users.view', label: 'View Users' },
        { code: 'users.create', label: 'Create User' },
        { code: 'users.edit', label: 'Edit User' },
        { code: 'users.delete', label: 'Delete User' },
        { code: 'users.reset_password', label: 'Reset Password' },
        { code: 'users.assign_role', label: 'Assign User Role' },
        { code: 'users.assign_permission', label: 'Assign Permission' },
      ],
    },
    {
      title: 'Roles',
      permissions: [
        { code: 'roles.view', label: 'View Roles' },
        { code: 'roles.create', label: 'Create Role' },
        { code: 'roles.edit', label: 'Edit Role' },
        { code: 'roles.delete', label: 'Delete Role' },
      ],
    },
    {
      title: 'Articles',
      permissions: [
        { code: 'articles.view', label: 'View Articles' },
        { code: 'articles.create', label: 'Create Article' },
        { code: 'articles.edit', label: 'Edit Article' },
        { code: 'articles.delete', label: 'Delete Article' },
        { code: 'articles.publish', label: 'Publish Article' },
      ],
    },
    {
      title: 'Settings',
      permissions: [
        { code: 'settings.view', label: 'View Settings' },
        { code: 'settings.manage_languages', label: 'Manage Languages' },
        { code: 'settings.manage_profile', label: 'Manage Company Profile' },
      ],
    },
  ];

  const allPermissionCodes = useMemo(
    () => permissionGroups.flatMap((group) => group.permissions.map((permission) => permission.code)),
    [permissionGroups]
  );
  const allSelected = allPermissionCodes.length > 0 && allPermissionCodes.every((code) => permissions.includes(code));

  function togglePermission(perm: string) {
    setPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  }

  function toggleSelectAll() {
    if (allSelected) {
      setPermissions([]);
    } else {
      setPermissions(allPermissionCodes);
    }
  }

  function getGroupCodes(group: PermissionGroup) {
    return group.permissions.map((permission) => permission.code);
  }

  function isGroupAllSelected(group: PermissionGroup) {
    const groupCodes = getGroupCodes(group);
    return groupCodes.length > 0 && groupCodes.every((code) => permissions.includes(code));
  }

  function isGroupPartiallySelected(group: PermissionGroup) {
    const groupCodes = getGroupCodes(group);
    const selectedCount = groupCodes.filter((code) => permissions.includes(code)).length;
    return selectedCount > 0 && selectedCount < groupCodes.length;
  }

  function toggleGroup(group: PermissionGroup) {
    const groupCodes = getGroupCodes(group);
    const shouldSelectAll = !isGroupAllSelected(group);
    setPermissions((prev) => {
      if (shouldSelectAll) {
        return Array.from(new Set([...prev, ...groupCodes]));
      }
      return prev.filter((code) => !groupCodes.includes(code));
    });
  }

  function submit() {
    startTransition(async () => {
      try {
        await onSave(permissions);
        onClose();
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to save permissions.');
      }
    });
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="border-b border-slate-200 p-6 flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">User Page Permission To</h2>
          <p className="text-sm text-indigo-600 font-medium mt-1">{user.email}</p>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="px-6 pb-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Select All Checkbox */}
        <div className="mb-6 p-4 border border-slate-200 rounded-lg bg-slate-50">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleSelectAll}
              className="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="font-semibold text-slate-900">Select All</span>
          </label>
        </div>

        <div className="space-y-6">
          {permissionGroups.map((group) => (
            <div key={group.title} className="border border-slate-200 rounded-lg p-4">
              <label className="mb-4 flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isGroupAllSelected(group)}
                  ref={(input) => {
                    if (input) {
                      input.indeterminate = isGroupPartiallySelected(group);
                    }
                  }}
                  onChange={() => toggleGroup(group)}
                  className="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="font-semibold text-slate-900">{group.title}</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {group.permissions.map((perm) => (
                  <label
                    key={perm.code}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer border border-slate-100"
                  >
                    <input
                      type="checkbox"
                      checked={permissions.includes(perm.code)}
                      onChange={() => togglePermission(perm.code)}
                      className="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-slate-700">{perm.label}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-200 bg-white p-6 flex justify-end gap-3">
        <button
          onClick={onClose}
          className="px-6 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50"
        >
          CANCEL
        </button>
        <button
          onClick={submit}
          disabled={isPending}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-60"
        >
          {isPending ? 'Saving…' : 'SAVE'}
        </button>
      </div>
    </div>
  );
}

interface ResetPasswordModalProps {
  user: UserRow;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

function ResetPasswordModal({ user, onClose, onConfirm }: ResetPasswordModalProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="mb-2 text-lg font-semibold text-slate-800">Reset Password</h2>
        <p className="mb-5 text-sm text-slate-600">
          Are you sure you want to reset the password for <span className="font-medium">{user.email}</span>? A temporary password will be generated.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            disabled={isPending}
            onClick={() => startTransition(async () => { await onConfirm(); })}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {isPending ? 'Resetting…' : 'Reset Password'}
          </button>
        </div>
      </div>
    </div>
  );
}

interface UsersTableProps {
  initial: UserRow[];
}

export default function UsersTable({ initial }: UsersTableProps) {
  const [users, setUsers] = useState<UserRow[]>(initial);
  const [modal, setModal] = useState<{ type: 'add' | 'edit'; user?: UserRow } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserRow | null>(null);
  const [permissionTarget, setPermissionTarget] = useState<UserRow | null>(null);
  const [resetPasswordTarget, setResetPasswordTarget] = useState<UserRow | null>(null);

  async function handleAddSave(data: { email: string; firstName: string; lastName: string; phone: string; password?: string }) {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error((body as { error?: string }).error ?? 'Failed to create user');
    }
    const created = await res.json() as UserRow;
    setUsers((prev) => [created, ...prev]);
  }

  async function handleEditSave(data: { email: string; firstName: string; lastName: string; phone: string; password?: string }) {
    const user = modal?.user;
    if (!user) return;
    const res = await fetch(`/api/users/${user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update user');
    const updated = await res.json() as UserRow;
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    const res = await fetch(`/api/users/${deleteTarget.id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete user');
    setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
    setDeleteTarget(null);
  }

  async function handlePermissionSave(permissions: string[]) {
    if (!permissionTarget) return;
    const res = await fetch(`/api/users/${permissionTarget.id}/permissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ permissions }),
    });
    if (!res.ok) throw new Error('Failed to save permissions');
    setPermissionTarget(null);
  }

  async function handleResetPassword() {
    if (!resetPasswordTarget) return;
    const res = await fetch(`/api/users/${resetPasswordTarget.id}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to reset password');
    setResetPasswordTarget(null);
  }

  return (
    <>
      {!permissionTarget ? (
        <>
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between px-4 py-5">
              <h2 className="text-lg font-semibold text-slate-900">Users</h2>
              <button
                onClick={() => setModal({ type: 'add' })}
                className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add User
              </button>
            </div>

            <table className="w-full border-t border-slate-200 text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-white">
                  <th className="pl-4 pr-2 py-3 font-semibold text-slate-700">Action</th>
                  <th className="px-2 py-3 font-semibold text-slate-700">Email</th>
                  <th className="px-2 py-3 font-semibold text-slate-700">First Name</th>
                  <th className="px-2 py-3 font-semibold text-slate-700">Last Name</th>
                  <th className="pl-2 pr-4 py-3 font-semibold text-slate-700">Mobile Number</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-slate-400">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/50">
                      <td className="pl-4 pr-2 py-3">
                        <ActionMenu
                          user={user}
                          onEdit={(u) => setModal({ type: 'edit', user: u })}
                          onDelete={(u) => setDeleteTarget(u)}
                          onPermission={(u) => setPermissionTarget(u)}
                          onResetPassword={(u) => setResetPasswordTarget(u)}
                        />
                      </td>
                      <td className="px-2 py-3 text-slate-700">{user.email}</td>
                      <td className="px-2 py-3 text-slate-700">{user.firstName ?? '—'}</td>
                      <td className="px-2 py-3 text-slate-700">{user.lastName ?? '—'}</td>
                      <td className="pl-2 pr-4 py-3 text-slate-700">{user.phone ?? '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </section>

          {modal?.type === 'add' && (
            <UserModal mode="add" onClose={() => setModal(null)} onSave={handleAddSave} />
          )}
          {modal?.type === 'edit' && modal.user && (
            <UserModal mode="edit" initial={modal.user} onClose={() => setModal(null)} onSave={handleEditSave} />
          )}
          {deleteTarget && (
            <ConfirmDelete user={deleteTarget} onCancel={() => setDeleteTarget(null)} onConfirm={handleDelete} />
          )}
          {resetPasswordTarget && (
            <ResetPasswordModal user={resetPasswordTarget} onClose={() => setResetPasswordTarget(null)} onConfirm={handleResetPassword} />
          )}
        </>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          {permissionTarget && (
            <PermissionModal user={permissionTarget} onClose={() => setPermissionTarget(null)} onSave={handlePermissionSave} />
          )}
        </div>
      )}
    </>
  );
}
