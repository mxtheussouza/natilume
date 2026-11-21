import { expect, it } from "vitest";
import { drawRecipients } from "@/server/draw";

function seededRandom(seed: number) {
  return (max: number) => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return Math.floor(seed / 2 ** 32 * max);
  };
}

it.each([2, 3, 10, 100, 1000])("gera bijeções sem pontos fixos para %d pessoas", (size) => {
  const ids = Array.from({ length: size }, (_, index) => `id-${index}`);
  for (let seed = 1; seed <= 24; seed++) {
    const recipients = drawRecipients(ids, seededRandom(seed));
    expect(new Set(recipients)).toEqual(new Set(ids));
    expect(recipients.every((recipient, index) => recipient !== ids[index])).toBe(true);
  }
});

it("usa o deslocamento cíclico quando o embaralhamento repete a identidade", () => {
  expect(drawRecipients(["a", "b", "c"], (max) => max - 1)).toEqual(["c", "a", "b"]);
});

it("recusa origens insuficientes ou repetidas", () => {
  expect(() => drawRecipients(["a"])).toThrow();
  expect(() => drawRecipients(["a", "a"])).toThrow();
});
