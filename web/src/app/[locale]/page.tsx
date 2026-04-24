import Link from "next/link";
import { copy, toLocale } from "@/lib/i18n";
import { getArticles } from "@/lib/typo3-client";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function LocaleHomePage({ params }: Props) {
  const { locale } = await params;
  const localeValue = toLocale(locale);
  const t = copy[localeValue];

  let items: Array<{ uid: number; title: string; subtitle?: string }> = [];

  try {
    const data = await getArticles(1, 6, localeValue);
    items = data.articles;
  } catch (error) {
    console.error("Failed to fetch TYPO3 articles:", error);
  }

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">{t.homeTitle}</h1>
        <p className="text-gray-600">{t.homeIntro}</p>
        <div className="flex gap-3 text-sm">
          <Link href="/en" className="underline">English</Link>
          <Link href="/km" className="underline">ខ្មែរ</Link>
          <Link href={`/${localeValue}/articles`} className="underline">{t.browseAll}</Link>
        </div>
      </header>

      {items.length === 0 ? (
        <p className="text-gray-500">{t.empty}</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.uid} className="space-y-2 rounded border p-4">
              <h2 className="text-lg font-semibold">{item.title}</h2>
              {item.subtitle ? <p className="text-gray-600">{item.subtitle}</p> : null}
              <Link href={`/${localeValue}/article/${item.uid}`} className="underline">
                {t.readMore}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
