import { NextResponse } from "next/server";
import { apiFetch } from "../../lib/api";

// The all-time aggregate can take several seconds against the full ledger.
export const maxDuration = 30;

export async function GET(request: Request) {
  try {
    const raw = new URL(request.url).searchParams.get("range");
    const range = raw === "7d" || raw === "30d" ? raw : "all";
    // A cold-cache wide-window aggregate over the full (1.4M+ row) ledger now runs ~6s —
    // above apiFetch's 6s default, which was cutting it off and 500ing. Give it room; the
    // route already allows maxDuration=30, so this stays well inside the function budget.
    const data = await apiFetch(`/dashboard?range=${range}`, { signal: AbortSignal.timeout(18000) });
    // Edge-cache briefly so the 8s client poll from thousands of tabs collapses into ~one
    // origin hit per 15s window per range. Serve the last good snapshot for up to 5 min while
    // a slow/cold refresh revalidates in the background, so a momentary backend slowdown
    // never blanks the page.
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, s-maxage=15, stale-while-revalidate=300" },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load dashboard data", details: String(error) },
      { status: 500 }
    );
  }
}
