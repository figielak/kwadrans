---
phase: 05-poprawki-zaakceptowanych-rozbieznosci
plan: 31
status: complete
completed: 2026-10-31
packages: [P4-031]
---

# 05-31 SUMMARY: P4-031

- Dodano **38 przechodzących testów i 1 pominięty**. Zmiany wyłącznie w `stroop.test.ts`, `liczenie.test.ts`, `quiz.test.ts` i `stoj.test.ts` oraz planowaniu. Stan wyniku osiągany ruchami, bez podmiany map wyników.

| Atom F4 | Gry i nazwany test / dowód |
|---|---|
| F4-004 | Kolor liter i Liczenie: 1-6 graczy, 90 s, świeża gra dla 1/6 graczy nieskończona |
| F4-005 | Obie gry: pusty start, waitingFor wszystkich, identyczny seed odtwarza stan, inny zmienia wyzwanie |
| F4-006 | Obie gry: odrzucenie result po końcu dla A, B i obcego |
| F4-007 | Sześć quizów: suma dwóch czasów 30000 ms oraz 200 czasów po 150 ms przechodzą; Kolor liter i Liczenie: 150/5000 ms przechodzą |
| F4-008 | Kolor liter i Liczenie: zły type, brak times/errors, czas jako tekst; ułamkowe czasy i błędy już pokryte wspólnym quiz.test.ts z P4-023 |
| F4-009 | Kolor liter i Liczenie: wygrywa również A oraz C (B już pokryty) |
| F4-010 | Obie gry: głęboko zamrożone wejście, wynik bez mutacji, JSON round-trip po każdym ruchu |
| F4-046 | Liczenie: zakresy operandów i całkowity iloraz PASS. Równy udział rodzajów FAIL, test pominięty, szczegóły poniżej |
| F4-049 | Stój!: VISIBLE = 0.6 |

F4-007 odczytano według **aktualnych** zasad po P4-023: dozwolone są całkowite 0-30000 ms i dowolna liczba trafień przy sumie ≤30000. Nie przywrócono dawnych granic 150/5000 ani limitu 200. Suma 30001 i 201 trafień mieszczących się w czasie mają już testy P4-023; nie zdublowano ich.

Wykryty błąd i pominięcie:

- `P4-031/F4-046: rodzaje działań występują po równo` uruchomiono przed pominięciem. `setup([ania], createRng(1))` daje dla `+`, `−`, `×`, `:` **49, 55, 54, 42** zamiast **50, 50, 50, 50**. Log: `/tmp/kwadrans-p31-focused-red.log` (1 FAIL, 204 PASS przed usunięciem sześciu zdublowanych przypadków sumy 30001).
- ZASADY-GIER, Liczenie: „działania losowane po równo z czterech typów”. Generator `liczenie.ts` losuje typ niezależnie, bez kompletów; nie spełnia tej reguły.
- Zgodnie z poleceniem **bez poprawki logiki**. Test pozostawiony jako `test.skip` z komentarzem i odsyłaczem do tego SUMMARY. Naprawa ma już właściciela **P4-057**. Zakresy operandów przeszły; F4-046 pozostaje częściowo otwarte do P4-057. Żadnej nowej reguły nie utrwalono.

`pnpm typecheck && pnpm test`: **2150 testów gier PASS, 1 SKIP; 45 testów serwera PASS**. Odbiór: **19/20 części**, F4-046 częściowo (test zakresów PASS, udział rodzajów SKIP). Licznik zamkniętych części: **97/267**, nie 98. Pakiet testowy wykonany zgodnie z poleceniem pomijania wykrytych błędów. FIX-02 nadal otwarte.

STATE, ROADMAP, REQUIREMENTS i SCOPE zaktualizowane. Jeden commit „Testy: quizy i Stój!, luki P4-031”, bez push.
