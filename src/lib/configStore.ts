// ─────────────────────────────────────────────────────────────
// Config Store — In-memory server-side config persistence
//
// For demo purposes this uses an in-memory store. In production,
// replace with a database (PostgreSQL, Redis, etc.) or a JSON
// file on disk at the path indicated below.
//
// Persistence upgrade path:
//   1. Add a db client (e.g., Prisma, Drizzle, or pg)
//   2. Replace get/set functions with db read/write
//   3. Keep the same interface so API routes don't change
// ─────────────────────────────────────────────────────────────

import type { AppConfig, FaqItem, ScenarioTemplate } from "@/types/config";
import { defaultConfig } from "@/data/defaultConfig";
import { defaultFaq } from "@/data/defaultFaq";
import { defaultScenarios } from "@/data/defaultScenarios";

// In-memory state (survives across requests in the same process)
let currentConfig: AppConfig = { ...defaultConfig };
let currentFaq: FaqItem[] = [...defaultFaq];
let currentScenarios: ScenarioTemplate[] = [...defaultScenarios];

/* ── Config ───────────────────────────────────────────────── */

export function getConfig(): AppConfig {
  return { ...currentConfig };
}

export function updateConfig(patch: Partial<AppConfig>): AppConfig {
  currentConfig = { ...currentConfig, ...patch };
  return { ...currentConfig };
}

export function resetConfig(): AppConfig {
  currentConfig = { ...defaultConfig };
  return { ...currentConfig };
}

/* ── FAQ ──────────────────────────────────────────────────── */

export function getFaq(): FaqItem[] {
  return [...currentFaq];
}

export function setFaq(items: FaqItem[]): FaqItem[] {
  currentFaq = [...items];
  return [...currentFaq];
}

export function resetFaq(): FaqItem[] {
  currentFaq = [...defaultFaq];
  return [...currentFaq];
}

/* ── Scenarios ────────────────────────────────────────────── */

export function getScenarios(): ScenarioTemplate[] {
  return [...currentScenarios];
}

export function setScenarios(items: ScenarioTemplate[]): ScenarioTemplate[] {
  currentScenarios = [...items];
  return [...currentScenarios];
}

export function resetScenarios(): ScenarioTemplate[] {
  currentScenarios = [...defaultScenarios];
  return [...currentScenarios];
}
