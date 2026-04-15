"use client";

interface TextAreaEditorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
}

export function TextAreaEditor({
  label,
  value,
  onChange,
  rows = 6,
  placeholder,
}: TextAreaEditorProps) {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold uppercase tracking-wider text-[#888]">
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="w-full rounded-lg border border-[#2a2a2a] bg-[#0a0a0a] px-4 py-3 text-sm text-white placeholder-[#444] focus:border-[#c9a84c]/40 focus:outline-none transition-colors font-mono leading-relaxed resize-y"
      />
    </div>
  );
}

interface TextInputEditorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function TextInputEditor({
  label,
  value,
  onChange,
  placeholder,
}: TextInputEditorProps) {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold uppercase tracking-wider text-[#888]">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-[#2a2a2a] bg-[#0a0a0a] px-4 py-2.5 text-sm text-white placeholder-[#444] focus:border-[#c9a84c]/40 focus:outline-none transition-colors"
      />
    </div>
  );
}

interface StatusMessageProps {
  message: string;
  type: "success" | "error" | "info";
}

export function StatusMessage({ message, type }: StatusMessageProps) {
  if (!message) return null;

  const colors = {
    success: "text-[#22c55e] bg-[#22c55e]/10 border-[#22c55e]/20",
    error: "text-[#ef4444] bg-[#ef4444]/10 border-[#ef4444]/20",
    info: "text-[#6b9fff] bg-[#6b9fff]/10 border-[#6b9fff]/20",
  };

  return (
    <div
      className={`rounded-lg border px-4 py-2.5 text-sm ${colors[type]}`}
    >
      {message}
    </div>
  );
}
