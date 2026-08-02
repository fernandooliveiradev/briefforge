import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  isSafeRedirectPath,
  isAccessControlEnabled,
  createAccessToken,
  isValidAccessToken,
} from "@/lib/access-control";

const originalEnv = process.env;

function setPassword(value: string) {
  process.env.BRIEFFORGE_ACCESS_PASSWORD = value;
}

function clearEnv() {
  delete process.env.BRIEFFORGE_ACCESS_PASSWORD;
  delete process.env.BRIEFFORGE_SESSION_SECRET;
}

beforeEach(() => {
  clearEnv();
});

afterEach(() => {
  process.env = originalEnv;
});

describe("isSafeRedirectPath", () => {
  it("accepts a same-origin path", () => {
    expect(isSafeRedirectPath("/dashboard")).toBe(true);
  });

  it("rejects protocol-relative and absolute URLs", () => {
    expect(isSafeRedirectPath("//evil.com")).toBe(false);
    expect(isSafeRedirectPath("https://evil.com")).toBe(false);
  });

  it("rejects paths with backslashes", () => {
    expect(isSafeRedirectPath("/dashboard\\@evil.com")).toBe(false);
  });

  it("rejects null and empty", () => {
    expect(isSafeRedirectPath(null)).toBe(false);
    expect(isSafeRedirectPath("")).toBe(false);
  });
});

describe("access control flag", () => {
  it("is disabled when no password is set", () => {
    expect(isAccessControlEnabled()).toBe(false);
  });

  it("is enabled when a password is set", () => {
    setPassword("secret");
    expect(isAccessControlEnabled()).toBe(true);
  });
});

describe("access token lifecycle", () => {
  it("rejects tokens when access control is disabled", async () => {
    await expect(isValidAccessToken("x.y")).resolves.toBe(false);
  });

  it("fails to create a token when access control is disabled", async () => {
    await expect(createAccessToken()).rejects.toThrow();
  });

  it("creates a valid token and verifies it", async () => {
    setPassword("secret");
    const token = await createAccessToken();
    await expect(isValidAccessToken(token)).resolves.toBe(true);
  });

  it("rejects a tampered token", async () => {
    setPassword("secret");
    const token = await createAccessToken();
    const [payload, signature] = token.split(".");
    const tampered = `${payload}${"A"}${signature}`;
    await expect(isValidAccessToken(tampered)).resolves.toBe(false);
  });

  it("rejects a token signed with a different secret", async () => {
    setPassword("secret-a");
    const token = await createAccessToken();
    setPassword("secret-b");
    await expect(isValidAccessToken(token)).resolves.toBe(false);
  });
});
