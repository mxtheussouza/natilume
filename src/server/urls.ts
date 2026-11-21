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
  return new URL(path, process.env.APP_URL ?? "http://localhost:3000").href;
}
