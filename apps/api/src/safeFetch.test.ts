import { describe, expect, it } from "vitest";
import { assertSafeHttpUrl, isBlockedAddress, type Resolver } from "./safeFetch";

const publicResolver: Resolver = async () => [{ address: "93.184.216.34", family: 4 }];
const privateResolver: Resolver = async () => [{ address: "10.0.0.5", family: 4 }];
const ipv6LoopbackResolver: Resolver = async () => [{ address: "0:0:0:0:0:0:0:1", family: 6 }];

describe("safeFetch", () => {
  it("allows public http URLs", async () => {
    await expect(assertSafeHttpUrl("https://example.com/pay", publicResolver)).resolves.toMatchObject({
      hostname: "example.com",
    });
  });

  it("blocks local and private URLs", async () => {
    await expect(assertSafeHttpUrl("http://localhost:3000", publicResolver)).rejects.toThrow(/Private/);
    await expect(assertSafeHttpUrl("http://127.0.0.1:3000", publicResolver)).rejects.toThrow(/Private/);
    await expect(assertSafeHttpUrl("http://[::1]:3000", publicResolver)).rejects.toThrow(/Private/);
    await expect(assertSafeHttpUrl("http://[::ffff:127.0.0.1]:3000", publicResolver)).rejects.toThrow(/Private/);
    await expect(assertSafeHttpUrl("https://internal.example", privateResolver)).rejects.toThrow(/Private/);
    await expect(assertSafeHttpUrl("https://internal.example", ipv6LoopbackResolver)).rejects.toThrow(/Private/);
  });

  it("classifies blocked address ranges", () => {
    expect(isBlockedAddress("169.254.169.254")).toBe(true);
    expect(isBlockedAddress("192.168.1.10")).toBe(true);
    expect(isBlockedAddress("0:0:0:0:0:0:0:0")).toBe(true);
    expect(isBlockedAddress("0:0:0:0:0:0:0:1")).toBe(true);
    expect(isBlockedAddress("::ffff:7f00:1")).toBe(true);
    expect(isBlockedAddress("fe80:0:0:0:0:0:0:1")).toBe(true);
    expect(isBlockedAddress("ff02:0:0:0:0:0:0:1")).toBe(true);
    expect(isBlockedAddress("2606:2800:220:1:248:1893:25c8:1946")).toBe(false);
    expect(isBlockedAddress("93.184.216.34")).toBe(false);
  });
});
