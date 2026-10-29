---
phase: 05-poprawki-zaakceptowanych-rozbieznosci
plan: 01
status: complete
completed: 2026-10-26
requirements: [FIX-02]
---

# 05-01: P4-001 wykonany

Ujednolicono wspólne normy w ZASADY.md §3/§4 oraz DESIGN.md §2/§5/§6 zgodnie z ZG4-v1.
Wykonano 5/5 części P4-001; faza 5: **1/62 pakietów**, **5/267 części poprawek**. FIX-02 pozostaje otwarte.

## Odbiór pięciu części

Przed zmianą odczytano karty F4 i D4 oraz ZG4-v1 §3.3. Po zmianie powtórzono porównanie dokumentów ze źródłami kodu wskazanymi przez audyt.

| Część | Zmiana i ponowna kontrola źródła | Wynik |
|---|---|---|
| F4-002:regula-zapasu | ZASADY §3: L >= max(1,2*T, T+10 s), oddzielne czasy stałe, ludzkie i sieć, źródła założeń oraz T(N). Zestawiono z modelem F3 §5 / 03-02-BASELINE §1.2. Środek 60 s i Tort 120 s pozostają wyjątkami; Rok 270 s dopiero w P4-021. Sprawdzono arytmetykę: 42 s / 228 s = 18,421%, pełny próg 273,6 s. | wykonane; model nie jest pomiarem |
| F4-060:całość | DESIGN §2 zawiera accent-hover #ff4560, wyłącznie dla btn-primary pod kursorem. Porównano z definicją i użyciem w apps/web/src/index.css. | wykonane |
| F4-061:całość | ZASADY §4 odsyłają do katalogu DESIGN §2 zamiast utrzymywać skróconą listę kolorów i promieni. Wszystkie 15 tokenów --color-* w CSS ma wpis w katalogu; skala obejmuje 20/10/999 px. Odsyłacze i nagłówki istnieją. | wykonane |
| F4-067:całość | Rola accent obejmuje znak aplikacji; §1/§5 DESIGN nie traktują logo jako drugiej akcji. Potwierdzono fill-accent w Logo w Home.tsx. | wykonane |
| F4-069:całość | ZASADY §4 i DESIGN §6 dopuszczają pionowe przewijanie list poza partią z dostępną dolną akcją. Usunięto błędną deklarację, że wszystkie mini-gry i inne ekrany mieszczą się w 640 px. Ponownie odczytano układy Home/Lobby/Setup/Records oraz użycie StickyBar. | wykonane jako korekta normy i opisu, bez odbioru UI |

## Dodatkowe granice zaakceptowanych decyzji

- D4-029:A: stały komplet przy decyzji stop; sama suma wymaga uzasadnienia wpływu rozkładu. Nie zmieniono Balonu (P4-060).
- D4-035:B: świadomy remis przy komplecie z powodem i wspólnym komparatorem; nie dodano tie ani nowej umiejętności.
- D4-056:A tylko dla list poza partią; formularze w partii, wyniki i hitboxy pozostają we własnych pakietach.
- D4-062:A: opis kontraktu .btn-player w DESIGN §5; implementacja i migracja nadal należą do P4-050. Dokument mówi wprost, że klasa jeszcze nie istnieje.
- Routing odstępstw P4-001: F1:O01..03 zachowane i objaśnione w ZASADY §3, zgodnie z istniejącym ZASADY-GIER §1 i §Koło; F1:O09 zachowuje losowe cele Przytrzymaj/Zasłony; F2:O23 oddziela dekorację/wybór klienta od zasad z rng.
- KONCEPT i ZASADY-GIER pozostawiono bez zmian: opisują aktualne liczby i mechaniki. Stan przejściowy nowych norm zaznaczono w ZASADY; nie wpisano nowych limitów jako już wdrożonych.

## Weryfikacja

- `pnpm typecheck && pnpm test`: kod wyjścia 0; kontrola typów games/server/web poprawna, 41 plików / 1819 testów gier oraz 1 plik / 15 testów serwera, łącznie **1834 testy**.
- Porównanie katalogu z CSS i sprawdzenie odsyłaczy ZASADY/DESIGN: poprawne.
- `git diff --check`: bez błędów. Brak zmian w apps/, packages/, zależnościach i danych.
- Nie tworzono testów brzmienia dokumentacji ani odbioru urządzeń dla niezmienionego UI. Pomiary U/P innych pakietów pozostają otwarte.
- Bez commitów, push i wdrożenia. Zachowano zastane zmiany planowania.

## Następny krok

Przygotowano [05-02-PLAN.md](05-02-PLAN.md): P4-027, zaufane źródło walidacji i podpowiedź Kalamburów tylko po limicie.
Nie rozpoczęto wykonania 05-02. Przed implementacją zmiany reguły obowiązuje osobny commit przygotowanych testów na prośbę użytkownika; zgoda na zakres nie jest zgodą na Git.
