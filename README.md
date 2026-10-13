<p align="center">
  <img src="apps/web/public/icon.svg" width="96" alt="Logo Kwadransa" />
</p>

<h1 align="center">Kwadrans</h1>

<p align="center">
  Gry multiplayer w przeglądarce, do grania ze znajomymi na wykładach.<br />
  Jedna strona, kod pokoju, każdy gra na swoim telefonie.
</p>

<p align="center">
  <a href="https://games.figielak.dev">games.figielak.dev</a>
  ·
  <a href="https://github.com/figielak/kwadrans/actions/workflows/ci.yml"><img src="https://github.com/figielak/kwadrans/actions/workflows/ci.yml/badge.svg" alt="CI" align="center" /></a>
</p>

## Co to jest

- **Bez kont i instalacji.** Wpisujesz nick i czteroznakowy kod pokoju. Stronę można dodać do ekranu głównego jako PWA.
- **Do 6 graczy w pokoju**, kilka pokoi równolegle; kto nie ma miejsca przy stole, ogląda.
- **Tryb wykładowy.** Ciemny motyw, bez dźwięku, wibracje zamiast powiadomień, limit czasu na turę.
- **Odporność na słabe Wi-Fi.** Stan gry żyje na serwerze, klient łączy się ponownie sam, a po odświeżeniu strony wracasz do partii.
- **Także w pojedynkę.** Wyzwanie dnia (jedna mini-gra dziennie, ta sama dla wszystkich) i rekordy wszech czasów w każdej mini-grze.

## Gry

| Gra | Graczy | W skrócie |
|---|---|---|
| **Kampus Tour** | 2-4 | gra planszowa o kupowaniu pól i czynszach, w realiach Politechniki Rzeszowskiej i Rzeszowa |
| **Statki** | 2 | cztery tryby, od szybkiego 8×8 po flotę wojenną 12×12 |
| **Gomoku** | 2 | pięć w rzędzie na planszy 15×15 |
| **Chińczyk** | 2-4 | tryb klasyczny i szybki |
| **Memory** | 2-6 | trzy rozmiary planszy |
| **Państwa-miasta** | 2-6 | 5 rund, wszyscy piszą naraz, odpowiedzi ocenia głosowanie |
| **Mini-gry** (30) | 1-6 | krótkie wyzwania na refleks, pamięć, oko i liczenie: Refleks, Sekwencja, Narysuj koło, Mapa, Wieża, Rytm, Sudoku i inne |
| **Turniej** | 1-6 | seria mini-gier w jednym pokoju ze wspólną tabelą punktów |

Dokładne zasady każdej gry: [ZASADY-GIER.md](ZASADY-GIER.md).

## Jak to działa

```
Telefon (PWA, React)  ⇄  WebSocket  ⇄  Serwer Colyseus (Node)
                                          │
                                          ├─ logika gier (czyste funkcje TS)
                                          └─ SQLite (ranking i rekordy; stan pokoi w pamięci)
```

Serwer jest jedynym źródłem prawdy. Klient wysyła intencje („rzucam kośćmi”), serwer je waliduje, losuje,
liczy nowy stan i rozsyła każdemu graczowi jego widok, więc ukrytych informacji (ręka, plansza przeciwnika) nie da się podejrzeć.

Każda gra to moduł niezależny od sieci i interfejsu: `setup`, `validateMove`, `applyMove`, `playerView`, `isOver`
(kontrakt `GameDefinition` w [packages/games/src/core.ts](packages/games/src/core.ts)).

**Stack:** TypeScript, pnpm workspaces, Colyseus + Express, zod, Vite + React, Tailwind, SQLite (`node:sqlite`), Vitest, Docker.

## Uruchomienie

Wymaga Node 24 i pnpm 12.

```sh
pnpm install
pnpm --filter server dev   # http://localhost:2567
pnpm --filter web dev      # http://localhost:5173
pnpm typecheck && pnpm test
```

Tryb testowy `http://localhost:5173/dev?n=4` pokazuje kilku graczy obok siebie w jednym pokoju.

## Struktura

```
packages/games/src/   zasady gier z testami, kontrakt, rejestr GAMES
apps/server/src/      pokój Colyseus, SQLite, API rankingów
apps/web/src/         frontend: screens/ (platforma), games/ (interfejs każdej gry)
```

| Dokument | Zawartość |
|---|---|
| [KONCEPT.md](KONCEPT.md) | założenia, lista gier, architektura, reguły platformy |
| [ZASADY-GIER.md](ZASADY-GIER.md) | dokładne zasady każdej gry |
| [ZASADY.md](ZASADY.md) | proces dodawania gry, obowiązkowe testy, spójność wyglądu i animacji |
| [DESIGN.md](DESIGN.md) | styl wizualny: tokeny, wzorcowe sekcje, stany |
| [AGENTS.md](AGENTS.md) | instrukcje dla agentów AI |

## Deploy (Raspberry Pi)

Push na `master` uruchamia CI, które buduje obraz `linux/arm64` i publikuje go jako `ghcr.io/figielak/kwadrans:latest`.
Jeden kontener serwuje frontend i WebSockety, a Cloudflare Tunnel wystawia go pod `games.figielak.dev` bez otwierania portów.

Jednorazowo:

1. **Cloudflare** (bez Zero Trust): domena `figielak.dev` dodana do konta Cloudflare (darmowy plan, nameservery u rejestratora
   wskazują na Cloudflare). Na dowolnej maszynie z [cloudflared](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/):

   ```sh
   cloudflared tunnel login                              # w przeglądarce wybierz figielak.dev
   cloudflared tunnel create games                       # tworzy ~/.cloudflared/<UUID>.json
   cloudflared tunnel route dns games games.figielak.dev # rekord CNAME na tunel
   ```

2. **GHCR**: ustaw pakiet jako publiczny albo na Pi `docker login ghcr.io` (PAT z `read:packages`).
3. **Pi**: skopiuj `docker-compose.yml` i katalog `cloudflared/`, a plik `<UUID>.json` z kroku 1 wrzuć jako
   `cloudflared/credentials.json` (`chmod 644`, bo kontener cloudflared działa jako inny użytkownik).
   Tunel łączy się z Pi na zewnątrz, więc działa za CGNAT i bez przekierowania portów.

Aktualizacja:

```sh
docker compose pull && docker compose up -d
```
