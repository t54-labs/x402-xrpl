import dns from "node:dns/promises";
import net from "node:net";
import axios, { type AxiosRequestConfig, type AxiosResponse } from "axios";

type Resolver = (hostname: string) => Promise<Array<{ address: string; family: number }>>;

const BLOCKED_HOSTNAMES = new Set(["localhost", "metadata.google.internal"]);

export async function assertSafeHttpUrl(input: string | URL, resolver: Resolver = defaultResolve) {
  const url = typeof input === "string" ? new URL(input) : new URL(input.toString());
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Only http/https URLs are supported");
  }

  const hostname = normalizeHostname(url.hostname);
  if (BLOCKED_HOSTNAMES.has(hostname) || hostname.endsWith(".localhost")) {
    throw new Error("Private or local URLs are not allowed");
  }

  const ipVersion = net.isIP(hostname);
  const addresses = ipVersion > 0 ? [{ address: hostname, family: ipVersion }] : await resolver(hostname);
  if (addresses.length === 0) throw new Error("Could not resolve URL host");

  for (const { address } of addresses) {
    if (isBlockedAddress(address)) throw new Error("Private or local URLs are not allowed");
  }

  return url;
}

export async function safeHttpRequest<T = unknown>(
  url: string | URL,
  config: AxiosRequestConfig = {},
  resolver?: Resolver
): Promise<AxiosResponse<T>> {
  let current = await assertSafeHttpUrl(url, resolver);
  const maxRedirects = typeof config.maxRedirects === "number" ? config.maxRedirects : 3;

  for (let redirectCount = 0; redirectCount <= maxRedirects; redirectCount++) {
    const response = await axios.request<T>({
      ...config,
      url: current.toString(),
      maxRedirects: 0,
      validateStatus: () => true,
    });

    const location = response.headers.location;
    if (response.status >= 300 && response.status < 400 && typeof location === "string") {
      if (redirectCount === maxRedirects) throw new Error("Too many redirects");
      current = await assertSafeHttpUrl(new URL(location, current), resolver);
      continue;
    }

    return response;
  }

  throw new Error("Too many redirects");
}

function isBlockedAddress(address: string) {
  const normalized = normalizeHostname(address);
  const maybeMappedIpv4 = mappedIpv4FromIpv6(normalized) || normalized;

  if (net.isIP(maybeMappedIpv4) === 4) return isBlockedIpv4(maybeMappedIpv4);
  if (net.isIP(normalized) === 6) return isBlockedIpv6(normalized);
  return true;
}

async function defaultResolve(hostname: string) {
  return dns.lookup(hostname, { all: true, verbatim: true });
}

function isBlockedIpv4(address: string) {
  const parts = address.split(".").map((part) => Number(part));
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) {
    return true;
  }

  const [a, b] = parts;
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 0) ||
    (a === 192 && b === 168) ||
    (a === 198 && (b === 18 || b === 19)) ||
    a >= 224
  );
}

function isBlockedIpv6(address: string) {
  const normalized = address.toLowerCase();
  return (
    normalized === "::" ||
    normalized === "::1" ||
    normalized.startsWith("fc") ||
    normalized.startsWith("fd") ||
    normalized.startsWith("fe8") ||
    normalized.startsWith("fe9") ||
    normalized.startsWith("fea") ||
    normalized.startsWith("feb")
  );
}

function normalizeHostname(hostname: string) {
  const lower = hostname.toLowerCase();
  return lower.startsWith("[") && lower.endsWith("]") ? lower.slice(1, -1) : lower;
}

function mappedIpv4FromIpv6(address: string) {
  const normalized = normalizeHostname(address);
  if (!normalized.startsWith("::ffff:")) return null;

  const suffix = normalized.slice("::ffff:".length);
  if (net.isIP(suffix) === 4) return suffix;

  const words = suffix.split(":");
  if (words.length !== 2) return null;

  const high = Number.parseInt(words[0], 16);
  const low = Number.parseInt(words[1], 16);
  if (!Number.isInteger(high) || !Number.isInteger(low) || high < 0 || high > 0xffff || low < 0 || low > 0xffff) {
    return null;
  }

  return [
    (high >> 8) & 0xff,
    high & 0xff,
    (low >> 8) & 0xff,
    low & 0xff,
  ].join(".");
}
