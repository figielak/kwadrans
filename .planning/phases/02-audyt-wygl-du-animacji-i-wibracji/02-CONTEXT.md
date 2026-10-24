# Phase 2: Audyt wyglądu, animacji i wibracji - Context

**Gathered:** 2026-10-23
**Status:** Ready for planning (decyzje zaproponowane przez plannera, do potwierdzenia przez użytkownika)

<domain>
## Phase Boundary

Audyt bez zmian w repo: każdy ekran gry (`apps/web/src/games/*.tsx`) i platformy (`apps/web/src/screens/*.tsx`, `App.tsx`, `index.css`) porównany z `ZASADY.md` §4 (wygląd) i §5 (animacje i wibracje) oraz twardymi regułami UI z `AGENTS.md`. Wynik to jeden `FINDINGS.md` w katalogu fazy (wymagania UI-01..UI-05, ANIM-01..ANIM-03). Zasady gier, testy i podpięcie to faza 1, balans to faza 3, poprawki to faza 5.

</domain>

<decisions>
## Implementation Decisions

### Zakres
- **D-01:** Audytujemy wszystkie pliki `apps/web/src/games/*.tsx` (w tym `Quiz.tsx`, `Szacowanie.tsx`, `MiniGame.tsx`, `KampusSummary.tsx`), `apps/web/src/screens/*.tsx`, `App.tsx` i `index.css`. `Dev.tsx` (tylko tryb testowy) i `net.ts` są poza zakresem.
- **D-02:** Wspólne komponenty (`ui.tsx`, `Quiz.tsx`, `Szacowanie.tsx`) sprawdzamy raz: `ui.tsx` w 02-02, `Quiz.tsx` w pierwszym zadaniu 02-08, `Szacowanie.tsx` w pierwszym zadaniu 02-09, które go używa. Gry korzystające z nich odsyłają do tego wpisu i opisują tylko własny kod.
- **D-03:** Rozbieżność we wspólnym komponencie to jeden wpis przy komponencie, nie po jednym w każdej grze, która go używa.

### Źródła reguł
- **D-04:** Dozwolone kolory to tokeny z `@theme` w `index.css` (`bg`, `surface*`, `line*`, `fg*`, `accent*`, `warning`, `success`; role każdego w `DESIGN.md` §2) i kolor gracza (`PLAYER_COLORS` w `lobby.ts`, przez `style`). Kolor, który jest treścią gry (`DESIGN.md` §6: pola Sekwencji, napisy Koloru liter, figury Innego elementu, próbki Odcienia, grupy pól Kampus Tour; do tego paleta Kalamburów), nie jest rozbieżnością, jeśli ma jedno źródło w pliku gry; trafia na listę „Odstępstwa z powodem”. Token użyty w innej roli niż w tabeli `DESIGN.md` §2 (np. `success` jako ozdoba, `fg-subtle` dla ważnego tekstu) to wpis.
- **D-05:** Wyjątki opisane w `ZASADY.md`, `KONCEPT.md` i `DESIGN.md` §6 (własny nagłówek Państw-miast, Kalamburów i Kampus Tour, trafienie w `accent` w Statkach, cienie i przyciski 44 px w Kampus Tour, `SWAP_MS` w Statkach, klik metronomu w Rytmie, brak licznika w Rytmie, Przytrzymaj i Za zasłoną) idą na listę „Odstępstwa z powodem” bez wagi, żeby było widać, że sprawdzono. „Rozbieżności do decyzji” z `DESIGN.md` §6 (Statki, Gomoku, Państwa-miasta powyżej 640 px) to zwykłe wpisy z dopiskiem „znane z DESIGN.md §6”, z wysokością zmierzoną na nowo.
- **D-13:** `DESIGN.md` jest trzecim źródłem obok `ZASADY.md` §4/§5: sprawdzamy jego §5 (jeden wypełniony przycisk akcentu na ekran; akcent dla przycisków platformy, kolor gracza z `btn text-bg` dla akcji w partii; kolor nigdy jedynym sygnałem; obrys przed wypełnieniem; liczby nad polem gry tylko w `Stats`, tabela rund tylko `RoundTable`; podpisy jako `.label`, wyjątek dla grup w jednej liście; poświata nieruchoma), §2 (cień tylko pod oknami i pionkami Kampus Tour i w `set-glow`; typografia; ikony `regular` / `fill` / `bold`) i §4 (tabela stanów: focus, nieaktywny 40% z podpisem, przygaszony 60%, ładowanie czasownikiem z wielokropkiem bez spinnera, stan pusty jednym zdaniem, błąd z ikoną i `role="alert"`, bodziec refleksowy bez przejścia). Przy sprzeczności `ZASADY.md` z `DESIGN.md` wygrywa `ZASADY.md`, a sprzeczność to osobny wpis o niskiej wadze.
- **D-06:** Czasy animacji porównujemy z tabelą §5 według tego, co animacja pokazuje (reakcja na dotyk, przejście stanu, krok pionka, pojawienie, rzut, pływająca liczba). Animacja spoza tych kategorii (np. odsłona wyniku, ruch kulek w Śledzeniu) to wpis „brak w tabeli §5” o niskiej wadze, z propozycją: dopisać do tabeli albo użyć istniejącej.

