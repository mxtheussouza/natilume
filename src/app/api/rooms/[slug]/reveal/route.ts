import { errorResponse, json, readJson } from "@/server/http";
import { revealParticipant } from "@/server/rooms";
import { participantPattern } from "@/server/urls";

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const input = await readJson(request, 1024);
    if (!input || typeof input !== "object" || !("participantId" in input)
      || typeof input.participantId !== "string" || !participantPattern.test(input.participantId)) {
      return json({ error: "Selecione um nome válido." }, 400);
    }

    const result = await revealParticipant((await params).slug, input.participantId);
    if (result.status === 200) return json({ recipientName: result.recipientName });
    if (result.status === 409) return json({ error: "Esse nome já fez a revelação." }, 409);
    return json({ error: "Nome ou sala não encontrado." }, 404);
  } catch (error) {
    return errorResponse(error);
  }
}
