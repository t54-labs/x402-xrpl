import { NextResponse } from "next/server";
import { apiFetch } from "../../lib/api";

export async function GET() {
  try {
    const data = await apiFetch("/dashboard");
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load dashboard data", details: String(error) },
      { status: 500 }
    );
  }
}
