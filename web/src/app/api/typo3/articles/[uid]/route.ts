import { NextRequest, NextResponse } from "next/server";
import { getArticle } from "@/lib/typo3-client";
import { getApiMessages } from "@/app/api/typo3/_shared/messages";

interface Params {
  params: Promise<{ uid: string }>;
}

export async function GET(request: NextRequest, { params }: Params) {
  const { searchParams } = new URL(request.url);
  const language = searchParams.get("language") ?? "en";
  const t = getApiMessages(language);

  try {
    const { uid } = await params;
    const parsedUid = Number(uid);

    if (!Number.isFinite(parsedUid) || parsedUid <= 0) {
      return NextResponse.json({ error: t.invalidArticleUid }, { status: 400 });
    }

    const article = await getArticle(parsedUid, language);
    if (!article) {
      return NextResponse.json({ error: t.articleNotFound }, { status: 404 });
    }

    return NextResponse.json(article);
  } catch (error) {
    console.error("API /typo3/articles/[uid] failed:", error);
    return NextResponse.json({ error: t.fetchArticleFailed }, { status: 500 });
  }
}
