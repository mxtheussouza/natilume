import { getAdminRoom } from "@/server/admin";
import { errorResponse, json } from "@/server/http";

export async function GET(_: Request, { params }: { params: Promise<{ adminToken: string }> }) {
  try {
    const room = await getAdminRoom((await params).adminToken);
    return room ? json(room) : json({ error: "Painel não encontrado." }, 404);
  } catch (error) {
    return errorResponse(error);
  }
}
