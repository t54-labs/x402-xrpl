import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const API_URL = process.env.API_URL || "http://localhost:4001";

export async function GET() {
  const upstream = await fetch(`${API_URL}/stream`);
  if (!upstream.body) {
    return new NextResponse("Stream unavailable", { status: 502 });
  }
  return new NextResponse(upstream.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
