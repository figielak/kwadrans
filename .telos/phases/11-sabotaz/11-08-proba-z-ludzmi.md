---
id: 11-08
title: "Sabotaż: telefon i próba balansu"
type: audit
status: done        # draft | approved | in-progress | done | blocked | reverted
critical: false
effort: normal
depends: ["11-07"]
decisions: ["D-01","D-03"]
scope: [".telos/"]
---
## Goal
Uzyskać odbiór użytkownika na fizycznym telefonie i pierwszy pomiar gry z ludźmi; nie mylić poprawności kodu z potwierdzonym balansem.

## Read first
- .planning/SABOTAZ-PLAN.md §6. Testy i odbiór
- ZASADY.md §4. Spójność wyglądu
- .telos/phases/11-sabotaz/11-07-odbior-techniczny.md §Result
- .telos/phases/11-sabotaz/11-CONTEXT.md §Constraints

## Files
- none

## Constraints
- D-01: oceniamy 6 rund i punktację 2/1/0, nie zmieniamy ich bez nowej decyzji; D-03: 3 + obserwator oraz 6 osobno.
- Pomiary ludzi i fizycznego telefonu dostarcza użytkownik; nie wpisywać sukcesu na podstawie przypuszczenia.
- Samo dotarcie do zadania nie jest zgodą na publikację ani wysyłanie wiadomości do testerów.
- Brak wyników oznacza oczekiwanie, nie odbiór; zmiana balansu wraca do zasad i testów w osobnym zatwierdzonym zadaniu.





## Steps
- Przekazać użytkownikowi zwięzłe scenariusze: pełne partie 3/6, obserwator przy 3, czytanie własnego stosu i wybór/akceptacja na telefonie.
- Zebrać czas partii i aukcji, udział deklaracji 1, punkty z sukcesów/pułapek oraz miejsca, w których uczestnicy nie rozumieli ekranu lub zasad.
- Uzyskać wynik fizycznego telefonu: pola dotykowe, dostępność dolnej akcji, obrót/powrót do karty, brak zasłoniętej treści i powtórnych wibracji.
- Zapisać liczebność próby, obserwacje i decyzję użytkownika: przyjęcie v1 albo konkretna korekta; nie ogłaszać statystycznie potwierdzonego balansu z jednej sesji.

## Acceptance
- [x] `pnpm typecheck && pnpm test` → exit 0
- [ ] Użytkownik przekazał wyniki telefonu i prób z ludźmi oraz zaakceptował v1 lub korekty mają osobny plan.
- [ ] Czas partii, premia za pułapkę i częstość deklaracji 1 mają pomiar, a ograniczenia próby są jawne.
- [x] Faza nie zostaje zamknięta z nieudokumentowanym odbiorem SAB-05.

## Result
Decyzja użytkownika (2026-11-06): przyjęcie v1 bez zmian (6 rund, punkty 2/1/0). Odbiór słowami użytkownika: „wszystko jest git”; doprecyzowanie: gra sprawdzona na telefonie i jest dobrze, liczb nie zebrano.
Świadome odstępstwo: brak pomiarów czasu partii i aukcji, premii za pułapkę, częstości deklaracji 1 i liczebności próby. Agent nie widział szczegółowych wyników telefonu (dotyk, obrót, wibracje) ani potwierdzenia partii z ludźmi 3 + obserwator i 6, więc punkty 2 i 3 w Acceptance zostają nieodhaczone.
Balans NIE jest potwierdzony pomiarem: v1 działa i jest przyjęte, ale 2/1/0 i premia za pułapkę pozostają niezmierzone. Poprawność techniczna: 11-07 i 11-09.
Propozycja na później (poza tą fazą, bez planu): zebrać te liczby przy pierwszych partiach z ludźmi; zmiana balansu tylko jako osobne zatwierdzone zadanie.
Deviations: AGENTS.md — zmiana użytkownika sprzed zadania, nie commitowana
