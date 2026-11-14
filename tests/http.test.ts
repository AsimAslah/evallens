import { describe, expect, it } from "vitest";
import { readJson } from "../lib/http";

describe("HTTP payload handling", () => {
  it("rejects bodies that exceed the configured byte limit", async () => {
    const request = new Request("https://example.test/api", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Content-Length": "401" },
      body: JSON.stringify({ value: "small" })
    });
    await expect(readJson(request, 400)).rejects.toThrow("PAYLOAD_TOO_LARGE");
  });

  it("surfaces malformed JSON as a syntax error for route-level handling", async () => {
    const request = new Request("https://example.test/api", { method: "POST", body: "{not-json" });
    await expect(readJson(request)).rejects.toBeInstanceOf(SyntaxError);
  });
});
