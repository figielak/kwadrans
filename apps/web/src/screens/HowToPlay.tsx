import { GAMES } from "@kwadrans/games";
import { Question, X } from "@phosphor-icons/react";
import { useId, useRef } from "react";
import { HOW_TO_PLAY, type HowToPlay } from "./howToPlay.ts";

function Section({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="flex flex-col gap-1">
      <h3 className="label text-fg-muted">{title}</h3>
      <ul className="flex flex-col gap-1 text-sm">
        {items.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </section>
  );
}

/** Treść karty „Jak grać”, wspólna dla rozwijanej sekcji i okienka w partii. */
export function RulesBody({ card }: { card: HowToPlay }) {
  return (
    <div className="flex flex-col gap-3">
      <Section title="Cel" items={[card.goal]} />
      <Section title="Przebieg" items={card.flow} />
      <Section title="Punktacja" items={card.scoring} />
      <Section title="Uważaj" items={card.watch} />
    </div>
  );
}

/** Zwinięta sekcja na ekranie gry (przed partią). Nie otwiera się sama. */
export function RulesDetails({ gameId }: { gameId: string }) {
  const card = HOW_TO_PLAY[gameId];
  if (!card) return null;
  return (
    <details className="group rounded-inset border border-line bg-surface">
      <summary className="flex min-h-12 cursor-pointer list-none items-center gap-2 px-3 [&::-webkit-details-marker]:hidden">
        <Question size={20} className="shrink-0" aria-hidden />
        <span className="flex-1">Jak grać</span>
      </summary>
      <div className="border-t border-line p-3">
        <RulesBody card={card} />
      </div>
    </details>
  );
}

/** Ikona „?” z okienkiem w trakcie partii; stan otwarcia jest lokalny, czas tury biegnie dalej. */
export function RulesButton({ gameId }: { gameId: string }) {
  const card = HOW_TO_PLAY[gameId];
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  if (!card) return null;
  return (
    <>
      <button
        type="button"
        className="btn btn-ghost size-12 shrink-0 px-0 text-fg-muted"
        aria-label="Jak grać"
        onClick={() => ref.current?.showModal()}
      >
        <Question size={22} aria-hidden />
      </button>
      {/* showModal() daje Esc, pułapkę fokusu i top layer nad Momentem i reakcjami. Klik w tło trafia w sam <dialog>. */}
      <dialog
        ref={ref}
        aria-labelledby={titleId}
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-inset border border-line bg-surface p-0 text-fg backdrop:bg-black/60"
        onClick={(e) => e.target === e.currentTarget && ref.current?.close()}
      >
        <div className="flex max-h-[85vh] flex-col gap-3 overflow-auto p-3">
          <div className="flex items-center justify-between gap-2">
            <h2 id={titleId} className="font-semibold">
              Jak grać: {GAMES[gameId]?.name ?? gameId}
            </h2>
            <button type="button" className="btn btn-ghost size-12 shrink-0 px-0 text-fg-muted" aria-label="Zamknij" onClick={() => ref.current?.close()}>
              <X size={18} weight="bold" aria-hidden />
            </button>
          </div>
          <RulesBody card={card} />
          <p className="text-sm text-fg-muted">Czas tury biegnie dalej.</p>
        </div>
      </dialog>
    </>
  );
}
