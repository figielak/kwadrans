---
name: zostaw-serwery-dev
description: "Po skończonej pracy zostawiać działające serwery dev (server + web), użytkownik sam testuje"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 3c6f6c48-51ab-43be-9dd8-c4c1c028f19b
  modified: 2026-10-11T11:49:40.165Z
---

Po zakończeniu zadania w kwadrans nie zatrzymuj serwerów dev (`pnpm --filter server dev` na :2567 i `pnpm --filter web dev` na :5173). Jeśli nie działały, uruchom je i zostaw.

**Why:** użytkownik powiedział 2026-10-11 (po wdrożeniu Balonu, gdy ubiłem serwery po weryfikacji): „Pamiętaj aby zostawiać serwer. Ja zawsze chcę wytestować, jak coś zrobisz”.

**How to apply:** na koniec każdej zmiany sprawdź, że oba porty słuchają, i podaj adres do testu (`http://localhost:5173/dev?n=2`). Nie sprzątaj procesów dev w ramach porządków.
