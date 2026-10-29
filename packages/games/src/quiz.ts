import { z } from "zod";
import type { PlayerId } from "./core.ts";

// Wspólne dane wyników sześciu quizów: trafienia w 30 s i pomyłki z sekundą blokady.

export const DURATION_MS = 30_000;
export const BLOCK_MS = 1000;
/** Pierwsza pomyłka może paść od razu, następne co najmniej co sekundę, przed końcem rundy. */
const MAX_ERRORS = Math.ceil(DURATION_MS / BLOCK_MS);
/** Rozmiar zapętlanej puli plansz; nie ogranicza liczby trafień. */
export const QUESTIONS = 200;

/** Czasy poprawnych odpowiedzi i liczba pomyłek. */
export type QuizResult = { times: number[]; errors: number };
export type QuizMove = { type: "result" } & QuizResult;

export const quizMoveSchema = z.object({
  type: z.literal("result"),
  times: z.array(z.number().int().min(0).max(DURATION_MS)).refine((times) => times.reduce((a, b) => a + b, 0) <= DURATION_MS),
  errors: z.number().int().min(0).max(MAX_ERRORS),
});

/** Punkty w grach, w których pomyłka zabiera punkt (Obrót, Literówka): trafienia − pomyłki, nie mniej niż 0. */
export const netScore = ({ times, errors }: QuizResult) => Math.max(0, times.length - errors);

// ponytail: wynik liczony na kliencie jak w Refleksie, serwer odrzuca tylko nierealne wartości.
export const validQuiz = (state: { players: PlayerId[]; results: Record<PlayerId, unknown> }, player: PlayerId, { times, errors }: QuizResult) =>
  state.players.includes(player) &&
  !(player in state.results) &&
  quizMoveSchema.safeParse({ type: "result", times, errors }).success;
