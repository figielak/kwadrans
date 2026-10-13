import { type LobbyPlayer, W_PAMIECI_MAX_ANSWER, W_PAMIECI_ROUNDS, W_PAMIECI_SHOW_MS, type WPamieciRound, type WPamieciView, wPamieciValue } from "@kwadrans/games";
import { type FormEvent, useEffect, useState } from "react";
import { Intro, Scores, Stats } from "../screens/ui.tsx";

interface Props {
  view: WPamieciView;
  me: string;
  players: LobbyPlayer[];
  ranking?: string[];
  onMove: (move: { type: "result"; answers: number[] }) => void;
}

type Phase = "intro" | "wait" | "show" | "answer" | "reveal" | "sent";

/** Pusty kafel przed ciągiem, żeby wzrok zdążył wrócić z przycisku. */
const WAIT_MS = 800;

/** „1 runda”, „3 rundy”, „7 rund”. */
const roundsLabel = (n: number) => `${n} ${n === 1 ? "runda" : n % 10 >= 2 && n % 10 <= 4 && (n < 12 || n > 14) ? "rundy" : "rund"}`;

/** Pozycje ciągu tak, jak je widać: „4”, „+7”, „−3”, „×2”. */
const items = (round: WPamieciRound) => [String(round.start), ...round.ops.map(({ op, n }) => `${op}${n}`)];

/** Podgląd na ekranie instrukcji: liczba, dwa działania i pytanie o wynik, po kolei. */
function Preview() {
  return (
    <>
      {["5", "+7", "×2", "= ?"].map((text, i) => (
        <span
          key={text}
          className={`absolute inset-0 flex animate-[preview-quarter_4s_linear_infinite] items-center justify-center font-mono text-3xl font-semibold ${i ? "opacity-0" : ""}`}
          style={{ animationDelay: `${i ? i - 4 : 0}s` }}
        >
          {text}
        </span>
      ))}
    </>
  );
}

export function WPamieci({ view, me, players, ranking, onMove }: Props) {
  const playing = view.players.includes(me) && !(me in view.results);
  const [phase, setPhase] = useState<Phase>("intro");
  const [answers, setAnswers] = useState<number[]>([]);
  /** Pokazywana pozycja ciągu: 0 to liczba startowa. */
  const [pos, setPos] = useState(0);
  const [input, setInput] = useState("");
  const color = players.find((p) => p.id === me)?.color;

  const index = phase === "reveal" ? answers.length - 1 : answers.length;
  const round = view.rounds[index];

  useEffect(() => {
    if (phase !== "wait" && phase !== "show") return;
    const id = setTimeout(
      () => {
        if (phase === "wait") {
          setPos(0);
          setPhase("show");
        } else if (pos < round.ops.length) setPos(pos + 1);
        else setPhase("answer");
      },
      phase === "wait" ? WAIT_MS : W_PAMIECI_SHOW_MS,
    );
    return () => clearTimeout(id);
  }, [phase, pos]);

  function send(all: number[]) {
    setPhase("sent");
    onMove({ type: "result", answers: all });
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    if (input === "") return;
    const all = [...answers, Number(input)];
    setAnswers(all);
    setInput("");
    if (all.at(-1) !== wPamieciValue(round)) {
      navigator.vibrate?.(60);
      return setPhase("reveal");
    }
    if (all.length < W_PAMIECI_ROUNDS) return setPhase("wait");
    send(all);
  }

  if (!playing || phase === "sent") {
    const rows = (ranking ?? view.players).map((id) => {
      const p = players.find((pl) => pl.id === id);
      const r = view.results[id];
      // Odchyłka równa największej odpowiedzi to brak odpowiedzi (limit czasu), nie ma czego pokazać.
      const off = r && r.rounds < W_PAMIECI_ROUNDS && r.diff < W_PAMIECI_MAX_ANSWER ? ` (o ${r.diff})` : "";
      return { id, nick: p?.nick ?? "Gracz", color: p?.color, me: id === me, score: r ? roundsLabel(r.rounds) + off : null };
    });
    return (
      <>
        <Scores rows={rows} />
        <p className="text-sm text-fg-muted">Zaliczone rundy. Przy remisie wygrywa ten, kto w rundzie z pomyłką był bliżej wyniku (w nawiasie, o ile się pomylił).</p>
      </>
    );
  }

  if (phase === "intro") {
    return (
      <Intro
        preview={<Preview />}
        time={`Do ${W_PAMIECI_ROUNDS} rund, każde działanie widać ${String(W_PAMIECI_SHOW_MS / 1000).replace(".", ",")} s`}
        task="Licz w pamięci kolejne działania i wpisz, ile wyszło"
        score="Ciąg jest coraz dłuższy, pierwsza pomyłka kończy grę. Liczą się zaliczone rundy"
        onStart={() => setPhase("wait")}
      />
    );
  }

  const shown = phase === "show" ? pos : phase === "wait" ? 0 : round.ops.length;

  // Kafel stoi w tym samym miejscu we wszystkich fazach, żeby układ nie skakał.
  return (
    <section className="flex flex-col gap-2">
      <Stats
        items={[
          { label: "Runda", value: `${index + 1}/${W_PAMIECI_ROUNDS}` },
          { label: "Działanie", value: `${shown}/${round.ops.length}` },
        ]}
      />
      <div className="tile relative mx-auto flex aspect-square w-full max-w-[calc(100dvh-23.5rem)] items-center justify-center select-none">
        {phase === "wait" && answers.length > 0 && <span className="text-lg text-success">Dobrze</span>}
        {phase === "show" && (
          // Klucz z pozycji: dwa takie same działania z rzędu wskakują osobno.
          <span key={pos} className="animate-[stone-pop_180ms_ease-out] font-mono text-6xl font-semibold tabular-nums">
            {items(round)[pos]}
          </span>
        )}
        {phase === "answer" && (
          // Na telefonie przy górnej krawędzi: przycisk musi zostać nad klawiaturą (numeryczna na iOS nie ma Entera).
          <form className="absolute inset-0 flex flex-col gap-3 p-4 sm:justify-center" onSubmit={submit}>
            <label className="flex flex-col gap-1">
              <span className="text-sm text-fg-muted">Ile wyszło?</span>
              <input
                className="field text-center font-mono text-3xl"
                inputMode="numeric"
                enterKeyHint="done"
                autoComplete="off"
                autoFocus
                value={input}
                onChange={(e) => setInput(e.target.value.replace(/\D/g, "").slice(0, String(W_PAMIECI_MAX_ANSWER).length))}
              />
            </label>
            <button type="submit" className="btn w-full text-bg" style={{ backgroundColor: color }} disabled={input === ""}>
              Zatwierdź
            </button>
          </form>
        )}
        {phase === "reveal" && (
          <div className="flex flex-col items-center gap-3 p-4 text-center">
            <p className="flex flex-wrap justify-center gap-x-2 font-mono text-lg tabular-nums">
              {items(round).map((text, i) => (
                <span key={i}>{text}</span>
              ))}
              <span className="font-semibold text-success">= {wPamieciValue(round)}</span>
            </p>
            <p>
              wpisałeś <span className="font-mono font-semibold text-warning tabular-nums">{answers[index]}</span>
            </p>
          </div>
        )}
      </div>
      {phase === "reveal" && (
        <button type="button" className="btn w-full text-bg" style={{ backgroundColor: color }} autoFocus onClick={() => send(answers)}>
          Wyniki
        </button>
      )}
    </section>
  );
}
