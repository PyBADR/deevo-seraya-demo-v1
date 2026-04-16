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
      <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B6B6B]">
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="w-full rounded-xl border border-[#E8E0D2] bg-[#F8F5EF] px-4 py-3 text-sm text-[#1F1F1F] placeholder-[#9A9590] focus:border-[#B8954B]/40 focus:outline-none transition-colors font-mono leading-relaxed resize-y"
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
      <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B6B6B]">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-[#E8E0D2] bg-[#F8F5EF] px-4 py-2.5 text-sm text-[#1F1F1F] placeholder-[#9A9590] focus:border-[#B8954B]/40 focus:outline-none transition-colors"
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
    success: "text-[#2F7D5C] bg-[#2F7D5C]/8 border-[#2F7D5C]/15",
    error: "text-[#B85C38] bg-[#B85C38]/8 border-[#B85C38]/15",
    info: "text-[#5A7B9C] bg-[#5A7B9C]/8 border-[#5A7B9C]/15",
  };

  return (
    <div
      className={`rounded-xl border px-4 py-2.5 text-sm ${colors[type]}`}
    >
      {message}
    </div>
  );
}
