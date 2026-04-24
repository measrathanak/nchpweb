import { NextRequest, NextResponse } from "next/server";
import { searchArticles } from "@/lib/typo3-client";
import { getApiMessages } from "@/app/api/typo3/_shared/messages";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const language = searchParams.get("language") ?? "en";
  const t = getApiMessages(language);

  try {
    const q = (searchParams.get("q") ?? "").trim();
    const limit = Number(searchParams.get("limit") ?? "20");

    if (!q) {
      return NextResponse.json({ results: [], total: 0 });
    }

    const data = await searchArticles(q, limit, language);
    return NextResponse.json(data);
  } catch (error) {
    console.error("API /typo3/search failed:", error);
    return NextResponse.json({ error: t.searchFailed }, { status: 500 });
  }
}
