"use client";

export default function Footer() {
  return (
    <footer className="border-t border-[#e8e4dc] bg-[#faf8f4] py-6">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-[11px] text-[#9a958e]">
            Seraya Retail Planning Copilot —{" "}
            <span className="text-[#6b6560]">Deevo Analytics</span>
          </p>
          <p className="text-[11px] text-[#9a958e]">
            <span className="rounded border border-[#b09560]/20 bg-[#b09560]/5 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#b09560] mr-1.5">
              Demo
            </span>
            No live inventory, pricing, or customer data. Config resets on restart.
          </p>
        </div>
      </div>
    </footer>
  );
}
