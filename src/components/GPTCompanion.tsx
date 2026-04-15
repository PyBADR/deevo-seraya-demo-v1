"use client";

import { motion } from "framer-motion";
import {
  ExternalLink,
  Brain,
  Users,
  Gift,
  MessageSquare,
  FlaskConical,
  BarChart3,
  Rocket,
  Server,
  Plug,
  ShieldCheck,
  ArrowRight,
  Layers,
} from "lucide-react";

/* ── Simulation capabilities ──────────────────────────────── */

const simulationCapabilities = [
  {
    icon: Users,
    title: "Customer Intent Simulation",
    description:
      "Model how different customer profiles behave in-store — from browsing signals to purchase triggers — and generate real-time staff guidance.",
  },
  {
    icon: Gift,
    title: "Gifting Path Recommendation",
    description:
      "AI-driven gifting logic that maps recipient profiles, occasions, budgets, and cultural context to ranked product recommendations with reasoning.",
  },
  {
    icon: MessageSquare,
    title: "Staff Script Generation",
    description:
      "Context-aware conversation scripts for staff — including opening approaches, objection handling, upsell cues, and recovery protocols.",
  },
  {
    icon: FlaskConical,
    title: "Campaign Reaction Testing",
    description:
      "Simulate campaign variables (pricing, hours, staffing, promotions) and project their impact on revenue, conversion, and operational risk before deployment.",
  },
  {
    icon: BarChart3,
    title: "Management Brief Generation",
    description:
      "Automated daily intelligence briefings — surfacing KPI anomalies, client attrition risk, inventory alerts, and staff performance signals.",
  },
];

/* ── Pilot architecture phases ────────────────────────────── */

const pilotPhases = [
  {
    phase: 1,
    title: "Front-End Demo + Custom GPT Prototype",
    description:
      "Interactive dashboard for simulation and decision intelligence, paired with a conversational GPT layer for natural-language retail queries.",
    status: "active" as const,
    icon: Rocket,
  },
  {
    phase: 2,
    title: "Backend API + Controlled Knowledge Base",
    description:
      "FastAPI service layer with PostgreSQL, structured product catalog, client CRM integration, and retrieval-augmented generation over curated retail knowledge.",
    status: "upcoming" as const,
    icon: Server,
  },
  {
    phase: 3,
    title: "GPT Actions Integration",
    description:
      "Custom GPT Actions wired to the backend API — enabling the conversational layer to query live inventory, client history, and simulation results in real time.",
    status: "upcoming" as const,
    icon: Plug,
  },
  {
    phase: 4,
    title: "Analytics, Role Access & Enterprise Integrations",
    description:
      "Role-based access control, audit trails, IFRS 17 compliance hooks, analytics dashboards, and integration with enterprise POS, ERP, and CRM systems.",
    status: "upcoming" as const,
    icon: ShieldCheck,
  },
];

export default function GPTCompanion() {
  return (
    <div className="space-y-8">
      {/* ── Hero: Custom GPT Link ─────────────────────────── */}
      <div className="rounded-xl border border-[#c9a84c]/25 bg-gradient-to-br from-[#141414] to-[#1a1a1a] p-6 sm:p-8 gold-glow">
        <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left gap-6">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#c9a84c] to-[#a08838]">
            <Brain className="h-7 w-7 text-black" strokeWidth={2} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white sm:text-xl">
              Custom GPT Companion —{" "}
              <span className="gold-gradient">Al Yusra Retail Intelligence</span>
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[#999]">
              The Custom GPT is the conversational layer. This dashboard is the
              simulation and decision intelligence layer. Together, they form a
              complete retail co-pilot — one for natural-language interaction,
              the other for structured analysis and scenario modelling.
            </p>
            <div className="mt-5">
              <a
                href="https://chatgpt.com/g/g-69df9e41322881919367941913d9cdac-al-yusra-retail-intelligence"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 rounded-xl border border-[#c9a84c]/40 bg-gradient-to-r from-[#c9a84c]/15 to-[#a08838]/15 px-6 py-3 text-sm font-semibold text-[#c9a84c] transition-all hover:from-[#c9a84c]/25 hover:to-[#a08838]/25 hover:shadow-lg hover:shadow-[#c9a84c]/5"
              >
                <ExternalLink className="h-4 w-4" />
                Open Custom GPT Prototype
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── Retail Simulation Layer Card ───────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Layers className="h-4 w-4 text-[#c9a84c]" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#c9a84c]">
            Retail Simulation Layer
          </h3>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {simulationCapabilities.map((cap, i) => {
            const Icon = cap.icon;
            return (
              <motion.div
                key={cap.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.35 }}
                className="rounded-xl border border-[#2a2a2a] bg-[#141414] p-5 hover:border-[#3a3a3a] transition-colors"
              >
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1f1f1f]">
                    <Icon className="h-4 w-4 text-[#c9a84c]" />
                  </div>
                  <h4 className="text-sm font-semibold text-white">
                    {cap.title}
                  </h4>
                </div>
                <p className="text-[13px] leading-relaxed text-[#888]">
                  {cap.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── Future Pilot Architecture ─────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Rocket className="h-4 w-4 text-[#c9a84c]" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#c9a84c]">
            Pilot Architecture Roadmap
          </h3>
        </div>
        <div className="space-y-3">
          {pilotPhases.map((phase, i) => {
            const Icon = phase.icon;
            const isActive = phase.status === "active";
            return (
              <motion.div
                key={phase.phase}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.1, duration: 0.35 }}
                className={`rounded-xl border p-5 transition-all ${
                  isActive
                    ? "border-[#c9a84c]/30 bg-[#141414] gold-glow"
                    : "border-[#2a2a2a] bg-[#141414]"
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Phase number */}
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                      isActive
                        ? "bg-gradient-to-br from-[#c9a84c] to-[#a08838] text-black"
                        : "bg-[#1f1f1f] text-[#666]"
                    }`}
                  >
                    {phase.phase}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <h4
                        className={`text-[15px] font-semibold ${
                          isActive ? "text-white" : "text-[#aaa]"
                        }`}
                      >
                        {phase.title}
                      </h4>
                      {isActive && (
                        <span className="badge bg-[#c9a84c]/10 text-[#c9a84c] border border-[#c9a84c]/25">
                          Current Phase
                        </span>
                      )}
                    </div>
                    <p
                      className={`text-sm leading-relaxed ${
                        isActive ? "text-[#999]" : "text-[#666]"
                      }`}
                    >
                      {phase.description}
                    </p>
                  </div>

                  <Icon
                    className={`mt-1 h-5 w-5 shrink-0 ${
                      isActive ? "text-[#c9a84c]" : "text-[#333]"
                    }`}
                  />
                </div>

                {/* Connector arrow between phases */}
                {i < pilotPhases.length - 1 && (
                  <div className="ml-5 mt-3 flex items-center gap-1.5 text-[#333]">
                    <div className="h-px w-4 bg-[#2a2a2a]" />
                    <ArrowRight className="h-3 w-3" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
