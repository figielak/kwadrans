<!-- telos-area: commit d2a83565b27b4ed140b9b8ac4ecc20baf471783d · 2026-11-18 · paths: apps/web/src/screens/ -->
# web-screens

## Purpose
Platform screens: Home, Lobby, Setup, the game shell, mini-game list, Records, Profile, `/statystyki`, Evening,
Changelog, How to play, and shared UI pieces.

## Entry points
- `apps/web/src/screens/Game.tsx:38-42` — `MAIN_SCORE` map and `Game`
- `apps/web/src/screens/Game.tsx:204-700` — mount of each main game screen (keyed by `nonce`)
- `apps/web/src/screens/Game.tsx:721-735` — `SIMULTANEOUS` games and phases
- `apps/web/src/screens/Lobby.tsx:509-600` — `ICONS` and `BLURBS` of games; guarded by `apps/web/src/screens/lists.test.ts`
- `apps/web/src/screens/howToPlay.ts:25` — `HOW_TO_PLAY` cards, a test keeps the set complete
- `apps/web/src/screens/ui.tsx` — `EveningTable`, `VoteCards`, `ResultHero`, `ScoreTable`, `RoundTable`, `StickyBar`, `Intro`
- `apps/web/src/screens/Records.tsx`, `apps/web/src/screens/Profile.tsx`, `apps/web/src/screens/Statystyki.tsx`, `apps/web/src/screens/Evening.tsx`
- `apps/web/src/screens/Changelog.tsx` — `CHANGELOG` shown from the footer

## Invariants
- A new main game is wired in `Game.tsx` (score, simultaneous phases, mount), `Lobby.tsx` (`ICONS`, `BLURBS`) and `howToPlay.ts` (`ZASADY.md` §6).
- A player-visible change gets one `CHANGELOG` entry before publishing to `master`.
- Only `/statystyki` has a wide layout; every other screen fits 360×640.

## Decisions
- Vocabulary: "Zgłaszam gotowość", "Dalej" after a reveal, "Wyniki" only for the summary (P4-047).
- Profile is public by `nickKey`, without login.

## Rejected
- none

## Pitfalls
- Measure a game screen at 360×640 with the real header, 2 and 6 players, long nicks and an observer; a viewport is not a phone with a keyboard (05-09).
- Known defect: Kampus Tour has no "?" icon during a match (15).
