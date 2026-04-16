"use client";

import { Shield } from "lucide-react";

export default function TopBar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#e8e4dc] bg-[#faf8f4]/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo & brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#b09560] to-[#9a8050]">
            <Shield className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-[15px] font-semibold tracking-tight text-[#2d2d2d]">
              SERAYA
            </h1>
            <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-[#9a958e]">
              Retail Planning Copilot
            </p>
          </div>
        </div>

        {/* Status cluster */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#3d8b5f] pulse-gold" />
            <span className="text-[11px] font-medium text-[#6b6560]">
              Live — OpenAI Connected
            </span>
          </div>
          <div className="hidden sm:block h-4 w-px bg-[#e8e4dc]" />
          <span className="hidden sm:flex items-center gap-1.5 rounded-md border border-[#b09560]/25 bg-[#b09560]/8 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#b09560]">
            Demo
          </span>
        </div>
      </div>
    </header>
  );
}
