import { defineConfig } from "@playwright/test";
import dotenv from "dotenv";

dotenv.config({ override: true });

export default defineConfig({
  timeout: 60 * 1000,
  testDir: "./tests",
  fullyParallel: false, // Sequential execution prevents race conditions against live stateful demo bank
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Single worker avoids database reset collision
  reporter: [
    ["list"],
    ["html", { open: "never", outputFolder: "reports" }],
    ["junit", { outputFile: "reports/results.xml" }],
    ["./utils/CustomReporter.ts"],
    ["allure-playwright", { outputFolder: "allure-results" }],
  ],
  use: {
    baseURL: process.env.API_BASE_URL || "https://parabank.parasoft.com/parabank/services/bank",
    trace: "on-first-retry",
    extraHTTPHeaders: {
      "Accept": "application/json, text/plain, */*",
    },
  },
});
