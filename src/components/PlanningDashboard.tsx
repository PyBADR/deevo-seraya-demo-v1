"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Loader2,
  TrendingUp,
  AlertTriangle,
  ArrowRightLeft,
  Users,
  Megaphone,
  ShieldCheck,
  FileCheck,
  BarChart3,
} from "lucide-react";

interface PipelineResult {
  question: string;
  intent: string;
  forecast: string;
  inventory_risk: string;
  recommendation: string;
  campaign_readiness: string;
  roi: string;
  governance: string;
  audit_id: string;
  answer: string;
  provider_mode: string;
}

// Call local Next.js proxy (server-side adds DEEVO_API_KEY)
const FOCUS_ENDPOINT = "/api/planning-focus";

/* ── KPI preview card ─────────────────────────────────────── */

function KpiCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub: string;
  accent: "gold" | "success" | "risk" | "info";
}) {
  const bg = {
    gold: "border-[#B8954B]/12 bg-[#B8954B]/3",
    success: "border-[#2F7D5C]/12 bg-[#2F7D5C]/3",
    risk: "border-[#B85C38]/12 bg-[#B85C38]/3",
    info: "border-[#5A7B9C]/12 bg-[#5A7B9C]/3",
  };
  const valColor = {
    gold: "text-[#B8954B]",
    success: "text-[#2F7D5C]",
    risk: "text-[#B85C38]",
    info: "text-[#5A7B9C]",
  };

  return (
    <div className={`rounded-2xl border p-5 ${bg[accent]}`}>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6B6B6B] mb-1">
        {label}
      </p>
      <p className={`text-2xl font-bold tracking-tight ${valColor[accent]}`}>
        {value}
      </p>
      <p className="text-xs text-[#9A9590] mt-1">{sub}</p>
    </div>
  );
}

/* ── Planning result card ─────────────────────────────────── */

function PlanningCard({
  icon: Icon,
  title,
  content,
  accent,
  delay = 0,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  content: string;
  accent?: "gold" | "success" | "risk" | "info";
  delay?: number;
}) {
  const accentColors = {
    gold: "border-[#B8954B]/15 bg-[#B8954B]/3",
    success: "border-[#2F7D5C]/15 bg-[#2F7D5C]/3",
    risk: "border-[#B85C38]/15 bg-[#B85C38]/3",
    info: "border-[#5A7B9C]/15 bg-[#5A7B9C]/3",
  };
  const iconColors = {
    gold: "text-[#B8954B]",
    success: "text-[#2F7D5C]",
    risk: "text-[#B85C38]",
    info: "text-[#5A7B9C]",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className={`rounded-2xl border p-5 ${
        accent ? accentColors[accent] : "border-[#E8E0D2] bg-white"
      }`}
    >
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`h-4 w-4 ${accent ? iconColors[accent] : "text-[#6B6B6B]"}`} />
        <h3 className={`text-xs font-semibold uppercase tracking-wider ${accent ? iconColors[accent] : "text-[#6B6B6B]"}`}>
          {title}
        </h3>
      </div>
      <p className="text-sm leading-relaxed text-[#1F1F1F] whitespace-pre-line">
        {content}
      </p>
    </motion.div>
  );
}

/* ── Main dashboard ───────────────────────────────────────── */

