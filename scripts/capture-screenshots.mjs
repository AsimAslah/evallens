import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";

const baseURL = process.env.BASE_URL ?? "http://127.0.0.1:4173";
const directory = resolve("docs/screenshots");
await mkdir(directory, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH || undefined,
});
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, colorScheme: "light" });
const page = await context.newPage();
async function capture(path, name, fullPage = true) { await page.goto(`${baseURL}${path}`); await page.waitForLoadState("networkidle"); await page.screenshot({ path: resolve(directory, name), fullPage }); }
await capture("/", "landing-page.png");
await capture("/dashboard", "dashboard.png");
await page.goto(`${baseURL}/evaluations/new`); await page.getByRole("button", { name: /load demonstration/i }).click(); await page.screenshot({ path: resolve(directory, "response-comparison.png"), fullPage: true });
await page.getByRole("button", { name: /calculate local result/i }).click(); await page.locator("#evaluation-result").screenshot({ path: resolve(directory, "evaluation-result.png") });
await capture("/rubrics", "rubric-library.png");
await capture("/evaluations/history", "evaluation-history.png");
await capture("/analytics", "analytics.png");
await page.addInitScript(() => localStorage.setItem("evallens-theme", "dark")); await capture("/showcase", "dark-mode.png");
const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, colorScheme: "light" }); await mobile.goto(`${baseURL}/evaluations/new`); await mobile.waitForLoadState("networkidle"); await mobile.screenshot({ path: resolve(directory, "mobile-view.png"), fullPage: true });
await browser.close();
