const WIDTH = 1080;
const NAME_WIDTH = 840;
const NAME_FONT = '700 84px "Fraunces Variable", Georgia, serif';
const LINE_HEIGHT = 104;
const PNG_TYPE = "image/png";
const PNG_PREFIX = `data:${PNG_TYPE};base64,`;
const FILE_NAME = "meu-amigo-secreto.png";

function wrapName(context: CanvasRenderingContext2D, name: string) {
  const characters = typeof Intl.Segmenter === "function"
    ? Array.from(new Intl.Segmenter("pt-BR", { granularity: "grapheme" }).segment(name), ({ segment }) => segment)
    : Array.from(name);
  const lines: string[] = [];
  let line = "";

  for (const character of characters) {
    const next = line + character;
    if (!line || context.measureText(next).width <= NAME_WIDTH) {
      line = next;
      continue;
    }

    const space = next.lastIndexOf(" ");
    if (space > 0) {
      lines.push(next.slice(0, space));
      line = next.slice(space + 1);
    } else {
      lines.push(line);
      line = character;
    }
  }

  if (line) lines.push(line);
  return lines;
}

function renderResultImage(recipientName: string) {
  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas indisponível.");

  context.font = NAME_FONT;
  const nameLines = wrapName(context, recipientName);
  const height = 640 + (nameLines.length - 1) * LINE_HEIGHT;
  canvas.height = height;

  context.fillStyle = "#164b3c";
  context.fillRect(0, 0, WIDTH, height);

  const background = context.createLinearGradient(0, 32, 0, height - 32);
  background.addColorStop(0, "#f7e5e4");
  background.addColorStop(0.68, "#fff9ef");
  context.fillStyle = background;
  context.beginPath();
  context.roundRect(32, 32, WIDTH - 64, height - 64, 36);
  context.fill();

  const center = WIDTH / 2;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillStyle = "#9a6424";
  context.font = "60px serif";
  context.fillText("✦", center, 134);
  context.font = "32px serif";
  context.fillText("✦", 140, 178);
  context.fillText("✦", WIDTH - 140, 178);

  context.fillStyle = "#164b3c";
  context.font = '750 31px "DM Sans Variable", system-ui, sans-serif';
  context.fillText("AMIGO SECRETO", center, 208);
  context.font = '600 50px "Fraunces Variable", Georgia, serif';
  context.fillText("Você tirou", center, 292);
  context.fillStyle = "#a32d3f";
  context.font = NAME_FONT;
  nameLines.forEach((line, index) => context.fillText(line, center, 402 + index * LINE_HEIGHT, NAME_WIDTH));

  context.fillStyle = "#4f6256";
  context.font = '550 30px "DM Sans Variable", system-ui, sans-serif';
  context.fillText("Guarde este nome em segredo.", center, height - 103);

  const image = canvas.toDataURL(PNG_TYPE);
  if (!image.startsWith(PNG_PREFIX)) throw new Error("PNG indisponível.");
  return image;
}

function downloadImage(image: string) {
  const link = document.createElement("a");
  link.href = image;
  link.download = FILE_NAME;
  document.body.append(link);
  try {
    link.click();
  } finally {
    link.remove();
  }
}

export async function saveResultImage(recipientName: string, mode: "automatic" | "download") {
  const image = renderResultImage(recipientName);

  if (
    mode === "automatic"
    && window.matchMedia("(pointer: coarse)").matches
    && typeof navigator.canShare === "function"
    && typeof navigator.share === "function"
  ) {
    // Mantém a ativação do toque até abrir o menu nativo com o PNG.
    const bytes = Uint8Array.from(atob(image.slice(PNG_PREFIX.length)), (character) => character.charCodeAt(0));
    const data = { files: [new File([bytes], FILE_NAME, { type: PNG_TYPE })] };
    if (navigator.canShare(data)) {
      try {
        await navigator.share(data);
      } catch (error) {
        const dismissed = error instanceof DOMException && (error.name === "AbortError" || error.name === "InvalidStateError");
        if (!dismissed) downloadImage(image);
      }
      return "native";
    }
  }

  downloadImage(image);
  return "download";
}
