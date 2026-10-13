import type { Room } from "@colyseus/sdk";
import { GAMES, type RoomView } from "@kwadrans/games";
import { CloseCode } from "@colyseus/sdk";
import { useEffect, useState } from "react";
import { forgetRoom, resumeRoom, watchRoom } from "./net.ts";
import { Home } from "./screens/Home.tsx";
import { Game } from "./screens/Game.tsx";
import { Lobby } from "./screens/Lobby.tsx";
import { MiniGames } from "./screens/MiniGames.tsx";
import { Records } from "./screens/Records.tsx";
import { Setup, TournamentSetup } from "./screens/Setup.tsx";

export function App() {
  const [room, setRoom] = useState<Room | null>(null);
  const [resuming, setResuming] = useState(true);
  const [view, setView] = useState<RoomView | null>(null);
  const [dropped, setDropped] = useState(false);
  const [notice, setNotice] = useState<string>();
  // Gospodarz otworzył listę mini-gier; samo otwarcie nie zmienia nic w pokoju.
  const [mini, setMini] = useState(false);
  // Ekran „Rekordy” otwarty z pokoju: lokalny jak lista mini-gier; start partii go zamyka.
  const [records, setRecords] = useState(false);
  const inLobby = view?.phase === "lobby";
  useEffect(() => {
    if (!inLobby) setRecords(false);
  }, [inLobby]);

  useEffect(() => {
    resumeRoom().then((r) => {
      setRoom(r);
      setResuming(false);
    });
  }, []);

  useEffect(() => {
    if (!room) return;
    const off = watchRoom(room, setView);
    room.onDrop(() => setDropped(true));
    room.onReconnect(() => setDropped(false));
    room.onLeave((code) => {
      forgetRoom();
      setRoom(null);
      setView(null);
      setDropped(false);
      if (code !== CloseCode.CONSENTED) setNotice("Połączenie z pokojem zostało zamknięte.");
    });
    return off;
  }, [room]);

  if (resuming) return <main className="min-h-[100dvh]" aria-busy />;
  if (!room) return <Home onRoom={setRoom} notice={notice} />;
  const send = (type: string, payload?: unknown) => room.send(type, payload);
  if (view && view.phase !== "lobby") return <Game view={view} me={room.sessionId} dropped={dropped} send={send} onLeave={() => room.leave()} />;
  const me = room.sessionId;
  const screen = { me, dropped, send, onLeave: () => room.leave() };
  const def = view?.gameId ? GAMES[view.gameId] : undefined;
  if (view?.tournament) return <TournamentSetup view={view} {...screen} />;
  // Gra główna ma własny ekran przed partią; mini-gry wybiera się na osobnej liście.
  if (view && def && def.minPlayers > 1) return <Setup view={view} {...screen} />;
  if (view && (def || (mini && view.hostId === me))) {
    const back = () => {
      setMini(false);
      send("pickGame", { gameId: null });
    };
    if (records) {
      const self = view.players.find((p) => p.id === me);
      // Gospodarz wybiera grę prosto z rekordów i ląduje na liście mini-gier z gotowym wyborem.
      const play = (gameId: string) => {
        send("pickGame", { gameId });
        setRecords(false);
      };
      return <Records nick={self?.nick ?? null} color={self?.color} onBack={() => setRecords(false)} onPlay={view.hostId === me ? play : undefined} />;
    }
    return <MiniGames view={view} {...screen} onBack={back} onRecords={() => setRecords(true)} />;
  }
  return <Lobby view={view} {...screen} onMini={() => setMini(true)} />;
}
