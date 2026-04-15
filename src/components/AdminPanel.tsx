"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Settings,
  Save,
  RotateCcw,
  BookOpen,
  FlaskConical,
  Cpu,
  Rocket,
  Layers,
  MessageSquare,
  Brain,
  BarChart3,
  Search,
  Plus,
  Trash2,
  Loader2,
} from "lucide-react";
import { TextAreaEditor, TextInputEditor, StatusMessage } from "./ConfigEditor";
import SectionCard from "./SectionCard";
import type { AppConfig, FaqItem } from "@/types/config";

type AdminTab = "instructions" | "faq" | "scenarios" | "runtime" | "architecture";

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<AdminTab>("instructions");
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [faqItems, setFaqItems] = useState<FaqItem[]>([]);
  const [status, setStatus] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Load config and FAQ on mount
  useEffect(() => {
    Promise.all([
      fetch("/api/config").then((r) => r.json()),
      fetch("/api/faq").then((r) => r.json()),
    ])
      .then(([cfg, faq]) => {
        setConfig(cfg as AppConfig);
        setFaqItems(faq as FaqItem[]);
      })
      .catch(() => {
        setStatus({ message: "Failed to load configuration", type: "error" });
      });
  }, []);

  const saveConfig = useCallback(async () => {
    if (!config) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (!res.ok) throw new Error("Save failed");
      setStatus({ message: "Configuration saved successfully", type: "success" });
    } catch {
      setStatus({ message: "Failed to save configuration", type: "error" });
    } finally {
      setIsSaving(false);
      setTimeout(() => setStatus(null), 3000);
    }
  }, [config]);

  const saveFaq = useCallback(async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/faq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(faqItems),
      });
      if (!res.ok) throw new Error("Save failed");
      setStatus({ message: "FAQ saved successfully", type: "success" });
    } catch {
      setStatus({ message: "Failed to save FAQ", type: "error" });
    } finally {
      setIsSaving(false);
      setTimeout(() => setStatus(null), 3000);
    }
  }, [faqItems]);

  const resetAll = useCallback(async () => {
    setIsSaving(true);
    try {
      const [cfgRes, faqRes] = await Promise.all([
        fetch("/api/config", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ _action: "reset" }),
        }),
        fetch("/api/faq", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ _action: "reset" }),
        }),
      ]);
      const cfg = await cfgRes.json();
      const faq = await faqRes.json();
      setConfig(cfg as AppConfig);
      setFaqItems(faq as FaqItem[]);
      setStatus({ message: "Reset to defaults", type: "info" });
    } catch {
      setStatus({ message: "Reset failed", type: "error" });
    } finally {
      setIsSaving(false);
      setTimeout(() => setStatus(null), 3000);
    }
  }, []);

  const updateConfigField = useCallback(
    (field: keyof AppConfig, value: string | string[]) => {
      setConfig((prev) => (prev ? { ...prev, [field]: value } : prev));
    },
    []
  );

  const addFaqItem = useCallback(() => {
    setFaqItems((prev) => [
      ...prev,
      {
        id: `faq-${Date.now()}`,
        question: "",
        answer: "",
        category: "General",
      },
    ]);
  }, []);

  const updateFaqItem = useCallback(
    (id: string, field: keyof FaqItem, value: string) => {
      setFaqItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, [field]: value } : item
        )
      );
    },
    []
  );

  const removeFaqItem = useCallback((id: string) => {
    setFaqItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  if (!config) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-[#c9a84c]" />
      </div>
    );
  }

  const adminTabs: { id: AdminTab; label: string; icon: typeof Settings }[] = [
    { id: "instructions", label: "Instructions", icon: Settings },
    { id: "faq", label: "FAQ Editor", icon: BookOpen },
    { id: "scenarios", label: "Scenarios", icon: FlaskConical },
    { id: "runtime", label: "Runtime", icon: Cpu },
    { id: "architecture", label: "Architecture", icon: Layers },
  ];

  return (
    <div className="space-y-6">
      {/* Demo persistence notice */}
      <div className="flex items-center gap-3 rounded-xl border border-[#c9a84c]/20 bg-[#c9a84c]/5 px-4 py-3">
        <Settings className="h-4 w-4 text-[#c9a84c] shrink-0" />
        <p className="text-xs text-[#999]">
          <span className="font-semibold text-[#c9a84c]">Demo mode</span>
          {" — "}Changes are stored in server memory and will reset on restart. For production, connect a persistent database.
        </p>
      </div>

      {/* Admin sub-tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {adminTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 whitespace-nowrap rounded-lg border px-4 py-2 text-xs font-medium transition-all ${
                activeTab === tab.id
                  ? "border-[#c9a84c]/40 bg-[#1a1a1a] text-white"
                  : "border-[#2a2a2a] bg-[#141414] text-[#666] hover:text-[#aaa]"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Status */}
      {status && <StatusMessage message={status.message} type={status.type} />}

      {/* Action bar */}
      {activeTab !== "architecture" && (
        <div className="flex gap-2">
          <button
            onClick={activeTab === "faq" ? saveFaq : saveConfig}
            disabled={isSaving}
            className="flex items-center gap-2 rounded-lg border border-[#c9a84c]/30 bg-[#c9a84c]/10 px-4 py-2 text-xs font-semibold text-[#c9a84c] hover:bg-[#c9a84c]/20 disabled:opacity-50 transition-all"
          >
            {isSaving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            Save Changes
          </button>
          <button
            onClick={resetAll}
            disabled={isSaving}
            className="flex items-center gap-2 rounded-lg border border-[#2a2a2a] px-4 py-2 text-xs font-medium text-[#888] hover:text-white hover:border-[#3a3a3a] disabled:opacity-50 transition-all"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset to Defaults
          </button>
        </div>
      )}

      {/* Tab content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === "instructions" && (
          <div className="space-y-4">
            <TextAreaEditor
              label="System Instruction"
              value={config.systemInstruction}
              onChange={(v) => updateConfigField("systemInstruction", v)}
              rows={12}
            />
            <TextAreaEditor
              label="Retail Tone"
              value={config.retailTone}
              onChange={(v) => updateConfigField("retailTone", v)}
              rows={3}
            />
            <TextInputEditor
              label="Target Users"
              value={config.targetUsers}
              onChange={(v) => updateConfigField("targetUsers", v)}
            />
            <TextAreaEditor
              label="Gift Recommendation Rules"
              value={config.giftRules}
              onChange={(v) => updateConfigField("giftRules", v)}
              rows={6}
            />
            <TextAreaEditor
              label="Management Brief Style"
              value={config.briefStyle}
              onChange={(v) => updateConfigField("briefStyle", v)}
              rows={5}
            />
            <TextInputEditor
              label="Allowed Categories (comma-separated)"
              value={config.allowedCategories.join(", ")}
              onChange={(v) =>
                updateConfigField(
                  "allowedCategories",
                  v.split(",").map((s) => s.trim()).filter(Boolean)
                )
              }
            />
          </div>
        )}

        {activeTab === "faq" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-[#888]">
                {faqItems.length} knowledge entries
              </p>
              <button
                onClick={addFaqItem}
                className="flex items-center gap-1.5 rounded-lg border border-[#2a2a2a] px-3 py-1.5 text-xs text-[#888] hover:text-white hover:border-[#3a3a3a] transition-all"
              >
                <Plus className="h-3 w-3" />
                Add Entry
              </button>
            </div>
            {faqItems.map((item, i) => (
              <div
                key={item.id}
                className="rounded-xl border border-[#2a2a2a] bg-[#141414] p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#555]">
                    Entry {i + 1}
                  </span>
                  <button
                    onClick={() => removeFaqItem(item.id)}
                    className="text-[#555] hover:text-[#ef4444] transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <TextInputEditor
                  label="Category"
                  value={item.category}
                  onChange={(v) => updateFaqItem(item.id, "category", v)}
                />
                <TextInputEditor
                  label="Question"
                  value={item.question}
                  onChange={(v) => updateFaqItem(item.id, "question", v)}
                />
                <TextAreaEditor
                  label="Answer"
                  value={item.answer}
                  onChange={(v) => updateFaqItem(item.id, "answer", v)}
                  rows={3}
                />
              </div>
            ))}
          </div>
        )}

        {activeTab === "scenarios" && (
          <div className="space-y-4">
            <TextAreaEditor
              label="Scenario Logic Notes"
              value={config.scenarioNotes}
              onChange={(v) => updateConfigField("scenarioNotes", v)}
              rows={8}
            />
            <SectionCard icon={FlaskConical} title="How Scenarios Work">
              <p className="text-sm text-[#999] leading-relaxed">
                Scenario templates define the input parameters for AI-powered
                simulations. When a user runs a scenario, the system combines
                these templates with the scenario logic notes and sends them to
                OpenAI for structured analysis. The AI returns customer intent,
                objections, staff approach, and risk assessment.
              </p>
            </SectionCard>
          </div>
        )}

        {activeTab === "runtime" && (
          <div className="space-y-4">
            <TextInputEditor
              label="Model Override (leave empty for default)"
              value={config.modelOverride ?? ""}
              onChange={(v) => updateConfigField("modelOverride", v || "")}
              placeholder="e.g., gpt-4.1-mini, gpt-4o"
            />
            <SectionCard icon={Cpu} title="Runtime Information">
              <div className="space-y-2 text-sm text-[#999]">
                <p>
                  <span className="text-[#666]">Default model:</span>{" "}
                  gpt-4.1-mini (via OPENAI_MODEL env or fallback)
                </p>
                <p>
                  <span className="text-[#666]">Config persistence:</span>{" "}
                  In-memory (resets on server restart)
                </p>
                <p>
                  <span className="text-[#666]">Deployment target:</span>{" "}
                  Vercel (frontend + API) or Railway (split backend)
                </p>
              </div>
            </SectionCard>
            <SectionCard icon={Rocket} title="Pilot Scope">
              <div className="space-y-2 text-sm text-[#999]">
                <p>2-4 week internal pilot</p>
                <p>Internal staff use only</p>
                <p>Controlled company knowledge base</p>
                <p>No live inventory in Phase 1</p>
                <p>
                  Later phases: role-based access, analytics dashboards,
                  enterprise integrations (POS, ERP, CRM)
                </p>
              </div>
            </SectionCard>
          </div>
        )}

        {activeTab === "architecture" && (
          <div className="space-y-4">
            {[
              {
                icon: MessageSquare,
                title: "Conversational Layer",
                desc: "Live internal staff chat powered by OpenAI API. Config-driven system instructions with FAQ injection.",
              },
              {
                icon: Brain,
                title: "Decision Layer",
                desc: "Transforms staff questions into structured guidance — approach strategies, objection handling, and cultural context.",
              },
              {
                icon: Search,
                title: "Simulation Layer",
                desc: "Tests likely customer intent, objections, and campaign behavior before real-world deployment.",
              },
              {
                icon: BookOpen,
                title: "Knowledge Layer",
                desc: "Company-controlled instructions, FAQ entries, and scenario templates. Editable without code changes.",
              },
              {
                icon: BarChart3,
                title: "Management Layer",
                desc: "Executive summaries and briefs for managers and decision-makers. Actionable, not analytical.",
              },
            ].map((layer, i) => (
              <motion.div
                key={layer.title}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <SectionCard
                  icon={layer.icon}
                  title={layer.title}
                  accent={i === 0}
                >
                  <p className="text-sm text-[#999] leading-relaxed">
                    {layer.desc}
                  </p>
                </SectionCard>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
