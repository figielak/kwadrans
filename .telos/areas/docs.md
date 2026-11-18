<!-- telos-area: commit d2a83565b27b4ed140b9b8ac4ecc20baf471783d · 2026-11-18 · paths: KONCEPT.md, ZASADY-GIER.md, ZASADY.md, DESIGN.md, README.md, .planning/, .claude/ -->
# docs

## Purpose
Sources of truth for rules, platform and look, the unstarted proposal plans, and the agent memory kept in the repo.

## Entry points
- `KONCEPT.md` — platform, game catalogue, `GameDefinition` contract, platform rules
- `ZASADY-GIER.md` — exact rules: table at the top, one section per game
- `ZASADY.md` — §1 before a new game, §2 tests, §3 rule consistency, §4 look, §5 animations and vibration, §6 wiring and acceptance
- `DESIGN.md` — visual style; `README.md` — dev and deploy
- `.planning/` — unstarted plans: Blef na kościach (09), Wspólny szyfr (12)
- `.claude/memory/` — hosting, Kampus Tour economy, dev-server habit

## Invariants
- On conflict the sources win over `.telos/` and over each other in this order: KONCEPT, ZASADY-GIER, ZASADY, DESIGN (ZASADY wins over DESIGN).
- A change of rules, constants or UI words updates `ZASADY-GIER.md` (and `ZASADY.md`/`DESIGN.md` for UI) in the same task; `KONCEPT.md` only for the catalogue or platform rules.

## Decisions
- Audit M1 (phases 01-05) lives in git at `fb0f5d2`; the post-audit digests (audit summary, proposals, games digest, lessons) were archived in git when telos moved to areas.

## Rejected
- Game drafts in `plany/` — rules live only in `ZASADY-GIER.md`.

## Pitfalls
- Old code maps and drafts can be outdated; the documents win.
