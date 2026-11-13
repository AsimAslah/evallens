import { isOwnerRequest, unauthorized } from "@/lib/auth";
import { listEvaluations } from "@/lib/db/repository";

function csvCell(value: unknown) { const text = String(value ?? ""); return `"${text.replaceAll('"', '""')}"`; }

export async function GET(request: Request) {
  if (!isOwnerRequest(request, env.ADMIN_API_TOKEN)) return unauthorized();
  const records = await listEvaluations();
  const format = new URL(request.url).searchParams.get("format") ?? "json";
  if (format === "csv") {
    const header = ["id", "title", "prompt", "model_a", "model_b", "preferred_response", "score_a", "score_b", "rationale", "created_at"];
    const rows = records.map((record) => [record.id, record.title, record.prompt, record.modelA, record.modelB, record.preferredResponse, record.normalizedScoreA, record.normalizedScoreB, record.rationale, record.createdAt].map(csvCell).join(","));
    return new Response([header.join(","), ...rows].join("\r\n"), { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": "attachment; filename=evallens-evaluations.csv" } });
  }
  return new Response(JSON.stringify({ exportedAt: new Date().toISOString(), evaluations: records }, null, 2), { headers: { "Content-Type": "application/json", "Content-Disposition": "attachment; filename=evallens-evaluations.json" } });
}
import { env } from "cloudflare:workers";
