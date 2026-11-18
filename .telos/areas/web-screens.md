<!-- telos-area: commit e618e97aeaa6c822f3aea64f167382f2c7b0fc48 · 2026-11-18 · paths: apps/web/src/screens/ -->
# web-screens

## Purpose
Platform screens: Home, Lobby, Setup, the game shell, mini-game list, Records, Profile, `/statystyki`, Evening,
Changelog, How to play, and shared UI pieces.

## Entry points
- `apps/web/src/screens/Game.tsx:39-44` — `MAIN_SCORE` map and `Game`
- `apps/web/src/screens/Game.tsx:204-705` — mount of each main game screen (keyed by `nonce`; Licytacja at `:680`)
- `apps/web/src/screens/Game.tsx:735-745` — `SIMULTANEOUS` games and `isSimultaneous` phases (Sabotaż, Wyprawa, Licytacja)
- `apps/web/src/screens/Lobby.tsx:510-600` — `ICONS` and `BLURBS` of games; guarded by `apps/web/src/screens/lists.test.ts`
- `apps/web/src/screens/howToPlay.ts:25` — `HOW_TO_PLAY` cards (Licytacja `:69`), a test keeps the set complete
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
