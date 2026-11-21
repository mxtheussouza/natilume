import { describe, expect, it } from "vitest";
import { nameKey, tidyName, validateRoom } from "@/lib/validation";

describe("validação da sala", () => {
  it("normaliza Unicode e espaços sem descartar acentos", () => {
    expect(tidyName("  Jose\u0301   da  Silva ")).toBe("José da Silva");
    expect(nameKey("JOSE\u0301")).toBe(nameKey("José"));
    expect(nameKey("Jose")).not.toBe(nameKey("José"));
    expect(validateRoom({ name: "  🎄  Natal ", participants: ["João", "张伟", "ليلى"] }).data?.name).toBe("🎄 Natal");
  });

  it.each([
    null,
    { name: " ", participants: ["Ana", "Bia"] },
    { name: "a".repeat(101), participants: ["Ana", "Bia"] },
    { name: "Natal", participants: ["Ana"] },
    { name: "Natal", participants: ["Ana", "  "] },
    { name: "Natal", participants: ["Ana", 123] },
    { name: "Natal", participants: ["Ana", "a".repeat(81)] },
    { name: "Natal", participants: ["Ana", "\u0000Bia"] },
    { name: "Natal", participants: ["Ana", "\ud800"] },
    { name: "Natal", participants: ["José da Silva", " JOSE\u0301  DA SILVA "] },
  ])("rejeita entrada inválida %j", (input) => {
    expect(validateRoom(input).error).toBeTruthy();
  });

  it("distingue nomes acentuados de nomes sem acento", () => {
    expect(validateRoom({ name: "Natal", participants: ["João", "Joao"] }).error).toBeUndefined();
  });
});
