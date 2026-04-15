// ─────────────────────────────────────────────────────────────
// Chat Service — Core business logic for staff chat
//
// Owns: prompt assembly, OpenAI call, output normalization,
//       FAQ injection, and structured response guarantees.
//
// Railway extraction: move this file + openai.ts + configStore
// + faqEngine.ts into a standalone Express/Fastify service.
// ─────────────────────────────────────────────────────────────

import { getConfig } from "@/lib/configStore";
import { getRelevantFaqEntries } from "@/lib/faqEngine";
import { openai } from "@/lib/openai";
import type { FaqItem } from "@/types/config";

/* ── Public types ────────────────────────────────────────── */

export interface ChatServiceRequest {
  messages: ChatMessageInput[];
}

export interface ChatMessageInput {
  role: "user" | "assistant";
  content: string;
}

export interface ChatServiceResponse {
  success: boolean;
  reply: string;
  faqUsed: string[];
}

export interface DecisionOutput {
  recommendedDirection: string;
  whyItFits: string;
  staffScript: string;
  nextQuestion: string;
  upsell: string;
  risk: string;
  businessValue: string;
}

/* ── Constants ───────────────────────────────────────────── */

const REQUIRED_SECTIONS = [
  "Recommended Direction:",
  "Why It Fits:",
  "Staff Script:",
  "Next Question to Ask:",
  "Upsell / Alternative:",
  "Risk to Avoid:",
  "Business Value:",
] as const;

const FALLBACK_REPLY = `Recommended Direction:
Use a safe premium recommendation.

Why It Fits:
This keeps the response helpful even when the service is unavailable.

Staff Script:
I can guide the decision logic, but I'm unable to generate a live response right now.

Next Question to Ask:
Would you like to continue with a gift-safe or classic direction?

Upsell / Alternative:
Offer a complementary category.

Risk to Avoid:
Avoid giving unverified inventory or pricing details.

Business Value:
Maintains response quality and staff consistency.`;

const FALLBACK_RAW = `Recommended Direction:
Provide a premium retail recommendation.

Why It Fits:
This aligns with the customer need.

Staff Script:
I'd be happy to guide you toward something elegant and suitable.

Next Question to Ask:
Is this for gifting or personal use?

Upsell / Alternative:
Offer a matching complementary item.

Risk to Avoid:
Avoid overcommitting before confirming preferences.

Business Value:
Supports consistency and better conversion.`;

/* ── Core service function ───────────────────────────────── */

export async function handleChat(
  req: ChatServiceRequest
): Promise<ChatServiceResponse> {
  const { messages } = req;

  if (!messages || messages.length === 0) {
    return { success: false, reply: "No messages provided.", faqUsed: [] };
  }

  const latestUserMessage =
    [...messages].reverse().find((m) => m.role === "user")?.content || "";

  const config = getConfig();
  const relevantFaq: FaqItem[] = getRelevantFaqEntries(latestUserMessage, 3);

  const faqContext = relevantFaq.length
    ? relevantFaq
        .map(
          (item, index) =>
            `FAQ ${index + 1}\nQ: ${item.question}\nA: ${item.answer}`
        )
        .join("\n\n")
    : "No directly matched FAQ entries.";

  const developerPrompt = buildDeveloperPrompt(
    config.systemInstruction,
    faqContext
  );

  try {
    const response = await openai.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      input: [
        { role: "developer" as const, content: developerPrompt },
        ...messages.map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      ],
    });

    const rawText = response.output_text || FALLBACK_RAW;
    const structuredText = normalizeStructuredOutput(rawText);

    return {
      success: true,
      reply: structuredText,
      faqUsed: relevantFaq.map((f) => f.question),
    };
  } catch {
    return { success: false, reply: FALLBACK_REPLY, faqUsed: [] };
  }
}

/* ── Parse structured response into typed object ─────────── */

export function parseDecisionOutput(text: string): DecisionOutput {
  return {
    recommendedDirection: extractSection(text, "Recommended Direction"),
    whyItFits: extractSection(text, "Why It Fits"),
    staffScript: extractSection(text, "Staff Script"),
    nextQuestion: extractSection(text, "Next Question to Ask"),
    upsell: extractSection(text, "Upsell / Alternative"),
    risk: extractSection(text, "Risk to Avoid"),
    businessValue: extractSection(text, "Business Value"),
  };
}

/* ── Internal helpers ────────────────────────────────────── */

function buildDeveloperPrompt(
  systemInstruction: string,
  faqContext: string
): string {
  return `
${systemInstruction}

RELEVANT FAQ / KNOWLEDGE
${faqContext}

IMPORTANT
Return the answer in this exact structure:

Recommended Direction:
Why It Fits:
Staff Script:
Next Question to Ask:
Upsell / Alternative:
Risk to Avoid:
Business Value:
`.trim();
}

function normalizeStructuredOutput(text: string): string {
  const hasAllSections = REQUIRED_SECTIONS.every((section) =>
    text.includes(section)
  );
  if (hasAllSections) return text;

  return `Recommended Direction:
${extractFallbackValue(text, "recommendedDirection") || "Provide a premium, context-aware recommendation based on occasion, budget, and style."}

Why It Fits:
${extractFallbackValue(text, "whyItFits") || "This direction balances customer intent, elegance, and retail practicality."}

Staff Script:
${extractFallbackValue(text, "staffScript") || "Based on what you're looking for, I'd suggest something elegant and versatile. May I ask whether this is for a special occasion, daily use, or gifting?"}

Next Question to Ask:
${extractFallbackValue(text, "nextQuestion") || "Is this for a gift, and would you prefer a classic or more modern direction?"}

Upsell / Alternative:
${extractFallbackValue(text, "upsell") || "Offer a complementary accessory or a more gift-safe alternative."}

Risk to Avoid:
${extractFallbackValue(text, "risk") || "Avoid recommending anything too bold too early without confirming the customer's comfort level."}

Business Value:
${extractFallbackValue(text, "businessValue") || "Improves consistency, supports conversion, and gives staff a clearer next step."}`;
}

function extractFallbackValue(text: string, key: string): string | null {
  const patterns: Record<string, RegExp> = {
    recommendedDirection:
      /Recommended Direction:\s*([\s\S]*?)(?=\n(?:Why It Fits:|$))/i,
    whyItFits: /Why It Fits:\s*([\s\S]*?)(?=\n(?:Staff Script:|$))/i,
    staffScript:
      /Staff Script:\s*([\s\S]*?)(?=\n(?:Next Question to Ask:|$))/i,
    nextQuestion:
      /Next Question to Ask:\s*([\s\S]*?)(?=\n(?:Upsell \/ Alternative:|$))/i,
    upsell:
      /Upsell \/ Alternative:\s*([\s\S]*?)(?=\n(?:Risk to Avoid:|$))/i,
    risk: /Risk to Avoid:\s*([\s\S]*?)(?=\n(?:Business Value:|$))/i,
    businessValue: /Business Value:\s*([\s\S]*?)$/i,
  };
  const match = text.match(patterns[key]);
  return match?.[1]?.trim() || null;
}

function extractSection(text: string, label: string): string {
  const regex = new RegExp(
    `${label.replace(/[/]/g, "\\/")}:\\s*([\\s\\S]*?)(?=\\n[A-Z][A-Za-z /]+:|$)`,
    "i"
  );
  return text.match(regex)?.[1]?.trim() || "—";
}
