// ─────────────────────────────────────────────────────────────
// POST /api/planning-focus — Secure proxy to Railway backend
//
// Forwards planning focus requests to the Railway backend with
// the server-side DEEVO_API_KEY.
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const apiKey = process.env.DEEVO_API_KEY;

  if (!backendUrl) {
    return NextResponse.json(
      { error: "Backend URL not configured" },
      { status: 502 }
    );
  }

  try {
    const body = await req.json();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (apiKey) {
      headers["X-DEEVO-API-KEY"] = apiKey;
    }

    const res = await fetch(`${backendUrl}/api/planning/focus`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Backend proxy unavailable" },
      { status: 502 }
    );
  }
}
