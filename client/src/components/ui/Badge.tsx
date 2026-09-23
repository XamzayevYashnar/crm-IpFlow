import type { ReactNode } from "react";

type Tone = "green" | "red" | "blue" | "gray";

const tones: Record<Tone, string> = {
  green: "bg-emerald-50 text-emerald-700 border-emerald-200",
  red: "bg-red-50 text-red-700 border-red-200",
  blue: "bg-blue-50 text-blue-700 border-blue-200",
  gray: "bg-slate-100 text-slate-600 border-slate-200",
};

export function Badge({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}
