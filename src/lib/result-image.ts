const WIDTH = 1080;
const NAME_WIDTH = 840;
const NAME_FONT = '700 84px "Fraunces Variable", Georgia, serif';
const LINE_HEIGHT = 104;

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

export function downloadResultImage(recipientName: string) {
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

  // Dispara o download no mesmo clique, usando apenas os dados do cartão atual.
  const image = canvas.toDataURL("image/png");
  if (!image.startsWith("data:image/png;base64,")) throw new Error("PNG indisponível.");
  const link = document.createElement("a");
  link.href = image;
  link.download = "meu-amigo-secreto.png";
  document.body.append(link);
  try {
    link.click();
  } finally {
    link.remove();
  }
}
