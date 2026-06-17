import { createHmac, timingSafeEqual } from "node:crypto";
import type { NextFunction, Request, Response } from "express";

export type AdminConfig = {
  username?: string;
  password?: string;
  sessionSecret?: string;
  apiToken?: string;
  ttlSeconds: number;
};

const DEFAULT_TTL_SECONDS = 12 * 60 * 60;

export function loadAdminConfig(env: NodeJS.ProcessEnv = process.env): AdminConfig | null {
  const username = env.ADMIN_USERNAME;
  const password = env.ADMIN_PASSWORD;
  const sessionSecret = env.ADMIN_SESSION_SECRET;
  const apiToken = env.ADMIN_API_TOKEN;

  if (!apiToken && (!username || !password || !sessionSecret)) return null;

  return {
    username,
    password,
    sessionSecret,
    apiToken,
    ttlSeconds: parsePositiveInt(env.ADMIN_SESSION_TTL_SECONDS, DEFAULT_TTL_SECONDS),
  };
}

export function canIssueAdminSessions(config: AdminConfig | null): config is AdminConfig & {
  username: string;
  password: string;
  sessionSecret: string;
} {
  return !!config?.username && !!config.password && !!config.sessionSecret;
}

export function verifyAdminCredentials(config: AdminConfig, username: unknown, password: unknown) {
  if (!canIssueAdminSessions(config)) return false;
  return safeEqual(String(username || ""), config.username) && safeEqual(String(password || ""), config.password);
}

export function createAdminSession(config: AdminConfig, nowMs = Date.now()) {
  if (!config.sessionSecret) throw new Error("Admin session secret is not configured");

  const issuedAt = Math.floor(nowMs / 1000);
  const payload = {
    sub: config.username || "admin",
    iat: issuedAt,
    exp: issuedAt + config.ttlSeconds,
  };
  const encodedPayload = base64Url(JSON.stringify(payload));
  const signature = signPayload(encodedPayload, config.sessionSecret);
  return `${encodedPayload}.${signature}`;
}

export function verifyAdminToken(config: AdminConfig, token: unknown, nowMs = Date.now()) {
  if (typeof token !== "string" || !token) return false;

  if (config.apiToken && safeEqual(token, config.apiToken)) return true;
  if (!config.sessionSecret) return false;

  const [encodedPayload, signature, extra] = token.split(".");
  if (!encodedPayload || !signature || extra) return false;

  const expected = signPayload(encodedPayload, config.sessionSecret);
  if (!safeEqual(signature, expected)) return false;

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf-8")) as { exp?: unknown };
    return typeof payload.exp === "number" && payload.exp > Math.floor(nowMs / 1000);
  } catch {
    return false;
  }
}

export function extractBearerToken(header: unknown) {
  if (typeof header !== "string") return null;
  const [scheme, token, extra] = header.split(/\s+/);
  if (extra || scheme?.toLowerCase() !== "bearer" || !token) return null;
  return token;
}

export function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  const config = loadAdminConfig();
  if (!config) {
    return res.status(503).json({ error: "Admin authentication is not configured" });
  }

  const token = extractBearerToken(req.headers.authorization);
  if (!verifyAdminToken(config, token)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  return next();
}

function signPayload(encodedPayload: string, secret: string) {
  return createHmac("sha256", secret).update(encodedPayload).digest("base64url");
}

function base64Url(value: string) {
  return Buffer.from(value, "utf-8").toString("base64url");
}

function parsePositiveInt(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) return false;
  return timingSafeEqual(leftBuffer, rightBuffer);
}
