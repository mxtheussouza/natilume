import { expect, test } from "@playwright/test";

test("confirma a conexão real com o PostgreSQL sem cache", async ({ request }) => {
  const response = await request.get("/api/health");

  expect(response.status()).toBe(200);
  expect(response.headers()["cache-control"]).toContain("no-store");
  expect(await response.json()).toEqual({ status: "ok", database: "connected" });
});
