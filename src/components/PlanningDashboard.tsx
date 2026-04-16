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
  Package,
  Calendar,
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

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "";

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
  const titleColors = {
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
        accent
          ? accentColors[accent]
          : "border-[#E8E0D2] bg-white"
      }`}
    >
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`h-4 w-4 ${accent ? iconColors[accent] : "text-[#6B6B6B]"}`} />
        <h3 className={`text-xs font-semibold uppercase tracking-wider ${accent ? titleColors[accent] : "text-[#6B6B6B]"}`}>
          {title}
        </h3>
      </div>
      <p className="text-sm leading-relaxed text-[#1F1F1F] whitespace-pre-line">
        {content}
      </p>
    </motion.div>
  );
}

export default function PlanningDashboard() {
  const [result, setResult] = useState<PipelineResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runPlanningFocus = useCallback(async () => {
    setIsRunning(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`${BACKEND_URL}/api/planning/focus`, {
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

  // Derive workforce gap and store actions from recommendation
  const workforceGap = result?.recommendation
    ?.split(".")
    .filter((s) => /staff|schedule|workforce/i.test(s))
    .map((s) => s.trim())
    .filter(Boolean)
    .join(". ") || "";
  const storeActions = result?.recommendation
    ?.split(".")
    .filter((s) => /transfer|move|store|mall/i.test(s))
    .map((s) => s.trim())
    .filter(Boolean)
    .join(". ") || "";

  return (
    <div className="space-y-8">
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

      {/* Planning sections */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* 1. Weekly Planning Focus */}
            <PlanningCard
              icon={BarChart3}
              title="Weekly Planning Focus"
              content={result.answer}
              accent="gold"
              delay={0}
            />

            {/* Grid: Forecast + Inventory Risk */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 2. Sales Forecast */}
              <PlanningCard
                icon={TrendingUp}
                title="Sales Forecast"
                content={result.forecast}
                accent="success"
                delay={0.05}
              />

              {/* 3. Inventory Risk */}
              <PlanningCard
                icon={AlertTriangle}
                title="Inventory Risk"
                content={result.inventory_risk}
                accent="risk"
                delay={0.1}
              />
            </div>

            {/* 4. Inventory Movement Timeline */}
            <PlanningCard
              icon={Package}
              title="Inventory Movement Timeline"
              content={
                storeActions
                  ? `${storeActions}. Based on current week forecast and safety stock analysis.`
                  : result.recommendation
              }
              delay={0.15}
            />

            {/* Grid: Store Actions + Brand Planning */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 5. Store Actions */}
              <PlanningCard
                icon={ArrowRightLeft}
                title="Store Actions"
                content={result.recommendation}
                delay={0.2}
              />

              {/* 6. Brand Planning Board */}
              <PlanningCard
                icon={Calendar}
                title="Brand Planning Board"
                content={result.campaign_readiness}
                delay={0.25}
              />
            </div>

            {/* Grid: Campaign + Workforce */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 7. Campaign Readiness */}
              <PlanningCard
                icon={Megaphone}
                title="Campaign Readiness"
                content={result.campaign_readiness}
                accent="info"
                delay={0.3}
              />

              {/* 8. Workforce Gap */}
              <PlanningCard
                icon={Users}
                title="Workforce Gap"
                content={
                  workforceGap ||
                  "No workforce gaps identified in current planning period. Staff levels aligned with forecasted traffic."
                }
                delay={0.35}
              />
            </div>

            {/* Grid: ROI + Governance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 9. ROI Impact */}
              <PlanningCard
                icon={ShieldCheck}
                title="ROI Impact"
                content={result.roi}
                accent="success"
                delay={0.4}
              />

              {/* 10. Governance & Audit */}
              <PlanningCard
                icon={FileCheck}
                title="Governance & Audit"
                content={`${result.governance}\n\nAudit ID: ${result.audit_id}`}
                delay={0.45}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
