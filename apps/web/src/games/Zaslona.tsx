import { type LobbyPlayer, ZASLONA_ROUNDS, zaslonaDeviation, type ZaslonaView } from "@kwadrans/games";
import { type PointerEvent, useEffect, useRef, useState } from "react";
import { grade, Intro, RoundTable, Scores, Stats } from "../screens/ui.tsx";

interface Props {
  view: ZaslonaView;
  me: string;
  players: LobbyPlayer[];
  ranking?: string[];
  onMove: (move: { type: "result"; taps: number[] }) => void;
}

type Phase = "intro" | "lead" | "run" | "reveal" | "sent";

/** Przerwa przed ruszeniem kulki w każdej rundzie. */
const LEAD_MS = 1000;
/** Tyle widać, gdzie kulka naprawdę była, i odchyłkę. */
const REVEAL_MS = 1500;
/** Progi odchyłki w ms: do PERFECT na zielono, powyżej CLOSE kolor ostrzeżenia (jak w Stoperze). */
const PERFECT = 100;
const CLOSE = 500;
/** Meta leży na tym ułamku toru, za nią zostaje kawałek pola na przestrzelenie. */
const GOAL = 0.85;

const seconds = (ms: number) => (ms / 1000).toFixed(2).replace(".", ",");

/** Podgląd na ekranie instrukcji: kulka jedzie ku zasłonie, potem zostaje sama zasłona z metą. */
function Preview({ color }: { color?: string }) {
  return (
    <div className="relative h-12 w-44 overflow-hidden rounded-inset border border-line bg-surface">
      <span className="absolute top-1/2 right-[20%] left-[15%] h-px bg-line" />
      <span className="absolute inset-y-0 right-[20%] left-[45%] border border-r-2 border-line border-r-fg bg-fg/5" />
      <span
        className="absolute top-1/2 left-[15%] size-5 -translate-y-1/2 animate-[preview-half_3s_linear_infinite] rounded-full"
        style={{ backgroundColor: color }}
      />
      <span className="absolute inset-y-0 left-[45%] flex w-[35%] animate-[preview-half_3s_linear_infinite] items-center justify-center font-mono text-fg-muted opacity-0 [animation-delay:-1.5s]">
        ?
      </span>
    </div>
  );
}

