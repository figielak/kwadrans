---
phase: 05-poprawki-zaakceptowanych-rozbieznosci
plan: 46
status: complete
completed: 2026-10-31
packages: [P4-051]
---

# 05-46 SUMMARY: P4-051

- `color-scheme: dark` w `html` (index.css) i meta w index.html (F4-062).
- Etykiety (F4-112): każdy `span` z `aria-label` ma `role="img"` (Game.tsx, Kampus Tour, Kalambury, Państwa-miasta, Statki, Zakupy, ui.tsx, Rekordy); pasek limitu z `aria-valuemin`/`aria-valuemax`; kropka na ekranie instrukcji `aria-hidden`; ikona X w Kampus Tour i kropka pudła w Statkach `aria-hidden`; Balon: pole pompowania to `<button aria-label="Pompuj balon">`; Za zasłoną: nazwa pola; Kalambury: płótno `role="img"` „Rysunek”; Inny element: „Figura n z m”; Sudoku: wiersz, kolumna i wartość; Statki: stan pola (pudło, trafiony, zatopiony, obok zatopionego); Labirynt: opis planszy z pozycjami pionków i liczbą ścianek.
- Wykres (F4-134): podsumowanie Kampus Tour ustawia podpowiedź na `pointerdown`, a `pointerleave` chowa ją tylko dla myszy.
- Labirynt nadal wybiera krok wskaźnikiem; opis planszy nie zastępuje sterowania z klawiatury (poza zakresem karty).
- TDD `070cc6e` (12 testów RED). Typy, 2268 gier (1 SKIP), 45 serwera, 107 web, build PASS.
- Do odbioru: U10 (dotknięcie wykresu na telefonie), U11 (TalkBack/VoiceOver faktycznie czyta etykiety i postęp). Odbiór czytnikiem i przeglądarkowy nie był wykonany w tej sesji.
