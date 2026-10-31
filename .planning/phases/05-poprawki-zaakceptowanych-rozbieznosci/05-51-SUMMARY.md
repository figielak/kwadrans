---
phase: 05-poprawki-zaakceptowanych-rozbieznosci
plan: 51
status: complete
completed: 2026-10-31
packages: [P4-058]
---

# 05-51 SUMMARY: P4-058

- `obrot.ts`: `setup` daje potasowane szóstki rodzajów (kąt 90/180/270° × `mirror`); `b = turn(mirror ? flip(a) : a, kąt)`. Stan bez zmian kształtu (`{ a, b, mirror }`), ekran bez zmian.
- `figure` odrzuca też figury symetryczne względem 180° (np. kształt S): dla nich obrót o 180° nie zmieniał wyglądu, a 90° i 270° wyglądały tak samo, więc rodzaj planszy nie byłby jednoznaczny. Dawny dolosowany kąt dla takich figur zniknął. Obroty figury liczone raz (`rotations`).
- Rozmiary figur (4-7, co 3 pary), punktacja, kara i walidacja bez zmian; dawne partie i rekordy bez przeliczania (ZG4-v1 §3.2).
- TDD `22cd529` (1 test RED). W implementacji dopisany tylko limit czasu 60 s dla testu 1000 seedów (samo losowanie trwa ok. 9-10 s, wcześniej też ok. 8 s), bez zmiany sprawdzeń. Setup jednej partii ok. 9 ms. Typy i testy gier PASS.
- Do odbioru: partia Obrotu w /dev (solo i 6 osób), rekord i turniej, rewanż (klucz `mirror` w `MiniGame.tsx` dalej różni partie).
