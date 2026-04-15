// ─────────────────────────────────────────────────────────────
// POST /api/chat — Thin controller for staff chat
//
// Responsibilities: request parsing → service call → response.
// All business logic lives in chatService.ts.
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { handleChat } from "@/lib/services/chatService";
import type { ChatMessageInput } from "@/lib/services/chatService";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages: ChatMessageInput[] = body.messages || [];

    const result = await handleChat({ messages });

    if (!result.success) {
      return NextResponse.json(
        { success: false, reply: result.reply },
        { status: messages.length === 0 ? 400 : 500 }
      );
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { success: false, reply: "Request parsing failed." },
      { status: 400 }
    );
  }
}
