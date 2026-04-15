"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  MessageSquare,
  FlaskConical,
  Gift,
  BarChart3,
  Settings,
} from "lucide-react";
import StaffChat from "./StaffChat";
import ScenarioSimulator from "./ScenarioSimulator";
import GiftAdvisor from "./GiftAdvisor";
import ManagementBrief from "./ManagementBrief";
import AdminPanel from "./AdminPanel";

const tabs = [
  {
    id: "chat",
    label: "Staff Chat",
    icon: MessageSquare,
    component: StaffChat,
  },
  {
    id: "simulator",
    label: "Scenario Simulator",
    icon: FlaskConical,
    component: ScenarioSimulator,
  },
  {
    id: "gifts",
    label: "Gift Advisor",
    icon: Gift,
    component: GiftAdvisor,
  },
  {
    id: "brief",
    label: "Management Brief",
    icon: BarChart3,
    component: ManagementBrief,
  },
  {
    id: "admin",
    label: "Admin",
    icon: Settings,
    component: AdminPanel,
  },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default function DemoShell() {
  const [activeTab, setActiveTab] = useState<TabId>("chat");

  const ActiveComponent =
    tabs.find((t) => t.id === activeTab)?.component ?? StaffChat;

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Hero positioning statement */}
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Retail Intelligence{" "}
            <span className="gold-gradient">Co-Pilot</span>
          </h2>
          <p className="mx-auto mt-2 text-sm text-[#999]">
            From staff questions to guided retail decisions.
          </p>
          <p className="mx-auto mt-3 max-w-2xl text-xs leading-relaxed text-[#666]">
            This is not a chatbot. It is an internal decision layer for retail
            teams — turning customer situations into consistent staff actions,
            gifting guidance, scenario simulation, and management insight.
          </p>
          <span className="mt-3 inline-block rounded-full border border-[#2a2a2a] bg-[#141414] px-3 py-1 text-[10px] uppercase tracking-wider text-[#555]">
            Internal Retail Intelligence Demo
          </span>
        </div>

        {/* Tab navigation */}
        <div className="mb-8 flex justify-center">
          <nav className="inline-flex flex-wrap justify-center gap-1 rounded-xl border border-[#2a2a2a] bg-[#141414] p-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? "text-white"
                      : "text-[#666] hover:text-[#aaa]"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 rounded-lg bg-[#1f1f1f] border border-[#c9a84c]/20"
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
                        isActive ? "text-[#c9a84c]" : ""
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
