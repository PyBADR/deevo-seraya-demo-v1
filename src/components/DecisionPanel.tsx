"use client";

// ─────────────────────────────────────────────────────────────
// DecisionPanel — Parses Seraya's structured 7-part output
// into individual planning-styled cards.
// ─────────────────────────────────────────────────────────────

type DecisionSections = {
  recommendedDirection: string;
  whyItFits: string;
  staffScript: string;
  nextQuestion: string;
  upsell: string;
  risk: string;
  businessValue: string;
};

function parseStructuredResponse(text: string): DecisionSections {
  const getSection = (label: string) => {
    const regex = new RegExp(
      `${label}:\\s*([\\s\\S]*?)(?=\\n[A-Z][A-Za-z /]+:|$)`,
      "i"
    );
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

type Props = {
  responseText: string;
};

function PanelCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-[#e8e4dc] bg-[#faf8f4] p-4">
      <div className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-[#b09560]">
        {title}
      </div>
      <div className="text-sm leading-6 text-[#4a4540] whitespace-pre-wrap">
        {value}
      </div>
    </div>
  );
}

export default function DecisionPanel({ responseText }: Props) {
  const parsed = parseStructuredResponse(responseText);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[#b09560]/15 bg-gradient-to-br from-[#b09560]/5 to-[#faf8f4] p-5">
        <div className="text-xs uppercase tracking-[0.2em] text-[#b09560]">
          Decision View
        </div>
        <div className="mt-2 text-lg font-semibold text-[#2d2d2d]">
          Structured Planning Guidance
        </div>
        <div className="mt-1 text-sm text-[#6b6560]">
          Translates a copilot response into actionable planning decisions.
        </div>
      </div>

      <PanelCard
        title="Recommended Direction"
        value={parsed.recommendedDirection}
      />
      <PanelCard title="Why It Fits" value={parsed.whyItFits} />
      <PanelCard title="Staff Script" value={parsed.staffScript} />
      <PanelCard title="Next Question to Ask" value={parsed.nextQuestion} />
      <PanelCard title="Upsell / Alternative" value={parsed.upsell} />
      <PanelCard title="Risk to Avoid" value={parsed.risk} />
      <PanelCard title="Business Value" value={parsed.businessValue} />
    </div>
  );
}
