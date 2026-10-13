import { type LobbyPlayer, SUDOKU_BLANKS, SUDOKU_PENALTY_MS, type SudokuView, sudokuTotal } from "@kwadrans/games";
import { useEffect, useRef, useState } from "react";
import { Intro, Scores, Stats } from "../screens/ui.tsx";

interface Props {
  view: SudokuView;
  me: string;
  players: LobbyPlayer[];
  ranking?: string[];
  onMove: (move: { type: "result"; ms: number; mistakes: number } | { type: "progress"; filled: number }) => void;
}

const seconds = (ms: number) => (ms / 1000).toFixed(1).replace(".", ",");

/** Podgląd na ekranie instrukcji: trzy puste pola wypełniają się po kolei. */
function Preview() {
  const cells = [1, 0, 3, 4, 0, 4, 1, 2, 2, 1, 4, 0, 4, 3, 2, 1];
  const filled = [4, 11, 1];
  return (
    <div className="grid grid-cols-4 gap-1">
      {cells.map((n, i) => {
        const blank = n === 0 || i === 2;
        const order = filled.indexOf(i);
        return (
          <span
            key={i}
            className={`relative flex size-6 items-center justify-center rounded-inset border border-line bg-surface font-mono text-xs font-semibold ${i % 4 === 1 ? "mr-1" : ""} ${Math.floor(i / 4) === 1 ? "mb-1" : ""}`}
          >
            {!blank && n}
            {order >= 0 && (
              <span
                className="absolute -inset-px flex animate-[preview-quarter_2.4s_linear_infinite] items-center justify-center rounded-inset bg-success text-bg opacity-0"
                style={{ animationDelay: `${order * 0.6 - 2.4}s` }}
              >
                {[2, 3, 2][order]}
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
}

type Phase = "intro" | "run" | "sent";

export function Sudoku({ view, me, players, ranking, onMove }: Props) {
  const playing = view.players.includes(me) && !(me in view.results);
  const color = players.find((p) => p.id === me)?.color;
  const [phase, setPhase] = useState<Phase>("intro");
  const [cells, setCells] = useState(view.puzzle);
  const [selected, setSelected] = useState<number | null>(null);
  const [mistakes, setMistakes] = useState(0);
  // Ostatnio wpisana cyfra; `id` rośnie, żeby błysk ruszył od nowa także przy tym samym polu.
  const [flash, setFlash] = useState<{ i: number; ok: boolean; id: number } | null>(null);
  const [now, setNow] = useState(0);
  const start = useRef(0);

  useEffect(() => {
    if (phase !== "run") return;
    const id = setInterval(() => setNow(performance.now()), 100);
    return () => clearInterval(id);
  }, [phase]);

  const left = cells.filter((v) => v === 0).length;

  function pick(i: number) {
    if (cells[i] === 0) setSelected(i);
  }

  function enter(digit: number) {
    if (selected === null || cells[selected] !== 0) return;
    const ok = digit === view.solution[selected];
    setFlash((f) => ({ i: selected, ok, id: (f?.id ?? 0) + 1 }));
    if (!ok) {
      setMistakes((m) => m + 1);
      navigator.vibrate?.(60);
      return;
    }
    setCells(cells.map((v, i) => (i === selected ? digit : v)));
    setSelected(null);
    if (left > 1) return onMove({ type: "progress", filled: SUDOKU_BLANKS - left + 1 });
    setPhase("sent");
    onMove({ type: "result", ms: Math.round(performance.now() - start.current), mistakes });
  }

  const rows = (ranking ?? view.players).map((id) => {
    const p = players.find((pl) => pl.id === id);
    const res = view.results[id];
    return {
      id,
      nick: p?.nick ?? "Gracz",
      color: p?.color,
      me: id === me,
      score: res ? `${seconds(sudokuTotal(res))} s${res.mistakes ? ` (+${(res.mistakes * SUDOKU_PENALTY_MS) / 1000} s kary)` : ""}` : null,
    };
  });

  if (!playing || phase === "sent") {
    // Przewaga zwycięzcy nad drugim miejscem; przy remisie i w grze solo nie ma czego pokazywać.
    const [first, second] = (ranking ?? []).map((id) => sudokuTotal(view.results[id]));
    const lead = second - first;
    return (
      <>
        <Scores rows={rows} />
        {lead > 0 && (
          <section className="tile p-4">
            <p className="text-lg font-semibold" style={{ color: rows[0].color }}>
              {rows[0].me ? "Wygrywasz" : `${rows[0].nick} wygrywa`} o {(lead / 1000).toFixed(lead < 100 ? 2 : 1).replace(".", ",")} s
            </p>
          </section>
        )}
      </>
    );
  }

  if (phase === "intro") {
    return (
      <Intro
        preview={<Preview />}
        time="Stoper rusza po Starcie"
        task="Uzupełnij planszę 4×4: w każdym wierszu, kolumnie i bloku 2×2 cyfry 1-4"
        score={`Wygrywa najkrótszy czas, każda zła cyfra to +${SUDOKU_PENALTY_MS / 1000} s`}
        onStart={() => {
          start.current = performance.now();
          setNow(start.current);
          setPhase("run");
        }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <Stats
        items={[
          { label: "Zostało", value: left },
          { label: "Kara", value: `+${(mistakes * SUDOKU_PENALTY_MS) / 1000} s`, warn: mistakes > 0 },
          { label: "Twój czas", value: `${seconds(now - start.current)} s` },
        ]}
      />
      <div className="mx-auto grid w-64 grid-cols-2 gap-2">
        {[0, 1, 2, 3].map((b) => (
          <div key={b} className="grid grid-cols-2 gap-1">
            {[0, 1, 2, 3].map((k) => {
              const i = (Math.floor(b / 2) * 2 + Math.floor(k / 2)) * 4 + (b % 2) * 2 + (k % 2);
              const n = cells[i];
              const hit = flash?.i === i;
              return (
                <button
                  // Klucz z błysku: pole montuje się od nowa i animacja startuje jeszcze raz.
                  key={hit ? `${i}-${flash.id}` : i}
                  type="button"
                  disabled={view.puzzle[i] !== 0 || n !== 0}
                  onPointerDown={() => pick(i)}
                  style={selected === i ? { borderColor: color, boxShadow: `0 0 0 2px ${color}` } : undefined}
                  className={`aspect-square touch-none select-none rounded-inset border border-line font-mono text-3xl font-semibold ${view.puzzle[i] !== 0 ? "bg-bg text-fg-muted" : "bg-surface"} ${hit ? (flash.ok ? "animate-[tile-hit_0.35s_ease-out]" : "animate-[tile-miss_0.35s_ease-out]") : ""}`}
                >
                  {n || ""}
                </button>
              );
            })}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-4 gap-2">
        {[1, 2, 3, 4].map((d) => (
          <button
            key={d}
            type="button"
            onPointerDown={() => enter(d)}
            className="h-14 touch-none select-none rounded-inset border border-line bg-surface font-mono text-2xl font-semibold"
          >
            {d}
          </button>
        ))}
      </div>
    </div>
  );
}
