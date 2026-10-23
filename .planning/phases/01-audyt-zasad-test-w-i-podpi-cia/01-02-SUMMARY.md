---
phase: 01-audyt-zasad-test-w-i-podpi-cia
plan: 02
subsystem: web
tags: [audyt, podpięcie, rekordy, soloState, ekran-końcowy]

requires: []
provides:
  - "01-02-FINDINGS.md: tabela podpięć 38 gier × ZASADY.md §6 (z rekordami mini-gier), wpisy W1-W10, tabela WIRE-02 dla 30 mini-gier"
affects: [01-10]

actuals:
  tasks: 3
  commits: 0

tech-stack:
  added: []
  patterns:
    - "Skrypty audytu poza repo (scratchpad): table.ts (tabela podpięć z numerami linii), view.ts (playerView po końcu = stan), keys.ts (mapy per gracz), keys2.ts (powtórzenia klucza rewanżu)"

key-files:
  created:
    - .planning/phases/01-audyt-zasad-test-w-i-podpi-cia/01-02-FINDINGS.md
  modified: []

key-decisions:
  - "Kafle ze stanu lokalnego w Stoperze i Rytmie: waga średnia, nie wysoka; wynik i ranking rekordowej partii są poprawne, brakuje tylko kafla opisanego w ZASADY-GIER.md"
  - "Podwójny ranking Kalamburów to osobny wpis (W2), choć przyczyna ta sama co W1 (ręczny zbiór MINI_GAMES w Game.tsx)"

requirements-completed: [WIRE-01, WIRE-02]

coverage:
  - id: D1
    description: "Tabela podpięć: 38 wierszy, kolumny ZASADY-GIER, test, GAMES, View, komponent, Game.tsx, ICONS, MINI_GAMES (Game), MINI_GAMES (Lobby), BLURBS, record, tie, RECORDS, FORMAT"
    requirement: WIRE-01
    verification:
      - kind: other
        ref: "node --experimental-strip-types table.ts <repo> (scratchpad), komórki „brak” sprawdzone ręcznie"
        status: pass
    human_judgment: false
  - id: D2
    description: "Ekran końcowy 30 mini-gier przy soloState i me=\"\": werdykt z plik:linia"
    requirement: WIRE-02
    verification:
      - kind: other
        ref: "view.ts: playerView po końcu = stan w 30/30 grach; lektura gałęzi końcowej każdego komponentu"
        status: pass
    human_judgment: false

duration: 30min
completed: 2026-10-23
status: complete
---

# Phase 1 Plan 02: podpięcie i ekran końcowy mini-gier Summary

**Wszystkie 38 gier ma komplet podpięć z ZASADY.md §6, a kierunki i drugie kryteria rekordów zgadzają się z dokumentami; jedyna rozbieżność to ręczny zbiór `MINI_GAMES` w `Game.tsx` (ma Państwa-miasta, nie ma Kalamburów, co daje podwójny ranking). 28 z 30 mini-gier rysuje ekran końcowy z samego stanu; Stoper i Rytm mają po jednym kafelku ze stanu lokalnego.**

## Accomplishments

- Tabela podpięć 38 × 15 kolumn z `plik:linia` dla każdego ✓ (sekcja 2 FINDINGS); `CATEGORIES` i `BLURBS` też kompletne.
- `record.lower` i `tie` zgodne z `ZASADY-GIER.md` w 30/30 mini-grach; `RECORDS` i `FORMAT` mają wszystkie 30.
- Skrypt: `playerView` po końcu partii równa się stanowi w 30/30 grach, więc ekran rekordów (surowy stan z `soloState`) ma te same dane co pokój.
- Tabela WIRE-02 z werdyktem i ścieżką renderu dla 30 mini-gier.

## Wpisy (szczegóły w 01-02-FINDINGS.md, sekcja 3)

- Wysokie: brak.
- Średnie: W1 (`MINI_GAMES` w `Game.tsx:477` ≠ `GAMES`), W2 (Kalambury: podwójny ranking po partii przy 3+ graczach), W3 (Stoper i Rytm: kafel ze stanu lokalnego, brak w rekordowej partii).
- Niskie: W4-W10 (duplikat `MINI_GAMES` w Lobby, opis §6, jednostka Sekwencji w `FORMAT`, KONCEPT bez kryterium W pamięci, klucz rewanżu Sudoku bez `nonce`, test `soloState` bez map `progress`, stałe Śledzenia bez przedrostka).

## Deviations from Plan

- Kolumna „eksport `View`” sprawdzona w `index.ts` (§6 pkt 3), a komponent w `apps/web/src/games/<Gra>.tsx` jako osobna kolumna; plan łączył oba w jednym zdaniu.
- Dodatkowe kolumny poza planem: sekcja w `ZASADY-GIER.md`, plik testu, `BLURBS` (pozostałe punkty §6 sprawdzalne w kodzie).
- Ręczny odbiór w `/dev` poza zakresem (zgodnie z planem).

## Verification

- `grep -c "^| " 01-02-FINDINGS.md` → 70 (tabela podpięć 38 wierszy + nagłówek, WIRE-02 30 wierszy + nagłówek).
- `git status --porcelain`: nowe pliki tylko w `.planning/`; `D .claude/CLAUDE.md` i zmiany `.planning/*` były przed rozpoczęciem planu.
- Żadnego pliku skryptu w repo.
