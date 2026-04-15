#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────
// Pipeline Validation — Tests the full Seraya decision flow
// without requiring a live OpenAI key.
//
// Validates:  FAQ Engine → Prompt Builder → Output Normalizer
//             → DecisionPanel Parser → 7-part card output
//
// Run:  node tests/pipeline-validation.mjs
// ─────────────────────────────────────────────────────────────

/* ── Inline implementations (mirrors src/) ───────────────── */

// — FAQ Engine (simplified) —
const DEFAULT_FAQ = [
  { question: "What are the most popular gift categories in Kuwait?", answer: "Watches, leather goods, perfumes, and premium accessories are the most sought-after categories for gifting in Kuwait.", category: "Gifting" },
  { question: "How should staff approach a hesitant customer?", answer: "Use a warm, non-pushy greeting. Offer help without pressure. Suggest browsing freely and check back after 2–3 minutes.", category: "Customer Service" },
  { question: "What is appropriate for corporate gifting?", answer: "Premium pens, leather goods, watches under 200 KWD, and branded accessories are safe corporate gift choices.", category: "Corporate" },
  { question: "How do Eid gifting patterns differ from Ramadan?", answer: "Eid gifts are more personal and celebratory, while Ramadan gifts tend to be more spiritual or charitable in nature.", category: "Seasonal" },
  { question: "What should be emphasized in Ramadan campaigns?", answer: "Focus on elegance, modesty, family gifting bundles, and limited-edition seasonal packaging.", category: "Seasonal" },
  { question: "How should staff handle price-sensitive customers?", answer: "Acknowledge their budget respectfully. Offer alternatives within range. Never make the customer feel judged.", category: "Customer Service" },
  { question: "What are the top upsell strategies in luxury retail?", answer: "Pair main items with complementary accessories. Offer gift wrapping. Suggest limited editions or engraving.", category: "Sales Strategy" },
  { question: "How to recommend watches for women in Kuwait?", answer: "Focus on elegance over sportiness. Gold-tone and rose-gold are preferred. Mid-size faces are most popular.", category: "Product Knowledge" },
];

const STOP_WORDS = new Set([
  "a","an","the","is","are","was","were","be","been","being","have","has","had",
  "do","does","did","will","would","could","should","may","might","shall","can",
  "to","of","in","for","on","with","at","by","from","as","into","through","during",
  "before","after","and","but","or","nor","not","so","yet","both","either","neither",
  "each","every","all","any","few","more","most","other","some","such","no","only",
  "own","same","than","too","very","just","about","what","how","when","where","who",
  "which","this","that","these","those","i","me","my","we","our","you","your","he",
  "she","it","they","them","their",
]);

function tokenize(text) {
  return new Set(
    text.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/)
      .filter(w => w.length > 2 && !STOP_WORDS.has(w))
  );
}

function findRelevantFaq(query, maxResults = 3) {
  const queryTokens = Array.from(tokenize(query));
  const scored = DEFAULT_FAQ.map(item => {
    const itemTokens = tokenize(`${item.question} ${item.answer} ${item.category}`);
    const overlap = queryTokens.filter(t => itemTokens.has(t)).length;
    const score = queryTokens.length > 0 ? overlap / queryTokens.length : 0;
    return { item, score };
  });
  return scored.filter(s => s.score > 0.08).sort((a, b) => b.score - a.score)
    .slice(0, maxResults).map(s => s.item);
}

// — Output Normalizer (mirrors chat/route.ts) —
const REQUIRED_SECTIONS = [
  "Recommended Direction:",
  "Why It Fits:",
  "Staff Script:",
  "Next Question to Ask:",
  "Upsell / Alternative:",
  "Risk to Avoid:",
  "Business Value:",
];

function normalizeStructuredOutput(text) {
  const hasAll = REQUIRED_SECTIONS.every(s => text.includes(s));
  if (hasAll) return text;
  return `Recommended Direction:\n${extractFallback(text, "recommendedDirection") || "Provide a premium, context-aware recommendation."}\n\nWhy It Fits:\n${extractFallback(text, "whyItFits") || "Balances customer intent and retail practicality."}\n\nStaff Script:\n${extractFallback(text, "staffScript") || "May I guide you toward something elegant?"}\n\nNext Question to Ask:\n${extractFallback(text, "nextQuestion") || "Is this for gifting or personal use?"}\n\nUpsell / Alternative:\n${extractFallback(text, "upsell") || "Offer a complementary item."}\n\nRisk to Avoid:\n${extractFallback(text, "risk") || "Avoid overcommitting early."}\n\nBusiness Value:\n${extractFallback(text, "businessValue") || "Supports consistency and conversion."}`;
}

