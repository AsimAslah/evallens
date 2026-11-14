import { isOwnerRequest, unauthorized } from "@/lib/auth";
import { deleteEvaluation, EvaluationRubricError, getEvaluation, updateEvaluation } from "@/lib/db/repository";
import { readJson } from "@/lib/http";
import { evaluationSchema, formatZodError } from "@/lib/validation/evaluation";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const evaluation = await getEvaluation(id, !isOwnerRequest(request, env.ADMIN_API_TOKEN));
  if (!evaluation) return Response.json({ error: "Evaluation not found" }, { status: 404 });
  return Response.json({ evaluation }, { headers: { "Cache-Control": "no-store" } });
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!isOwnerRequest(request, env.ADMIN_API_TOKEN)) return unauthorized();
  const { id } = await context.params;
  try {
    const parsed = evaluationSchema.safeParse(await readJson(request));
    if (!parsed.success) return Response.json({ error: "Validation failed", issues: formatZodError(parsed.error) }, { status: 400 });
    const evaluation = await updateEvaluation(id, parsed.data);
    if (!evaluation) return Response.json({ error: "Evaluation not found" }, { status: 404 });
    return Response.json({ evaluation });
  } catch (error) {
    if (error instanceof Error && error.message === "PAYLOAD_TOO_LARGE") return Response.json({ error: "Payload exceeds 400 KB" }, { status: 413 });
    if (error instanceof EvaluationRubricError) return Response.json({ error: error.message }, { status: 400 });
    if (error instanceof SyntaxError) return Response.json({ error: "Invalid JSON" }, { status: 400 });
    throw error;
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!isOwnerRequest(request, env.ADMIN_API_TOKEN)) return unauthorized();
  const { id } = await context.params;
  const deleted = await deleteEvaluation(id);
  if (!deleted) return Response.json({ error: "Evaluation not found" }, { status: 404 });
  return new Response(null, { status: 204 });
}
import { env } from "cloudflare:workers";
