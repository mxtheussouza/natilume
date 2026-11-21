import { defineConfig, devices } from "@playwright/test";

const port = 3035;
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "tests/e2e",
  use: { baseURL, ...devices["Desktop Chrome"] },
  webServer: {
    command: `npm run start -- --hostname 127.0.0.1 --port ${port}`,
    url: baseURL,
    env: {
      DATABASE_URL: process.env.TEST_DATABASE_URL ?? "postgresql://natilume:local-only@127.0.0.1:56432/natilume_test",
      APP_URL: baseURL,
    },
  },
});
