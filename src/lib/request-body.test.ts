import { describe, it, expect } from "vitest";
import { readJsonBody } from "@/lib/request-body";

function jsonRequest(body: unknown): Request {
  return new Request("http://localhost/api", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("readJsonBody", () => {
  it("returns parsed JSON for a valid request", async () => {
    const result = await readJsonBody(jsonRequest({ hello: "world" }), 1024);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toEqual({ hello: "world" });
    }
  });

  it("rejects a non-JSON content type", async () => {
    const request = new Request("http://localhost/api", {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: "plain",
    });
    const result = await readJsonBody(request, 1024);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(400);
    }
  });

  it("rejects a payload over the size limit", async () => {
    const request = new Request("http://localhost/api", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: "x".repeat(5000) }),
    });
    const result = await readJsonBody(request, 100);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(413);
    }
  });

  it("rejects malformed JSON", async () => {
    const request = new Request("http://localhost/api", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not json",
    });
    const result = await readJsonBody(request, 1024);
    expect(result.ok).toBe(false);
  });

  it("parses a JSON array", async () => {
    const result = await readJsonBody(jsonRequest([1, 2, 3]), 1024);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toEqual([1, 2, 3]);
    }
  });
});
