import { NextResponse } from "next/server";
import { apiFetch } from "../../lib/api";

// The all-time aggregate can take several seconds against the full ledger.
export const maxDuration = 30;

export async function GET(request: Request) {
  try {
    const raw = new URL(request.url).searchParams.get("range");
    const range = raw === "7d" || raw === "30d" ? raw : "all";
    const data = await apiFetch(`/dashboard?range=${range}`);
    // Edge-cache briefly so the 8s client poll from thousands of tabs collapses
    // into ~one origin hit per 10s window per range, instead of every tab reaching Node.
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, s-maxage=10, stale-while-revalidate=30" },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load dashboard data", details: String(error) },
      { status: 500 }
    );
  }
}
