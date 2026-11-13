import { PageHeader } from "@/components/ui/page-header";
import { EvaluationForm } from "@/components/evaluation/evaluation-form";
export default function NewEvaluation(){return <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8"><PageHeader eyebrow="Evaluation workspace" title="Compare two responses" description="Record the task, apply a consistent rubric, select a preference, and justify it with evidence."/><div className="mt-9"><EvaluationForm/></div></div>}
