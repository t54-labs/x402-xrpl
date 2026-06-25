import { NextResponse } from "next/server";
import { SIGNALS } from "../../lib/signals";

// Ecosystem Signals feed. v1 serves the curated real seed; phase 2 swaps the
// source to the Postgres table written by the cron pipeline — same JSON shape.
export const dynamic = "force-dynamic";

export async function GET() {
  const signals = [...SIGNALS].sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
  return NextResponse.json({ signals });
}
