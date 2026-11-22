import { errorResponse, json } from "@/server/http";
import { getPublicRoom } from "@/server/rooms";

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const room = await getPublicRoom((await params).slug);
    return room ? json(room) : json({ error: "Sala não encontrada." }, 404);
  } catch (error) {
    return errorResponse(error, "GET /api/rooms/[slug]");
  }
}
