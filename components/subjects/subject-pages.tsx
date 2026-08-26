"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Layers,
  MoreVertical,
  Plus,
  Sparkles,
  Target,
} from "lucide-react";
import { QuickAddDialog } from "@/components/forms/quick-add-dialog";
import {
  addDailyTask,
  getSubjects,
  getTopics,
  toggleTopicStatus,
} from "@/lib/study-store";
import type { Subject, Topic } from "@/types/study";

export function SubjectsPage() {
  const [subjectsList, setSubjectsList] = useState<Subject[]>(() => getSubjects());
  const [filter, setFilter] = useState<"all" | "TYT" | "AYT">("all");
  const [quickOpen, setQuickOpen] = useState(false);

  useEffect(() => {
    const handleUpdate = () => setSubjectsList(getSubjects());
    window.addEventListener("study_store_change", handleUpdate);
    return () => window.removeEventListener("study_store_change", handleUpdate);
  }, []);

  const filtered = subjectsList.filter((s) => {
    if (filter === "all") return true;
    return s.examType === filter;
  });

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 md:px-10 md:py-10">
      {/* Page Header */}
      <header className="mb-7 flex flex-col gap-4 border-b border-[var(--outline)] pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-[var(--ink)]">
            Derslerim
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            İlerlemeyi takip et, eksik konularını kapat ve hedefine odaklan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Filter Pills */}
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
              onClick={() => setFilter("TYT")}
              className={`rounded-md px-3 py-1 font-medium transition-colors ${
                filter === "TYT"
                  ? "bg-[var(--primary)] text-white"
                  : "text-[var(--muted)] hover:text-[var(--ink)]"
              }`}
            >
              TYT
            </button>
            <button
              onClick={() => setFilter("AYT")}
              className={`rounded-md px-3 py-1 font-medium transition-colors ${
                filter === "AYT"
                  ? "bg-[var(--primary)] text-white"
                  : "text-[var(--muted)] hover:text-[var(--ink)]"
              }`}
            >
              AYT
            </button>
          </div>

          <button
            onClick={() => setQuickOpen(true)}
            className="app-focus inline-flex h-9 items-center gap-1.5 rounded-lg bg-[var(--primary)] px-4 text-xs font-semibold text-white shadow-xs hover:bg-[var(--primary-strong)] active:scale-95 transition-all"
          >
            <Plus size={16} />
            <span>Ders Ekle</span>
          </button>
        </div>
      </header>

      {/* Grid of Subject Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((subject) => (
          <SubjectCard key={subject.id} subject={subject} />
        ))}
      </div>

      {quickOpen && <QuickAddDialog onClose={() => setQuickOpen(false)} />}
    </div>
  );
}

function SubjectCard({ subject }: { subject: Subject }) {
  return (
    <Link
      href={`/subjects/${subject.id}`}
      className="paper-card group relative flex flex-col justify-between overflow-hidden p-6 bg-white transition-all hover:border-[var(--primary)] hover:shadow-[0_4px_20px_rgba(25,26,24,0.04)]"
    >
      <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-[var(--surface-ai)]/50 group-hover:scale-125 transition-transform duration-300 pointer-events-none" />

      <div>
        <div className="flex items-start justify-between">
          <span
            className={`inline-block rounded-md px-2.5 py-1 text-xs font-semibold ${
              subject.examType === "TYT"
                ? "bg-[var(--secondary-container)] text-[var(--on-secondary-container)]"
                : "bg-[#E9EEE6] text-[#4E5D47]"
            }`}
          >
            {subject.examType}
          </span>
          <MoreVertical size={16} className="text-[var(--muted)]" />
        </div>

        <h2 className="mt-3 font-display text-xl font-bold text-[var(--ink)]">
          {subject.name}
        </h2>
      </div>

      <div className="mt-6 space-y-2">
        <div className="flex justify-between text-xs text-[var(--muted)]">
          <span>
            {subject.completedTopics || 0} / {subject.topicCount} Konu Tamamlandı
          </span>
          <span className="font-semibold text-[var(--primary)]">%{subject.progress}</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-[#e4e2df]">
          <div
            className="h-full rounded-full bg-[var(--primary)] transition-all duration-300"
            style={{ width: `${subject.progress}%` }}
          />
        </div>
      </div>

      <div className="mt-5 border-t border-[var(--outline)] pt-3 text-xs text-[var(--muted)] flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-[var(--muted)] font-medium">
          <CheckCircle2 size={14} className={subject.completedTopics > 0 ? "text-emerald-600" : "text-[var(--muted)]"} />
          {subject.completedTopics > 0
            ? `${subject.completedTopics} konu çalışıldı`
            : "Henüz konu çalışılmadı"}
        </span>
        <span className="text-[var(--primary)] font-semibold group-hover:translate-x-1 transition-transform">
          Konuları İncele →
        </span>
      </div>
    </Link>
  );
}

export function SubjectDetailPage({ subjectId }: { subjectId: string }) {
  const [subject, setSubject] = useState<Subject | null>(() => {
    const list = getSubjects();
    return list.find((s) => s.id === subjectId) || list[0] || null;
  });
  const [topics, setTopics] = useState<Topic[]>(() => getTopics(subjectId));
  const [filter, setFilter] = useState<"all" | "in_progress" | "completed">("all");
  const [quickOpen, setQuickOpen] = useState(false);

  useEffect(() => {
    const handleUpdate = () => {
      const list = getSubjects();
      setSubject(list.find((s) => s.id === subjectId) || list[0] || null);
      setTopics(getTopics(subjectId));
    };
    window.addEventListener("study_store_change", handleUpdate);
    return () => window.removeEventListener("study_store_change", handleUpdate);
  }, [subjectId]);

  const handleToggleTopic = (topicId: string) => {
    const updated = toggleTopicStatus(topicId);
    setTopics(updated);
  };

  const filteredTopics = topics.filter((t) => {
    if (filter === "in_progress") return t.status === "in_progress";
    if (filter === "completed") return t.status === "completed";
    return true;
  });

  if (!subject) return null;

  return (
    <div className="mx-auto max-w-[1040px] px-4 py-6 md:px-10 md:py-10">
      {/* Back Link */}
      <Link
        href="/subjects"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--muted)] hover:text-[var(--primary)] transition-colors mb-4"
      >
        <ArrowLeft size={16} />
        <span>Derslerime dön</span>
      </Link>

      {/* Header with AI Suggestion */}
      <div className="paper-card p-6 md:p-8 bg-white mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-[var(--secondary-container)] px-2.5 py-0.5 text-xs font-bold text-[var(--on-secondary-container)]">
                {subject.examType}
              </span>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-[var(--ink)]">
                {subject.name} Detay
              </h1>
            </div>
            <p className="mt-2 text-sm text-[var(--muted)]">
              {subject.completedTopics} / {subject.topicCount || 18} konu tamamlandı •{" "}
              <strong className="text-[var(--primary)]">%{subject.progress} ilerleme</strong>
            </p>
          </div>

          {/* AI Suggestion Bubble */}
          <div className="rounded-xl border border-[#d7e8cb] bg-[#E9EEE6] p-4 text-xs leading-relaxed text-[#4E5D47] max-w-sm flex items-start gap-2.5 shadow-2xs">
            <Sparkles size={16} className="text-[#526049] shrink-0 mt-0.5" />
            <div>
              <strong>Koç Tavsiyesi:</strong>{" "}
              {subject.completedTopics === 0
                ? `${subject.name} dersine başlamak için bir konu seç ve çalıştıktan sonra tik işaretine tıklayarak tamamlandı olarak kaydet.`
                : `${subject.completedTopics} konuyu tamamladın! Kalan konuları da adım adım çalışarak ${subject.name} netlerini artırabilirsin.`}
            </div>
          </div>
        </div>

        {/* Filter Pills & Add Topic Button */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-6 border-t border-[var(--outline)]">
          <div className="flex gap-2 text-xs">
            <button
              onClick={() => setFilter("all")}
              className={`rounded-full px-4 py-1.5 font-semibold transition-colors ${
                filter === "all"
                  ? "bg-[var(--primary)] text-white"
                  : "border border-[var(--outline)] text-[var(--muted)] hover:bg-[var(--surface-muted)]"
              }`}
            >
              Tümü ({topics.length})
            </button>
            <button
              onClick={() => setFilter("completed")}
              className={`rounded-full px-4 py-1.5 font-semibold transition-colors ${
                filter === "completed"
                  ? "bg-[var(--primary)] text-white"
                  : "border border-[var(--outline)] text-[var(--muted)] hover:bg-[var(--surface-muted)]"
              }`}
            >
              Tamamlanan ({topics.filter((t) => t.status === "completed").length})
            </button>
            <button
              onClick={() => setFilter("in_progress")}
              className={`rounded-full px-4 py-1.5 font-semibold transition-colors ${
                filter === "in_progress"
                  ? "bg-[var(--primary)] text-white"
                  : "border border-[var(--outline)] text-[var(--muted)] hover:bg-[var(--surface-muted)]"
              }`}
            >
              Kalan ({topics.filter((t) => t.status !== "completed").length})
            </button>
          </div>

          <button
            onClick={() => setQuickOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--outline)] bg-white px-3.5 py-1.5 text-xs font-semibold text-[var(--ink)] hover:border-[var(--primary)] transition-all"
          >
            <Plus size={14} />
            <span>Konu Ekle</span>
          </button>
        </div>
      </div>

      {/* Topics List */}
      <div className="space-y-2.5">
        {filteredTopics.map((topic) => {
          const isDone = topic.status === "completed";
          return (
            <div
              key={topic.id}
              className={`paper-card p-4 bg-white flex items-center justify-between gap-4 transition-all ${
                isDone
                  ? "border-emerald-300 bg-[#f4f8f2] shadow-2xs"
                  : "hover:border-[var(--primary)] shadow-2xs"
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                {/* Interactive Tick Checkbox */}
                <button
                  type="button"
                  onClick={() => handleToggleTopic(topic.id)}
                  title={isDone ? "Tamamlandı (Geri Al)" : "Çalıştım (Tamamla)"}
                  className={`group/btn flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all cursor-pointer ${
                    isDone
                      ? "bg-emerald-600 text-white shadow-xs hover:bg-emerald-700 active:scale-95"
                      : "border-2 border-[var(--outline)] bg-[#fbf9f5] hover:border-emerald-600 hover:bg-emerald-50 text-[var(--muted)] hover:text-emerald-700 active:scale-95"
                  }`}
                >
                  {isDone ? (
                    <Check size={20} strokeWidth={3} />
                  ) : (
                    <Check size={18} className="opacity-30 group-hover/btn:opacity-100 transition-opacity" />
                  )}
                </button>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      href={`/subjects/${subject.id}/topics/${topic.id}`}
                      className={`font-display text-sm font-semibold hover:text-[var(--primary)] transition-colors ${
                        isDone ? "line-through text-[var(--muted)] opacity-80" : "text-[var(--ink)]"
                      }`}
                    >
                      {topic.name}
                    </Link>
                    {isDone && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 shrink-0">
                        <Check size={11} strokeWidth={3} /> Tamamlandı
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-[var(--muted)]">
                    {isDone ? "Çalışıldı ✓" : "Henüz çalışılmadı • Tıkla ve tamamla"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => handleToggleTopic(topic.id)}
                  className={`hidden sm:inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    isDone
                      ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                      : "border border-[var(--outline)] bg-white text-[var(--muted)] hover:text-emerald-700 hover:border-emerald-600 hover:bg-emerald-50"
                  }`}
                >
                  <Check size={14} strokeWidth={isDone ? 3 : 2} />
                  <span>{isDone ? "Tamamlandı" : "Çalıştım"}</span>
                </button>
                <Link
                  href={`/subjects/${subject.id}/topics/${topic.id}`}
                  className="text-xs font-semibold text-[var(--primary)] hover:underline ml-1"
                >
                  Detay →
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {quickOpen && <QuickAddDialog onClose={() => setQuickOpen(false)} />}
    </div>
  );
}

export function TopicDetailPage({
  subjectId,
  topicId,
}: {
  subjectId: string;
  topicId: string;
}) {
  const [added, setAdded] = useState(false);
  const [topics, setTopics] = useState<Topic[]>(() => getTopics());
  const [quickOpen, setQuickOpen] = useState(false);

  useEffect(() => {
    const handleUpdate = () => setTopics(getTopics());
    window.addEventListener("study_store_change", handleUpdate);
    return () => window.removeEventListener("study_store_change", handleUpdate);
  }, []);

  const topic = topics.find((t) => t.id === topicId) || topics[0] || {
    id: "problemler",
    name: "Problemler",
    progress: 67,
    status: "in_progress",
    questionCount: 180,
    accuracy: 78,
    notes: "Yaş ve hareket problemlerinde denklem kurarken tablo yöntemini kullan.",
  };

  const handleAddToToday = async () => {
    const parentSub = getSubjects().find((s) => s.id === subjectId);
    await addDailyTask({
      subject: parentSub?.name || "Genel Ders",
      topic: topic.name,
      description: "Konu çalışma hedefi & 30 soru",
      duration: "45 dk",
      status: "pending",
      priority: "high",
      plannedQuestions: 30,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  return (
    <div className="mx-auto max-w-[880px] px-4 py-6 md:px-10 md:py-10">
      <Link
        href={`/subjects/${subjectId}`}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--muted)] hover:text-[var(--primary)] transition-colors mb-4"
      >
        <ArrowLeft size={16} />
        <span>Konu Listesine Dön</span>
      </Link>

      <header className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="rounded-md bg-[var(--surface-ai)] px-2.5 py-0.5 text-xs font-bold text-[var(--primary)] border border-[#d7e8cb]">
              Konu Detayı
            </span>
            {topic.status === "completed" && (
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                ✓ Tamamlandı
              </span>
            )}
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-[var(--ink)]">
            {topic.name}
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {topic.status === "completed"
              ? "Bu konu çalışıldı ve tamamlandı olarak işaretlendi."
              : "Bu konu henüz çalışılmadı."}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            toggleTopicStatus(topic.id);
            setTopics(getTopics());
          }}
          className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all shadow-xs active:scale-95 ${
            topic.status === "completed"
              ? "bg-emerald-600 text-white hover:bg-emerald-700"
              : "border-2 border-[var(--outline)] bg-white text-[var(--ink)] hover:border-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
          }`}
        >
          <Check size={18} strokeWidth={3} />
          <span>
            {topic.status === "completed" ? "Tamamlandı ✓ (Geri Al)" : "Çalıştım (Tamamla)"}
          </span>
        </button>
      </header>

      {/* Stats Bento Card */}
      <section className="paper-card p-6 bg-white mb-6">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div>
            <p className="text-xs uppercase tracking-wider text-[var(--muted)]">Çözülen Soru</p>
            <p className="font-display text-4xl font-extrabold text-[var(--ink)] mt-1">
              {topic.questionCount || 0}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wider text-[var(--muted)]">Doğruluk Oranı</p>
            <p className="font-display text-3xl font-bold text-[var(--primary)] mt-1">
              %{topic.accuracy || 0}
            </p>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs text-[var(--muted)]">
            <span>İlerleme Seviyesi</span>
            <span className="font-semibold text-[var(--primary)]">%{topic.progress}</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-[#efeeea]">
            <div
              className="h-full rounded-full bg-[var(--primary)] transition-all"
              style={{ width: `${topic.progress}%` }}
            />
          </div>
        </div>
      </section>

      {/* Notes Card */}
      <section className="paper-card p-6 bg-white mb-6">
        <h2 className="font-display text-lg font-bold text-[var(--ink)] flex items-center gap-2">
          <Layers size={18} className="text-[var(--primary)]" />
          <span>Çalışma Notları</span>
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
          {topic.notes ||
            "Bu konuya henüz özel bir not eklemedin. Konuyu çalışırken unutulmaması gereken formülleri veya püf noktaları 'Hızlı Ekle' kısmından not düşebilirsin."}
        </p>
      </section>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={() => setQuickOpen(true)}
          className="flex-1 min-h-12 inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-6 text-sm font-semibold text-white shadow-md hover:bg-[var(--primary-strong)] active:scale-95 transition-all"
        >
          <Plus size={18} />
          <span>Çalışma Ekle</span>
        </button>

        <button
          type="button"
          onClick={handleAddToToday}
          className="flex-1 min-h-12 inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--outline)] bg-white px-6 text-sm font-semibold text-[var(--ink)] hover:bg-[var(--surface-muted)] active:scale-95 transition-all"
        >
          {added ? (
            <>
              <Check size={18} className="text-[var(--primary)]" />
              <span className="text-[var(--primary)]">Bugüne Eklendi!</span>
            </>
          ) : (
            <>
              <Target size={18} />
              <span>Bugünün Planına Ekle</span>
            </>
          )}
        </button>
      </div>

      {quickOpen && <QuickAddDialog onClose={() => setQuickOpen(false)} />}
    </div>
  );
}
