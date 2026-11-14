# Changelog

## [1.0.0] - 2026-11-14

### Added

- Pairwise workspace with weighted scoring, N/A handling, evidence, and preference warnings
- Owner D1 persistence, history, public/private separation, export, rubrics, analytics, showcase, and learning module
- Cloudflare Workers/vinext configuration, normalized migration, health check, documentation, tests, and CI
- Dynamic default and custom rubric selection with immutable per-evaluation criterion snapshots
- Editable custom-rubric builder with criterion creation, removal, ordering, descriptions, and weights
- Verified GPT-1 versus GPT-2 OpenAI Progress case study with no unreviewed criterion scores
- CSV formula-injection protection, HTTP(S)-only source URLs, attachment MIME validation, security headers, expanded validation, browser coverage, and release screenshots

### Changed

- Analytics and historical normalized scores now use each evaluation's snapshotted rubric instead of hardcoded default criteria
- Production documentation now reflects the verified first-deployment secrets workflow
- Vite and transitive dependencies are pinned to patched releases; the release audit reports no known vulnerabilities
