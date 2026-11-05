@AGENTS.md
@KONCEPT.md
@.claude/memory/MEMORY.md

<!-- telos:start v1 -->
## Telos
Project memory in `.telos/` — read only what the step needs:
PROJECT.md (rules) · MAP.md (where things are) · STATUS.md (now/next) · ROADMAP.md (phases)
· HISTORY.md (why; if present).
- Locate code via MAP.md; never read the whole repo.
- Never recreate paths or approaches listed in HISTORY.md §Delete-zone.
- Outside `/telos:*` commands, work normally but don't edit `.telos/` unless asked.
- `.telos/` files are written in English; reply in the user's language.
- Commits: Conventional Commits, scope = task id (`feat(01-02): …`), else `quick`; stage
  specific files only, never `--no-verify`, never push.
<!-- telos:end -->

Context digests in `.telos/` (read on demand): GAMES.md (all games) · AUDIT.md (audit M1, known risks, open items)
· PROPOSALS.md (post-audit proposals). In task `Read first`, cite sources directly, e.g. `ZASADY.md §5`.
