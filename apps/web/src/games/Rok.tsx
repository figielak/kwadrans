import { type LobbyPlayer, ROK_MAX_YEAR as MAX_YEAR, ROK_MIN_YEAR as MIN_YEAR, ROK_REVEAL_MS, ROK_ROUND_MS, ROK_ROUNDS, type RokView } from "@kwadrans/games";
import { useEffect, useRef, useState } from "react";
import { Intro, RoundTable, Scores, Stats } from "../screens/ui.tsx";

interface Props {
  view: RokView;
  me: string;
  players: LobbyPlayer[];
  ranking?: string[];
  onMove: (move: { type: "result"; answers: number[] } | { type: "progress"; done: number }) => void;
}

/** Suwak startuje na środku zakresu. */
const MIDDLE = Math.floor((MIN_YEAR + MAX_YEAR) / 2);
/** Ostatnie sekundy rundy: pasek czasu w kolorze ostrzeżenia. */
const HURRY_MS = 10_000;

/** Różnica ze znakiem: „−4”, „+3”. */
const signed = (n: number) => (n < 0 ? `−${-n}` : `+${n}`);
/** Położenie roku na torze. */
const at = (year: number) => `${((year - MIN_YEAR) / (MAX_YEAR - MIN_YEAR)) * 100}%`;

/** Podgląd na ekranie instrukcji: suwak przeskakuje, rok nad nim się zmienia. */
const PREVIEW_YEARS = [1950, 1989];

function Preview() {
  return (
    <div className="flex w-3/5 flex-col gap-3">
      <div className="relative h-9">
        {PREVIEW_YEARS.map((y, i) => (
          <span
            key={y}
            className={`absolute inset-0 animate-[preview-half_3s_linear_infinite] text-center font-mono text-3xl font-semibold tabular-nums ${i ? "opacity-0 [animation-delay:-1.5s]" : ""}`}
          >
            {y}
          </span>
        ))}
      </div>
      <div className="relative h-2 rounded-full bg-line">
        {PREVIEW_YEARS.map((y, i) => (
          <span
            key={y}
            className={`absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 animate-[preview-half_3s_linear_infinite] rounded-full bg-fg ${i ? "opacity-0 [animation-delay:-1.5s]" : ""}`}
            style={{ left: at(y) }}
          />
        ))}
      </div>
    </div>
  );
}

type Phase = "intro" | "answer" | "reveal" | "sent";

