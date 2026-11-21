import { randomInt } from "node:crypto";

const MAX_ATTEMPTS = 32;

export function drawRecipients(ids: readonly string[], random: (max: number) => number = randomInt) {
  const { length } = ids;
  if (length < 2 || new Set(ids).size !== length) {
    throw new Error("O sorteio exige pelo menos dois IDs distintos.");
  }
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const recipients = [...ids];
    for (let index = length - 1; index > 0; index--) {
      const other = random(index + 1);
      [recipients[index], recipients[other]] = [recipients[other], recipients[index]];
    }
    if (recipients.every((id, index) => id !== ids[index])) return recipients;
  }
  const shift = 1 + random(length - 1);
  return ids.map((_, index) => ids[(index + shift) % length]);
}
