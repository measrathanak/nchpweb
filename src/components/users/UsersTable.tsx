'use client';

import { useState, useRef, useEffect, useTransition } from 'react';

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
}

function ActionMenu({ user, onEdit, onDelete }: ActionMenuProps) {
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
            onClick={() => { setOpen(false); onEdit(user); }}
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
            onClick={() => { setOpen(false); onEdit(user); }}
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

interface UsersTableProps {
  initial: UserRow[];
}

export default function UsersTable({ initial }: UsersTableProps) {
  const [users, setUsers] = useState<UserRow[]>(initial);
  const [modal, setModal] = useState<{ type: 'add' | 'edit'; user?: UserRow } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserRow | null>(null);

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

  return (
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
    </>
  );
}
