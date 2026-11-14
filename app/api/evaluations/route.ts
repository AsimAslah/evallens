import { isOwnerRequest, unauthorized } from "@/lib/auth";
import { createEvaluation, EvaluationRubricError, listEvaluations } from "@/lib/db/repository";
import { rateLimit, readJson } from "@/lib/http";
import { evaluationSchema, formatZodError } from "@/lib/validation/evaluation";

export async function GET(request: Request) {
  const limited = rateLimit(request);
  if (limited) return limited;
  const url = new URL(request.url);
  const publicOnly = !isOwnerRequest(request, env.ADMIN_API_TOKEN);
  const evaluations = await listEvaluations({
    publicOnly,
    search: url.searchParams.get("search") ?? undefined,
    winner: url.searchParams.get("winner") ?? undefined,
    model: url.searchParams.get("model") ?? undefined,
    from: url.searchParams.get("from") ?? undefined,
    to: url.searchParams.get("to") ?? undefined
  });
  return Response.json({ evaluations, scope: publicOnly ? "public" : "owner" }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  if (!isOwnerRequest(request, env.ADMIN_API_TOKEN)) return unauthorized();
  const limited = rateLimit(request, 20);
  if (limited) return limited;
  try {
    const parsed = evaluationSchema.safeParse(await readJson(request));
    if (!parsed.success) return Response.json({ error: "Validation failed", issues: formatZodError(parsed.error) }, { status: 400 });
    const evaluation = await createEvaluation(parsed.data);
    return Response.json({ evaluation }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof Error && error.message === "PAYLOAD_TOO_LARGE") return Response.json({ error: "Payload exceeds 400 KB" }, { status: 413 });
    if (error instanceof EvaluationRubricError) return Response.json({ error: error.message }, { status: 400 });
    if (error instanceof SyntaxError) return Response.json({ error: "Invalid JSON" }, { status: 400 });
    throw error;
  }
}
import { env } from "cloudflare:workers";
