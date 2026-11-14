import Link from "next/link";
import { notFound } from "next/navigation";
import { getEvaluation } from "@/lib/db/repository";
import { PageHeader } from "@/components/ui/page-header";

export default async function EvaluationDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const record = await getEvaluation(id, true);
  if (!record) notFound();

  return <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
    <PageHeader
      eyebrow="Published evaluation"
      title={record.title}
      description={`${record.modelA} compared with ${record.modelB}. This record reflects one evaluation, not general model performance.`}
      actions={<Link className="btn btn-secondary" href="/showcase">Back to showcase</Link>}
    />
    <div className="mt-8 panel p-6">
      <p className="text-xs font-black uppercase tracking-wider text-[var(--accent)]">Prompt</p>
      <p className="mt-3 leading-7">{record.prompt}</p>
    </div>
    <div className="mt-5 grid gap-5 lg:grid-cols-2">
      {([[
        "A", record.modelA, record.responseA, record.normalizedScoreA, record.evidenceA,
      ], [
        "B", record.modelB, record.responseB, record.normalizedScoreB, record.evidenceB,
      ]] as const).map(([label, model, response, score, evidence]) => <article className="panel p-6" key={label}>
        <div className="flex items-center justify-between gap-4">
          <strong>Response {label} · {model}</strong>
          <span className="text-xl font-black text-[var(--accent)]">{score === null ? "N/A" : `${score}%`}</span>
        </div>
        <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-[var(--muted)]">{response}</p>
        <div className="mt-5 rounded-xl bg-[var(--panel-soft)] p-4">
          <strong className="text-xs uppercase tracking-wider">Evidence</strong>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{evidence}</p>
        </div>
      </article>)}
    </div>
    <section className="panel mt-5 p-6" aria-labelledby="rubric-snapshot-heading">
      <p className="text-xs font-black uppercase tracking-wider text-[var(--accent)]">Saved scoring basis</p>
      <h2 id="rubric-snapshot-heading" className="mt-2 text-xl font-extrabold">{record.rubricName}</h2>
      <p className="mt-2 text-sm text-[var(--muted)]">These criterion names and weights are the immutable snapshot stored with this evaluation.</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {record.rubricCriteria.map((criterion) => {
          const scoreA = record.scores.find((score) => score.criterionId === criterion.id && score.responseLabel === "a");
          const scoreB = record.scores.find((score) => score.criterionId === criterion.id && score.responseLabel === "b");
          const display = (score: typeof scoreA) => score?.applicable ? `${score.score}/5` : "N/A";
          return <div className="rounded-xl bg-[var(--panel-soft)] p-4" key={criterion.id}>
            <div className="flex items-center justify-between gap-3"><strong className="text-sm">{criterion.name}</strong><span className="text-xs font-black">{criterion.weight}×</span></div>
            <p className="mt-2 text-xs leading-5 text-[var(--muted)]">Response A: {display(scoreA)} · Response B: {display(scoreB)}</p>
          </div>;
        })}
      </div>
    </section>
    <div className="panel mt-5 p-6">
      <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-black text-[var(--accent-strong)]">{record.preferredResponse === "tie" ? "Tie" : `Response ${record.preferredResponse.toUpperCase()} wins`}</span>
      <h2 className="mt-5 text-xl font-extrabold">Evaluator rationale</h2>
      <p className="mt-3 leading-7 text-[var(--muted)]">{record.rationale}</p>
      <h3 className="mt-6 font-bold">Suggested improvement</h3>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{record.suggestedImprovement}</p>
    </div>
  </div>;
}
