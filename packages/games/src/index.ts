import type { GameDefinition } from "./core.ts";
import { balon } from "./balon.ts";
import { chinczyk } from "./chinczyk.ts";
import { dziesiatki } from "./dziesiatki.ts";
import { inny } from "./inny.ts";
import { kalambury } from "./kalambury.ts";
import { kampusTour } from "./kampus-tour.ts";
import { kat } from "./kat.ts";
import { kolo } from "./kolo.ts";
import { kolor } from "./kolor.ts";
import { kropki } from "./kropki.ts";
import { liczenie } from "./liczenie.ts";
import { mapa } from "./mapa.ts";
import { memory } from "./memory.ts";
import { literowka } from "./literowka.ts";
import { nozyczki } from "./nozyczki.ts";
import { obrot } from "./obrot.ts";
import { panstwaMiasta } from "./panstwa-miasta.ts";
import { piecWRzedzie } from "./piec-w-rzedzie.ts";
import { przytrzymaj } from "./przytrzymaj.ts";
import { refleks } from "./refleks.ts";
import { rok } from "./rok.ts";
import { rytm } from "./rytm.ts";
import { schulte } from "./schulte.ts";
import { sudoku } from "./sudoku.ts";
import { simon } from "./simon.ts";
import { kubki } from "./kubki.ts";
import { sledzenie } from "./sledzenie.ts";
import { srodek } from "./srodek.ts";
import { statki } from "./statki.ts";
import { stoj } from "./stoj.ts";
import { stoper } from "./stoper.ts";
import { stroop } from "./stroop.ts";
import { tort } from "./tort.ts";
import { wieza } from "./wieza.ts";
import { wPamieci } from "./w-pamieci.ts";
import { zakupy } from "./zakupy.ts";
import { zaslona } from "./zaslona.ts";