### Wagi
- **D-07:** Waga według wpływu na gracza:
  - **wysoka**: pomiar czasu zależny od animacji, pole gry na czas bez `onPointerDown` albo bez `touch-none select-none` (wpływa na wynik), ekran gry nie mieści się na 360×640 albo przewija się w poziomie (nie da się grać), animacja blokująca ruch, licznik czasu widoczny w grze, która go ukrywa,
  - **średnia**: kolor spoza tokenów, czerwień zamiast koloru gracza, dwa wypełnione przyciski akcentu na ekranie, akcja w partii w akcencie zamiast koloru gracza, kolor jako jedyny sygnał, liczby nad polem gry poza `Stats`, pole dotykowe poniżej 48 px, animacja JS bez `reducedMotion`, wibracja niezgodna z tabelą, dublowana albo przy trafieniu, brak `Intro`, `Preview` albo punktu time / task / score, em-dash, kropka dziesiętna, inne słowo niż wspólne, ta sama sytuacja animowana różnie,
  - **niska**: zaokrąglenia inne niż 20 / 10 / 999 px, cień poza miejscami z `DESIGN.md` §2, podpis bloku w pogrubionym Satoshi zamiast `.label`, stan niezgodny z tabelą `DESIGN.md` §4 bez wpływu na grę, zła waga ikony, liczba bez mono albo `tabular-nums`, brak `aria-hidden` / `aria-label`, czas animacji poza tabelą, keyframes bez komentarza.

### Metoda
- **D-08:** Dozwolone są tymczasowe skrypty poza repo (scratchpad sesji, niecommitowane): grep i proste parsowanie JSX. Wynik skryptu (wiersze `plik:linia`) jest dowodem we wpisie. Repo zostaje bez zmian poza `.planning/`.
- **D-09:** Ekran 360×640 sprawdzamy najpierw statycznie (stałe `w-[..px]`, `min-w-*`, siatki bez `minmax(0,1fr)`, SVG bez `viewBox`, `whitespace-nowrap` w wierszach). Jeśli działają serwery dev (`pnpm --filter server dev`, `pnpm --filter web dev`), wolno dodatkowo otworzyć ekran w Playwright w oknie 360×640 i zapisać zrzut do scratchpadu; serwerów nie uruchamiamy na stałe i nie zatrzymujemy tych, które działały. Wpis mówi, czy sprawdzenie było statyczne czy w przeglądarce.
- **D-10:** Punktem odniesienia jest 02-02-BASELINE.md: wzorce z `index.css` i `ui.tsx` (np. `tenth`, `Stats`, `Intro`, `.btn`) uznane za zgodne z §4/§5 albo opisane jako rozbieżność platformy. Plany gier porównują się z nim, a nie każdy z osobna z §4/§5 od zera.

### Format i scalenie
- **D-11:** Wpis jak w fazie 1: gra lub ekran, `plik:linia`, źródło reguły (`ZASADY.md` §4/§5 + punkt albo `AGENTS.md`), waga, proponowana poprawka. Ta sama rozbieżność w wielu plikach to jeden wpis zbiorczy (`[zbiorcze: <klucz>]` w plikach częściowych, scalane w 02-11).
- **D-12:** Każdy plan fali 2 kończy sekcję gry tabelą „Sytuacje”: sytuacja (pojawienie elementu, trafienie, pomyłka, odsłona prawdziwego wyniku, koniec rundy, koniec partii, zbicie, moja tura) → animacja (`keyframes` + czas) → wibracja → słowa na przyciskach. 02-11 składa z nich macierz porównawczą między grami (kryterium 4: ta sama sytuacja = ta sama animacja).

