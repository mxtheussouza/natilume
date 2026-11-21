import { mkdirSync, writeFileSync } from "node:fs";
import common from "@unicode/unicode-17.0.0/Case_Folding/C/symbols.mjs";
import simple from "@unicode/unicode-17.0.0/Case_Folding/S/symbols.mjs";

// The browser receives the mapping without loading Unicode's Node-only decoder.
const output = new URL("../src/generated/", import.meta.url);
mkdirSync(output, { recursive: true });
writeFileSync(
  new URL("unicode-simple-fold.json", output),
  JSON.stringify(Object.fromEntries([...common, ...simple])),
);
