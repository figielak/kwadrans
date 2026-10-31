---
phase: 05-poprawki-zaakceptowanych-rozbieznosci
plan: 39
status: complete
completed: 2026-10-31
packages: [P4-042]
---

# 05-39 SUMMARY: P4-042

- Pętla wyboru: `ring-pulse` 1,2 s wszędzie (Chińczyk z 1 s). Kropki kroku Labiryntu (SVG, bez obwódki) przestały migać zamiast przejścia na `ring-pulse`, wariant z F4-076.
- Czekanie spokojne: usunięte `animate-pulse` (Gomoku, Statki, podgląd kamienia, szkielet Lobby, pasek limitu w ostatnich 10 s) i `animate-ping` (Memory). Ostatnie 10 s limitu tylko kolorem `warning`.
- Przejścia: jawne `duration-180` (stan) i `duration-100` (paleta Kalamburów) w 14 miejscach; Lobby przejście obejmuje też tło.
- Pojawienie 0,35 s w nagłówku i plakietce wygranej (było 0,5 s); W pamięci 180 ms opisane jako wyjątek z komentarzem.
- Paski: `TimeBar` w ui.tsx (zegar `performance.now`, krok `TICK_MS` 250 ms, przejście 250 ms linear) w Rytmie i Zakupach zamiast 10-sekundowego przejścia CSS, więc działa przy reduced motion i po powrocie do karty; pasek limitu i Roku przejście = krok 250 ms. Rok: kolor gracza, ostrzeżenie od 10 s (było 5 s, `fg-muted`). Zakupy: tor `bg-line`.
- Szybki Chińczyk 110/400 ms i W pamięci 180 ms jako wyjątki w tabeli czasów ZASADY §5.
- TDD `f156052`: 4 testy RED. Typy, 2268 gier (1 SKIP), 45 serwera, 25 web, build PASS.
- Do odbioru UI: Chińczyk, Memory, Gomoku, Statki, Labirynt, Lobby (ładowanie), Rytm, Zakupy, Który rok?, pasek limitu; także z reduced motion i po powrocie do karty.
