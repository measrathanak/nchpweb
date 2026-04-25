'use client';

import { useEffect, useRef, useState } from 'react';

export interface ProfileData {
  id: string;
  email: string;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  avatar: string | null;
  language: string;
}

interface ProfileEditorProps {
  initial: ProfileData;
}

export default function ProfileEditor({ initial }: ProfileEditorProps) {
  const [form, setForm] = useState({
    firstName: initial.firstName ?? '',
    lastName: initial.lastName ?? '',
    phone: initial.phone ?? '',
    avatar: initial.avatar ?? '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; kind: 'success' | 'error' | 'info' } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  function showToast(msg: string, kind: 'success' | 'error' | 'info') {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ msg, kind });
    toastTimer.current = setTimeout(() => setToast(null), 2500);
  }

  function setField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function resetForm() {
    setForm({
      firstName: initial.firstName ?? '',
      lastName: initial.lastName ?? '',
      phone: initial.phone ?? '',
      avatar: initial.avatar ?? '',
    });
  }

  function handleCancel() {
    resetForm();
    showToast('Changes discarded.', 'info');
  }

  function handleAvatarUpload(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Please upload an image file.', 'error');
      return;
    }
    if (file.size > 1024 * 1024) {
      showToast('Image must be 1MB or smaller.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setField('avatar', reader.result);
      }
    };
    reader.readAsDataURL(file);
  }

  async function saveProfile() {
    setIsSaving(true);

    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone,
          avatar: form.avatar || null,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to save profile.');
      }

      const updated = (await res.json()) as ProfileData;
      setForm({
        firstName: updated.firstName ?? '',
        lastName: updated.lastName ?? '',
        phone: updated.phone ?? '',
        avatar: updated.avatar ?? '',
      });

      window.dispatchEvent(new CustomEvent('npch:profile-updated', { detail: updated }));
      showToast('Profile updated successfully.', 'success');
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Failed to save profile.', 'error');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      {toast ? (
        <div
          className={`mb-4 rounded-lg px-4 py-2 text-sm font-medium ${
            toast.kind === 'success'
              ? 'bg-emerald-600 text-white'
              : toast.kind === 'error'
                ? 'bg-red-600 text-white'
                : 'bg-slate-700 text-white'
          }`}
        >
          {toast.msg}
        </div>
      ) : null}

      <h2 className="mb-5 text-2xl font-semibold text-slate-800">Profile</h2>

      <div className="mb-6 flex flex-wrap items-start gap-4">
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-[180px] w-[180px] max-w-[88vw] items-center justify-center rounded-[20px] border-[3px] border-dashed border-slate-300 bg-slate-50 p-0">
            {form.avatar ? (
              <img src={form.avatar} alt="Profile" className="h-full w-full rounded-[16px] object-cover object-top" />
            ) : (
              <svg viewBox="0 0 24 24" className="h-10 w-10 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="4" width="18" height="14" rx="2" />
                <circle cx="8" cy="9" r="1.5" />
                <path d="M5 16l4-4 3 3 3-3 4 4" />
              </svg>
            )}
          </div>

          <label className="inline-flex h-9 min-w-[130px] cursor-pointer items-center justify-center rounded-lg border border-slate-300 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50">
            Upload Profile
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) => handleAvatarUpload(e.target.files?.[0])}
            />
          </label>
          <p className="text-xs text-slate-500">PNG/JPG/WebP, max 1MB</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">First Name</label>
          <input
            type="text"
            value={form.firstName}
            onChange={(e) => setField('firstName', e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Last Name</label>
          <input
            type="text"
            value={form.lastName}
            onChange={(e) => setField('lastName', e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Phone</label>
          <input
            type="text"
            value={form.phone}
            onChange={(e) => setField('phone', e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
          <input
            type="email"
            value={initial.email}
            disabled
            className="w-full rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-sm text-slate-700"
          />
        </div>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button
          type="button"
          onClick={saveProfile}
          disabled={isSaving}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          <span>💾</span>
          {isSaving ? 'Saving...' : 'Save'}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700"
        >
          <span>✖</span>
          Cancel
        </button>
      </div>
    </section>
  );
}
