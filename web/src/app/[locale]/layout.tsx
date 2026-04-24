import type { Metadata } from "next";
import { copy, toLocale } from "@/lib/i18n";

interface Props {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

const ogLocaleMap: Record<string, string> = {
  en: "en_US",
  km: "km_KH",
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const localeValue = toLocale(locale);
  const t = copy[localeValue];

  return {
    title: t.seoSiteName,
    description: t.homeIntro,
    alternates: {
      canonical: `/${localeValue}`,
      languages: {
        en: "/en",
        km: "/km",
      },
    },
    openGraph: {
      locale: ogLocaleMap[localeValue] ?? "en_US",
    },
    twitter: {
      card: "summary_large_image",
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  await params;

  return <>{children}</>;
}
