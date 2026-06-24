import { NextResponse } from "next/server";
import { apiFetch } from "../../lib/api";

// The all-time aggregate can take several seconds against the full ledger.
export const maxDuration = 30;

export async function GET(request: Request) {
  try {
    const raw = new URL(request.url).searchParams.get("range");
    const range = raw === "7d" || raw === "30d" ? raw : "all";
    const data = await apiFetch(`/dashboard?range=${range}`);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load dashboard data", details: String(error) },
      { status: 500 }
    );
  }
}
