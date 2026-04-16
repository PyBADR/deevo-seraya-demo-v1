"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3,
  FileText,
  Loader2,
  AlertTriangle,
  TrendingUp,
  Users,
  Gift,
  Megaphone,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import SectionCard from "./SectionCard";
import type { BriefResult } from "@/types/simulation";

const BRIEF_PRESETS = [
  {
    label: "Eid Readiness Check",
    situation:
      "Eid al-Fitr is in 10 days. We need to assess campaign readiness, gifting demand signals, and staff preparedness across our Kuwait stores.",
  },
  {
    label: "VIP Attrition Alert",
    situation:
      "Four top-tier VIP clients have not visited in over 45 days, which is 2x their typical cadence. Combined annual spend is approximately 15,000 KWD. We need to decide on immediate retention intervention.",
  },
  {
    label: "New Category Launch",
    situation:
      "We are launching a premium fragrance collection next month. Staff knowledge is low, no training has been scheduled, and we need a go-to-market readiness assessment for Kuwait and UAE.",
  },
  {
    label: "Ramadan Campaign Debrief",
    situation:
      "Our Ramadan campaign just ended. Initial signals suggest foot traffic was up 28% but conversion dropped 3%. We need an executive debrief with recommended actions for next year's planning.",
  },
];

export default function ManagementBrief() {
  const [situation, setSituation] = useState("");
  const [context, setContext] = useState("");
  const [result, setResult] = useState<BriefResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateBrief = useCallback(async () => {
    if (!situation.trim()) return;
    setIsLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch("/api/management-brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ situation, context }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Brief generation failed");
      setResult(data as BriefResult);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Brief generation failed"
      );
    } finally {
      setIsLoading(false);
    }
  }, [situation, context]);

  return (
    <div className="space-y-6">
      {/* Presets */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-[#6b6560] mb-3">
          Brief Templates
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {BRIEF_PRESETS.map((preset) => (
            <button
              key={preset.label}
              onClick={() => {
                setSituation(preset.situation);
                setResult(null);
                setError(null);
              }}
              className="rounded-xl border border-[#e8e4dc] bg-white px-4 py-3 text-left hover:border-[#ddd8d0] transition-all"
            >
              <span className="text-xs font-medium text-[#b09560]">
                {preset.label}
              </span>
              <p className="mt-1 text-[11px] text-[#9a958e] line-clamp-2">
                {preset.situation}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="rounded-2xl border border-[#e8e4dc] bg-white p-5 space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#6b6560] mb-2">
            Situation
          </label>
          <textarea
            value={situation}
            onChange={(e) => setSituation(e.target.value)}
            rows={3}
            placeholder="Describe the business situation requiring an executive brief..."
            className="w-full rounded-xl border border-[#e8e4dc] bg-[#faf8f4] px-4 py-3 text-sm text-[#2d2d2d] placeholder-[#9a958e] focus:border-[#b09560]/40 focus:outline-none resize-y transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#6b6560] mb-2">
            Additional Context{" "}
            <span className="text-[#9a958e]">(optional)</span>
          </label>
          <input
            type="text"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="Any relevant data points, constraints, or prior decisions..."
            className="w-full rounded-xl border border-[#e8e4dc] bg-[#faf8f4] px-4 py-2.5 text-sm text-[#2d2d2d] placeholder-[#9a958e] focus:border-[#b09560]/40 focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Generate */}
      <div className="flex justify-center">
        <button
          onClick={generateBrief}
          disabled={isLoading || !situation.trim()}
          className="flex items-center gap-2.5 rounded-xl border border-[#b09560]/30 bg-gradient-to-r from-[#b09560]/8 to-[#9a8050]/8 px-8 py-3 text-sm font-semibold text-[#b09560] transition-all hover:from-[#b09560]/15 hover:to-[#9a8050]/15 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating Brief...
            </>
          ) : (
            <>
              <FileText className="h-4 w-4" />
              Generate Executive Brief
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-[#c45040]/15 bg-[#c45040]/5 px-4 py-3">
          <AlertTriangle className="h-4 w-4 text-[#c45040]" />
          <p className="text-xs text-[#c45040]">{error}</p>
        </div>
      )}

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-4"
          >
            {/* Executive card */}
            <SectionCard icon={BarChart3} title="Executive Brief" accent>
              <div className="space-y-4">
                <div>
                  <p className="text-xs uppercase tracking-wider text-[#9a958e] mb-1">
                    Situation
                  </p>
                  <p className="text-sm text-[#2d2d2d] font-medium">
                    {result.situation}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-[#9a958e] mb-1">
                    Business Implication
                  </p>
                  <p className="text-sm text-[#4a4540]">
                    {result.businessImplication}
                  </p>
                </div>
                <div className="rounded-xl bg-[#b09560]/5 border border-[#b09560]/12 px-4 py-3">
                  <p className="text-xs uppercase tracking-wider text-[#b09560] mb-1">
                    Recommended Decision
                  </p>
                  <p className="text-sm text-[#2d2d2d] font-medium">
                    {result.recommendedDecision}
                  </p>
                </div>
                <div className="rounded-xl bg-[#c45040]/4 border border-[#c45040]/12 px-4 py-3">
                  <p className="text-xs uppercase tracking-wider text-[#c45040] mb-1">
                    Operational Risk
                  </p>
                  <p className="text-sm text-[#4a4540]">
                    {result.operationalRisk}
                  </p>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-[#faf8f4] border border-[#e8e4dc] px-4 py-3">
                  <ArrowRight className="h-4 w-4 text-[#b09560] shrink-0" />
                  <div>
                    <p className="text-xs uppercase tracking-wider text-[#9a958e] mb-0.5">
                      Next Step
                    </p>
                    <p className="text-sm text-[#2d2d2d]">{result.nextStep}</p>
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* Intelligence signals */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <SectionCard icon={TrendingUp} title="Customer Intents">
                <ul className="space-y-1.5">
                  {result.topCustomerIntents.map((intent, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-[#4a4540]"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#3d8b5f] shrink-0" />
                      {intent}
                    </li>
                  ))}
                </ul>
              </SectionCard>

              <SectionCard icon={Gift} title="Gift Demand Signals">
                <ul className="space-y-1.5">
                  {result.giftDemandSignals.map((signal, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-[#4a4540]"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#b09560] shrink-0" />
                      {signal}
                    </li>
                  ))}
                </ul>
              </SectionCard>

              <SectionCard icon={Users} title="Staff Knowledge Gaps">
                <ul className="space-y-1.5">
                  {result.staffKnowledgeGaps.map((gap, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-[#4a4540]"
                    >
                      <AlertCircle className="h-3 w-3 mt-0.5 shrink-0 text-[#c48a2a]" />
                      {gap}
                    </li>
                  ))}
                </ul>
              </SectionCard>

              <SectionCard icon={Megaphone} title="Campaign Readiness">
                <p className="text-sm text-[#4a4540] leading-relaxed">
                  {result.campaignReadiness}
                </p>
                <div className="mt-3 rounded-xl bg-[#faf8f4] border border-[#e8e4dc] px-3 py-2">
                  <p className="text-xs text-[#9a958e]">Recommended Next Action</p>
                  <p className="text-sm text-[#b09560]">
                    {result.recommendedNextAction}
                  </p>
                </div>
              </SectionCard>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
