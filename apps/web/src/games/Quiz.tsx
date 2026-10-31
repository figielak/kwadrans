import { type LobbyPlayer, QUIZ_DURATION_MS, QUIZ_BLOCK_MS, type QuizMove } from "@kwadrans/games";
import { type ReactNode, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Intro, ScoreTable, Stats } from "../screens/ui.tsx";
import { VIBRATE } from "../vibrate.ts";

/** Wspólny przebieg Koloru liter, Liczenia, Innego elementu, Obrotu i Literówki: 30 s pytań z odpowiedziami do wyboru, pomyłka blokuje na chwilę. */
interface Props {
  view: { players: string[]; results: Record<string, { times: number[]; errors: number }> };
  me: string;
  players: LobbyPlayer[];
  ranking?: string[];
  winner?: string;
  /** Ekran instrukcji: co zrobić i podgląd; czas i punktacja są wspólne. */
  task: string;
  preview: ReactNode;
  /**
   * Pytanie i cztery odpowiedzi dla pytania nr i; correct to indeks dobrej.
   * Z `cols` (Inny element) nie ma kafla z pytaniem, a odpowiedzi to siatka o tylu kolumnach z linią `status` pod spodem.
   */
  question: (i: number) => { prompt?: ReactNode; options: ReactNode[]; correct: number; cols?: number; status?: ReactNode };
  /** Po pomyłce wraca to samo pytanie zamiast następnego; czas trafienia liczy się od pierwszego pokazania. */
  retry?: boolean;
  /** Gra, w której błędy odejmują punkty (Obrót, Literówka): wynik zamiast trafień w pasku i w tabeli, z własną notką i opisem punktacji. */
  points?: (res: { times: number[]; errors: number }) => number;
  note?: string;
  score?: string;
  onMove: (move: QuizMove) => void;
  /** Start rundy (ile ms potrwa) i jej koniec (null): nagłówek pokazuje wtedy czas rundy zamiast limitu platformy. */
  onRound?: (msLeft: number | null) => void;
}

/** Bez kary losowe klepanie byłoby szybsze niż myślenie. */
export const BLOCK_MS = QUIZ_BLOCK_MS;

type Phase = "intro" | "play" | "wrong" | "sent";

/** Od sekundy w górę w sekundach („1,29 s”), poniżej w milisekundach. */
const duration = (ms: number) => (ms >= 1000 ? `${(ms / 1000).toFixed(2).replace(".", ",")} s` : `${ms} ms`);

/**
 * Wyniki: miejsce, trafienia, średni czas i błędy w kolumnach, pod spodem jak liczony jest ranking.
 * Gra, w której błędy odejmują punkty (Stój!), podaje `points`: kolumna „Punkty” zastępuje trafienia
 * (czwarta kolumna liczb nie mieści się na 360 px) i po niej idą miejsca; do tego własna notka.
 */
export function Results({
  view,
  me,
  players,
  ranking,
  winner,
  points,
  label = "Trafienia",
  note = "Wygrywa najwięcej trafień, przy remisie niższy średni czas. Błędy nie odejmują trafień, każdy kosztował sekundę blokady.",
}: Pick<Props, "view" | "me" | "players" | "ranking" | "winner"> & { points?: (res: Props["view"]["results"][string]) => number; label?: string; note?: string }) {
  const rows = (ranking ?? view.players).map((id) => {
    const p = players.find((pl) => pl.id === id);
    const res = view.results[id];
    return {
      id,
      nick: p?.nick ?? "Gracz",
      color: p?.color,
      res,
      avg: res?.times.length ? Math.round(res.times.reduce((a, b) => a + b, 0) / res.times.length) : null,
    };
  });
  // Remis (te same trafienia albo punkty i średnia) to to samo miejsce.
  const main = (r: (typeof rows)[number]) => r.res && (points ? points(r.res) : r.res.times.length);
  const places: number[] = [];
  rows.forEach((r, i) => {
    const prev = rows[i - 1];
    places.push(prev && main(prev) === main(r) && prev.avg === r.avg ? places[i - 1] : i + 1);
  });

  return (
    <ScoreTable
      heads={[points ? "Punkty" : label, "Śr. czas", "Błędy"]}
      winner={winner}
      ranked={!!ranking}
      rows={rows.map((r, i) => ({
        id: r.id,
        nick: r.nick,
        color: r.color,
        me: r.id === me,
        place: places[i],
        cells: !r.res
          ? null
          : [
              ...(r.avg === null ? [{ value: "brak trafień", span: 2, muted: true }] : [{ value: main(r) }, { value: duration(r.avg) }]),
              { value: r.res.errors, warn: r.res.errors > 0 },
            ],
      }))}
      note={note}
    />
  );
}

/** Podgląd na ekranie instrukcji: pytanie i odpowiedzi, dobra co chwilę się zaznacza. */
export function QuizPreview({ prompt, options, correct }: { prompt: ReactNode; options: ReactNode[]; correct: number }) {
  return (
    <div className="flex flex-col items-center gap-3">
      {prompt}
      <div className="flex gap-2">
        {options.map((option, i) => (
          <span key={i} className="relative rounded-inset border border-line bg-surface px-2 py-1 text-sm font-semibold">
            {option}
            {i === correct && (
              <span className="absolute -inset-px animate-[preview-half_2.4s_linear_infinite] rounded-inset border-2 border-success opacity-0 [animation-delay:-1.2s]" />
            )}
          </span>
        ))}
      </div>
    </div>
  );
}

