import { type LobbyPlayer, REFLEKS_PENALTY_MS, REFLEKS_ROUNDS, type RefleksView } from "@kwadrans/games";
import { useEffect, useRef, useState } from "react";
import * as clock from "../clock.ts";
import { Intro, ScoreTable, Stats } from "../screens/ui.tsx";
import { VIBRATE } from "../vibrate.ts";

type Move = { type: "result"; times: number[] };

interface Props {
  view: RefleksView;
  me: string;
  players: LobbyPlayer[];
  ranking?: string[];
  winner?: string;
  onMove: (move: Move) => void;
}

type Phase = "intro" | "wait" | "go" | "early" | "sent";

/** Reakcja szybsza niż 100 ms to zgadywanie: liczy się jak falstart (serwer i tak by ją odrzucił). */
const MIN_REACTION = 100;

/** Wyniki: tabela (średnia, kary, najlepszy czas) i wykres czasów kolejnych reakcji w kolorach graczy. */
function Results({ view, me, players, ranking, winner }: Omit<Props, "onMove">) {
  const rows = (ranking ?? view.players).map((id) => {
    const p = players.find((pl) => pl.id === id);
    const times = view.times[id];
    return {
      id,
      nick: p?.nick ?? "Gracz",
      color: p?.color,
      me: id === me,
      times,
      avg: times?.length ? view.results[id] : null,
      penalties: times?.filter((t) => t === REFLEKS_PENALTY_MS).length,
      best: times?.length ? Math.min(...times) : null,
    };
  });
  const all = rows.flatMap((r) => r.times ?? []);
  const lo = Math.min(...all);
  const hi = Math.max(...all);
  const longest = Math.max(...rows.map((r) => r.times?.length ?? 0));
  const W = 300;
  const H = 100;
  const x = (i: number) => (i / (longest - 1)) * W;
  const y = (t: number) => (hi === lo ? H / 2 : H - ((t - lo) / (hi - lo)) * H);

  // Remis (ta sama średnia) to to samo miejsce, jak w quizach.
  const places: number[] = [];
  rows.forEach((r, i) => places.push(i > 0 && rows[i - 1].avg === r.avg ? places[i - 1] : i + 1));

  return (
    <ScoreTable
      heads={["Średnio", "Kary", "Najlepszy"]}
      winner={winner}
      ranked={!!ranking}
      rows={rows.map((r, i) => ({
        ...r,
        place: places[i],
        cells: !r.times ? null : r.avg === null ? [{ value: "limit czasu", span: 3, muted: true }] : [{ value: `${r.avg} ms` }, { value: r.penalties }, { value: `${r.best} ms` }],
      }))}
    >
      {longest > 1 && (
        <figure className="flex flex-col gap-1">
          <figcaption className="label">Czasy kolejnych reakcji</figcaption>
          <div className="flex gap-2">
            <div className="flex flex-col justify-between text-right text-xs text-fg-muted tabular-nums">
              <span>{hi} ms</span>
              <span>{lo} ms</span>
            </div>
            <svg viewBox={`0 -4 ${W} ${H + 8}`} preserveAspectRatio="none" className="h-28 flex-1 border-l border-line" aria-hidden>
              {rows.map((r) => (
                <polyline
                  key={r.id}
                  points={(r.times ?? []).map((t, i) => `${x(i)},${y(t)}`).join(" ")}
                  fill="none"
                  stroke={r.color ?? "currentColor"}
                  strokeWidth={r.id === me ? 2.5 : 1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </svg>
          </div>
        </figure>
      )}
    </ScoreTable>
  );
}

/** Podgląd na ekranie instrukcji: pole co chwilę zmienia kolor. */
function Preview() {
  return (
    <>
      <span className="font-semibold text-fg-muted">Czekaj…</span>
      <span className="absolute inset-0 flex animate-[preview-quarter_2.4s_linear_infinite] items-center justify-center bg-success font-semibold text-bg opacity-0 [animation-delay:-1.2s]">
        Teraz!
      </span>
    </>
  );
}

export function Refleks({ view, me, players, ranking, winner, onMove }: Props) {
  const playing = view.players.includes(me) && !(me in view.results);
  const [phase, setPhase] = useState<Phase>("intro");
  const [last, setLast] = useState<number | null>(null);
  const run = useRef({ goAt: 0, times: [] as number[], timer: 0 });

  /** Zapisuje czas rundy i daje następną albo oddaje wynik po ostatniej. */
  function next(time: number) {
    const r = run.current;
    r.times.push(time);
    setLast(time);
    if (r.times.length < REFLEKS_ROUNDS) return wait();
    setPhase("sent");
    onMove({ type: "result", times: r.times });
  }

  function wait() {
    const r = run.current;
    setPhase("wait");
    r.timer = window.setTimeout(() => {
      r.goAt = performance.now();
      clock.stimulus("refleks");
      setPhase("go");
      // Bez dotknięcia runda sama kończy się karą.
      r.timer = window.setTimeout(() => next(REFLEKS_PENALTY_MS), REFLEKS_PENALTY_MS);
    }, view.delays[r.times.length]);
  }

  function start() {
    run.current = { goAt: 0, times: [], timer: 0 };
    setLast(null);
    wait();
  }

  function tap() {
    const r = run.current;
    const reaction = Math.round(performance.now() - r.goAt);
    if (phase === "go" && reaction >= MIN_REACTION) {
      clearTimeout(r.timer);
      next(Math.min(reaction, REFLEKS_PENALTY_MS));
    } else if (phase === "wait" || phase === "go") {
      clearTimeout(r.timer);
      navigator.vibrate?.(VIBRATE.mistake);
      setPhase("early");
      r.timer = window.setTimeout(() => next(REFLEKS_PENALTY_MS), 800);
    }
  }

  useEffect(() => () => clearTimeout(run.current.timer), []);

  if (!playing || phase === "sent") return <Results view={view} me={me} players={players} ranking={ranking} winner={winner} />;

  if (phase === "intro") {
    return (
      <Intro
        preview={<Preview />}
        time={`${REFLEKS_ROUNDS} zmian koloru`}
        task="Dotknij pola, gdy zmieni kolor"
        score="Liczy się średni czas reakcji; falstart albo reakcja ponad 1 s to 1000 ms"
        onStart={start}
      />
    );
  }

  const { times } = run.current;
  const penalties = times.filter((t) => t === REFLEKS_PENALTY_MS).length;
  return (
    <div className="flex flex-1 flex-col gap-3">
      <Stats
        items={[
          { label: "Runda", value: `${Math.min(times.length + 1, REFLEKS_ROUNDS)}/${REFLEKS_ROUNDS}` },
          { label: "Kary", value: penalties, warn: penalties > 0 },
          { label: "Średnia", value: times.length ? `${Math.round(times.reduce((a, b) => a + b, 0) / times.length)} ms` : "…" },
        ]}
      />
      <button
        // Klucz z falstartu: przycisk montuje się od nowa i animacja błędu startuje jeszcze raz (jak w Stój!).
        key={phase === "early" ? `early-${times.length}` : "field"}
        type="button"
        onPointerDown={(e) => {
          clock.input("refleks", e);
          tap();
        }}
        className={`flex min-h-80 flex-1 touch-none select-none items-center justify-center rounded-tile border border-line text-2xl font-semibold ${
          phase === "go" ? "bg-success text-bg" : phase === "early" ? "animate-[tile-miss_0.35s_ease-out] bg-surface text-warning" : "bg-surface text-fg-muted"
        }`}
      >
        {phase === "go" ? "Teraz!" : phase === "early" ? "Falstart!" : last === null ? "Czekaj…" : last === REFLEKS_PENALTY_MS ? "Za wolno!" : `${last} ms`}
      </button>
    </div>
  );
}
