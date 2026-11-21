import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: [
      { find: "server-only", replacement: fileURLToPath(new URL("./tests/server-only.ts", import.meta.url)) },
      { find: "@", replacement: fileURLToPath(new URL("./src", import.meta.url)) },
    ],
  },
  test: { include: ["tests/{unit,integration}/**/*.test.ts"] },
});
