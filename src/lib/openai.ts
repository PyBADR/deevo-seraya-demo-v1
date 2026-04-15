// ─────────────────────────────────────────────────────────────
// OpenAI client — server-side only
// Uses OPENAI_API_KEY from environment. Never import on client.
// ─────────────────────────────────────────────────────────────

import OpenAI from "openai";

let _client: OpenAI | null = null;

/**
 * Returns a singleton OpenAI client.
 * Throws at call time (not import time) if the key is missing,
 * so the app can still boot and show the UI without a key.
 */
export function getOpenAIClient(): OpenAI {
  if (_client) return _client;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY is not set. Add it to .env.local to enable live AI features."
    );
  }

  _client = new OpenAI({ apiKey });
  return _client;
}

/**
 * Direct client export for routes using `openai.responses.create`.
 * Lazy-initialized — same singleton as getOpenAIClient().
 */
export const openai = new Proxy({} as OpenAI, {
  get(_target, prop, receiver) {
    const client = getOpenAIClient();
    const value = Reflect.get(client, prop, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
});

/**
 * Returns the model to use, respecting overrides.
 * Priority: configOverride > OPENAI_MODEL env > default.
 */
export function getModel(configOverride?: string): string {
  return (
    configOverride ||
    process.env.OPENAI_MODEL ||
    "gpt-4.1-mini"
  );
}
