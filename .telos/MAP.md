<!-- telos-map: commit d17f84550c9383d4794a57bd17fe14def6844613 · 2026-11-05 · files 241 -->
# Map

## Structure
- `packages/games/src/` zasady gier jako czyste funkcje, płasko: gra i jej test obok siebie
- `apps/server/src/` pokój, zapis wyników, API HTTP
- `apps/web/src/` klient: połączenie, ekrany w `apps/web/src/screens/`, UI gier w `apps/web/src/games/`
- `cloudflared/` tunel; `.github/workflows/ci.yml` CI; `Dockerfile`, `docker-compose.yml` obraz i wdrożenie
- `.planning/` tylko plany propozycji po audycie (wymagania w `.telos/PROPOSALS.md`); archiwum audytu w gicie pod `fb0f5d2`

## Entry points
- Serwer: `apps/server/src/index.ts:11-49` (trasy HTTP, definicja pokoju, statyczny frontend)
- Klient: `apps/web/src/main.tsx`, routing ekranów `apps/web/src/App.tsx:13-85`
- Tryb testowy kilku graczy: `apps/web/src/Dev.tsx`
- Pakiet gier: `packages/games/src/index.ts` (rejestr i eksporty)

## Flows
- Ruch gracza: `apps/web/src/screens/Game.tsx:377-405` wysyła ruch → schemat `apps/server/src/LobbyRoom.ts:178` → walidacja i zastosowanie `apps/server/src/LobbyRoom.ts:362-381` → widok per gracz `apps/server/src/LobbyRoom.ts:456-487` → `apps/web/src/net.ts:101-122` → `apps/web/src/App.tsx:35-40`
- Limit tury: `apps/server/src/LobbyRoom.ts:430-455` wywołuje ruch zegara przez tę samą ścieżkę walidacji
- Koniec partii i zapis wyników: `apps/server/src/LobbyRoom.ts:382-429` → `apps/server/src/stats.ts:64-104`
- Dołączenie i powrót: `apps/web/src/net.ts:123-160` → `apps/server/src/LobbyRoom.ts:213-259`
- Start partii i rewanż: `apps/server/src/LobbyRoom.ts:328-361`; turniej: `apps/server/src/LobbyRoom.ts:318-327`, `packages/games/src/turniej.ts`

## Areas
### Zasady gier
- Kontrakt gry: `packages/games/src/core.ts:14-45`; RNG, rankingi, rekordy, wyzwanie dnia: `packages/games/src/core.ts:48-266`
- Rejestr i lista mini-gier: `packages/games/src/index.ts:122-165`
- Wiadomości pokoju: `packages/games/src/lobby.ts:64-82`
- Największa gra: `packages/games/src/kampus-tour.ts`; wspólne quizy: `packages/games/src/quiz.ts`

### Serwer
- Pokój: `apps/server/src/LobbyRoom.ts:85-259` (cykl życia), `apps/server/src/LobbyRoom.ts:260-277` (wiadomości)
- Ranking i rekordy w SQLite: `apps/server/src/stats.ts:16-104`
- Testy: `apps/server/src/LobbyRoom.test.ts`, `apps/server/src/stats.test.ts`

### Ekrany klienta
- Ekran gry: `apps/web/src/screens/Game.tsx`; start: `apps/web/src/screens/Home.tsx`
- Lobby, ikony i opisy gier: `apps/web/src/screens/Lobby.tsx:64-107`, `apps/web/src/screens/Lobby.tsx:297-343`
- Przed partią: `apps/web/src/screens/Setup.tsx`; lista mini-gier: `apps/web/src/screens/MiniGames.tsx`
- Rekordy: `apps/web/src/screens/Records.tsx:115-294`, `apps/web/src/screens/Records.tsx:295-466`
- Wspólne UI: `apps/web/src/screens/ui.tsx:172-252` (tabela), `apps/web/src/screens/ui.tsx:308-405` (rundy), `apps/web/src/screens/ui.tsx:423-495` (instrukcja)

### UI gier
- Gry główne: `apps/web/src/games/KampusTour.tsx`, `apps/web/src/games/Statki.tsx`, `apps/web/src/games/Chinczyk.tsx`
- Mini-gra po identyfikatorze: `apps/web/src/games/MiniGame.tsx:47-396`, wpięcie `apps/web/src/screens/Game.tsx:405`

### Klient: wspólne
- Połączenie, API, nick, ostatnie pokoje: `apps/web/src/net.ts`
- Style i animacje: `apps/web/src/index.css`; wibracje: `apps/web/src/vibrate.ts`; pomiar bodźca: `apps/web/src/stimulus.ts`, `apps/web/src/clock.ts`
- Testy spójności UI: `apps/web/src/tokens.test.ts`, `apps/web/src/a11y.test.ts`, `apps/web/src/animations.test.ts`

## Find
- Założenia i architektura: `KONCEPT.md`
- Zasady konkretnej gry: `ZASADY-GIER.md`; jej kod: `packages/games/src/`
- Proces nowej gry, spójność UI: `ZASADY.md`; styl: `DESIGN.md`
- Dev i deploy: `README.md`; reguły agentów: `AGENTS.md`
- Trasy API: `apps/server/src/index.ts:19-43`
- Skróty kontekstu: `.telos/GAMES.md`, `.telos/AUDIT.md`; archiwum audytu: historia gita pod commitem fb0f5d2
