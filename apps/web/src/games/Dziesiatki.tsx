import { DZIESIATKI_SIDE, DZIESIATKI_TARGET, type DziesiatkiView, dziesiatkiTake, type LobbyPlayer, QUIZ_DURATION_MS, type QuizMove } from "@mini-games/games";
import { useEffect, useRef, useState } from "react";
import { Intro, Stats } from "../screens/ui.tsx";
import { BLOCK_MS, MAX_ANSWER, MIN_ANSWER, Results } from "./Quiz.tsx";

interface Props {
  view: DziesiatkiView;
  me: string;
  players: LobbyPlayer[];
  ranking?: string[];
  winner?: string;
  onMove: (move: QuizMove) => void;
  /** Start rundy (ile ms potrwa) i jej koniec (null): nagłówek pokazuje wtedy czas rundy zamiast limitu platformy. */
  onRound?: (msLeft: number | null) => void;
}

type Phase = "intro" | "play" | "wrong" | "sent";

/** Podgląd na ekranie instrukcji: cztery liczby, para dająca 10 co chwilę się zaznacza. */
function Preview() {
  return (
    <div className="flex gap-2">
      {[3, 6, 7, 2].map((n, i) => (
        <span key={i} className="relative flex size-12 items-center justify-center rounded-inset border border-line bg-surface font-mono text-xl font-semibold">
          {n}
          {n !== 6 && n !== 2 && (
            <span className="absolute -inset-px animate-[preview-half_2.4s_linear_infinite] rounded-inset border-2 border-success opacity-0 [animation-delay:-1.2s]" />
          )}
        </span>
      ))}
    </div>
  );
}

export function Dziesiatki({ view, me, players, ranking, winner, onMove, onRound }: Props) {
  const playing = view.players.includes(me) && !(me in view.results);
  const color = players.find((p) => p.id === me)?.color;
  const [phase, setPhase] = useState<Phase>("intro");
  const [board, setBoard] = useState(view.board);
  const [selected, setSelected] = useState<number | null>(null);
  /** Ostatnia dwójka: zielony błysk przy parze, czerwony z potrząśnięciem przy pomyłce. */
  const [flash, setFlash] = useState<{ cells: number[]; ok: boolean; id: number } | null>(null);
  const run = useRef({ start: 0, shownAt: 0, pairs: 0, times: [] as number[], errors: 0, streak: 0, timer: 0 });

  function start() {
    const t = performance.now();
    run.current = { start: t, shownAt: t, pairs: 0, times: [], errors: 0, streak: 0, timer: 0 };
    setPhase("play");
  }

  function tap(cell: number) {
    if (phase !== "play") return;
    if (selected === null) return setSelected(cell);
    setSelected(null);
    if (selected === cell) return;
    const r = run.current;
    const now = performance.now();
    const ok = board[selected] + board[cell] === DZIESIATKI_TARGET;
    setFlash((f) => ({ cells: [selected, cell], ok, id: (f?.id ?? 0) + 1 }));
    if (ok) {
      const took = Math.round(now - r.shownAt);
      // ponytail: para po 5 s liczona jako 5 s, szybsza niż 150 ms przepada (serwer by ją odrzucił), jak w Quiz.tsx
      if (took >= MIN_ANSWER) r.times.push(Math.min(took, MAX_ANSWER));
      r.streak++;
      r.shownAt = now;
      const at = (2 * r.pairs++) % view.refills.length;
      setBoard(dziesiatkiTake(board, selected, cell, view.refills[at], view.refills[at + 1]));
    } else {
      r.errors++;
      r.streak = 0;
      navigator.vibrate?.(60);
      setPhase("wrong");
      r.timer = window.setTimeout(() => setPhase("play"), BLOCK_MS);
    }
  }

  // Zegar gry: kończy partię po 30 s (czas do końca pokazuje nagłówek).
  useEffect(() => {
    if (phase === "intro" || phase === "sent") return;
    const id = setInterval(() => {
      const r = run.current;
      if (performance.now() - r.start < QUIZ_DURATION_MS) return;
      clearTimeout(r.timer);
      setPhase("sent");
      onMove({ type: "result", times: r.times, errors: r.errors });
    }, 100);
    return () => clearInterval(id);
  }, [phase === "intro" || phase === "sent"]);

  useEffect(() => () => clearTimeout(run.current.timer), []);

  const idle = phase === "intro" || phase === "sent";
  useEffect(() => onRound?.(idle ? null : QUIZ_DURATION_MS), [idle]);

  if (!playing || phase === "sent") {
    return (
      <Results
        view={view}
        me={me}
        players={players}
        ranking={ranking}
        winner={winner}
        label="Pary"
        note="Wygrywa najwięcej par, przy remisie niższy średni czas. Błędy nie odejmują par, każdy kosztował sekundę blokady."
      />
    );
  }

  if (phase === "intro") {
    return (
      <Intro
        preview={<Preview />}
        time={`${QUIZ_DURATION_MS / 1000} sekund`}
        task="Dotknij dwóch liczb, które razem dają 10. Znikają, a w ich miejsce wchodzą nowe"
        score="Liczą się pary, pomyłka blokuje na sekundę"
        onStart={start}
      />
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-3">
      <Stats
        items={[
          { label: "Pary", value: run.current.times.length },
          { label: "Błędy", value: run.current.errors, warn: run.current.errors > 0 },
          { label: "Seria", value: run.current.streak },
        ]}
      />
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${DZIESIATKI_SIDE}, 1fr)` }}>
        {board.map((n, i) => {
          const flashed = flash?.cells.includes(i);
          return (
            <button
              // Klucz z błysku: przycisk montuje się od nowa i animacja startuje jeszcze raz.
              key={flashed ? `${i}-${flash!.id}` : i}
              type="button"
              disabled={phase !== "play"}
              onPointerDown={() => tap(i)}
              className={`flex aspect-square touch-none select-none items-center justify-center rounded-inset border bg-surface font-mono text-3xl font-semibold tabular-nums ${
                phase !== "wrong" ? "border-line" : flashed ? "border-warning" : "border-line opacity-40"
              } ${flashed ? (flash!.ok ? "animate-[tile-hit_0.35s_ease-out]" : "animate-[tile-miss_0.35s_ease-out]") : ""}`}
              style={i === selected ? { borderColor: color, backgroundColor: `color-mix(in srgb, ${color} 25%, transparent)` } : undefined}
            >
              {n}
            </button>
          );
        })}
      </div>
      <p role="status" className={`flex h-6 items-center justify-center ${phase === "wrong" ? "font-semibold text-warning" : "text-fg-muted"}`}>
        {phase === "wrong" ? "Źle!" : "Dotknij dwóch liczb, które dają 10"}
      </p>
    </div>
  );
}
