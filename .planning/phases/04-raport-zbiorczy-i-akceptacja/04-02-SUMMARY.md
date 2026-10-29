---
phase: 04-raport-zbiorczy-i-akceptacja
plan: 02
subsystem: audit
tags: [audyt, playwright, dowody, warianty, zgodnosc-rekordow]
requires: ["04-01"]
provides:
  - "04-02-EVIDENCE.md v1: 15 pomiarów renderu, U01-U14 i P01-P22"
  - "DECISIONS.md v1: 106 oczekujących kart D4 i pełne mapowania"
affects: ["04-03", "04-04", "04-05"]
actuals:
  tasks: 3
  commits: 0
tech-stack:
  added: []
key-files:
  created:
    - .planning/phases/04-raport-zbiorczy-i-akceptacja/04-02-EVIDENCE.md
    - .planning/phases/04-raport-zbiorczy-i-akceptacja/DECISIONS.md
    - .planning/phases/04-raport-zbiorczy-i-akceptacja/04-02-SUMMARY.md
  modified:
    - .planning/phases/04-raport-zbiorczy-i-akceptacja/FINDINGS.md
    - .planning/phases/04-raport-zbiorczy-i-akceptacja/04-CONTEXT.md
    - .planning/STATE.md
    - .planning/ROADMAP.md
    - .planning/REQUIREMENTS.md
requirements-progress: [FIX-01]
requirements-completed: []
duration: nie mierzono
completed: 2026-10-26
status: complete
---

# 04-02: dowody i warianty decyzji

Wykonano trzy zadania zatwierdzonego planu. [Dowody](04-02-EVIDENCE.md) i [warianty](DECISIONS.md) są gotowe do przygotowania pakietów w 04-03. Wszystkie decyzje użytkownika nadal oczekują. Wykonanie tego planu nie zatwierdza zmian zasad ani migracji.

## Pomiary

Playwright MCP otworzył istniejące `/dev?n=4`; ramki ustawiono w DOM na 360×640. Memory zmierzono w rzeczywistej partii sieciowej, następnie wykonano 15 kontrolowanych pomiarów istniejącego komponentu Game z widoków osiągniętych legalnymi ruchami i seedem 42. Dla Kampus Tour zmierzono też okno 640×360: scena 800×390 w skali 0,8 nie jest viewportem.

- Potwierdzono przekroczenia wysokości: Memory 651/695 px przy 2/4 osobach, Labirynt 830, Chińczyk 750, Gomoku 686, Statki rozstawianie 781, Kalambury zgadujący 723, Koło solo po pierwszej próbie 707, Państwa-miasta pisanie 846.
- Kampus Tour ucina licznik i log w buy oraz roll z MPK, po partii rundę i Podsumowanie. W zmierzonym stanie Rewanż pozostaje widoczny; szacunku z audytu nie rozszerzono na wszystkie warianty. Akcje 48 px sceny mają tylko 38,39 px po skalowaniu.
- Podsumowania Kalamburów i Państw-miast mają dostępne Dalej w StickyBar mimo długiej treści. Koło przy 4 osobach ma 1345 px i akcje daleko pod ekranem, nawet z pustym RecordPanel.
- Zmieniono pewność tylko wystąpień w F4-056, F4-058, F4-092, F4-093, z zachowaniem historii. Wagi pozostały 7 wysokich / 55 średnich / 106 niskich, liczba F4 nadal 168.

Dokładne współrzędne, metoda i ścieżki PNG/JSON w `/tmp` są w EVIDENCE. Nie zmieniano komponentów ani nie dodawano diagnostyki do aplikacji. Montowanie stanów w ramce służy pomiarowi renderu; nie potwierdza pełnej partii sieciowej ani balansu.

## Decyzje i brakujące dane

106 kart D4 ma warianty A/B, rekomendację, skutek dla gracza, profil wpływu na stare rekordy/detail/turniej, miejsce zmiany dokumentów i zależności. Wszystkie 168 F4 mają mapowanie, agregaty z różnymi skutkami rozdzielono per gra. Osobne MP-01 obejmuje pytanie o Mapę bez dopisywania błędu.

Zmapowano 27 składników ośmiu grup propozycji F2, wszystkie 15 propozycji F3, 14 założeń D-01..D-14 oraz 47 istniejących odstępstw. Timeout Labiryntu ma wariant losowego legalnego kroku przez rng i alternatywę zachowania optymalnego ruchu z jawnym powodem. Próg zapasu 20%/10 s jest propozycją, a nie zatwierdzoną regułą.

P01-P22 i U01-U14 mają status, wykonawcę, miarę i warunek powrotu. Android z klawiaturą, czytniki, słaby telefon, 60/120 Hz i partie ludzi nadal wymagają odpowiedniego środowiska lub danych. Nie łączono się z Pi. Udostępniona kopia bazy mogłaby uzupełnić tylko część pytań: detail przechowuje się dla lidera, nie dla wszystkich partii, a czasów całego przebiegu nie zapisuje się w scores.

Zmiana jednostki, tie, limitu czy losowania ma jawną ocenę zgodności historii. Ewentualne wersjonowanie, migracja, archiwizacja lub czyszczenie danych stanowią osobny zakres do decyzji. Żaden wariant nie zmienia id gry.

## Weryfikacja i zakres zapisu

- `pnpm typecheck && pnpm test`: kod 0. Gry: 41 plików i 1819 testów; serwer: 1 plik i 15 testów; razem 1834.
- Kontrola strukturalna: 168 unikalnych F4, 106 unikalnych D4, wymagane pola każdej karty, istniejące odsyłacze i kotwice, komplet map F4/P2/P3/D-*/47 odstępstw/P01-P22/U01-U14/E01-E15, spójne kolumny tabel i obecność 15 zrzutów. Bez błędów.
- `git diff --check`: bez błędów. Kod w apps/packages i dokumenty źródłowe identyczne z HEAD i bazą 04-01. Repo zmienione tylko w `.planning/`; brak nowych zależności, commitów i push. Zastana baza wyników nietknięta; serwer używał `/tmp/kwadrans-04-02.db`.
- Środowisko najpierw blokowało nasłuch; serwer uruchomiono po eskalacji. Auto-review odrzucił Vite na 0.0.0.0 z powodu ekspozycji w sieci, zaakceptowany wariant 127.0.0.1 pozwolił wykonać pomiary. Nie ma pozostałej blokady pomiarów lokalnych.

## Przekazanie

Następny jest [04-03](04-03-PLAN.md): pakiety, priorytety, zależności i kryteria odbioru oraz raport do akceptacji. Dopiero 04-04 zbiera wybory użytkownika. Postęp fazy 4: 2/5; całość planów 32/35 (91%). FIX-01 i FIX-02 nadal otwarte.
