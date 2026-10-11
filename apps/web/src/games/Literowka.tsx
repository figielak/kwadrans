import { literowkaScore, type LiterowkaView, type LobbyPlayer, type QuizMove } from "@mini-games/games";
import { Quiz, QuizPreview } from "./Quiz.tsx";

interface Props {
  view: LiterowkaView;
  me: string;
  players: LobbyPlayer[];
  ranking?: string[];
  winner?: string;
  onMove: (move: QuizMove) => void;
  onRound?: (msLeft: number | null) => void;
}

const ASK = "Które słowo ma błąd?";

export function Literowka({ view, ...props }: Props) {
  return (
    <Quiz
      {...props}
      view={view}
      points={literowkaScore}
      note="Punkty to trafienia minus błędy. Przy remisie wygrywa niższy średni czas."
      score="Trafienie to punkt, pomyłka zabiera punkt i blokuje na sekundę"
      task="Cztery słowa, jedno ma błąd ortograficzny: dotknij błędnego"
      preview={<QuizPreview prompt={<span className="text-sm text-fg-muted">{ASK}</span>} options={["rzeka", "chałas", "góra"]} correct={1} />}
      question={(i) => {
        const { words, wrong } = view.trials[i % view.trials.length];
        return {
          // Słowo ma najwyżej 12 liter: przy tym rozmiarze mieści się w kaflu na ekranie 360 px.
          options: words.map((word) => <span className="text-xl font-semibold">{word}</span>),
          correct: wrong,
          cols: 2,
          status: ASK,
        };
      }}
    />
  );
}
