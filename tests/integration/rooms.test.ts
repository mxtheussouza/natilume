import { createHash, randomUUID } from "node:crypto";
import { afterAll, beforeAll, expect, it } from "vitest";
import { POST as createHandler } from "@/app/api/rooms/route";
import { GET as getRoomHandler } from "@/app/api/rooms/[slug]/route";
import { POST as revealHandler } from "@/app/api/rooms/[slug]/reveal/route";
import { GET as getAdminHandler } from "@/app/api/admin/[adminToken]/route";
import type { CreatedRoom, PublicRoom } from "@/lib/contracts";
import { getDb } from "@/server/db";

const origin = "http://localhost:3000";

beforeAll(() => {
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL ?? "postgresql://natilume:local-only@127.0.0.1:56432/natilume_test";
  process.env.APP_URL = origin;
});
afterAll(() => getDb().$disconnect());

function post(path: string, body: unknown) {
  return new Request(new URL(path, origin), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function params(slug: string) {
  return { params: Promise.resolve({ slug }) };
}

async function create(size: number) {
  const name = `Natal ${randomUUID()}`;
  const participants = Array.from({ length: size }, (_, index) => `Convidado ${index + 1}`);
  const response = await createHandler(post("/api/rooms", { name, participants }));
  expect(response.status).toBe(201);
  expect(response.headers.get("cache-control")).toContain("no-store");
  const links: CreatedRoom = await response.json();
  const slug = new URL(links.roomUrl).pathname.split("/").at(-1)!;
  const secret = new URL(links.adminUrl).pathname.split("/").at(-1)!;
  return { name, slug, secret, links };
}

async function read(slug: string): Promise<PublicRoom> {
  const response = await getRoomHandler(new Request(origin), params(slug));
  expect(response.status).toBe(200);
  expect(response.headers.get("cache-control")).toContain("no-store");
  return response.json();
}

function reveal(slug: string, participantId: string) {
  return revealHandler(post(`/api/rooms/${slug}/reveal`, { participantId }), params(slug));
}

it.each([2, 3, 10, 105, 1005])("persiste todos os pares de %d participantes antes da primeira revelação", async (size) => {
  const { slug, secret, name } = await create(size);
  expect(Buffer.from(slug, "base64url")).toHaveLength(16);
  expect(Buffer.from(secret, "base64url")).toHaveLength(24);
  const database = await getDb().room.findUniqueOrThrow({ where: { publicSlug: slug }, include: { participants: true } });
  expect(database.adminTokenHash).toBe(createHash("sha256").update(secret).digest("hex"));
  const ids = new Set(database.participants.map(({ id }) => id));
  expect(ids.size).toBe(size);
  expect(new Set(database.participants.map(({ drawnToParticipantId }) => drawnToParticipantId))).toEqual(ids);
  expect(database.participants.every((item) => item.id !== item.drawnToParticipantId && item.revealedAt === null)).toBe(true);
  const data = await read(slug);
  expect(data).toEqual({
    name, status: "active", totalParticipants: size, pendingCount: size,
    availableParticipants: expect.arrayContaining(database.participants.map(({ id, name }) => ({ id, name }))),
  });
  expect(new Set(data.availableParticipants.map((item) => Object.keys(item).sort().join(",")))).toEqual(new Set(["id,name"]));
  expect(await getRoomHandler(new Request(origin), params(secret))).toHaveProperty("status", 404);
});

it("entrega um resultado único em concorrência e remove somente quem revelou", async () => {
  const { slug } = await create(10);
  const initial = await read(slug);
  const first = initial.availableParticipants[0];
  const responses = await Promise.all([reveal(slug, first.id), reveal(slug, first.id)]);
  expect(responses.map(({ status }) => status).sort()).toEqual([200, 409]);
  const winner = responses.find(({ status }) => status === 200)!;
  const loser = responses.find(({ status }) => status === 409)!;
  expect(winner.headers.get("cache-control")).toContain("no-store");
  expect(winner.headers.get("referrer-policy")).toBe("no-referrer");
  expect(await loser.json()).toEqual({ error: expect.any(String) });
  const persisted = await getDb().participant.findUniqueOrThrow({ where: { id: first.id }, include: { drawnTo: true } });
  expect(persisted.revealedAt).toBeInstanceOf(Date);
  expect(persisted.drawnTo.revealedAt).toBeNull();
  expect(await winner.json()).toEqual({ recipientName: persisted.drawnTo.name });
  const fresh = await read(slug);
  expect(fresh.availableParticipants).toEqual(initial.availableParticipants.filter(({ id }) => id !== first.id));
  expect(fresh.pendingCount).toBe(9);
  const repeat = await reveal(slug, first.id);
  expect(repeat.status).toBe(409);
  expect(await repeat.json()).toEqual({ error: expect.any(String) });
});

it("revela participantes diferentes em paralelo e fecha a sala", async () => {
  const { slug } = await create(3);
  const { availableParticipants } = await read(slug);
  const responses = await Promise.all(availableParticipants.map(({ id }) => reveal(slug, id)));
  expect(responses.every(({ status }) => status === 200)).toBe(true);
  const names = await Promise.all(responses.map(async (response) => (await response.json()).recipientName));
  expect(new Set(names)).toEqual(new Set(availableParticipants.map(({ name }) => name)));
  expect(await read(slug)).toMatchObject({ pendingCount: 0, status: "closed", availableParticipants: [] });
});

it("rejeita IDs inválidos, inexistentes e de outra sala", async () => {
  const [first, second] = await Promise.all([create(2), create(2)]);
  const foreign = (await read(second.slug)).availableParticipants[0];
  for (const [id, status] of [["invalido", 400], [randomUUID(), 404], [foreign.id, 404]] as const) {
    const response = await reveal(first.slug, id);
    expect(response.status).toBe(status);
    expect(await response.json()).toEqual({ error: expect.any(String) });
  }
  expect((await read(second.slug)).pendingCount).toBe(2);
});

it("recusa JSON malformado e corpos grandes sem depender de Content-Length", async () => {
  const headers = { "Content-Type": "application/json" };
  const invalid = await createHandler(new Request(origin, { method: "POST", headers, body: "[" }));
  expect(invalid.status).toBe(400);
  const oversized = await createHandler(new Request(origin, { method: "POST", headers, body: "a".repeat(256 * 1024 + 1) }));
  expect(oversized.status).toBe(413);
});

it("reserva o andamento nominal ao token administrativo sem expor pares", async () => {
  const { name, slug, secret, links } = await create(2);
  const request = (adminToken: string) => getAdminHandler(new Request(origin), { params: Promise.resolve({ adminToken }) });
  const { availableParticipants } = await read(slug);
  const [first, second] = availableParticipants;
  await reveal(slug, first.id);

  const admin = await request(secret);
  expect(admin.status).toBe(200);
  expect(admin.headers.get("cache-control")).toContain("no-store");
  expect(admin.headers.get("referrer-policy")).toBe("no-referrer");
  expect(await admin.json()).toEqual({
    name,
    totalParticipants: 2,
    revealedCount: 1,
    pendingCount: 1,
    participants: [{ name: first.name, revealed: true }, { name: second.name, revealed: false }],
    publicUrl: links.roomUrl,
  });
  for (const token of [slug, randomUUID().replaceAll("-", ""), "inválido"]) {
    const forbidden = await request(token);
    expect(forbidden.status).toBe(404);
    expect(await forbidden.json()).toEqual({ error: "Painel não encontrado." });
  }
  expect((await read(slug)).availableParticipants).toEqual([second]);
});
