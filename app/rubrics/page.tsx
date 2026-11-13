import { PageHeader } from "@/components/ui/page-header";
import { RubricsClient } from "@/components/rubrics/rubrics-client";
export default function Rubrics(){return <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8"><PageHeader eyebrow="Scoring system" title="Rubric library" description="Understand each criterion, inspect weights, and create owner-only reusable rubrics. N/A criteria are excluded from normalization."/><div className="mt-8"><RubricsClient/></div></div>}
