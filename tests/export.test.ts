import { describe, expect, it } from "vitest";
import { csvCell } from "../lib/export";

describe("CSV export", () => {
  it("escapes quotes and spreadsheet formulas", () => {
    expect(csvCell('A "quote"')).toBe('"A ""quote"""');
    for (const value of ["=1+1", "+cmd", "-2+3", "@SUM(A1:A2)", "  =HYPERLINK(\"x\")"]) expect(csvCell(value).startsWith('"\'')).toBe(true);
  });
  it("preserves ordinary text", () => expect(csvCell("safe text")).toBe('"safe text"'));
});
