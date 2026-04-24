import React from 'react';
import { Locale } from '@/lib/i18n';
import ProtectedShell from '@/components/layout/ProtectedShell';

interface ProtectedLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function ProtectedLayout({ children, params }: ProtectedLayoutProps) {
  const { locale } = await params;
  const localeValue = locale as Locale;

  return (
    <ProtectedShell locale={localeValue}>
      {children}
    </ProtectedShell>
  );
}
