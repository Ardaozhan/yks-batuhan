"use client";

import { Sparkles } from "lucide-react";

export function AiThinkingOrb({ label = "AI Koç yanıt hazırlıyor..." }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 py-2 px-1 text-xs text-[var(--muted)] animate-in fade-in duration-300">
      <div className="relative flex h-8 w-8 items-center justify-center">
        {/* Outer glowing pulsing halo */}
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-25 duration-1000" />
        {/* Middle gradient ring */}
        <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 text-white shadow-md shadow-emerald-600/20">
          <Sparkles size={14} className="animate-spin duration-700" />
        </span>
      </div>
      <div className="flex flex-col">
        <span className="font-semibold text-[var(--ink)] tracking-tight text-xs flex items-center gap-1.5">
          {label}
        </span>
        <span className="text-[10px] text-[var(--muted)]">
          ÖSYM verileri & stratejileri taranıyor
        </span>
      </div>
    </div>
  );
}
