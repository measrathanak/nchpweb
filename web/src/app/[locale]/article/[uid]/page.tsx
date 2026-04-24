import Link from "next/link";
import { copy, toLocale } from "@/lib/i18n";
import { getArticle } from "@/lib/typo3-client";

interface Props {
  params: Promise<{ locale: string; uid: string }>;
}

export default async function ArticleDetailPage({ params }: Props) {
  const { locale, uid } = await params;
  const localeValue = toLocale(locale);
  const t = copy[localeValue];
  const articleUid = Number(uid);

  const article = Number.isFinite(articleUid) && articleUid > 0
    ? await getArticle(articleUid, localeValue)
    : null;

  if (!article) {
    return (
      <main className="mx-auto max-w-3xl space-y-4 p-6">
        <h1 className="text-3xl font-bold">{t.articleNotFound}</h1>
        <Link href={`/${localeValue}/articles`} className="underline">
          {t.backToArticles}
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl space-y-6 p-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">{article.title}</h1>
        {article.subtitle ? <p className="text-gray-600">{article.subtitle}</p> : null}
      </header>

      {article.bodytext ? (
        <article className="prose max-w-none">
          <div dangerouslySetInnerHTML={{ __html: article.bodytext }} />
        </article>
      ) : (
        <p className="text-gray-500">{t.empty}</p>
      )}

      <footer>
        <Link href={`/${localeValue}/articles`} className="underline">
          {t.backToArticles}
        </Link>
      </footer>
    </main>
  );
}
