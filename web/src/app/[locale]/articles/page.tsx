import Link from "next/link";
import { copy, toLocale } from "@/lib/i18n";
import { getArticles, searchArticles } from "@/lib/typo3-client";

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}

export default async function ArticlesPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { q } = await searchParams;
  const localeValue = toLocale(locale);
  const t = copy[localeValue];
  const query = (q ?? "").trim();

  let items: Array<{ uid: number; title: string; subtitle?: string }> = [];

  try {
    if (query) {
      const data = await searchArticles(query, 50, localeValue);
      items = data.results;
    } else {
      const data = await getArticles(1, 50, localeValue);
      items = data.articles;
    }
  } catch (error) {
    console.error("Failed to fetch article list:", error);
  }

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">{t.browseAll}</h1>
        <form className="flex gap-2" action={`/${localeValue}/articles`} method="get">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder={t.searchPlaceholder}
            className="w-full max-w-md rounded border px-3 py-2"
          />
          <button type="submit" className="rounded border px-4 py-2">
            {t.searchButton}
          </button>
        </form>
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
