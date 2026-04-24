'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

export interface LanguageRow {
  id: string;
  name: string;
  code: string;
  nativeName: string | null;
  flagEmoji: string | null;
  enabled: boolean;
  sortOrder: number;
}

interface Props {
  initial: LanguageRow[];
}

function LanguageModal({
  lang,
  onSave,
  onClose,
}: {
  lang: LanguageRow | null;
  onSave: (name: string, code: string, nativeName: string | null, flagEmoji: string | null, sortOrder: number) => Promise<void>;
  onClose: () => void;
}) {
  const [name, setName] = useState(lang?.name ?? '');
  const [code, setCode] = useState(lang?.code ?? '');
  const [nativeName, setNativeName] = useState(lang?.nativeName ?? '');
  const [flagEmoji, setFlagEmoji] = useState(lang?.flagEmoji ?? '');
  const [sortOrder, setSortOrder] = useState(lang?.sortOrder.toString() ?? '999');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim() || !code.trim()) return;
    setLoading(true);
    try {
      await onSave(
        name.trim(),
        code.trim().toLowerCase(),
        nativeName.trim() || null,
        flagEmoji.trim() || null,
        parseInt(sortOrder, 10) || 999
      );
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white shadow-lg">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">{lang ? 'Edit Language' : 'Add Language'}</h2>
        </div>
        <div className="space-y-4 px-6 py-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Language Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder="e.g., English"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Language Code</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toLowerCase())}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder="e.g., en"
              disabled={!!lang}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Native Name</label>
            <input
              type="text"
              value={nativeName}
              onChange={(e) => setNativeName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder="e.g., ខ្មែរ"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Flag Emoji</label>
            <input
              type="text"
              value={flagEmoji}
              onChange={(e) => setFlagEmoji(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder="e.g., 🇬🇧"
              maxLength={10}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Sort Order</label>
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              min="1"
            />
          </div>
        </div>
        <div className="flex gap-3 border-t border-slate-200 px-6 py-4">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-slate-300 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading || !name.trim() || !code.trim()}
            className="flex-1 rounded-lg bg-indigo-600 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:bg-slate-300"
          >
            {loading ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmDelete({
  name,
  onConfirm,
  onCancel,
}: {
  name: string;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-lg bg-white shadow-lg">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Delete Language</h2>
        </div>
        <div className="px-6 py-5">
          <p className="text-sm text-slate-600">
            Are you sure you want to delete <strong>{name}</strong>? This cannot be undone.
          </p>
        </div>
        <div className="flex gap-3 border-t border-slate-200 px-6 py-4">
          <button
            onClick={onCancel}
            className="flex-1 rounded-lg border border-slate-300 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 rounded-lg bg-red-600 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:bg-slate-300"
          >
            {loading ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LanguagesTable({ initial }: Props) {
  const [languages, setLanguages] = useState<LanguageRow[]>(initial);
  const [editingLang, setEditingLang] = useState<LanguageRow | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (msg: string, ok = true) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ msg, ok });
    toastTimer.current = setTimeout(() => setToast(null), 2500);
  };

  const handleSave = async (name: string, code: string, nativeName: string | null, flagEmoji: string | null, sortOrder: number) => {
    setLoading(true);
    try {
      const method = editingLang ? 'PATCH' : 'POST';
      const url = editingLang ? `/api/languages/${editingLang.id}` : '/api/languages';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, code, nativeName, flagEmoji, sortOrder }),
      });
      if (!res.ok) throw new Error('Failed to save');
      const saved = (await res.json()) as LanguageRow;
      if (editingLang) {
        setLanguages((prev) => prev.map((l) => (l.id === saved.id ? saved : l)));
      } else {
        setLanguages((prev) => [saved, ...prev]);
      }
      setIsAdding(false);
      setEditingLang(null);
      showToast(editingLang ? 'Language updated' : 'Language added');
    } catch {
      showToast('Failed to save language', false);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/languages/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setLanguages((prev) => prev.filter((l) => l.id !== id));
      setDeletingId(null);
      showToast('Language deleted');
    } catch {
      showToast('Failed to delete language', false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 rounded-lg px-4 py-3 text-sm font-medium shadow-lg transition-all
            ${toast.ok ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}
        >
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-5 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900">Languages</h2>
        <button
          onClick={() => { setIsAdding(true); setEditingLang(null); }}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <span>+</span>
          Add Language
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
        <table className="w-full border-collapse">
          <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-600">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Code</th>
              <th className="px-4 py-3 text-left">Native</th>
              <th className="px-4 py-3 text-left">Flag</th>
              <th className="px-4 py-3 text-left">Enabled</th>
              <th className="px-4 py-3 text-left">Sort</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {languages.map((lang) => (
              <tr key={lang.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-sm font-medium text-slate-900">{lang.name}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{lang.code}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{lang.nativeName || '—'}</td>
                <td className="px-4 py-3 text-sm">{lang.flagEmoji || '—'}</td>
                <td className="px-4 py-3 text-sm">
                  <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${lang.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                    {lang.enabled ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">{lang.sortOrder}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => { setEditingLang(lang); setIsAdding(false); }}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-100 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-200"
                    >
                      <span>✎</span>
                      Edit
                    </button>
                    <button
                      onClick={() => setDeletingId(lang.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-200"
                    >
                      <span>✕</span>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {languages.length === 0 && (
          <div className="p-8 text-center text-sm text-slate-500">No languages yet</div>
        )}
      </div>

      {/* Modals */}
      {(isAdding || editingLang) && (
        <LanguageModal
          lang={editingLang}
          onSave={handleSave}
          onClose={() => { setIsAdding(false); setEditingLang(null); }}
        />
      )}
      {deletingId && (
        <ConfirmDelete
          name={languages.find((l) => l.id === deletingId)?.name ?? ''}
          onConfirm={() => handleDelete(deletingId)}
          onCancel={() => setDeletingId(null)}
        />
      )}
    </div>
  );
}
