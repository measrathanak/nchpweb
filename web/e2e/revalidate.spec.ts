import { createHmac } from "node:crypto";
import { expect, test } from "@playwright/test";

function sign(payload: Record<string, unknown>, secret = "playwright-secret") {
  const body = JSON.stringify(payload);
  const timestamp = String(Date.now());
  const signature = createHmac("sha256", secret).update(`${timestamp}.${body}`).digest("hex");

  return {
    body,
    headers: {
      "content-type": "application/json",
      "x-revalidate-secret": secret,
      "x-revalidate-timestamp": timestamp,
      "x-revalidate-signature": signature,
    },
  };
}

test.describe("revalidation endpoint", () => {
  test("rejects requests without auth headers", async ({ request }) => {
    const response = await request.post("/api/revalidate", {
      data: { scope: "all" },
    });

    expect(response.status()).toBe(401);
    await expect(response.json()).resolves.toMatchObject({ error: "Unauthorized" });
  });

  test("rejects requests with an invalid signature", async ({ request }) => {
    const timestamp = String(Date.now());
    const response = await request.post("/api/revalidate", {
      headers: {
        "content-type": "application/json",
        "x-revalidate-secret": "playwright-secret",
        "x-revalidate-timestamp": timestamp,
        "x-revalidate-signature": "invalid-signature",
      },
      data: { scope: "all" },
    });

    expect(response.status()).toBe(401);
    await expect(response.json()).resolves.toMatchObject({ error: "Unauthorized" });
  });

  test("accepts valid signed requests", async ({ request }) => {
    const payload = { scope: "article", uid: 42, locales: ["km"] };
    const signed = sign(payload);

    const response = await request.post("/api/revalidate", {
      headers: signed.headers,
      data: payload,
    });

    expect(response.status()).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      revalidated: true,
      paths: [
        "/sitemap.xml",
        "/km",
        "/km/articles",
        "/km/article/42",
      ],
    });
  });
});
