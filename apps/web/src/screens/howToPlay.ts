import {
  PODROBKA_ROUNDS,
  PODROBKA_VOTE_SECONDS,
  PODROBKA_WRITE_SECONDS,
  SABOTAZ_ROUNDS,
  SABOTAZ_SAFE_CARDS,
  SABOTAZ_SUCCESS_POINTS,
  SABOTAZ_TRAP_CARDS,
  SABOTAZ_TRAP_POINTS,
  WYPRAWA_DECISION_SECONDS,
  WYPRAWA_EXPEDITIONS,
} from "@kwadrans/games";

/** Karta „Jak grać”: cel, przebieg, punktacja i nieoczywiste pułapki. Treść dla gracza, nie kopia ZASADY-GIER.md. */
export type HowToPlay = { goal: string; flow: string[]; scoring: string[]; watch: string[] };

export const HOW_TO_PLAY: Record<string, HowToPlay> = {
  sabotaz: {
    goal: `Zdobądź najwięcej punktów w ${SABOTAZ_ROUNDS} rundach. Nikt nie odpada, każda runda zaczyna się od nowa.`,
    flow: [
      `Co rundę dostajesz ${SABOTAZ_SAFE_CARDS} Przejścia i ${SABOTAZ_TRAP_CARDS} Pułapkę. Wszyscy naraz kładą potajemnie jedną kartę na swój stos.`,
      "W swojej turze dokładasz kartę na wierzch stosu albo otwierasz licytację: ile Przejść odkryjesz.",
      "Podbijasz albo pasujesz. Kto zostanie, odkrywa tyle kart, ile zadeklarował: najpierw własny stos od góry, potem wierzchy cudzych stosów.",
    ],
    scoring: [
      `Udana deklaracja daje licytującemu ${SABOTAZ_SUCCESS_POINTS} pkt. Cudza Pułapka daje jej właścicielowi ${SABOTAZ_TRAP_POINTS} pkt, a własna nikomu nic.`,
    ],
    watch: [
      "Cel mniejszy od własnego stosu nie odkrywa reszty, więc Pułapka pod wierzchem może zostać ukryta.",
      "Po pierwszej deklaracji nie można już dokładać kart, a pas dotyczy tylko tej licytacji.",
    ],
  },
  wyprawa: {
    goal: `Wróć z jak największym bankiem po ${WYPRAWA_EXPEDITIONS} wyprawach.`,
    flow: [
      "Wszyscy idą jednym szlakiem. Każda odkryta karta to skarb, dzielony po równo między osoby na szlaku, albo zagrożenie.",
      `Po każdej karcie tajnie wybierasz „Idę dalej” albo „Wracam” i zatwierdzasz „Gotowe”. Masz ${WYPRAWA_DECISION_SECONDS} s.`,
      "Kto wraca, chowa niesioną zdobycz do banku i dzieli z innymi wracającymi resztki skarbów, których nie dało się podzielić.",
    ],
    scoring: ["Wygrywa największy bank. Bank jest bezpieczny, zdobycz niesiona na szlaku nie."],
    watch: [
      "Pierwsze zagrożenie tylko ostrzega. Drugie takie samo kończy wyprawę, a kto został na szlaku, traci niesioną zdobycz.",
      "Bez „Gotowe” liczy się „Wracam”, także po upływie czasu.",
    ],
  },
  podrobka: {
    goal: `Wykryj osobę z innym pytaniem, a jeśli to ty, uniknij wykrycia. Gra trwa ${PODROBKA_ROUNDS} rund.`,
    flow: [
      `Każdy odpowiada na swoje pytanie (${PODROBKA_WRITE_SECONDS} s). Jedna osoba, Podróbka, dostała inne, ale podobne.`,
      "Widzicie wszystkie odpowiedzi z nickami i rozmawiacie o nich.",
      `Tajnie głosujecie na podejrzanego (${PODROBKA_VOTE_SECONDS} s). Potem odsłona pytań i Podróbki.`,
    ],
    scoring: [
      "Własny głos na Podróbkę daje 2 pkt, nawet gdy grupa jej nie wykryła. Niewykryta Podróbka dostaje 3 pkt, jeśli sama zagłosowała.",
    ],
    watch: [
      "Podróbka jest wykryta tylko wtedy, gdy ma samodzielnie najwięcej głosów i co najmniej 2. Remis na prowadzeniu oznacza ucieczkę.",
      "Broń odpowiedzi, nie cytuj swojego pytania. Brak odpowiedzi od kogokolwiek anuluje rundę: wszyscy dostają 0.",
    ],
  },
};
