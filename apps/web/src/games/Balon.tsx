import { BALON_BALLOONS, BALON_MAX_SAFE, balonScore, type BalonView, type LobbyPlayer } from "@kwadrans/games";
import { useEffect, useState } from "react";
import { Intro, RoundTable, Scores, Stats } from "../screens/ui.tsx";
import { VIBRATE } from "../vibrate.ts";

interface Props {
  view: BalonView;
  me: string;
  players: LobbyPlayer[];
  ranking?: string[];
  onMove: (move: { type: "result"; pumps: number[] } | { type: "progress"; done: number }) => void;
}

type Phase = "intro" | "play" | "pause" | "sent";

/** Tyle widać wynik balonu („+12” albo „Pękł!”), zanim pojawi się następny. */
const PAUSE_MS = 800;
/** Szerokość balonu w % kafla: pusty i po `BALON_MAX_SAFE` stuknięciach. Zależy tylko od liczby stuknięć. */
const SIZE_MIN = 20;
const SIZE_MAX = 80;

/** „1 pęknięty”, „3 pęknięte”, „7 pękniętych”. */
const poppedLabel = (n: number) => `${n} ${n === 1 ? "pęknięty" : n % 10 >= 2 && n % 10 <= 4 && (n < 12 || n > 14) ? "pęknięte" : "pękniętych"}`;

/** Podgląd na ekranie instrukcji: mały balon i większy, który miga wokół niego. */
function Preview({ color }: { color?: string }) {
  return (
    <>
      <span className="absolute top-1/2 left-1/2 aspect-square h-[70%] -translate-1/2 animate-[preview-half_3s_linear_infinite] rounded-full" style={{ backgroundColor: color }} />
      <span className="absolute top-1/2 left-1/2 aspect-square h-[35%] -translate-1/2 rounded-full" style={{ backgroundColor: color }} />
    </>
  );
}

