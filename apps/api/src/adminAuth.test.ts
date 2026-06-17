import { describe, expect, it } from "vitest";
import {
  createAdminSession,
  extractBearerToken,
  verifyAdminCredentials,
  verifyAdminToken,
  type AdminConfig,
} from "./adminAuth";

const config: AdminConfig = {
  username: "admin",
  password: "secret",
  sessionSecret: "session-secret",
  apiToken: "server-token",
  ttlSeconds: 60,
};

describe("adminAuth", () => {
  it("verifies configured credentials", () => {
    expect(verifyAdminCredentials(config, "admin", "secret")).toBe(true);
    expect(verifyAdminCredentials(config, "admin", "wrong")).toBe(false);
  });

  it("creates and verifies expiring signed sessions", () => {
    const token = createAdminSession(config, 1_000);
    expect(verifyAdminToken(config, token, 2_000)).toBe(true);
    expect(verifyAdminToken(config, token, 62_000)).toBe(false);
  });

  it("accepts optional static server bearer token", () => {
    expect(verifyAdminToken(config, "server-token")).toBe(true);
    expect(verifyAdminToken(config, "other-token")).toBe(false);
  });

  it("extracts strict bearer tokens", () => {
    expect(extractBearerToken("Bearer abc")).toBe("abc");
    expect(extractBearerToken("Basic abc")).toBeNull();
    expect(extractBearerToken("Bearer abc def")).toBeNull();
  });
});
