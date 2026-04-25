'use client';

import { useState, useTransition } from 'react';

export interface RoleRow {
  id: string;
  name: string;
  permissions: string[];
}

// ── Permission definitions ────────────────────────────────────────────────────

export const PERMISSION_GROUPS = [
  {
    group: 'Dashboard',
    permissions: ['dashboard.view'],
    labels: { 'dashboard.view': 'View Dashboard' },
  },
  {
    group: 'Users',
    permissions: [
      'users.view', 'users.create', 'users.edit', 'users.delete',
      'users.reset_password', 'users.assign_role', 'users.assign_permission',
    ],
    labels: {
      'users.view': 'View Users',
      'users.create': 'Create User',
      'users.edit': 'Edit User',
      'users.delete': 'Delete User',
      'users.reset_password': 'Reset Password',
      'users.assign_role': 'Assign User Role',
      'users.assign_permission': 'Assign Permission',
    },
  },
  {
    group: 'Roles',
    permissions: ['roles.view', 'roles.create', 'roles.edit', 'roles.delete'],
    labels: {
      'roles.view': 'View Roles',
      'roles.create': 'Create Role',
      'roles.edit': 'Edit Role',
      'roles.delete': 'Delete Role',
    },
  },
  {
    group: 'Articles',
    permissions: [
      'articles.view', 'articles.create', 'articles.edit',
      'articles.delete', 'articles.publish',
    ],
    labels: {
      'articles.view': 'View Articles',
      'articles.create': 'Create Article',
      'articles.edit': 'Edit Article',
      'articles.delete': 'Delete Article',
      'articles.publish': 'Publish Article',
    },
  },
  {
    group: 'Settings',
    permissions: ['settings.view', 'settings.manage_languages', 'settings.manage_profile'],
    labels: {
      'settings.view': 'View Settings',
      'settings.manage_languages': 'Manage Languages',
      'settings.manage_profile': 'Manage Company Profile',
    },
  },
  {
    group: 'Profile',
    permissions: ['profile.view', 'profile.edit', 'profile.change_password'],
    labels: {
      'profile.view': 'View Profile',
      'profile.edit': 'Edit Profile',
      'profile.change_password': 'Change Password',
    },
  },
] as const;

const ALL_PERMISSIONS = PERMISSION_GROUPS.flatMap((g) => g.permissions as unknown as string[]);

// ── Confirm Delete ─────────────────────────────────────────────────────────────

interface ConfirmDeleteProps {
  role: RoleRow;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
}

