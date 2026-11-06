---
id: 07-16
title: "Etap 2: odbiór, pomiar i obciążenie"
type: code
status: done
critical: false
effort: normal
depends: [07-13, 07-15]
decisions: [D-02, D-03, D-04]
scope: ["apps/web/src/screens/ui.tsx", "apps/web/src/screens/Game.tsx", "apps/web/src/index.css", "apps/web/src/moments.test.ts", "apps/web/src/live.test.ts", "DESIGN.md", "ZASADY.md"]
---
## Goal
Wspólny start, kropki na żywo, chwile i reakcje działają razem na telefonie, nie psują pomiaru i nie obciążają serwera.

## Read first
- DESIGN.md §1
- ZASADY.md §4
- ZASADY.md §5
- .planning/ATRAKCYJNOSC-PLAN.md §10

## Files
- apps/web/src/screens/ui.tsx (modify)
- apps/web/src/screens/Game.tsx (modify)
- apps/web/src/index.css (modify)
- apps/web/src/moments.test.ts (modify)
- apps/web/src/live.test.ts (modify)
- DESIGN.md (modify)
- ZASADY.md (modify)

## Constraints
- Warunek zatrzymania z planu §10: `live` lub reakcje obciążają Pi przy 6 graczach albo rozpraszają; wtedy wyłączamy je dla danej gry przez `def.live`.
- Lekcje [tests]: Playwright z drugim originem; 10 wiadomości/s; restart serwera zeruje limit pokoi.
- Testy tylko rozszerzać. Tylko poprawki odbioru.

## Tests (write first)
- `moments.test.ts`, `live.test.ts`: test na każdy błąd logiki znaleziony w odbiorze

## Steps
- Sprawdź `/dev?n=6`: wyścig, przeżycie, postęp, cisza pomiaru, gra główna, obserwator.
- Reconnect w odliczaniu i odświeżenie w każdej fazie.
- Zmierz w `docker stats` lub `top` serwer dev przy 6 graczach z `live`; wynik w Result.
- Popraw układ na 360×640 i `prefers-reduced-motion`.

## Acceptance
- [x] all listed tests pass
- [x] `pnpm typecheck` → exit 0
- [x] `pnpm test` → exit 0
- [x] `pnpm --filter web build` → exit 0
- [x] Refleks i Stoper bez ruchu na ekranie w trakcie pomiaru, potwierdzone w `/dev`
- [x] Obciążenie przy 6 graczach zapisane w Result

## Result

Odbiór w `/dev` (Playwright, ramki 2 i 6 graczy, 360×640): wspólny start (gotowość, lista „czyta zasady”, 3-2-1 zsynchronizowane), kropki na żywo w Liczeniu (trafienia i miejsce rywala widać u drugiego gracza i u obserwatora), reakcje (emotka widoczna u obu, znika po 1,2 s), ekran wyników 6 graczy z remisami, reconnect w odliczaniu (ramka wraca do tej samej partii, ten sam czas), obserwator ma „Oglądasz” i przycisk reakcji. Refleks i Stoper w pomiarze: zero emotek, komunikatów i kropek na żywo; w Stoperze zero animacji, w Refleksie tylko istniejący pasek limitu (P4-042).
Obciążenie serwera dev (laptop, `node-24`, 6 graczy w Liczeniu, każdy ok. 2,8 odpowiedzi/s, 74 trafienia, bez rozłączeń): CPU średnio 0,6 % (szczyt 3,0 %), RSS max 113 MB; baza dla 2 graczy 0,3 % i 112 MB. Warunek zatrzymania z planu §10 nie zachodzi, `def.live` zostaje.
Błędy odbioru: (1) duża cyfra odliczania pokazywała „4” przez ok. 120 ms, bo zegar widoku bywał starszy od wiadomości; `secondsLeft` w `intro.ts` + 5 testów w `intro.test.ts`; (2) przy 5-6 graczach na 360 px pasek limitu kurczył się do kilku pikseli, teraz ma min. 128 px i zawija się do własnego wiersza (`Game.tsx`, opis w DESIGN §3.4).
Testy: games 2340, server 130, web 349 (w tym 5 nowych), typy i build czyste. Nie sprawdzone w tym przebiegu: odświeżenie w każdej fazie osobno (tylko odliczanie i widok po partii) oraz emulacja `prefers-reduced-motion` w przeglądarce (potwierdzone czytaniem reguł w `index.css`).
Deviations: apps/web/src/screens/intro.ts — czysta funkcja `secondsLeft` dla błędu cyfry odliczania; apps/web/src/screens/intro.test.ts — test tego błędu (logika odliczania żyje w `intro`, nie w `moments`/`live`)
