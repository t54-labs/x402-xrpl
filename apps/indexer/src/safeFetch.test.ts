import type { LookupOptions } from "node:dns";
import { describe, expect, it } from "vitest";
import { assertSafeHttpUrl, makeSafeLookup } from "./safeFetch";

type Resolver = (hostname: string) => Promise<Array<{ address: string; family: number }>>;
const publicResolver: Resolver = async () => [{ address: "93.184.216.34", family: 4 }];
const privateResolver: Resolver = async () => [{ address: "10.0.0.5", family: 4 }];

function runLookup(resolver: Resolver, host: string, options: LookupOptions) {
  return new Promise<{ err: Error | null; value: unknown }>((resolve) => {
    makeSafeLookup(resolver)(host, options, (err, value) => resolve({ err: err ?? null, value }));
  });
}

describe("makeSafeLookup (connect-time SSRF pinning)", () => {
  it("returns the validated address for a public host", async () => {
    const { err, value } = await runLookup(publicResolver, "example.com", {});
    expect(err).toBeNull();
    expect(value).toBe("93.184.216.34");
  });

  it("rejects a rebinding answer that resolves to a private IP at connect time", async () => {
    const { err } = await runLookup(privateResolver, "rebind.evil.com", {});
    expect(err).toBeInstanceOf(Error);
    expect(err?.message).toMatch(/Private/);
  });

  it("supports the all:true form", async () => {
    const { err, value } = await runLookup(publicResolver, "example.com", { all: true });
    expect(err).toBeNull();
    expect(value).toEqual([{ address: "93.184.216.34", family: 4 }]);
  });
});

describe("safeFetch", () => {
  it("blocks IPv6 loopback resolver results in expanded form", async () => {
    await expect(
      assertSafeHttpUrl("https://internal.example", async () => [
        { address: "0:0:0:0:0:0:0:1", family: 6 },
      ])
    ).rejects.toThrow(/Private/);
  });

  it("blocks IPv4-mapped IPv6 loopback URLs", async () => {
    await expect(
      assertSafeHttpUrl("http://[::ffff:127.0.0.1]:4001", async () => [
        { address: "93.184.216.34", family: 4 },
      ])
    ).rejects.toThrow(/Private/);
  });
});
