// ─────────────────────────────────────────────────────────────
// Simulation types — Scenario Simulator + Gift Advisor
// ─────────────────────────────────────────────────────────────

export interface SimulationRequest {
  occasion: string;
  market: string;
  budgetRange: string;
  styleDirection: string;
  campaignType: string;
  customerType: string;
}

export interface SimulationResult {
  customerIntent: string;
  likelyObjections: string[];
  bestCategoryAngle: string;
  recommendedStaffApproach: string;
  messageDirection: string;
  riskToAvoid: string;
  confidence: number;
  assumptions: string[];
}

export interface GiftRequest {
  occasion: string;
  recipient: string;
  budget: string;
  style: string;
  market: string;
}

export interface GiftResult {
  classicOption: GiftOption;
  modernOption: GiftOption;
  statementOption: GiftOption;
  safeRecommendation: string;
  staffTalkingPoints: string[];
  riskToAvoid: string;
  nextQuestionToAsk: string;
}

export interface GiftOption {
  category: string;
  suggestion: string;
  priceRange: string;
  reasoning: string;
}

export interface BriefRequest {
  situation: string;
  context?: string;
}

export interface BriefResult {
  situation: string;
  businessImplication: string;
  recommendedDecision: string;
  operationalRisk: string;
  nextStep: string;
  topCustomerIntents: string[];
  giftDemandSignals: string[];
  staffKnowledgeGaps: string[];
  campaignReadiness: string;
  recommendedNextAction: string;
}
