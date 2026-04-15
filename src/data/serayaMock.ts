// ─────────────────────────────────────────────────────────────
// Seraya Retail Intelligence Co-Pilot — Mock Data Layer
// All data is synthetic. No live APIs, no real inventory.
// ─────────────────────────────────────────────────────────────

/* ── Staff Chat scenarios ─────────────────────────────────── */

export interface ChatScenario {
  id: string;
  customerName: string;
  context: string;
  staffQuery: string;
  aiResponse: string;
  confidenceScore: number;
  actionItems: string[];
  tags: string[];
}

export const chatScenarios: ChatScenario[] = [
  {
    id: "sc-001",
    customerName: "Mrs. Al-Rashid",
    context:
      "VIP Tier 1 client, 3-year purchase history. Last visit 14 days ago. Prefers Brunello Cucinelli and Loro Piana. Husband's birthday in 9 days.",
    staffQuery:
      "Mrs. Al-Rashid just walked in. She seems undecided and mentioned a special occasion. How should I approach?",
    aiResponse:
      "Greet by name. Reference her preference for Italian cashmere houses. Her husband's birthday is in 9 days — suggest the Loro Piana cashmere travel set (SKU LP-4892) or the Brunello Cucinelli weekend bag (SKU BC-2201). Offer private styling suite. Do not mention price first — lead with story and craftsmanship.",
    confidenceScore: 0.94,
    actionItems: [
      "Reserve private styling suite B",
      "Pull SKU LP-4892 and BC-2201 to suite",
      "Prepare Arabic coffee service",
      "Alert concierge for gift-wrapping standby",
    ],
    tags: ["VIP", "Gifting", "Menswear", "High-Confidence"],
  },
  {
    id: "sc-002",
    customerName: "Mr. Tanaka",
    context:
      "New client, referred by Mr. Khalid (Tier 1). First visit. Corporate gifting enquiry — 12 executive gifts for board members. Budget undisclosed.",
    staffQuery:
      "A gentleman was referred by Mr. Khalid for corporate gifts. He needs 12 items for a board. What should I recommend?",
    aiResponse:
      "Treat as prospective Tier 1 — the referral source signals high intent. Start with the Montblanc Meisterstück set (SKU MB-1102) at the mid-tier, then gauge reaction. If receptive, elevate to the Berluti leather portfolio (SKU BL-3340). For 12 units, offer a 5% courtesy on engraving. Confirm branding requirements and delivery timeline before quoting.",
    confidenceScore: 0.88,
    actionItems: [
      "Verify referral with Mr. Khalid's account manager",
      "Prepare corporate gifting lookbook",
      "Stage Montblanc and Berluti samples",
      "Schedule follow-up within 48 hours",
    ],
    tags: ["Corporate", "New Client", "Referral", "Bulk Order"],
  },
  {
    id: "sc-003",
    customerName: "Ms. Dubois",
    context:
      "Tier 2 client, predominantly jewelry purchases. Expressed dissatisfaction on last visit regarding altered delivery timeline. Sentiment: cautious.",
    staffQuery:
      "Ms. Dubois is back but she was unhappy last time about a late delivery. How do I handle this?",
    aiResponse:
      "Acknowledge the previous experience directly — do not deflect. Say: 'We understand your last experience did not meet our standard, and we have taken steps to ensure it does not recur.' Offer a complimentary leather care kit as a goodwill gesture (approved budget: SAR 800). Then transition to new arrivals in the Cartier Panthère collection she has browsed online. Confidence in recovery: high, provided acknowledgement is immediate.",
    confidenceScore: 0.91,
    actionItems: [
      "Prepare goodwill gift (leather care kit)",
      "Brief manager on recovery protocol",
      "Pull Cartier Panthère new arrivals",
      "Log interaction in CRM with sentiment flag",
    ],
    tags: ["Recovery", "Jewelry", "Service Issue", "Tier 2"],
  },
  {
    id: "sc-004",
    customerName: "Sheikh Mohammed",
    context:
      "Ultra-VIP, annual spend > SAR 2M. Prefers bespoke and limited editions. Currently abroad — assistant is in-store on his behalf.",
    staffQuery:
      "Sheikh Mohammed's assistant is here to pick up something for him. He said 'something unique, the Sheikh will know.' What do we suggest?",
    aiResponse:
      "Pull from the reserved vault collection. The Richard Mille RM 72-01 (1 of 3 allocated to GCC) aligns with his collection profile. Alternatively, the bespoke Tom Ford oud-infused leather jacket (awaiting his approval since March). Present both on the executive tray with provenance cards. Do NOT release vault items without dual authorization — escalate to store director.",
    confidenceScore: 0.82,
    actionItems: [
      "Contact store director for vault authorization",
      "Prepare provenance documentation",
      "Arrange secure transport packaging",
      "Notify Sheikh Mohammed's PA for confirmation",
    ],
    tags: ["Ultra-VIP", "Vault", "Bespoke", "Authorization Required"],
  },
  {
    id: "sc-005",
    customerName: "Dr. Patel",
    context:
      "Tier 2 client, physician. Shops quarterly, prefers understated luxury. Wife's anniversary next month. Previously purchased Hermès scarves.",
    staffQuery:
      "Dr. Patel is browsing but hasn't asked for help yet. Should I approach?",
    aiResponse:
      "Wait 90 seconds, then approach with a soft open: 'Dr. Patel, lovely to see you again. We have some new pieces I thought of you — may I show you when you are ready?' Reference the upcoming anniversary subtly only if he raises it. Suggest the Hermès Birkin 25 in Étain (SKU HM-7721) as an anniversary elevation from his usual scarf purchases. Keep tone professional — he dislikes overt salesmanship.",
    confidenceScore: 0.87,
    actionItems: [
      "Set 90-second approach timer",
      "Stage Hermès Birkin 25 Étain in viewing area",
      "Prepare anniversary gift-wrap options",
      "Note interaction style: understated, professional",
    ],
    tags: ["Tier 2", "Anniversary", "Hermès", "Soft Approach"],
  },
];