export function Zaslona({ view, me, players, ranking, onMove }: Props) {
  const playing = view.players.includes(me) && !(me in view.results);
  const color = players.find((p) => p.id === me)?.color;
  const [phase, setPhase] = useState<Phase>("intro");
  const [taps, setTaps] = useState<number[]>([]);
  const ball = useRef<HTMLSpanElement>(null);
  const run = useRef({ taps: [] as number[], timers: [] as number[], start: 0 });

  const index = Math.min(taps.length - (phase === "reveal" ? 1 : 0), ZASLONA_ROUNDS - 1);
  const round = view.rounds[Math.max(0, index)];
  const total = round.visible + round.hidden;
  /** Pozycja kulki w ułamku pola po `t` ms od ruszenia. */
  const at = (t: number) => Math.min(1, (GOAL * t) / total);
  const maskLeft = at(round.visible);

  function lead() {
    setPhase("lead");
    run.current.timers.push(window.setTimeout(() => setPhase("run"), LEAD_MS));
  }

  function finish(tap: number) {
    const r = run.current;
    r.taps.push(tap);
    setTaps([...r.taps]);
    setPhase("reveal");
    r.timers.push(
      window.setTimeout(() => {
        if (r.taps.length < ZASLONA_ROUNDS) return lead();
        setPhase("sent");
        onMove({ type: "result", taps: r.taps });
      }, REVEAL_MS),
    );
  }

  // Kulka jedzie z `performance.now()`, nie z przejścia CSS: reguła prefers-reduced-motion zeruje przejścia, a pomiar nie może zależeć od animacji.
  useEffect(() => {
    if (phase !== "run") return;
    const r = run.current;
    r.start = performance.now();
    const limit = round.visible + 2 * round.hidden;
    let id = requestAnimationFrame(function frame(now) {
      const t = now - r.start;
      if (t >= limit) return finish(2 * round.hidden);
      if (ball.current) ball.current.style.left = `${at(t) * 100}%`;
      id = requestAnimationFrame(frame);
    });
    return () => cancelAnimationFrame(id);
  }, [phase, index]);

  useEffect(() => () => run.current.timers.forEach(clearTimeout), []);

  function press(e: PointerEvent) {
    const r = run.current;
    if (phase !== "run") return;
    // Czas zdarzenia, nie obsługi; dotknięcie, gdy kulkę jeszcze widać, nic nie robi.
    const tap = e.timeStamp - r.start - round.visible;
    if (tap < 0) return;
    finish(Math.min(2 * round.hidden, Math.round(tap)));
  }

  if (!playing || phase === "sent") {
    const over = ranking !== undefined;
    const rows = (ranking ?? view.players).map((id) => {
      const p = players.find((pl) => pl.id === id);
      return { id, nick: p?.nick ?? "Gracz", color: p?.color, me: id === me, score: id in view.results ? `${view.results[id]} ms` : null };
    });
    // Na koniec rundy wszystkich w jednej tabeli; w trakcie tylko własne.
    const shown = rows
      .filter((r) => (over || r.me) && view.taps[r.id])
      .map((r) => ({ ...r, errors: view.taps[r.id].map((t, i) => zaslonaDeviation(view.rounds[i].hidden, t)) }));
    return (
      <>
        <Scores rows={rows} />
        <p className="text-sm text-fg-muted">Suma odchyłek z {ZASLONA_ROUNDS} rund, mniej znaczy lepiej.</p>
        {shown.length > 0 && (
          <RoundTable
            heads={view.rounds.map((_, i) => i + 1)}
            rows={shown}
            perfect={PERFECT}
            close={CLOSE}
            unit="s od mety"
            format={seconds}
            legend={`Zielony: do ${seconds(PERFECT)} s, czerwony: ponad ${seconds(CLOSE)} s.`}
          />
        )}
      </>
    );
  }

  if (phase === "intro") {
    return (
      <Intro
        preview={<Preview color={color} />}
        time={`${ZASLONA_ROUNDS} rund, kulka toczy się od 1 do 6 sekund`}
        task="Kulka znika za zasłoną. Dotknij ekranu w chwili, gdy dotrze do mety"
        score="Liczy się suma odchyłek, mniej znaczy lepiej"
        onStart={lead}
      />
    );
  }

  const reveal = phase === "reveal";
  const tap = reveal ? taps[index] : 0;
  const diff = tap - round.hidden;
  // Poniżej 5 ms odchyłka wychodzi jako 0,00 s: wtedy bez znaku i bez „za wcześnie”.
  const exact = seconds(Math.abs(diff)) === "0,00";
  const sum = taps.reduce((s, t, i) => s + zaslonaDeviation(view.rounds[i].hidden, t), 0);
  // W odsłonie kulka stoi tam, gdzie była w chwili dotknięcia.
  const ballLeft = reveal ? at(round.visible + tap) : 0;
  return (
    <div className="flex flex-1 flex-col gap-3">
      <Stats
        items={[
          { label: "Runda", value: `${index + 1}/${ZASLONA_ROUNDS}` },
          { label: "Suma odchyłek", value: `${seconds(sum)} s` },
        ]}
      />
      {/* Bez przejść i bez licznika: czas ma być widać tylko „na oko”. */}
      <button
        type="button"
        onPointerDown={press}
        onContextMenu={(e) => e.preventDefault()}
        aria-label="Dotknij, gdy kulka dojedzie do mety"
        className="tile relative flex min-h-48 flex-1 touch-none select-none flex-col items-center justify-center gap-1 overflow-hidden text-2xl font-semibold [-webkit-touch-callout:none]"
      >
        <span className="relative h-24 w-[calc(100%-3rem)]">
          {/* Tor od startu do mety: punkt odniesienia dla prędkości. */}
          <span className="absolute top-1/2 left-0 h-px bg-line" style={{ width: `${GOAL * 100}%` }} />
          {/* Zasłona jaśniejsza od pola i z obrysem, żeby była warstwą nad torem, nie dziurą; w odsłonie zostaje sam przerywany obrys. */}
          <span
            className={`absolute inset-y-0 border border-r-2 border-line border-r-fg ${reveal ? "border-dashed" : "bg-fg/5"}`}
            style={{ left: `${maskLeft * 100}%`, width: `${(GOAL - maskLeft) * 100}%` }}
          />
          {/* Kulka jest ucinana na brzegu zasłony, więc chowa się pod nią stopniowo (w chwili `visible` w połowie); w odsłonie widać ją całą. */}
          <span
            className="absolute inset-0"
            style={{ clipPath: reveal ? undefined : `polygon(-100% -100%, ${maskLeft * 100}% -100%, ${maskLeft * 100}% 200%, -100% 200%)` }}
          >
            <span
              ref={ball}
              className="absolute top-1/2 size-8 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{ left: `${ballLeft * 100}%`, backgroundColor: color }}
            />
          </span>
        </span>
        {reveal ? (
          <>
            {/* Najważniejsza jest odchyłka; czas dotknięcia i meta to tylko kontekst. */}
            <span className={`font-mono text-5xl tabular-nums ${grade(Math.abs(diff), PERFECT, CLOSE).text}`}>
              {exact ? "" : diff < 0 ? "−" : "+"}
              {seconds(Math.abs(diff))} s
            </span>
            <span className="text-base font-normal text-fg-muted">{exact ? "idealnie" : diff < 0 ? "za wcześnie" : "za późno"}</span>
            <span className="font-mono text-sm font-normal text-fg-muted tabular-nums">
              {seconds(tap)} s · meta {seconds(round.hidden)} s
            </span>
          </>
        ) : (
          // Podpowiedź tylko w pierwszej rundzie, potem tor zostaje sam.
          index === 0 && <span className="text-sm font-normal text-fg-muted">Kulka na mecie? Dotknij gdziekolwiek</span>
        )}
      </button>
    </div>
  );
}
