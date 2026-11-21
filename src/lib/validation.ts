export const ROOM_NAME_LENGTH = 100;
export const PARTICIPANT_NAME_LENGTH = 80;
export const ROOM_BODY_BYTES = 256 * 1024;

export function tidyName(name: string) {
  return name.normalize("NFC").replace(/\s+/gu, " ").trim();
}

export function nameKey(name: string) {
  return tidyName(name).toLocaleLowerCase("pt-BR").normalize("NFC");
}

function validName(value: string, max: number) {
  return value.length > 0 && Array.from(value).length <= max && !/[\p{Cc}\p{Cs}]/u.test(value);
}

type RoomInput = { name: string; participants: { name: string; normalizedName: string }[] };
type Validation = { data: RoomInput; error?: never } | { data?: never; error: string };

export function validateRoom(input: unknown): Validation {
  if (!input || typeof input !== "object" || !("name" in input) || typeof input.name !== "string") {
    return { error: "Informe o nome da sala." };
  }
  const name = tidyName(input.name);
  if (!validName(name, ROOM_NAME_LENGTH)) {
    return { error: `Informe um nome de sala válido com até ${ROOM_NAME_LENGTH} caracteres.` };
  }
  if (!("participants" in input) || !Array.isArray(input.participants) || input.participants.length < 2) {
    return { error: "Adicione pelo menos dois participantes." };
  }

  const seen = new Set<string>();
  const participants: RoomInput["participants"] = [];
  for (const [index, raw] of input.participants.entries()) {
    const participantName = typeof raw === "string" ? tidyName(raw) : "";
    if (!validName(participantName, PARTICIPANT_NAME_LENGTH)) {
      return { error: `O nome na linha ${index + 1} deve ter de 1 a ${PARTICIPANT_NAME_LENGTH} caracteres válidos.` };
    }
    const normalizedName = nameKey(participantName);
    if (seen.has(normalizedName)) {
      return { error: `O nome na linha ${index + 1} está repetido. Use nomes ou apelidos distintos.` };
    }
    seen.add(normalizedName);
    participants.push({ name: participantName, normalizedName });
  }
  return { data: { name, participants } };
}
