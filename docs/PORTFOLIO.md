# EvalLens — Portfolio Material

## Short description

EvalLens is a full-stack platform for evidence-based pairwise evaluation of AI responses using human preference, weighted default or custom rubrics, reproducible scoring snapshots, analytics, and controlled publication.

## Detailed description

EvalLens keeps the original request, two supplied responses, criterion-level scores, response evidence, explicit human preference, rationale, and actionable improvement in one reviewable record. Owners can create immutable custom rubric versions, store private evaluations in Cloudflare D1, publish selected records, filter history, inspect cautious analytics, and export data. The system distinguishes calculated rubric summaries from human judgment and does not generate responses or train model weights.

## ATS-friendly CV bullets

- Built and deployed a TypeScript/React AI-response evaluation platform on Cloudflare Workers with D1 persistence, parameterized SQL, protected CRUD APIs, analytics, JSON/CSV export, and responsive accessibility.
- Implemented weighted default and custom rubric workflows with independent N/A handling, server-side criterion validation, immutable evaluation snapshots, and reproducible historical scores.
- Established automated quality gates using TypeScript, ESLint, Vitest, Playwright, production builds, GitHub Actions, migration testing, security headers, and public/private data isolation.

## LinkedIn project announcement

I built EvalLens, a public full-stack project for transparent comparison of AI responses. It combines explicit human preference with evidence-backed rationales, weighted default or custom rubrics, immutable scoring snapshots, Cloudflare D1 history, cautious analytics, and protected exports. The project helped me practice AI evaluation methodology, TypeScript/React engineering, database design, security review, accessibility, automated testing, GitHub workflows, and Cloudflare deployment. EvalLens does not generate responses or train models—it makes human evaluation records easier to inspect and reproduce.

## Handshake description

Built EvalLens, a TypeScript/React platform for comparing two AI responses with weighted default or custom rubrics, evidence, explicit human preference, reproducible score snapshots, analytics, exports, and Cloudflare D1 persistence. Added protected APIs, accessibility, automated tests, CI, and a verified Workers deployment. Personal engineering and AI-evaluation learning project; not paid evaluation employment.

## Technology stack

TypeScript, React 19, vinext/Next.js App Router API, Tailwind CSS, Zod, Recharts, Cloudflare Workers, D1/SQLite, pnpm, Vitest, Playwright, ESLint, and GitHub Actions.

## Skills demonstrated

Full-stack engineering, API design, relational schema design, migrations, AI evaluation methodology, weighted scoring, human preference workflows, security review, accessibility, responsive UI, automated testing, CI/CD, technical documentation, and production verification.

## Links

- GitHub: https://github.com/AsimAslah/evallens
- Live application: https://evallens.asimaslu7.workers.dev

## Suggested preview screenshot

Use `docs/screenshots/response-comparison.png` because it shows the core differentiator: two responses evaluated against the same selected rubric with evidence-oriented scoring controls.
