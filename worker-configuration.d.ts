/// <reference types="@cloudflare/workers-types" />

interface Body {
  json<T = any>(): Promise<T>;
}

declare namespace Cloudflare {
  interface Env {
    DB: D1Database;
    ASSETS: Fetcher;
    ADMIN_API_TOKEN: string;
  }
}
