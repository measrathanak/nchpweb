import { NextRequest, NextResponse } from 'next/server';
import { copy, toLocale } from '@/lib/i18n';
import { absoluteUrl } from '@/lib/seo';
import { getArticles } from '@/lib/typo3-client';

const RSS_LIMIT = 50;

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function toRfc822(dateStr: string | undefined): string {
  if (!dateStr) return new Date().toUTCString();
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? new Date().toUTCString() : d.toUTCString();
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ locale: string }> }
) {
  const { locale } = await params;
  const localeValue = toLocale(locale);
  const t = copy[localeValue];

  const channelUrl = absoluteUrl(`/${localeValue}/articles`);
  const feedUrl = absoluteUrl(`/${localeValue}/articles/feed.xml`);
  const title = `${t.seoArticlesTitle} | ${t.seoSiteName}`;
  const description = t.seoArticlesDescription;
  const lang = localeValue === 'km' ? 'km' : 'en';

  let articles: Awaited<ReturnType<typeof getArticles>>['articles'] = [];
  try {
    const data = await getArticles(1, RSS_LIMIT, localeValue);
    articles = data.articles;
  } catch {
    // Serve an empty-but-valid feed if TYPO3 is unreachable
  }

  const items = articles
    .map((a) => {
      const articleUrl = absoluteUrl(`/${localeValue}/article/${a.uid}`);
      const pubDate = toRfc822(a.datetime);
      const titleEsc = escapeXml(a.title);
      const descEsc = escapeXml(a.subtitle ?? a.bodytext?.slice(0, 300) ?? '');
      const authorEsc = a.author ? escapeXml(a.author) : '';
      const categories = (a.categories ?? [])
        .map((c) => `<category>${escapeXml(c.title ?? '')}</category>`)
        .join('');

      return `
    <item>
      <title>${titleEsc}</title>
      <link>${articleUrl}</link>
      <guid isPermaLink="true">${articleUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      ${descEsc ? `<description>${descEsc}</description>` : ''}
      ${authorEsc ? `<author>${authorEsc}</author>` : ''}
      ${categories}
    </item>`;
    })
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(title)}</title>
    <link>${channelUrl}</link>
    <description>${escapeXml(description)}</description>
    <language>${lang}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=600, s-maxage=600, stale-while-revalidate=86400',
    },
  });
}
