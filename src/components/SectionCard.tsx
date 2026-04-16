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
          ? "border-[#B8954B]/20 bg-white gold-glow"
          : "border-[#E8E0D2] bg-white"
      }`}
    >
      <div className="flex items-center gap-2 mb-3">
        {Icon && (
          <Icon
            className={`h-4 w-4 ${accent ? "text-[#B8954B]" : "text-[#6B6B6B]"}`}
          />
        )}
        <h3
          className={`text-xs font-semibold uppercase tracking-wider ${
            accent ? "text-[#B8954B]" : "text-[#6B6B6B]"
          }`}
        >
          {title}
        </h3>
      </div>
      {subtitle && (
        <p className="text-xs text-[#9A9590] mb-3">{subtitle}</p>
      )}
      {children}
    </div>
  );
}
