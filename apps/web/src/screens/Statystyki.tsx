import { Play, Warning } from "@phosphor-icons/react";
import { GAMES, type Report, type ReportGame } from "@kwadrans/games";
import { useEffect, useState } from "react";
import { fetchReport } from "../net.ts";
import { ICONS } from "./Lobby.tsx";
import { matchesWord, since } from "./profile.ts";
import { duration, one, percent, warnings } from "./report.ts";
import { Screen } from "./ui.tsx";

const PERIODS = [
  { days: 7, label: "7 dni" },
  { days: 30, label: "30 dni" },
  { days: 90, label: "90 dni" },
  { days: 0, label: "Całość" },
];

/**
 * Ukryta strona /statystyki: w co ludzie grają i co warto zostawić. Bez linku z aplikacji; same liczby zbiorcze,
 * nicki tylko jako liczba osób. Gry bez partii w okresie stoją osobno na dole.
 */
export function Statystyki() {
  const [days, setDays] = useState(30);
  /** undefined: wczytywanie, null: serwer nie odpowiada. */
  const [report, setReport] = useState<Report | null>();

  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex";
    document.head.append(meta);
    document.title = "Statystyki · Kwadrans";
    return () => meta.remove();
  }, []);
  useEffect(() => {
    setReport(undefined);
    fetchReport(days).then(setReport);
  }, [days]);

  const games = report?.games.filter((g) => GAMES[g.gameId]) ?? [];
  const byMatches = (a: ReportGame, b: ReportGame) => b.matches - a.matches || b.players - a.players;
  const main = games.filter((g) => GAMES[g.gameId].minPlayers > 1 && g.matches > 0).sort(byMatches);
  const mini = games.filter((g) => GAMES[g.gameId].minPlayers === 1 && g.matches > 0).sort(byMatches);
  const idle = games.filter((g) => g.matches === 0);

  return (
    <Screen dropped={false}>
      <h1 className="text-3xl font-semibold tracking-tight">Statystyki</h1>
      <div className="grid grid-cols-4 gap-2" role="group" aria-label="Okres">
        {PERIODS.map((p) => (
          <button
            key={p.days}
            type="button"
            aria-pressed={days === p.days}
            className={`btn px-1 text-sm ${days === p.days ? "border border-fg bg-line" : "btn-ghost"}`}
            onClick={() => setDays(p.days)}
          >
            {p.label}
          </button>
        ))}
      </div>

      {report === undefined && (
        <p role="status" aria-busy className="text-fg-muted">
          Wczytywanie…
        </p>
      )}
      {report === null && <p role="status" className="text-fg-muted">Nie udało się wczytać raportu.</p>}

      {report && (
        <>
          <dl className="grid grid-cols-3 gap-2">
            {[
              { label: "Partie", value: report.totals.matches },
              { label: "Gracze", value: report.totals.players },
              { label: "Dni gry", value: report.totals.days },
            ].map((item) => (
              <div key={item.label} className="flex flex-col gap-1 rounded-inset bg-surface p-3">
                <dt className="label">{item.label}</dt>
                <dd className="font-mono text-2xl font-semibold tabular-nums">{item.value}</dd>
              </div>
            ))}
          </dl>
          <GameList title="Gry główne" games={main} />
          <GameList title="Mini-gry" games={mini} />
          {idle.length > 0 && (
            <section className="flex flex-col gap-2" aria-labelledby="idle">
              <h2 id="idle" className="text-sm text-fg-muted">
                Bez partii w tym okresie ({idle.length})
              </h2>
              <p className="text-sm">{idle.map((g) => GAMES[g.gameId].name).join(", ")}</p>
            </section>
          )}
          <p className="text-xs text-fg-muted">
            Ukończone: partie z wynikiem. Rewanże: partie po „Jeszcze raz” i rewanżu. Porzucona instrukcja: wyjście z mini-gry przed startem. Wybrana: kafel gry w lobby,
            porzucona: zmiana wyboru bez startu. Głosowanie: wygrane z pokazanych. Partie sprzed historii nie mają czasu trwania.
          </p>
        </>
      )}
    </Screen>
  );
}

function GameList({ title, games }: { title: string; games: ReportGame[] }) {
  if (games.length === 0) return null;
  return (
    <section className="flex flex-col gap-2" aria-label={title}>
      <h2 className="text-sm text-fg-muted">{title}</h2>
      <ul className="flex flex-col gap-2">
        {games.map((g) => (
          <li key={g.gameId}>
            <GameRow game={g} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function GameRow({ game: g }: { game: ReportGame }) {
  const GameIcon = ICONS[g.gameId] ?? Play;
  const main = GAMES[g.gameId].minPlayers > 1;
  const notes = warnings(g);
  const items: [string, string][] = [
    ["Gracze", String(g.players)],
    ["Ukończone", percent(g.completed, g.matches)],
    ["Rewanże", percent(g.rematches, g.completed)],
    ["Mediana", duration(g.medianSeconds)],
    ["Średnio osób", one(g.avgPlayers)],
    main ? ["Walkowery", String(g.walkovers)] : ["Solo", percent(g.solo, g.matches)],
    main ? ["Wybrana / porzucona", `${g.picked} / ${g.dropped}`] : ["Porzucona instrukcja", String(g.introLeft)],
    ["Głosowanie", `${g.voteWon} z ${g.voteShown}`],
    main ? ["Jak grać", String(g.howTo)] : ["Wybrana w pokoju", String(g.picked)],
    ["Timeouty / partię", one(g.timeoutsPerMatch)],
    ["Reakcje / partię", one(g.reactionsPerMatch)],
    ["Ostatnio", g.lastAt ? since(g.lastAt) : "brak"],
  ];
  return (
    <div className="rounded-inset border border-line bg-surface p-3">
      <div className="flex items-center gap-3">
        <GameIcon size={20} className="shrink-0" aria-hidden />
        <h3 className="min-w-0 flex-1 truncate font-semibold">{GAMES[g.gameId].name}</h3>
        <span className="font-mono text-sm tabular-nums">{matchesWord(g.matches)}</span>
      </div>
      {notes.length > 0 && (
        <p className="mt-1 flex items-center gap-1.5 text-sm text-warning">
          <Warning size={14} className="shrink-0" aria-hidden />
          {notes.join(", ")}
        </p>
      )}
      <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
        {items.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-2">
            <dt className="truncate text-fg-muted">{label}</dt>
            <dd className="shrink-0 font-mono tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
