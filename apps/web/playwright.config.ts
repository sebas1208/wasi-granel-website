import { defineConfig } from "@playwright/test"

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  fullyParallel: true,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
  },
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120_000,
  },
  projects: [
    // Uses the installed Google Chrome (channel: "chrome") — no Playwright
    // Chromium download needed. Requires Chrome on the machine.
    { name: "desktop", use: { channel: "chrome", viewport: { width: 1280, height: 900 } } },
    { name: "mobile", use: { channel: "chrome", viewport: { width: 390, height: 844 } } },
  ],
})
