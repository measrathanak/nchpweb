export interface Typo3Article {
  uid: number;
  title: string;
  subtitle?: string;
  datetime?: string;
  bodytext?: string;
  author?: string;
  categories?: Array<{ uid?: number; title?: string; slug?: string }>;
  tags?: string[];
}

interface ArticlesResponse {
  articles: Typo3Article[];
  total: number;
}

interface ArticleResponse {
  article: Typo3Article | null;
}

function getAuthHeader() {
  const username = process.env.TYPO3_API_USERNAME;
  const password = process.env.TYPO3_API_PASSWORD;

  if (!username || !password) return undefined;

  const token = Buffer.from(`${username}:${password}`).toString("base64");
  return { Authorization: `Basic ${token}` } satisfies HeadersInit;
}

function getBaseUrl() {
  return process.env.TYPO3_API_BASE_URL ?? "http://localhost:8888/typo3rest";
}

function getRevalidateSeconds() {
  const value = Number(process.env.TYPO3_API_REVALIDATE_SECONDS ?? "300");
  if (!Number.isFinite(value) || value < 0) return 300;
  return Math.floor(value);
}

/** Exported for testability */
export const getTypo3RevalidateSeconds = getRevalidateSeconds;

function getFetchOptions(): RequestInit {
  return {
    headers: {
      "Content-Type": "application/json",
      ...(getAuthHeader() ?? {}),
    },
    next: { revalidate: getRevalidateSeconds() },
  };
}

export async function getArticles(page = 1, limit = 10, language = "en"): Promise<ArticlesResponse> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    language,
  });

  const response = await fetch(`${getBaseUrl()}/articles?${params.toString()}`, getFetchOptions());

  if (!response.ok) {
    throw new Error(`TYPO3 getArticles failed: ${response.status}`);
  }

  const data = (await response.json()) as Partial<ArticlesResponse>;
  return {
    articles: data.articles ?? [],
    total: data.total ?? 0,
  };
}

export async function searchArticles(q: string, limit = 20, language = "en") {
  const params = new URLSearchParams({ q, limit: String(limit), language });
  const response = await fetch(`${getBaseUrl()}/search?${params.toString()}`, getFetchOptions());

  if (!response.ok) {
    throw new Error(`TYPO3 search failed: ${response.status}`);
  }

  const data = (await response.json()) as { results?: Typo3Article[]; total?: number };
  return { results: data.results ?? [], total: data.total ?? 0 };
}

export async function getArticle(uid: number, language = "en") {
  const params = new URLSearchParams({ language });
  const response = await fetch(`${getBaseUrl()}/articles/${uid}?${params.toString()}`, getFetchOptions());

  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`TYPO3 getArticle failed: ${response.status}`);

  const data = (await response.json()) as Typo3Article | ArticleResponse;
  if ("article" in data) return data.article ?? null;
  return data;
}
