import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 30000,
  use: {
    baseURL: "http://localhost:1313",
    // Use the system Chromium (NixOS-compatible)
    launchOptions: {
      executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined,
    },
  },
  // Expect the Hugo dev server to already be running
  webServer: undefined,
});
