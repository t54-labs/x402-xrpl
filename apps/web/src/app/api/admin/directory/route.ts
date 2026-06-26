import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API_URL = process.env.API_URL || "http://localhost:4001";
const ADMIN_COOKIE = "admin_session";

export async function GET(request: Request) {
  try {
    const token = (await cookies()).get(ADMIN_COOKIE)?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const status = new URL(request.url).searchParams.get("status") || "pending";
    const upstream = await fetch(`${API_URL}/admin/directory?status=${encodeURIComponent(status)}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const data = await upstream.json();
    return NextResponse.json(data, { status: upstream.status });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const token = (await cookies()).get(ADMIN_COOKIE)?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await request.json();
    const action = body?.action === "reject" ? "reject" : "approve";
    const upstream = await fetch(`${API_URL}/admin/directory/${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id: body?.id, comment: body?.comment }),
    });
    const data = await upstream.json();
    return NextResponse.json(data, { status: upstream.status });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
