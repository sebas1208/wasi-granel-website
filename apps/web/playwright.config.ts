import { defineConfig } from "@playwright/test"

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  // Serialize the suite: these tests hit a single dev server, and running them
  // in parallel caused resource contention (late image loads / embla
  // initialization) that made the layout measurements flaky. One worker = deterministic.
  fullyParallel: false,
  workers: 1,
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