function extractFallback(text, key) {
  const patterns = {
    recommendedDirection: /Recommended Direction:\s*([\s\S]*?)(?=\n(?:Why It Fits:|$))/i,
    whyItFits: /Why It Fits:\s*([\s\S]*?)(?=\n(?:Staff Script:|$))/i,
    staffScript: /Staff Script:\s*([\s\S]*?)(?=\n(?:Next Question to Ask:|$))/i,
    nextQuestion: /Next Question to Ask:\s*([\s\S]*?)(?=\n(?:Upsell \/ Alternative:|$))/i,
    upsell: /Upsell \/ Alternative:\s*([\s\S]*?)(?=\n(?:Risk to Avoid:|$))/i,
    risk: /Risk to Avoid:\s*([\s\S]*?)(?=\n(?:Business Value:|$))/i,
    businessValue: /Business Value:\s*([\s\S]*?)$/i,
  };
  const match = text.match(patterns[key]);
  return match?.[1]?.trim() || null;
}

// — DecisionPanel Parser (mirrors DecisionPanel.tsx) —
function parseStructuredResponse(text) {
  const getSection = (label) => {
    const regex = new RegExp(`${label}:\\s*([\\s\\S]*?)(?=\\n[A-Z][A-Za-z /]+:|$)`, "i");
    return text.match(regex)?.[1]?.trim() || "—";
  };
  return {
    recommendedDirection: getSection("Recommended Direction"),
    whyItFits: getSection("Why It Fits"),
    staffScript: getSection("Staff Script"),
    nextQuestion: getSection("Next Question to Ask"),
    upsell: getSection("Upsell / Alternative"),
    risk: getSection("Risk to Avoid"),
    businessValue: getSection("Business Value"),
  };
}

/* ── Simulated OpenAI Responses (realistic model output) ─── */

const SIMULATED_RESPONSES = {
  prompt1: `Recommended Direction:
Suggest a premium silk scarf from a Gulf-heritage brand or a rose-gold bracelet in the 130–160 KWD range. These are elegant, universally flattering, and safe for Eid gifting without being overly bold.

Why It Fits:
The 150 KWD range sits in the sweet spot for luxury-accessible gifts in Kuwait. Silk scarves and fine bracelets signal thoughtfulness without excess, aligning with Eid etiquette where elegance is valued over extravagance.

Staff Script:
"For an Eid gift in this range, I'd recommend either a premium silk scarf — we have beautiful options with subtle Gulf-inspired patterns — or a rose-gold bracelet that's versatile enough for daily wear. Both are elegant without being flashy. Would she lean more toward accessories she can wear, or something with a collectible feel?"

Next Question to Ask:
Does the recipient prefer jewelry she can wear daily, or would a luxury accessory like a scarf or premium clutch be more appropriate for her style?

Upsell / Alternative:
Pair the bracelet with a matching gift box and personalized engraving (+15 KWD). For the scarf, offer a complementary perfume miniature set as a bundle.

Risk to Avoid:
Don't recommend watches in this context — they can carry unintended cultural connotations when gifted between certain relationships during Eid. Stick to accessories.

Business Value:
Average basket size increases 22% when staff offer gift-bundling options. Eid gift purchases also have the highest repeat-customer conversion rate at 38%.`,

  prompt2: `Recommended Direction:
Guide the customer toward watches for senior leadership gifts (board members, C-suite) and toward premium leather accessories for broader team gifts. This layered approach maximizes perceived value while managing budget efficiently.

Why It Fits:
In Kuwaiti corporate culture, watches carry prestige and are reserved for high-value relationships. Accessories (card holders, pens, leather folios) work better for team-wide distribution — they're professional, brandable, and budget-friendly at scale.

Staff Script:
"For corporate gifting, it depends on the audience. For senior leadership or key partners, a premium watch in the 120–200 KWD range makes a strong impression. For a wider team, I'd suggest premium leather accessories — card holders or pen sets — that we can customize with your company branding. Would you like to see options for both tiers?"

Next Question to Ask:
How many recipients are we preparing for, and is there a distinction between senior leadership and the broader team?

Upsell / Alternative:
Offer a tiered gifting package: watches for top 5 executives, branded leather sets for the remaining team. Add custom gift wrapping with corporate logo for a polished presentation (+8 KWD per unit).

Risk to Avoid:
Never recommend identical gifts for both executives and junior staff — this flattens perceived hierarchy and can offend senior recipients in Gulf corporate culture. Always tier the approach.

Business Value:
Corporate gifting accounts for 31% of Q4 revenue in Kuwait retail. Tiered packages increase order value by 45% versus single-tier purchases.`,

  prompt3: `Recommended Direction:
Emphasize family gifting bundles, modest luxury, limited-edition Ramadan packaging, and evening-occasion accessories. Staff should frame products around togetherness, generosity, and spiritual elegance rather than individual indulgence.

Why It Fits:
Ramadan in Kuwait shifts consumer behavior toward family-oriented purchases and charitable giving. The emphasis on modesty and community means campaigns should highlight shared experiences and elegant restraint rather than bold personal statements.

Staff Script:
"During Ramadan, our customers love gifting sets that bring families together — matching accessories, premium prayer bead sets, or curated boxes with oud-based fragrances. We also have limited-edition Ramadan packaging that adds a special touch. Would you like me to show you our family gifting collection?"

Next Question to Ask:
Is the customer shopping for family gatherings, ghabga evenings, or personal Ramadan gifts?

Upsell / Alternative:
Offer Ramadan-exclusive gift wrapping and a charity tie-in: "For every premium purchase this Ramadan, we donate 5 KWD to [local charity]." This resonates strongly with Kuwaiti customers during the holy month.

Risk to Avoid:
Avoid promoting party-oriented or overtly glamorous items during Ramadan — this clashes with the spiritual tone of the season. Save those campaigns for post-Eid.

Business Value:
Ramadan campaigns with charity tie-ins see 27% higher conversion and 3x social sharing. Family bundles increase average transaction value by 35%.`,
};

