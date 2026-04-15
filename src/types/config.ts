// ─────────────────────────────────────────────────────────────
// Config types — System instruction, FAQ, and admin settings
// ─────────────────────────────────────────────────────────────

export interface AppConfig {
  systemInstruction: string;
  retailTone: string;
  targetUsers: string;
  allowedCategories: string[];
  giftRules: string;
  scenarioNotes: string;
  briefStyle: string;
  modelOverride?: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface ScenarioTemplate {
  id: string;
  title: string;
  occasion: string;
  market: string;
  budgetRange: string;
  styleDirection: string;
  campaignType: string;
  customerType: string;
}
