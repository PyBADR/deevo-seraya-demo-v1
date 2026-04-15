// ─────────────────────────────────────────────────────────────
// Brief Service — Core business logic for management brief
//
// Owns: prompt assembly, OpenAI call, JSON parsing,
//       and safe fallback on parse failure.
//
// Railway extraction: move with openai.ts + configStore +
// simulationEngine.ts into standalone service.
// ─────────────────────────────────────────────────────────────

import { openai } from "@/lib/openai";
import { buildBriefPrompt } from "@/lib/simulationEngine";
import type { BriefRequest, BriefResult } from "@/types/simulation";

/* ── Public types ────────────────────────────────────────── */

export interface BriefServiceResponse {
  success: boolean;
  data: BriefResult | null;
  error?: string;
}

/* ── Fallback ────────────────────────────────────────────── */

const FALLBACK_BRIEF: BriefResult = {
  situation: "Retail situation requires management attention.",
  businessImplication:
    "Without a clear directive, staff may default to inconsistent approaches.",
  recommendedDecision:
    "Issue a standardized guidance brief aligned with current seasonal priorities.",
  operationalRisk:
    "Delayed response may result in missed conversion opportunities.",
  nextStep:
    "Review the situation with regional leads and issue direction within 24 hours.",
  topCustomerIntents: [
    "Gift purchasing",
    "Seasonal browsing",
    "Premium comparison shopping",
  ],
  giftDemandSignals: [
    "Increased foot traffic in accessories",
    "Higher average basket near occasion dates",
  ],
  staffKnowledgeGaps: [
    "Limited awareness of new seasonal collections",
    "Inconsistent upsell messaging",
  ],
  campaignReadiness:
    "Moderate — core assets available but staff training incomplete.",
  recommendedNextAction:
    "Conduct a 15-minute stand-up brief with floor staff before next peak period.",
};

/* ── Core service function ───────────────────────────────── */

export async function handleBrief(
  req: BriefRequest
): Promise<BriefServiceResponse> {
  if (!req.situation) {
    return {
      success: false,
      data: null,
      error: "situation is required",
    };
  }

  try {
    const { system, user } = buildBriefPrompt(req);

    const response = await openai.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      input: [
        { role: "developer" as const, content: system },
        { role: "user" as const, content: user },
      ],
    });

    const raw = response.output_text || "{}";
    const result = parseBriefJSON(raw);

    return { success: true, data: result };
  } catch {
    return {
      success: false,
      data: FALLBACK_BRIEF,
      error: "Brief generation failed — using fallback response.",
    };
  }
}

/* ── Internal helpers ────────────────────────────────────── */

function parseBriefJSON(raw: string): BriefResult {
  try {
    const cleaned = raw
      .replace(/```json?\n?/g, "")
      .replace(/```/g, "")
      .trim();
    const parsed = JSON.parse(cleaned) as BriefResult;

    if (!parsed.situation || !parsed.recommendedDecision) {
      return FALLBACK_BRIEF;
    }

    return parsed;
  } catch {
    return FALLBACK_BRIEF;
  }
}
