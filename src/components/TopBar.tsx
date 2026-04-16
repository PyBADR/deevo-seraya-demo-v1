"use client";

import { Shield } from "lucide-react";

export default function TopBar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#E8E0D2] bg-[#F8F5EF]/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo & brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#B8954B] to-[#A07F3E]">
            <Shield className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-[15px] font-semibold tracking-tight text-[#1F1F1F]">
              SERAYA
            </h1>
            <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-[#9A9590]">
              Retail Planning Workbench
            </p>
          </div>
        </div>

        {/* Status cluster */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#2F7D5C] pulse-gold" />
            <span className="text-[11px] font-medium text-[#6B6B6B]">
              AI Connected — Demo Data Mode
            </span>
          </div>
          <div className="hidden sm:block h-4 w-px bg-[#E8E0D2]" />
          <span className="hidden sm:flex items-center gap-1.5 rounded-md border border-[#B8954B]/22 bg-[#B8954B]/6 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#B8954B]">
            Demo
          </span>
        </div>
      </div>
    </header>
  );
}
