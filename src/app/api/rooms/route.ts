import { ROOM_BODY_BYTES, validateRoom } from "@/lib/validation";
import { errorResponse, json, readJson } from "@/server/http";
import { createRoom } from "@/server/rooms";

export async function POST(request: Request) {
  try {
    const input = validateRoom(await readJson(request, ROOM_BODY_BYTES));
    if (input.error !== undefined) return json({ error: input.error }, 400);
    return json(await createRoom(input.data), 201);
  } catch (error) {
    return errorResponse(error, "POST /api/rooms");
  }
}
