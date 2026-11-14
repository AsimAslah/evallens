import type { Criterion, EvaluationInput } from "./types";

export const DEFAULT_CRITERIA: Criterion[] = [
  { id: "instruction-following", name: "Instruction Following", description: "Fulfills the user’s explicit and implicit instructions.", weight: 1, sortOrder: 1 },
  { id: "accuracy", name: "Accuracy", description: "Makes correct, supportable claims without hallucination.", weight: 1, sortOrder: 2 },
  { id: "relevance", name: "Relevance", description: "Stays focused on the request without unnecessary material.", weight: 1, sortOrder: 3 },
  { id: "clarity", name: "Clarity", description: "Communicates in an understandable, well-structured way.", weight: 1, sortOrder: 4 },
  { id: "completeness", name: "Completeness", description: "Addresses all material parts of the request.", weight: 1, sortOrder: 5 },
  { id: "safety", name: "Safety", description: "Avoids harmful guidance and handles risk appropriately.", weight: 1, sortOrder: 6 },
  { id: "constraint-satisfaction", name: "Constraint Satisfaction", description: "Respects format, length, timing, tone, and other constraints.", weight: 1, sortOrder: 7 }
];

export const SCORE_LABELS = ["", "Poor", "Below expectations", "Acceptable", "Good", "Excellent"];

export const DEMO_EVALUATION: EvaluationInput = {
  title: "Politeness without changing meaning",
  prompt: 'Make this message more polite without changing its meaning: "I need your answer today."',
  context: "Demonstration evaluation supplied with EvalLens.",
  modelA: "Response A",
  modelB: "Response B",
  responseA: "Whenever you have a moment, I'd really appreciate hearing from you. Thank you!",
  responseB: "Could you please get back to me today? I'd really appreciate it. Thank you!",
  preferredResponse: "b",
  rationale: 'Both responses use polite language, but Response A changes the original timing requirement to “whenever you have a moment.” Response B preserves the requirement for an answer today while improving politeness.',
  suggestedImprovement: "Response A should retain the original deadline while maintaining a courteous tone.",
  finalNotes: "This is a demonstration record, not a general claim about either model.",
  evidenceA: 'The phrase “whenever you have a moment” removes the same-day deadline.',
  evidenceB: 'The phrase “get back to me today” preserves the timing constraint.',
  sourceUrl: "",
  tags: ["demonstration", "instruction-following", "constraint-satisfaction"],
  rubricId: "default-rubric",
  status: "completed",
  isPublished: true,
  scores: DEFAULT_CRITERIA.flatMap((criterion) => ([
    { criterionId: criterion.id, responseLabel: "a" as const, score: criterion.id === "constraint-satisfaction" ? 2 : 4, applicable: true },
    { criterionId: criterion.id, responseLabel: "b" as const, score: 5, applicable: true }
  ]))
};

export const HISTORICAL_CASE_STUDY = {
  title: "GPT-1 versus GPT-2: speaking to a future model",
  prompt: "What would you say if you could talk to a future OpenAI model?",
  sourceUrl: "https://progress.openai.com/",
  responseA: { model: "GPT-1", year: 2018, text: `' i do n't care how you feel about it , i 'm still trying to make sense of it . i 'm still trying to understand . " " i do n't understand , " i said . " i 'm just a little confused myself . i do n't know what to think . if i 'm not crazy , who am i ? "` },
  responseB: { model: "GPT-2", year: 2019, text: "I would try to describe the kind of person that may be thinking about using a computer program that may be doing AI research. I would try to discuss the pros and cons of such a program with that person. I would ask them about their goals, goals they had for the AI. I would try to make sure that the person has a reasonable understanding of the AI, that they have a reasonable understanding of the computer science of the AI. I would try to make sure that they understand the issues and what we'll all be doing next and how this could be used for good." },
  preference: "Response B",
  evidenceA: "The response is fragmented and does not address what it would say to a future model.",
  evidenceB: "The response discusses AI research goals, tradeoffs, understanding, next steps, and beneficial use.",
  rationale: "The project owner preferred Response B. It is more relevant, coherent, and responsive to the hypothetical conversation, while Response A reads as unrelated narrative text.",
  improvement: "Response A would need to address the future-model scenario directly and organize its ideas into a coherent message.",
  scoringNote: "No criterion scores are assigned here; scoring remains pending the evaluator's review."
} as const;
