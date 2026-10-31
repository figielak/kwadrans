import { HandTap } from "@phosphor-icons/react";
import { type LobbyPlayer, PRZYTRZYMAJ_ROUNDS, przytrzymajDeviation, type PrzytrzymajView } from "@kwadrans/games";
import { type PointerEvent, useEffect, useRef, useState } from "react";
import { Intro, RoundTable, Stats } from "../screens/ui.tsx";

interface Props {
  view: PrzytrzymajView;
  me: string;
  players: LobbyPlayer[];
  ranking?: string[];
  onMove: (move: { type: "result"; holds: number[] }) => void;
}

type Phase = "intro" | "show" | "hold" | "reveal" | "sent";

/** Przerwa przed zapaleniem pola w każdej rundzie. */
const LEAD_MS = 1000;
/** Tyle widać czas trzymania i odchyłkę po puszczeniu. */
const REVEAL_MS = 1500;
/** Progi odchyłki w ms: do PERFECT na zielono, powyżej CLOSE kolor ostrzeżenia (jak w Stoperze). */
const PERFECT = 100;
const CLOSE = 500;

const seconds = (ms: number) => (ms / 1000).toFixed(2).replace(".", ",");
const grade = (off: number) => (off <= PERFECT ? "text-success" : off <= CLOSE ? "" : "text-warning");

/** Podgląd na ekranie instrukcji: pole świeci, potem palec trzyma tak samo długo. */
function Preview() {
  return (
    <>
      <span className="absolute size-20 animate-[preview-half_3s_linear_infinite] rounded-tile bg-fg" />
      <span
        className="absolute flex size-20 animate-[preview-half_3s_linear_infinite] items-center justify-center rounded-tile border border-line bg-surface opacity-0"
        style={{ animationDelay: "-1.5s" }}
      >
        <HandTap size={36} />
      </span>
    </>
  );
}

