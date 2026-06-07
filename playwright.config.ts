import { defineConfig, devices } from "@playwright/test";

const desktopViewport = { width: 1920, height: 1080 };

export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.visual.spec.ts",
  fullyParallel: true,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://127.0.0.1:4174",
    viewport: desktopViewport,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: {
      mode: "on",
      size: desktopViewport
    }
  },
  webServer: {
    command: "npm run build && npm run preview -- --host 127.0.0.1 --port 4174",
    url: "http://127.0.0.1:4174",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: desktopViewport
      }
    }
  ]
});
