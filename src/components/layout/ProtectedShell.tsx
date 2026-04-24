'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { Locale } from '@/lib/i18n';
import ProtectedSidebarNav from '@/components/layout/ProtectedSidebarNav';

interface ProtectedShellProps {
  locale: Locale;
  children: ReactNode;
}

const pageInfo: Record<string, { titleEn: string; titleKm: string; descEn: string; descKm: string }> = {
  '/profile': {
    titleEn: 'Profile',
    titleKm: 'ប្រវត្តិរូប',
    descEn: 'Manage your personal information',
    descKm: 'គ្រប់គ្រងព័ត៌មានផ្ទាល់ខ្លួនរបស់អ្នក',
  },
  '/role-debug': {
    titleEn: 'Role Debug',
    titleKm: 'ពិនិត្យតួនាទី',
    descEn: 'View your role results and access permissions',
    descKm: 'មើលលទ្ធផលតួនាទី និងសិទ្ធិចូលប្រើរបស់អ្នក',
  },
  '/settings': {
    titleEn: 'Settings',
    titleKm: 'ការកំណត់',
    descEn: 'Manage your account, security, and preferences in one place.',
    descKm: 'គ្រប់គ្រងគណនី សុវត្ថិភាព និងចំណូលចិត្តរបស់អ្នកនៅកន្លែងតែមួយ។',
  },
  '/users': {
    titleEn: 'Users',
    titleKm: 'អ្នកប្រើប្រាស់',
    descEn: 'Manage system users and their contact details.',
    descKm: 'គ្រប់គ្រងអ្នកប្រើប្រាស់ និងព័ត៌មានទំនាក់ទំនងក្នុងប្រព័ន្ធ។',
  },
  '/roles': {
    titleEn: 'Roles',
    titleKm: 'តួនាទី',
    descEn: 'Manage roles and access permissions for users.',
    descKm: 'គ្រប់គ្រងតួនាទី និងសិទ្ធិចូលប្រើសម្រាប់អ្នកប្រើប្រាស់។',
  },
  '/role-user': {
    titleEn: 'Role User',
    titleKm: 'អ្នកប្រើប្រាស់តួនាទី',
    descEn: 'Manage users assigned to each role.',
    descKm: 'គ្រប់គ្រងអ្នកប្រើប្រាស់សម្រាប់តួនាទីនីមួយៗ។',
  },
  '/languages': {
    titleEn: 'Languages',
    titleKm: 'ភាសា',
    descEn: 'Manage available languages.',
    descKm: 'គ្រប់គ្រងភាសាដែលមាន។',
  },
  '/login-audits': {
    titleEn: 'Login Audit Logs',
    titleKm: 'ឯកសារលោការ',
    descEn: 'View detailed login history.',
    descKm: 'មើលលម្អិតពីការចូលប្រើប្រាស់របស់អ្នក។',
  },
  '/dashboard': {
    titleEn: 'NPCH',
    titleKm: 'NPCH',
    descEn: 'National Center for Policy and Humanitarian News',
    descKm: 'មជ្ឈមណ្ឌលជាតិសម្រាប់គោលនយោបាយ និងសំណួរមនុស្ស',
  },
};

export default function ProtectedShell({ locale, children }: ProtectedShellProps) {
  const [desktopSidebarCollapsed, setDesktopSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    function onToggleEvent() {
      if (window.matchMedia('(min-width: 1024px)').matches) {
        setDesktopSidebarCollapsed((prev) => !prev);
        return;
      }
      setMobileSidebarOpen((prev) => !prev);
    }

    window.addEventListener('npch:toggle-sidebar', onToggleEvent as EventListener);
    return () => window.removeEventListener('npch:toggle-sidebar', onToggleEvent as EventListener);
  }, []);

  // Match the current pathname to a page info entry
  const matchedKey = Object.keys(pageInfo).find((key) => pathname.endsWith(key));
  const currentPage = matchedKey ? pageInfo[matchedKey] : {
    titleEn: 'NPCH',
    titleKm: 'NPCH',
    descEn: 'National Center for Policy and Humanitarian News',
    descKm: 'មជ្ឈមណ្ឌលជាតិសម្រាប់គោលនយោបាយ',
  };
  const title = locale === 'km' ? currentPage.titleKm : currentPage.titleEn;
  const desc = locale === 'km' ? currentPage.descKm : currentPage.descEn;

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-100 shadow-sm">
      <div className="flex min-h-[75vh]">
        <ProtectedSidebarNav
          locale={locale}
          collapsed={desktopSidebarCollapsed}
          className={`hidden flex-shrink-0 border-r border-slate-200 bg-slate-50 transition-all duration-200 lg:block ${
            desktopSidebarCollapsed ? 'w-24' : 'w-72'
          }`}
        />

        {mobileSidebarOpen ? (
          <>
            <button
              type="button"
              aria-label="Close sidebar overlay"
              className="fixed inset-0 z-40 bg-black/35 lg:hidden"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <ProtectedSidebarNav
              locale={locale}
              onItemClick={() => setMobileSidebarOpen(false)}
              className="fixed inset-y-0 left-0 z-50 w-72 border-r border-slate-200 bg-slate-50 lg:hidden"
            />
          </>
        ) : null}

        <div className="min-w-0 flex-1">
          <div className="border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
            <div className="flex items-center gap-2">
              <div className="leading-tight">
                <p className="text-[15px] font-semibold text-slate-800">{title}</p>
                <p className="text-xs text-slate-500">{desc}</p>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
