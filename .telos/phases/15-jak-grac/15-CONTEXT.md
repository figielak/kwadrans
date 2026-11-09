# 15 · Jak grać
## Goal
Nie każdy zna zasady gier głównych, a ekran gry pokazuje tylko jednozdaniowy opis z `BLURBS`.
Każda z 11 gier głównych dostaje krótką kartę „Jak grać”, napisaną językiem gracza i dostępną przed partią oraz w jej trakcie.
Faza kończy się na odbiorze technicznym, bez próby z ludźmi.

## Decisions
- D-01: Karty dostają wszystkie gry główne (`minPlayers > 1`). Mini-gry i Turniej zostają bez zmian, bo mini-gry mają `Intro`.
- D-02: Dwa wejścia do tej samej treści: rozwijane `<details>` w kafelku gry w `Setup.tsx` i ikona „?” w nagłówku partii otwierająca natywny `<dialog>`.
- D-03: Karta nie otwiera się sama, także przy pierwszej partii. Bez zapamiętywania „już czytałem”.
- D-04: Treść to osobne teksty w `apps/web`, nie pole `GameDefinition` ani fragmenty `ZASADY-GIER.md`. Liczby bierzemy ze stałych eksportowanych przez `@kwadrans/games`, gdy gra je eksportuje.
- D-05: Jeden układ: cel, przebieg, punktacja, „Uważaj” (2-3 punkty). Jedna karta na grę; tryb opisujemy tylko, gdy zmienia zasady. Limit 900 znaków, Kampus Tour 1800.
- D-06: Ikona jest widoczna także dla obserwatora, tylko w fazie `playing`. Czas tury biegnie dalej, a karta mówi o tym jednym zdaniem.

## Constraints
- Praca na gałęzi `faza/15-jak-grac`, commity na niej bez pytania, merge przy `/telos:done`, push tylko na prośbę.
- Karty są statycznym tekstem: bez zmian w `packages/games`, serwerze, `RoomView` i wiadomościach pokoju.
- Bez nowych zależności i nowych keyframe'ów (nowy keyframe wymagałby wpisu w `ZASADY.md` §5).
- Nazwy gier-pierwowzorów nie pojawiają się w kartach; polskie teksty bez em-dashy.
- `Państwa-miasta` i `Kalambury` mają w fazie `playing` własny nagłówek (`ownHeader`, `Game.tsx:291`), więc ikonę dostają jak `timer`.
- Wpis w CHANGELOG dopiero przed publikacją na `master`, poza fazą.

## Open questions
- none

## Carried over
- none

## Links
- ZASADY-GIER.md (sekcja każdej gry)
- ZASADY.md §4, §6
- DESIGN.md §5