export * from "./core.ts";
export * from "./lobby.ts";
export * from "./turniej.ts";
export { TRACK as CHINCZYK_TRACK, type View as ChinczykView } from "./chinczyk.ts";
export {
  ALLOWANCE as KAMPUS_ALLOWANCE,
  BOARD as KAMPUS_BOARD,
  CARDS as KAMPUS_CARDS,
  CHARACTERS as KAMPUS_CHARACTERS,
  GROUPS as KAMPUS_GROUPS,
  baseRent as kampusBaseRent,
  buildCost as kampusBuildCost,
  LANDMARK as KAMPUS_LANDMARK,
  LEVEL_RENT as KAMPUS_LEVEL_RENT,
  maxLevel as kampusMaxLevel,
  ROUNDS as KAMPUS_ROUNDS,
  setOf as kampusSetOf,
  UTILITY_RATES as KAMPUS_UTILITY_RATES,
  type Event as KampusEvent,
  type Move as KampusMove,
  type Stats as KampusStats,
  type TileKind as KampusTileKind,
  type View as KampusTourView,
} from "./kampus-tour.ts";
export {
  ANSWER_MAX as PM_ANSWER_MAX,
  CATEGORIES as PM_CATEGORIES,
  fits as pmFits,
  type Move as PanstwaMiastaMove,
  type View as PanstwaMiastaView,
} from "./panstwa-miasta.ts";
export {
  ANSWER_MAX as KALAMBURY_ANSWER_MAX,
  BATCH_POINTS as KALAMBURY_BATCH_POINTS,
  MAX_POINTS as KALAMBURY_MAX_POINTS,
  type Move as KalamburyMove,
  SIDE as KALAMBURY_SIDE,
  type View as KalamburyView,
} from "./kalambury.ts";
export type { View as PiecWRzedzieView } from "./piec-w-rzedzie.ts";
export { SYMBOLS as MEMORY_SYMBOLS, type View as MemoryView } from "./memory.ts";
export { PENALTY_MS as REFLEKS_PENALTY_MS, ROUNDS as REFLEKS_ROUNDS, type View as RefleksView } from "./refleks.ts";
export type { View as SimonView } from "./simon.ts";
export { PENALTY_MS as SCHULTE_PENALTY_MS, SIZE as SCHULTE_SIZE, total as schulteTotal, type View as SchulteView } from "./schulte.ts";
export { VISIBLE_MS as STOPER_VISIBLE_MS, type View as StoperView } from "./stoper.ts";
export { COLORS as STROOP_COLORS, type View as StroopView } from "./stroop.ts";
export type { View as LiczenieView } from "./liczenie.ts";
export type { Symbol as InnySymbol, View as InnyView } from "./inny.ts";
export { SIDE as DZIESIATKI_SIDE, take as dziesiatkiTake, TARGET as DZIESIATKI_TARGET, type View as DziesiatkiView } from "./dziesiatki.ts";
export { type Cells as ObrotCells, score as obrotScore, type View as ObrotView } from "./obrot.ts";
export { score as literowkaScore, type View as LiterowkaView } from "./literowka.ts";
export { ATTEMPTS as KOLO_ATTEMPTS, judge as koloJudge, MAX_POINTS as KOLO_MAX_POINTS, type Point as KoloPoint, type View as KoloView } from "./kolo.ts";
export { COUNT as KOLOR_COUNT, distance as kolorDistance, type Hsb, hints as kolorHints, hsbToRgb as kolorHsbToRgb, SHOW_MS as KOLOR_SHOW_MS, type View as KolorView } from "./kolor.ts";
export { MAX_ANSWER as KAT_MAX_ANSWER, type Round as KatRound, SHOW_MS as KAT_SHOW_MS, type View as KatView } from "./kat.ts";
export { BALLOONS as BALON_BALLOONS, MAX_SAFE as BALON_MAX_SAFE, score as balonScore, type View as BalonView } from "./balon.ts";
export { MAX_ANSWER as W_PAMIECI_MAX_ANSWER, ROUNDS as W_PAMIECI_ROUNDS, type Round as WPamieciRound, SHOW_MS as W_PAMIECI_SHOW_MS, value as wPamieciValue, type View as WPamieciView } from "./w-pamieci.ts";
export { ROUNDS as KROPKI_ROUNDS, SHOW_MS as KROPKI_SHOW_MS, type View as KropkiView } from "./kropki.ts";
export { MAX_YEAR as ROK_MAX_YEAR, MIN_YEAR as ROK_MIN_YEAR, REVEAL_MS as ROK_REVEAL_MS, ROUND_MS as ROK_ROUND_MS, ROUNDS as ROK_ROUNDS, type Event as RokEvent, type View as RokView } from "./rok.ts";
export { BALLS, MOVE_MS, RADIUS, ROUNDS, SHOW_MS, SPEED_START, SPEED_STEP, TARGETS, position as sledzeniePosition, type Ball as SledzenieBall, type Move as SledzenieMove, type Result as SledzenieResult, type State as SledzenieState, type View as SledzenieView } from "./sledzenie.ts";
export { BASE as WIEZA_BASE, build as wiezaBuild, left as wiezaLeft, LEVELS as WIEZA_LEVELS, MAX_STOP_MS as WIEZA_MAX_STOP_MS, START_WIDTH as WIEZA_START_WIDTH, type View as WiezaView } from "./wieza.ts";
export { ACCEPT_PX as SRODEK_ACCEPT_PX, error as srodekError, offset as srodekOffset, type Point as SrodekPoint, project as srodekProject, ROUNDS as SRODEK_ROUNDS, type View as SrodekView } from "./srodek.ts";
export { ASPECT as MAPA_ASPECT, distance as mapaDistance, error as mapaError, locate as mapaLocate, place as mapaPlace, type Point as MapaPoint, ROUNDS as MAPA_ROUNDS, type View as MapaView } from "./mapa.ts";
export { OUTLINE as MAPA_OUTLINE } from "./mapa-dane.ts";
export { DURATION_MS as STOJ_DURATION_MS, SCHEDULE as STOJ_SCHEDULE, score as stojScore, VISIBLE as STOJ_VISIBLE, type View as StojView } from "./stoj.ts";
export { BEATS as RYTM_BEATS, MAX_TAPS as RYTM_MAX_TAPS, TAP_MS as RYTM_TAP_MS, type View as RytmView } from "./rytm.ts";
export { deviation as przytrzymajDeviation, ROUNDS as PRZYTRZYMAJ_ROUNDS, type View as PrzytrzymajView } from "./przytrzymaj.ts";
export { LIST as ZAKUPY_LIST, MAX_MS as ZAKUPY_MAX_MS, score as zakupyScore, SHELF as ZAKUPY_SHELF, SHOW_MS as ZAKUPY_SHOW_MS, type View as ZakupyView } from "./zakupy.ts";
export { deviation as zaslonaDeviation, ROUNDS as ZASLONA_ROUNDS, type View as ZaslonaView } from "./zaslona.ts";
export { type Cake as TortCake, CAKES as TORT_CAKES, error as tortError, type View as TortView } from "./tort.ts";
export { ballAt as kubkiBallAt, ROUNDS as KUBKI_ROUNDS, SHOW_MS as KUBKI_SHOW_MS, swapMs as kubkiSwapMs, type Round as KubkiRound, type View as KubkiView } from "./kubki.ts";
export { BLANKS as SUDOKU_BLANKS, PENALTY_MS as SUDOKU_PENALTY_MS, total as sudokuTotal, type View as SudokuView } from "./sudoku.ts";
export { accepts as nozyczkiAccepts, type Cut as NozyczkiCut, error as nozyczkiError, type Point as NozyczkiPoint, share as nozyczkiShare, SHAPES as NOZYCZKI_SHAPES, split as nozyczkiSplit, type View as NozyczkiView } from "./nozyczki.ts";
export { DURATION_MS as QUIZ_DURATION_MS, type QuizMove } from "./quiz.ts";
export { around as shipAround, isValidFleet, MODES as STATKI_MODES, randomFleet, type Rules as StatkiRules, type Ship, shipCells, type Shot, type View as StatkiView } from "./statki.ts";

