"use client";

import Link from "next/link";
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
import { QuickAddDialog } from "@/components/forms/quick-add-dialog";
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

  // Toggle status
  const handleToggle = async (taskId: string) => {
    const updated = await toggleTaskStatus(taskId);
    setTasks(updated);
  };

  // Delete task
  const handleDelete = async (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = await deleteTask(taskId);
    setTasks(updated);
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
    <div className="mx-auto max-w-[1280px] px-4 py-6 md:px-10 md:py-10">
      {/* Header Banner */}
      <header className="mb-8 flex flex-col justify-between gap-4 border-b border-[var(--outline)] pb-6 md:flex-row md:items-end">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--primary)] bg-[var(--surface-ai)] px-2.5 py-0.5 rounded-full border border-[#d7e8cb]">
              Günlük Çalışma Alanı
            </span>
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-[var(--ink)] md:text-4xl">
            Günaydın, {profile.name}
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {todayFormatted} • Gün {profile.dayCount}/{profile.totalDays}
          </p>
        </div>

        {/* Quick Badges */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-xl border border-[var(--outline)] bg-white px-4 py-2 text-sm font-medium shadow-xs">
            <Timer size={18} className="text-[var(--primary)]" />
            <span className="font-display font-semibold text-[var(--ink)]">
              YKS&apos;ye {daysLeft} gün
            </span>
          </div>
          <div className="inline-flex items-center gap-2 rounded-xl border border-[#ffdad6] bg-[#fff5f4] px-4 py-2 text-sm font-medium text-[#93000a] shadow-xs">
            <Flame size={18} className="text-[#ba1a1a]" />
            <span className="font-display font-semibold">{profile.streakDays} Gün Seri</span>
          </div>
        </div>
      </header>

      {/* Main Grid: Left Tasks & Right Stats */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_340px]">
        {/* Left Column: Tasks */}
        <div className="space-y-6">
          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="text-[var(--primary)]" size={22} />
              <h2 className="font-display text-2xl font-bold text-[var(--ink)]">Bugünkü Plan</h2>
              <span className="ml-1 rounded-full bg-[var(--surface-muted)] px-2.5 py-0.5 text-xs font-semibold text-[var(--muted)]">
                {tasks.length}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Filter Tabs */}
              <div className="inline-flex rounded-lg border border-[var(--outline)] bg-white p-1 text-xs">
                <button
                  onClick={() => setFilter("all")}
                  className={`rounded-md px-3 py-1 font-medium transition-colors ${
                    filter === "all"
                      ? "bg-[var(--primary)] text-white"
                      : "text-[var(--muted)] hover:text-[var(--ink)]"
                  }`}
                >
                  Tümü
                </button>
                <button
                  onClick={() => setFilter("active")}
                  className={`rounded-md px-3 py-1 font-medium transition-colors ${
                    filter === "active"
                      ? "bg-[var(--primary)] text-white"
                      : "text-[var(--muted)] hover:text-[var(--ink)]"
                  }`}
                >
                  Kalan
                </button>
                <button
                  onClick={() => setFilter("completed")}
                  className={`rounded-md px-3 py-1 font-medium transition-colors ${
                    filter === "completed"
                      ? "bg-[var(--primary)] text-white"
                      : "text-[var(--muted)] hover:text-[var(--ink)]"
                  }`}
                >
                  Biten
                </button>
              </div>

              {/* Add Button */}
              <button
                onClick={() => setQuickOpen(true)}
                className="app-focus inline-flex h-9 items-center gap-1.5 rounded-lg bg-[var(--primary)] px-3.5 text-xs font-semibold text-white shadow-xs hover:bg-[var(--primary-strong)] transition-all active:scale-95"
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
            <div className="paper-card p-10 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--surface-ai)] text-[var(--primary)]">
                <Target size={28} />
              </div>
              <h3 className="font-display text-lg font-semibold text-[var(--ink)]">
                {filter === "completed"
                  ? "Henüz tamamlanmış görev yok"
                  : "Bugün için bekleyen görev bulunmuyor"}
              </h3>
              <p className="mt-1 text-sm text-[var(--muted)] max-w-sm mx-auto">
                {filter === "completed"
                  ? "Tamamladığın görevler burada listelenecek."
                  : "Yeni bir hedef belirle veya AI Planlayıcı ile otomatik bir çalışma programı oluştur."}
              </p>
              <div className="mt-5 flex justify-center gap-3">
                <button
                  onClick={() => setQuickOpen(true)}
                  className="rounded-lg bg-[var(--primary)] px-4 py-2 text-xs font-medium text-white hover:bg-[var(--primary-strong)]"
                >
                  + Görev Ekle
                </button>
                <Link
                  href="/planner"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--outline)] bg-white px-4 py-2 text-xs font-medium text-[var(--ink)] hover:bg-[var(--surface-muted)]"
                >
                  <Sparkles size={14} className="text-[var(--primary)]" />
                  AI Planlayıcı
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
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
        <aside className="space-y-6">
          {/* YKS Countdown Card */}
          <div className="paper-card p-6 text-center bg-gradient-to-b from-white to-[#fbf9f5] border-[var(--outline)] shadow-xs">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              YKS&apos;ye Kalan Süre
            </span>
            <div className="font-display text-5xl font-extrabold text-[var(--primary)] mt-2">
              {daysLeft}
            </div>
            <span className="text-sm font-medium text-[var(--muted)]">Gün</span>
            <p className="mt-3 text-xs text-[var(--muted)] border-t border-[var(--outline)] pt-3">
              Hedef: {profile.targetDepartment}
              {profile.targetUniversity ? ` (${profile.targetUniversity})` : ""}
            </p>
          </div>

          {/* Today's Progress Card */}
          <div className="paper-card p-6 bg-white border-[var(--outline)] shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-base font-semibold text-[var(--ink)]">
                Bugünün İlerlemesi
              </h3>
              <span className="font-display text-sm font-bold text-[var(--primary)]">
                %{progress}
              </span>
            </div>

            <div className="h-3 w-full overflow-hidden rounded-full bg-[#efeeea]">
              <div
                className="h-full rounded-full bg-[var(--primary)] transition-all duration-500"
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
          <div className="rounded-2xl border border-[#d7e8cb] bg-[#E9EEE6] p-6 relative overflow-hidden shadow-xs">
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/40 blur-xl"></div>
            <div className="relative z-10 flex items-center gap-2 text-sm font-bold text-[#4E5D47] mb-2">
              <Sparkles size={18} className="text-[#526049]" />
              <span>Yapay Zeka Önerisi</span>
            </div>
            <p className="relative z-10 text-xs leading-relaxed text-[#4E5D47] mb-4">
              {recommendedTopic ? (
                <>
                  Müfredatındaki sıradaki öncelikli konu: <strong>{recommendedTopic.name}</strong> ({recommendedSubject}). Bugün bu konuyu çalışarak müfredatında ilerleme kaydedebilirsin.
                </>
              ) : (
                <>
                  Tebrikler! Belirlediğin tüm konuları tamamladın. Genel deneme sınavı çözerek pekiştirebilirsin.
                </>
              )}
            </p>
            <button
              onClick={handleAddAiSuggestion}
              className="relative z-10 w-full rounded-lg bg-[var(--primary)] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[var(--primary-strong)] transition-colors shadow-xs active:scale-95"
            >
              + {recommendedTopic ? `"${recommendedTopic.name}" Plana Ekle` : "Çalışma Ekle"}
            </button>
          </div>

          {/* Quick Shortcuts */}
          <div className="paper-card p-5 space-y-2 bg-white">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-2">
              Hızlı Kısayollar
            </h4>
            <Link
              href="/planner"
              className="flex items-center justify-between p-2 rounded-lg hover:bg-[var(--surface-muted)] text-xs font-medium text-[var(--ink)] transition-colors"
            >
              <span className="flex items-center gap-2">
                <Sparkles size={16} className="text-[var(--primary)]" />
                AI ile Günlük Plan Yap
              </span>
              <span className="text-[var(--muted)]">→</span>
            </Link>
            <Link
              href="/simulator"
              className="flex items-center justify-between p-2 rounded-lg hover:bg-[var(--surface-muted)] text-xs font-medium text-[var(--ink)] transition-colors"
            >
              <span className="flex items-center gap-2">
                <Calculator size={16} className="text-[var(--primary)]" />
                Sıralama & Net Simülatörü
              </span>
              <span className="text-[var(--muted)]">→</span>
            </Link>
            <Link
              href="/exams"
              className="flex items-center justify-between p-2 rounded-lg hover:bg-[var(--surface-muted)] text-xs font-medium text-[var(--ink)] transition-colors"
            >
              <span className="flex items-center gap-2">
                <Target size={16} className="text-[var(--primary)]" />
                Son Denemeleri İncele
              </span>
              <span className="text-[var(--muted)]">→</span>
            </Link>
            <Link
              href="/coach"
              className="flex items-center justify-between p-2 rounded-lg hover:bg-[var(--surface-muted)] text-xs font-medium text-[var(--ink)] transition-colors"
            >
              <span className="flex items-center gap-2">
                <Flame size={16} className="text-[var(--primary)]" />
                Koçuma Soru Sor
              </span>
              <span className="text-[var(--muted)]">→</span>
            </Link>
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
      className={`paper-card group relative flex cursor-pointer items-center justify-between p-4 transition-all duration-200 hover:border-[var(--primary)] ${
        isDone
          ? "bg-[#faf9f6] opacity-65"
          : isActive
          ? "border-l-4 border-l-[var(--primary)] bg-white shadow-xs"
          : "bg-white"
      }`}
    >
      <div className="flex items-center gap-4 min-w-0 flex-1">
        {/* Checkbox */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          aria-label={`${task.subject} durumunu değiştir`}
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 transition-all ${
            isDone
              ? "border-[var(--primary)] bg-[var(--primary)] text-white"
              : "border-[var(--outline)] hover:border-[var(--primary)] bg-white text-transparent"
          }`}
        >
          <Check size={16} strokeWidth={3} />
        </button>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3
              className={`font-display text-sm font-semibold truncate ${
                isDone ? "line-through text-[var(--muted)]" : "text-[var(--ink)]"
              }`}
            >
              {task.subject}
              {task.topic ? `: ${task.topic}` : ""}
            </h3>

            {/* Priority Badge */}
            {task.priority === "high" && (
              <span className="rounded bg-[#ffdad6]/60 px-2 py-0.5 text-[11px] font-semibold text-[#93000a]">
                Yüksek Öncelik
              </span>
            )}
          </div>

          <p className="mt-1 text-xs text-[var(--muted)] line-clamp-1">{task.description}</p>
        </div>
      </div>

      {/* Right Side: Duration & Delete */}
      <div className="flex items-center gap-3 shrink-0 ml-3">
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--surface-muted)] px-2.5 py-1 text-xs font-medium text-[var(--muted)]">
          <Clock3 size={13} />
          {task.duration}
        </span>

        {/* Delete on mobile (always accessible) and desktop hover */}
        <button
          onClick={onDelete}
          title="Görevi sil"
          aria-label="Görevi sil"
          className="text-[var(--muted)] opacity-80 sm:opacity-0 sm:group-hover:opacity-100 hover:text-[var(--danger)] active:text-[var(--danger)] transition-opacity p-2 -mr-1 touch-manipulation"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </article>
  );
}
