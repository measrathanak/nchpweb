'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Locale } from '@/lib/i18n';

type NavItem = {
  key: string;
  labelEn: string;
  labelKm: string;
  href?: string;
  icon: 'docs' | 'saved' | 'audit' | 'archive' | 'profile' | 'debug' | 'users' | 'roles' | 'role-user' | 'languages' | 'login-audits' | 'settings';
  children?: NavItem[];
};

function NavIcon({ icon, className = 'h-4 w-4' }: { icon: NavItem['icon']; className?: string }) {
  const common = className;
  switch (icon) {
    case 'docs':
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M8 3h6l5 5v13H8z" />
          <path d="M14 3v5h5" />
        </svg>
      );
    case 'saved':
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M6 4h12v17l-6-3-6 3z" />
        </svg>
      );
    case 'audit':
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M4 12h4l2-5 4 10 2-5h4" />
        </svg>
      );
    case 'archive':
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M3 7h18v4H3z" />
          <path d="M6 11v8h12v-8" />
          <path d="M10 14h4" />
        </svg>
      );
    case 'profile':
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="8" r="3" />
          <path d="M5 19c1.5-3 4-4.5 7-4.5S17.5 16 19 19" />
        </svg>
      );
    case 'debug':
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M9 3h6" />
          <path d="M10 7h4a4 4 0 0 1 4 4v4a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4v-4a4 4 0 0 1 4-4z" />
          <path d="M4 10h2M18 10h2M4 14h2M18 14h2" />
        </svg>
      );
    case 'users':
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="9" cy="8" r="3" />
          <circle cx="17" cy="9" r="2.5" />
          <path d="M3.5 19c1.5-3 3.5-4.5 5.5-4.5s4 1.5 5.5 4.5" />
          <path d="M14.5 19c.7-1.8 1.8-2.8 3.2-3.2" />
        </svg>
      );
    case 'roles':
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 3l8 4v6c0 4.5-3 7.5-8 8-5-.5-8-3.5-8-8V7z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      );
    case 'role-user':
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="9" cy="8" r="3" />
          <path d="M3.5 19c1.3-2.8 3.4-4.2 6.5-4.2" />
          <path d="M14 15l2 2 4-4" />
        </svg>
      );
    case 'languages':
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="12" r="9" />
          <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      );
    case 'login-audits':
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M9 3h6v3H9z" />
          <path d="M3 6h18v12H3z" />
          <path d="M9 11v4M12 11v4M15 11v4" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
  }
}

type UtilityIconName =
  | 'list'
  | 'search'
  | 'pulse'
  | 'chat'
  | 'history'
  | 'link'
  | 'team'
  | 'user'
  | 'user-check'
  | 'bell'
  | 'logout'
  | 'gear';

function UtilityIcon({ name, className = 'h-7 w-7' }: { name: UtilityIconName; className?: string }) {
  switch (name) {
    case 'list':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.9">
          <path d="M9 6h11M9 12h11M9 18h11" />
          <circle cx="5" cy="6" r="1" />
          <circle cx="5" cy="12" r="1" />
          <circle cx="5" cy="18" r="1" />
        </svg>
      );
    case 'search':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.9">
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-4-4" />
        </svg>
      );
    case 'pulse':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.9">
          <path d="M3 12h4l2-5 4 10 2-5h6" />
        </svg>
      );
    case 'chat':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.9">
          <path d="M4 5h16v10H8l-4 4z" />
        </svg>
      );
    case 'history':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.9">
          <circle cx="12" cy="12" r="8" />
          <path d="M12 7v5l3 2" />
        </svg>
      );
    case 'link':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.9">
          <path d="M10 13a4 4 0 0 0 0-6l-1-1a4 4 0 1 0-6 6l1 1" />
          <path d="M14 11a4 4 0 0 0 0 6l1 1a4 4 0 1 0 6-6l-1-1" />
          <path d="M8 12h8" />
        </svg>
      );
    case 'team':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.9">
          <circle cx="9" cy="8" r="3" />
          <circle cx="17" cy="9" r="2.5" />
          <path d="M3.5 19c1.5-3 3.5-4.5 5.5-4.5s4 1.5 5.5 4.5" />
          <path d="M14.5 19c.7-1.8 1.8-2.8 3.2-3.2" />
        </svg>
      );
    case 'user':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.9">
          <circle cx="12" cy="8" r="3" />
          <path d="M5 19c1.5-3 4-4.5 7-4.5s5.5 1.5 7 4.5" />
        </svg>
      );
    case 'user-check':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.9">
          <circle cx="9" cy="8" r="3" />
          <path d="M2.5 19c1.3-2.8 3.4-4.2 6.5-4.2" />
          <path d="M14 15l2 2 4-4" />
        </svg>
      );
    case 'bell':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.9">
          <path d="M6 8a6 6 0 1 1 12 0c0 7 3 6 3 8H3c0-2 3-1 3-8" />
          <path d="M10 20a2 2 0 0 0 4 0" />
        </svg>
      );
    case 'logout':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.9">
          <path d="M10 4H5v16h5" />
          <path d="M14 12H8" />
          <path d="M12 9l3 3-3 3" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.9">
          <path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
  }
}

