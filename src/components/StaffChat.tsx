"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Trash2,
  Loader2,
  AlertCircle,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  ArrowRightLeft,
  Users,
  Megaphone,
  BarChart3,
  ShieldCheck,
  FileCheck,
} from "lucide-react";
import ChatMessageComponent from "./ChatMessage";
import type { ChatMessage } from "@/types/chat";
import type { StarterPrompt } from "@/types/chat";

/* ── Types ───────────────────────────────────────────────── */

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

const PLANNING_FALLBACK: PipelineResult = {
  question: "",
  intent: "planning_query",
  forecast: "Demo planning mode active. Synthetic forecast: KWD 42,500 across 12 stores. Accessories +8% WoW.",
  inventory_risk: "Synthetic planning risk generated. 3 SKUs below safety stock at Marina Mall. Avenues overstocked 22%.",
  recommendation: "Recommended store transfer: 45 units from Avenues to Marina Mall. Schedule 2 additional staff for weekend peak at 360 Mall. Launch Ramadan early-bird campaign in Week 2.",
  campaign_readiness: "Campaign readiness check complete. Ramadan early-bird campaign recommended for Week 2 launch.",
  roi: "Estimated protected revenue: KWD 6,200/week from inventory transfer. Staff optimization saves KWD 1,800/week. Campaign ROI: 3.2x.",
  governance: "Demo approval status: All recommendations within policy limits. No discount exceeds 15% threshold.",
  audit_id: `demo-${Date.now().toString(36)}`,
  answer: "Demo planning mode active. Generated a structured recommendation using synthetic retail planning data.",
  provider_mode: "deterministic_demo",
};

const STARTER_PROMPTS: StarterPrompt[] = [
  {
    label: "Weekly Planning Focus",
    message: "What should the planning team focus on this week across our Kuwait stores?",
  },
  {
    label: "Inventory Risk Review",
    message: "Are there any SKUs below safety stock or overstocked items that need transfer action?",
  },
  {
    label: "Campaign Readiness",
    message: "What should we emphasize in a Ramadan premium accessories campaign for our Kuwait stores?",
  },
  {
    label: "Workforce Planning",
    message: "Do we have adequate staffing for weekend peak traffic across Marina Mall and Avenues?",
  },
];

/* ── Planning card ───────────────────────────────────────── */