export function Rok({ view, me, players, ranking, onMove }: Props) {
  const playing = view.players.includes(me) && !(me in view.results);
  const [phase, setPhase] = useState<Phase>("intro");
  const [answers, setAnswers] = useState<number[]>([]);
  const [year, setYear] = useState(MIDDLE);
  const [left, setLeft] = useState(ROK_ROUND_MS);
  // Zegar rundy nie może startować od nowa przy ruchu suwaka, więc po czasie czyta rok stąd.
  const current = useRef(year);
  current.current = year;
  const index = phase === "reveal" ? answers.length - 1 : answers.length;
  const color = players.find((p) => p.id === me)?.color;

  function submit() {
    const all = [...answers, current.current];
    setAnswers(all);
    setPhase("reveal");
    if (all.length < ROK_ROUNDS) onMove({ type: "progress", done: all.length });
  }

  function next() {
    if (answers.length === ROK_ROUNDS) {
      setPhase("sent");
      return onMove({ type: "result", answers });
    }
    setYear(MIDDLE);
    setLeft(ROK_ROUND_MS);
    setPhase("answer");
  }

  // Limit rundy: po czasie zatwierdza się to, co jest na suwaku.
  useEffect(() => {
    if (phase !== "answer") return;
    const end = Date.now() + ROK_ROUND_MS;
    const id = setInterval(() => {
      const ms = end - Date.now();
      if (ms <= 0) submit();
      else setLeft(ms);
    }, 250);
    return () => clearInterval(id);
  }, [phase, answers.length]);

  useEffect(() => {
    if (phase !== "reveal") return;
    const id = setTimeout(next, ROK_REVEAL_MS);
    return () => clearTimeout(id);
  }, [phase]);

  const over = ranking !== undefined;
  const rows = (ranking ?? view.players).map((id) => {
    const p = players.find((pl) => pl.id === id);
    return { id, nick: p?.nick ?? "Gracz", color: p?.color, me: id === me, score: id in view.results ? String(view.results[id]) : null };
  });

  if (!playing || phase === "sent") {
    // Na koniec odpowiedzi wszystkich przy każdym wydarzeniu; w trakcie tylko własne. Po limicie partii gracz nie ma odpowiedzi.
    const shown = rows.filter((r) => (over || r.me) && view.answers[r.id]?.length);
    return (
      <>
        <Scores rows={rows} />
        <p className="text-sm text-fg-muted">Suma pomyłek w latach z {ROK_ROUNDS} rund, mniej znaczy lepiej.</p>
        {shown.length > 0 && (
          <RoundTable
            heads={view.events.map((_, i) => i + 1)}
            goal={{ label: "Rok", values: view.events.map((e) => e.year) }}
            rows={shown.map((r) => ({ id: r.id, nick: r.nick, color: r.color, me: r.me, errors: view.answers[r.id].map((a, i) => Math.abs(a - view.events[i].year)) }))}
            perfect={0}
            close={Infinity}
            unit="lata"
            format={(d, i, id) => (d === 0 ? "0" : signed(view.answers[id][i] - view.events[i].year))}
            caption="Pomyłka w latach w każdej rundzie: plus to za późno, minus za wcześnie. Zielony: dokładnie."
          >
            {/* Wydarzenia pod tabelą, z numerem kolumny (wzór: lista miast w Mapie). */}
            <ol className="flex flex-col gap-1 text-xs text-fg-muted">
              {view.events.map((event, i) => (
                <li key={event.text} className="flex gap-2">
                  <span className="w-5 shrink-0 text-right font-mono tabular-nums">{i + 1}.</span>
                  <span className="flex-1">{event.text}</span>
                  <span className="font-mono text-fg tabular-nums">{event.year}</span>
                </li>
              ))}
            </ol>
          </RoundTable>
        )}
      </>
    );
  }

  if (phase === "intro") {
    return (
      <Intro
        preview={<Preview />}
        time={`${ROK_ROUNDS} rund, ${ROK_ROUND_MS / 1000} s na każdą`}
        task="Ustaw suwakiem rok wydarzenia"
        score="Liczy się suma pomyłek w latach (było 1969, ustawiasz 1975: 6 punktów), mniej znaczy lepiej"
        onStart={() => setPhase("answer")}
      />
    );
  }

  const event = view.events[index];
  const reveal = phase === "reveal";
  const diff = (answers[index] ?? 0) - event.year;

  // Kafel ma ten sam układ w obu fazach, żeby nic nie skakało: tekst, duży rok, tor, wiersz pod torem.
  return (
    <section className="flex flex-col gap-2">
      <Stats
        items={[
          { label: "Runda", value: `${index + 1}/${ROK_ROUNDS}` },
          { label: "Suma błędów", value: answers.reduce((s, a, i) => s + Math.abs(a - view.events[i].year), 0) },
        ]}
      />
      <div className={`h-1.5 overflow-hidden rounded-full bg-line ${reveal ? "invisible" : ""}`} role="progressbar" aria-label="Czas rundy" aria-valuenow={Math.ceil(left / 1000)}>
        <div
          className={`h-full rounded-full transition-[width] duration-250 ease-linear ${left <= HURRY_MS ? "bg-warning" : ""}`}
          style={{ width: `${(left / ROK_ROUND_MS) * 100}%`, backgroundColor: left > HURRY_MS ? color : undefined }}
        />
      </div>
      <div className="tile flex flex-col gap-4 p-4">
        <p className="min-h-18 text-lg leading-6">{event.text}</p>
        <p className={`text-center font-mono text-5xl font-semibold tabular-nums ${reveal && diff === 0 ? "text-success" : ""}`}>{reveal ? event.year : year}</p>
        {reveal ? (
          // Tor bez suwaka: własny rok w kolorze gracza, prawdziwy jako pierścień.
          <div className="relative h-12">
            <div className="absolute inset-x-0 top-1/2 h-9 -translate-y-1/2 rounded-inset border border-line" />
            <span className="absolute top-1/2 h-9 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ left: at(answers[index]), backgroundColor: color }} />
            <span className="absolute top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-fg" style={{ left: at(event.year) }} />
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button type="button" className="btn btn-ghost size-12 shrink-0 p-0 font-mono" aria-label="Rok wcześniej" onClick={() => setYear(Math.max(MIN_YEAR, year - 1))}>
              −1
            </button>
            <input type="range" min={MIN_YEAR} max={MAX_YEAR} value={year} onChange={(e) => setYear(Number(e.target.value))} className="swatch-range bg-bg" aria-label="Rok" />
            <button type="button" className="btn btn-ghost size-12 shrink-0 p-0 font-mono" aria-label="Rok później" onClick={() => setYear(Math.min(MAX_YEAR, year + 1))}>
              +1
            </button>
          </div>
        )}
        {reveal ? (
          <div className="flex h-12 items-center justify-between gap-3">
            <p>
              Ustawiłeś <span className="font-mono font-semibold tabular-nums">{answers[index]}</span>
            </p>
            <span className={`font-mono text-3xl font-semibold tabular-nums ${diff === 0 ? "text-success" : ""}`}>{diff === 0 ? "Idealnie" : signed(diff)}</span>
          </div>
        ) : (
          <button type="button" className="btn w-full text-bg" style={{ backgroundColor: color }} onClick={submit}>
            Zatwierdź
          </button>
        )}
      </div>
    </section>
  );
}
