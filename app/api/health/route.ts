import { env } from "cloudflare:workers";

export async function GET() {
  try {
    await env.DB.prepare("SELECT 1 AS ok").first();
    return Response.json({ status: "ok", database: "connected", timestamp: new Date().toISOString() }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ status: "degraded", database: "unavailable", timestamp: new Date().toISOString() }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
