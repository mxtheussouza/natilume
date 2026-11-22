import { getDb } from "@/server/db";
import { json, logInternalError } from "@/server/http";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await getDb().$queryRaw`SELECT 1`;
    return json({ status: "ok", database: "connected" });
  } catch (error) {
    logInternalError(error, "GET /api/health");
    return json({ status: "error", database: "unavailable" }, 503);
  }
}
