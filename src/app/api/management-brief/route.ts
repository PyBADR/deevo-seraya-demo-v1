// ─────────────────────────────────────────────────────────────
// POST /api/management-brief — Thin controller for briefs
//
// Responsibilities: request parsing → service call → response.
// All business logic lives in briefService.ts.
// ─────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { handleBrief } from "@/lib/services/briefService";
import type { BriefRequest } from "@/types/simulation";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as BriefRequest;

    const result = await handleBrief(body);

    if (!result.success && !result.data) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(result.data);
  } catch {
    return NextResponse.json(
      { error: "Request parsing failed" },
      { status: 400 }
    );
  }
}
