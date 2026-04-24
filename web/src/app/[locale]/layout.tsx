import type { Metadata } from "next";
import { copy, toLocale } from "@/lib/i18n";

interface Props {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const localeValue = toLocale(locale);
  const t = copy[localeValue];

  return {
    title: t.siteName,
    description: t.homeIntro,
    alternates: {
      canonical: `/${localeValue}`,
      languages: {
        en: "/en",
        km: "/km",
      },
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  await params;

  return <>{children}</>;
}
