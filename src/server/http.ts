import "server-only";
import { ConfigurationError } from "./configuration-error";

class InputError extends Error {
  constructor(readonly status: number, message: string) {
    super(message);
  }
}

export function json(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      "Cache-Control": "private, no-store",
      "Referrer-Policy": "no-referrer",
      "X-Robots-Tag": "noindex, nofollow, noarchive",
    },
  });
}

function diagnosticCode(error: unknown) {
  if (!error || typeof error !== "object") return undefined;
  const code = "code" in error ? error.code : "errorCode" in error ? error.errorCode : undefined;
  if (typeof code === "string" && /^(?:P\d{4}|ERR_INVALID_URL|ENOTFOUND|EAI_AGAIN|ECONNREFUSED|ECONNRESET|ETIMEDOUT)$/u.test(code)) {
    return code;
  }
}

export function logInternalError(error: unknown, operation: string) {
  const details = error instanceof ConfigurationError
    ? { variable: error.variable, problem: error.problem }
    : { code: diagnosticCode(error) ?? "unknown" };
  console.error("[natilume] Falha interna.", { operation, ...details });
}

export function errorResponse(error: unknown, operation: string) {
  if (error instanceof InputError) return json({ error: error.message }, error.status);
  logInternalError(error, operation);
  return json({ error: "O serviço está indisponível agora. Tente atualizar a página." }, 500);
}

export async function readJson(request: Request, maxBytes: number): Promise<unknown> {
  const type = request.headers.get("content-type")?.split(";")[0].trim().toLowerCase();
  if (type !== "application/json") throw new InputError(415, "Envie um corpo JSON.");
  const oversized = () => new InputError(413, `O conteúdo excede o limite técnico de ${maxBytes / 1024} KiB.`);
  if (Number(request.headers.get("content-length")) > maxBytes) throw oversized();

  const reader = request.body?.getReader();
  if (!reader) throw new InputError(400, "Envie um corpo JSON válido.");
  const buffer = new Uint8Array(maxBytes);
  let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (length + value.byteLength > maxBytes) {
        await reader.cancel().catch(() => undefined);
        throw oversized();
      }
      buffer.set(value, length);
      length += value.byteLength;
    }
    return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(buffer.subarray(0, length)));
  } catch (error) {
    if (error instanceof InputError) throw error;
    throw new InputError(400, "Envie um corpo JSON válido.");
  } finally {
    reader.releaseLock();
  }
}
