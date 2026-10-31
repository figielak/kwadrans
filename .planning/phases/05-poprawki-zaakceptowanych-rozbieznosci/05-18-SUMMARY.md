---
phase: 05-poprawki-zaakceptowanych-rozbieznosci
plan: 18
status: complete
completed: 2026-10-30
requirements: [FIX-02]
---

# 05-18: P4-008 wykonany

E06 (04-02): rozstawianie 781 px, Obróć/Losuj pod krawędzią i pod Gotowe. Pomiar przed zmianą (po P4-006):
rozstawianie 686 px, Obróć/Losuj 526-574 nachodzą na Gotowe 572-628; obserwator 889 px z dwiema pełnymi planszami
w stałej kolejności, więc przy strzałach drugiego gracza ostrzeliwana plansza leżała na 526-865 px.

Statki.tsx:
- Rozstawianie: Obróć i Losuj (ghost, 56 px, `gap-1 px-3 text-sm`) i Gotowe (`flex-1 px-4`) w jednym wierszu StickyBar.
  Pierwsza wersja z `px-4` wychodziła Gotowe do 374 px przy szerokości 360; poprawiono przed odbiorem.
- Podpowiedź po zaznaczeniu skrócona do jednej linii („Dotknij nowego miejsca. Czerwone są za blisko.”);
  dawna dwuliniowa wydłużała dokument do 646 px.
- Obserwator: `turn` bez warunku `seated`, mała plansza zawsze 3/5 i compact; u góry plansza, w którą strzela bieżący gracz.

Odbiór 1/1 części F4-056:`statki`. Łącznie 17/62 pakietów, 30/267 części. FIX-02 otwarte, następny P4-009.

## Pomiar (/dev, wnętrze ramki 360×640, 2 graczy + obserwator)

| Stan | Wynik |
|---|---|
| Rozstawianie, Szybki/Klasyczny/Amerykański/Flota wojenna | flota 142-482, przyciski 534-590 (16-329 px w poziomie), dokument 640; z zaznaczonym statkiem 640; po Obróć 640 |
| Rozstawianie po odświeżeniu gracza (Amerykański) | bez zmian, 640 |
| Czekanie na rywala | 640, „Zmień ustawienie” 541-589 |
| Bitwa, strzelający | cel 142-482, „Wybierz pole” 502-558; własna flota 3/5 586-799, po przewinięciu cała nad krawędzią (pasek nie przyklejony) |
| Bitwa, obrońca | własna flota 142-482, cel 3/5 498-711 |
| Obserwator | 763 px: duża plansza ostrzeliwanego 170-510, druga 3/5 526-739; po pudle zamiana, po odświeżeniu ten sam układ |
| Koniec (Szybki, rozegrany do zatopienia) | wyniki przewijane; po przewinięciu ostatnia plansza kończy się 20 px nad Rewanż/Do lobby u wszystkich trzech |
| Rewanż | rozstawianie 640 u obu graczy, obserwator w układzie bitwy |

## Weryfikacja

pnpm typecheck && pnpm test PASS: 2013 + 36 = 2049. Build web PASS. git diff --check PASS.
Bez zmian zasad, zależności i id. Commit bez push.
