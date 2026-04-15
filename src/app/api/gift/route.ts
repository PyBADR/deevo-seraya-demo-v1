// ─────────────────────────────────────────────────────────────
// POST /api/gift — Thin controller for gift advisor
//
// Responsibilities: request parsing → service call → response.
// All business logic lives in giftService.ts.
// ─────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { handleGift } from "@/lib/services/giftService";
import type { GiftRequest } from "@/types/simulation";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as GiftRequest;

    const result = await handleGift(body);

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
