"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Settings,
  Save,
  RotateCcw,
  BookOpen,
  TrendingUp,
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
        <Loader2 className="h-6 w-6 animate-spin text-[#B8954B]" />
      </div>
    );
  }

  const adminTabs: { id: AdminTab; label: string; icon: typeof Settings }[] = [
    { id: "instructions", label: "Instructions", icon: Settings },
    { id: "faq", label: "Knowledge Base", icon: BookOpen },
    { id: "scenarios", label: "Planning Cases", icon: TrendingUp },
    { id: "runtime", label: "System Health", icon: Cpu },
    { id: "architecture", label: "Architecture", icon: Layers },
  ];

  return (
    <div className="space-y-6">
      {/* Demo persistence notice */}
      <div className="flex items-center gap-3 rounded-2xl border border-[#B8954B]/15 bg-[#B8954B]/5 px-4 py-3">
        <Settings className="h-4 w-4 text-[#B8954B] shrink-0" />
        <p className="text-xs text-[#6B6B6B]">
          <span className="font-semibold text-[#B8954B]">Demo mode</span>
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
              className={`flex items-center gap-2 whitespace-nowrap rounded-xl border px-4 py-2 text-xs font-medium transition-all ${
                activeTab === tab.id
                  ? "border-[#B8954B]/25 bg-white text-[#1F1F1F]"
                  : "border-[#E8E0D2] bg-[#F8F5EF] text-[#9A9590] hover:text-[#6B6B6B]"
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
            className="flex items-center gap-2 rounded-xl border border-[#B8954B]/25 bg-[#B8954B]/8 px-4 py-2 text-xs font-semibold text-[#B8954B] hover:bg-[#B8954B]/15 disabled:opacity-50 transition-all"
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
            className="flex items-center gap-2 rounded-xl border border-[#E8E0D2] px-4 py-2 text-xs font-medium text-[#6B6B6B] hover:text-[#1F1F1F] hover:border-[#DDD5C8] disabled:opacity-50 transition-all"
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
              label="Executive Brief Style"
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
              <p className="text-xs text-[#6B6B6B]">
                {faqItems.length} knowledge entries
              </p>
              <button
                onClick={addFaqItem}
                className="flex items-center gap-1.5 rounded-xl border border-[#E8E0D2] px-3 py-1.5 text-xs text-[#6B6B6B] hover:text-[#1F1F1F] hover:border-[#DDD5C8] transition-all"
              >
                <Plus className="h-3 w-3" />
                Add Entry
              </button>
            </div>
            {faqItems.map((item, i) => (
              <div
                key={item.id}
                className="rounded-2xl border border-[#E8E0D2] bg-white p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#9A9590]">
                    Entry {i + 1}
                  </span>
                  <button
                    onClick={() => removeFaqItem(item.id)}
                    className="text-[#9A9590] hover:text-[#B85C38] transition-colors"
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
              label="Planning Case Notes"
              value={config.scenarioNotes}
              onChange={(v) => updateConfigField("scenarioNotes", v)}
              rows={8}
            />
            <SectionCard icon={TrendingUp} title="How Planning Cases Work">
              <p className="text-sm text-[#6B6B6B] leading-relaxed">
                Planning case templates define the input parameters for AI-powered
                forecasting. When a user runs a planning case, the system combines
                these templates with the planning notes and sends them to the
                AI provider for structured analysis. The AI returns customer intent,
                objections, approach strategy, and risk assessment.
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
            <SectionCard icon={Cpu} title="System Health">
              <div className="space-y-2 text-sm text-[#6B6B6B]">
                <p>
                  <span className="text-[#9A9590]">Default model:</span>{" "}
                  gpt-4.1-mini (via OPENAI_MODEL env or fallback)
                </p>
                <p>
                  <span className="text-[#9A9590]">Config persistence:</span>{" "}
                  In-memory (resets on server restart)
                </p>
                <p>
                  <span className="text-[#9A9590]">Deployment:</span>{" "}
                  Vercel (frontend) + Railway (backend)
                </p>
              </div>
            </SectionCard>
            <SectionCard icon={Rocket} title="Pilot Scope">
              <div className="space-y-2 text-sm text-[#6B6B6B]">
                <p>2-4 week internal pilot</p>
                <p>Internal planning team use only</p>
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
                title: "Internal Copilot",
                desc: "Live planning chat powered by OpenAI API. Config-driven system instructions with knowledge base injection.",
              },
              {
                icon: Brain,
                title: "Decision Layer",
                desc: "Transforms planning questions into structured guidance — forecasting, inventory risk, workforce gaps, and campaign readiness.",
              },
              {
                icon: Search,
                title: "Planning Forecast",
                desc: "Tests likely customer intent, demand signals, and campaign behavior before real-world deployment.",
              },
              {
                icon: BookOpen,
                title: "Knowledge Layer",
                desc: "Company-controlled instructions, knowledge entries, and planning case templates. Editable without code changes.",
              },
              {
                icon: BarChart3,
                title: "Executive Layer",
                desc: "Executive briefs for managers and decision-makers. Actionable, governance-checked, audit-ready.",
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
                  <p className="text-sm text-[#6B6B6B] leading-relaxed">
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
