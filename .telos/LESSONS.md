# Lessons
<!-- Max 20. One line each: "- [area] lesson (ref)"
     area: path prefix (src/game/) or topic (tests, astro, git); ref: NN-MM or quick.
     Read by `telos ctx plan` (all; plan turns relevant ones into task Constraints)
     and `telos ctx quick` (only areas matching the change's paths). `do` never reads this file.
     When full: promote a lesson that became a rule to PROJECT.md §Conventions (and remove it here)
     or drop a stale one. Never add a 21st. -->
- [apps/server/] Bezpośrednia zależność `zod` w serwerze tworzy drugą kopię `@colyseus/core` i każde dołączenie kończy się „seat reservation expired”; schematy tylko w `packages/games` (quick)
- [apps/server/] `maxPayload` WebSocket to ręczne 32 KB bez testu; zmiana kodowania punktów rysunku (Koło, Kalambury) wymaga sprawdzenia rozmiaru wiadomości (quick)
- [packages/games/] Po zmianie w `packages/games` serwer dev restartuje się sam i trwające partie w pamięci przepadają (quick)
- [packages/games/] Zmiana losowania lub stałych mini-gry nie przelicza starych rekordów; opisz w `ZASADY-GIER.md`, że historia jest wspólna (05-50)
- [packages/games/] Limit mini-gry to jeden termin od końca instrukcji; nie dawaj grze `turn()`, które odnawia czas po wyniku lub próbie (05-24)
- [packages/games/] Timeout mini-gry musi dawać najgorszy możliwy wynik; „same zera” albo 0 pomyłek po limicie bywa lepsze od uczciwej partii (05-03)
- [packages/games/] Ruch zarezerwowany dla zegara sprawdzaj przez `context.source === "timeout"`, nigdy przez pole w JSON klienta (05-02)
- [packages/games/] Generator z odrzucaniem (W pamięci, Obrót) sprawdź na 10 000 seedów pod kątem zawieszenia i średniej liczby podejść (05-52)
- [tests] Testy generatorów na wielu seedach potrafią przekroczyć domyślny timeout Vitest na CI; daj jawny dłuższy limit testu (quick)
- [tests] Skrypty SDK i testy przez WebSocket: max 10 wiadomości/s na klienta, inaczej rate limit daje fałszywe porażki (quick)
- [tests] Limit 3 pokoi na IP blokuje dłuższe testy w przeglądarce; restart serwera dev go zeruje (quick)
- [tests] Playwright: karty dzielą `localStorage`, więc drugi gracz wchodzi przez `http://127.0.0.1:5173` (inny origin), Vite z `--host` (quick)
- [apps/web/] Ekran partii mierz w 360×640 z rzeczywistym nagłówkiem, 2 i 6 graczami, długimi nickami i obserwatorem; sam viewport nie zastępuje telefonu z klawiaturą (05-09)
- [apps/web/] Ekran końcowy mini-gry rysuj wyłącznie ze stanu (mapy z id gracza), bo rekordowa partia jest pokazywana z `me=""` (05-33)
- [apps/web/] Nowy keyframe albo czas animacji dopisz do tabeli w `ZASADY.md` §5, inaczej `animations.test.ts` nie przejdzie (05-35)
- [apps/web/] Akcja w trakcie animacji: pierwsze dotknięcie kończy pokaz bez wysyłania ruchu, nowy stan z serwera zastępuje stary pokaz (05-14)
- [docs] Źródła prawdy to KONCEPT, ZASADY-GIER, ZASADY, DESIGN; stare mapy kodu i szkice mogą być nieaktualne, przy sprzeczności wygrywają dokumenty (quick)
- [docs] Każda zmiana zasad, stałych lub słów UI aktualizuje `ZASADY-GIER.md`/`KONCEPT.md` (i `DESIGN.md`/`ZASADY.md` dla UI) w tym samym zadaniu (05-01)
