import { NextResponse } from "next/server";
import { apiFetch } from "../../lib/api";

export async function GET(request: Request) {
  try {
    const raw = new URL(request.url).searchParams.get("range");
    const range = raw === "7d" || raw === "all" ? raw : "24h";
    const data = await apiFetch(`/top-merchants?range=${range}`);
    // Edge-cache briefly so a spike of range switches coalesces at the CDN.
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" },
    });
  } catch {
    // Signal a real failure (vs. a genuinely empty window) with a non-2xx so the client can
    // retry instead of rendering "No merchant activity". Body stays shaped so nothing throws.
    return NextResponse.json({ items: [], error: true }, { status: 503 });
  }
}