/* ── Scenario Simulator ───────────────────────────────────── */

export interface SimulatorScenario {
  id: string;
  title: string;
  description: string;
  variables: SimVariable[];
  outcomes: SimOutcome[];
}

export interface SimVariable {
  name: string;
  label: string;
  type: "select" | "range";
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
  defaultValue: string | number;
}

export interface SimOutcome {
  condition: Record<string, string | number>;
  result: string;
  impact: "positive" | "neutral" | "negative";
  revenueImpact: string;
  riskLevel: "low" | "medium" | "high";
}

export const simulatorScenarios: SimulatorScenario[] = [
  {
    id: "sim-001",
    title: "Ramadan Campaign — Extended Hours Impact",
    description:
      "Model the effect of extending store hours during Ramadan on foot traffic, staff fatigue, and conversion rates.",
    variables: [
      {
        name: "extraHours",
        label: "Extra hours per day",
        type: "range",
        min: 1,
        max: 5,
        step: 1,
        defaultValue: 2,
      },
      {
        name: "staffingModel",
        label: "Staffing model",
        type: "select",
        options: ["Split Shift", "Overtime Existing", "Temp Hires"],
        defaultValue: "Split Shift",
      },
      {
        name: "discountTier",
        label: "Promotional discount",
        type: "select",
        options: ["None", "5%", "10%", "15%"],
        defaultValue: "5%",
      },
    ],
    outcomes: [
      {
        condition: { extraHours: 2, staffingModel: "Split Shift", discountTier: "5%" },
        result:
          "Optimal balance. Foot traffic increases 34%, conversion holds at 22%. Staff satisfaction remains above 7.5/10. Projected incremental revenue: SAR 1.2M over 30 days.",
        impact: "positive",
        revenueImpact: "+SAR 1.2M",
        riskLevel: "low",
      },
      {
        condition: { extraHours: 4, staffingModel: "Overtime Existing", discountTier: "10%" },
        result:
          "High risk. Foot traffic increases 58% but conversion drops to 15% (staff fatigue). Overtime costs erode 40% of incremental revenue. Burnout risk: elevated.",
        impact: "negative",
        revenueImpact: "+SAR 480K (net after costs)",
        riskLevel: "high",
      },
      {
        condition: { extraHours: 3, staffingModel: "Temp Hires", discountTier: "None" },
        result:
          "Moderate growth. Foot traffic up 41%. Conversion at 19% (temp staff less effective on VIP clients). No margin erosion from discounts. Training cost: SAR 85K.",
        impact: "neutral",
        revenueImpact: "+SAR 890K",
        riskLevel: "medium",
      },
    ],
  },
  {
    id: "sim-002",
    title: "VIP Client Attrition — Retention Intervention",
    description:
      "Simulate the impact of proactive retention outreach on at-risk VIP clients showing declining visit frequency.",
    variables: [
      {
        name: "outreachMethod",
        label: "Outreach method",
        type: "select",
        options: [
          "Personal Call from Director",
          "Exclusive Preview Invite",
          "Curated Gift Delivery",
          "No Action",
        ],
        defaultValue: "Exclusive Preview Invite",
      },
      {
        name: "timingDays",
        label: "Days since last visit trigger",
        type: "range",
        min: 14,
        max: 90,
        step: 7,
        defaultValue: 30,
      },
      {
        name: "incentiveValue",
        label: "Incentive budget (SAR)",
        type: "range",
        min: 0,
        max: 5000,
        step: 500,
        defaultValue: 1500,
      },
    ],
    outcomes: [
      {
        condition: {
          outreachMethod: "Exclusive Preview Invite",
          timingDays: 30,
          incentiveValue: 1500,
        },
        result:
          "Recovery rate: 72%. Average reactivated client spends SAR 45K within 60 days. ROI on outreach: 28x. Recommend as standard protocol.",
        impact: "positive",
        revenueImpact: "+SAR 3.2M annually",
        riskLevel: "low",
      },
      {
        condition: { outreachMethod: "No Action", timingDays: 90, incentiveValue: 0 },
        result:
          "Attrition rate reaches 38% at 90 days. Average lifetime value lost per client: SAR 420K. Irreversible for 60% of lapsed clients. Not recommended.",
        impact: "negative",
        revenueImpact: "-SAR 8.4M annually",
        riskLevel: "high",
      },
      {
        condition: {
          outreachMethod: "Curated Gift Delivery",
          timingDays: 14,
          incentiveValue: 3000,
        },
        result:
          "Highest recovery rate: 89%. However, early trigger may feel intrusive to 15% of clients. Cost per recovery: SAR 3.4K. Best for ultra-VIP segment only.",
        impact: "neutral",
        revenueImpact: "+SAR 4.1M annually",
        riskLevel: "medium",
      },
    ],
  },
];

