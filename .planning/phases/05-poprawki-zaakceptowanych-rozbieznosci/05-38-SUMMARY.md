---
phase: 05-poprawki-zaakceptowanych-rozbieznosci
plan: 38
status: complete
completed: 2026-10-31
packages: [P4-040]
---

# 05-38 SUMMARY: P4-040

- Ruch będący zadaniem (Kubki, Śledzenie, Wieża, Za zasłoną) już szedł z `requestAnimationFrame` wprost w DOM, więc globalna reguła reduced motion go nie skracała; dopisano wyjątek w ZASADY §5 i komentarze w Śledzeniu i Wieży. Czas i tory bez zmian.
- `float-up` przy reduced motion znikał od razu (klatka końcowa `opacity: 0`), także werdykt Wieży. Teraz `[class*="animate-[float-up"]` dostaje `float-still 1.6s`: bez ruchu, widoczne 80% czasu, potem gaśnie. Wynik nie zależy od opacity.
- Podgląd Intro: zasada klatki bazowej spisana w §5 (pierwsza klatka bazowo widoczna, kolejne `opacity-0` z `animation-delay`); podglądy sprawdzone w audycie F4-064 jako czytelne, bez zmian kodu.
- TDD `4a535fb`: 2 testy RED. Typy, 2268 gier (1 SKIP), 45 serwera, 21 web, build PASS.
- Do odbioru: telefon z włączonym ograniczeniem ruchu (U13/U14): Wieża (werdykt), Balon, Kubki, Śledzenie, Zasłona, podglądy instrukcji.
