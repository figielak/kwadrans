---
phase: 05-poprawki-zaakceptowanych-rozbieznosci
plan: 40
status: complete
completed: 2026-10-31
packages: [P4-043]
---

# 05-40 SUMMARY: P4-043

- Jedna tabela: `VIBRATE` w `apps/web/src/vibrate.ts` (40 nowa decyzja, 60 pomyłka, [60,40,60] szkoda, 30 metronom); wszystkie gry używają stałych, test pilnuje zgodności z ZASADY §5.
- Zignorowany ruch (D4-079 A): Środek i Nożyczki bez wibracji 60, Koło dostało shake 300 ms obok powodu; Za zasłoną dotknięcie przed zniknięciem kulki bez efektu, opisane jako wyjątek.
- Pomyłka (D4-080 A): falstart w Refleksie wibruje 60, „Falstart!” w `warning` z `tile-miss`; błąd w Sekwencji wibruje 60, wynik idzie od razu, przez 1 s widać złe pole (`tile-miss`) i podświetlone właściwe. Legalne pudło w Statkach, Memory, Kalamburach bez wibracji.
- Szkoda od rywala (D4-081 A): `useHarm(key)` wibruje raz na nowy klucz, zdarzenie zastane przy wejściu/odświeżeniu nie wibruje. Statki: trafienie/zatopienie mojej floty (klucz pola). Kampus Tour: wykupienie mojego pola po dojściu pionka (`boughtOut` na ustalonych właścicielach). Państwa-miasta: STOP innego, gdy jeszcze piszę; baner STOP ze `stone-pop` 0,35 s.
- Nowa decyzja (D4-084 A): Game.tsx wibruje przy zmianie `decisionKey`. Państwa-miasta: nowa faza po limicie wibruje, STOP nie. Kalambury: rysujący od wyboru hasła, zgadujący od wejścia w rysowanie, połowa nic nie zmienia (nie zdradza fazy).
- Metronom (D4-083 A): 30 ms jako bodziec w tabeli i KONCEPT §2.4.
- Bez zmian kar, punktacji ani przyjmowania ruchów.
- TDD `19f35d5` (RED: brak modułu). Typy, 2268 gier (1 SKIP), 45 serwera, 46 web, build PASS.
- Do odbioru UI/U14 na telefonie: odczucie wibracji; poza urządzeniem można przechwycić `navigator.vibrate`. Odbiór przeglądarkowy nie był wykonany w tej sesji.
