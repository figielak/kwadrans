import type { LobbyPlayer } from "@kwadrans/games";
import { type FormEvent, type ReactNode, useEffect, useState } from "react";
import { Intro, RoundTable, Scores, Stats } from "../screens/ui.tsx";

/** Wspólny ekran gier „zobacz przez chwilę, wpisz liczbę”: Policz kropki i Kąt. */
interface Props {
  view: { players: string[]; results: Record<string, number>; answers: Record<string, number[]> };
  me: string;
  players: LobbyPlayer[];
  ranking?: string[];
  onMove: (move: { type: "result"; answers: number[] } | { type: "progress"; done: number }) => void;
  /** Prawdziwa wartość w każdej rundzie. */
  truths: number[];
  /** Zawartość kafla w rundzie `index`: przy pokazie i (z `reveal`) przy porównaniu po odpowiedzi. */
  draw: (index: number, reveal: boolean) => ReactNode;
  showMs: number;
  /** Największa odpowiedź, jaką przyjmie serwer. */
  maxAnswer: number;
  /** Dopisek do liczb, np. „°”. */
  unit?: string;
  question: string;
  preview: ReactNode;
  time: ReactNode;
  task: ReactNode;
  score: ReactNode;
}

/** Pusta plansza przed pokazem, żeby wzrok zdążył wrócić z przycisku. */
const WAIT_MS = 800;

/** Różnica ze znakiem: „−4”, „+3”. */
const signed = (n: number) => (n < 0 ? `−${-n}` : `+${n}`);

type Phase = "intro" | "wait" | "show" | "answer" | "reveal" | "sent";

export function Szacowanie({ view, me, players, ranking, onMove, truths, draw, showMs, maxAnswer, unit = "", question, preview, time, task, score }: Props) {
  const rounds = truths.length;
  const playing = view.players.includes(me) && !(me in view.results);
  const [phase, setPhase] = useState<Phase>("intro");
  const [answers, setAnswers] = useState<number[]>([]);
  const [input, setInput] = useState("");
  const index = phase === "reveal" ? answers.length - 1 : answers.length;
  const color = players.find((p) => p.id === me)?.color;
  const valid = input !== "" && Number(input) <= maxAnswer;

  useEffect(() => {
    if (phase !== "wait" && phase !== "show") return;
    const id = setTimeout(() => setPhase(phase === "wait" ? "show" : "answer"), phase === "wait" ? WAIT_MS : showMs);
    return () => clearTimeout(id);
  }, [phase]);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!valid) return;
    const all = [...answers, Number(input)];
    setAnswers(all);
    setInput("");
    setPhase("reveal");
    if (all.length < rounds) onMove({ type: "progress", done: all.length });
  }

  function next() {
    if (answers.length < rounds) return setPhase("wait");
    setPhase("sent");
    onMove({ type: "result", answers });
  }

  const over = ranking !== undefined;
  const rows = (ranking ?? view.players).map((id) => {
    const p = players.find((pl) => pl.id === id);
    return { id, nick: p?.nick ?? "Gracz", color: p?.color, me: id === me, score: id in view.results ? String(view.results[id]) : null };
  });

  if (!playing || phase === "sent") {
    // Na koniec odpowiedzi wszystkich; w trakcie tylko własne.
    const shown = (over ? (ranking ?? []) : [me]).filter((id) => view.answers[id]);
    return (
      <>
        <Scores rows={rows} />
        <p className="text-sm text-fg-muted">Suma pomyłek z {rounds} rund, mniej znaczy lepiej.</p>
        {shown.length > 0 && (
          <RoundTable
            heads={truths.map((_, i) => i + 1)}
            goal={{ label: "Było", values: truths.map((n) => `${n}${unit}`) }}
            rows={shown.map((id) => {
              const r = rows.find((row) => row.id === id)!;
              return { id, nick: r.nick, color: r.color, me: r.me, errors: view.answers[id].map((a, i) => Math.abs(a - truths[i])) };
            })}
            perfect={0}
            close={Infinity}
            unit={unit}
            // Znak mówi, czy za dużo, czy za mało; w komórce sama różnica, bo prawdziwe wartości są w wierszu „Było”.
            format={(d, i, id) => (d === 0 ? "0" : `${signed(view.answers[id][i] - truths[i])}${unit}`)}
            caption="Pomyłka w każdej rundzie: plus to za dużo, minus za mało. Zielony: dokładnie."
          />
        )}
      </>
    );
  }

  if (phase === "intro") {
    return <Intro preview={preview} time={time} task={task} score={score} onStart={() => setPhase("wait")} />;
  }

  const counter = (
    <Stats
      items={[
        { label: "Runda", value: `${index + 1}/${rounds}` },
        { label: "Suma błędów", value: answers.reduce((s, a, i) => s + Math.abs(a - truths[i]), 0) },
      ]}
    />
  );

  const truth = truths[index];
  const diff = (answers[index] ?? 0) - truth;

  // Kafel stoi w tym samym miejscu we wszystkich fazach, żeby układ nie skakał.
  // Na niskim ekranie maleje, żeby przycisk pod porównaniem mieścił się bez przewijania (23,5rem = nagłówek gry + wiersze pod kaflem).
  return (
    <section className="flex flex-col gap-2">
      {counter}
      <div className="tile relative mx-auto aspect-square w-full max-w-[calc(100dvh-23.5rem)]">
        {(phase === "show" || phase === "reveal") && draw(index, phase === "reveal")}
        {phase === "answer" && (
          // Na telefonie przy górnej krawędzi: przycisk musi zostać nad klawiaturą (numeryczna na iOS nie ma Entera).
          <form className="absolute inset-0 flex flex-col gap-3 p-4 sm:justify-center" onSubmit={submit}>
            <label className="flex flex-col gap-1">
              <span className="text-sm text-fg-muted">{question}</span>
              <input
                className="field text-center font-mono text-3xl"
                inputMode="numeric"
                enterKeyHint="done"
                autoComplete="off"
                autoFocus
                value={input}
                onChange={(e) => setInput(e.target.value.replace(/\D/g, "").slice(0, String(maxAnswer).length))}
              />
            </label>
            <button type="submit" className="btn w-full btn-player" style={{ backgroundColor: color }} disabled={!valid}>
              Zatwierdź
            </button>
          </form>
        )}
      </div>
      {phase === "reveal" && (
        <>
          <div className="flex items-baseline justify-between gap-3">
            <p>
              Było{" "}
              <span className="font-mono font-semibold tabular-nums">
                {truth}
                {unit}
              </span>
              , wpisałeś{" "}
              <span className="font-mono font-semibold tabular-nums">
                {answers[index]}
                {unit}
              </span>
            </p>
            <span className={`font-mono text-3xl font-semibold tabular-nums ${diff === 0 ? "text-success" : ""}`}>
              {diff === 0 ? "Idealnie" : signed(diff)}
            </span>
          </div>
          <button type="button" className="btn w-full btn-player" style={{ backgroundColor: color }} autoFocus onClick={next}>
            {answers.length < rounds ? "Następna runda" : "Wyniki"}
          </button>
        </>
      )}
    </section>
  );
}
