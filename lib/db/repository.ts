import { env } from "cloudflare:workers";
import { DEFAULT_CRITERIA } from "../constants";
import { calculateNormalizedScore } from "../scoring";
import type { Criterion, EvaluationInput, EvaluationRecord, ScoreInput } from "../types";

type Row = Record<string, any>;

function db() {
  return env.DB;
}

function decodeBase64(value: string) {
  const binary = atob(value.includes(",") ? value.split(",").pop() ?? "" : value);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function mapRecord(row: Row, scores: ScoreInput[] = [], tags: string[] = [], evidence: { a?: string; b?: string } = {}): EvaluationRecord {
  const criteria = DEFAULT_CRITERIA;
  const a = calculateNormalizedScore(scores, criteria, "a");
  const b = calculateNormalizedScore(scores, criteria, "b");
  return {
    id: row.id,
    title: row.title,
    prompt: row.prompt,
    context: row.context,
    responseA: row.response_a,
    responseB: row.response_b,
    modelA: row.model_a,
    modelB: row.model_b,
    preferredResponse: row.preferred_response,
    rationale: row.rationale,
    suggestedImprovement: row.suggested_improvement,
    finalNotes: row.final_notes,
    evidenceA: evidence.a ?? "",
    evidenceB: evidence.b ?? "",
    status: row.status,
    sourceUrl: row.source_url,
    rubricId: row.rubric_id,
    isPublished: Boolean(row.is_published),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    tags,
    scores,
    normalizedScoreA: a.normalized,
    normalizedScoreB: b.normalized
  };
}

async function related(id: string) {
  const [scoreRows, tagRows, evidenceRows] = await Promise.all([
    db().prepare("SELECT criterion_id, response_label, score, applicability, evidence FROM evaluation_scores WHERE evaluation_id = ?").bind(id).all<Row>(),
    db().prepare("SELECT tag FROM evaluation_tags WHERE evaluation_id = ? ORDER BY tag").bind(id).all<{ tag: string }>(),
    db().prepare("SELECT response_label,evidence_text FROM evaluation_evidence WHERE evaluation_id = ?").bind(id).all<{ response_label: "a" | "b"; evidence_text: string }>()
  ]);
  const scores = scoreRows.results.map((row) => ({ criterionId: row.criterion_id, responseLabel: row.response_label, score: row.score, applicable: Boolean(row.applicability), evidence: row.evidence })) as ScoreInput[];
  const evidence = Object.fromEntries(evidenceRows.results.map((row) => [row.response_label, row.evidence_text]));
  return { scores, tags: tagRows.results.map((row) => row.tag), evidence };
}

export async function listEvaluations(options: { publicOnly?: boolean; search?: string; winner?: string; model?: string; from?: string; to?: string } = {}) {
  const clauses: string[] = [];
  const values: unknown[] = [];
  if (options.publicOnly) clauses.push("is_published = 1", "status = 'completed'");
  if (options.search) { clauses.push("(title LIKE ? OR prompt LIKE ?)"); values.push(`%${options.search}%`, `%${options.search}%`); }
  if (options.winner && ["a", "b", "tie"].includes(options.winner)) { clauses.push("preferred_response = ?"); values.push(options.winner); }
  if (options.model) { clauses.push("(model_a LIKE ? OR model_b LIKE ?)"); values.push(`%${options.model}%`, `%${options.model}%`); }
  if (options.from) { clauses.push("date(created_at) >= date(?)"); values.push(options.from); }
  if (options.to) { clauses.push("date(created_at) <= date(?)"); values.push(options.to); }
  const where = clauses.length ? ` WHERE ${clauses.join(" AND ")}` : "";
  const result = await db().prepare(`SELECT * FROM evaluations${where} ORDER BY datetime(created_at) DESC LIMIT 250`).bind(...values).all<Row>();
  return Promise.all(result.results.map(async (row) => { const extra = await related(row.id); return mapRecord(row, extra.scores, extra.tags, extra.evidence); }));
}

export async function getEvaluation(id: string, publicOnly = false) {
  const query = publicOnly ? "SELECT * FROM evaluations WHERE id = ? AND is_published = 1 AND status = 'completed'" : "SELECT * FROM evaluations WHERE id = ?";
  const row = await db().prepare(query).bind(id).first<Row>();
  if (!row) return null;
  const extra = await related(id);
  return mapRecord(row, extra.scores, extra.tags, extra.evidence);
}

export async function createEvaluation(input: EvaluationInput) {
  const id = crypto.randomUUID();
  const statements = [
    db().prepare(`INSERT INTO evaluations (id,title,prompt,context,response_a,response_b,model_a,model_b,preferred_response,rationale,suggested_improvement,final_notes,status,source_url,rubric_id,is_published) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(id, input.title, input.prompt, input.context ?? "", input.responseA, input.responseB, input.modelA, input.modelB, input.preferredResponse, input.rationale, input.suggestedImprovement, input.finalNotes ?? "", input.status, input.sourceUrl ?? "", input.rubricId, input.isPublished ? 1 : 0),
    db().prepare("INSERT INTO evaluation_evidence (id,evaluation_id,response_label,evidence_text) VALUES (?,?,?,?)").bind(crypto.randomUUID(), id, "a", input.evidenceA),
    db().prepare("INSERT INTO evaluation_evidence (id,evaluation_id,response_label,evidence_text) VALUES (?,?,?,?)").bind(crypto.randomUUID(), id, "b", input.evidenceB),
    ...input.scores.map((score) => db().prepare("INSERT INTO evaluation_scores (id,evaluation_id,response_label,criterion_id,score,applicability,evidence) VALUES (?,?,?,?,?,?,?)").bind(crypto.randomUUID(), id, score.responseLabel, score.criterionId, score.score, score.applicable ? 1 : 0, score.evidence ?? "")),
    ...input.tags.map((tag) => db().prepare("INSERT INTO evaluation_tags (evaluation_id,tag) VALUES (?,?)").bind(id, tag.toLowerCase()))
  ];
  for (const attachment of input.attachments ?? []) statements.push(db().prepare("INSERT INTO evaluation_attachments (id,evaluation_id,file_name,mime_type,content) VALUES (?,?,?,?,?)").bind(crypto.randomUUID(), id, attachment.fileName, attachment.mimeType, decodeBase64(attachment.dataBase64)));
  await db().batch(statements);
  return (await getEvaluation(id))!;
}

export async function updateEvaluation(id: string, input: EvaluationInput) {
  const existing = await getEvaluation(id);
  if (!existing) return null;
  const statements = [
    db().prepare(`UPDATE evaluations SET title=?,prompt=?,context=?,response_a=?,response_b=?,model_a=?,model_b=?,preferred_response=?,rationale=?,suggested_improvement=?,final_notes=?,status=?,source_url=?,rubric_id=?,is_published=?,updated_at=datetime('now') WHERE id=?`).bind(input.title, input.prompt, input.context ?? "", input.responseA, input.responseB, input.modelA, input.modelB, input.preferredResponse, input.rationale, input.suggestedImprovement, input.finalNotes ?? "", input.status, input.sourceUrl ?? "", input.rubricId, input.isPublished ? 1 : 0, id),
    db().prepare("DELETE FROM evaluation_scores WHERE evaluation_id=?").bind(id),
    db().prepare("DELETE FROM evaluation_evidence WHERE evaluation_id=?").bind(id),
    db().prepare("DELETE FROM evaluation_tags WHERE evaluation_id=?").bind(id),
    db().prepare("INSERT INTO evaluation_evidence (id,evaluation_id,response_label,evidence_text) VALUES (?,?,?,?)").bind(crypto.randomUUID(), id, "a", input.evidenceA),
    db().prepare("INSERT INTO evaluation_evidence (id,evaluation_id,response_label,evidence_text) VALUES (?,?,?,?)").bind(crypto.randomUUID(), id, "b", input.evidenceB),
    ...input.scores.map((score) => db().prepare("INSERT INTO evaluation_scores (id,evaluation_id,response_label,criterion_id,score,applicability,evidence) VALUES (?,?,?,?,?,?,?)").bind(crypto.randomUUID(), id, score.responseLabel, score.criterionId, score.score, score.applicable ? 1 : 0, score.evidence ?? "")),
    ...input.tags.map((tag) => db().prepare("INSERT INTO evaluation_tags (evaluation_id,tag) VALUES (?,?)").bind(id, tag.toLowerCase()))
  ];
  await db().batch(statements);
  return getEvaluation(id);
}

export async function deleteEvaluation(id: string) {
  const result = await db().prepare("DELETE FROM evaluations WHERE id = ?").bind(id).run();
  return (result.meta.changes ?? 0) > 0;
}

export async function listRubrics() {
  const rubrics = await db().prepare("SELECT * FROM rubrics ORDER BY created_at").all<Row>();
  return Promise.all(rubrics.results.map(async (rubric) => {
    const criteria = await db().prepare("SELECT id,name,description,weight,sort_order FROM rubric_criteria WHERE rubric_id=? ORDER BY sort_order").bind(rubric.id).all<Row>();
    return { id: rubric.id, name: rubric.name, description: rubric.description, createdAt: rubric.created_at, criteria: criteria.results.map((row) => ({ id: row.id, name: row.name, description: row.description, weight: row.weight, sortOrder: row.sort_order } as Criterion)) };
  }));
}

export async function createRubric(input: { name: string; description: string; criteria: Criterion[] }) {
  const id = crypto.randomUUID();
  await db().batch([
    db().prepare("INSERT INTO rubrics (id,name,description) VALUES (?,?,?)").bind(id, input.name, input.description),
    ...input.criteria.map((criterion, index) => db().prepare("INSERT INTO rubric_criteria (id,rubric_id,name,description,weight,sort_order) VALUES (?,?,?,?,?,?)").bind(crypto.randomUUID(), id, criterion.name, criterion.description, criterion.weight, index + 1))
  ]);
  return { id };
}