// ponytail: `any`, bo każda gra ma inny stan i ruch; platforma rozmawia z nimi tylko przez GameDefinition
// Bez prototypu: gameId przychodzi z sieci, a GAMES["constructor"] na zwykłym obiekcie zwróciłoby funkcję zamiast gry.
export const GAMES: Record<string, GameDefinition<any, any>> = Object.assign(Object.create(null), {
  [piecWRzedzie.id]: piecWRzedzie,
  [statki.id]: statki,
  [chinczyk.id]: chinczyk,
  [kampusTour.id]: kampusTour,
  [memory.id]: memory,
  [refleks.id]: refleks,
  [simon.id]: simon,
  [stoper.id]: stoper,
  [schulte.id]: schulte,
  [stroop.id]: stroop,
  [liczenie.id]: liczenie,
  [kolo.id]: kolo,
  [kolor.id]: kolor,
  [kropki.id]: kropki,
  [rok.id]: rok,
  [srodek.id]: srodek,
  [stoj.id]: stoj,
  [sledzenie.id]: sledzenie,
  [kubki.id]: kubki,
  [wieza.id]: wieza,
  [rytm.id]: rytm,
  [inny.id]: inny,
  [obrot.id]: obrot,
  [literowka.id]: literowka,
  [mapa.id]: mapa,
  [kat.id]: kat,
  [przytrzymaj.id]: przytrzymaj,
  [balon.id]: balon,
  [wPamieci.id]: wPamieci,
  [dziesiatki.id]: dziesiatki,
  [tort.id]: tort,
  [zakupy.id]: zakupy,
  [zaslona.id]: zaslona,
  [nozyczki.id]: nozyczki,
  [sudoku.id]: sudoku,
  [panstwaMiasta.id]: panstwaMiasta,
  [kalambury.id]: kalambury,
});

/** Id mini-gier (gry solo, minPlayers 1): pula turnieju i lista na ekranie mini-gier. */
export const MINI_GAME_IDS = Object.keys(GAMES).filter((id) => GAMES[id].minPlayers === 1);
