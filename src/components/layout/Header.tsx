"use client";

import Link from 'next/link';
import { Locale } from '@/lib/i18n';
import SidebarToggleButton from '@/components/layout/SidebarToggleButton';

interface HeaderProps {
  locale: Locale;
}

export default function Header({ locale }: HeaderProps) {
  return (
    <div className="bg-white">
      <div className="px-0 py-0">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">NPCH Website</h1>
            <p className="mt-1 text-gray-600">{locale === 'km' ? 'សូស្វាគមន៍' : 'Welcome'}</p>
          </div>
          <SidebarToggleButton className="hidden md:inline-flex" ariaLabel="Toggle management menu" />
        </div>
      </div>
    </div>
  );
}
