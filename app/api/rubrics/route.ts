import { z } from "zod";
import { isOwnerRequest, unauthorized } from "@/lib/auth";
import { createRubric, listRubrics } from "@/lib/db/repository";
import { readJson } from "@/lib/http";

const rubricSchema = z.object({
  name: z.string().trim().min(3).max(100),
  description: z.string().trim().min(10).max(1000),
  criteria: z.array(z.object({ name: z.string().trim().min(2).max(80), description: z.string().trim().min(5).max(500), weight: z.number().positive().max(20), id: z.string().default(""), sortOrder: z.number().int().default(0) })).min(1).max(20)
});

export async function GET() {
  return Response.json({ rubrics: await listRubrics() }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  if (!isOwnerRequest(request, env.ADMIN_API_TOKEN)) return unauthorized();
  const parsed = rubricSchema.safeParse(await readJson(request));
  if (!parsed.success) return Response.json({ error: "Validation failed", issues: parsed.error.issues }, { status: 400 });
  return Response.json(await createRubric(parsed.data), { status: 201 });
}
import { env } from "cloudflare:workers";
