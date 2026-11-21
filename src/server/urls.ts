import "server-only";
import { createHash, randomBytes } from "node:crypto";

export const slugPattern = /^[A-Za-z0-9_-]{22}$/;
export const participantPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function roomSecrets() {
  return { publicSlug: randomBytes(16).toString("base64url"), adminToken: randomBytes(24).toString("base64url") };
}

export function hashAdminToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function appUrl(path: string) {
  const configured = process.env.APP_URL;
  if (!configured && process.env.NODE_ENV === "production") throw new Error("Configure APP_URL.");
  const origin = new URL(configured ?? "http://localhost:3000");
  if (!["https:", "http:"].includes(origin.protocol) || origin.username || origin.password
    || origin.pathname !== "/" || origin.search || origin.hash) {
    throw new Error("APP_URL deve conter só a origem pública.");
  }
  return new URL(path, origin).href;
}
