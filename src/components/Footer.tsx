"use client";

export default function Footer() {
  return (
    <footer className="border-t border-[#E8E0D2] bg-[#F8F5EF] py-6">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-[11px] text-[#9A9590]">
            Seraya Retail Planning Workbench —{" "}
            <span className="text-[#6B6B6B]">Deevo Analytics</span>
          </p>
          <p className="text-[11px] text-[#9A9590]">
            <span className="rounded border border-[#B8954B]/18 bg-[#B8954B]/5 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#B8954B] mr-1.5">
              Demo
            </span>
            No live inventory, pricing, or customer data. Config resets on restart.
          </p>
        </div>
      </div>
    </footer>
  );
}
