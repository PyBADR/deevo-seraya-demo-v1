"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  MessageSquare,
  TrendingUp,
  Gift,
  BarChart3,
  Settings,
} from "lucide-react";
import PlanningDashboard from "./PlanningDashboard";
import StaffChat from "./StaffChat";
import ScenarioSimulator from "./ScenarioSimulator";
import GiftAdvisor from "./GiftAdvisor";
import ManagementBrief from "./ManagementBrief";
import AdminPanel from "./AdminPanel";

const tabs = [
  {
    id: "dashboard",
    label: "Planning Focus",
    icon: LayoutDashboard,
    component: PlanningDashboard,
  },
  {
    id: "chat",
    label: "Internal Copilot",
    icon: MessageSquare,
    component: StaffChat,
  },
  {
    id: "forecast",
    label: "Planning Forecast",
    icon: TrendingUp,
    component: ScenarioSimulator,
  },
  {
    id: "clienteling",
    label: "Clienteling Advisor",
    icon: Gift,
    component: GiftAdvisor,
  },
  {
    id: "brief",
    label: "Executive Brief",
    icon: BarChart3,
    component: ManagementBrief,
  },
  {
    id: "health",
    label: "System Health",
    icon: Settings,
    component: AdminPanel,
  },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default function DemoShell() {
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");

  const ActiveComponent =
    tabs.find((t) => t.id === activeTab)?.component ?? PlanningDashboard;

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Hero positioning statement */}
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-[#1F1F1F] sm:text-3xl">
            Retail Planning{" "}
            <span className="gold-gradient">Workbench</span>
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-[#6B6B6B]">
            An internal AI planning layer for sales forecasting, inventory risk,
            store actions, campaign readiness, workforce planning, ROI protection,
            and auditable retail decisions.
          </p>
          <p className="mx-auto mt-1.5 text-xs text-[#9A9590]">
            Built for planning, inventory, marketing, and data teams.
          </p>
          <span className="mt-3 inline-block rounded-full border border-[#E8E0D2] bg-white px-3 py-1 text-[10px] uppercase tracking-wider text-[#9A9590]">
            Alyasra Retail Planning
          </span>
        </div>

        {/* Tab navigation */}
        <div className="mb-8 flex justify-center">
          <nav className="inline-flex flex-wrap justify-center gap-1 rounded-xl border border-[#E8E0D2] bg-white p-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? "text-[#1F1F1F]"
                      : "text-[#9A9590] hover:text-[#6B6B6B]"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 rounded-lg bg-[#F3F0E9] border border-[#B8954B]/18"
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <Icon
                      className={`h-4 w-4 ${
                        isActive ? "text-[#B8954B]" : ""
                      }`}
                    />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <ActiveComponent />
        </motion.div>
      </div>
    </main>
  );
}
