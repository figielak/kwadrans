---
id: 07-01
title: "Etapy 0-1: przegląd planu (Codex)"
type: audit
status: done
critical: false
effort: normal
depends: []
decisions: [D-08, D-09]
scope: [".telos/"]
---
## Goal
Niezależny przegląd zadań etapów 0-1 przed napisaniem testów.

## Read first
- .planning/ATRAKCYJNOSC-PLAN.md §4, §10
- apps/server/src/LobbyRoom.ts:340-354 (startMatch)
- apps/server/src/LobbyRoom.ts:382-429 (finish)
- apps/web/src/screens/Game.tsx:425-504 (ekran po partii)

## Files
- none

## Constraints
- Wykonawca: Codex, tylko do odczytu; Claude przepisuje ustalenia do Result. Blokujący problem → `/telos:revise` przed testami.
- Nie oceniamy ponownie decyzji D-01..D-09, tylko to, czy zadania je wiernie i wykonalnie realizują.

## Steps
1. Codex czyta zadania 07-02..07-06 i kod z Read first.
2. Sprawdza: czy interfejsy pasują do kodu, czego brakuje w testach i brzegach, czy solo bez timera nie zostawia wiszących pokoi, czy ResultHero działa dla gier bez `record`.
3. Każde ustalenie: zadanie, plik:linia, skutek, propozycja.
4. Claude zapisuje werdykt `OK` albo listę poprawek do Result.

## Acceptance
- [x] Werdykt i ustalenia są w Result
- [ ] `telos lint-plan 07` → exit 0

## Result
Werdykt (Codex, read-only): POPRAWKI BLOKUJĄCE 1-4, przed testami `/telos:revise`.
1. 07-04/07-05, Game.tsx:96: Kampus Tour wraca wcześniej, więc `ResultHero` we wspólnej części go ominie. Propozycja: jawnie objąć tę gałąź i dodać test renderowania Kampusu oraz gry bez `record`.
2. 07-05:80, LobbyRoom.ts:243: warunek „1 gracz → bez bohatera” koliduje z walkowerem (po wyjściu rywala `seats` ma jednego). Propozycja: rozróżnić partię solo od walkowera, testować ekran, nie tylko `heroResult`.
3. 07-05, Mapa.tsx:104: nazwy miast są w `children`, `RoundTable` dostaje tylko numery rund; `bestRoundLine` nie da „Gdańsk”. Propozycja: jawne etykiety rund, dodać `Mapa.tsx` do zakresu, test na prawdziwym komponencie.
4. 07-05:69, ui.tsx:432: brak resetu `skipIntro`; po odświeżeniu rewanżu może ruszyć próba przy biegnącym limicie. Propozycja: auto-start tylko dla `skipIntro && intro`; testy odświeżenia przed/po `begin` i StrictMode.
Niekrytyczne:
5. 07-04:48, LobbyRoom.ts:487: solo bez timera ma tylko godzinną bezczynność i 10 min reconnectu; test `msLeft === null` tego nie chroni. Dodać testy bezczynności, wyjścia, nieudanego reconnectu, zwolnienia limitu pokoi, pełnego limitu po `begin`, braku starego timera po rewanżu.
6. 07-04:49, kampus-tour.ts:691: dodać `places` dla biedniejszego monopolisty, remisu dalszych miejsc i kilku bankrutów (zgodność z `ranking`).
7. 07-02:34: brak konkretnego zestawu danych z oczekiwanymi miarami (pokój z samymi przerwanymi partiami, granica `since`, skala odsetków, mianownik).
Deviations: none
