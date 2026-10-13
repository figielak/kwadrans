import { fileURLToPath } from "node:url";
import { matchMaker, Server } from "@colyseus/core";
import { WebSocketTransport } from "@colyseus/ws-transport";
import { dailyGame, GAMES, MINI_GAME_IDS } from "@kwadrans/games";
import express from "express";
import { LobbyRoom, stats } from "./LobbyRoom.ts";

const port = Number(process.env.PORT ?? 2567);
const webDist = fileURLToPath(new URL("../../web/dist", import.meta.url));

const server = new Server({
  // Domyślne 4 KB nie mieści rysunku z Narysuj koło (do 1000 punktów, ok. 19 KB): ws zamykał połączenie kodem 1009 i gracz wypadał z pokoju.
  transport: new WebSocketTransport({ maxPayload: 32 * 1024 }),
  express: (app) => {
    app.get("/health", (_req, res) => {
      res.send("ok");
    });
    app.get("/api/stats", (_req, res) => {
      // W dev frontend stoi na innym porcie; ranking i tak widzi każdy na stronie.
      res.set("Access-Control-Allow-Origin", "*").json(stats.ranking());
    });
    app.get("/api/records", (_req, res) => {
      res.set("Access-Control-Allow-Origin", "*").json(stats.records(MINI_GAME_IDS.map((id) => ({ id, ...GAMES[id].record! }))));
    });
    // Rekordowa partia gry: osobno, bo listę rekordów ciągną też lobby i ekran gry, a tam rysunki są zbędne.
    app.get("/api/records/:gameId/top", (req, res) => {
      const id = req.params.gameId;
      if (!MINI_GAME_IDS.includes(id)) return void res.sendStatus(404);
      res.set("Access-Control-Allow-Origin", "*").json(stats.top({ id, ...GAMES[id].record! }));
    });
    // Wyzwanie dnia: gra na dziś i ranking wyników od północy (czas serwera, w kontenerze TZ=Europe/Warsaw).
    app.get("/api/daily", (_req, res) => {
      const midnight = new Date().setHours(0, 0, 0, 0);
      const id = dailyGame(Math.round(midnight / 86_400_000), MINI_GAME_IDS);
      res.set("Access-Control-Allow-Origin", "*").json({ gameId: id, rows: stats.records([{ id, ...GAMES[id].record! }], midnight)[id] });
    });
    // Które z ostatnich pokoi gracza jeszcze istnieją i ile osób w nich siedzi: kod → liczba połączonych.
    app.get("/api/rooms", async (req, res) => {
      const codes = String(req.query.kody ?? "").split(",").filter(Boolean).slice(0, 3);
      const found = (await Promise.all(codes.map((roomId) => matchMaker.query({ roomId })))).flat();
      res.set("Access-Control-Allow-Origin", "*").json(Object.fromEntries(found.map((r) => [r.roomId, r.clients])));
    });
    app.use(express.static(webDist));
  },
});

server.define("lobby", LobbyRoom);
await server.listen(port);
console.log(`listening on :${port}`);
