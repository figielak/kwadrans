---
phase: 05-poprawki-zaakceptowanych-rozbieznosci
plan: 24
status: complete
completed: 2026-10-31
packages: [P4-022]
---

# 05-24 SUMMARY: P4-022

- Przyczyna: `LobbyRoom.play` odnawiał limit przy każdej zmianie `waitingFor` (wynik rywala) albo gdy czekano na jedną osobę; `kolo.turn` z kluczem `waitingFor` robił to samo po końcu prób rywala.
- Poprawka: w mini-grze limit startuje raz w `endIntro` (ostatni Start albo 15 s); `play` po ruchu go nie rusza. `kolo.turn` usunięte, Koło używa `turnSeconds` 120. Gry ze stałym kluczem `turn` (Sekwencja, Schulte, Sudoku, Szacowanie, Rok) działają jak dotąd.
- TDD `93ef04b`: 4 testy RED przed poprawką (Stoper 2/6, Koło 2/6: 60 000 i 120 000 zamiast 40 000 i 90 000). Usunięto test `kolo.test.ts` zapisujący starą regułę odnowienia.
- Odbiór T: Start pierwszy/ostatni, 15 s instrukcji, termin pozostałych identyczny przed i po ruchu rywala, jeden timeout na gracza, Koło solo/2/6, rewanż od nowa. Turniej startuje każdą grę przez `startMatch`, więc termin też liczy się od nowa.
- Typy, 2014 testów gier i 44 serwera, build web PASS.
- Do odbioru UI przez użytkownika: /dev?n=2, mini-gra, w której jeden gracz kończy wcześnie; licznik drugiego nie skacze.
