import { beforeEach, describe, expect, it, vi } from "vitest";
import axios from "axios";
import { prisma } from "@x402-xrpl/database";
import { POST } from "./route";

vi.mock("axios", () => ({
  default: {
    get: vi.fn(),
  },
}));

vi.mock("@x402-xrpl/database", () => ({
  prisma: {
    merchant: { upsert: vi.fn() },
    resource: { upsert: vi.fn() },
  },
}));

function paymentRequiredHeader(input: { payTo: string; amount?: string; asset?: string; network?: string }) {
  return Buffer.from(
    JSON.stringify([
      {
        payTo: input.payTo,
        amount: input.amount || "0.5",
        asset: input.asset || "XRP",
        network: input.network || "xrpl",
      },
    ]),
    "utf-8"
  ).toString("base64");
}

function getCreatePayload(args: unknown): { merchantAddr?: string; url?: string; name?: string } {
  if (typeof args !== "object" || args === null || !("create" in args)) return {};
  const create = (args as { create?: unknown }).create;
  if (typeof create !== "object" || create === null) return {};

  const data = create as Record<string, unknown>;
  return {
    merchantAddr: typeof data.merchantAddr === "string" ? data.merchantAddr : undefined,
    url: typeof data.url === "string" ? data.url : undefined,
    name: typeof data.name === "string" ? data.name : undefined,
  };
}

describe("POST /api/verify", () => {
  const axiosGet = vi.mocked(axios.get);
  const merchantUpsert = vi.mocked(prisma.merchant.upsert);
  const resourceUpsert = vi.mocked(prisma.resource.upsert);

  beforeEach(() => {
    vi.clearAllMocks();
    merchantUpsert.mockResolvedValue({} as never);
    resourceUpsert.mockImplementation(async (args: unknown) => {
      const create = getCreatePayload(args);
      return {
        id: "resource-id",
        merchantAddr: create.merchantAddr,
        url: create.url,
        name: create.name,
      } as never;
    });
  });

  it("registers a direct endpoint when discovery is not found", async () => {
    axiosGet.mockImplementation(async (url: string) => {
      if (url === "https://api.example.com/.well-known/x402") {
        return { status: 404, data: {}, headers: {} } as never;
      }
      if (url === "https://api.example.com/v1/pay") {
        return {
          status: 402,
          data: {},
          headers: {
            "payment-required": paymentRequiredHeader({ payTo: "rMerchant111" }),
          },
        } as never;
      }
      throw new Error(`Unexpected URL ${url}`);
    });

    const request = new Request("http://localhost/api/verify", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ url: "https://api.example.com/v1/pay" }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.registeredCount).toBe(1);
    expect(body.discoveryChecked).toBe(false);
    expect(body.failed).toHaveLength(0);
    expect(merchantUpsert).toHaveBeenCalledTimes(1);
    expect(resourceUpsert).toHaveBeenCalledTimes(1);
  });

  it("discovers and registers multiple resources from origin", async () => {
    axiosGet.mockImplementation(async (url: string) => {
      if (url === "https://merchant.example/.well-known/x402") {
        return {
          status: 200,
          data: {
            resources: ["/api/r1", "GET /api/r2"],
          },
          headers: {},
        } as never;
      }
      if (url === "https://merchant.example/api/r1") {
        return {
          status: 402,
          data: {},
          headers: {
            "payment-required": paymentRequiredHeader({ payTo: "rMerchant222" }),
          },
        } as never;
      }
      if (url === "https://merchant.example/api/r2") {
        return { status: 200, data: {}, headers: {} } as never;
      }
      throw new Error(`Unexpected URL ${url}`);
    });

    const request = new Request("http://localhost/api/verify", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ url: "https://merchant.example" }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.discoveryChecked).toBe(true);
    expect(body.discoveryFound).toBe(2);
    expect(body.registeredCount).toBe(1);
    expect(body.failed).toHaveLength(1);
    expect(body.failed[0].url).toBe("https://merchant.example/api/r2");
    expect(resourceUpsert).toHaveBeenCalledTimes(1);
  });

  it("returns 400 when no resources can be verified", async () => {
    axiosGet.mockImplementation(async (url: string) => {
      if (url === "https://nope.example/.well-known/x402") {
        return { status: 404, data: {}, headers: {} } as never;
      }
      if (url === "https://nope.example/paid") {
        return { status: 200, data: {}, headers: {} } as never;
      }
      throw new Error(`Unexpected URL ${url}`);
    });

    const request = new Request("http://localhost/api/verify", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ url: "https://nope.example/paid" }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toContain("Could not verify");
    expect(body.failed).toHaveLength(1);
    expect(merchantUpsert).not.toHaveBeenCalled();
    expect(resourceUpsert).not.toHaveBeenCalled();
  });
});
