import { ArrowLeft } from "@phosphor-icons/react";
import { Screen } from "./ui.tsx";

/** Historia wersji strony, najnowsza na górze. Nowy wpis na początku listy to zarazem nowy numer wersji. */
export const CHANGELOG: { version: string; date: string; changes: string[] }[] = [
  {
    version: "1.1.0",
    date: "2026-11-09",
    changes: [
      "Trzy nowe gry dla większej ekipy: Sabotaż (3-6 osób, licytacja zakrytych kart), Wyprawa (2-6 osób, wspólny szlak i ryzyko powrotu) oraz Podróbka (3-6 osób, wykrywanie osoby z innym pytaniem)",
      "Jak grać: każda gra główna ma krótką kartę z zasadami. Rozwiniesz ją na ekranie gry przed startem, a w trakcie partii otworzysz ikoną z pytajnikiem, także jako widz (w Kampus Tour ikony w partii jeszcze nie ma)",
    ],
  },
  { version: "1.0.0", date: "2026-11-06", changes: ["Dodanie changelogu"] },
];

export const VERSION = CHANGELOG[0].version;

/** Południe, żeby strefa czasowa nie przesunęła daty na sąsiedni dzień. */
const formatDate = (date: string) => new Date(`${date}T12:00:00`).toLocaleDateString("pl", { dateStyle: "long" });

export function Changelog({ onBack }: { onBack: () => void }) {
  return (
    <Screen dropped={false}>
      <button type="button" className="-ml-2 flex min-h-12 items-center gap-1.5 self-start px-2 text-sm text-fg-muted" onClick={onBack}>
        <ArrowLeft size={16} weight="bold" aria-hidden />
        Wróć
      </button>
      <h1 className="text-3xl font-semibold tracking-tight">Co nowego</h1>
      {CHANGELOG.map(({ version, date, changes }) => (
        <section key={version} aria-labelledby={`v${version}`} className="tile flex flex-col gap-2">
          <h2 id={`v${version}`} className="flex items-baseline justify-between gap-3">
            <span className="font-mono font-semibold tabular-nums">{version}</span>
            <span className="text-sm text-fg-muted">{formatDate(date)}</span>
          </h2>
          <ul className="flex flex-col gap-1">
            {changes.map((change) => (
              <li key={change}>{change}</li>
            ))}
          </ul>
        </section>
      ))}
    </Screen>
  );
}