const collapsedUtilityIcons: UtilityIconName[] = [
  'search',
  'pulse',
  'chat',
  'history',
  'link',
  'team',
  'user',
  'user-check',
  'bell',
  'logout',
  'gear',
];

const navSections: { title: string; items: NavItem[] }[] = [
  {
    title: 'MANAGEMENT',
    items: [
      { key: 'profile', labelEn: 'Profile', labelKm: 'ប្រវត្តិរូប', href: '/profile', icon: 'profile' },
      { key: 'role-debug', labelEn: 'Role Debug', labelKm: 'ពិនិត្យតួនាទី', href: '/role-debug', icon: 'debug' },
      {
        key: 'settings',
        labelEn: 'Settings',
        labelKm: 'ការកំណត់',
        href: '/settings',
        icon: 'settings',
        children: [
          { key: 'users', labelEn: 'Users', labelKm: 'អ្នកប្រើប្រាស់', href: '/users', icon: 'users' },
          { key: 'roles', labelEn: 'Roles', labelKm: 'តួនាទី', href: '/roles', icon: 'roles' },
          { key: 'role-user', labelEn: 'Role User', labelKm: 'អ្នកប្រើតួនាទី', href: '/role-user', icon: 'role-user' },
          { key: 'languages', labelEn: 'Languages', labelKm: 'ភាសា', href: '/languages', icon: 'languages' },
          { key: 'login-audits', labelEn: 'Login Audits', labelKm: 'ឯកសារលោការ', href: '/login-audits', icon: 'login-audits' },
        ],
      },
    ],
  },
];

interface ProtectedSidebarNavProps {
  locale: Locale;
  className?: string;
  onItemClick?: () => void;
  collapsed?: boolean;
}