export function Przytrzymaj({ view, me, players, ranking, onMove }: Props) {
  const playing = view.players.includes(me) && !(me in view.results);
  const color = players.find((p) => p.id === me)?.color;
  const [phase, setPhase] = useState<Phase>("intro");
  const [lit, setLit] = useState(false);
  const [holding, setHolding] = useState(false);
  const [holds, setHolds] = useState<number[]>([]);
  const run = useRef({ holds: [] as number[], timers: [] as number[], giveUp: 0, down: 0, pointer: null as number | null });

  function round() {
    const r = run.current;
    const target = view.targets[r.holds.length];
    const begin = performance.now();
    // Terminy liczone od startu rundy, nie od poprzedniego timera: spóźniony setTimeout nie wydłuża świecenia.
    // ponytail: pole gaśnie z dokładnością do klatki (ok. 16 ms), wszyscy mają tak samo.
    const after = (ms: number, fn: () => void) => r.timers.push(window.setTimeout(fn, begin + ms - performance.now()));
    setPhase("show");
    after(LEAD_MS, () => setLit(true));
    after(LEAD_MS + target, () => {
      setLit(false);
      setPhase("hold");
    });
  }

  function finish(hold: number) {
    const r = run.current;
    clearTimeout(r.giveUp);
    r.pointer = null;
    r.holds.push(hold);
    setHolds([...r.holds]);
    setHolding(false);
    setPhase("reveal");
    r.timers.push(
      window.setTimeout(() => {
        if (r.holds.length < PRZYTRZYMAJ_ROUNDS) return round();
        setPhase("sent");
        onMove({ type: "result", holds: r.holds });
      }, REVEAL_MS),
    );
  }

  function press(e: PointerEvent<HTMLButtonElement>) {
    const r = run.current;
    if (phase !== "hold" || r.pointer !== null) return;
    // Palec może zjechać poza pole: pomiar trwa do puszczenia.
    e.currentTarget.setPointerCapture(e.pointerId);
    r.pointer = e.pointerId;
    // Czas zdarzenia, nie obsługi: zajęty wątek nie dolicza opóźnienia.
    r.down = e.timeStamp;
    setHolding(true);
    // Dalej odchyłka i tak jest ucięta do celu, więc trzymanie kończy się samo.
    const limit = 2 * view.targets[r.holds.length];
    r.giveUp = window.setTimeout(() => finish(limit), limit);
  }

  function release(e: PointerEvent) {
    const r = run.current;
    if (e.pointerId !== r.pointer) return;
    finish(Math.min(2 * view.targets[r.holds.length], Math.max(0, Math.round(e.timeStamp - r.down))));
  }

  useEffect(
    () => () => {
      const r = run.current;
      r.timers.forEach(clearTimeout);
      clearTimeout(r.giveUp);
    },
    [],
  );

  if (!playing || phase === "sent") {
    const over = ranking !== undefined;
    const rows = (ranking ?? view.players).map((id) => {
      const p = players.find((pl) => pl.id === id);
      return { id, nick: p?.nick ?? "Gracz", color: p?.color, me: id === me, score: id in view.results ? `${view.results[id]} ms` : null };
    });
    // Jedna tabela zamiast osobnej listy wyników: suma w wierszu gracza, pod nią rundy (na koniec wszystkich, w trakcie tylko własne).
    const shown = rows.map((r) => ({ ...r, holds: (over || r.me ? view.holds[r.id] : undefined) ?? [] }));
    const played = shown.filter((r) => r.holds.length);
    const off = (r: { holds: number[] }, i: number) => przytrzymajDeviation(view.targets[i], r.holds[i]);
    const holdsOf = (id: string) => shown.find((r) => r.id === id)!.holds;
    // Wszystko w sekundach, żeby cel i błąd dało się porównać wprost. Cel widać dopiero, gdy ktoś ma rundy.
    return (
      <RoundTable
        heads={view.targets.map((_, i) => i + 1)}
        goal={played.length > 0 ? { label: "Cel", values: view.targets.map(seconds) } : undefined}
        rows={shown.map((r) => ({ id: r.id, nick: r.nick, color: r.color, me: r.me, score: r.score, errors: r.holds.map((_, i) => off(r, i)) }))}
        perfect={PERFECT}
        close={CLOSE}
        unit="s"
        // Znak mówi, czy za krótko, czy za długo; liczba to odchyłka po ucięciu do celu.
        format={(d, i, id) => `${holdsOf(id)[i] < view.targets[i] ? "−" : "+"}${seconds(d)}`}
        caption={
          <>
            Wynik to suma błędów z {PRZYTRZYMAJ_ROUNDS} rund, mniej znaczy lepiej.
            {played.length > 0 && " Czasy w sekundach, minus znaczy za krótko."}
            {played.length > 1 && " Tło w kolorze gracza: najlepszy w rundzie."}
          </>
        }
      />
    );
  }

  if (phase === "intro") {
    return (
      <Intro
        preview={<Preview />}
        time={`${PRZYTRZYMAJ_ROUNDS} rund, pole świeci się od 1 do 5 sekund`}
        task="Przytrzymaj palec tak długo, jak świeciło pole"
        score="Liczy się suma odchyłek, mniej znaczy lepiej"
        onStart={round}
      />
    );
  }

  const reveal = phase === "reveal";
  // W odsłonie runda jest już na liście, więc pokazujemy ostatnią.
  const index = holds.length - (reveal ? 1 : 0);
  const target = view.targets[index];
  const diff = reveal ? holds[index] - target : 0;
  return (
    <div className="flex flex-1 flex-col gap-3">
      <Stats
        items={[
          { label: "Runda", value: `${index + 1}/${PRZYTRZYMAJ_ROUNDS}` },
          { label: "Suma odchyłek", value: `${holds.reduce((sum, h, i) => sum + przytrzymajDeviation(view.targets[i], h), 0)} ms` },
        ]}
      />
      {/* Bez przejść kolorów i bez licznika: długość świecenia i trzymania ma być widać tylko „na oko”. */}
      <button
        type="button"
        onPointerDown={press}
        onPointerUp={release}
        onPointerCancel={release}
        // Długie przytrzymanie na telefonie otwiera menu kontekstowe.
        onContextMenu={(e) => e.preventDefault()}
        className={`flex min-h-80 flex-1 touch-none select-none flex-col items-center justify-center gap-1 rounded-tile border border-line text-2xl font-semibold [-webkit-touch-callout:none] ${
          holding ? "text-bg" : lit ? "bg-fg text-bg" : "bg-surface text-fg-muted"
        }`}
        style={{ backgroundColor: holding ? color : undefined }}
      >
        {reveal ? (
          <>
            <span className="label">Twój czas</span>
            <span className="text-7xl text-fg tabular-nums">{seconds(holds[index])}</span>
            <span className="text-lg tabular-nums">cel {seconds(target)} s</span>
            <span className={`tabular-nums ${grade(Math.abs(diff)) || "text-fg"}`}>
              {diff < 0 ? "−" : "+"}
              {seconds(Math.abs(diff))} s
            </span>
          </>
        ) : holding ? (
          "Trzymaj"
        ) : phase === "hold" ? (
          "Przytrzymaj tak samo długo"
        ) : lit ? (
          "Zapamiętaj czas"
        ) : (
          "Patrz"
        )}
      </button>
    </div>
  );
}
