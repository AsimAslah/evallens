# EvalLens

**Evaluate Intelligence. Improve Quality.**

EvalLens is a full-stack AI response evaluation platform for pairwise comparison, rubric-based scoring, evidence-backed preference ranking, and honest evaluation analytics. Human judgment is the core feature; the application does not call a paid model API, generate the compared responses, or automatically retrain a model.

**Live deployment:** [evallens.asimaslu7.workers.dev](https://evallens.asimaslu7.workers.dev)

## Project objectives

EvalLens keeps the full evaluation trail together: the exact request, two supplied responses, consistent criterion scores, an explicit A/B/tie preference, response-specific evidence, and an actionable improvement. It demonstrates LLM quality assurance, human preference workflows, and Cloudflare-native full-stack engineering.

## Features

- Responsive light/dark interface with landing, dashboard, workspace, history, analytics, rubrics, showcase, and learning module
- Seven default criteria, scores from 1–5, N/A handling, reusable rubrics, and transparent weighted normalization
- Explicit preference kept independent from numerical scores, with a nonblocking disagreement warning
- Evidence and rationale validation, source URLs, and small screenshot attachments
- D1-backed owner history with filters, detail views, editing API, deletion, and JSON/CSV export
- Recharts analytics sourced only from stored records, with small-sample warnings
- Public/private record separation and explicit publication approval
- Bearer-token owner authorization, server validation, parameterized SQL, payload limits, and rate limiting
- Verified demonstration comparing two polite rewrites of “I need your answer today.”

## Screenshots

Screenshots are still pending. Use the verified live deployment above to inspect the current responsive interface.

## Tech stack

vinext / Next.js App Router API, React 19, strict TypeScript, Tailwind CSS 4, Lucide React, Recharts, Cloudflare Workers, D1, Zod, pnpm, ESLint, Vitest, and Playwright.

## Architecture

```text
Browser
  ├─ Public pages and local-only comparison
  └─ Owner requests (Authorization: Bearer ...)
              │
        App Router route handlers
        ├─ validation / rate limits / authorization
        ├─ parameterized repository operations
        └─ public-only query boundary
              │
        Cloudflare D1
        ├─ evaluations
        ├─ evaluation_scores / evidence / tags / attachments
        └─ rubrics / rubric_criteria
```

Public reads always add `is_published = 1 AND status = 'completed'`; mutations reject requests without the configured owner token.

## Evaluation methodology

Each applicable criterion contributes `score × weight`.

```text
normalized score = sum(score × weight) / sum(5 × weight) × 100
```

N/A criteria are excluded from both numerator and denominator. If no criterion applies, the result is N/A. This is a transparent rubric summary—not a calibrated probability or proof of general model superiority. The evaluator’s A/B/tie preference remains separate.

## Getting started

Requirements: Node.js 24+ and pnpm 12+. A Cloudflare account is needed only for remote deployment.

```powershell
git clone https://github.com/AsimAslah/evallens.git
cd evallens
pnpm install
Copy-Item .env.example .env.local
pnpm db:migrate:local
pnpm dev
```

Generate `ADMIN_API_TOKEN` with a cryptographically random value of at least 24 characters. The owner UI keeps it in session storage, not persistent database storage.

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `ADMIN_API_TOKEN` | Owner writes | Long random server secret for create, edit, delete, export, and rubric operations |
| `CLOUDFLARE_D1_ID` | Remote migration | Production D1 database UUID returned by `cf d1 create` |
| `NEXT_PUBLIC_GITHUB_URL` | No | Repository link |
| `NEXT_PUBLIC_LIVE_URL` | No | Verified deployment URL; leave blank until deployed |
| `NEXT_PUBLIC_PORTFOLIO_URL` | No | Optional portfolio link |

Never commit `.env.local`, Cloudflare credentials, or an API token.

## Database setup

The version-controlled migration is `migrations/0001_initial.sql`.

```powershell
pnpm db:migrate:local
pnpm exec cf d1 create --name evallens-db
pnpm db:migrate:remote
```

Review the target and SQL before remote migration. Never run destructive production migrations without explicit approval and a recovery plan.

## Local development and testing

```powershell
pnpm dev
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm exec playwright install chromium
pnpm test:e2e
```

Vitest covers weighted scoring, N/A behavior, zero-denominator handling, preference independence, validation, and owner authorization. Playwright covers landing/showcase and a complete browser-local demonstration.

## Cloudflare deployment

Cloudflare currently recommends vinext for new Next.js applications on Workers. This project uses `cloudflare:workers` for D1 and the Cloudflare Vite plugin for RSC.

```powershell
pnpm exec cf auth login
pnpm exec cf d1 create --name evallens-db
$env:CLOUDFLARE_D1_ID="<database UUID returned above>"
pnpm db:migrate:remote

# Create this ignored file before the first Worker deployment:
# .env.production.local
# ADMIN_API_TOKEN=<cryptographically random value of at least 24 characters>
# CLOUDFLARE_D1_ID=<database UUID>

pnpm build
pnpm exec cf deploy --prebuilt --secrets-file .env.production.local
```

The secrets file is required for the first deployment because the Worker does not exist yet. On later deployments, `pnpm deploy` can update the existing Worker; rotate the owner secret with `pnpm exec cf workers secrets update ADMIN_API_TOKEN --worker evallens` when needed.

The production deployment was verified on 2026-11-14: public routes and `/api/health` returned 200, the database reported `connected`, unauthenticated owner access was rejected, and a temporary authenticated create/read/publish/delete cycle persisted correctly in D1.

## Security considerations

- Long server-only owner secret; D1 prepared statements; Zod validation; request and attachment size limits
- React-escaped text with no user HTML rendering
- Public queries cannot return private or draft records
- Bearer authorization avoids cookie CSRF; credentials require HTTPS
- In-memory rate limiting is a lightweight per-isolate control, not a distributed quota
- Users are warned not to submit confidential or sensitive personal information

See [SECURITY.md](SECURITY.md).

## Limitations

- Single-owner bearer authentication is not multi-tenant identity.
- D1 screenshot storage is intentionally small; production media should use R2 and scanning.
- In-isolate rate limits are best-effort across Workers.
- Model labels and response text are user supplied.
- Analytics describe the recorded sample only.
- vinext is evolving and should be compatibility-checked during upgrades.

## Future roadmap

R2 evidence uploads, Cloudflare Access, audit logs, blind labels, agreement analysis, rubric versioning, richer imports and filters, accessibility audit, and expanded database/E2E coverage.

## Contributing

Meaningful issues and pull requests are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT — see [LICENSE](LICENSE).
