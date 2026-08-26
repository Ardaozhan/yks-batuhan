"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertTriangle,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock3,
  Flame,
  GraduationCap,
  LogOut,
  Timer,
  User,
} from "lucide-react";
import { formatNet, totalNet } from "@/lib/analytics";
import {
  getExams,
  getMistakes,
  getProfile,
  getSubjects,
  getTodayTasks,
  getTopics,
} from "@/lib/study-store";
import type { DailyTask, Exam, MistakeRecord, Subject, Topic, UserProfile } from "@/types/study";

type TabKey = "tasks" | "curriculum" | "exams" | "mistakes" | "profiles";

type DbProfile = {
  user_id: string;
  email?: string | null;
  display_name: string | null;
  target_department: string | null;
  created_at: string;
  last_sign_in_at?: string | null;
};

export function AdminDashboard({ dbProfiles }: { dbProfiles: DbProfile[] }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>("tasks");
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    () => dbProfiles[0]?.user_id || null
  );
  const [profile, setProfile] = useState<UserProfile | null>(() => getProfile());
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>(() => getSubjects());
  const [topics, setTopics] = useState<Topic[]>(() => getTopics());
  const [exams, setExams] = useState<Exam[]>(() => getExams());
  const [mistakes, setMistakes] = useState<MistakeRecord[]>(() => getMistakes());
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("turkce");
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (dbProfiles.length > 0 && !selectedStudentId) {
      setSelectedStudentId(dbProfiles[0].user_id);
    }
  }, [dbProfiles, selectedStudentId]);

  useEffect(() => {
    getTodayTasks().then((data) => setTasks(data));

    const handleUpdate = () => {
      setProfile(getProfile());
      setSubjects(getSubjects());
      setTopics(getTopics());
      setExams(getExams());
      setMistakes(getMistakes());
      getTodayTasks().then((data) => setTasks(data));
    };

    window.addEventListener("study_store_change", handleUpdate);
    return () => window.removeEventListener("study_store_change", handleUpdate);
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.replace("/admin/login");
      router.refresh();
    } catch {
      router.replace("/admin/login");
    }
  };

  const completedTopicsCount = topics.filter((t) => t.status === "completed").length;
  const completedTasksCount = tasks.filter((t) => t.status === "completed").length;
  const todayProgressPercent =
    tasks.length > 0 ? Math.round((completedTasksCount / tasks.length) * 100) : 0;

  const currentSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];
  const subjectTopics = topics.filter((t) => t.subjectId === selectedSubjectId);

  return (
    <main className="min-h-screen bg-[var(--background)] p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Top Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--outline)] pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-[var(--primary)] px-2.5 py-0.5 text-xs font-bold text-white">
                YKS Master Admin
              </span>
              <span className="text-xs font-semibold text-[var(--muted)]">
                Öğrenci İzleme & Takip Paneli
              </span>
            </div>
            <h1 className="mt-1 font-display text-2xl md:text-3xl font-bold tracking-tight text-[var(--ink)]">
              Öğrenci Çalışma Raporu
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/today"
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--outline)] bg-white px-3.5 py-2 text-xs font-semibold text-[var(--ink)] hover:border-[var(--primary)] transition-all shadow-2xs"
            >
              <span>Öğrenci Görünümünü Aç ↗</span>
            </Link>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 transition-all shadow-2xs active:scale-95"
            >
              <LogOut size={14} />
              <span>{loggingOut ? "Çıkılıyor..." : "Yönetici Çıkışı"}</span>
            </button>
          </div>
        </header>

        {/* Student Profile Card */}
        {profile && (
          <section className="paper-card p-6 bg-white shadow-xs">
            {/* Student Switcher Bar if database accounts exist */}
            {dbProfiles.length > 0 && (
              <div className="mb-5 flex flex-wrap items-center gap-2 pb-4 border-b border-[var(--outline)]">
                <span className="text-xs font-bold text-[var(--ink)] flex items-center gap-1.5 mr-2">
                  <User size={15} className="text-[var(--primary)]" />
                  Kayıtlı Öğrenciler ({dbProfiles.length}):
                </span>
                {dbProfiles.map((dp) => {
                  const isSelected = selectedStudentId === dp.user_id;
                  return (
                    <button
                      key={dp.user_id}
                      type="button"
                      onClick={() => setSelectedStudentId(dp.user_id)}
                      className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
                        isSelected
                          ? "bg-[var(--primary)] text-white shadow-xs ring-2 ring-[var(--primary)]/30"
                          : "border border-[var(--outline)] bg-[#fbf9f5] text-[var(--ink)] hover:bg-white hover:border-[var(--primary)]"
                      }`}
                    >
                      <span>{dp.display_name || dp.email || "Öğrenci"}</span>
                      {dp.email && (
                        <span className={`text-[10px] ${isSelected ? "text-white/80" : "text-[var(--muted)]"}`}>
                          ({dp.email})
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[var(--outline)]">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border-2 border-[var(--primary)] bg-[var(--primary-soft)] font-display text-2xl font-bold text-[var(--primary)]">
                  {(
                    dbProfiles.find((p) => p.user_id === selectedStudentId)?.display_name ||
                    profile.name
                  ).charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-display text-xl font-bold text-[var(--ink)]">
                      {dbProfiles.find((p) => p.user_id === selectedStudentId)?.display_name ||
                        profile.name}
                    </h2>
                    {dbProfiles.find((p) => p.user_id === selectedStudentId)?.email && (
                      <span className="rounded-md bg-[#fbf9f5] border border-[var(--outline)] px-2 py-0.5 text-xs text-[var(--muted)]">
                        {dbProfiles.find((p) => p.user_id === selectedStudentId)?.email}
                      </span>
                    )}
                    <span className="rounded-full bg-[var(--surface-ai)] px-2.5 py-0.5 text-xs font-bold text-[var(--primary)] border border-[#d7e8cb]">
                      {profile.examType}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[var(--muted)] flex items-center gap-1.5">
                    <GraduationCap size={15} className="text-[var(--primary)]" />
                    <span>
                      Hedef:{" "}
                      <strong>
                        {dbProfiles.find((p) => p.user_id === selectedStudentId)
                          ?.target_department || profile.targetDepartment}
                      </strong>
                      {profile.targetUniversity ? ` • ${profile.targetUniversity}` : ""}
                    </span>
                  </p>
                  <p className="mt-0.5 text-xs text-[var(--muted)]">
                    Hedef Sıralama: <strong>#{profile.targetRank.toLocaleString("tr-TR")}</strong> • Hedef Net: <strong>{profile.examTargetNet}</strong>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-[#fbf9f5] border border-[var(--outline)] text-center">
                  <p className="text-[11px] text-[var(--muted)]">Toplam Çalışma</p>
                  <p className="font-display text-lg font-bold text-[var(--ink)] mt-0.5">
                    {profile.totalHoursStudied} saat
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-[#fbf9f5] border border-[var(--outline)] text-center">
                  <p className="text-[11px] text-[var(--muted)]">Çözülen Soru</p>
                  <p className="font-display text-lg font-bold text-[var(--ink)] mt-0.5">
                    {profile.totalQuestionsSolved.toLocaleString("tr-TR")}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-[#fbf9f5] border border-[var(--outline)] text-center">
                  <p className="text-[11px] text-[var(--muted)]">Aktif Seri</p>
                  <p className="font-display text-lg font-bold text-[#ba1a1a] mt-0.5 flex items-center justify-center gap-1">
                    <Flame size={16} />
                    <span>{profile.streakDays} Gün</span>
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-[#fbf9f5] border border-[var(--outline)] text-center">
                  <p className="text-[11px] text-[var(--muted)]">Tamamlanan Konu</p>
                  <p className="font-display text-lg font-bold text-[var(--primary)] mt-0.5">
                    {completedTopicsCount} / {topics.length}
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-2 pt-4 overflow-x-auto pb-2 scrollbar-none flex-nowrap sm:flex-wrap">
              {[
                { key: "tasks", label: "Bugünün Görevleri", count: tasks.length, icon: Calendar },
                { key: "curriculum", label: "Müfredat & Konular", count: `${completedTopicsCount}/${topics.length}`, icon: BookOpen },
                { key: "exams", label: "Deneme Sınavları", count: exams.length, icon: Award },
                { key: "mistakes", label: "Hata Defteri", count: mistakes.length, icon: AlertTriangle },
                { key: "profiles", label: "Veritabanı Hesapları", count: dbProfiles.length, icon: User },
              ].map((tab) => {
                const Icon = tab.icon;
                const isSelected = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as TabKey)}
                    className={`inline-flex shrink-0 min-h-[40px] items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition-all touch-manipulation active:scale-95 ${
                      isSelected
                        ? "bg-[var(--primary)] text-white shadow-xs"
                        : "border border-[var(--outline)] bg-white text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[#fbf9f5]"
                    }`}
                  >
                    <Icon size={14} />
                    <span>{tab.label}</span>
                    <span
                      className={`ml-1 rounded-full px-1.5 py-0.2 text-[10px] ${
                        isSelected ? "bg-white/20 text-white" : "bg-[var(--surface-muted)] text-[var(--muted)]"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* TAB 1: TODAY'S TASKS */}
        {activeTab === "tasks" && (
          <section className="paper-card p-6 bg-white shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--outline)]">
              <div>
                <h3 className="font-display text-lg font-bold text-[var(--ink)]">
                  Öğrencinin Bugünkü Çalışma Planı
                </h3>
                <p className="text-xs text-[var(--muted)]">
                  Öğrencinin bugün tamamladığı ve bekleyen görevleri
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-[var(--muted)]">
                  Tamamlanma Oranı: <strong className="text-[var(--primary)]">%{todayProgressPercent}</strong> ({completedTasksCount}/{tasks.length})
                </span>
                <div className="w-24 h-2 rounded-full bg-[#efeeea] overflow-hidden">
                  <div
                    className="h-full bg-[var(--primary)] rounded-full transition-all"
                    style={{ width: `${todayProgressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {tasks.length === 0 ? (
              <div className="py-12 text-center text-xs text-[var(--muted)]">
                Öğrenci henüz bugüne bir görev eklemedi.
              </div>
            ) : (
              <div className="divide-y divide-[var(--outline)]">
                {tasks.map((task) => {
                  const isDone = task.status === "completed";
                  return (
                    <div
                      key={task.id}
                      className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                            isDone
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {isDone ? <CheckCircle2 size={16} /> : <Clock3 size={14} />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="rounded bg-[var(--surface-muted)] px-2 py-0.5 text-[11px] font-bold text-[var(--ink)]">
                              {task.subject}
                            </span>
                            <span
                              className={`text-sm font-semibold ${
                                isDone ? "line-through text-[var(--muted)]" : "text-[var(--ink)]"
                              }`}
                            >
                              {task.topic}
                            </span>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                isDone
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {isDone ? "Tamamlandı" : "Bekliyor"}
                            </span>
                          </div>
                          {task.description && (
                            <p className="text-xs text-[var(--muted)] mt-1">
                              {task.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-[var(--muted)] pl-9 sm:pl-0">
                        {task.duration && (
                          <span className="flex items-center gap-1">
                            <Timer size={13} />
                            {task.duration}
                          </span>
                        )}
                        {task.plannedQuestions && (
                          <span>• {task.plannedQuestions} Soru</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* TAB 2: CURRICULUM & TICKED TOPICS */}
        {activeTab === "curriculum" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Subjects List */}
            <div className="paper-card p-4 bg-white shadow-xs space-y-2">
              <h3 className="font-display text-sm font-bold text-[var(--ink)] px-2 mb-2">
                Ders İlerleme Durumları
              </h3>
              <div className="space-y-1 max-h-[500px] overflow-y-auto pr-1">
                {subjects.map((sub) => {
                  const isSelected = sub.id === selectedSubjectId;
                  return (
                    <button
                      key={sub.id}
                      onClick={() => setSelectedSubjectId(sub.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl text-left text-xs transition-all ${
                        isSelected
                          ? "bg-[var(--surface-ai)] border border-[#d7e8cb] font-bold text-[var(--primary)]"
                          : "hover:bg-[#fbf9f5] text-[var(--ink)]"
                      }`}
                    >
                      <div>
                        <p className="font-semibold">{sub.name}</p>
                        <p className="text-[11px] text-[var(--muted)] font-normal mt-0.5">
                          {sub.completedTopics} / {sub.topicCount} Konu
                        </p>
                      </div>
                      <span className="font-bold">%{sub.progress}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Topics Checklist Inspection */}
            <div className="paper-card p-6 bg-white shadow-xs md:col-span-2 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--outline)]">
                <div>
                  <h3 className="font-display text-base font-bold text-[var(--ink)]">
                    {currentSubject?.name} Konu Takibi
                  </h3>
                  <p className="text-xs text-[var(--muted)]">
                    Öğrencinin tiklediği (çalıştığı) ve henüz başlamadığı konular
                  </p>
                </div>
                <span className="rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1">
                  %{currentSubject?.progress} Tamamlandı
                </span>
              </div>

              <div className="divide-y divide-[var(--outline)] max-h-[440px] overflow-y-auto pr-2">
                {subjectTopics.map((topic) => {
                  const isDone = topic.status === "completed";
                  return (
                    <div
                      key={topic.id}
                      className="py-3 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg ${
                            isDone
                              ? "bg-emerald-600 text-white"
                              : "border border-[var(--outline)] bg-[#fbf9f5] text-[var(--muted)]"
                          }`}
                        >
                          {isDone ? <CheckCircle2 size={15} /> : null}
                        </div>
                        <span
                          className={`font-semibold ${
                            isDone ? "text-emerald-900" : "text-[var(--ink)]"
                          }`}
                        >
                          {topic.name}
                        </span>
                      </div>

                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                          isDone
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-[var(--surface-muted)] text-[var(--muted)]"
                        }`}
                      >
                        {isDone ? "Çalışıldı ✓" : "Çalışılmadı"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: EXAMS & SCORES */}
        {activeTab === "exams" && (
          <section className="paper-card p-6 bg-white shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--outline)]">
              <div>
                <h3 className="font-display text-lg font-bold text-[var(--ink)]">
                  Öğrencinin Girdiği Deneme Sınavları
                </h3>
                <p className="text-xs text-[var(--muted)]">
                  Tüm TYT ve AYT deneme netleri ve ders dökümleri
                </p>
              </div>
              <span className="text-xs font-semibold text-[var(--muted)]">
                Toplam {exams.length} Deneme
              </span>
            </div>

            {exams.length === 0 ? (
              <div className="py-12 text-center text-xs text-[var(--muted)]">
                Öğrenci henüz sisteme deneme sınavı kaydetmedi.
              </div>
            ) : (
              <div className="space-y-4">
                {exams.map((exam) => {
                  const net = totalNet(exam);
                  return (
                    <div
                      key={exam.id}
                      className="p-4 rounded-xl border border-[var(--outline)] bg-[#fbf9f5] space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--outline)] pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="rounded bg-[var(--primary)] text-white text-[11px] font-bold px-2 py-0.5">
                            {exam.type}
                          </span>
                          <h4 className="font-display text-sm font-bold text-[var(--ink)]">
                            {exam.name}
                          </h4>
                          <span className="text-xs text-[var(--muted)]">• {exam.date}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-[var(--muted)] mr-1.5">Toplam Net:</span>
                          <span className="font-display text-lg font-bold text-[var(--primary)]">
                            {formatNet(net)}
                          </span>
                        </div>
                      </div>

                      {/* Section breakdown */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        {exam.results?.map((res) => {
                          const sectionNet = res.correct - res.wrong / 4;
                          return (
                            <div
                              key={res.section}
                              className="p-2 rounded-lg bg-white border border-[var(--outline)]"
                            >
                              <div className="flex justify-between font-semibold text-[var(--ink)]">
                                <span>{res.section}</span>
                                <span className="text-[var(--primary)]">{formatNet(sectionNet)}</span>
                              </div>
                              <div className="mt-1 text-[11px] text-[var(--muted)] flex justify-between">
                                <span>{res.correct}D / {res.wrong}Y</span>
                                <span>{res.blank}B</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* TAB 4: MISTAKES NOTEBOOK */}
        {activeTab === "mistakes" && (
          <section className="paper-card p-6 bg-white shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--outline)]">
              <div>
                <h3 className="font-display text-lg font-bold text-[var(--ink)]">
                  Öğrencinin Hata Defteri
                </h3>
                <p className="text-xs text-[var(--muted)]">
                  Denemelerde ve testlerde yanlış yapılan soruların analizi
                </p>
              </div>
              <span className="text-xs font-semibold text-[var(--muted)]">
                Toplam {mistakes.length} Yanlış Kaydı
              </span>
            </div>

            {mistakes.length === 0 ? (
              <div className="py-12 text-center text-xs text-[var(--muted)]">
                Öğrencinin henüz hata defterinde bir kayıt bulunmuyor.
              </div>
            ) : (
              <div className="divide-y divide-[var(--outline)]">
                {mistakes.map((mistake) => (
                  <div
                    key={mistake.id}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-[var(--surface-muted)] px-2 py-0.5 text-[11px] font-bold text-[var(--ink)]">
                          {mistake.subject}
                        </span>
                        <span className="font-display text-sm font-bold text-[var(--ink)]">
                          {mistake.topic}
                        </span>
                        <span className="rounded-full bg-red-100 text-red-800 px-2 py-0.5 text-[10px] font-bold">
                          {mistake.reason === "concept"
                            ? "Konu Eksiği"
                            : mistake.reason === "attention"
                            ? "Dikkat Hatası"
                            : mistake.reason === "calculation"
                            ? "İşlem Hatası"
                            : mistake.reason === "time"
                            ? "Süre Yetmedi"
                            : "Diğer"}
                        </span>
                      </div>
                      {mistake.note && (
                        <p className="mt-1.5 text-xs text-[var(--muted)] leading-relaxed bg-[#fbf9f5] p-2.5 rounded-lg border border-[var(--outline)]">
                          &ldquo;{mistake.note}&rdquo;
                        </p>
                      )}
                    </div>
                    {mistake.date && (
                      <span className="text-[11px] text-[var(--muted)] shrink-0">
                        {mistake.date}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* TAB 5: DATABASE ACCOUNTS */}
        {activeTab === "profiles" && (
          <section className="paper-card p-6 bg-white shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--outline)]">
              <div>
                <h3 className="font-display text-lg font-bold text-[var(--ink)]">
                  Supabase Veritabanındaki Kayıtlı Hesaplar
                </h3>
                <p className="text-xs text-[var(--muted)]">
                  Bulut veritabanına kaydolan tüm öğrenci profilleri
                </p>
              </div>
              <span className="rounded-full bg-[var(--surface-ai)] text-[var(--primary)] text-xs font-bold px-3 py-1 border border-[#d7e8cb]">
                {dbProfiles.length} Kayıt
              </span>
            </div>

            {dbProfiles.length === 0 ? (
              <div className="py-12 text-center text-xs text-[var(--muted)]">
                Bulut veritabanında henüz kayıtlı bir hesap bulunmuyor.
              </div>
            ) : (
              <div className="divide-y divide-[var(--outline)]">
                {dbProfiles.map((p) => {
                  const isSelected = selectedStudentId === p.user_id;
                  return (
                    <div
                      key={p.user_id}
                      className={`py-3.5 px-3 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-colors ${
                        isSelected
                          ? "bg-[var(--surface-ai)] border border-[#d7e8cb]"
                          : "hover:bg-[#fbf9f5]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--outline)] bg-[var(--primary-soft)] font-display text-sm font-bold text-[var(--primary)]">
                          {(p.display_name || p.email || "Ö").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-sm text-[var(--ink)]">
                              {p.display_name || "Öğrenci"}
                            </p>
                            {p.email && (
                              <span className="rounded bg-white border border-[var(--outline)] px-2 py-0.5 text-[11px] font-medium text-[var(--muted)]">
                                {p.email}
                              </span>
                            )}
                            {isSelected && (
                              <span className="rounded-full bg-[var(--primary)] text-white px-2 py-0.2 text-[10px] font-bold">
                                Seçili Öğrenci
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[var(--muted)] mt-0.5">
                            {p.target_department || "Hedef Bölüm Belirtilmemiş"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                        <div className="text-left sm:text-right">
                          <span className="text-[11px] text-[var(--muted)] block">
                            Kayıt: {new Date(p.created_at).toLocaleDateString("tr-TR")}
                          </span>
                          {p.last_sign_in_at && (
                            <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">
                              Son Giriş: {new Date(p.last_sign_in_at).toLocaleDateString("tr-TR")}
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedStudentId(p.user_id);
                            setActiveTab("tasks");
                          }}
                          className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all shadow-2xs ${
                            isSelected
                              ? "bg-[var(--primary)] text-white"
                              : "border border-[var(--outline)] bg-white text-[var(--ink)] hover:bg-[var(--surface-muted)]"
                          }`}
                        >
                          {isSelected ? "İnceleniyor" : "Öğrenciyi Seç"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
