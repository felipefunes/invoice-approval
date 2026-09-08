# CLAUDE.md

Shared project context for anyone (human or Claude Code) working in this repo.

## What this is

A UI prototype for receiving and acknowledging/disputing electronic invoices before
Chile's SII (tax authority), under Ley N° 19.983. It models the "tacit acceptance"
workflow: an invoice is legally deemed accepted 8 calendar days after SII receipt
unless it is expressly confirmed or formally disputed within that window. See
[`NOTAS.md`](./NOTAS.md) for the tax/usability evaluation behind the design.

This is a prototype with no real SII integration: all invoice/vendor data is
hardcoded mock data in `src/App.jsx` (see the "Decisiones tomadas" section of
`NOTAS.md`) — never real RUTs, amounts, or vendor records.

## Domain sensitivity — read before touching approval/date logic

This repo implements deadline and legal-status logic tied to a real Chilean tax law
(Ley 19.983), not just UI. Per the standing workflow rule, anything touching
financial/tax/legal correctness (the 8-day deadline calculation, `effectiveSiiStatus`,
the "Confirmar"/"Rechazar" actions, or the taxed dispute categories) falls under the
security/legal/tax exception: take the time to get it right, don't rush or
merge-and-follow-up. When in doubt, flag for Felipe's explicit review rather than
changing the logic unilaterally.

## Language note

The app's visible UI and the legal/tax documentation (`README.md`, `NOTAS.md`) are in
Spanish, intentionally: the real audience is Chilean business users and the source
material is Chilean tax law. Code (variable/function names, comments) is in English.
Repo policy for public repos is English-only docs; this is a known, flagged deviation
— see `CLAUDE.local.md` / the CTO audit notes for context before changing it, since a
translation of tax/legal terminology should get the same rigor as the exception above,
not a quick pass.

## Stack

Vite + React 18 + Tailwind CSS. No backend — all data lives in the client bundle.

## Commands

- `npm install`
- `npm run dev` — local dev server
- `npm run build` — production build (`./dist`)
- `npm run preview` — serve the production build locally

There is currently no lint or test script configured (see open audit items).

## Deployment

Static site on Render.com via `render.yaml` (Blueprint). No environment variables or
database required.

## Repo conventions

Follows the shared personal-repos CTO standard: MIT license (public repo), branch
protection on `main` (PR + 1 review, owner-bypass merge available, no force-push/delete),
`CODEOWNERS`, secret scanning + push protection + Dependabot alerts/security updates
enabled, and issue-linked PRs for bug fixes.
