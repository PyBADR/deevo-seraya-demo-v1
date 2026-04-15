// ─────────────────────────────────────────────────────────────
// FAQ Engine — Lightweight keyword-based FAQ retrieval
// Injects relevant FAQ snippets into the system prompt.
// ─────────────────────────────────────────────────────────────

import type { FaqItem } from "@/types/config";
import { getFaq } from "./configStore";

/**
 * Finds the most relevant FAQ items for a given user query.
 * Uses simple keyword overlap scoring — not vector search.
 * Returns top-N matches above a minimum relevance threshold.
 *
 * Exported under two names for API compatibility:
 *   - findRelevantFaq (original)
 *   - getRelevantFaqEntries (used by chat route)
 */
export function findRelevantFaq(
  query: string,
  maxResults = 4
): FaqItem[] {
  const faq = getFaq();
  const queryTokensSet = tokenize(query);
  const queryTokensArr = Array.from(queryTokensSet);

  const scored = faq.map((item) => {
    const itemTokens = tokenize(
      `${item.question} ${item.answer} ${item.category}`
    );
    const overlap = queryTokensArr.filter((t) => itemTokens.has(t)).length;
    const score = queryTokensArr.length > 0 ? overlap / queryTokensArr.length : 0;
    return { item, score };
  });

  return scored
    .filter((s) => s.score > 0.08)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
    .map((s) => s.item);
}

/** Alias used by the chat API route */
export const getRelevantFaqEntries = findRelevantFaq;

/**
 * Formats FAQ items into a string block for system prompt injection.
 */
export function formatFaqForPrompt(items: FaqItem[]): string {
  if (items.length === 0) return "";

  const lines = items.map(
    (item) =>
      `[${item.category}] Q: ${item.question}\nA: ${item.answer}`
  );

  return `\n\n--- Relevant Knowledge Base Entries ---\n${lines.join("\n\n")}`;
}

/* ── Internal helpers ─────────────────────────────────────── */

const STOP_WORDS = new Set([
  "a", "an", "the", "is", "are", "was", "were", "be", "been",
  "being", "have", "has", "had", "do", "does", "did", "will",
  "would", "could", "should", "may", "might", "shall", "can",
  "to", "of", "in", "for", "on", "with", "at", "by", "from",
  "as", "into", "through", "during", "before", "after", "and",
  "but", "or", "nor", "not", "so", "yet", "both", "either",
  "neither", "each", "every", "all", "any", "few", "more",
  "most", "other", "some", "such", "no", "only", "own", "same",
  "than", "too", "very", "just", "about", "what", "how", "when",
  "where", "who", "which", "this", "that", "these", "those",
  "i", "me", "my", "we", "our", "you", "your", "he", "she",
  "it", "they", "them", "their",
]);

function tokenize(text: string): Set<string> {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
  return new Set(words);
}
