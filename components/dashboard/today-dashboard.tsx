"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import {
  Calculator,
  Check,
  CheckCircle2,
  Clock3,
  Flame,
  Plus,
  Sparkles,
  Target,
  Timer,
  Trash2,
} from "lucide-react";
import { EmptyPlanIllustration } from "@/components/ui/animated-illustrations";
import { defaultProfile } from "@/lib/mock-data";
import {
  addDailyTask,
  deleteTask,
  getProfile,
  getSubjects,
  getTodayTasks,
  getTopics,
  toggleTaskStatus,
} from "@/lib/study-store";
import type { DailyTask } from "@/types/study";

const QuickAddDialog = dynamic(
  () => import("@/components/forms/quick-add-dialog").then((m) => m.QuickAddDialog),
  { ssr: false }
);

export function TodayDashboard() {
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [quickOpen, setQuickOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [profile, setProfile] = useState(defaultProfile);
  const [recommendedTopic, setRecommendedTopic] = useState(() => {
    const all = getTopics();
    return all.find((t) => t.status !== "completed") || all[0];
  });
  const [recommendedSubject, setRecommendedSubject] = useState(() => {
    const allSubs = getSubjects();
    const all = getTopics();
    const top = all.find((t) => t.status !== "completed") || all[0];
    return allSubs.find((s) => s.id === top?.subjectId)?.name || "Müfredat";
  });

  useEffect(() => {
    let active = true;
    getTodayTasks().then((data) => {
      if (active) {
        setTasks(data);
        setProfile(getProfile());
        setLoading(false);
      }
    });

    const handleUpdate = () => {
      getTodayTasks().then((data) => {
        if (active) {
          setTasks(data);
          setProfile(getProfile());
          const all = getTopics();
          const top = all.find((t) => t.status !== "completed") || all[0];
          setRecommendedTopic(top);
          const allSubs = getSubjects();
          setRecommendedSubject(allSubs.find((s) => s.id === top?.subjectId)?.name || "Müfredat");
        }
      });
    };

    window.addEventListener("study_store_change", handleUpdate);
    return () => {
      active = false;
      window.removeEventListener("study_store_change", handleUpdate);
    };
  }, []);

  // Calculate stats
  const completedCount = useMemo(
    () => tasks.filter((t) => t.status === "completed").length,
    [tasks]
  );
  const progress = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0;

  // Filter tasks
  const filteredTasks = useMemo(() => {
    if (filter === "active") return tasks.filter((t) => t.status !== "completed");
    if (filter === "completed") return tasks.filter((t) => t.status === "completed");
    return tasks;
  }, [tasks, filter]);

  // Toggle status with 0ms instant optimistic UI
  const handleToggle = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, status: t.status === "completed" ? ("pending" as const) : ("completed" as const) }
          : t
      )
    );
    toggleTaskStatus(taskId).catch((err) => console.error("Toggle error:", err));
  };

  // Delete task with 0ms instant optimistic UI
  const handleDelete = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    deleteTask(taskId).catch((err) => console.error("Delete error:", err));
  };

  // Add AI recommended task dynamically
  const handleAddAiSuggestion = async () => {
    if (!recommendedTopic) return;
    await addDailyTask({
      subject: recommendedSubject,
      topic: recommendedTopic.name,
      description: "AI Koç Tavsiyesi: Konu anlatımı ve 20 soru pratik",
      duration: "40 dk",
      status: "pending",
      priority: "high",
      plannedQuestions: 20,
    });
    const updated = await getTodayTasks();
    setTasks(updated);
  };

  // Days left to upcoming YKS (June 20th)
  const daysLeft = useMemo(() => {
    const now = new Date();
    let targetYear = now.getFullYear();
    if (now.getMonth() > 5 || (now.getMonth() === 5 && now.getDate() > 21)) {
      targetYear += 1;
    }
    const yksDate = new Date(targetYear, 5, 20);
    const diff = yksDate.getTime() - now.getTime();
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, []);

  const todayFormatted = new Intl.DateTimeFormat("tr-TR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 md:px-10 md:py-10 space-y-6">
      {/* Header Banner */}
      <header className="surface-panel relative overflow-hidden rounded-3xl p-5 pb-6 sm:p-7 md:p-8">
        <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-[var(--primary-soft)]/50 blur-3xl" />
        <div className="relative">
        {/* Top row: greeting + badges */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--primary)] bg-[var(--surface-ai)] px-3 py-1 rounded-full border border-[#d7e8cb]">
                Günlük Çalışma Alanı
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[var(--ink)]">
              {profile.name && profile.name !== "Öğrenci" ? `Günaydın, ${profile.name}` : "Hoş Geldin"}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[var(--muted)]">
              {todayFormatted} • Gün {profile.dayCount}/{profile.totalDays}
            </p>
          </div>

          {/* Quick Badges */}
          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            <div className="inline-flex items-center gap-2 rounded-xl border border-[var(--outline)] bg-white px-3.5 py-2 text-xs font-semibold shadow-2xs">
              <Timer size={16} className="text-[var(--primary)] shrink-0" />
              <span className="text-[var(--ink)]">
                YKS&apos;ye <strong>{daysLeft}</strong> gün
              </span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-xl border border-[#ffdad6] bg-[#fff5f4] px-3.5 py-2 text-xs font-semibold text-[#93000a] shadow-2xs group hover-lift">
              <Flame size={16} className="text-[#ba1a1a] fill-[#ba1a1a] shrink-0 animate-flame" />
              <span>{profile.streakDays} Gün Seri</span>
            </div>
          </div>
        </div>

        {/* Progress bar — mobile only */}
        <div className="mt-4 md:hidden">
          <div className="flex items-center justify-between mb-1.5 text-xs text-[var(--muted)]">
            <span className="font-medium text-[var(--ink)]">Bugünün İlerlemesi</span>
            <span className="font-bold text-[var(--primary)] animate-spring-pop">%{progress}</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#efeeea] shadow-inner">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--primary-strong)] transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-1 text-[11px] text-[var(--muted)]">
            {completedCount} / {tasks.length} görev tamamlandı
          </p>
        </div>
        </div>
      </header>

      {/* Main Grid: Left Tasks & Right Stats */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
        {/* Left Column: Tasks */}
        <div className="space-y-4">
          {/* Action Bar — cleanly aligned flex row */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between paper-card p-3.5 sm:p-4 bg-white/90 shadow-xs">
            <div>
              <h2 className="font-display text-base sm:text-lg font-bold text-[var(--ink)] flex items-center gap-2">
                <span>Bugünkü Plan</span>
                <span className="rounded-full bg-[var(--surface-muted)] px-2.5 py-0.5 text-xs font-bold text-[var(--muted)] animate-scale-in-spring">
                  {tasks.length}
                </span>
              </h2>
            </div>

            {/* Filter Tabs and Add Button */}
            <div className="flex items-center gap-2">
              <div className="flex flex-1 sm:flex-none rounded-xl border border-[var(--outline)] bg-[#fbf9f5] p-1 text-xs font-semibold">
                {(["all", "active", "completed"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`flex-1 sm:flex-none rounded-lg px-3 py-1.5 transition-all text-center mobile-tap ${
                      filter === f
                        ? "bg-[var(--primary)] text-white shadow-xs font-bold"
                        : "text-[var(--muted)] hover:text-[var(--ink)]"
                    }`}
                  >
                    {f === "all" ? "Tümü" : f === "active" ? "Kalan" : "Biten"}
                  </button>
                ))}
              </div>

              {/* Add Button */}
              <button
                onClick={() => setQuickOpen(true)}
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-[var(--primary)] px-4 text-xs font-bold text-white shadow-xs hover:bg-[var(--primary-strong)] active:scale-95 transition-all touch-manipulation mobile-tap shrink-0"
              >
                <Plus size={16} />
                <span>Görev Ekle</span>
              </button>
            </div>
          </div>

          {/* Task List */}
          {loading ? (
            <div className="paper-card p-8 text-center text-sm text-[var(--muted)] animate-pulse">
              Görevler yükleniyor...
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="paper-card p-6 sm:p-10 text-center bg-white shadow-xs animate-scale-in-spring">
              <EmptyPlanIllustration className="mb-2" />
              <h3 className="font-display text-base sm:text-lg font-bold text-[var(--ink)]">
                {filter === "completed"
                  ? "Henüz tamamlanmış görev yok"
                  : "Bugün için bekleyen görev bulunmuyor"}
              </h3>
              <p className="mt-1.5 text-xs sm:text-sm text-[var(--muted)] max-w-md mx-auto leading-relaxed">
                {filter === "completed"
                  ? "Tamamladığın çalışma hedefleri burada listelenecektir."
                  : "Hemen yeni bir görev ekleyebilir veya AI Planlayıcı ile sana özel günlük çalışma programını oluşturabilirsin."}
              </p>
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => setQuickOpen(true)}
                  className="w-full sm:w-auto inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-6 text-xs font-bold text-white shadow-xs hover:bg-[var(--primary-strong)] active:scale-95 transition-all touch-manipulation mobile-tap"
                >
                  <Plus size={16} />
                  <span>Manuel Görev Ekle</span>
                </button>
                <Link
                  href="/planner"
                  className="w-full sm:w-auto inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[var(--outline)] bg-white px-6 text-xs font-bold text-[var(--ink)] hover:bg-[var(--surface-muted)] active:scale-95 transition-all touch-manipulation shadow-2xs mobile-tap"
                >
                  <Sparkles size={15} className="text-[var(--primary)]" />
                  <span>AI ile Plan Oluştur</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1.5 custom-scrollbar">
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggle={() => handleToggle(task.id)}
                  onDelete={(e) => handleDelete(task.id, e)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Widgets & Summary */}
        <aside className="space-y-4">
          {/* YKS Countdown Card */}
          <div className="hidden lg:block paper-card p-6 text-center bg-gradient-to-b from-white to-[#fbf9f5] border-[var(--outline)] shadow-xs hover-lift">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
              YKS&apos;ye Kalan Süre
            </span>
            <div className="font-display text-5xl font-extrabold text-[var(--primary)] mt-2">
              {daysLeft}
            </div>
            <span className="text-xs font-semibold text-[var(--muted)]">Gün Kaldı</span>
            <p className="mt-4 text-xs text-[var(--muted)] border-t border-[var(--outline)]/70 pt-3">
              Hedef: <strong>{profile.targetDepartment}</strong>
              {profile.targetUniversity ? ` (${profile.targetUniversity})` : ""}
            </p>
          </div>

          {/* Today's Progress Card */}
          <div className="hidden lg:block paper-card p-6 bg-white border-[var(--outline)] shadow-xs hover-lift">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-sm font-bold text-[var(--ink)]">
                Bugünün İlerlemesi
              </h3>
              <span className="font-display text-sm font-bold text-[var(--primary)]">
                %{progress}
              </span>
            </div>

            <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#efeeea]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--primary-strong)] transition-all duration-700 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-[var(--muted)]">
              <span>
                {completedCount} / {tasks.length} Görev Tamamlandı
              </span>
              <span>{tasks.length - completedCount} Kalan</span>
            </div>
          </div>

          {/* AI Recommendation Card */}
          <div className="rounded-2xl border border-[#d7e8cb] bg-[#E9EEE6] p-5 relative overflow-hidden shadow-xs hover-lift">
            <div className="relative z-10 flex items-center gap-2 text-xs font-bold text-[#4E5D47] mb-2 uppercase tracking-wide">
              <Sparkles size={16} className="text-[var(--primary)]" />
              <span>Yapay Zeka Müfredat Önerisi</span>
            </div>
            <p className="relative z-10 text-xs leading-relaxed text-[#4E5D47] mb-4">
              {recommendedTopic ? (
                <>
                  Sıradaki öncelikli konun: <strong>{recommendedTopic.name}</strong> ({recommendedSubject}). Bugün bu konuyu plana ekleyerek ilerleme kaydedebilirsin.
                </>
              ) : (
                <>
                  Tebrikler! Belirlediğin tüm konuları tamamladın. Genel deneme sınavı çözerek pekiştirebilirsin.
                </>
              )}
            </p>
            <button
              onClick={handleAddAiSuggestion}
              className="relative z-10 inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[var(--primary-strong)] active:scale-95 transition-all touch-manipulation mobile-tap"
            >
              <Plus size={15} />
              <span>Görevi Bugüne Ekle</span>
            </button>
          </div>

          {/* Quick Shortcuts */}
          <div className="hidden lg:block paper-card p-5 bg-white border-[var(--outline)] shadow-xs">
            <h3 className="font-display text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-3">
              Hızlı Araçlar
            </h3>
            <div className="space-y-1.5">
              {[
                { href: "/simulator", icon: Calculator, label: "ÖSYM Simülatörü" },
                { href: "/coach", icon: Sparkles, label: "AI Koçuma Danış" },
                { href: "/planner", icon: Target, label: "Haftalık Planlayıcı" },
              ].map(({ href, icon: Icon, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-semibold text-[var(--ink)] hover:bg-[var(--surface-ai)] hover:text-[var(--primary)] transition-all mobile-tap"
                >
                  <Icon size={16} className="text-[var(--primary)] shrink-0" />
                  <span className="truncate">{label}</span>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {quickOpen && <QuickAddDialog onClose={() => setQuickOpen(false)} />}
    </div>
  );
}

function TaskCard({
  task,
  onToggle,
  onDelete,
}: {
  task: DailyTask;
  onToggle: () => void;
  onDelete: (e: React.MouseEvent) => void;
}) {
  const isDone = task.status === "completed";
  const isActive = task.status === "active";

  return (
    <article
      onClick={onToggle}
      className={`paper-card group relative flex cursor-pointer items-center gap-3 p-3.5 transition-all duration-250 md:p-4 mobile-press-lift ${
        isDone
          ? "bg-[#faf9f6] opacity-65 border-transparent"
          : isActive
          ? "border-l-4 border-l-[var(--primary)] bg-white shadow-xs"
          : "bg-white hover:border-[var(--primary)]"
      }`}
    >
      {/* Checkbox with spring pop animation on completion */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        aria-label={`${task.subject} durumunu değiştir`}
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 transition-all touch-manipulation mobile-tap ${
          isDone
            ? "border-[var(--primary)] bg-[var(--primary)] text-white shadow-xs"
            : "border-[var(--outline)] hover:border-[var(--primary)] bg-white text-transparent"
        }`}
      >
        <Check size={18} strokeWidth={3} className={isDone ? "animate-spring-pop" : ""} />
      </button>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <h3
            className={`font-display text-sm font-semibold transition-all ${
              isDone ? "line-through text-[var(--muted)]" : "text-[var(--ink)]"
            }`}
          >
            {task.subject}
            {task.topic ? `: ${task.topic}` : ""}
          </h3>

          {/* Priority Badge */}
          {task.priority === "high" && (
            <span className="rounded bg-[#ffdad6]/60 px-1.5 py-0.5 text-[10px] font-semibold text-[#93000a] animate-badge-pulse">
              Öncelikli
            </span>
          )}
        </div>

        <div className="mt-1 flex items-center gap-2">
          <p className="text-xs text-[var(--muted)] line-clamp-1 flex-1">{task.description}</p>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-[var(--surface-muted)] px-2 py-0.5 text-[11px] font-medium text-[var(--muted)]">
            <Clock3 size={11} />
            {task.duration}
          </span>
        </div>
      </div>

      {/* Delete — large tap zone on mobile */}
      <button
        onClick={onDelete}
        title="Görevi sil"
        aria-label="Görevi sil"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[var(--muted)] opacity-60 sm:opacity-0 sm:group-hover:opacity-100 hover:text-[var(--danger)] hover:bg-[#fff0ee] active:text-[var(--danger)] transition-all touch-manipulation mobile-tap"
      >
        <Trash2 size={15} />
      </button>
    </article>
  );
}
