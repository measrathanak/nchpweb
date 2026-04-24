import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import {
  canonicalizeRevalidationPayload,
  getRevalidationPaths,
  isValidRevalidationSecret,
  isValidRevalidationSignature,
  type RevalidationScope,
} from "@/lib/revalidation";

interface RevalidationPayload {
  secret?: string;
  uid?: number;
  locales?: string[];
  scope?: RevalidationScope;
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();

  let payload: RevalidationPayload = {};
  try {
    payload = rawBody ? (JSON.parse(rawBody) as RevalidationPayload) : {};
  } catch {
    payload = {};
  }

  const headerSecret = request.headers.get("x-revalidate-secret");
  const secret = headerSecret ?? payload.secret ?? null;
  const timestamp = request.headers.get("x-revalidate-timestamp") ?? "";
  const signature = request.headers.get("x-revalidate-signature");

  const canonicalBody = canonicalizeRevalidationPayload(payload);

  if (!isValidRevalidationSecret(secret) || !isValidRevalidationSignature(canonicalBody, timestamp, signature, secret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const paths = getRevalidationPaths({
    uid: payload.uid,
    locales: payload.locales,
    scope: payload.scope ?? "all",
  });

  for (const path of paths) {
    revalidatePath(path);
  }

  return NextResponse.json({ revalidated: true, paths });
}
