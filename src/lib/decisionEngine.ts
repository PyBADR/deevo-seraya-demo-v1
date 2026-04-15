// ─────────────────────────────────────────────────────────────
// Seraya Decision Engine — Mock inference layer
// Simulates AI decision-making for retail staff guidance.
// ─────────────────────────────────────────────────────────────

import type { SimulatorScenario, SimOutcome } from "@/data/serayaMock";

/**
 * Simulates a typing delay for the chat interface.
 * Returns a promise that resolves after a pseudo-random delay.
 */
export function simulateThinking(minMs = 800, maxMs = 2200): Promise<void> {
  const delay = Math.floor(Math.random() * (maxMs - minMs)) + minMs;
  return new Promise((resolve) => setTimeout(resolve, delay));
}

/**
 * Scores a scenario outcome match against user-selected variables.
 * Uses a simple distance heuristic — not ML, just weighted matching.
 */
export function findBestOutcome(
  scenario: SimulatorScenario,
  selections: Record<string, string | number>
): SimOutcome {
  if (scenario.outcomes.length === 0) {
    throw new Error(`No outcomes defined for scenario ${scenario.id}`);
  }

  let bestScore = -1;
  let bestOutcome = scenario.outcomes[0];

  for (const outcome of scenario.outcomes) {
    let score = 0;
    const conditionKeys = Object.keys(outcome.condition);

    for (const key of conditionKeys) {
      const expected = outcome.condition[key];
      const actual = selections[key];

      if (actual === undefined) continue;

      if (typeof expected === "number" && typeof actual === "number") {
        // Numeric proximity score (normalized)
        const variable = scenario.variables.find((v) => v.name === key);
        if (variable && variable.type === "range" && variable.max !== undefined && variable.min !== undefined) {
          const range = variable.max - variable.min;
          const distance = Math.abs(expected - actual) / range;
          score += 1 - distance;
        } else {
          score += expected === actual ? 1 : 0;
        }
      } else {
        // Exact match for strings
        score += String(expected) === String(actual) ? 1 : 0;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestOutcome = outcome;
    }
  }

  return bestOutcome;
}

/**
 * Generates a confidence label from a numeric score.
 */
export function confidenceLabel(score: number): {
  text: string;
  color: string;
} {
  if (score >= 0.9) return { text: "High Confidence", color: "#22c55e" };
  if (score >= 0.75) return { text: "Moderate Confidence", color: "#d4a054" };
  return { text: "Advisory — Verify", color: "#ef4444" };
}

/**
 * Formats a risk level into display properties.
 */
export function riskDisplay(level: "low" | "medium" | "high"): {
  label: string;
  color: string;
  bg: string;
} {
  switch (level) {
    case "low":
      return { label: "Low Risk", color: "#22c55e", bg: "rgba(34,197,94,0.1)" };
    case "medium":
      return { label: "Medium Risk", color: "#d4a054", bg: "rgba(212,160,84,0.1)" };
    case "high":
      return { label: "High Risk", color: "#ef4444", bg: "rgba(239,68,68,0.1)" };
  }
}

/**
 * Formats a trend direction with icon character.
 */
export function trendIcon(trend: "up" | "down" | "flat"): string {
  switch (trend) {
    case "up":
      return "↑";
    case "down":
      return "↓";
    case "flat":
      return "→";
  }
}
