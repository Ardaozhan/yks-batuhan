"use client";

import { useMemo } from "react";
import { Award, Lock, Sparkles } from "lucide-react";
import { calculateUserBadges, type Badge } from "@/lib/badges";

interface BadgeShowcaseProps {
  stats: {
    streakDays: number;
    totalQuestions: number;
    completedTopicsCount: number;
    examCount: number;
  };
}

export function BadgeShowcase({ stats }: BadgeShowcaseProps) {
  const badges = useMemo(() => calculateUserBadges(stats), [stats]);
  const unlockedCount = badges.filter((b) => b.unlocked).length;

  return (
    <div className="paper-card p-5 sm:p-6 bg-white shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[var(--outline)]">
        <div className="flex items-center gap-2">
          <Award size={20} className="text-[var(--primary)]" />
          <h3 className="font-display text-base font-bold text-[var(--ink)]">
            Başarı Rozetleri & Başarımlar
          </h3>
        </div>
        <span className="rounded-full bg-[var(--surface-ai)] px-3 py-0.5 text-xs font-bold text-[var(--primary)] border border-[#d7e8cb]">
          {unlockedCount} / {badges.length} Kazanıldı
        </span>
      </div>

      {/* Grid of Badges */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {badges.map((badge) => (
          <div
            key={badge.id}
            className={`rounded-2xl p-4 border text-center transition-all flex flex-col items-center justify-between relative overflow-hidden ${
              badge.unlocked
                ? "bg-gradient-to-b from-[#fbf9f5] to-white border-[#d7e8cb] shadow-xs"
                : "bg-[#faf9f6]/80 border-[var(--outline)] opacity-55"
            }`}
          >
            {/* Top icon */}
            <div className="relative mb-2">
              <span className="text-3xl filter drop-shadow-xs">{badge.icon}</span>
              {!badge.unlocked && (
                <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-stone-700 text-white shadow-xs">
                  <Lock size={10} />
                </div>
              )}
            </div>

            <div>
              <h4 className="font-display text-xs font-bold text-[var(--ink)]">
                {badge.title}
              </h4>
              <p className="mt-1 text-[10px] text-[var(--muted)] leading-tight line-clamp-2">
                {badge.description}
              </p>
            </div>

            {/* Progress status */}
            <div className="mt-3 w-full pt-2 border-t border-[var(--outline)]/50">
              <span
                className={`text-[10px] font-bold ${
                  badge.unlocked ? "text-[var(--primary)]" : "text-[var(--muted)]"
                }`}
              >
                {badge.unlocked ? "Kazanıldı ✓" : badge.progressText}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
