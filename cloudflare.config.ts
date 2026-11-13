import { bindings, defineConfig, defineWorker } from "cf/config";

export default defineConfig({
  worker: defineWorker({
    name: "evallens",
    entrypoint: "vinext/server/fetch-handler",
    compatibilityDate: "2026-11-13",
    compatibilityFlags: ["nodejs_compat"],
    assets: {
      htmlHandling: "none",
      notFoundHandling: "none",
      runWorkerFirst: ["/*", "!/_next/static/*", "!/*/_next/static/*"],
    },
    env: {
      ASSETS: bindings.assets(),
      DB: bindings.d1({
        name: "evallens-db",
        id: process.env.CLOUDFLARE_D1_ID ?? "11111111-1111-4111-8111-111111111111",
      }),
      ADMIN_API_TOKEN: bindings.secret(),
    },
  }),
});
