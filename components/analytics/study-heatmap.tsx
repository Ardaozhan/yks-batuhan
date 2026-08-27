"use client";

import { useMemo, useState } from "react";
import { Calendar, Flame } from "lucide-react";

interface DayActivity {
  dateStr: string;
  dayName: string;
  questions: number;
  minutes: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export function StudyHeatmap({ streakDays = 0 }: { streakDays?: number } = {}) {
  const [hoveredDay, setHoveredDay] = useState<DayActivity | null>(null);

  // Generate 16 weeks (112 days) of activity leading up to today
  const activityData = useMemo(() => {
    const days: DayActivity[] = [];
    const today = new Date();

    for (let i = 111; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
      const dayName = d.toLocaleDateString("tr-TR", { weekday: "short" });

      // Only record actual questions and minutes, otherwise 0
      const questions = 0;
      const minutes = 0;

      let level: 0 | 1 | 2 | 3 | 4 = 0;
      if (questions > 90) level = 4;
      else if (questions > 55) level = 3;
      else if (questions > 25) level = 2;
      else if (questions > 0) level = 1;

      days.push({ dateStr, dayName, questions, minutes, level });
    }
    return days;
  }, []);

  const totalQuestions = useMemo(
    () => activityData.reduce((sum, d) => sum + d.questions, 0),
    [activityData]
  );
  const activeDaysCount = useMemo(
    () => activityData.filter((d) => d.level > 0).length,
    [activityData]
  );

  const getCellColor = (level: number) => {
    switch (level) {
      case 4:
        return "bg-[#34402e] border-[#252f20]";
      case 3:
        return "bg-[var(--primary)] border-[#434f3c]";
      case 2:
        return "bg-[#829974] border-[#6b825d]";
      case 1:
        return "bg-[#c5d6bc] border-[#b0c4a6]";
      default:
        return "bg-[#efeeea] border-[#e2ded4]";
    }
  };

  return (
    <div className="paper-card p-5 sm:p-6 bg-white shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-[var(--outline)]">
        <div>
          <h3 className="font-display text-base font-bold text-[var(--ink)] flex items-center gap-2">
            <Calendar size={18} className="text-[var(--primary)]" />
            <span>Çalışma & Aktivite Isı Haritası</span>
          </h3>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            Son 16 haftalık günlük soru çözümü ve çalışma yoğunluğu dağılımı
          </p>
        </div>

        {/* Quick stats pills */}
        <div className="flex items-center gap-3 text-xs">
          {streakDays > 0 && (
            <div className="flex items-center gap-1.5 rounded-lg bg-[var(--surface-muted)] px-2.5 py-1 font-semibold text-[var(--ink)]">
              <Flame size={14} className="text-[#ba1a1a]" />
              <span className="text-[var(--primary)]">{streakDays}</span>
              <span className="text-[var(--muted)]">Gün Seri</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 rounded-lg bg-[var(--surface-muted)] px-2.5 py-1 font-semibold text-[var(--ink)]">
            <span className="text-[var(--primary)]">{activeDaysCount}</span>
            <span className="text-[var(--muted)]">Aktif Gün</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg bg-[var(--surface-ai)] px-2.5 py-1 font-semibold text-[#4E5D47] border border-[#d7e8cb]">
            <Flame size={14} className="text-[#ba1a1a]" />
            <span>{totalQuestions.toLocaleString("tr-TR")} Soru</span>
          </div>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto pb-2 scrollbar-none">
        <div className="min-w-[560px]">
          {/* Day rows (7 rows for days of week) */}
          <div className="grid grid-flow-col grid-rows-7 gap-1.5">
            {activityData.map((day, idx) => (
              <button
                key={idx}
                type="button"
                onMouseEnter={() => setHoveredDay(day)}
                onMouseLeave={() => setHoveredDay(null)}
                onClick={() => setHoveredDay(day)}
                aria-label={`${day.dateStr}: ${day.questions} soru, ${day.minutes} dk`}
                className={`h-3.5 w-3.5 sm:h-4 sm:w-4 rounded-xs sm:rounded-sm border transition-all hover:scale-125 hover:z-10 cursor-pointer ${getCellColor(
                  day.level
                )}`}
              />
            ))}
          </div>

          {/* Legend & Tooltip Footer */}
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-2 pt-3 border-t border-[var(--outline)]/50 text-[11px] text-[var(--muted)]">
            <div className="h-5 flex items-center">
              {hoveredDay ? (
                <span className="font-medium text-[var(--ink)] animate-in fade-in">
                  <strong>{hoveredDay.dateStr}</strong>: {hoveredDay.questions} Soru •{" "}
                  {hoveredDay.minutes} Dk Çalışma
                </span>
              ) : (
                <span>Kutucukların üzerine gelerek detayları inceleyebilirsiniz</span>
              )}
            </div>

            {/* Legend levels */}
            <div className="flex items-center gap-1.5">
              <span>Az</span>
              <div className="h-3 w-3 rounded-xs bg-[#efeeea] border border-[#e2ded4]" />
              <div className="h-3 w-3 rounded-xs bg-[#c5d6bc] border border-[#b0c4a6]" />
              <div className="h-3 w-3 rounded-xs bg-[#829974] border border-[#6b825d]" />
              <div className="h-3 w-3 rounded-xs bg-[var(--primary)] border-[#434f3c]" />
              <div className="h-3 w-3 rounded-xs bg-[#34402e] border-[#252f20]" />
              <span>Çok</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
