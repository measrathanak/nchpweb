'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export interface RoleRow {
  id: string;
  name: string;
}

export interface UserRow {
  id: string;
  email: string;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
}

interface Props {
  roles: RoleRow[];
  users: UserRow[];
}

function displayName(u: UserRow): string {
  const full = [u.firstName, u.lastName].filter(Boolean).join(' ');
  return full || u.name || u.email;
}

function UserCard({
  user,
  onDragStart,
  dragging,
}: {
  user: UserRow;
  onDragStart: (id: string) => void;
  dragging: boolean;
}) {
  return (
    <div
      draggable
      onDragStart={() => onDragStart(user.id)}
      className={`cursor-grab select-none rounded-lg border px-4 py-3 text-sm transition-all active:cursor-grabbing
        ${dragging ? 'opacity-40 ring-2 ring-indigo-400' : 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow-sm'}`}
    >
      <p className="font-medium text-slate-800">{displayName(user)}</p>
      <p className="mt-0.5 text-xs text-slate-400">{user.email}</p>
    </div>
  );
}

export default function RoleUserPanel({ roles, users }: Props) {
  const [selectedRoleId, setSelectedRoleId] = useState<string>(roles[0]?.id ?? '');
  // Maps roleId → Set of userIds assigned to that role
  const [assignedMap, setAssignedMap] = useState<Record<string, Set<string>>>({});
  const [loadingRole, setLoadingRole] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [overPanel, setOverPanel] = useState<'role' | 'all' | null>(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (msg: string, ok = true) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ msg, ok });
    toastTimer.current = setTimeout(() => setToast(null), 2500);
  };

  const loadAssignments = useCallback(async (roleId: string) => {
    if (!roleId || assignedMap[roleId] !== undefined) return;
    setLoadingRole(true);
    try {
      const res = await fetch(`/api/role-users?roleId=${roleId}`);
      if (!res.ok) throw new Error('Failed to load');
      const data = (await res.json()) as { userIds: string[] };
      setAssignedMap((prev) => ({ ...prev, [roleId]: new Set(data.userIds) }));
    } catch {
      showToast('Failed to load role users', false);
    } finally {
      setLoadingRole(false);
    }
  }, [assignedMap]);

  useEffect(() => {
    if (selectedRoleId) loadAssignments(selectedRoleId);
  }, [selectedRoleId, loadAssignments]);

  const assigned: Set<string> = assignedMap[selectedRoleId] ?? new Set();
  const roleUsers = users.filter((u) => assigned.has(u.id));
  const allUsers = users.filter((u) => !assigned.has(u.id));

  const assign = async (userId: string) => {
    if (busy || assigned.has(userId)) return;
    setBusy(true);
    const optimistic = new Set(assigned);
    optimistic.add(userId);
    setAssignedMap((prev) => ({ ...prev, [selectedRoleId]: optimistic }));
    try {
      const res = await fetch('/api/role-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, roleId: selectedRoleId }),
      });
      if (!res.ok) throw new Error('Failed');
      showToast('User added to role');
    } catch {
      // rollback
      const rolled = new Set(assigned);
      setAssignedMap((prev) => ({ ...prev, [selectedRoleId]: rolled }));
      showToast('Failed to add user', false);
    } finally {
      setBusy(false);
    }
  };

  const unassign = async (userId: string) => {
    if (busy || !assigned.has(userId)) return;
    setBusy(true);
    const optimistic = new Set(assigned);
    optimistic.delete(userId);
    setAssignedMap((prev) => ({ ...prev, [selectedRoleId]: optimistic }));
    try {
      const res = await fetch('/api/role-users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, roleId: selectedRoleId }),
      });
      if (!res.ok) throw new Error('Failed');
      showToast('User removed from role');
    } catch {
      // rollback
      const rolled = new Set(assigned);
      setAssignedMap((prev) => ({ ...prev, [selectedRoleId]: rolled }));
      showToast('Failed to remove user', false);
    } finally {
      setBusy(false);
    }
  };

  const handleDrop = (panel: 'role' | 'all') => {
    if (!draggedId) return;
    setOverPanel(null);
    if (panel === 'role') assign(draggedId);
    else unassign(draggedId);
    setDraggedId(null);
  };

  if (!roles.length) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
        No roles found. Create a role first.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 rounded-lg px-4 py-3 text-sm font-medium shadow-lg transition-all
            ${toast.ok ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}
        >
          {toast.msg}
        </div>
      )}

      {/* Role selector */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <label className="mb-2 block text-sm font-semibold text-slate-700">Select Role</label>
        <div className="relative max-w-xs">
          <select
            value={selectedRoleId}
            onChange={(e) => setSelectedRoleId(e.target.value)}
            className="w-full appearance-none rounded-lg border border-slate-300 bg-white py-2.5 pl-3 pr-8 text-sm text-slate-800 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-slate-400">
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor">
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06z" clipRule="evenodd" />
            </svg>
          </span>
        </div>

        <p className="mt-3 text-xs text-red-500">
          Note: In order to add user to role, please drag it from All Users to Role Users.
        </p>
      </div>

      {/* Drag panels */}
      {loadingRole ? (
        <div className="flex h-48 items-center justify-center rounded-2xl border border-slate-200 bg-white text-sm text-slate-400">
          Loading…
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* All Users */}
          <div
            onDragOver={(e) => { e.preventDefault(); setOverPanel('all'); }}
            onDragLeave={() => setOverPanel(null)}
            onDrop={() => handleDrop('all')}
            className={`min-h-[300px] rounded-2xl border-2 bg-white p-4 shadow-sm transition-colors
              ${overPanel === 'all' ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200'}`}
          >
            <h2 className="mb-3 text-sm font-bold text-indigo-600">
              All Users
              <span className="ml-1.5 rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700">
                {allUsers.length}
              </span>
            </h2>
            <div className="space-y-2">
              {allUsers.length === 0 ? (
                <p className="py-8 text-center text-xs text-slate-400">All users are assigned to this role</p>
              ) : (
                allUsers.map((u) => (
                  <UserCard
                    key={u.id}
                    user={u}
                    onDragStart={setDraggedId}
                    dragging={draggedId === u.id}
                  />
                ))
              )}
            </div>
          </div>

          {/* Role Users */}
          <div
            onDragOver={(e) => { e.preventDefault(); setOverPanel('role'); }}
            onDragLeave={() => setOverPanel(null)}
            onDrop={() => handleDrop('role')}
            className={`min-h-[300px] rounded-2xl border-2 bg-white p-4 shadow-sm transition-colors
              ${overPanel === 'role' ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200'}`}
          >
            <h2 className="mb-3 text-sm font-bold text-indigo-600">
              Role Users
              <span className="ml-1.5 rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700">
                {roleUsers.length}
              </span>
            </h2>
            <div className="space-y-2">
              {roleUsers.length === 0 ? (
                <p className="py-8 text-center text-xs text-slate-400">
                  Drag users here to assign them to this role
                </p>
              ) : (
                roleUsers.map((u) => (
                  <UserCard
                    key={u.id}
                    user={u}
                    onDragStart={setDraggedId}
                    dragging={draggedId === u.id}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
