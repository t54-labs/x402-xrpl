import { NextResponse } from "next/server";

const API_URL = process.env.API_URL || "http://localhost:4001";
const ADMIN_COOKIE = "admin_session";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const upstream = await fetch(`${API_URL}/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await upstream.json();

    if (!upstream.ok || !data?.token) {
      return NextResponse.json(
        { error: data?.error || "Admin login failed" },
        { status: upstream.status }
      );
    }

    const response = NextResponse.json({ success: true, expiresIn: data.expiresIn });
    response.cookies.set(ADMIN_COOKIE, data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: Number(data.expiresIn) || 12 * 60 * 60,
      path: "/",
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
