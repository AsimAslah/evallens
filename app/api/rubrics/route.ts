import { isOwnerRequest, unauthorized } from "@/lib/auth";
import { createRubric, listRubrics } from "@/lib/db/repository";
import { readJson } from "@/lib/http";
import { rubricInputSchema } from "@/lib/validation/rubric";

export async function GET() {
  return Response.json({ rubrics: await listRubrics() }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  if (!isOwnerRequest(request, env.ADMIN_API_TOKEN)) return unauthorized();
  try {
    const parsed = rubricInputSchema.safeParse(await readJson(request));
    if (!parsed.success) return Response.json({ error: "Validation failed", issues: parsed.error.issues }, { status: 400 });
    return Response.json(await createRubric(parsed.data), { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "PAYLOAD_TOO_LARGE") return Response.json({ error: "Payload exceeds 400 KB" }, { status: 413 });
    if (error instanceof SyntaxError) return Response.json({ error: "Invalid JSON" }, { status: 400 });
    throw error;
  }
}
import { env } from "cloudflare:workers";
