import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

async function expectAccessible(page: Page) {
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(result.violations.map(({ id, nodes }) => ({ id, targets: nodes.map(({ target }) => target) }))).toEqual([]);
}

async function expectNoHorizontalOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(page.viewportSize()!.width);
}

for (const width of [320, 375, 768, 1440]) {
  test(`home e criação cabem em ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    await expect(page.getByRole("heading", { name: /Um segredo/ })).toBeVisible();
    await expectNoHorizontalOverflow(page);
    if (width === 320 || width === 1440) await expectAccessible(page);
    await page.getByRole("link", { name: "Criar minha sala" }).click();
    await expect(page.getByRole("heading", { name: "Crie sua sala" })).toBeVisible();
    await expectNoHorizontalOverflow(page);
    if (width === 320 || width === 1440) await expectAccessible(page);
  });
}

test("mostra os nomes digitados antes de o formulário ficar interativo", async ({ page }) => {
  const scripts = Promise.withResolvers<void>();
  await page.route(/\/_next\/static\/.*\.js(?:\?|$)/, async (route) => {
    await scripts.promise;
    await route.continue();
  });

  const names = page.getByLabel("Participantes", { exact: true });
  try {
    await page.goto("/criar", { waitUntil: "commit" });
    await names.pressSequentially("Ana");
    await names.press("Enter");
    await names.pressSequentially("Beto");
  } finally {
    scripts.resolve();
  }

  const items = page.getByRole("list", { name: "Prévia de participantes" }).getByRole("listitem");
  await expect(items).toHaveText(["Ana", "Beto"]);
  await names.press("Enter");
  await names.pressSequentially("Clara");
  await expect(items).toHaveText(["Ana", "Beto", "Clara"]);
  await names.fill("Ana\nBeto");
  await expect(items).toHaveText(["Ana", "Beto"]);
  await expect(page.getByText("2 nomes na lista")).toBeVisible();
});

test("exibe a mensagem HTTP 500 da API de criação", async ({ page }) => {
  const error = "O serviço está indisponível agora. Tente atualizar a página.";
  await page.route("**/api/rooms", (route) => route.fulfill({ status: 500, json: { error } }));
  await page.goto("/criar");
  await page.getByLabel("Nome da sala").fill("Natal de teste");
  await page.getByLabel("Participantes", { exact: true }).fill("Ana\nBeto");
  await expect(page.getByText("2 nomes na lista")).toBeVisible();
  await page.getByRole("button", { name: "Criar sala e sortear" }).click();
  await expect(page.getByRole("alert").filter({ hasText: error })).toBeVisible();
});

test("cria e copia um link público, revela por teclado e encerra a sala", async ({ page, context, browser }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Ir para o conteúdo" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("main")).toBeFocused();
  await page.getByRole("link", { name: "Criar minha sala" }).click();
  await page.getByRole("button", { name: "Criar sala e sortear" }).click();
  await expect(page.getByRole("alert").filter({ hasText: /nome de sala válido/ })).toBeVisible();
  await page.getByLabel("Nome da sala").fill(`Natal ${randomUUID()}`);
  await page.getByLabel("Participantes", { exact: true }).fill("Clara\nLívia");
  await expect(page.getByText("2 nomes na lista")).toBeVisible();
  await page.getByRole("button", { name: "Criar sala e sortear" }).click();
  await expect(page.getByRole("heading", { name: "Sala criada!" })).toBeFocused();
  await expect(page.getByText("Guarde este link só para você.", { exact: false })).toBeVisible();
  await page.getByRole("button", { name: "Copiar link público" }).click();
  await expect(page.getByText("Link copiado.")).toBeVisible();
  const roomUrl = await page.evaluate(() => navigator.clipboard.readText());
  expect(roomUrl).toMatch(/\/sala\/[\w-]{22}$/);

  const guest = await browser.newContext({ viewport: { width: 320, height: 780 }, reducedMotion: "reduce", isMobile: true, hasTouch: true });
  try {
    await guest.addInitScript(() => {
      Object.defineProperty(navigator, "canShare", { value: () => false });
    });
    const room = await guest.newPage();
    await room.goto(roomUrl);
    await expectNoHorizontalOverflow(room);
    await expectAccessible(room);
    await expect(room.getByText(/Qualquer pessoa com o link/)).toBeVisible();
    await room.getByLabel("Seu nome").selectOption({ label: "Clara" });
    const reveal = room.getByRole("button", { name: "Revelar meu Amigo Secreto" });
    await reveal.focus();
    await room.keyboard.press("Enter");
    const dialog = room.getByRole("dialog", { name: "Você é Clara?" });
    await expect(dialog).toBeVisible();
    await expect(dialog).toMatchAriaSnapshot(`
      - dialog "Você é Clara?":
        - heading "Você é Clara?" [level=2]
        - paragraph
        - button "Voltar"
        - button "Confirmar e revelar"
    `);
    await expect(dialog.getByRole("button", { name: "Voltar" })).toBeFocused();
    await expectAccessible(room);
    await room.keyboard.press("Escape");
    await expect(reveal).toBeFocused();
    await room.keyboard.press("Enter");
    await room.keyboard.press("Tab");
    await expect(dialog.getByRole("button", { name: "Confirmar e revelar" })).toBeFocused();
    await room.keyboard.press("Enter");
    const result = room.getByRole("heading", { name: "Você tirou Lívia" });
    const downloadButton = room.getByRole("button", { name: "Salvar imagem" });
    await expect(result).toBeFocused();
    await expect(room.getByText(/Salve a imagem ou anote o nome/)).toBeVisible();
    await expect(room.locator(".result-card")).toHaveCSS("animation-name", "none");
    await expectNoHorizontalOverflow(room);
    await expectAccessible(room);
    await room.keyboard.press("Tab");
    await expect(downloadButton).toBeFocused();
    const [download] = await Promise.all([room.waitForEvent("download"), room.keyboard.press("Enter")]);
    expect(download.suggestedFilename()).toBe("meu-amigo-secreto.png");
    const png = await readFile(await download.path());
    expect(png.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
    expect(png.readUInt32BE(16)).toBe(1080);
    await expect(result).toBeVisible();
    await room.getByRole("button", { name: "Ocultar resultado" }).click();
    await expect(result).toHaveCount(0);
    await expect(downloadButton).toHaveCount(0);
    await room.reload();
    await expect(result).toHaveCount(0);
    await expect(downloadButton).toHaveCount(0);
    await expect(room.getByRole("option", { name: "Clara" })).toHaveCount(0);
    await room.getByLabel("Seu nome").selectOption({ label: "Lívia" });
    await reveal.click();
    await room.getByRole("button", { name: "Confirmar e revelar" }).click();
    await expect(room.getByRole("heading", { name: "Você tirou Clara" })).toBeVisible();
    await room.reload();
    await expect(room.getByRole("heading", { name: "Sala encerrada" })).toBeVisible();
  } finally {
    await guest.close();
  }
});

test.describe("imagem da revelação no celular", () => {
  test.use({ isMobile: true, hasTouch: true, viewport: { width: 375, height: 812 } });

  test("entrega o PNG ao menu nativo no toque", async ({ page, request }) => {
    const created = await request.post("/api/rooms", {
      data: { name: "Natal de teste", participants: ["Nina", "Sofia"] },
    });
    expect(created.status()).toBe(201);
    const { roomUrl } = await created.json();

    await page.addInitScript(() => {
      Object.defineProperty(navigator, "canShare", {
        value: ({ files }: ShareData) => files?.length === 1 && files[0].type === "image/png",
      });
      Object.defineProperty(navigator, "share", {
        value: async ({ files }: ShareData) => {
          const file = files?.[0];
          if (!file) throw new Error("PNG ausente.");
          const active = navigator.userActivation.isActive;
          const signature = new Uint8Array(await file.slice(0, 8).arrayBuffer());
          document.documentElement.dataset.sharedImage = JSON.stringify({
            name: file.name, type: file.type, active, signature: Array.from(signature),
          });
        },
      });
    });

    await page.goto(roomUrl);
    await page.getByLabel("Seu nome").selectOption({ label: "Nina" });
    await page.getByRole("button", { name: "Revelar meu Amigo Secreto" }).tap();
    await page.getByRole("button", { name: "Confirmar e revelar" }).tap();
    await expect(page.getByText(/escolha a opção de salvar na galeria/)).toBeVisible();
    await page.getByRole("button", { name: "Salvar imagem" }).tap();
    await expect(page.locator("html")).toHaveAttribute("data-shared-image", JSON.stringify({
      name: "meu-amigo-secreto.png", type: "image/png", active: true, signature: [137, 80, 78, 71, 13, 10, 26, 10],
    }));
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: "Baixar PNG" }).tap(),
    ]);
    expect(download.suggestedFilename()).toBe("meu-amigo-secreto.png");
  });
});

test("consulta o painel secreto e atualiza o andamento após recarregar", async ({ page, request, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.setViewportSize({ width: 320, height: 850 });
  const created = await request.post("/api/rooms", {
    data: { name: "Festa de Natal", participants: ["Daniela", "Ester"] },
  });
  expect(created.status()).toBe(201);
  const { adminUrl, roomUrl } = await created.json();
  const room = await request.get(new URL(roomUrl).pathname.replace("/sala/", "/api/rooms/"));
  const { availableParticipants } = await room.json();
  const slug = new URL(roomUrl).pathname.split("/").at(-1);

  const panel = await page.goto(adminUrl);
  expect(panel?.status()).toBe(200);
  expect(panel?.headers()["cache-control"]).toContain("no-store");
  expect(panel?.headers()["referrer-policy"]).toBe("no-referrer");
  expect(panel?.headers()["x-robots-tag"]).toContain("noindex");
  await expect(page.getByText("Guarde o endereço deste painel só para você.", { exact: false })).toBeVisible();
  await expect(page.getByRole("row", { name: "Daniela Pendente" })).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await expectAccessible(page);
  await page.getByRole("button", { name: "Copiar link público" }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(roomUrl);

  const reveal = await request.post(`/api/rooms/${slug}/reveal`, { data: { participantId: availableParticipants[0].id } });
  expect(reveal.status()).toBe(200);
  await page.reload();
  await expect(page.getByRole("row", { name: "Daniela Revelou" })).toBeVisible();
  await expect(page.getByRole("row", { name: "Ester Pendente" })).toBeVisible();

  for (const invalidToken of [slug, randomUUID().replaceAll("-", "")]) {
    const invalid = await page.goto(`/admin/${invalidToken}`);
    expect(invalid?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "Página não encontrada" })).toBeVisible();
  }
});
