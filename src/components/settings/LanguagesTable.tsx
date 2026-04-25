'use client';

import { useState, useRef, useEffect } from 'react';

export interface LanguageRow {
  id: string;
  name: string;
  code: string;
  nativeName: string | null;
  flagEmoji: string | null;
  isRtl?: boolean;
  enabled: boolean;
  sortOrder: number;
}

const isImagePath = (value: string | null) => {
  if (!value) return false;
  return /^(https?:\/\/|\/|\.\/|\.\.\/|data:image\/)/i.test(value) || /\.(png|jpe?g|webp|gif|svg)$/i.test(value);
};

const FLAG_BOX_SIZE = 40;

interface Props {
  initial: LanguageRow[];
}

function LanguageInlineForm({
  lang,
  onSave,
  onCancel,
  loading,
}: {
  lang: LanguageRow | null;
  onSave: (name: string, code: string, nativeName: string | null, flagEmoji: string | null, sortOrder: number, isRtl: boolean) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}) {
  const [name, setName] = useState(lang?.name ?? '');
  const [code, setCode] = useState(lang?.code ?? '');
  const [nativeName, setNativeName] = useState(lang?.nativeName ?? '');
  const [flagEmoji, setFlagEmoji] = useState(lang?.flagEmoji ?? '');
  const [sortOrder, setSortOrder] = useState(lang?.sortOrder.toString() ?? '999');
  const [isRtl, setIsRtl] = useState(lang?.isRtl ?? false);
  const [flagTemplateName, setFlagTemplateName] = useState('');
  const [flagTemplatePreview, setFlagTemplatePreview] = useState<string | null>(null);
  const [flagTemplateError, setFlagTemplateError] = useState<string | null>(null);

  const isEdit = !!lang;

  useEffect(() => {
    return () => {
      if (flagTemplatePreview) {
        URL.revokeObjectURL(flagTemplatePreview);
      }
    };
  }, [flagTemplatePreview]);

  const handleFlagTemplateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setFlagTemplateError('File must be 2MB or smaller.');
      e.currentTarget.value = '';
      return;
    }

    setFlagTemplateError(null);
    setFlagTemplateName(file.name);
    setFlagEmoji(file.name);

    if (flagTemplatePreview) {
      URL.revokeObjectURL(flagTemplatePreview);
    }
    setFlagTemplatePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;
    await onSave(
      name.trim(),
      code.trim().toLowerCase(),
      nativeName.trim() || null,
      flagEmoji.trim() || null,
      parseInt(sortOrder, 10) || 999,
      isRtl
    );
  };

  return (
    <form onSubmit={handleSubmit} className="w-full rounded-2xl border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-6 py-4">
        <h3 className="text-lg font-semibold text-slate-900">{isEdit ? 'Edit Language' : 'Add Language'}</h3>
      </div>

      <div className="grid grid-cols-1 gap-5 px-6 py-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Language Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            placeholder="e.g., English"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Language Code</label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toLowerCase())}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-100"
            placeholder="e.g., en"
            disabled={isEdit}
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Native Name</label>
          <input
            type="text"
            value={nativeName}
            onChange={(e) => setNativeName(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            placeholder="e.g., Khmer"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Sort Order</label>
          <input
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            min="1"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Is RTL</label>
          <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-3 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={isRtl}
              onChange={(e) => setIsRtl(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            Right to Left language
          </label>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Flag Attachment</label>
          <div className="flex items-center gap-3">
            <label
              className="flex cursor-pointer items-center justify-center overflow-hidden rounded-md border border-slate-300 bg-slate-100 hover:border-slate-400"
              style={{ width: FLAG_BOX_SIZE, height: FLAG_BOX_SIZE }}
              title="Upload flag image"
            >
              {flagTemplatePreview ? (
                <img src={flagTemplatePreview} alt="Flag template preview" className="h-full w-full object-cover" />
              ) : (
                <svg viewBox="0 0 64 64" className="h-5 w-5 text-slate-400" aria-hidden="true">
                  <path fill="currentColor" d="M10 16a4 4 0 0 1 4-4h28a4 4 0 0 1 4 4v24a4 4 0 0 1-4 4H14a4 4 0 0 1-4-4V16zm8 6a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm-4 16h28l-8-9-6 7-4-4-10 6z"/>
                </svg>
              )}
              <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleFlagTemplateChange} className="hidden" />
            </label>
            <div className="min-w-0 text-xs text-slate-600">
              <p className="truncate">{flagTemplateName || 'No file selected'}</p>
              <p>Preview size: {FLAG_BOX_SIZE} x {FLAG_BOX_SIZE}</p>
            </div>
          </div>
          {flagTemplateError && <p className="mt-1 text-xs text-red-600">{flagTemplateError}</p>}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 border-t border-slate-200 px-6 py-4">
        <button
          type="submit"
          disabled={loading || !name.trim() || !code.trim()}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
            <path fill="currentColor" d="M17 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7l-4-4zm-5 16a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm3-10H5V5h10v4z"/>
          </svg>
          {loading ? 'Saving...' : 'Save'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
            <path fill="currentColor" d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm3.54 12.12-1.42 1.42L12 13.41l-2.12 2.13-1.42-1.42L10.59 12 8.46 9.88l1.42-1.42L12 10.59l2.12-2.13 1.42 1.42L13.41 12z"/>
          </svg>
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function LanguagesTable({ initial }: Props) {
  const [languages, setLanguages] = useState<LanguageRow[]>(initial);
  const [editingLang, setEditingLang] = useState<LanguageRow | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingBusyId, setDeletingBusyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (msg: string, ok = true) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ msg, ok });
    toastTimer.current = setTimeout(() => setToast(null), 2500);
  };

  const handleSave = async (name: string, code: string, nativeName: string | null, flagEmoji: string | null, sortOrder: number, isRtl: boolean) => {
    setLoading(true);
    try {
      const method = editingLang ? 'PATCH' : 'POST';
      const url = editingLang ? `/api/languages/${editingLang.id}` : '/api/languages';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, code, nativeName, flagEmoji, sortOrder, isRtl }),
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
    setDeletingBusyId(id);
    try {
      const res = await fetch(`/api/languages/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setLanguages((prev) => prev.filter((l) => l.id !== id));
      setDeletingId(null);
      showToast('Language deleted');
    } catch {
      showToast('Failed to delete language', false);
    } finally {
      setDeletingBusyId(null);
    }
  };

  if (editingLang) {
    return (
      <LanguageInlineForm
        lang={editingLang}
        onSave={handleSave}
        onCancel={() => {
          setIsAdding(false);
          setEditingLang(null);
        }}
        loading={loading}
      />
    );
  }

  if (isAdding) {
    return (
      <LanguageInlineForm
        lang={null}
        onSave={handleSave}
        onCancel={() => {
          setIsAdding(false);
          setEditingLang(null);
        }}
        loading={loading}
      />
    );
  }

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
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-700 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-800"
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
                <td className="px-4 py-3 text-sm">
                  <div
                    className="flex items-center justify-center overflow-hidden rounded-md border border-slate-300 bg-slate-100"
                    style={{ width: FLAG_BOX_SIZE, height: FLAG_BOX_SIZE }}
                  >
                    {isImagePath(lang.flagEmoji) ? (
                      <img src={lang.flagEmoji ?? ''} alt={`${lang.name} flag`} className="h-full w-full object-cover" />
                    ) : lang.flagEmoji ? (
                      <span className="text-base leading-none text-slate-700">{lang.flagEmoji}</span>
                    ) : (
                      <svg viewBox="0 0 64 64" className="h-5 w-5 text-slate-400" aria-hidden="true">
                        <path fill="currentColor" d="M10 16a4 4 0 0 1 4-4h28a4 4 0 0 1 4 4v24a4 4 0 0 1-4 4H14a4 4 0 0 1-4-4V16zm8 6a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm-4 16h28l-8-9-6 7-4-4-10 6z"/>
                      </svg>
                    )}
                  </div>
                </td>
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
                    {deletingId === lang.id ? (
                      <>
                        <button
                          onClick={() => handleDelete(lang.id)}
                          disabled={deletingBusyId === lang.id}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-70"
                        >
                          {deletingBusyId === lang.id ? 'Deleting...' : 'Confirm'}
                        </button>
                        <button
                          onClick={() => setDeletingId(null)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setDeletingId(lang.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-200"
                      >
                        <span>✕</span>
                        Delete
                      </button>
                    )}
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

    </div>
  );
}
