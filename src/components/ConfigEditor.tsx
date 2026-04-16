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
      <label className="block text-xs font-semibold uppercase tracking-wider text-[#6b6560]">
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="w-full rounded-xl border border-[#e8e4dc] bg-[#faf8f4] px-4 py-3 text-sm text-[#2d2d2d] placeholder-[#9a958e] focus:border-[#b09560]/40 focus:outline-none transition-colors font-mono leading-relaxed resize-y"
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
      <label className="block text-xs font-semibold uppercase tracking-wider text-[#6b6560]">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-[#e8e4dc] bg-[#faf8f4] px-4 py-2.5 text-sm text-[#2d2d2d] placeholder-[#9a958e] focus:border-[#b09560]/40 focus:outline-none transition-colors"
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
    success: "text-[#3d8b5f] bg-[#3d8b5f]/8 border-[#3d8b5f]/15",
    error: "text-[#c45040] bg-[#c45040]/8 border-[#c45040]/15",
    info: "text-[#5a7fb8] bg-[#5a7fb8]/8 border-[#5a7fb8]/15",
  };

  return (
    <div
      className={`rounded-xl border px-4 py-2.5 text-sm ${colors[type]}`}
    >
      {message}
    </div>
  );
}
