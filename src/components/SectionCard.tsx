"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface Props {
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
  accent?: boolean;
  children: ReactNode;
}

export default function SectionCard({
  icon: Icon,
  title,
  subtitle,
  accent = false,
  children,
}: Props) {
  return (
    <div
      className={`rounded-xl border p-5 ${
        accent
          ? "border-[#c9a84c]/25 bg-[#141414] gold-glow"
          : "border-[#2a2a2a] bg-[#141414]"
      }`}
    >
      <div className="flex items-center gap-2 mb-3">
        {Icon && (
          <Icon
            className={`h-4 w-4 ${accent ? "text-[#c9a84c]" : "text-[#888]"}`}
          />
        )}
        <h3
          className={`text-xs font-semibold uppercase tracking-wider ${
            accent ? "text-[#c9a84c]" : "text-[#999]"
          }`}
        >
          {title}
        </h3>
      </div>
      {subtitle && (
        <p className="text-xs text-[#666] mb-3">{subtitle}</p>
      )}
      {children}
    </div>
  );
}
