// ─────────────────────────────────────────────────────────────
// Gift Service — Core business logic for gift advisor
//
// Owns: prompt assembly, OpenAI call, JSON parsing,
//       and safe fallback on parse failure.
//
// Railway extraction: move with openai.ts + configStore +
// simulationEngine.ts into standalone service.
// ─────────────────────────────────────────────────────────────

import { openai } from "@/lib/openai";
import { buildGiftPrompt } from "@/lib/simulationEngine";
import type { GiftRequest, GiftResult } from "@/types/simulation";

/* ── Public types ────────────────────────────────────────── */

export interface GiftServiceResponse {
  success: boolean;
  data: GiftResult | null;
  error?: string;
}

/* ── Fallback ────────────────────────────────────────────── */

const FALLBACK_GIFT: GiftResult = {
  classicOption: {
    category: "Accessories",
    suggestion: "Premium leather card holder with subtle branding",
    priceRange: "40–80 KWD",
    reasoning: "Safe, elegant, universally appropriate for GCC gifting.",
  },
  modernOption: {
    category: "Fragrance",
    suggestion: "Curated oud-based fragrance set",
    priceRange: "60–120 KWD",
    reasoning: "Modern yet culturally resonant in the Gulf market.",
  },
  statementOption: {
    category: "Watches",
    suggestion: "Mid-range dress watch with rose-gold tone",
    priceRange: "120–250 KWD",
    reasoning: "Makes a strong impression for milestone occasions.",
  },
  safeRecommendation:
    "When in doubt, recommend a premium leather accessory — it is always appropriate.",
  staffTalkingPoints: [
    "Ask about the occasion first",
    "Confirm the relationship to the recipient",
    "Offer gift wrapping as a value-add",
  ],
  riskToAvoid:
    "Avoid recommending items with strong personal taste dependencies without confirming preferences.",
  nextQuestionToAsk:
    "Is this gift for a close family member, a colleague, or a business partner?",
};

/* ── Core service function ───────────────────────────────── */

export async function handleGift(
  req: GiftRequest
): Promise<GiftServiceResponse> {
  if (!req.occasion || !req.recipient) {
    return {
      success: false,
      data: null,
      error: "occasion and recipient are required",
    };
  }

  try {
    const { system, user } = buildGiftPrompt(req);

    const response = await openai.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      input: [
        { role: "developer" as const, content: system },
        { role: "user" as const, content: user },
      ],
    });

    const raw = response.output_text || "{}";
    const result = parseGiftJSON(raw);

    return { success: true, data: result };
  } catch {
    return { success: false, data: FALLBACK_GIFT, error: "Gift advisor failed — using fallback response." };
  }
}

/* ── Internal helpers ────────────────────────────────────── */

function parseGiftJSON(raw: string): GiftResult {
  try {
    const cleaned = raw
      .replace(/```json?\n?/g, "")
      .replace(/```/g, "")
      .trim();
    const parsed = JSON.parse(cleaned) as GiftResult;

    // Validate required fields exist
    if (!parsed.classicOption || !parsed.modernOption || !parsed.statementOption) {
      return FALLBACK_GIFT;
    }

    return parsed;
  } catch {
    return FALLBACK_GIFT;
  }
}