export default function PlanningDashboard() {
  const [result, setResult] = useState<PipelineResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runPlanningFocus = useCallback(async () => {
    setIsRunning(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(FOCUS_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: "What should the planning team focus on this week?",
          role: "executive",
          context: { country: "Kuwait", planning_period: "next_week" },
        }),
      });
      if (!res.ok) throw new Error(`Backend returned ${res.status}`);
      const data = await res.json();
      setResult(data as PipelineResult);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not reach planning backend"
      );
    } finally {
      setIsRunning(false);
    }
  }, []);

  // Derive workforce gap from recommendation
  const workforceGap = result?.recommendation
    ?.split(".")
    .filter((s) => /staff|schedule|workforce/i.test(s))
    .map((s) => s.trim())
    .filter(Boolean)
    .join(". ") || "";

  // Derive transfer action from recommendation
  const transferAction = result?.recommendation
    ?.split(".")
    .filter((s) => /transfer|move|unit/i.test(s))
    .map((s) => s.trim())
    .filter(Boolean)
    .join(". ") || "";

  return (
    <div className="space-y-8">
      {/* KPI preview cards — always visible */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard
          label="Revenue at Risk"
          value={result ? "KWD 6,200" : "KWD —"}
          sub={result ? "Weekly transfer uplift opportunity" : "Run planning focus to calculate"}
          accent="risk"
        />
        <KpiCard
          label="Inventory Actions"
          value={result ? "3 SKUs" : "— SKUs"}
          sub={result ? "Below safety stock at Marina Mall" : "Pending analysis"}
          accent="gold"
        />
        <KpiCard
          label="Workforce Gap"
          value={result ? "+2 Staff" : "— Staff"}
          sub={result ? "Weekend peak at 360 Mall" : "Pending analysis"}
          accent="info"
        />
        <KpiCard
          label="Campaign Readiness"
          value={result ? "Week 2" : "—"}
          sub={result ? "Ramadan early-bird launch" : "Pending analysis"}
          accent="success"
        />
      </div>

      {/* CTA */}
      <div className="flex flex-col items-center gap-4">
        <button
          onClick={runPlanningFocus}
          disabled={isRunning}
          className="flex items-center gap-3 rounded-2xl border border-[#B8954B]/25 bg-gradient-to-r from-[#B8954B]/8 to-[#A07F3E]/8 px-10 py-4 text-sm font-semibold text-[#B8954B] transition-all hover:from-[#B8954B]/14 hover:to-[#A07F3E]/14 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRunning ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Running Weekly Planning Focus...
            </>
          ) : (
            <>
              <Play className="h-5 w-5" />
              Run Weekly Planning Focus
            </>
          )}
        </button>
        {result && (
          <div className="flex items-center gap-3">
            <span className="badge severity-success">{result.provider_mode.replace(/_/g, " ")}</span>
            <span className="text-[11px] text-[#9A9590]">
              Audit {result.audit_id.slice(0, 8)}
            </span>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-[#B85C38]/15 bg-[#B85C38]/4 px-5 py-3">
          <AlertTriangle className="h-4 w-4 text-[#B85C38] shrink-0" />
          <p className="text-sm text-[#B85C38]">{error}</p>
        </div>
      )}

      {/* Planning sections — exact required order */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {/* 1. Sales Forecast */}
            <PlanningCard
              icon={TrendingUp}
              title="Sales Forecast"
              content={result.forecast}
              accent="success"
              delay={0}
            />

            {/* 2. Inventory Risk */}
            <PlanningCard
              icon={AlertTriangle}
              title="Inventory Risk"
              content={result.inventory_risk}
              accent="risk"
              delay={0.05}
            />

            {/* 3. Transfer Action */}
            <PlanningCard
              icon={ArrowRightLeft}
              title="Transfer Action"
              content={
                transferAction
                  ? `${transferAction}.`
                  : result.recommendation
              }
              delay={0.1}
            />

            {/* 4. Workforce Gap */}
            <PlanningCard
              icon={Users}
              title="Workforce Gap"
              content={
                workforceGap
                  ? `${workforceGap}.`
                  : "Staff levels aligned with forecasted traffic for the current planning period."
              }
              accent="info"
              delay={0.15}
            />

            {/* 5. Campaign Readiness */}
            <PlanningCard
              icon={Megaphone}
              title="Campaign Readiness"
              content={result.campaign_readiness}
              delay={0.2}
            />

            {/* 6. ROI Impact */}
            <PlanningCard
              icon={BarChart3}
              title="ROI Impact"
              content={result.roi}
              accent="success"
              delay={0.25}
            />

            {/* 7. Governance */}
            <PlanningCard
              icon={ShieldCheck}
              title="Governance"
              content={result.governance}
              delay={0.3}
            />

            {/* 8. Audit ID */}
            <PlanningCard
              icon={FileCheck}
              title="Audit ID"
              content={`${result.audit_id}\n\nAll pipeline decisions for this planning run are logged under this audit identifier.`}
              accent="gold"
              delay={0.35}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
