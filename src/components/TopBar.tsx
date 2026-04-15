"use client";

import { Shield } from "lucide-react";

export default function TopBar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#2a2a2a] bg-[#0a0a0a]/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo & brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#c9a84c] to-[#a08838]">
            <Shield className="h-5 w-5 text-black" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-[15px] font-semibold tracking-tight text-white">
              SERAYA
            </h1>
            <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-[#666]">
              Retail Intelligence Co-Pilot
            </p>
          </div>
        </div>

        {/* Status cluster */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#22c55e] pulse-gold" />
            <span className="text-[11px] font-medium text-[#999]">
              Live — OpenAI Connected
            </span>
          </div>
          <div className="hidden sm:block h-4 w-px bg-[#2a2a2a]" />
          <span className="hidden sm:flex items-center gap-1.5 rounded-md border border-[#c9a84c]/30 bg-[#c9a84c]/8 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#c9a84c]">
            Demo
          </span>
        </div>
      </div>
    </header>
  );
}
