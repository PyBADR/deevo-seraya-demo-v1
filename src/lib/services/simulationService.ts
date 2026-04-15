// ─────────────────────────────────────────────────────────────
// Simulation Service — Core business logic for scenario simulator
//
// Owns: prompt assembly, OpenAI call, JSON parsing,
//       and safe fallback on parse failure.
//
// Railway extraction: move with openai.ts + configStore +
// simulationEngine.ts into standalone service.
// ─────────────────────────────────────────────────────────────

import { openai } from "@/lib/openai";
import { buildSimulationPrompt } from "@/lib/simulationEngine";
import type { SimulationRequest, SimulationResult } from "@/types/simulation";

/* ── Public types ────────────────────────────────────────── */

export interface SimulationServiceResponse {
  success: boolean;
  data: SimulationResult | null;
  error?: string;
}

/* ── Fallback ────────────────────────────────────────────── */

const FALLBACK_SIMULATION: SimulationResult = {
  customerIntent: "Customer is browsing with moderate purchase intent.",
  likelyObjections: [
    "Price concern relative to perceived value",
    "Uncertainty about sizing or style fit",
    "Need to compare with other options",
  ],
  bestCategoryAngle: "Premium accessories — versatile and lower commitment.",
  recommendedStaffApproach:
    "Warm greeting, open question about occasion, then guided recommendation.",
  messageDirection:
    "Focus on quality and occasion-appropriateness rather than price.",
  riskToAvoid:
    "Avoid pushing high-ticket items before establishing customer comfort.",
  confidence: 0.7,
  assumptions: [
    "Customer is in-store with browsing intent",
    "Market is Kuwait or GCC",
    "Staff member has moderate product knowledge",
  ],
};

/* ── Core service function ───────────────────────────────── */

export async function handleSimulation(
  req: SimulationRequest
): Promise<SimulationServiceResponse> {
  if (!req.occasion || !req.market) {
    return {
      success: false,
      data: null,
      error: "occasion and market are required",
    };
  }

  try {
    const { system, user } = buildSimulationPrompt(req);

    const response = await openai.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      input: [
        { role: "developer" as const, content: system },
        { role: "user" as const, content: user },
      ],
    });

    const raw = response.output_text || "{}";
    const result = parseSimulationJSON(raw);

    return { success: true, data: result };
  } catch {
    return {
      success: false,
      data: FALLBACK_SIMULATION,
      error: "Simulation failed — using fallback response.",
    };
  }
}

/* ── Internal helpers ────────────────────────────────────── */

function parseSimulationJSON(raw: string): SimulationResult {
  try {
    const cleaned = raw
      .replace(/```json?\n?/g, "")
      .replace(/```/g, "")
      .trim();
    const parsed = JSON.parse(cleaned) as SimulationResult;

    if (!parsed.customerIntent || !parsed.recommendedStaffApproach) {
      return FALLBACK_SIMULATION;
    }

    return parsed;
  } catch {
    return FALLBACK_SIMULATION;
  }
}
