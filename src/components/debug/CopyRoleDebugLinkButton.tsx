'use client';

import { useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Locale } from '@/lib/i18n';

interface CopyRoleDebugLinkButtonLabels {
  copied: string;
  copyCurrentLink: string;
  openInNewTab: string;
}

interface CopyRoleDebugLinkButtonProps {
  locale: Locale;
  labels?: CopyRoleDebugLinkButtonLabels;
}

export default function CopyRoleDebugLinkButton({ locale, labels }: CopyRoleDebugLinkButtonProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [copied, setCopied] = useState(false);

  const defaultLabels: CopyRoleDebugLinkButtonLabels = {
    copied: locale === 'km' ? 'បានចម្លងតំណ' : 'Link copied',
    copyCurrentLink: locale === 'km' ? 'ចម្លងតំណបច្ចុប្បន្ន' : 'Copy current link',
    openInNewTab: locale === 'km' ? 'បើកផ្ទាំងថ្មី' : 'Open in new tab',
  };

  const text = labels ?? defaultLabels;

  const currentPathWithQuery = (() => {
    const query = searchParams.toString();
    return `${pathname}${query ? `?${query}` : ''}`;
  })();

  const copyLink = async () => {
    const url = `${window.location.origin}${currentPathWithQuery}`;

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={copyLink}
        className="px-3 py-1 rounded border border-amber-300 bg-white text-amber-900 hover:bg-amber-100"
      >
        {copied ? text.copied : text.copyCurrentLink}
      </button>
      <a
        href={currentPathWithQuery}
        target="_blank"
        rel="noreferrer"
        className="px-3 py-1 rounded border border-amber-300 bg-white text-amber-900 hover:bg-amber-100"
      >
        {text.openInNewTab}
      </a>
    </div>
  );
}
