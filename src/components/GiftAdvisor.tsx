"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Gift,
  Search,
  Loader2,
  AlertTriangle,
  Star,
  Sparkles,
  Shield,
  MessageCircle,
  HelpCircle,
} from "lucide-react";
import SectionCard from "./SectionCard";
import type { GiftRequest, GiftResult, GiftOption } from "@/types/simulation";

const OPTIONS = {
  occasion: [
    "Eid al-Fitr",
    "Eid al-Adha",
    "Birthday",
    "Wedding Anniversary",
    "Corporate Gift",
    "Thank You",
    "Graduation",
    "Ramadan",
    "Mother's Day",
    "National Day",
  ],
  recipient: [
    "Wife",
    "Husband",
    "Mother",
    "Father",
    "Sister",
    "Business Partner",
    "Female Friend",
    "Male Friend",
    "Manager / Boss",
    "Client",
  ],
  budget: [
    "Under 50 KWD",
    "50-100 KWD",
    "100-200 KWD",
    "200-500 KWD",
    "500-1000 KWD",
    "1000+ KWD",
  ],
  style: [
    "Elegant & Understated",
    "Modern & Trendy",
    "Classic & Timeless",
    "Bold & Statement",
    "Minimalist",
    "Luxurious",
  ],
  market: ["Kuwait", "UAE", "Saudi Arabia", "GCC"],
};

function GiftOptionCard({
  option,
  label,
  icon: Icon,
  accent = false,
}: {
  option: GiftOption;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        accent
          ? "border-[#B8954B]/20 bg-white gold-glow"
          : "border-[#E8E0D2] bg-white"
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon
          className={`h-4 w-4 ${accent ? "text-[#B8954B]" : "text-[#6B6B6B]"}`}
        />
        <span
          className={`text-xs font-semibold uppercase tracking-wider ${
            accent ? "text-[#B8954B]" : "text-[#6B6B6B]"
          }`}
        >
          {label}
        </span>
      </div>
      <p className="text-sm font-medium text-[#1F1F1F] mb-1">
        {option.suggestion}
      </p>
      <p className="text-xs text-[#6B6B6B] mb-2">{option.category}</p>
      <p className="text-xs text-[#B8954B] font-medium mb-2">
        {option.priceRange}
      </p>
      <p className="text-xs text-[#6B6B6B] leading-relaxed">{option.reasoning}</p>
    </div>
  );
}

export default function GiftAdvisor() {
  const [form, setForm] = useState<GiftRequest>({
    occasion: "Eid al-Fitr",
    recipient: "Wife",
    budget: "100-200 KWD",
    style: "Elegant & Understated",
    market: "Kuwait",
  });
  const [result, setResult] = useState<GiftResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateField = useCallback(
    (field: keyof GiftRequest, value: string) => {
      setForm((prev) => ({ ...prev, [field]: value }));
      setResult(null);
      setError(null);
    },
    []
  );

  const getAdvice = useCallback(async () => {
    setIsLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch("/api/gift", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Advisor failed");
      setResult(data as GiftResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Advisor failed");
    } finally {
      setIsLoading(false);
    }
  }, [form]);

  return (
    <div className="space-y-6">
      {/* Input form */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {(Object.keys(OPTIONS) as (keyof typeof OPTIONS)[]).map((field) => (
          <div
            key={field}
            className="rounded-2xl border border-[#E8E0D2] bg-white p-4"
          >
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B6B6B] mb-2">
              {field}
            </label>
            <select
              value={form[field]}
              onChange={(e) => updateField(field, e.target.value)}
              className="w-full rounded-xl border border-[#E8E0D2] bg-[#F8F5EF] px-3 py-2.5 text-sm text-[#1F1F1F] focus:border-[#B8954B]/40 focus:outline-none transition-colors"
            >
              {OPTIONS[field].map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {/* Submit */}
      <div className="flex justify-center">
        <button
          onClick={getAdvice}
          disabled={isLoading}
          className="flex items-center gap-2.5 rounded-xl border border-[#B8954B]/30 bg-gradient-to-r from-[#B8954B]/8 to-[#A07F3E]/8 px-8 py-3 text-sm font-semibold text-[#B8954B] transition-all hover:from-[#B8954B]/15 hover:to-[#A07F3E]/15 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating Guidance...
            </>
          ) : (
            <>
              <Search className="h-4 w-4" />
              Get Clienteling Guidance
            </>
          )}
        </button>
      </div>

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
            {/* Three options */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <GiftOptionCard
                option={result.classicOption}
                label="Classic Option"
                icon={Star}
                accent
              />
              <GiftOptionCard
                option={result.modernOption}
                label="Modern Option"
                icon={Sparkles}
              />
              <GiftOptionCard
                option={result.statementOption}
                label="Statement Option"
                icon={Gift}
              />
            </div>

            {/* Safe recommendation */}
            <SectionCard icon={Shield} title="Safe Recommendation" accent>
              <p className="text-sm text-[#1F1F1F] leading-relaxed">
                {result.safeRecommendation}
              </p>
            </SectionCard>

            {/* Staff talking points */}
            <SectionCard icon={MessageCircle} title="Staff Talking Points">
              <ul className="space-y-2">
                {result.staffTalkingPoints.map((point, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-[#1F1F1F]"
                  >
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#B8954B] shrink-0" />
                    {point}
                  </li>
                ))}
              </ul>
            </SectionCard>

            {/* Risk + next question */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-2xl border border-[#B85C38]/12 bg-white p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-[#B85C38]" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#B85C38]">
                    Risk to Avoid
                  </span>
                </div>
                <p className="text-sm text-[#1F1F1F]">{result.riskToAvoid}</p>
              </div>
              <div className="rounded-2xl border border-[#5A7B9C]/12 bg-white p-4">
                <div className="flex items-center gap-2 mb-2">
                  <HelpCircle className="h-4 w-4 text-[#5A7B9C]" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#5A7B9C]">
                    Next Question to Ask
                  </span>
                </div>
                <p className="text-sm text-[#1F1F1F]">
                  {result.nextQuestionToAsk}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
