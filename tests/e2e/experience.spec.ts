import { randomUUID } from "node:crypto";
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
    await expect(dialog.getByRole("button", { name: "Voltar" })).toBeFocused();
    await expectAccessible(room);
    await room.keyboard.press("Escape");
    await expect(reveal).toBeFocused();
    await room.keyboard.press("Enter");
    await room.keyboard.press("Tab");
    await expect(dialog.getByRole("button", { name: "Confirmar e revelar" })).toBeFocused();
    await room.keyboard.press("Enter");
    const result = room.getByRole("heading", { name: "Você tirou Lívia" });
    await expect(result).toBeFocused();
    await expect(room.getByText(/Anote antes de ocultar/)).toBeVisible();
    await expect(room.locator(".result-card")).toHaveCSS("animation-name", "none");
    await expectNoHorizontalOverflow(room);
    await expectAccessible(room);
    await room.getByRole("button", { name: "Ocultar resultado" }).click();
    await expect(result).toHaveCount(0);
    await room.reload();
    await expect(result).toHaveCount(0);
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
