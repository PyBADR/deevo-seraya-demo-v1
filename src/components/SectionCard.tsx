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
      className={`rounded-2xl border p-5 ${
        accent
          ? "border-[#b09560]/20 bg-white gold-glow"
          : "border-[#e8e4dc] bg-white"
      }`}
    >
      <div className="flex items-center gap-2 mb-3">
        {Icon && (
          <Icon
            className={`h-4 w-4 ${accent ? "text-[#b09560]" : "text-[#6b6560]"}`}
          />
        )}
        <h3
          className={`text-xs font-semibold uppercase tracking-wider ${
            accent ? "text-[#b09560]" : "text-[#6b6560]"
          }`}
        >
          {title}
        </h3>
      </div>
      {subtitle && (
        <p className="text-xs text-[#9a958e] mb-3">{subtitle}</p>
      )}
      {children}
    </div>
  );
}
