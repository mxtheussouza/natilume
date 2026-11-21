import { randomBytes, randomUUID } from "node:crypto";
import { expect, test, type APIRequestContext } from "@playwright/test";
import type { CreatedRoom, PublicRoom } from "@/lib/contracts";

async function create(request: APIRequestContext) {
  const suffix = randomUUID();
  const participants = [`Olívia ${suffix}`, `Tomás ${suffix}`];
  const response = await request.post("/api/rooms", {
    data: { name: "Presentes da turma", participants },
  });
  expect(response.status()).toBe(201);
  const links: CreatedRoom = await response.json();
  const roomPath = new URL(links.roomUrl).pathname;
  const secret = new URL(links.adminUrl).pathname.split("/").at(-1)!;
  const apiPath = roomPath.replace("/sala/", "/api/rooms/");
  const room: PublicRoom = await (await request.get(apiPath)).json();
  return { roomPath, apiPath, secret, room };
}

test("duas requisições HTTP concorrentes entregam só um resultado", async ({ playwright, request, baseURL }) => {
  const { apiPath, room } = await create(request);
  const [first, second] = room.availableParticipants;
  const peer = await playwright.request.newContext({ baseURL });
  const payload = { data: { participantId: first.id } };
  try {
    const responses = await Promise.all([
      request.post(`${apiPath}/reveal`, payload),
      peer.post(`${apiPath}/reveal`, payload),
    ]);
    expect(responses.map((response) => response.status()).sort()).toEqual([200, 409]);
    const winner = responses.find((response) => response.ok())!;
    const conflict = responses.find((response) => response.status() === 409)!;
    expect(winner.headers()["cache-control"]).toContain("no-store");
    expect(conflict.headers()["cache-control"]).toContain("no-store");
    expect(await winner.json()).toEqual({ recipientName: second.name });
    expect(await conflict.json()).toEqual({ error: expect.any(String) });
    const updated: PublicRoom = await (await request.get(apiPath)).json();
    expect(updated.availableParticipants).toEqual([second]);
  } finally {
    await peer.dispose();
  }
});

test("HTML, RSC e JSON públicos só carregam os nomes pendentes", async ({ request }) => {
  const { roomPath, apiPath, secret, room } = await create(request);
  const [first, second] = room.availableParticipants;
  const reveal = await request.post(`${apiPath}/reveal`, { data: { participantId: first.id } });
  expect(reveal.ok()).toBe(true);
  const resources: { path: string; type: string; headers: Record<string, string> }[] = [
    { path: roomPath, type: "text/html", headers: {} },
    { path: `${roomPath}?_rsc=check`, type: "text/x-component", headers: { RSC: "1" } },
    { path: apiPath, type: "application/json", headers: {} },
  ];
  for (const resource of resources) {
    const response = await request.get(resource.path, { headers: resource.headers });
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain(resource.type);
    expect(response.headers()["cache-control"]).toContain("no-store");
    expect(response.headers()["referrer-policy"]).toBe("no-referrer");
    const body = await response.text();
    expect(body).toContain(second.name);
    for (const privateValue of [secret, "drawnToParticipantId", "adminTokenHash", "normalizedName", "recipientName", first.name, first.id]) {
      expect(body).not.toContain(privateValue);
    }
  }

  const missing = await request.get(`/sala/${randomBytes(16).toString("base64url")}`);
  expect(missing.status()).toBe(404);
});

test("resposta perdida depois do commit mantém o nome consumido", async ({ page, request }) => {
  const { apiPath, roomPath, room } = await create(request);
  const [first] = room.availableParticipants;
  await page.route(`**${apiPath}/reveal`, async (route) => {
    const committed = await route.fetch();
    expect(committed.ok()).toBe(true);
    await route.abort("connectionreset");
  });

  await page.goto(roomPath);
  await page.getByLabel("Seu nome").selectOption(first.id);
  await page.getByRole("button", { name: "Revelar meu Amigo Secreto" }).click();
  await page.getByRole("button", { name: "Confirmar e revelar" }).click();
  await expect(page.getByRole("alert").filter({ hasText: /Se a revelação foi registrada/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Você tirou/ })).toHaveCount(0);
  await page.getByRole("button", { name: "Atualizar lista" }).click();
  await expect(page.getByRole("option", { name: first.name })).toHaveCount(0);
  const repeat = await request.post(`${apiPath}/reveal`, { data: { participantId: first.id } });
  expect(repeat.status()).toBe(409);
  expect(await repeat.json()).toEqual({ error: expect.any(String) });
});

test("busca nomes em salas grandes sem renderizar todas as opções", async ({ page, request }) => {
  const participants = Array.from({ length: 105 }, (_, index) => `Convidado ${String(index + 1).padStart(3, "0")}`);
  const created = await request.post("/api/rooms", { data: { name: "Natal do bairro", participants } });
  const { roomUrl, adminUrl }: CreatedRoom = await created.json();
  await page.goto(roomUrl);
  await expect(page.getByRole("option")).toHaveCount(76);
  await page.getByLabel("Buscar nome").fill("CONVIDADO 105");
  await expect(page.getByRole("option", { name: "Convidado 105" })).toHaveCount(1);
  await expect(page.getByRole("option")).toHaveCount(2);

  await page.goto(adminUrl);
  await expect(page.getByRole("row")).toHaveCount(51);
  await page.getByRole("button", { name: "Próxima" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Página 2 de 3" })).toBeVisible();
  await page.getByLabel("Buscar participante").fill("convidado 105");
  await expect(page.getByRole("row", { name: "Convidado 105 Pendente" })).toBeVisible();
  await expect(page.getByRole("row")).toHaveCount(2);
});
