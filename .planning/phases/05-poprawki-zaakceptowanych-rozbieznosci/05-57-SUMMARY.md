---
phase: 05-poprawki-zaakceptowanych-rozbieznosci
plan: 57
status: complete
completed: 2026-10-31
packages: [P4-047]
---

# 05-57 SUMMARY: P4-047

- Przejścia: „Dalej” zamiast „Następny kolor” (Odcień), „Następna runda” (Policz kropki, Kąt) i „OK” (karta Dziekanatu, ostrzeżenie w Kampus Tour); „Wyniki” tylko przy przejściu do podsumowania (ostatnia runda szacowania, W pamięci bez zmian).
- Kampus Tour: nagłówek „Twój ruch”, „Ruch: {nick}”, a bez zwycięzcy „Remis” (albo „Koniec” przy jednym graczu), jak `Game.tsx`. Koło: „Najlepsza próba!” zamiast „Nowy rekord!”.
- Gotowość: Statki „Zgłaszam gotowość” (na 360 px łamie się na dwie linie w przycisku 56 px, zmierzone w przeglądarce: bez ucięcia), lobby po zgłoszeniu „Gotowość zgłoszona, czekamy na …”. „Gotowe” zostaje dla oddania (Zakupy, Państwa-miasta po STOP). Zamiast „Jestem gotowy” z D4-070 neutralne „Zgłaszam gotowość” (wybór użytkownika).
- Pary słów: „Czekamy na: {nicki}…” po „Dalej” w Państwach-miastach i Kalamburach; „Idealnie!” w szacowaniu i Który rok?; „Ta sama/Lustro” w podglądzie Obrotu; „ucięte” w Wieży; „czerwony” w legendzie Za zasłoną; odsłona Przytrzymaj podaje odchyłkę w ms jak pasek i wynik, zero bez znaku.
- Formy: „rysujesz” u rysującego, „Dotknij symbolu, który się różni”.
- Kolor przycisków bez zmian w kodzie: „Dalej” w partii w kolorze gracza, między grami turnieju akcent; zapisane w DESIGN §5. Słownik ról w ZASADY §4.
- Moment wysłania wyniku nigdzie się nie zmienił. Pozostawione: „Dalej” jako następne pole formularza w Państwach-miastach (czynność formularza, inna rola niż przejście rundy) i „wpisałeś” w Szacowaniu (poza zakresem F4 tej karty).
- TDD `1fe5ae6` (5 testów RED na drzewie bez zmian), testy bez zmian w implementacji. Typy, testy gier, serwera i web, build PASS.
- Do odbioru: przejścia od Intro przez odsłonę do Rewanżu w Odcieniu, Policz kropki, Kącie, Kampus Tour, Państwach-miastach, Kalamburach i Turnieju; Statki na telefonie.