/* ── Gift Advisor ─────────────────────────────────────────── */

export interface GiftProfile {
  id: string;
  recipient: string;
  occasion: string;
  relationship: string;
  budget: string;
  preferences: string[];
  recommendations: GiftRecommendation[];
}

export interface GiftRecommendation {
  rank: number;
  item: string;
  brand: string;
  sku: string;
  price: string;
  reasoning: string;
  availability: "In Stock" | "Limited" | "Pre-Order";
  giftWrap: boolean;
}

export const giftProfiles: GiftProfile[] = [
  {
    id: "gp-001",
    recipient: "Husband — Executive, 45-55",
    occasion: "Birthday",
    relationship: "Spouse",
    budget: "SAR 8,000 – 15,000",
    preferences: ["Watches", "Leather goods", "Italian craftsmanship"],
    recommendations: [
      {
        rank: 1,
        item: "Cashmere Travel Set",
        brand: "Loro Piana",
        sku: "LP-4892",
        price: "SAR 12,400",
        reasoning:
          "Aligns with preference for Italian craftsmanship. Practical for his frequent travel. Exclusive colorway available in-store.",
        availability: "In Stock",
        giftWrap: true,
      },
      {
        rank: 2,
        item: "Venezia Leather Briefcase",
        brand: "Bottega Veneta",
        sku: "BV-6613",
        price: "SAR 14,200",
        reasoning:
          "Signature intrecciato weave. Executive aesthetic without overt branding. Monogramming available — 5 business days.",
        availability: "In Stock",
        giftWrap: true,
      },
      {
        rank: 3,
        item: "Meisterstück Fountain Pen Set",
        brand: "Montblanc",
        sku: "MB-1102",
        price: "SAR 8,900",
        reasoning:
          "Classic executive gift. Can be engraved. Pairs with leather notebook (add SAR 2,100 for the set).",
        availability: "In Stock",
        giftWrap: true,
      },
    ],
  },
  {
    id: "gp-002",
    recipient: "Mother — Elegant, 60+",
    occasion: "Eid al-Fitr",
    relationship: "Parent",
    budget: "SAR 5,000 – 10,000",
    preferences: ["Jewelry", "Scarves", "Fragrance"],
    recommendations: [
      {
        rank: 1,
        item: "Silk Carré 90 — Garden of Dreams",
        brand: "Hermès",
        sku: "HM-3301",
        price: "SAR 5,800",
        reasoning:
          "Elegant, culturally appropriate for Eid. New season print. Can be styled as headscarf or shawl.",
        availability: "In Stock",
        giftWrap: true,
      },
      {
        rank: 2,
        item: "Rose Gold Pearl Pendant",
        brand: "Mikimoto",
        sku: "MK-2207",
        price: "SAR 9,400",
        reasoning:
          "Timeless elegance for a mature recipient. Akoya pearls, 18K rose gold. Understated luxury that signals respect.",
        availability: "Limited",
        giftWrap: true,
      },
      {
        rank: 3,
        item: "Oud & Cashmere Fragrance Set",
        brand: "Maison Francis Kurkdjian",
        sku: "MFK-0094",
        price: "SAR 6,200",
        reasoning:
          "Regional oud preference paired with French perfumery. Gift set includes travel atomizer. Popular with this demographic.",
        availability: "In Stock",
        giftWrap: true,
      },
    ],
  },
  {
    id: "gp-003",
    recipient: "Business Partner — Male, 40s",
    occasion: "Partnership Anniversary",
    relationship: "Professional",
    budget: "SAR 3,000 – 7,000",
    preferences: ["Understated", "Masculine", "Functional"],
    recommendations: [
      {
        rank: 1,
        item: "Leather Portfolio & Card Holder Set",
        brand: "Berluti",
        sku: "BL-3340",
        price: "SAR 6,800",
        reasoning:
          "Patina leather signals sophistication without excess. Functional for daily business use. Engraving available.",
        availability: "In Stock",
        giftWrap: true,
      },
      {
        rank: 2,
        item: "Pilot Aviator Chronograph",
        brand: "IWC Schaffhausen",
        sku: "IWC-5501",
        price: "SAR 6,900",
        reasoning:
          "Professional timepiece. Not overtly luxurious — appropriate for business gifting protocol. Swiss precision signals respect.",
        availability: "Pre-Order",
        giftWrap: true,
      },
      {
        rank: 3,
        item: "Cashmere Half-Zip Sweater",
        brand: "Brunello Cucinelli",
        sku: "BC-1180",
        price: "SAR 4,200",
        reasoning:
          "Safe, universally appreciated. Italian quality. Neutral color palette works across styles.",
        availability: "In Stock",
        giftWrap: true,
      },
    ],
  },
];