export function Balon({ view, me, players, ranking, onMove }: Props) {
  const playing = view.players.includes(me) && !(me in view.results);
  const [phase, setPhase] = useState<Phase>("intro");
  /** Stuknięcia w zakończonych balonach; sumę liczy z nich ten sam wzór co serwer. */
  const [pumps, setPumps] = useState<number[]>([]);
  /** Stuknięcia w bieżącym balonie. */
  const [current, setCurrent] = useState(0);
  const color = players.find((p) => p.id === me)?.color;

  const total = balonScore(view.limits.slice(0, pumps.length), pumps).score;
  const last = pumps.at(-1) ?? 0;
  const lastPopped = pumps.length > 0 && last > view.limits[pumps.length - 1];

  function finish(n: number) {
    const next = [...pumps, n];
    setPumps(next);
    setCurrent(0);
    setPhase("pause");
    if (next.length < BALON_BALLOONS) onMove({ type: "progress", done: next.length });
  }

  function pump() {
    if (phase !== "play") return;
    if (current < view.limits[pumps.length]) return setCurrent(current + 1);
    navigator.vibrate?.(VIBRATE.mistake);
    finish(current + 1);
  }

  useEffect(() => {
    if (phase !== "pause") return;
    const id = setTimeout(() => {
      if (pumps.length < BALON_BALLOONS) return setPhase("play");
      setPhase("sent");
      onMove({ type: "result", pumps });
    }, PAUSE_MS);
    return () => clearTimeout(id);
  }, [phase]);

  if (!playing || phase === "sent") {
    const all = (ranking ?? view.players).map((id) => {
      const p = players.find((pl) => pl.id === id);
      const r = view.results[id];
      const taps = view.pumps[id] ?? [];
      return { id, nick: p?.nick ?? "Gracz", color: p?.color, me: id === me, taps, score: r ? (taps.length ? `${r.score} pkt (${poppedLabel(r.popped)})` : "0 pkt") : null };
    });
    const shown = all.filter((r) => r.score !== null);
    return (
      <>
        <Scores rows={all} />
        <p className="text-sm text-fg-muted">Suma zgarniętych punktów z {BALON_BALLOONS} balonów. Przy remisie wygrywa ten, komu pękło mniej.</p>
        {shown.length > 0 && (
          <RoundTable
            heads={view.limits.map((_, i) => i + 1)}
            goal={{ label: "Balon wytrzymywał", values: view.limits }}
            rows={shown.map((r) => ({ id: r.id, nick: r.nick, color: r.color, me: r.me, errors: r.taps }))}
            perfect={0}
            close={0}
            unit=""
            format={(n) => (n === 0 ? "–" : n)}
            // Stuknięcia, nie błąd: kolor mówi, czy balon pękł, nikt nie ma „najlepszego” w rundzie.
            tone={(n, i) =>
              n > view.limits[i]
                ? { className: "text-warning line-through", label: `pękł przy ${n}. stuknięciu` }
                : n === view.limits[i]
                  ? { className: "font-semibold text-success" }
                  : n === 0
                    ? { className: "text-fg-muted", label: "bez pompowania" }
                    : { className: "" }
            }
            caption="Stuknięcia w każdym balonie. Przekreślone na czerwono: balon pękł przy tym stuknięciu (0 pkt). Zielone: zgarnięty w ostatniej chwili. Kreska: zgarnięty bez pompowania."
          />
        )}
      </>
    );
  }

  if (phase === "intro") {
    return (
      <Intro
        preview={<Preview color={color} />}
        time={`${BALON_BALLOONS} balonów, bez pośpiechu`}
        task="Stukaj, żeby pompować: każde stuknięcie to punkt. Zgarnij punkty, zanim balon pęknie"
        score="Liczy się suma zgarniętych punktów, pęknięty balon daje 0"
        onStart={() => setPhase("play")}
      />
    );
  }

  // W pauzie zgarnięty balon stoi w swoim rozmiarze, a pęknięty znika.
  const shown = phase === "pause" ? (lastPopped ? null : last) : current;

  return (
    <section className="flex flex-col gap-2">
      <Stats
        items={[
          { label: "Balon", value: `${Math.min(pumps.length + 1, BALON_BALLOONS)}/${BALON_BALLOONS}` },
          { label: "W balonie", value: current },
          { label: "Suma", value: total },
        ]}
      />
      <button
        type="button"
        aria-label="Pompuj balon"
        className="tile relative mx-auto flex aspect-square w-full max-w-[calc(100dvh-25rem)] touch-none items-center justify-center overflow-hidden select-none"
        onPointerDown={pump}
      >
        {shown !== null && (
          <span
            className="aspect-[5/6] rounded-[50%] transition-[width] duration-100"
            style={{ width: `${SIZE_MIN + (Math.min(shown, BALON_MAX_SAFE) / BALON_MAX_SAFE) * (SIZE_MAX - SIZE_MIN)}%`, backgroundColor: color }}
            aria-hidden
          />
        )}
        {/* Werdykt ostatniego balonu nie zależy od fazy: przerwa trwa 0,8 s, a float-up 1,6 s i kończy niewidoczny. */}
        {pumps.length > 0 && (
          <span
            key={pumps.length}
            className={`pointer-events-none absolute inset-x-0 top-[12%] animate-[float-up_1.6s_ease-out_forwards] text-center font-mono text-4xl font-semibold tabular-nums ${
              lastPopped ? "text-warning" : "text-success"
            }`}
          >
            {lastPopped ? "Pękł!" : `+${last}`}
          </span>
        )}
      </button>
      <button type="button" className="btn btn-player" style={{ backgroundColor: color }} disabled={phase !== "play"} onClick={() => finish(current)}>
        Zgarnij {current} pkt
      </button>
      <p className="text-center text-sm text-fg-muted">Stukaj w pole, żeby pompować. Nikt nie wie, ile balon wytrzyma.</p>
    </section>
  );
}