function ConfirmDelete({ role, onCancel, onConfirm }: ConfirmDeleteProps) {
  const [isPending, startTransition] = useTransition();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="mb-2 text-lg font-semibold text-slate-800">Delete Role</h2>
        <p className="mb-5 text-sm text-slate-600">
          Are you sure you want to delete <span className="font-medium">{role.name}</span>? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
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

// ── Role Modal (Add / Edit) ───────────────────────────────────────────────────

interface RoleInlineEditorProps {
  mode: 'add' | 'edit';
  initial?: RoleRow;
  onClose: () => void;
  onSave: (data: { name: string; permissions: string[] }) => Promise<void>;
}

function RoleInlineEditor({ mode, initial, onClose, onSave }: RoleInlineEditorProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [selected, setSelected] = useState<Set<string>>(new Set(initial?.permissions ?? []));
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  function toggle(perm: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(perm) ? next.delete(perm) : next.add(perm);
      return next;
    });
  }

  function toggleGroup(perms: readonly string[]) {
    const all = perms.every((p) => selected.has(p));
    setSelected((prev) => {
      const next = new Set(prev);
      perms.forEach((p) => (all ? next.delete(p) : next.add(p)));
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === ALL_PERMISSIONS.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(ALL_PERMISSIONS));
    }
  }

  function submit() {
    if (!name.trim()) {
      setError('Role name is required.');
      return;
    }
    startTransition(async () => {
      try {
        await onSave({ name: name.trim(), permissions: Array.from(selected) });
        onClose();
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to save role.');
      }
    });
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-6 py-4">
        <h2 className="text-4xl font-semibold text-slate-800">{mode === 'add' ? 'Add Role' : 'Edit Role'}</h2>
      </div>

      <div className="space-y-5 px-6 py-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Role Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError('');
            }}
            disabled={mode === 'edit'}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none disabled:bg-slate-50 disabled:text-slate-400"
            placeholder="e.g. Editor"
          />
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold text-slate-800">Permission</h3>

          <label className="mb-3 flex cursor-pointer items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={selected.size === ALL_PERMISSIONS.length}
              onChange={toggleAll}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600"
            />
            <span>Select All</span>
          </label>

          <div className="space-y-4">
            {PERMISSION_GROUPS.map((group) => {
              const perms = group.permissions as unknown as string[];
              const allChecked = perms.every((p) => selected.has(p));
              const someChecked = perms.some((p) => selected.has(p));
              return (
                <div key={group.group}>
                  <label className="mb-2 flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-800">
                    <input
                      type="checkbox"
                      checked={allChecked}
                      ref={(el) => {
                        if (el) el.indeterminate = someChecked && !allChecked;
                      }}
                      onChange={() => toggleGroup(perms)}
                      className="h-4 w-4 rounded border-slate-300 text-indigo-600"
                    />
                    {group.group}
                  </label>
                  <div className="ml-6 grid grid-cols-1 gap-x-6 gap-y-2 md:grid-cols-3">
                    {perms.map((perm) => (
                      <label key={perm} className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                        <input
                          type="checkbox"
                          checked={selected.has(perm)}
                          onChange={() => toggle(perm)}
                          className="h-4 w-4 rounded border-slate-300 text-indigo-600"
                        />
                        {(group.labels as Record<string, string>)[perm]}
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>

      <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
        <button onClick={onClose} className="rounded-lg bg-red-500 px-5 py-2 text-sm font-medium text-white hover:bg-red-600">
          Cancel
        </button>
        <button
          onClick={submit}
          disabled={isPending}
          className="rounded-lg bg-green-600 px-5 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60"
        >
          {isPending ? 'Saving...' : 'Save'}
        </button>
      </div>
    </section>
  );
}

// ── Main Table ────────────────────────────────────────────────────────────────

interface RolesTableProps {
  initial: RoleRow[];
}

export default function RolesTable({ initial }: RolesTableProps) {
  const [roles, setRoles] = useState<RoleRow[]>(initial);
  const [isAdding, setIsAdding] = useState(false);
  const [editRole, setEditRole] = useState<RoleRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RoleRow | null>(null);

  async function handleAddSave(data: { name: string; permissions: string[] }) {
    const res = await fetch('/api/roles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({})) as { error?: string };
      throw new Error(body.error ?? 'Failed to create role');
    }
    const created = await res.json() as RoleRow;
    setRoles((prev) => [created, ...prev]);
  }

  async function handleEditSave(data: { name: string; permissions: string[] }) {
    const role = editRole;
    if (!role) return;
    const res = await fetch(`/api/roles/${role.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update role');
    const updated = await res.json() as RoleRow;
    setRoles((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    setEditRole(null);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    const res = await fetch(`/api/roles/${deleteTarget.id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete role');
    setRoles((prev) => prev.filter((r) => r.id !== deleteTarget.id));
    setDeleteTarget(null);
  }

  if (editRole) {
    return (
      <>
        <RoleInlineEditor
          key={editRole.id}
          mode="edit"
          initial={editRole}
          onClose={() => setEditRole(null)}
          onSave={handleEditSave}
        />
        {deleteTarget && (
          <ConfirmDelete role={deleteTarget} onCancel={() => setDeleteTarget(null)} onConfirm={handleDelete} />
        )}
      </>
    );
  }

  if (isAdding) {
    return (
      <>
        <RoleInlineEditor mode="add" onClose={() => setIsAdding(false)} onSave={handleAddSave} />
        {deleteTarget && (
          <ConfirmDelete role={deleteTarget} onCancel={() => setDeleteTarget(null)} onConfirm={handleDelete} />
        )}
      </>
    );
  }

  return (
    <>
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between px-6 py-5">
          <h2 className="text-lg font-semibold text-slate-900">Roles</h2>
          <button
            onClick={() => {
              setEditRole(null);
              setIsAdding(true);
            }}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Role
          </button>
        </div>

        <table className="w-full border-t border-slate-200 text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-white">
              <th className="pl-6 pr-2 py-3 font-semibold text-slate-700">Action</th>
              <th className="px-2 py-3 font-semibold text-slate-700">Name</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {roles.length === 0 ? (
              <tr>
                <td colSpan={2} className="px-6 py-10 text-center text-slate-400">No roles found.</td>
              </tr>
            ) : (
              roles.map((role) => (
                <tr key={role.id} className="hover:bg-slate-50/50">
                  <td className="pl-6 pr-2 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setIsAdding(false);
                          setEditRole(role);
                        }}
                        className="flex items-center gap-1.5 rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700"
                      >
                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteTarget(role)}
                        className="flex items-center gap-1.5 rounded-md bg-red-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-600"
                      >
                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14H6L5 6" />
                          <path d="M10 11v6M14 11v6" />
                          <path d="M9 6V4h6v2" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </td>
                  <td className="px-2 py-3 font-medium text-slate-800">{role.name}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      {deleteTarget && (
        <ConfirmDelete role={deleteTarget} onCancel={() => setDeleteTarget(null)} onConfirm={handleDelete} />
      )}
    </>
  );
}
