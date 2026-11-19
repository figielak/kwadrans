import { fileURLToPath } from "node:url";
import { matchMaker, Server } from "@colyseus/core";
import { WebSocketTransport } from "@colyseus/ws-transport";
import { dailyGame, GAMES, MINI_GAME_IDS, nickKey } from "@kwadrans/games";
import express from "express";
import { LobbyRoom, restoreRooms, saveRooms, stats } from "./LobbyRoom.ts";
import { dailyDay } from "./history.ts";

const port = Number(process.env.PORT ?? 2567);
const webDist = fileURLToPath(new URL("../../web/dist", import.meta.url));

const server = new Server({
  // Domyślne 4 KB nie mieści rysunku z Narysuj koło (do 1000 punktów, ok. 19 KB): ws zamykał połączenie kodem 1009 i gracz wypadał z pokoju.
  transport: new WebSocketTransport({ maxPayload: 32 * 1024 }),
  // Pokoje sprzed restartu wracają, zanim serwer zacznie przyjmować połączenia: klient, który wraca za wcześnie, straciłby miejsce.
  beforeListen: async () => {
    // Konstruktor serwera dopiero zaczyna przygotowywać matchmaker; bez tego pokój nie ma jeszcze gdzie powstać.
    await matchMaker.onReady;
    const restored = await restoreRooms();
    if (restored) console.log(`odtworzone pokoje: ${restored}`);
  },
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
      const { midnight, day } = dailyDay();
      const id = dailyGame(day, MINI_GAME_IDS);
      res.set("Access-Control-Allow-Origin", "*").json({ gameId: id, rows: stats.records([{ id, ...GAMES[id].record! }], midnight)[id] });
    });
    // Które z ostatnich pokoi gracza jeszcze istnieją i ile osób w nich siedzi: kod → liczba połączonych.
    app.get("/api/rooms", async (req, res) => {
      const codes = String(req.query.kody ?? "").split(",").filter(Boolean).slice(0, 3);
      const found = (await Promise.all(codes.map((roomId) => matchMaker.query({ roomId })))).flat();
      res.set("Access-Control-Allow-Origin", "*").json(Object.fromEntries(found.map((r) => [r.roomId, r.clients])));
    });
    // Profil gracza po nicku (nickKey), publiczny jak rankingi; 404, gdy nick nie ma żadnej partii.
    app.get("/api/profile/:nick", (req, res) => {
      const profile = stats.profile(nickKey(req.params.nick));
      if (!profile) return void res.set("Access-Control-Allow-Origin", "*").sendStatus(404);
      res.set("Access-Control-Allow-Origin", "*").json(profile);
    });
    // Historia stronami: `przed` to id ostatniej partii poprzedniej strony.
    app.get("/api/profile/:nick/history", (req, res) => {
      const before = Number(req.query.przed);
      res.set("Access-Control-Allow-Origin", "*").json(stats.history(nickKey(req.params.nick), Number.isInteger(before) && before > 0 ? before : undefined));
    });
    // Raport gier do ukrytej strony /statystyki: `dni` to okres wstecz, 0 albo brak to całość.
    app.get("/api/report", (req, res) => {
      const days = Number(req.query.dni);
      const since = Number.isFinite(days) && days > 0 ? Date.now() - days * 86_400_000 : 0;
      res.set("Access-Control-Allow-Origin", "*").json({ ...stats.report(Object.keys(GAMES), since), insights: stats.insights(since) });
    });
    app.use(express.static(webDist));
    // Ukryta strona raportu to ten sam frontend; bez linku z aplikacji i bez indeksowania.
    app.get("/statystyki", (_req, res) => {
      res.set("X-Robots-Tag", "noindex").sendFile(`${webDist}/index.html`);
    });
  },
});

server.define("lobby", LobbyRoom);
// SIGTERM (deploy, restart) i nieobsłużony wyjątek: zapis pokoi, dopóki połączenia jeszcze żyją.
server.onBeforeShutdown(saveRooms);
await server.listen(port);
console.log(`listening on :${port}`);
