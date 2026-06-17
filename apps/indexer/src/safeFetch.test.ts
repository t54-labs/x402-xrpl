import { describe, expect, it } from "vitest";
import { assertSafeHttpUrl } from "./safeFetch";

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
