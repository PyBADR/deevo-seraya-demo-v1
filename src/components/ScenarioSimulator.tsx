"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  Play,
  AlertTriangle,
  ShieldCheck,
  Loader2,
  BookOpen,
} from "lucide-react";
import SectionCard from "./SectionCard";
import type { SimulationRequest, SimulationResult } from "@/types/simulation";
import type { ScenarioTemplate } from "@/types/config";

const FIELD_OPTIONS = {
  occasion: [
    "Eid al-Fitr",
    "Eid al-Adha",
    "Ramadan",
    "Birthday",
    "Wedding Anniversary",
    "Corporate Event",
    "Self-purchase",
    "Summer Season",
    "National Day",
  ],
  market: ["Kuwait", "UAE", "Saudi Arabia", "Bahrain", "Qatar", "Oman", "GCC"],
  budgetRange: [
    "Under 50 KWD",
    "50-150 KWD",
    "150-500 KWD",
    "500-2000 KWD",
    "2000+ KWD",
    "Variable",
  ],
  styleDirection: [
    "Elegant, understated",
    "Modern, trendy",
    "Classic, timeless",
    "Luxury, milestone",
    "Professional, premium",
    "Bold, statement",
  ],
  campaignType: [
    "Seasonal Gifting",
    "Corporate Gifting",
    "Personal Gifting",
    "New Customer Acquisition",
    "Seasonal Campaign",
    "VIP Retention",
    "E-commerce Push",
  ],
  customerType: [
    "Returning VIP",
    "Corporate Client",
    "High-Value Walk-in",
    "First-Time Visitor",
    "Online Shopper",
    "Gift Buyer",
    "Loyal Regular",
  ],
};

export default function ScenarioSimulator() {
  const [form, setForm] = useState<SimulationRequest>({
    occasion: "Eid al-Fitr",
    market: "Kuwait",
    budgetRange: "150-500 KWD",
    styleDirection: "Elegant, understated",
    campaignType: "Seasonal Gifting",
    customerType: "Returning VIP",
  });
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [templates, setTemplates] = useState<ScenarioTemplate[]>([]);

  useEffect(() => {
    import("@/data/defaultScenarios").then((mod) => {
      setTemplates(mod.defaultScenarios);
    });
  }, []);

  const updateField = useCallback(
    (field: keyof SimulationRequest, value: string) => {
      setForm((prev) => ({ ...prev, [field]: value }));
      setResult(null);
      setError(null);
    },
    []
  );

  const applyTemplate = useCallback((tpl: ScenarioTemplate) => {
    setForm({
      occasion: tpl.occasion,
      market: tpl.market,
      budgetRange: tpl.budgetRange,
      styleDirection: tpl.styleDirection,
      campaignType: tpl.campaignType,
      customerType: tpl.customerType,
    });
    setResult(null);
    setError(null);
  }, []);

  const runSimulation = useCallback(async () => {
    setIsRunning(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch("/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Forecast failed");
      setResult(data as SimulationResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Forecast failed");
    } finally {
      setIsRunning(false);
    }
  }, [form]);

  return (
    <div className="space-y-6">
      {/* Quick templates */}
      {templates.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="h-4 w-4 text-[#6B6B6B]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-[#6B6B6B]">
              Planning Cases
            </span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {templates.map((tpl) => (
              <button
                key={tpl.id}
                onClick={() => applyTemplate(tpl)}
                className="whitespace-nowrap rounded-xl border border-[#E8E0D2] bg-white px-3 py-2 text-xs text-[#6B6B6B] hover:text-[#1F1F1F] hover:border-[#DDD5C8] transition-all"
              >
                {tpl.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input fields */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(
          Object.keys(FIELD_OPTIONS) as (keyof typeof FIELD_OPTIONS)[]
        ).map((field) => (
          <div
            key={field}
            className="rounded-2xl border border-[#E8E0D2] bg-white p-4"
          >
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B6B6B] mb-2">
              {field.replace(/([A-Z])/g, " $1").trim()}
            </label>
            <select
              value={form[field]}
              onChange={(e) => updateField(field, e.target.value)}
              className="w-full rounded-xl border border-[#E8E0D2] bg-[#F8F5EF] px-3 py-2.5 text-sm text-[#1F1F1F] focus:border-[#B8954B]/40 focus:outline-none transition-colors"
            >
              {FIELD_OPTIONS[field].map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {/* Run button */}
      <div className="flex justify-center">
        <button
          onClick={runSimulation}
          disabled={isRunning}
          className="flex items-center gap-2.5 rounded-xl border border-[#B8954B]/30 bg-gradient-to-r from-[#B8954B]/8 to-[#A07F3E]/8 px-8 py-3 text-sm font-semibold text-[#B8954B] transition-all hover:from-[#B8954B]/15 hover:to-[#A07F3E]/15 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRunning ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Running Forecast...
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              Run Planning Forecast
            </>
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-[#B85C38]/15 bg-[#B85C38]/5 px-4 py-3">
          <AlertTriangle className="h-4 w-4 text-[#B85C38]" />
          <p className="text-xs text-[#B85C38]">{error}</p>
        </div>
      )}

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-4"
          >
            <SectionCard
              icon={TrendingUp}
              title="Forecast Result"
              accent
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#9A9590]">Confidence</span>
                  <span
                    className={`badge ${
                      result.confidence >= 0.8
                        ? "severity-success"
                        : result.confidence >= 0.6
                        ? "severity-warning"
                        : "severity-critical"
                    }`}
                  >
                    {Math.round(result.confidence * 100)}%
                  </span>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wider text-[#9A9590] mb-1">
                    Customer Intent
                  </p>
                  <p className="text-sm text-[#1F1F1F]">{result.customerIntent}</p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wider text-[#9A9590] mb-1">
                    Recommended Approach
                  </p>
                  <p className="text-sm text-[#1F1F1F]">
                    {result.recommendedStaffApproach}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wider text-[#9A9590] mb-1">
                    Best Category Angle
                  </p>
                  <p className="text-sm text-[#1F1F1F]">
                    {result.bestCategoryAngle}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wider text-[#9A9590] mb-1">
                    Message Direction
                  </p>
                  <p className="text-sm text-[#1F1F1F]">
                    {result.messageDirection}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-[#9A9590] mb-2">
                      Likely Objections
                    </p>
                    <ul className="space-y-1.5">
                      {result.likelyObjections.map((obj, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm text-[#1F1F1F]"
                        >
                          <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0 text-[#B8854B]" />
                          {obj}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-[#9A9590] mb-2">
                      Assumptions
                    </p>
                    <ul className="space-y-1.5">
                      {result.assumptions.map((a, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm text-[#1F1F1F]"
                        >
                          <ShieldCheck className="h-3 w-3 mt-0.5 shrink-0 text-[#5A7B9C]" />
                          {a}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="rounded-xl border border-[#B85C38]/12 bg-[#B85C38]/4 px-4 py-3">
                  <p className="text-xs uppercase tracking-wider text-[#B85C38] mb-1">
                    Risk to Avoid
                  </p>
                  <p className="text-sm text-[#1F1F1F]">{result.riskToAvoid}</p>
                </div>
              </div>
            </SectionCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