function PlanningCard({
  icon: Icon,
  title,
  content,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  content: string;
  accent?: "gold" | "success" | "risk" | "info";
}) {
  const bg = {
    gold: "border-[#B8954B]/15 bg-[#B8954B]/3",
    success: "border-[#2F7D5C]/15 bg-[#2F7D5C]/3",
    risk: "border-[#B85C38]/15 bg-[#B85C38]/3",
    info: "border-[#5A7B9C]/15 bg-[#5A7B9C]/3",
  };
  const ic = {
    gold: "text-[#B8954B]",
    success: "text-[#2F7D5C]",
    risk: "text-[#B85C38]",
    info: "text-[#5A7B9C]",
  };

  return (
    <div className={`rounded-2xl border p-4 ${accent ? bg[accent] : "border-[#E8E0D2] bg-white"}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`h-3.5 w-3.5 ${accent ? ic[accent] : "text-[#6B6B6B]"}`} />
        <h4 className={`text-[11px] font-semibold uppercase tracking-wider ${accent ? ic[accent] : "text-[#6B6B6B]"}`}>
          {title}
        </h4>
      </div>
      <p className="text-xs leading-relaxed text-[#1F1F1F] whitespace-pre-line">{content}</p>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────── */

export default function StaffChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [latestPipeline, setLatestPipeline] = useState<PipelineResult | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      setError(null);

      const userMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: "user",
        content: content.trim(),
        timestamp: Date.now(),
      };

      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setInput("");
      setIsLoading(true);

      try {
        const res = await fetch(`${BACKEND_URL}/api/internal-copilot/ask`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: content.trim(),
            role: "executive",
            context: { country: "Kuwait", planning_period: "next_week" },
          }),
        });

        if (!res.ok) throw new Error(`Backend returned ${res.status}`);

        const data = (await res.json()) as PipelineResult;
        setLatestPipeline(data);

        const assistantMessage: ChatMessage = {
          id: `msg-${Date.now()}-ai`,
          role: "assistant",
          content: data.answer,
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err) {
        // Use planning-oriented fallback
        const fallback = { ...PLANNING_FALLBACK, question: content.trim(), audit_id: `demo-${Date.now().toString(36)}` };
        setLatestPipeline(fallback);

        const fallbackMessage: ChatMessage = {
          id: `msg-${Date.now()}-ai`,
          role: "assistant",
          content: fallback.answer,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, fallbackMessage]);

        setError(
          err instanceof Error
            ? `Backend unreachable — showing demo planning data. (${err.message})`
            : "Backend unreachable — showing demo planning data."
        );
      } finally {
        setIsLoading(false);
      }
    },
    [messages, isLoading]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const clearChat = () => {
    setMessages([]);
    setLatestPipeline(null);
    setError(null);
  };

  // Derive workforce gap and transfer action from recommendation
  const workforceGap = latestPipeline?.recommendation
    ?.split(".")
    .filter((s) => /staff|schedule|workforce/i.test(s))
    .map((s) => s.trim())
    .filter(Boolean)
    .join(". ") || "";
  const transferAction = latestPipeline?.recommendation
    ?.split(".")
    .filter((s) => /transfer|move|unit/i.test(s))
    .map((s) => s.trim())
    .filter(Boolean)
    .join(". ") || "";

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      {/* ── Left: Chat UI ─────────────────────────────────── */}
      <div className="flex flex-col h-[720px] rounded-2xl border border-[#E8E0D2] bg-white overflow-hidden">
        {/* Chat header */}
        <div className="flex items-center justify-between border-b border-[#E8E0D2] px-5 py-3">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[#2F7D5C]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-[#6B6B6B]">
              Internal Copilot
            </span>
            {latestPipeline && (
              <span className="badge severity-success text-[9px]">
                {latestPipeline.provider_mode.replace(/_/g, " ")}
              </span>
            )}
          </div>
          <button
            onClick={clearChat}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] text-[#9A9590] hover:text-[#6B6B6B] hover:bg-[#F3F0E9] transition-all"
          >
            <Trash2 className="h-3 w-3" />
            Clear
          </button>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {messages.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center h-full">
              <Sparkles className="h-8 w-8 text-[#DDD5C8] mb-3" />
              <p className="text-sm text-[#6B6B6B] mb-1">
                Ask a planning question
              </p>
              <p className="text-xs text-[#9A9590] mb-6">
                Or select a starter prompt below
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
                {STARTER_PROMPTS.map((prompt) => (
                  <button
                    key={prompt.label}
                    onClick={() => sendMessage(prompt.message)}
                    className="rounded-xl border border-[#E8E0D2] bg-[#F8F5EF] px-3 py-2.5 text-left text-xs text-[#6B6B6B] hover:text-[#1F1F1F] hover:border-[#DDD5C8] transition-all"
                  >
                    <span className="font-medium text-[#B8954B]">
                      {prompt.label}
                    </span>
                    <br />
                    <span className="text-[#9A9590] line-clamp-2">
                      {prompt.message}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
              >
                <ChatMessageComponent message={msg} />
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <div className="flex items-center gap-3 px-2 py-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#B8954B] to-[#A07F3E]">
                <Loader2 className="h-4 w-4 text-white animate-spin" />
              </div>
              <div className="flex gap-1">
                <span className="h-2 w-2 rounded-full bg-[#B8954B] animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="h-2 w-2 rounded-full bg-[#B8954B] animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="h-2 w-2 rounded-full bg-[#B8954B] animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
              <span className="text-xs text-[#9A9590]">
                Running planning pipeline...
              </span>
            </div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 rounded-xl border border-[#B85C38]/15 bg-[#B85C38]/5 px-4 py-3"
            >
              <AlertCircle className="h-4 w-4 text-[#B85C38] shrink-0" />
              <p className="text-xs text-[#B85C38]">{error}</p>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <form
          onSubmit={handleSubmit}
          className="border-t border-[#E8E0D2] px-4 py-3"
        >
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a planning question..."
              disabled={isLoading}
              className="flex-1 rounded-xl border border-[#E8E0D2] bg-[#F8F5EF] px-4 py-2.5 text-sm text-[#1F1F1F] placeholder-[#9A9590] focus:border-[#B8954B]/40 focus:outline-none disabled:opacity-50 transition-colors"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#B8954B] to-[#A07F3E] text-white transition-all hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>

      {/* ── Right: Planning Intelligence Panel ────────────── */}
      <div className="h-[720px] overflow-y-auto rounded-2xl border border-[#E8E0D2] bg-white p-5">
        {latestPipeline ? (
          <motion.div
            key={latestPipeline.audit_id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="space-y-3"
          >
            <div className="rounded-2xl border border-[#B8954B]/12 bg-gradient-to-br from-[#B8954B]/4 to-[#F8F5EF] p-4 mb-4">
              <div className="text-[10px] uppercase tracking-[0.2em] text-[#B8954B]">
                Planning Intelligence
              </div>
              <div className="mt-1 text-sm font-semibold text-[#1F1F1F]">
                Structured Planning Output
              </div>
              <div className="mt-0.5 text-xs text-[#6B6B6B]">
                Audit {latestPipeline.audit_id.slice(0, 8)}
              </div>
            </div>

            <PlanningCard icon={TrendingUp} title="Sales Forecast" content={latestPipeline.forecast} accent="success" />
            <PlanningCard icon={AlertTriangle} title="Inventory Risk" content={latestPipeline.inventory_risk} accent="risk" />
            <PlanningCard
              icon={ArrowRightLeft}
              title="Transfer Action"
              content={transferAction ? `${transferAction}.` : latestPipeline.recommendation}
            />
            <PlanningCard
              icon={Users}
              title="Workforce Gap"
              content={workforceGap ? `${workforceGap}.` : "Staff levels aligned with forecasted traffic."}
              accent="info"
            />
            <PlanningCard icon={Megaphone} title="Campaign Readiness" content={latestPipeline.campaign_readiness} />
            <PlanningCard icon={BarChart3} title="ROI Impact" content={latestPipeline.roi} accent="success" />
            <PlanningCard icon={ShieldCheck} title="Governance" content={latestPipeline.governance} />
            <PlanningCard
              icon={FileCheck}
              title="Audit ID"
              content={latestPipeline.audit_id}
              accent="gold"
            />
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <BarChart3 className="h-10 w-10 text-[#DDD5C8] mb-4" />
            <p className="text-sm font-medium text-[#6B6B6B]">Planning Intelligence</p>
            <p className="mt-1 text-xs text-[#9A9590] max-w-[240px]">
              Planning output with forecast, risk, actions, and governance will appear here after you ask a question.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
