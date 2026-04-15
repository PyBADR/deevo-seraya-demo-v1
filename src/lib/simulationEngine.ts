// ─────────────────────────────────────────────────────────────
// Simulation Engine — Builds prompts for scenario, gift, and
// management brief generation via OpenAI.
// ─────────────────────────────────────────────────────────────

import type { SimulationRequest, GiftRequest, BriefRequest } from "@/types/simulation";
import { getConfig } from "./configStore";

/**
 * Builds a system + user prompt for scenario simulation.
 */
export function buildSimulationPrompt(req: SimulationRequest): {
  system: string;
  user: string;
} {
  const config = getConfig();

  const system = `You are Seraya, a retail intelligence engine. Your task is to simulate customer behavior and staff strategy for a premium GCC retail environment.

Tone: ${config.retailTone}

Scenario modelling notes:
${config.scenarioNotes}

Respond ONLY in valid JSON with this exact structure:
{
  "customerIntent": "string",
  "likelyObjections": ["string"],
  "bestCategoryAngle": "string",
  "recommendedStaffApproach": "string",
  "messageDirection": "string",
  "riskToAvoid": "string",
  "confidence": number between 0 and 1,
  "assumptions": ["string"]
}`;

  const user = `Simulate this retail scenario:
- Occasion: ${req.occasion}
- Market: ${req.market}
- Budget Range: ${req.budgetRange}
- Style Direction: ${req.styleDirection}
- Campaign Type: ${req.campaignType}
- Customer Type: ${req.customerType}

Provide a realistic retail intelligence simulation.`;

  return { system, user };
}

/**
 * Builds a system + user prompt for gift recommendation.
 */
export function buildGiftPrompt(req: GiftRequest): {
  system: string;
  user: string;
} {
  const config = getConfig();

  const system = `You are Seraya, a retail gifting intelligence engine for premium GCC retail.

Gift recommendation rules:
${config.giftRules}

Tone: ${config.retailTone}

Respond ONLY in valid JSON with this exact structure:
{
  "classicOption": { "category": "string", "suggestion": "string", "priceRange": "string", "reasoning": "string" },
  "modernOption": { "category": "string", "suggestion": "string", "priceRange": "string", "reasoning": "string" },
  "statementOption": { "category": "string", "suggestion": "string", "priceRange": "string", "reasoning": "string" },
  "safeRecommendation": "string",
  "staffTalkingPoints": ["string"],
  "riskToAvoid": "string",
  "nextQuestionToAsk": "string"
}`;

  const user = `Recommend gifts for this situation:
- Occasion: ${req.occasion}
- Recipient: ${req.recipient}
- Budget: ${req.budget}
- Style: ${req.style}
- Market: ${req.market}

Provide culturally appropriate premium retail gift guidance.`;

  return { system, user };
}

/**
 * Builds a system + user prompt for management brief generation.
 */
export function buildBriefPrompt(req: BriefRequest): {
  system: string;
  user: string;
} {
  const config = getConfig();

  const system = `You are Seraya, generating executive management briefs for premium GCC retail leadership.

Brief style:
${config.briefStyle}

Respond ONLY in valid JSON with this exact structure:
{
  "situation": "string",
  "businessImplication": "string",
  "recommendedDecision": "string",
  "operationalRisk": "string",
  "nextStep": "string",
  "topCustomerIntents": ["string"],
  "giftDemandSignals": ["string"],
  "staffKnowledgeGaps": ["string"],
  "campaignReadiness": "string",
  "recommendedNextAction": "string"
}`;

  const user = `Generate an executive management brief for this situation:
${req.situation}
${req.context ? `\nAdditional context: ${req.context}` : ""}

Provide an actionable, concise brief for retail leadership.`;

  return { system, user };
}
