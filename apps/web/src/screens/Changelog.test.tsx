import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test, vi } from "vitest";
import { CHANGELOG, Changelog, VERSION } from "./Changelog.tsx";
import { Home } from "./Home.tsx";

// Home.tsx przez net.ts czyta `location` już przy imporcie; testy idą w node, więc dostaje namiastkę.
vi.hoisted(() => {
  Object.assign(globalThis, { location: { hostname: "localhost", origin: "http://localhost", search: "" } });
});

const text = (html: string) => html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ");

describe("changelog", () => {
  test("zaczyna się od wersji 1.0.0 z dodaniem changelogu", () => {
    expect(CHANGELOG.at(-1)).toMatchObject({ version: "1.0.0", changes: ["Dodanie changelogu"] });
  });

  test("wersja 1.1.0 opisuje nowe gry i Jak grać", () => {
    const entry = CHANGELOG.find((e) => e.version === "1.1.0")!;
    expect(entry.date).toBe("2026-11-09");
    const t = entry.changes.join(" ");
    for (const s of ["Sabotaż", "Wyprawa", "Podróbka", "Jak grać"]) expect(t).toContain(s);
  });

  test("najnowsza wersja 1.2.0 opisuje lobby, przerywanie partii i Rekordy", () => {
    expect(VERSION).toBe("1.2.0");
    expect(CHANGELOG[0].date).toBe("2026-11-10");
    const t = CHANGELOG[0].changes.join(" ");
    for (const s of ["lobby", "wyrzucić", "przerwać", "Rekordy"]) expect(t).toContain(s);
  });

  test("aktualna wersja to najnowszy wpis, numery się nie powtarzają", () => {
    expect(VERSION).toBe(CHANGELOG[0].version);
    expect(new Set(CHANGELOG.map((e) => e.version)).size).toBe(CHANGELOG.length);
  });

  test("każda wersja ma numer X.Y.Z, datę i opis bez em-dashy", () => {
    for (const { version, date, changes } of CHANGELOG) {
      expect(version).toMatch(/^\d+\.\d+\.\d+$/);
      expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(changes.length).toBeGreaterThan(0);
      for (const change of changes) expect(change).not.toContain("—");
    }
  });

  test("ekran pokazuje wersję, datę i opis zmian", () => {
    const t = text(renderToStaticMarkup(<Changelog onBack={() => {}} />));
    for (const s of ["Co nowego", "Wróć", "1.0.0", "6 listopada 2026", "Dodanie changelogu"]) expect(t).toContain(s);
  });

  test("ekran główny prowadzi do changelogu i pokazuje aktualną wersję", () => {
    expect(text(renderToStaticMarkup(<Home onRoom={() => {}} />))).toContain(`Wersja ${VERSION} · Co nowego`);
  });
});