export default function ProtectedSidebarNav({ locale, className, onItemClick, collapsed = false }: ProtectedSidebarNavProps) {
  const pathname = usePathname();
  const isDev = process.env.NODE_ENV !== 'production';
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set(['settings'])); // Settings expanded by default

  const toggleExpanded = (key: string) => {
    const newSet = new Set(expandedKeys);
    if (newSet.has(key)) {
      newSet.delete(key);
    } else {
      newSet.add(key);
    }
    setExpandedKeys(newSet);
  };

  const renderNavItem = (item: NavItem, depth: number = 0) => {
    if (item.key === 'role-debug' && !isDev) {
      return null;
    }

    const label = locale === 'km' ? item.labelKm : item.labelEn;
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedKeys.has(item.key);
    const fullHref = item.href ? `/${locale}${item.href}` : '';
    const active = item.href
      ? pathname === fullHref || (hasChildren && pathname.startsWith(`${fullHref}/`))
      : false;

    // Disabled placeholder for items without href and no children
    if (!item.href && !hasChildren) {
      return (
        <div
          key={item.key}
          title={label}
          className={`flex cursor-not-allowed items-center rounded-2xl py-3 text-sm font-medium text-slate-400 ${
            collapsed ? 'justify-center px-2' : 'gap-2 px-3'
          }`}
        >
          <NavIcon icon={item.icon} className={collapsed ? 'h-7 w-7 text-slate-400' : 'h-5 w-5'} />
          {!collapsed ? label : null}
        </div>
      );
    }

    // Collapsible menu item (has children)
    if (hasChildren) {
      return (
        <div key={item.key}>
          {item.href ? (
            <div
              className={`w-full flex items-center rounded-2xl py-3 text-sm font-medium transition-colors ${
                active
                  ? 'bg-indigo-100 text-indigo-800'
                  : 'text-slate-700 hover:bg-slate-200 hover:text-slate-900'
              } ${collapsed ? 'justify-center px-2' : 'gap-2 px-3'}`}
            >
              <Link
                href={fullHref}
                onClick={onItemClick}
                title={label}
                className={`flex items-center ${collapsed ? 'justify-center' : 'gap-2 flex-1 min-w-0'}`}
              >
                <NavIcon icon={item.icon} className={collapsed ? `h-7 w-7 ${active ? 'text-indigo-700' : 'text-slate-600'}` : 'h-5 w-5'} />
                {!collapsed ? <span className="truncate">{label}</span> : null}
              </Link>
              {!collapsed && (
                <button
                  type="button"
                  onClick={() => toggleExpanded(item.key)}
                  aria-label={`Toggle ${label}`}
                  className="ml-1 rounded-md p-1 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                >
                  <svg
                    className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={() => toggleExpanded(item.key)}
              title={label}
              className={`w-full flex items-center rounded-2xl py-3 text-sm font-medium transition-colors text-slate-700 hover:bg-slate-200 hover:text-slate-900 ${
                collapsed ? 'justify-center px-2' : 'gap-2 px-3'
              }`}
            >
              <NavIcon icon={item.icon} className={collapsed ? 'h-7 w-7 text-slate-600' : 'h-5 w-5'} />
              {!collapsed && (
                <>
                  <span className="flex-1 text-left">{label}</span>
                  <svg
                    className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </>
              )}
            </button>
          )}
          {isExpanded && !collapsed && (
            <div className="ml-2 space-y-1 border-l border-slate-200 pl-2">
              {item.children!.map((child) => renderNavItem(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    // Regular link item

    return (
      <Link
        key={item.key}
        href={fullHref}
        onClick={onItemClick}
        title={label}
        className={`flex items-center rounded-2xl py-3 text-sm font-medium transition-colors ${
          active
            ? 'bg-indigo-100 text-indigo-800'
            : 'text-slate-700 hover:bg-slate-200 hover:text-slate-900'
        } ${collapsed ? 'justify-center px-2' : 'gap-2 px-3'}`}
      >
        <NavIcon icon={item.icon} className={collapsed ? `h-7 w-7 ${active ? 'text-indigo-700' : 'text-slate-600'}` : 'h-5 w-5'} />
        {!collapsed ? label : null}
      </Link>
    );
  };

  return (
    <aside className={className ?? 'hidden w-72 flex-shrink-0 border-r border-slate-200 bg-slate-50 lg:block'}>
      <div className={`h-full overflow-y-auto py-4 ${collapsed ? 'px-2' : 'px-3'}`}>
        <div className={collapsed ? 'mx-auto flex h-full w-[76px] flex-col rounded-[30px] border border-indigo-200/80 bg-white px-2 py-3 shadow-sm' : ''}>
          {navSections.map((section) => (
            <div key={section.title} className={collapsed ? 'mb-0 pb-0' : 'mb-6 border-b border-slate-200 pb-4 last:border-b-0 last:pb-0'}>
              {!collapsed ? (
                <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">{section.title}</p>
              ) : null}
              <nav className={collapsed ? 'space-y-3' : 'space-y-1'}>
                {section.items.map((item) => renderNavItem(item))}
              </nav>
            </div>
          ))}

          {collapsed ? (
            <div className="mt-3 border-t border-slate-200 pt-3">
              <div className="space-y-3">
                {collapsedUtilityIcons.map((iconName) => {
                  const highlighted = iconName === 'gear';
                  return (
                    <div
                      key={iconName}
                      className={`flex items-center justify-center rounded-2xl px-2 py-3 transition-colors ${
                        highlighted
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <UtilityIcon name={iconName} className="h-7 w-7" />
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </aside>
  );
}
