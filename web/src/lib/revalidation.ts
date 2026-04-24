import { createHmac, timingSafeEqual } from "node:crypto";
import { locales, toLocale } from "@/lib/i18n";

export type RevalidationScope = "all" | "article";

interface RevalidationPathsOptions {
  uid?: number;
  locales?: string[];
  scope?: RevalidationScope;
}

interface RevalidationPayloadLike {
  scope?: RevalidationScope;
  uid?: number;
  locales?: string[];
}

const DEFAULT_TIMESTAMP_TOLERANCE_SECONDS = 300;

function normalizeLocales(input?: string[]) {
  if (!input || input.length === 0) {
    return [...locales];
  }

  return Array.from(new Set(input.map((locale) => toLocale(locale))));
}

export function getRevalidationPaths({ uid, locales: requestedLocales, scope = "all" }: RevalidationPathsOptions) {
  const targetLocales = normalizeLocales(requestedLocales);
  const paths = new Set<string>(["/sitemap.xml"]);

  for (const locale of targetLocales) {
    paths.add(`/${locale}`);
    paths.add(`/${locale}/articles`);

    if (scope === "article" && Number.isFinite(uid) && (uid ?? 0) > 0) {
      paths.add(`/${locale}/article/${uid}`);
    }
  }

  return Array.from(paths);
}

export function canonicalizeRevalidationPayload(payload: RevalidationPayloadLike) {
  const canonical: RevalidationPayloadLike = {};

  if (payload.scope) canonical.scope = payload.scope;
  if (typeof payload.uid === "number" && Number.isFinite(payload.uid)) canonical.uid = payload.uid;
  if (Array.isArray(payload.locales) && payload.locales.length > 0) canonical.locales = [...payload.locales];

  return JSON.stringify(canonical);
}

export function createRevalidationSignature(body: string, timestamp: string, secret: string) {
  return createHmac("sha256", secret).update(`${timestamp}.${body}`).digest("hex");
}

export function isValidRevalidationSecret(secret: string | null) {
  const expected = process.env.REVALIDATE_SECRET;
  return Boolean(expected && secret === expected);
}

function getTimestampToleranceSeconds() {
  const raw = Number(process.env.REVALIDATE_TIMESTAMP_TOLERANCE_SECONDS);
  if (!Number.isFinite(raw) || raw <= 0) return DEFAULT_TIMESTAMP_TOLERANCE_SECONDS;
  return Math.floor(raw);
}

export function isFreshTimestamp(timestamp: string, now = Date.now()) {
  const parsed = Number(timestamp);
  if (!Number.isFinite(parsed) || parsed <= 0) return false;
  return Math.abs(now - parsed) <= getTimestampToleranceSeconds() * 1000;
}

export function isValidRevalidationSignature(body: string, timestamp: string, signature: string | null, secret: string | null) {
  if (!signature || !secret || !isFreshTimestamp(timestamp)) return false;

  const expected = createRevalidationSignature(body, timestamp, secret);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (actualBuffer.length !== expectedBuffer.length) return false;
  return timingSafeEqual(actualBuffer, expectedBuffer);
}
