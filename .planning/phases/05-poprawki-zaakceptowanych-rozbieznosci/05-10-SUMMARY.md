---
phase: 05-poprawki-zaakceptowanych-rozbieznosci
plan: 10
status: complete
completed: 2026-10-29
requirements: [FIX-02]
---

# 05-10: P4-013 wykonany

Narysuj koło: płótno mierzy wolną wysokość po nagłówku i statystykach, zostawiając miejsce
na komunikat, przycisk i dolny margines. ResizeObserver oraz resize/visualViewport aktualizują pomiar.
Przed pierwszą próbą rezerwujemy 48 px na zakończenie, żeby pole nie zmieniało wielkości po rysowaniu.
Płótno jest nadal kwadratowe, punkty nadal 0-1, punktacja, próby i zasady bez zmian.

Odebrano F4-056:kolo, 1/1 części. Łącznie 10/62 pakietów, 15/267 części; FIX-02 otwarte.
Następny P4-014: Państwa-miasta, formularz i głosowanie. U02 Android pozostaje osobnym otwartym pomiarem.

## Odbiór 360×640

- E09 odtworzony dokładnie: solo po pierwszej próbie, dokument 707 px, zakończenie y=635..683.
- Po zmianie solo: dokument 640 px, płótno 261×261, zakończenie y=568..616 (pełne 48 px).
- Pokój 2/6 z długimi nickami: dokument 360×640, płótno 293×293, zakończenie y=568..616.
- Przed i po pierwszym rysunku bok płótna identyczny, brak skoku przy pojawieniu się przycisku.
- Niedokończony rysunek prawdziwymi zdarzeniami wskaźnika: komunikat, zero result i zero zużytych prób.
- Koło narysowane wskaźnikiem: jeden result, wszystkie punkty 0-1; w kontrolowanym teście wynik 1000.
- Ponowny montaż z widokiem serwera zachowuje najlepszą próbę i widoczny przycisk.
- Zakończenie przyciskiem zachowuje najlepszy wynik; timeout pozostałych graczy kończy partię.
- me="" po końcu pokazuje dwie miniatury na gracza, bez pola rysowania; rewanż wraca do Start.
- Zrzut solo po próbie obejrzany: .playwright-mcp/05-10-kolo-solo.png, ignorowany w git.

UI sprawdzony przez prawdziwy Game/Kolo i niezmienione validateMove/applyMove/playerView/timeoutMove
w adapterze dla solo/2/6. Osobno prawdziwy pokój solo przez lokalny serwer i WebSocket
(DB_PATH=:memory:): Start, koło palcem/wskaźnikiem, odświeżenie strony po próbie, zakończenie.
Po rzeczywistym reload przycisk w y=568..616; wynik 100,0% widoczny także w panelu rekordu.
Bez dostępu do produkcji ani trwałej bazy. Układ wyników z wieloma graczami należy do P4-016.

## Weryfikacja

- pnpm typecheck && pnpm test: PASS, 1911 gier + 36 serwera = 1947.
- pnpm --filter web build: PASS, dotychczasowe ostrzeżenie pakietu JS >500 kB.
- git diff --check: PASS.
- Logi /tmp/kwadrans-05-10-tests.log i /tmp/kwadrans-05-10-build.log.

Bez nowych zależności i zmian reguł, więc nie dodawano nowych testów zasad ani commitu TDD.
Commit implementacji zgodnie ze stałą zgodą użytkownika; bez push.