export function Quiz({ view, me, players, ranking, winner, task, preview, question, retry, points, note, score = "Liczą się trafienia, pomyłka blokuje na sekundę", onMove, onRound }: Props) {
  const playing = view.players.includes(me) && !(me in view.results);
  const [phase, setPhase] = useState<Phase>("intro");
  const [index, setIndex] = useState(0);
  /** Ostatnio dotknięta odpowiedź: zielony błysk przy trafieniu, czerwony z potrząśnięciem przy pomyłce. */
  const [flash, setFlash] = useState<{ i: number; ok: boolean; id: number } | null>(null);
  const run = useRef({ start: 0, shownAt: 0, times: [] as number[], errors: 0, streak: 0, timer: 0, accepting: false, blockedUntil: 0, sent: false });

  function next(at = Math.round(performance.now())) {
    run.current.shownAt = at;
    setIndex((i) => i + 1);
    setPhase("play");
  }

  function start() {
    const t = Math.round(performance.now());
    run.current = { start: t, shownAt: t, times: [], errors: 0, streak: 0, timer: 0, accepting: false, blockedUntil: 0, sent: false };
    setPhase("play");
  }

  useLayoutEffect(() => {
    run.current.accepting = phase === "play" && playing;
  }, [phase, index, playing]);

  function finish() {
    const r = run.current;
    if (r.sent || !playing) return;
    r.sent = true;
    r.accepting = false;
    clearTimeout(r.timer);
    setPhase("sent");
    onMove({ type: "result", times: [...r.times], errors: r.errors });
  }

  function answer(option: number) {
    const r = run.current;
    if (phase !== "play" || !playing || !r.accepting || r.sent) return;
    const now = Math.round(performance.now());
    if (now - r.start >= QUIZ_DURATION_MS) return finish();
    if (now < r.blockedUntil) return;
    r.accepting = false;
    const took = now - r.shownAt;
    const ok = option === question(index).correct;
    if (ok) {
      r.streak++;
      r.times.push(took);
      next(now);
    } else {
      // Błysk pomyłki zostaje na dotkniętym przycisku (pytanie stoi przez blokadę); trafienie błyska licznikiem,
      // bo po nim od razu jest nowe pytanie i błysk trafiłby w przypadkową odpowiedź.
      setFlash((f) => ({ i: option, ok, id: (f?.id ?? 0) + 1 }));
      r.errors++;
      r.streak = 0;
      navigator.vibrate?.(VIBRATE.mistake);
      r.blockedUntil = now + BLOCK_MS;
      setPhase("wrong");
      r.timer = window.setTimeout(() => {
        if (Math.round(performance.now()) - r.start >= QUIZ_DURATION_MS) return finish();
        if (retry) setPhase("play");
        else next();
      }, BLOCK_MS);
    }
  }

  // Zegar gry: kończy partię po 30 s (czas do końca pokazuje nagłówek).
  useEffect(() => {
    if (phase === "intro" || phase === "sent" || !playing) return;
    const id = setInterval(() => {
      const r = run.current;
      if (Math.round(performance.now()) - r.start < QUIZ_DURATION_MS) return;
      finish();
    }, 100);
    return () => clearInterval(id);
  }, [phase === "intro" || phase === "sent", playing]);

  useEffect(() => () => clearTimeout(run.current.timer), []);

  const idle = phase === "intro" || phase === "sent" || !playing;
  useEffect(() => onRound?.(idle ? null : QUIZ_DURATION_MS), [idle]);

  if (!playing || phase === "sent") return <Results view={view} me={me} players={players} ranking={ranking} winner={winner} points={points} note={note} />;

  if (phase === "intro") {
    return (
      <Intro
        preview={preview}
        time={`${QUIZ_DURATION_MS / 1000} sekund`}
        task={task}
        score={score}
        onStart={start}
      />
    );
  }

  const q = question(index);
  const hits = run.current.times.length;
  const counted = (value: ReactNode) => (
    <span key={hits} className={hits ? "inline-block animate-[tile-hit_0.35s_ease-out] rounded-inset px-1" : "px-1"}>{value}</span>
  );
  return (
    <div className="flex flex-1 flex-col gap-3">
      <Stats
        items={[
          points ? { label: "Punkty", value: counted(points(run.current)) } : { label: "Trafienia", value: counted(hits) },
          { label: "Błędy", value: run.current.errors, warn: run.current.errors > 0 },
          { label: "Seria", value: run.current.streak },
        ]}
      />
      {!q.cols && (
        <div className="tile flex min-h-32 flex-1 items-center justify-center p-4">
          {phase === "wrong" ? <span className="text-2xl font-semibold text-warning">Źle!</span> : q.prompt}
        </div>
      )}
      <div className={q.cols ? "grid gap-2" : "grid grid-cols-2 gap-3"} style={q.cols ? { gridTemplateColumns: `repeat(${q.cols}, 1fr)` } : undefined}>
        {q.options.map((option, i) => (
          <button
            // Klucz z błysku: przycisk montuje się od nowa i animacja startuje jeszcze raz.
            key={i === flash?.i ? `${i}-${flash.id}` : i}
            type="button"
            disabled={phase !== "play"}
            onPointerDown={() => answer(i)}
            className={`flex touch-none select-none items-center justify-center border bg-surface ${q.cols ? "aspect-square rounded-inset" : "min-h-24 gap-2 rounded-tile text-xl font-semibold"} ${
              phase !== "wrong" ? "border-line" : i === flash?.i ? "border-warning" : "border-line opacity-40"
            } ${i === flash?.i ? "animate-[tile-miss_0.35s_ease-out]" : ""}`}
          >
            {option}
          </button>
        ))}
      </div>
      {q.cols && (
        <p role="status" className={`flex h-6 items-center justify-center ${phase === "wrong" ? "font-semibold text-warning" : "text-fg-muted"}`}>
          {phase === "wrong" ? "Źle!" : q.status}
        </p>
      )}
    </div>
  );
}