### Claude's Discretion
- Podział gier na plany (taki sam jak w fazie 1, żeby ustalenia obu faz dało się łatwo zestawić w fazie 4).
- Forma skryptów i sposób zapisu dowodów.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Reguły do sprawdzenia
- `ZASADY.md` §4: spójność wyglądu (czego gra nie rysuje sama, z czego się składa, reguły)
- `ZASADY.md` §5: spójność animacji i wibracji (mechanizm, istniejące keyframes, tabela czasów, nieblokowanie, kroki sekwencyjne, `prefers-reduced-motion`, pomiar czasu, tabela wibracji)
- `DESIGN.md`: tokeny i ich role (§2), wzorcowe sekcje (§3), tabela stanów (§4), zasady (§5), wyjątki i znane rozbieżności (§6) (D-13)
- `AGENTS.md`: twarde reguły UI (ciemny motyw, tokeny, em-dash, kolor gracza, 48 px, 360×640)
- `KONCEPT.md` §2 (wyjątki per gra: brak licznika, dźwięk metronomu, własne nagłówki)
- `ZASADY-GIER.md`: sekcja gry, gdy UI ma coś pokazywać albo ukrywać

### Zakres i format
- `.planning/ROADMAP.md`: Phase 2, kryteria sukcesu i wspólny format `FINDINGS.md`
- `.planning/REQUIREMENTS.md`: UI-01..05, ANIM-01..03
- `.planning/phases/01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md`: ustalenia fazy 1 (żeby nie dublować wpisów o ekranie końcowym i podpięciu)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `apps/web/src/index.css:14-40`: tokeny kolorów, czcionek i zaokrągleń (`--radius-tile: 20px`, `--radius-inset: 10px`).
- `apps/web/src/index.css:194-338`: keyframes (`set-glow`, `ring-pulse`, `stone-pop`, `line-draw`, `preview-half`, `preview-quarter`, `title-pop`, `dice-tumble`, `card-in`, `float-up`, `tile-hit`, `tile-miss`, `piece-fall`, `shake`); `:360` reguła `prefers-reduced-motion`. Część z nich (`line-draw`, `title-pop`, `tile-hit`, `tile-miss`, `piece-fall`, `shake`) nie jest wymieniona w §5.
- `apps/web/src/screens/ui.tsx`: `Screen`, `TopBar`, `PlayerDots`, `GameDots`, `Scores`, `Stats`, `tenth` (:175, przecinek dziesiętny), `grade`, `RoundTable`, `StickyBar`, `IntroContext`, `Intro` (:268).

### Established Patterns
- `reducedMotion` jako stała modułu (`matchMedia("(prefers-reduced-motion: reduce)")`) tylko w 3 plikach: `KampusTour.tsx:208`, `Statki.tsx:48`, `Chinczyk.tsx:55`.
- Stałe kroków: `Chinczyk.tsx:51-54` (`STEP_MS` 180, `ROLL_MS` 700, szybki tryb 110 / 400), `KampusTour.tsx:206-207` (220 / 700), `Statki.tsx:47` (`SWAP_MS` 1200).
- `navigator.vibrate` w 16 plikach (Game.tsx i 15 gier).
- `<Intro` w 25 plikach gier na 30 mini-gier (reszta przez `Quiz.tsx` i `Szacowanie.tsx`).

### Integration Points
- `apps/web/src/screens/Game.tsx`: wspólny nagłówek, pasek czasu, wibracja tury, „Oglądasz”, „Rewanż” / „Do lobby”, część turniejowa (:136-:428).
- `apps/web/src/screens/Setup.tsx`: ekran gry głównej i `TournamentSetup`.

</code_context>

<specifics>
## Specific Ideas

Brak dodatkowych wymagań; decyzje to propozycje plannera wzorowane na fazie 1.

</specifics>

<deferred>
## Deferred Ideas

- Dopisanie do tabeli §5 animacji używanych, a nieopisanych (wynik D-06) to decyzja fazy 4 i poprawka fazy 5.

</deferred>

---

*Phase: 02-audyt-wygladu-animacji-i-wibracji*
*Context gathered: 2026-10-23*
