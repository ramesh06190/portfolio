// Keyboard and behavior tests. They run against the built site in dist,
// so run `npm run build` first (the npm test script does this).
import { defineConfig, devices } from "@playwright/test";

const PORT = 4178;

export default defineConfig({
  testDir: "tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    ...devices["Desktop Chrome"],
  },
  webServer: {
    command: "node scripts/serve.mjs",
    env: { PORT: String(PORT) },
    url: `http://127.0.0.1:${PORT}/index.html`,
    reuseExistingServer: !process.env.CI,
  },
});
