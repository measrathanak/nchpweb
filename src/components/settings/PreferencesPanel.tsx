'use client';

import { useState, useTransition } from 'react';

interface Preferences {
  notificationsEnabled: boolean;
  theme: string;
  fontSize: string;
  articlesPerPage: number;
}

interface PreferencesPanelProps {
  initial: Preferences;
  locale: string;
}

const labels = {
  en: {
    preferences: 'Preferences',
    notifications: 'Email notifications',
    notificationsHint: 'Receive article updates and announcements by email.',
    theme: 'Theme',
    themeLight: 'Light',
    themeDark: 'Dark',
    fontSize: 'Font size',
    fontSmall: 'Small',
    fontMedium: 'Medium',
    fontLarge: 'Large',
    articlesPerPage: 'Articles per page',
    save: 'Save preferences',
    saving: 'Saving…',
    saved: 'Saved!',
    error: 'Failed to save. Please try again.',
  },
  km: {
    preferences: 'ចំណូលចិត្ត',
    notifications: 'ការជូនដំណឹងអ៊ីមែល',
    notificationsHint: 'ទទួលការអាប់ដេតអត្ថបទ និងការប្រកាសតាមអ៊ីមែល។',
    theme: 'រូបរាង',
    themeLight: 'ភ្លឺ',
    themeDark: 'ងងឹត',
    fontSize: 'ទំហំអក្សរ',
    fontSmall: 'តូច',
    fontMedium: 'មធ្យម',
    fontLarge: 'ធំ',
    articlesPerPage: 'អត្ថបទក្នុងមួយទំព័រ',
    save: 'រក្សាទុកចំណូលចិត្ត',
    saving: 'កំពុងរក្សាទុក…',
    saved: 'រក្សាទុករួច!',
    error: 'បរាជ័យក្នុងការរក្សាទុក។ សូមព្យាយាមម្ដងទៀត។',
  },
};

export default function PreferencesPanel({ initial, locale }: PreferencesPanelProps) {
  const t = locale === 'km' ? labels.km : labels.en;
  const [prefs, setPrefs] = useState<Preferences>(initial);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [isPending, startTransition] = useTransition();

  function update<K extends keyof Preferences>(key: K, value: Preferences[K]) {
    setPrefs((prev) => ({ ...prev, [key]: value }));
    setStatus('idle');
  }

  function save() {
    startTransition(async () => {
      setStatus('saving');
      try {
        const res = await fetch('/api/preferences', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(prefs),
        });
        if (!res.ok) throw new Error('save failed');
        setStatus('saved');
      } catch {
        setStatus('error');
      }
    });
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">{t.preferences}</h2>

      <div className="mt-5 space-y-5">
        {/* Notifications toggle */}
        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div>
            <p className="font-medium text-slate-900">{t.notifications}</p>
            <p className="mt-0.5 text-sm text-slate-500">{t.notificationsHint}</p>
          </div>
          <button
            role="switch"
            aria-checked={prefs.notificationsEnabled}
            onClick={() => update('notificationsEnabled', !prefs.notificationsEnabled)}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
              prefs.notificationsEnabled ? 'bg-indigo-600' : 'bg-slate-300'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
                prefs.notificationsEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Theme */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="font-medium text-slate-900">{t.theme}</p>
          <div className="mt-3 flex gap-2">
            {(['light', 'dark'] as const).map((val) => (
              <button
                key={val}
                onClick={() => update('theme', val)}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                  prefs.theme === val
                    ? 'border-indigo-600 bg-indigo-600 text-white'
                    : 'border-slate-300 bg-white text-slate-700 hover:border-indigo-400'
                }`}
              >
                {val === 'light' ? t.themeLight : t.themeDark}
              </button>
            ))}
          </div>
        </div>

        {/* Font size */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="font-medium text-slate-900">{t.fontSize}</p>
          <div className="mt-3 flex gap-2">
            {(['small', 'medium', 'large'] as const).map((val) => (
              <button
                key={val}
                onClick={() => update('fontSize', val)}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                  prefs.fontSize === val
                    ? 'border-indigo-600 bg-indigo-600 text-white'
                    : 'border-slate-300 bg-white text-slate-700 hover:border-indigo-400'
                }`}
              >
                {val === 'small' ? t.fontSmall : val === 'medium' ? t.fontMedium : t.fontLarge}
              </button>
            ))}
          </div>
        </div>

        {/* Articles per page */}
        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="font-medium text-slate-900">{t.articlesPerPage}</p>
          <select
            value={prefs.articlesPerPage}
            onChange={(e) => update('articlesPerPage', Number(e.target.value))}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {[5, 10, 20, 50].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Save button + status */}
      <div className="mt-6 flex items-center gap-4">
        <button
          onClick={save}
          disabled={isPending || status === 'saving'}
          className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:opacity-60"
        >
          {status === 'saving' ? t.saving : t.save}
        </button>

        {status === 'saved' && (
          <span className="text-sm font-medium text-emerald-600">{t.saved}</span>
        )}
        {status === 'error' && (
          <span className="text-sm font-medium text-rose-600">{t.error}</span>
        )}
      </div>
    </section>
  );
}
