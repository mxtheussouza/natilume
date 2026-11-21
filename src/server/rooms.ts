import "server-only";
import { randomUUID } from "node:crypto";
import type { CreatedRoom, PublicRoom } from "@/lib/contracts";
import { validateRoom } from "@/lib/validation";
import { getDb } from "./db";
import { drawRecipients } from "./draw";
import { appUrl, hashAdminToken, roomSecrets, slugPattern } from "./urls";

type RoomInput = NonNullable<ReturnType<typeof validateRoom>["data"]>;
const INSERT_BATCH_SIZE = 1_000;

export async function createRoom(input: RoomInput): Promise<CreatedRoom> {
  const id = randomUUID();
  const { publicSlug, adminToken } = roomSecrets();
  const links = {
    roomUrl: appUrl(`/sala/${publicSlug}`),
    adminUrl: appUrl(`/admin/${adminToken}`),
  };
  const ids = input.participants.map(() => randomUUID());
  const recipients = drawRecipients(ids);
  const rows = input.participants.map((participant, index) => ({
    ...participant,
    id: ids[index],
    roomId: id,
    drawnToParticipantId: recipients[index],
  }));

  await getDb().$transaction(async (tx) => {
    await tx.room.create({
      data: { id, name: input.name, publicSlug, adminTokenHash: hashAdminToken(adminToken) },
      select: { id: true },
    });
    // The migration defers the self-reference until all batches are inserted.
    for (let offset = 0; offset < rows.length; offset += INSERT_BATCH_SIZE) {
      await tx.participant.createMany({ data: rows.slice(offset, offset + INSERT_BATCH_SIZE) });
    }
  }, { maxWait: 5_000, timeout: 20_000 });

  return { ...links, totalParticipants: rows.length };
}

export async function getPublicRoom(slug: string): Promise<PublicRoom | null> {
  if (!slugPattern.test(slug)) return null;
  const room = await getDb().room.findUnique({
    where: { publicSlug: slug },
    select: {
      name: true,
      _count: { select: { participants: true } },
      participants: {
        where: { revealedAt: null },
        select: { id: true, name: true },
        orderBy: [{ normalizedName: "asc" }, { id: "asc" }],
      },
    },
  });
  if (!room) return null;
  const pendingCount = room.participants.length;
  return {
    name: room.name,
    totalParticipants: room._count.participants,
    pendingCount,
    availableParticipants: room.participants,
    status: pendingCount ? "active" : "closed",
  };
}

export async function revealParticipant(slug: string, participantId: string) {
  if (!slugPattern.test(slug)) return { status: 404 } as const;

  return getDb().$transaction(async (tx) => {
    const room = await tx.room.findUnique({ where: { publicSlug: slug }, select: { id: true } });
    if (!room) return { status: 404 } as const;

    const { count } = await tx.participant.updateMany({
      where: { id: participantId, roomId: room.id, revealedAt: null },
      data: { revealedAt: new Date() },
    });
    if (count !== 1) {
      const participant = await tx.participant.findUnique({
        where: { id: participantId, roomId: room.id },
        select: { id: true },
      });
      return { status: participant ? 409 : 404 } as const;
    }

    const winner = await tx.participant.findUniqueOrThrow({
      where: { id: participantId, roomId: room.id },
      select: { drawnTo: { select: { name: true } } },
    });
    return { status: 200, recipientName: winner.drawnTo.name } as const;
  }, { isolationLevel: "ReadCommitted", maxWait: 5_000, timeout: 10_000 });
}
