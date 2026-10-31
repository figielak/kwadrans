---
phase: 05-poprawki-zaakceptowanych-rozbieznosci
plan: 45
status: complete
completed: 2026-10-31
packages: [P4-050]
---

# 05-45 SUMMARY: P4-050

- `btn-player` (D4-062 A): klasa w index.css, 24 przyciski akcji gracza zamiast `text-bg`; tło nadal z koloru gracza w `style`. ZASADY §4 odsyła do tabeli DESIGN (accent-hover i znak aplikacji już tam były).
- Tokeny (D4-063/064 A): uchwyt suwaka `fg`/`bg`; Kampus Tour i Gomoku bez `white`; Stój! i Sekwencja `bg` zamiast `accent-fg`; Statki: strefa zakazana i zły duch w `warning` (trafienie i zatopienie zostają w akcencie); Państwa-miasta: odrzucona bez tła akcentu (mój głos przeciw obrysem w moim kolorze), kafel litery `line`, gotowość `fg`; Rekordy: „Do pobicia” bez ostrzeżenia; Kampus Tour: pola do sprzedaży/Juwenaliów obrysem w moim kolorze; Setup i turniej: tryb, liczba gier i „na pewno” w kolorze wybierającego z `Check`.
- Pasek limitu (F4-097): Kampus Tour w kolorze gracza na turze; Państwa-miasta w moim kolorze, gdy czekamy na mnie (też poświata i tytuł fazy).
- Drugi znak (D4-065 A): inicjał (`initials`) na kamieniu Gomoku, pionku Chińczyka i Labiryntu, zebranej parze Memory i kropkach Zakupów; nick w etykietach Gomoku i Memory; ikona postaci właściciela na polu Kampus Tour; przerywany obrys celów w pokazie Śledzenia (ruch bez zmian); „Zła litera” z ikoną w Państwach-miastach.
- Cienie i promienie (F4-110/111): Gomoku bez cienia kamienia, zwycięska linia obrysem i `set-glow` (tylko gdy padła po wejściu); Memory bez poświaty; Statki `rounded-none`, Chińczyk `rounded-inset`, Wieża bez `rounded-sm`. Nazwane wyjątki w DESIGN §6: treść gry (rogi i grupy Kampus Tour, figury Obrotu, gradient Koła), suwak, 4 px, plansza 2.5D.
- TDD `6fd7a7b` (18 testów RED). Typy, 2268 gier (1 SKIP), 45 serwera, 95 web, build PASS.
- Do odbioru: U12 (sześć kolorów graczy na planszach), U11 (czytnik: nicki w etykietach), czytelność inicjałów na 360 px w Gomoku i Chińczyku. Odbiór przeglądarkowy nie był wykonany w tej sesji.
