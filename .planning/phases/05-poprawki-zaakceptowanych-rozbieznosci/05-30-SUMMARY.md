---
phase: 05-poprawki-zaakceptowanych-rozbieznosci
plan: 30
status: complete
completed: 2026-10-31
packages: [P4-030]
---

# 05-30 SUMMARY: P4-030

- **38 nowych testów** w ośmiu istniejących plikach testowych. Bez zmian kodu produkcyjnego i zasad. Nowe stany osiągnięte przez `setup` i walidowane ruchy, bez ręcznego ustawiania faz, pionków czy wyników.

| Atom F4 | Gry i nazwany test / dowód |
|---|---|
| F4-004 | Chińczyk: świeży Klasyczny 2/3/4; Państwa-miasta: min/max i świeża gra 2/6; Gomoku: 60 s; Statki: świeża gra i bitwa 60 s we wszystkich trybach; Turniej: NEXT_SECONDS = 15 |
| F4-005 | Państwa-miasta: odtworzenie stanu tym samym seedem, inne litery dla innego; Statki: ten sam seed w każdym trybie |
| F4-006 | Państwa-miasta: po pełnej partii write/vote/next odrzucane dla obu graczy i obcego |
| F4-007 | Państwa-miasta: 30 znaków przechodzi, 31 odpada; kategorie 0/5 dozwolone, −1/6 zabronione |
| F4-008 | Chińczyk: pawn ułamkowy, brakujący i −1; Państwa-miasta: zły typ, brak done, ułamkowa kategoria i obcy type; Gomoku: ułamkowe x; Statki: ułamkowa współrzędna/długość, brak współrzędnej/vertical |
| F4-009 | Państwa-miasta: B wygrywa po 5 rundach |
| F4-010 | Państwa-miasta: szkic, oddanie, głos i next na głęboko zamrożonym wejściu, bez mutacji i z JSON round-trip |
| F4-011 | Kalambury: kreska, pudło i pas bez zmiany klucza; Państwa-miasta: szkic, kolejne oddanie, głos i gotowość bez odnowienia terminu; pierwszy STOP zmienia klucz |
| F4-012 | Statki: obserwator bez flot w rozstawianiu; po końcu widzi tylko zatopioną flotę |
| F4-037 | Szybki Chińczyk: szóstka z wejściem do domku daje jeden dodatkowy rzut, potem tura B |
| F4-038 | Memory: SYMBOLS = 18 |
| F4-040 | Kalambury: inny seed, inny nonce |
| F4-041 | **Już pokryte w P4-028**: `labirynt.test.ts`, „pass tylko bez legalnego kroku: pionki blokują korytarz, choć droga po ściankach istnieje”. Legalne ruchy 4 graczy, timeout=pass i legalność pass. Bez dublowania testu; wariant 3-osobowy z F4 jest propozycją, nie odrębną regułą |
| F4-042 | Labirynt: trzeci pionek blokuje skok i pozwala na skosy; ścianka po jednej stronie zabrania tego skosu |
| F4-054 | Państwa-miasta: głos A niewidoczny dla B i obserwatora w vote, wszystkie głosy jawne w summary |

- Odbiór **24/24 części** karty: 23 uzupełnione oraz F4-041 potwierdzone istniejącym testem. Brak wykrytych błędów produkcyjnych i pominiętych przypadków.
- Testy celowane: **412 PASS** w 8 plikach. `pnpm typecheck && pnpm test`: **2112 gier + 45 serwera PASS**.
- Zaktualizowano STATE, ROADMAP, REQUIREMENTS i SCOPE. FIX-02 nadal otwarte. Jeden commit „Testy: gry główne i Turniej, luki P4-030”, bez push.
