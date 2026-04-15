"use client";

export default function Footer() {
  return (
    <footer className="border-t border-[#1f1f1f] bg-[#0a0a0a] py-6">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-[11px] text-[#666]">
            Seraya Retail Intelligence Co-Pilot —{" "}
            <span className="text-[#999]">Deevo Analytics</span>
          </p>
          <p className="text-[11px] text-[#555]">
            <span className="rounded border border-[#c9a84c]/20 bg-[#c9a84c]/5 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#c9a84c] mr-1.5">
              Demo
            </span>
            No live inventory, pricing, or customer data. Config resets on restart.
          </p>
        </div>
      </div>
    </footer>
  );
}
