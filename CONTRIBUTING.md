# Contributing to EvalLens

## Setup and workflow

Install with `pnpm install`, copy `.env.example` to `.env.local`, apply local D1 migrations, and run `pnpm dev`.

1. Check existing issues and pull requests before opening a duplicate.
2. Create one focused branch: `feat/...`, `fix/...`, `test/...`, `docs/...`, or `ci/...`.
3. Add tests for behavior changes.
4. Run `pnpm typecheck`, `pnpm lint`, `pnpm test`, and `pnpm build`.
5. Open a pull request explaining purpose, impact, security/privacy considerations, and actual results.

Do not split trivial work into artificial pull requests. Never include credentials, personal data, or benchmark claims without a verifiable source and permission.

## Code quality

Use strict TypeScript, server validation, parameterized SQL, accessible labels, responsive layouts, and honest empty/error states. Numerical scores must never silently override human preference.

## Co-author attribution

Use `Co-authored-by: Name <verified-email>` only when that person genuinely made a material contribution and agreed to attribution. AI-assisted code alone does not justify naming an unrelated human co-author.
