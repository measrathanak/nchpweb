'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Locale } from '@/lib/i18n';

type MenuKey = 'theme' | 'language' | 'user' | null;

interface ProtectedTopbarActionsProps {
  locale: Locale;
  userName?: string | null;
  userAvatar?: string | null;
}

type LanguageOption = {
  code: string;
  label: string;
  flag: string;
  enabled: boolean;
};

const languageOptions: LanguageOption[] = [
  { code: 'km', label: 'ភាសាខ្មែរ', flag: '🇰🇭', enabled: true },
  { code: 'en', label: 'English', flag: '🇺🇸', enabled: true },
  { code: 'zh', label: '中文', flag: '🇨🇳', enabled: false },
  { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳', enabled: false },
  { code: 'fr', label: 'French', flag: '🇫🇷', enabled: false },
  { code: 'ko', label: 'Korean', flag: '🇰🇷', enabled: false },
  { code: 'th', label: 'ไทย', flag: '🇹🇭', enabled: false },
];

export default function ProtectedTopbarActions({ locale, userName, userAvatar }: ProtectedTopbarActionsProps) {
  const [activeMenu, setActiveMenu] = useState<MenuKey>(null);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light');
  const [displayName, setDisplayName] = useState(userName ?? 'Admin User');
  const [displayAvatar, setDisplayAvatar] = useState<string | null>(userAvatar ?? null);
  const [topbarToast, setTopbarToast] = useState<{ msg: string; kind: 'success' | 'error' | 'info' } | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const topbarToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setDisplayName(userName ?? 'Admin User');
    setDisplayAvatar(userAvatar ?? null);
  }, [userName, userAvatar]);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch('/api/profile', { cache: 'no-store' });
        if (!res.ok) return;
        const data = (await res.json()) as { name?: string | null; avatar?: string | null };
        if (data.name) setDisplayName(data.name);
        setDisplayAvatar(data.avatar ?? null);
      } catch {
        // Ignore profile refresh failures in topbar.
      }
    }

    function onProfileUpdated(event: Event) {
      const payload = (event as CustomEvent<{ name?: string | null; avatar?: string | null }>).detail;
      if (payload?.name) setDisplayName(payload.name);
      setDisplayAvatar(payload?.avatar ?? null);
    }

    function normalizeToastMessage(message: string) {
      const trimmed = message.trim();
      const isAllCapsStyle = /^[A-Z0-9_:\-,.\s]+$/.test(trimmed) && /[A-Z]/.test(trimmed);
      if (!isAllCapsStyle) return trimmed;

      const humanized = trimmed
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .trim();

      return humanized.charAt(0).toUpperCase() + humanized.slice(1);
    }
    function onTopbarToast(event: Event) {
      const payload = (event as CustomEvent<{ msg?: string; kind?: 'success' | 'error' | 'info' }>).detail;
      if (!payload?.msg) return;
      if (topbarToastTimerRef.current) clearTimeout(topbarToastTimerRef.current);
        setTopbarToast({ msg: normalizeToastMessage(payload.msg), kind: payload.kind ?? 'info' });
      topbarToastTimerRef.current = setTimeout(() => setTopbarToast(null), 3500);
    }

    loadProfile();
    window.addEventListener('npch:profile-updated', onProfileUpdated as EventListener);
    window.addEventListener('npch:topbar-toast', onTopbarToast as EventListener);
    return () => {
      window.removeEventListener('npch:profile-updated', onProfileUpdated as EventListener);
      window.removeEventListener('npch:topbar-toast', onTopbarToast as EventListener);
      if (topbarToastTimerRef.current) clearTimeout(topbarToastTimerRef.current);
    };
  }, []);

  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    }

    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  function toggleMenu(menu: Exclude<MenuKey, null>) {
    setActiveMenu((prev) => (prev === menu ? null : menu));
  }

  function applyTheme(nextTheme: 'light' | 'dark' | 'system') {
    setTheme(nextTheme);
    setActiveMenu(null);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  const iconButton =
    'rounded-full p-2 text-slate-700 transition-colors hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-300';

  return (
    <div ref={wrapperRef} className="relative flex items-center gap-2">
      <div className="relative">
        <button type="button" aria-label="Theme" className={iconButton} onClick={() => toggleMenu('theme')}>
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M12 3v2M12 19v2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M3 12h2M19 12h2M5.6 18.4L7 17M17 7l1.4-1.4" />
            <circle cx="12" cy="12" r="4" />
          </svg>
        </button>

        {activeMenu === 'theme' ? (
          <div className="absolute right-0 mt-2 w-52 rounded-md border border-slate-200 bg-white py-2 shadow-lg">
            {[
              { key: 'light' as const, label: 'Light', icon: '☀️' },
              { key: 'dark' as const, label: 'Dark', icon: '🌙' },
              { key: 'system' as const, label: 'System', icon: '🖥️' },
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => applyTheme(item.key)}
                className={`flex w-full items-center gap-3 px-4 py-2 text-left text-base ${
                  theme === item.key ? 'bg-slate-100 text-slate-900' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="relative">
        <button type="button" aria-label="Language" className={iconButton} onClick={() => toggleMenu('language')}>
          <span className="text-2xl leading-none">{locale === 'km' ? '🇰🇭' : '🇺🇸'}</span>
        </button>

        {activeMenu === 'language' ? (
          <div className="absolute right-0 mt-2 max-h-96 w-56 overflow-y-auto rounded-md border border-slate-200 bg-white py-2 shadow-lg">
            {languageOptions.map((lang) => {
              const active = lang.code === locale;
              if (lang.enabled) {
                return (
                  <Link
                    key={lang.code}
                    href={`/${lang.code}`}
                    className={`flex items-center gap-3 px-4 py-2 text-base ${
                      active ? 'bg-slate-100 text-slate-900' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                    onClick={() => setActiveMenu(null)}
                  >
                    <span className="text-xl">{lang.flag}</span>
                    <span>{lang.label}</span>
                  </Link>
                );
              }

              return (
                <div key={lang.code} className="flex cursor-not-allowed items-center gap-3 px-4 py-2 text-base text-slate-400">
                  <span className="text-xl">{lang.flag}</span>
                  <span>{lang.label}</span>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>

      <button type="button" aria-label="Mentions" className={iconButton}>
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="12" r="8" />
          <path d="M16 12v2a2 2 0 1 1-4 0v-4a2 2 0 1 0-2 2" />
        </svg>
      </button>

      <button type="button" aria-label="Notifications" className={iconButton}>
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M6 8a6 6 0 1 1 12 0c0 7 3 6 3 8H3c0-2 3-1 3-8" />
          <path d="M10 20a2 2 0 0 0 4 0" />
        </svg>
      </button>

      <div className="relative">
        <button
          type="button"
          aria-label="Profile"
          className="rounded-full p-0 text-slate-700 transition-colors hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-slate-300"
          onClick={() => toggleMenu('user')}
        >
          <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border-2 border-slate-300 bg-slate-100">
            {displayAvatar ? (
              <img src={displayAvatar} alt="Profile" className="h-full w-full object-cover object-top" />
            ) : (
              <svg viewBox="0 0 24 24" className="h-6 w-6 text-slate-400" fill="currentColor">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21a8 8 0 0 1 16 0" />
              </svg>
            )}
          </span>
        </button>

        {topbarToast ? (
          <div
            className={`absolute right-0 top-full z-20 mt-2 flex min-w-[320px] max-w-[420px] items-center gap-3 rounded-[22px] border-2 px-4 py-3 text-sm font-semibold shadow-2xl backdrop-blur ${
              topbarToast.kind === 'success'
                ? 'border-green-500 bg-green-600 text-white'
                : topbarToast.kind === 'error'
                  ? 'border-red-500 bg-red-600 text-white'
                  : 'border-slate-600 bg-slate-700 text-white'
            }`}
            role="status"
            aria-live="polite"
          >
            {topbarToast.kind === 'success' ? (
              <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.6">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            ) : null}
            {topbarToast.kind === 'error' ? (
              <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.4">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 8v5" />
                <circle cx="12" cy="16.5" r="1" fill="currentColor" stroke="none" />
              </svg>
            ) : null}
            {topbarToast.kind === 'info' ? (
              <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.4">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 11v5" />
                <circle cx="12" cy="7.5" r="1" fill="currentColor" stroke="none" />
              </svg>
            ) : null}
            <span className="flex-1 tracking-wide">{topbarToast.msg}</span>
            <button
              type="button"
              onClick={() => setTopbarToast(null)}
              className="rounded p-1 text-white/85 hover:bg-white/20 hover:text-white"
              aria-label="Dismiss notification"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : null}

        {activeMenu === 'user' ? (
          <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-slate-200 bg-white py-2 shadow-lg">
            <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3 text-slate-600">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="8" r="3" />
                <path d="M5 20c1.5-3 4-4.5 7-4.5s5.5 1.5 7 4.5" />
              </svg>
              <span className="text-base font-medium text-slate-600">{displayName}</span>
            </div>

            <form action="/api/auth/signout" method="post">
              <input type="hidden" name="callbackUrl" value={`/${locale}`} />
              <button
                type="submit"
                className="flex w-full items-center gap-3 px-4 py-2 text-left text-base text-slate-700 hover:bg-slate-50"
              >
                <span>↪</span>
                <span>Logout</span>
              </button>
            </form>
          </div>
        ) : null}
      </div>
    </div>
  );
}
