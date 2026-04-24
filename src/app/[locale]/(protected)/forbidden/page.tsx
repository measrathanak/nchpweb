import Link from 'next/link';
import { Locale } from '@/lib/i18n';

interface ForbiddenPageProps {
  params: Promise<{ locale: string }>;
}

export default async function ForbiddenPage({ params }: ForbiddenPageProps) {
  const { locale } = await params;
  const localeValue = locale as Locale;

  return (
    <div className="max-w-2xl mx-auto py-12 text-center space-y-4">
      <h1 className="text-3xl font-bold">
        {localeValue === 'km' ? 'មិនអនុញ្ញាត' : 'Access Denied'}
      </h1>
      <p className="text-gray-600">
        {localeValue === 'km'
          ? 'អ្នកមិនមានសិទ្ធិចូលប្រើទំព័រនេះទេ។'
          : 'You do not have permission to view this page.'}
      </p>
      <Link href={`/${localeValue}`} className="text-blue-600 hover:text-blue-800">
        {localeValue === 'km' ? 'ត្រឡប់ទៅទំព័រដើម' : 'Back to Home'}
      </Link>
    </div>
  );
}
