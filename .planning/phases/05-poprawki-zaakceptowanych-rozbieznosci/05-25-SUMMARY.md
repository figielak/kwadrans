---
phase: 05-poprawki-zaakceptowanych-rozbieznosci
plan: 25
status: complete
completed: 2026-10-31
packages: [P4-024]
---

# 05-25 SUMMARY: P4-024

- Przyczyna: miejsca partii porównywały średnią niezaokrągloną, a `record.tie` zaokrągloną do ms, więc ułamek ms dawał zwycięzcę partii, a w rekordach remis. `compareRecords` traktował znany tie i null jak remis, a SQL (`NULLS LAST`) stawiał null niżej.
- Poprawka: `averageMs` w core.ts używana w `byHitsThenAverage`, `byScoreThenAverage` i `record.tie` siedmiu gier; `compareTie` w `compareRecords`: znany przed null, dwa null równe, null nigdy jak zero. UI (`RecordPanel`, `standing`) korzysta z `compareRecords`, więc porządek jest jeden w SQL, core i UI.
- TDD `18f979b`: 3 testy core RED przed poprawką; test SQL/core przechodził już wcześniej i pilnuje zgodności.
- Dane: stare tie i null bez przeliczania (ZG4-v1 §3.2). Zmiana dokładności miejsc może dać remis tam, gdzie wcześniej był zwycięzca o ułamek ms, i tym samym zmienić punkty turnieju (granica karty).
- Typy, 2018 testów gier i 45 serwera, build web PASS.
- Do odbioru UI: quiz w /dev?n=2 z tą samą liczbą trafień; tabela, miejsca i panel rekordu zgodne.
