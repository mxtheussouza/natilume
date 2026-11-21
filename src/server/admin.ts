import "server-only";
import type { AdminRoom } from "@/lib/contracts";
import { getDb } from "./db";
import { appUrl, hashAdminToken } from "./urls";

export async function getAdminRoom(token: string): Promise<AdminRoom | null> {
  if (!/^[A-Za-z0-9_-]{32}$/.test(token)) return null;

  const room = await getDb().room.findUnique({
    where: { adminTokenHash: hashAdminToken(token) },
    select: {
      name: true,
      publicSlug: true,
      participants: {
        select: { name: true, revealedAt: true },
        orderBy: [{ normalizedName: "asc" }, { id: "asc" }],
      },
    },
  });
  if (!room) return null;

  const participants = room.participants.map(({ name, revealedAt }) => ({ name, revealed: revealedAt !== null }));
  const totalParticipants = participants.length;
  const revealedCount = participants.filter(({ revealed }) => revealed).length;
  return {
    name: room.name,
    totalParticipants,
    revealedCount,
    pendingCount: totalParticipants - revealedCount,
    participants,
    publicUrl: appUrl(`/sala/${room.publicSlug}`),
  };
}
