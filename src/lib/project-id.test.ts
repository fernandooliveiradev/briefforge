import { describe, it, expect } from "vitest";
import { parseProjectId } from "@/lib/project-id";
import { slugifyFileName } from "@/lib/briefing-export";

describe("parseProjectId", () => {
  it("parses a positive integer string", () => {
    expect(parseProjectId("42")).toBe(42);
  });

  it("rejects zero and negative values", () => {
    expect(parseProjectId("0")).toBeNull();
    expect(parseProjectId("-1")).toBeNull();
  });

  it("rejects non-numeric input", () => {
    expect(parseProjectId("abc")).toBeNull();
    expect(parseProjectId("1.5")).toBeNull();
    expect(parseProjectId("42x")).toBeNull();
  });

  it("rejects values that are not safe integers", () => {
    expect(parseProjectId("9007199254740993")).toBeNull();
  });

  it("rejects empty strings", () => {
    expect(parseProjectId("")).toBeNull();
  });
});

describe("slugifyFileName", () => {
  it("slugs a name and strips accents", () => {
    expect(slugifyFileName("Café da Manhã")).toBe("cafe-da-manha");
  });

  it("returns a fallback for empty input", () => {
    expect(slugifyFileName("  ")).toBe("briefing");
  });

  it("collapses separators and trims edges", () => {
    expect(slugifyFileName("  Acme--Studio! ")).toBe("acme-studio");
  });
});
