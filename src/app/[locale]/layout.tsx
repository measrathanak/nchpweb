import React from 'react';
import { Locale, locales } from '@/lib/i18n';
import Header from '@/components/layout/Header';
import ProtectedTopbarActions from '@/components/layout/ProtectedTopbarActions';
import AuthMenu from '@/components/auth/AuthMenu';
import { auth } from '@/auth';
import { getUserRole, hasRoleAccess } from '@/lib/auth/roles';
import type { Metadata } from 'next';

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{
    locale: string;
  }>;
}

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: 'NPCH Website',
  description: 'National Center for Policy and Humanitarian News',
};

export default async function LocaleLayout({ children, params }: LayoutProps) {
  const { locale } = await params;
  const localeValue = locale as Locale;
  const session = await auth();
  const role = getUserRole(session?.user?.email);

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
          <div className="w-full px-4 py-4 flex justify-between items-center">
            <Header locale={localeValue} />
            <div className="flex items-center gap-3">
              <AuthMenu
                locale={localeValue}
                isAuthenticated={Boolean(session?.user)}
                canAccessDashboard={hasRoleAccess(role, 'editor')}
                userName={session?.user?.name}
              />
              <ProtectedTopbarActions locale={localeValue} userName={session?.user?.name ?? null} />
            </div>
          </div>
        </header>

        <main className="w-full px-4 py-6">
          {children}
        </main>

        <footer className="mt-16 border-t border-gray-200 bg-gray-50">
          <div className="w-full px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div>
                <h3 className="font-bold mb-4">
                  {localeValue === 'km' ? 'អំពីយើង' : 'About Us'}
                </h3>
                <p className="text-gray-600 text-sm">
                  {localeValue === 'km'
                    ? 'មជ្ឈមណ្ឌលជាតិសម្រាប់គោលនយោបាយ និងសូត្របាង មនុស្ស'
                    : 'National Center for Policy and Humanitarian News'}
                </p>
              </div>
              <div>
                <h3 className="font-bold mb-4">
                  {localeValue === 'km' ? 'ទំនាក់ទំនង' : 'Contact'}
                </h3>
                <p className="text-gray-600 text-sm">
                  Email: info@npch.org
                  <br />
                  Phone: +855 (0) 23 123 456
                </p>
              </div>
              <div>
                <h3 className="font-bold mb-4">
                  {localeValue === 'km' ? 'តម្នាក់ទម្រង់' : 'Links'}
                </h3>
                <ul className="text-gray-600 text-sm space-y-1">
                  <li>
                    <a href="#" className="hover:text-blue-600">
                      {localeValue === 'km' ? 'គោលនយោបាយ' : 'Privacy'}
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-blue-600">
                      {localeValue === 'km' ? 'លក្ខខ័ណ្ឌ' : 'Terms'}
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-200 pt-8 text-center text-sm text-gray-600">
              <p>
                © {new Date().getFullYear()} NPCH. All rights reserved. |{' '}
                {localeValue === 'km'
                  ? 'សាលព្វហេតុដោយ Next.js + TYPO3'
                  : 'Built with Next.js + TYPO3'}
              </p>
            </div>
          </div>
        </footer>
    </>
  );
}