/* ── Management Brief ─────────────────────────────────────── */

export interface KPI {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down" | "flat";
  period: string;
}

export interface BriefInsight {
  id: string;
  category: string;
  headline: string;
  detail: string;
  severity: "info" | "warning" | "critical" | "success";
  recommended_action: string;
}

export interface StaffPerformance {
  name: string;
  role: string;
  conversionRate: number;
  avgTransactionValue: string;
  clientSatisfaction: number;
  trend: "improving" | "stable" | "declining";
}

export const kpis: KPI[] = [
  { label: "Daily Revenue", value: "SAR 847,200", change: "+12.3%", trend: "up", period: "vs. yesterday" },
  { label: "Foot Traffic", value: "342", change: "+8.1%", trend: "up", period: "vs. last Tuesday" },
  { label: "Conversion Rate", value: "23.4%", change: "-1.2%", trend: "down", period: "vs. 7-day avg" },
  { label: "Avg. Transaction", value: "SAR 14,800", change: "+5.6%", trend: "up", period: "vs. MTD avg" },
  { label: "VIP Visits Today", value: "18", change: "+3", trend: "up", period: "vs. yesterday" },
  { label: "Return Rate", value: "2.1%", change: "-0.4%", trend: "up", period: "vs. last month" },
];

export const briefInsights: BriefInsight[] = [
  {
    id: "bi-001",
    category: "Revenue",
    headline: "Jewelry category outperforming forecast by 22%",
    detail:
      "Driven by Cartier Panthère collection launch. Three Tier-1 clients made repeat purchases within 10 days. Recommend increasing Cartier allocation by 15% for Q2.",
    severity: "success",
    recommended_action: "Submit increased allocation request to Cartier by Thursday.",
  },
  {
    id: "bi-002",
    category: "Client Risk",
    headline: "4 VIP clients flagged for attrition risk",
    detail:
      "Mrs. Chen, Mr. Al-Fahad, Dr. Singh, and Ms. Torres have not visited in 45+ days (2x their average cadence). Combined annual spend: SAR 3.8M. Immediate outreach recommended.",
    severity: "critical",
    recommended_action: "Assign personal outreach calls to senior associates by end of day.",
  },
  {
    id: "bi-003",
    category: "Operations",
    headline: "Gift wrapping queue exceeding 25-minute SLA",
    detail:
      "Average wait: 32 minutes (peak hours). Root cause: single wrapping station during Ramadan traffic surge. Customer satisfaction scores dropped 0.8 points in post-visit surveys.",
    severity: "warning",
    recommended_action: "Deploy temporary second wrapping station in the east wing.",
  },
  {
    id: "bi-004",
    category: "Inventory",
    headline: "Hermès Birkin 25 — Étain: last 2 units in GCC",
    detail:
      "Global allocation exhausted. These are the final 2 units across all GCC boutiques. Historical sell-through at this scarcity level: 48 hours. Three Tier-1 clients have this on their wish list.",
    severity: "warning",
    recommended_action: "Contact wish-list clients immediately. Reserve 1 unit for top-priority client.",
  },
  {
    id: "bi-005",
    category: "Staff",
    headline: "New associate Nora exceeding onboarding benchmarks",
    detail:
      "Week 3 performance: 19% conversion rate (benchmark: 12%). Client feedback: 9.2/10. Recommend accelerated VIP floor access and mentorship pairing with Sarah.",
    severity: "success",
    recommended_action: "Approve VIP floor access and assign Sarah as mentor.",
  },
];

export const staffPerformance: StaffPerformance[] = [
  { name: "Sarah Al-Mahmoud", role: "Senior Advisor", conversionRate: 31.2, avgTransactionValue: "SAR 22,400", clientSatisfaction: 9.6, trend: "improving" },
  { name: "James Chen", role: "Client Advisor", conversionRate: 24.8, avgTransactionValue: "SAR 16,100", clientSatisfaction: 9.1, trend: "stable" },
  { name: "Nora Hassan", role: "Junior Advisor", conversionRate: 19.0, avgTransactionValue: "SAR 11,200", clientSatisfaction: 9.2, trend: "improving" },
  { name: "Omar Rashidi", role: "Client Advisor", conversionRate: 22.1, avgTransactionValue: "SAR 18,700", clientSatisfaction: 8.4, trend: "declining" },
  { name: "Priya Sharma", role: "Senior Advisor", conversionRate: 28.5, avgTransactionValue: "SAR 20,900", clientSatisfaction: 9.3, trend: "stable" },
];
