import { defineConfig } from "vitest/config";

export default defineConfig({
  cacheDir: ".vitest-cache",
  test: { environment: "node", include: ["tests/**/*.test.ts"], exclude: ["tests/e2e/**"] },
  resolve: { alias: { "@": new URL("./", import.meta.url).pathname } }
});
