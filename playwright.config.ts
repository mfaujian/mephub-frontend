import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

// Playwright runs in its own Node process, so it does not see Next.js's .env.local: load it here.
dotenv.config({ path: ".env.local", quiet: true });

const PORT = 3000;
// Set E2E_BASE_URL (for example your Vercel address) to run the same tests against a deployed site.
const REMOTE_URL = process.env.E2E_BASE_URL;
const BASE_URL = REMOTE_URL ?? `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./tests",
  globalSetup: "./tests/global-setup.ts",
  // The tests share one backend database, so they run one after another.
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 2 : 0,
  timeout: 30_000,
  expect: { timeout: 7_000 },
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  // Builds the production app and serves it. If it is already running on port 3000, that server is reused.
  // Not needed when testing an already deployed site.
  webServer: REMOTE_URL
    ? undefined
    : {
        command: "npm run build && npm run start",
        url: BASE_URL,
        reuseExistingServer: true,
        timeout: 300_000,
      },
});