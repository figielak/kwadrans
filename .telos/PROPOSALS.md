# Propozycje po audycie
<!-- Przeniesione 2026-11-05 z niezacommitowanych .planning/REQUIREMENTS.md, ROADMAP.md i STATE.md. Pełne plany: .planning/*-PLAN.md.
     Nic nie jest zaakceptowane ani wdrożone. Fazy w ROADMAP.md: 07 atrakcyjność, 08-12 gry. -->

## Status (2026-11-05)
- Każda propozycja czeka na akceptację planu; plany są niezależne, akceptacja jednego nie zatwierdza pozostałych
  ani nie rozpoczyna wdrożeń. Kod i źródła prawdy bez zmian.
- Atrakcyjność: czeka na decyzje D1-D6; po akceptacji najpierw etap 0 (pomiar) i etap 1 (wyniki).
  Etapy: 0 pomiar (ATR-00), 1 wyniki z momentem (ATR-01), 2 rywalizacja w trakcie partii (ATR-02),
  3 wieczór w jednym pokoju, potem test z ludźmi (ATR-03), 4 wybór gry i wygląd (ATR-04), 5 powroty (ATR-05).
- Ścieżka każdej gry: zaakceptowane zasady do ZASADY-GIER/KONCEPT, testy przed kodem, zasady, ekran, integracja,
  testy/typy/build, minimalna i maksymalna obsada z obserwatorem, prywatność WebSocket, telefon i odbiór z ludźmi
  (szczegóły `ZASADY.md` §1-3 i §6). Wspólny szyfr dodatkowo: testy i dokumentacja wyniku kooperacyjnego i braku walkoweru,
  bez regresji starych gier. Podróbka: zasady, 60 par pytań, ekran i podpięcie, odbiór 3/6 graczy, telefonu i balansu.

## Atrakcyjność i gra z innymi
Plan: [ATRAKCYJNOSC-PLAN.md](../.planning/ATRAKCYJNOSC-PLAN.md).
- [ ] **ATR-00**: pomiar partii w pokoju i powrotów, przed zmianami.
- [ ] **ATR-01**: wyniki z bohaterem, różnicą i odsłoną; szczegóły zwinięte; solo bez automatycznego startu; znajomi na górze ekranu głównego.
- [ ] **ATR-02**: wspólny start 3-2-1, podgląd rywali `live` według rodzaju gry, chwile i reakcje, bez wpływu na pomiar i wyniki.
- [ ] **ATR-03**: głosowanie na następną grę, tabela wieczoru, Szybka seria, lobby pod grę, podsumowanie wieczoru.
- [ ] **ATR-04**: jaśniejsze powierzchnie, mniej mono, kafle z podglądem (najpierw pilot na 5 grach), „Dla was teraz”.
- [ ] **ATR-05**: pojedynki, rekord pokoju, postęp, seria dni bez kary, wspólny układ wyzwania, wyzwanie znajomego.

## Podróbka
Plan: [PODROBKA-PLAN.md](../.planning/PODROBKA-PLAN.md).
- [ ] **POD-01**: Gra główna `podrobka`, 3–6 graczy, 6 rund, losowanie par bez powtórzeń i jednej tajnej roli na rundę, tylko przez rng.
- [ ] **POD-02**: Odpowiedzi, głosy i odsłona z limitami 30/60/15 s; szkic, zatwierdzanie, timeouty, anulowanie pustej rundy, punktacja i remisy zgodne z zaakceptowanym planem.
- [ ] **POD-03**: Jawnie budowane widoki uczestnika i obserwatora; prywatne szkice, głosy i przydziały ukryte do właściwej fazy; reconnect i stare ruchy obsłużone.
- [ ] **POD-04**: Pula 60 par, walidacja danych i redakcyjny przegląd grywalności obu kierunków.
- [ ] **POD-05**: Ekran mobilny 360×640, cele 48 px, pełne odpowiedzi, klawiatura, wspólne tokeny i animacje, końcowy ranking z remisami i historia rund.
- [ ] **POD-06**: Komplet podpięć gry głównej, statystyki wygranych, dokumenty i testy przed kodem; bez nowych zależności, rekordów solo ani zmiany schematu bazy.
- [ ] **POD-07**: Typy, testy i build PASS; partie 3/6 z obserwatorem, timeouty, reload, WebSocket, wyjście, rewanż, fizyczny telefon i próba balansu odebrane.

## Blef na kościach
Plan: [BLEF-NA-KOSCIACH-PLAN.md](../.planning/BLEF-NA-KOSCIACH-PLAN.md).
- [ ] **BLEF-01**: 2–6 osób, 3 kości, podbijanie liczby/oczek bez jokerów i poprawne sprawdzenie „co najmniej”.
- [ ] **BLEF-02**: Utrata jednej kości, eliminacja, kolejność kolejnych tur, pełny ranking odpadania i legalne timeouty.
- [ ] **BLEF-03**: Prywatne rzuty, widok odpadniętego i obserwatora, odsłony/historia, JSON, rng i odrzucanie starych ruchów.
- [ ] **BLEF-04**: Mobilny ekran, komplet podpięć gry głównej, wygrana w statystykach, dokumenty i TDD.
- [ ] **BLEF-05**: Typy/testy/build, pełne partie 2/6 z obserwatorem, timeout/reload/reconnect/wyjście/rewanż, WebSocket, telefon i odbiór długości partii oraz czekania po eliminacji.

## Wyprawa
Plan: [WYPRAWA-PLAN.md](../.planning/WYPRAWA-PLAN.md).
- [ ] **WYP-01**: 2–6 osób, 5 wypraw, stała talia 15 skarbów i 15 zagrożeń, tasowana przez rng.
- [ ] **WYP-02**: Równoczesne powroty, podział skarbów i reszt, bezpieczny bank, utrata carried przy drugim zagrożeniu.
- [ ] **WYP-03**: Tajne decyzje i talia, timeout powrotu, brak wpływu kolejności wiadomości, bilans monet i remisy.
- [ ] **WYP-04**: Mobilne widoki szlaku/obozu/odsłony, historia, podpięcie, dokumenty i TDD.
- [ ] **WYP-05**: Typy/testy/build, partie 2/6 z obserwatorem, fazy i reconnect, wyjście/rewanż/ranking, WebSocket, telefon i odbiór czasu decyzji oraz czekania w obozie.

## Sabotaż
Plan: [SABOTAZ-PLAN.md](../.planning/SABOTAZ-PLAN.md).
- [ ] **SAB-01**: 3–6 osób, 6 rund, komplet 3 przejść + 1 pułapka, początkowa karta i tury dokładania.
- [ ] **SAB-02**: Aukcja ze stałym pasem, odkrywanie własnego stosu przed cudzymi od góry, punktacja 2/1/0 i remisy.
- [ ] **SAB-03**: Tajne karty, publiczne odkrycia, legalne timeouty, skończoność aukcji, rng i ochrona starych ruchów.
- [ ] **SAB-04**: Mobilne stosy, fazowe statusy i animacje, pełna historia i ranking, podpięcie, dokumenty i TDD.
- [ ] **SAB-05**: Typy/testy/build, partie 3/6 z obserwatorem, wszystkie fazy, WebSocket, telefon, rewanż/wyjście/statystyki i próba balansu premii oraz deklaracji 1.

## Wspólny szyfr
Plan: [WSPOLNY-SZYFR-PLAN.md](../.planning/WSPOLNY-SZYFR-PLAN.md).
- [ ] **SZYFR-01**: 2–6 osób, 3 zamki po 6 cyfr, 180 s i 3 próby na zamek, wspólny sukces tylko przy 3/3.
- [ ] **SZYFR-02**: Generator łańcucha, jedno rozwiązanie, każda wskazówka niezbędna, rozdział wymagający udziału każdego gracza.
- [ ] **SZYFR-03**: Prywatne wskazówki, publiczny szkic jednego wprowadzającego, nieodnawialny termin, zaufany expire, ochrona starych prób, reconnect i wyjaśnienia odsłon.
- [ ] **SZYFR-04**: Opcjonalny kontrakt cooperative/teamResult, poprawne statusy drużyny, brak indywidualnych pucharów i walkoweru, bez zmiany istniejących wyników/stats gier.
- [ ] **SZYFR-05**: Mobilny ekran wskazówek i klawiatura, komplet podpięć bez rekordów, dokumenty kontraktu i zasad, TDD generatora oraz integracji platformy.
- [ ] **SZYFR-06**: Typy/testy/build, niezależna kontrola rozwiązań, partie 2/6 i podziały 3/4/5, WebSocket, telefon, timeout/reload/wyjście/rewanż i próba współpracy z ludźmi.
