import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { ConfigurationError } from "./configuration-error";

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
  if (!configured && process.env.NODE_ENV === "production") throw new ConfigurationError("APP_URL", "missing");
  const origin = URL.parse(configured ?? "http://localhost:3000");
  if (!origin || !["https:", "http:"].includes(origin.protocol) || origin.username || origin.password
    || origin.pathname !== "/" || origin.search || origin.hash) {
    throw new ConfigurationError("APP_URL", "invalid");
  }
  return new URL(path, origin).href;
}
