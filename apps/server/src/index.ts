import { fileURLToPath } from "node:url";
import { Server } from "@colyseus/core";
import { WebSocketTransport } from "@colyseus/ws-transport";
import { GAMES, MINI_GAME_IDS } from "@mini-games/games";
import express from "express";
import { LobbyRoom, stats } from "./LobbyRoom.ts";

const port = Number(process.env.PORT ?? 2567);
const webDist = fileURLToPath(new URL("../../web/dist", import.meta.url));

const server = new Server({
  transport: new WebSocketTransport(),
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
    app.use(express.static(webDist));
  },
});

server.define("lobby", LobbyRoom);
await server.listen(port);
console.log(`listening on :${port}`);
