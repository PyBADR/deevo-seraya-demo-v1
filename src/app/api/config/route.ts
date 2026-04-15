// ─────────────────────────────────────────────────────────────
// GET / POST /api/config — Admin configuration management
// ─────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { getConfig, updateConfig, resetConfig } from "@/lib/configStore";
import type { AppConfig } from "@/types/config";

export async function GET() {
  return NextResponse.json(getConfig());
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body._action === "reset") {
      return NextResponse.json(resetConfig());
    }

    const patch = body as Partial<AppConfig>;
    return NextResponse.json(updateConfig(patch));
  } catch {
    return NextResponse.json(
      { error: "Invalid config payload" },
      { status: 400 }
    );
  }
}
