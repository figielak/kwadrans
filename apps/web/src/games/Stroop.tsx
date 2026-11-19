import { type LobbyPlayer, type QuizMove, STROOP_COLORS, type StroopView } from "@kwadrans/games";
import { Quiz, QuizPreview } from "./Quiz.tsx";

/** Odcienie w kolejności STROOP_COLORS (jak pola Simona). */
const HUES = ["#ff2445", "#3b82f6", "#facc15", "#22c55e"];

interface Props {
  view: StroopView;
  me: string;
  players: LobbyPlayer[];
  ranking?: string[];
  winner?: string;
  onMove: (move: QuizMove) => void;
  onRound?: (msLeft: number | null) => void;
}

/** Podgląd na ekranie instrukcji i na kaflu gry. */
export function Preview() {
  return (
    <QuizPreview
      prompt={
        <span className="text-3xl font-bold tracking-wide" style={{ color: HUES[1] }}>
          {STROOP_COLORS[3]}
        </span>
      }
      options={STROOP_COLORS.slice(0, 3).map((name) => name.toLowerCase())}
      correct={1}
    />
  );
}

export function Stroop({ view, ...props }: Props) {
  return (
    <Quiz
      {...props}
      view={view}
      task="Wybierz kolor liter, nie znaczenie słowa (zwykle się różnią)"
      preview={<Preview />}
      question={(i) => {
        const { word, ink } = view.trials[i % view.trials.length];
        return {
          prompt: (
            <span className="text-[min(12vw,3.5rem)] font-bold tracking-wide" style={{ color: HUES[ink] }}>
              {STROOP_COLORS[word]}
            </span>
          ),
          options: STROOP_COLORS.map((name) => <span className="text-base">{name.toLowerCase()}</span>),
          correct: ink,
        };
      }}
    />
  );
}