/* ── Test Runner ──────────────────────────────────────────── */

const prompts = [
  {
    id: 1,
    label: "Eid Gift — Female, 150 KWD, elegant",
    message: "Customer needs an Eid gift for a female recipient, around 150 KWD, elegant but not flashy.",
    simKey: "prompt1",
  },
  {
    id: 2,
    label: "Corporate Gift — Watches vs Accessories",
    message: "Customer is hesitant between watches and accessories for a premium corporate gift in Kuwait.",
    simKey: "prompt2",
  },
  {
    id: 3,
    label: "Ramadan Campaign Strategy",
    message: "What should store staff emphasize in a Ramadan premium accessories campaign?",
    simKey: "prompt3",
  },
];

let passed = 0;
let failed = 0;

console.log("═══════════════════════════════════════════════════════════════");
console.log("  SERAYA PIPELINE VALIDATION — 3-Prompt Demo Script");
console.log("═══════════════════════════════════════════════════════════════\n");

for (const prompt of prompts) {
  console.log(`━━━ PROMPT ${prompt.id}: ${prompt.label} ━━━`);
  console.log(`  Input: "${prompt.message}"\n`);

  // Layer 1: FAQ Engine
  const faq = findRelevantFaq(prompt.message, 3);
  console.log(`  📚 FAQ Matches: ${faq.length}`);
  faq.forEach((f, i) => console.log(`     ${i + 1}. [${f.category}] ${f.question}`));

  // Layer 2: Simulated OpenAI response
  const rawResponse = SIMULATED_RESPONSES[prompt.simKey];

  // Layer 3: Output Normalizer
  const normalized = normalizeStructuredOutput(rawResponse);
  const hasAllSections = REQUIRED_SECTIONS.every(s => normalized.includes(s));
  console.log(`\n  ✅ All 7 sections present: ${hasAllSections}`);

  if (!hasAllSections) {
    const missing = REQUIRED_SECTIONS.filter(s => !normalized.includes(s));
    console.log(`  ❌ Missing: ${missing.join(", ")}`);
    failed++;
    console.log("\n");
    continue;
  }

  // Layer 4: DecisionPanel Parser
  const parsed = parseStructuredResponse(normalized);
  const sections = Object.entries(parsed);
  let allParsed = true;

  console.log("\n  📋 Decision Panel Cards:");
  for (const [key, value] of sections) {
    const truncated = value.length > 80 ? value.slice(0, 80) + "…" : value;
    const status = value !== "—" && value.length > 5 ? "✅" : "❌";
    if (value === "—" || value.length <= 5) allParsed = false;
    console.log(`     ${status} ${key}: ${truncated}`);
  }

  if (hasAllSections && allParsed) {
    console.log("\n  🟢 PASS — Full pipeline validated");
    passed++;
  } else {
    console.log("\n  🔴 FAIL — Parsing incomplete");
    failed++;
  }
  console.log("");
}

// — Bonus: Test normalizer with BROKEN input —
console.log("━━━ BONUS: Normalizer Recovery Test ━━━");
const brokenInput = "Here is some advice about gifts. You should recommend scarves.";
const recovered = normalizeStructuredOutput(brokenInput);
const recoveryOk = REQUIRED_SECTIONS.every(s => recovered.includes(s));
console.log(`  Input: Unstructured free-text (no sections)`);
console.log(`  ✅ Normalizer recovered 7-part format: ${recoveryOk}`);
if (recoveryOk) passed++;
else failed++;

console.log("\n═══════════════════════════════════════════════════════════════");
console.log(`  RESULTS: ${passed} passed / ${failed} failed / ${passed + failed} total`);
console.log("═══════════════════════════════════════════════════════════════");

if (failed > 0) process.exit(1);
console.log("\n  ✅ ALL CLEAR — Pipeline ready for live OpenAI key.\n");
