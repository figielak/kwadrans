import { describe, expect, test } from "vitest";
import { PAIRS } from "./podrobka-dane.ts";

// Testy napisane przed pulą. Ustalają strukturę 60 par pytań Podróbki:
// - po 20 par w kategoriach liczby, rzeczy i miejsca,
// - stabilne, unikalne id; każde pytanie występuje w całej puli tylko raz, a pytania w parze się różnią,
// - pytanie jest niepuste, ma do 90 jednostek UTF-16 i kończy się znakiem zapytania,
// - wskazówka formatu jest niepusta i ma do 30 jednostek UTF-16,
// - teksty bez em-dashy i zewnętrznych spacji, pytania bez form rodzajowych „-łbyś” i „-łabyś”.
// Humoru ani balansu test nie ocenia: to sprawdza próba z ludźmi.

const QUESTION_MAX = 90;
const HINT_MAX = 30;
const EM_DASH = "—";
const questions = PAIRS.flatMap((pair) => [pair.a, pair.b]);
const texts = PAIRS.flatMap((pair) => [pair.a, pair.b, pair.hint]);

describe("pula pytań", () => {
  test("pula ma 60 par", () => {
    expect(PAIRS).toHaveLength(60);
  });

  test.each(["liczby", "rzeczy", "miejsca"])("kategoria %s ma 20 par", (category) => {
    expect(PAIRS.filter((pair) => pair.category === category)).toHaveLength(20);
  });

  test("każda para ma niepuste i unikalne id", () => {
    for (const pair of PAIRS) expect(pair.id.trim()).not.toBe("");
    expect(new Set(PAIRS.map((pair) => pair.id)).size).toBe(PAIRS.length);
  });

  test("pytania w parze się różnią", () => {
    for (const pair of PAIRS) expect(pair.a, pair.id).not.toBe(pair.b);
  });

  test("każde pytanie występuje w całej puli tylko raz", () => {
    expect(new Set(questions).size).toBe(PAIRS.length * 2);
  });

  test("pytanie jest niepuste i ma do 90 jednostek UTF-16", () => {
    for (const question of questions) {
      expect(question.trim().length, question).toBeGreaterThan(0);
      expect(question.length, question).toBeLessThanOrEqual(QUESTION_MAX);
    }
  });

  test("pytanie kończy się znakiem zapytania", () => {
    for (const question of questions) expect(question.endsWith("?"), question).toBe(true);
  });

  test("wskazówka jest niepusta i ma do 30 jednostek UTF-16", () => {
    for (const pair of PAIRS) {
      expect(pair.hint.trim().length, pair.id).toBeGreaterThan(0);
      expect(pair.hint.length, pair.id).toBeLessThanOrEqual(HINT_MAX);
    }
  });

  test("teksty nie mają em-dashy", () => {
    for (const text of texts) expect(text.includes(EM_DASH), text).toBe(false);
  });

  test("teksty nie mają zewnętrznych spacji", () => {
    for (const text of texts) expect(text, text).toBe(text.trim());
  });

  test("pytania nie używają form „-łbyś” ani „-łabyś”", () => {
    for (const question of questions) expect(question, question).not.toMatch(/ł(a)?byś/i);
  });
});
