---
phase: 05-poprawki-zaakceptowanych-rozbieznosci
plan: 21
status: complete
completed: 2026-10-31
requirements: [FIX-02]
---

# 05-21: P4-019 wykonany

Przed zmianą (odczyt kodu, F4-057): `useRolling` i `useWalk` działały osobno, `settled` blokował `myMove` i `rollNow`,
nie było akcji kończącej pokaz, a limit tury biegł w trakcie pokazu. Wibracja zbicia czekała na `settled`
i znaczyła zdarzenie numerem rzutu.

Chinczyk.tsx: `useRolling` i `useWalk` zastąpił jeden `useShow` (wzór `useMoveAnimation` z Kampus Tour).
Nowe zdarzenie (`last.roll` albo `last.move.pawn`) zaczyna pokaz od poprzedniego widoku serwera, bez zaległej kolejki;
ten sam widok bez nowego zdarzenia nie przerywa pokazu, a turlanie nie zaczyna się od nowa (`rollEnd`).
Montaż i `prefers-reduced-motion` pokazują od razu pozycje serwera. Warstwa „Pomiń animację” obejmuje planszę i dolny pasek,
zostaje do końca gestu (`holding`), więc puszczenie palca nie trafia w odsłonięty przycisk; jest przyciskiem, więc działa też z klawiatury.
Wybór pionka kasuje się po nowym zdarzeniu, fazie albo turze. Wibracja `[60, 40, 60]` raz na zdarzenie,
gdy pokaz dojdzie do końca albo zastąpi go następne zdarzenie; zastany ruch przy wejściu nie wibruje.
ZASADY §5: opis pomijania pokazu w Chińczyku, wzór kroków to `useShow`.
Bez zmian zasad, limitów 60/20 s, premii rzutów, tempa i geometrii.

Odbiór 1/1 części F4-057:`chinczyk`. Łącznie 20/62 pakietów, 33/267 części. FIX-02 otwarte.

## Odbiór (/dev, osobne karty 360×640, `WebSocket.send` i `navigator.vibrate` podsłuchane skryptem)

| Przypadek | Wynik |
|---|---|
| Szybki, 2 graczy: rzut, dotyk w trakcie, wybór i potwierdzenie (16 tur) | warstwa u obu graczy; dotyk ją zdejmuje, 0 wiadomości; wybór od razu dostępny; potwierdzenie = 1 ruch |
| Szybki, 2 graczy, pełna partia: 190 tur, 155 pominięć (aktor i rywal) | do końca; wibracje 3/4 = zbicia 3/4 |
| Klasyczny, 4 graczy, 8 min: 454 akcje, 606 pominięć, w tym szóstka z dodatkowym rzutem i trzecia szóstka | wysłane 101/118/124/111 = akcje; wibracje 5/3/7/7 = zbicia |
| Palec położony w pokazie i puszczony po jego naturalnym końcu (6 rzutów, raz nad „Rzuć” po szóstce) | warstwa trzyma się do puszczenia, 0 wiadomości, potem akcje dostępne |
| Zegar rywala | nowy rzut 20 s (nowy klucz tury jak dotąd), pominięcie go nie zmienia, po 2,2 s 18 s |
| Odświeżenie w trakcie marszu | bez warstwy i kolejki, pozycje stałe po 2 s |
| `prefers-reduced-motion` (6 akcji) | warstwa się nie pojawia, wynik i akcje od razu |
| Geometria w pokazie | dokument 640, warstwa 142-616 px (plansza i pasek) |
| Bez dotykania | pokaz kończy się sam, akcje dostępne (pętle czekały na zejście warstwy) |

Nie sprawdzono osobno: obserwatora (ten sam komponent bez `canMove`; warstwa tylko kończy pokaz) i rozłączenia sieci
(reconnect daje nowy montaż jak odświeżenie).

## Weryfikacja

pnpm typecheck && pnpm test PASS: 2013 + 36 = 2049. Build web PASS. git diff --check PASS.
