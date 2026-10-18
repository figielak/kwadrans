---
name: hosting-setup
description: "Jak kwadrans jest hostowany: Pi 192.168.10.10, tunel cloudflared zarządzany z CLI (bez Zero Trust), obraz z GHCR"
metadata:
  node_type: memory
  type: project
  originSessionId: 4109b87e-ddce-4b25-9ed7-c48c56ca0f88
  modified: 2026-10-06T19:08:51.744Z
---

Produkcja (działa od 2026-10-06): Raspberry Pi `figielak@192.168.10.10`, katalog `~/kwadrans` (docker-compose.yml + cloudflared/config.yml + cloudflared/credentials.json). Obraz `ghcr.io/figielak/kwadrans:latest` (publiczny) budowany przez CI na push do master; aktualizacja: `docker compose pull && docker compose up -d` na Pi. Baza SQLite w wolumenie `kwadrans_games-data` (/app/data). docker-compose.yml na Pi nie aktualizuje się sam: po zmianie w repo trzeba go skopiować (`scp`). Do 2026-10-18 na Pi leżał compose bez wolumenu i baza ginęła przy każdym deployu.

Tunel Cloudflare `games` jest locally-managed (utworzony przez `cloudflared tunnel create` na laptopie, cert.pem i UUID.json w ~/.cloudflared laptopa).

**Why:** użytkownik nie ma i nie będzie miał Cloudflare Zero Trust; dom jest za CGNAT (brak publicznego IP), więc port forwarding odpada.
**How to apply:** nie proponuj tunelu z dashboardu Zero Trust ani TUNNEL_TOKEN; zmiany routingu robi się w cloudflared/config.yml. Alternatywa awaryjna: Tailscale Funnel.

Baza: wolumen `kwadrans_games-data` (`/app/data/games.db`). Do 2026-10-18 compose na Pi nie miał wolumenu i baza ginęła przy każdym `up -d` (stracone wyniki 13-18.10, przywrócona kopia z 13.10). Backup: `~/kwadrans/backup.sh` (VACUUM INTO, cron 4:30, 30 dni) do `~/kwadrans/backups/`.
