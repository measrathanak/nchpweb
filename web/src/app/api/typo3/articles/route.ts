import { NextRequest, NextResponse } from "next/server";
import { getArticles } from "@/lib/typo3-client";
import { getApiMessages } from "@/app/api/typo3/_shared/messages";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const language = searchParams.get("language") ?? "en";
  const t = getApiMessages(language);

  try {
    const page = Number(searchParams.get("page") ?? "1");
    const limit = Number(searchParams.get("limit") ?? "10");
    const data = await getArticles(page, limit, language);
    return NextResponse.json(data);
  } catch (error) {
    console.error("API /typo3/articles failed:", error);
    return NextResponse.json({ error: t.fetchArticlesFailed }, { status: 500 });
  }
}
