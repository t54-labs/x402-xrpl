import dns from "node:dns/promises";
import net, { type LookupFunction } from "node:net";
import { Agent as HttpAgent } from "node:http";
import { Agent as HttpsAgent } from "node:https";
import axios, { type AxiosRequestConfig, type AxiosResponse } from "axios";

export type Resolver = (hostname: string) => Promise<Array<{ address: string; family: number }>>;

/**
 * A dns.lookup-compatible callback that resolves a hostname, rejects if ANY returned
 * address is private/blocked, and hands the socket only validated IPs. Because the address
 * it returns is the exact address the socket connects to, a DNS-rebinding answer cannot
 * differ between validation and connect time — the TOCTOU that assertSafeHttpUrl alone
 * (which resolves separately from axios's connect-time lookup) cannot close.
 */
export function makeSafeLookup(resolver: Resolver = defaultResolve): LookupFunction {
  return (hostname, options, callback) => {
    const cb = callback as (
      err: NodeJS.ErrnoException | null,
      address?: string | Array<{ address: string; family: number }>,
      family?: number,
    ) => void;
    const wantsAll =
      typeof options === "object" && options !== null && (options as { all?: boolean }).all === true;
    const ipVersion = net.isIP(hostname);
    const resolved =
      ipVersion > 0 ? Promise.resolve([{ address: hostname, family: ipVersion }]) : resolver(hostname);
    resolved
      .then((addresses) => {
        if (!addresses || addresses.length === 0) {
          cb(new Error("Could not resolve URL host") as NodeJS.ErrnoException);
          return;
        }
        for (const { address } of addresses) {
          if (isBlockedAddress(address)) {
            cb(new Error("Private or local URLs are not allowed") as NodeJS.ErrnoException);
            return;
          }
        }
        if (wantsAll) cb(null, addresses);
        else cb(null, addresses[0].address, addresses[0].family);
      })
      .catch((err) => cb(err as NodeJS.ErrnoException));
  };
}

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "metadata.google.internal",
]);

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
  const addresses = ipVersion > 0
    ? [{ address: hostname, family: ipVersion }]
    : await resolver(hostname);

  if (addresses.length === 0) throw new Error("Could not resolve URL host");

  for (const { address } of addresses) {
    if (isBlockedAddress(address)) {
      throw new Error("Private or local URLs are not allowed");
    }
  }

  return url;
}

export async function safeHttpRequest<T = unknown>(
  url: string | URL,
  config: AxiosRequestConfig = {},
  resolver: Resolver = defaultResolve
): Promise<AxiosResponse<T>> {
  let current = await assertSafeHttpUrl(url, resolver);
  const maxRedirects = typeof config.maxRedirects === "number" ? config.maxRedirects : 3;

  // Pin every connection to a validated IP: the socket resolves through makeSafeLookup, so
  // the address checked is the address connected to — a rebinding DNS answer cannot swap in
  // a private IP after assertSafeHttpUrl passes.
  const lookup = makeSafeLookup(resolver);
  const httpAgent = new HttpAgent({ lookup });
  const httpsAgent = new HttpsAgent({ lookup });

  try {
    for (let redirectCount = 0; redirectCount <= maxRedirects; redirectCount++) {
      const response = await axios.request<T>({
        ...config,
        url: current.toString(),
        httpAgent,
        httpsAgent,
        maxRedirects: 0,
        validateStatus: () => true,
      });

      const location = response.headers.location;
      if (response.status >= 300 && response.status < 400 && typeof location === "string") {
        if (redirectCount === maxRedirects) {
          throw new Error("Too many redirects");
        }
        current = await assertSafeHttpUrl(new URL(location, current), resolver);
        continue;
      }

      return response;
    }
  } finally {
    httpAgent.destroy();
    httpsAgent.destroy();
  }

  throw new Error("Too many redirects");
}

export function isBlockedAddress(address: string) {
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
  const words = parseIpv6Words(address);
  if (!words) return true;

  const first = words[0];
  return (
    words.every((word) => word === 0) ||
    (words.slice(0, 7).every((word) => word === 0) && words[7] === 1) ||
    (first & 0xfe00) === 0xfc00 ||
    (first & 0xffc0) === 0xfe80 ||
    (first & 0xff00) === 0xff00
  );
}

function normalizeHostname(hostname: string) {
  const lower = hostname.toLowerCase();
  return lower.startsWith("[") && lower.endsWith("]") ? lower.slice(1, -1) : lower;
}

function mappedIpv4FromIpv6(address: string) {
  const words = parseIpv6Words(address);
  if (!words) return null;
  if (!words.slice(0, 5).every((word) => word === 0) || words[5] !== 0xffff) return null;

  return [
    (words[6] >> 8) & 0xff,
    words[6] & 0xff,
    (words[7] >> 8) & 0xff,
    words[7] & 0xff,
  ].join(".");
}

function parseIpv6Words(address: string) {
  const normalized = normalizeHostname(address).split("%")[0].toLowerCase();
  const withExpandedIpv4 = normalized.replace(/(^|:)(\d+\.\d+\.\d+\.\d+)$/, (match, prefix, ipv4) => {
    const parts = String(ipv4).split(".").map((part) => Number(part));
    if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) {
      return match;
    }
    const high = ((parts[0] << 8) | parts[1]).toString(16);
    const low = ((parts[2] << 8) | parts[3]).toString(16);
    return `${prefix}${high}:${low}`;
  });

  const segments = withExpandedIpv4.split("::");
  if (segments.length > 2) return null;

  const head = segments[0] ? segments[0].split(":") : [];
  const tail = segments.length === 2 && segments[1] ? segments[1].split(":") : [];
  const missing = 8 - head.length - tail.length;
  const parts = segments.length === 2
    ? [...head, ...Array(Math.max(missing, 0)).fill("0"), ...tail]
    : withExpandedIpv4.split(":");

  if (parts.length !== 8 || parts.some((part) => !/^[0-9a-f]{1,4}$/.test(part))) return null;
  return parts.map((part) => Number.parseInt(part, 16));
}
