import {
  GAMES,
  KALAMBURY_HALF_SECONDS,
  PODROBKA_ROUNDS,
  PODROBKA_VOTE_SECONDS,
  PODROBKA_WRITE_SECONDS,
  SABOTAZ_ROUNDS,
  WYPRAWA_DECISION_SECONDS,
  WYPRAWA_EXPEDITIONS,
} from "@kwadrans/games";
import { expect, test } from "vitest";
import { HOW_TO_PLAY, type HowToPlay } from "./howToPlay.ts";

const NEW_GAMES = ["sabotaz", "wyprawa", "podrobka"];
const OLD_GAMES = ["piec-w-rzedzie", "statki", "chinczyk", "memory", "kalambury", "labirynt", "panstwa-miasta"];
const CARDS = [...NEW_GAMES, ...OLD_GAMES];
const text = (card: HowToPlay) => [card.goal, ...card.flow, ...card.scoring, ...card.watch].join(" ");

test("karty trzech nowych gier istnieją, a klucze to id z GAMES", () => {
  for (const id of NEW_GAMES) expect(HOW_TO_PLAY[id], id).toBeDefined();
  for (const id of Object.keys(HOW_TO_PLAY)) expect(GAMES[id], id).toBeDefined();
});

test("karta ma cel, 2-4 punkty przebiegu, 1-4 punktacji i 2-3 uwagi", () => {
  for (const id of CARDS) {
    const card = HOW_TO_PLAY[id]!;
    expect(card.goal.trim().length, id).toBeGreaterThan(0);
    expect(card.flow.length, id).toBeGreaterThanOrEqual(2);
    expect(card.flow.length, id).toBeLessThanOrEqual(4);
    expect(card.scoring.length, id).toBeGreaterThanOrEqual(1);
    expect(card.scoring.length, id).toBeLessThanOrEqual(4);
    expect(card.watch.length, id).toBeGreaterThanOrEqual(2);
    expect(card.watch.length, id).toBeLessThanOrEqual(3);
  }
});

test("karta ma najwyżej 900 znaków", () => {
  for (const id of CARDS) expect(text(HOW_TO_PLAY[id]!).length, id).toBeLessThanOrEqual(900);
});

test("karty bez em-dasha i nazw cudzych gier", () => {
  for (const id of CARDS) expect(text(HOW_TO_PLAY[id]!), id).not.toMatch(/—|Skull|Uno|Quoridor|Business Tour/);
});

test("liczby rund i limitów pochodzą ze stałych gier", () => {
  expect(text(HOW_TO_PLAY.sabotaz!)).toContain(String(SABOTAZ_ROUNDS));
  expect(text(HOW_TO_PLAY.wyprawa!)).toContain(String(WYPRAWA_EXPEDITIONS));
  expect(text(HOW_TO_PLAY.podrobka!)).toContain(String(PODROBKA_ROUNDS));
  expect(text(HOW_TO_PLAY.wyprawa!)).toContain(String(WYPRAWA_DECISION_SECONDS));
  expect(text(HOW_TO_PLAY.podrobka!)).toContain(String(PODROBKA_WRITE_SECONDS));
  expect(text(HOW_TO_PLAY.podrobka!)).toContain(String(PODROBKA_VOTE_SECONDS));
});

test("karty starszych gier istnieją", () => {
  for (const id of OLD_GAMES) expect(HOW_TO_PLAY[id], id).toBeDefined();
});

test("Chińczyk opisuje tryb Szybki, Statki trafienie z kolejnym strzałem, Labirynt wybór kroku albo ścianki", () => {
  expect(text(HOW_TO_PLAY.chinczyk!)).toMatch(/Szybki/);
  expect(text(HOW_TO_PLAY.statki!)).toMatch(/Trafienie[^.]*kolejny strzał|kolejny strzał/i);
  expect(text(HOW_TO_PLAY.labirynt!)).toMatch(/krok/i);
  expect(text(HOW_TO_PLAY.labirynt!)).toMatch(/ściank/i);
});

test("Kalambury i Państwa-miasta wyjaśniają limit fazy i głosowanie", () => {
  expect(text(HOW_TO_PLAY.kalambury!)).toContain(String(KALAMBURY_HALF_SECONDS));
  expect(text(HOW_TO_PLAY["panstwa-miasta"]!)).toMatch(/STOP/);
  expect(text(HOW_TO_PLAY["panstwa-miasta"]!)).toMatch(/głosu/i);
});
