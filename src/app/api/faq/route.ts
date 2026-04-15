// ─────────────────────────────────────────────────────────────
// GET / POST /api/faq — FAQ knowledge base management
// ─────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { getFaq, setFaq, resetFaq } from "@/lib/configStore";
import type { FaqItem } from "@/types/config";

export async function GET() {
  return NextResponse.json(getFaq());
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body._action === "reset") {
      return NextResponse.json(resetFaq());
    }

    const items = body as FaqItem[];
    if (!Array.isArray(items)) {
      return NextResponse.json(
        { error: "Expected an array of FAQ items" },
        { status: 400 }
      );
    }

    return NextResponse.json(setFaq(items));
  } catch {
    return NextResponse.json(
      { error: "Invalid FAQ payload" },
      { status: 400 }
    );
  }
}
