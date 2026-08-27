"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  BookOpenCheck,
  CheckCircle2,
  Flame,
  Lightbulb,
  RotateCcw,
  Sparkles,
  Target,
  Timer,
  TrendingUp,
  Zap,
} from "lucide-react";
import { formatNet, totalNet } from "@/lib/analytics";
import { defaultProfile, subjects as defaultSubjects } from "@/lib/mock-data";
import {
  getExams,
  getMistakes,
  getProfile,
  getSubjects,
  getTopics,
} from "@/lib/study-store";
import type { Exam, Subject, UserProfile } from "@/types/study";
import { StudyHeatmap } from "@/components/analytics/study-heatmap";
import { MistakeTracker } from "@/components/analytics/mistake-tracker";

const filters = ["7 gün", "30 gün", "3 ay", "Tümü"];
const weeklyMinutes = [
  { day: "Pzt", mins: 0, percent: 0 },
  { day: "Sal", mins: 0, percent: 0 },
  { day: "Çar", mins: 0, percent: 0 },
  { day: "Per", mins: 0, percent: 0 },
  { day: "Cum", mins: 0, percent: 0 },
  { day: "Cmt", mins: 0, percent: 0 },
  { day: "Paz", mins: 0, percent: 0 },
];

type AiReportData = {
  readinessScore: number;
  executiveSummary: string;
  projectedNet: string;
  tempoEvaluation: string;
  strengths: string[];
  bottlenecks: string[];
  actionRoadmap: Array<{
    step: number;
    title: string;
    description: string;
    expectedGain: string;
  }>;
};

export function AnalyticsPage() {
  const [filter, setFilter] = useState("30 gün");
  const [examsList, setExamsList] = useState<Exam[]>([]);
  const [subjectsList, setSubjectsList] = useState<Subject[]>(defaultSubjects);
  const [profile, setProfile] = useState<UserProfile | null>(defaultProfile);

  const [aiReport, setAiReport] = useState<AiReportData | null>(null);
  const [aiLoading, setAiLoading] = useState<boolean>(true);
  const [aiError, setAiError] = useState<string>("");

  const fetchAiAnalysis = async () => {
    setAiLoading(true);
    setAiError("");
    const p = getProfile();
    const subjs = getSubjects();
    const tops = getTopics();
    const exms = getExams();
    const mists = getMistakes();

    const completed = tops.filter((t) => t.status === "completed").map((t) => t.name);
    const uncompleted = tops.filter((t) => t.status !== "completed").map((t) => t.name);

    try {
      const res = await fetch("/api/analytics/ai-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context: {
            profile: p,
            subjects: subjs,
            completedTopics: completed,
            uncompletedTopics: uncompleted,
            recentExams: exms.slice(0, 4).map((e) => ({
              name: e.name,
              type: e.type,
              date: e.date,
              totalNet: e.results?.reduce((acc, r) => acc + (r.correct - r.wrong / 4), 0),
            })),
            mistakes: mists,
          },
        }),
      });

      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      setAiReport(data);
    } catch {
      setAiReport(null);
      setAiError("AI analizine şu anda ulaşılamıyor. Lütfen daha sonra tekrar dene.");
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    async function loadReport() {
      const p = getProfile();
      const subjs = getSubjects();
      const tops = getTopics();
      const exms = getExams();
      const mists = getMistakes();

      const completed = tops.filter((t) => t.status === "completed").map((t) => t.name);
      const uncompleted = tops.filter((t) => t.status !== "completed").map((t) => t.name);

      try {
        const res = await fetch("/api/analytics/ai-report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            context: {
              profile: p,
              subjects: subjs,
              completedTopics: completed,
              uncompletedTopics: uncompleted,
              recentExams: exms.slice(0, 4).map((e) => ({
                name: e.name,
                type: e.type,
                date: e.date,
                totalNet: e.results?.reduce((acc, r) => acc + (r.correct - r.wrong / 4), 0),
              })),
              mistakes: mists,
            },
          }),
        });

        if (!res.ok) throw new Error("API error");
        const data = await res.json();
        if (active) {
          setAiReport(data);
          setAiError("");
          setAiLoading(false);
        }
      } catch {
        if (active) {
          setAiReport(null);
          setAiError("AI analizine şu anda ulaşılamıyor. Lütfen daha sonra tekrar dene.");
          setAiLoading(false);
        }
      }
    }

    const handleUpdate = () => {
      setExamsList(getExams());
      setSubjectsList(getSubjects());
      setProfile(getProfile());
    };

    const timer = setTimeout(() => {
      handleUpdate();
      loadReport();
    }, 0);

    window.addEventListener("study_store_change", handleUpdate);
    return () => {
      active = false;
      clearTimeout(timer);
      window.removeEventListener("study_store_change", handleUpdate);
    };
  }, []);

  const latestExam = examsList[0];

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-6 md:px-10 md:py-10">
      {/* Header */}
      <header className="mb-7 flex flex-col gap-4 border-b border-[var(--outline)] pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="rounded-full bg-[var(--surface-ai)] px-2.5 py-0.5 text-xs font-bold text-[var(--primary)] border border-[#d7e8cb] flex items-center gap-1">
              <Sparkles size={13} /> DeepSeek AI Destekli
            </span>
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-[var(--ink)]">
            Analiz ve Performans Teşhisi
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Çalışma ritmini, deneme net artışını ve yapay zeka başarı teşhisini tek ekranda incele.
          </p>
        </div>

        <div className="flex gap-1 overflow-x-auto hide-scrollbar">
          {filters.map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={`app-focus shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                filter === item
                  ? "bg-[var(--primary)] text-white shadow-xs"
                  : "border border-[var(--outline)] bg-white text-[var(--muted)] hover:bg-[var(--surface-muted)]"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </header>

      {/* Top Metrics Row */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 mb-8">
        <Metric
          icon={<Timer size={20} />}
          label="Çalışma Süresi"
          value={profile ? `${profile.totalHoursStudied} saat` : "0 saat"}
        />
        <Metric
          icon={<BookOpenCheck size={20} />}
          label="Çözülen Soru"
          value={profile ? profile.totalQuestionsSolved.toLocaleString("tr-TR") : "0"}
        />
        <Metric
          icon={<Target size={20} />}
          label="Tamamlanan Konu"
          value={`${subjectsList.reduce((acc, s) => acc + s.completedTopics, 0)} Konu`}
        />
        <Metric
          icon={<Flame size={20} className="text-[#ba1a1a]" />}
          label="Çalışma Serisi"
          value={profile ? `${profile.streakDays} Gün` : "0 Gün"}
        />
        <Metric
          icon={<TrendingUp size={20} />}
          label="Son Deneme Neti"
          value={latestExam ? `${formatNet(totalNet(latestExam))} Net` : "-"}
        />
      </div>

      {/* ============================================================ */}
      {/* 🧠 DEEPSEEK AI PERFORMANCE DIAGNOSIS CARD */}
      {/* ============================================================ */}
      <section className="paper-card p-6 md:p-8 bg-white mb-8 border border-[#d7e8cb] shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[var(--outline)]">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--surface-ai)] text-[var(--primary)] border border-[#d7e8cb] shadow-2xs">
              <Sparkles size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-xl font-bold text-[var(--ink)]">
                  DeepSeek AI Başarı & Net Teşhisi
                </h2>
                <span className="rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-bold">
                  Canlı Analiz
                </span>
              </div>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                Hedeflediğin {profile?.targetDepartment || "bölüm"} için çalışma verilerinin ölçme-değerlendirme analizi
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={fetchAiAnalysis}
            disabled={aiLoading}
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--outline)] bg-[#fbf9f5] px-4 py-2 text-xs font-semibold text-[var(--ink)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all self-start sm:self-auto disabled:opacity-50 active:scale-95"
          >
            <RotateCcw size={14} className={aiLoading ? "animate-spin text-[var(--primary)]" : ""} />
            <span>{aiLoading ? "Analiz Ediliyor..." : "Analizi Yenile"}</span>
          </button>
        </div>

        {aiLoading && !aiReport ? (
          <div className="py-16 text-center text-xs text-[var(--muted)] flex flex-col items-center justify-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-3 border-[var(--surface-muted)] border-t-[var(--primary)]" />
            <span>DeepSeek yapay zekası performans verilerini inceliyor...</span>
          </div>
        ) : aiError ? (
          <div role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-800">
            {aiError}
          </div>
        ) : aiReport ? (
          <div className="mt-6 space-y-6 animate-in fade-in">
            {/* Top Insight Bento Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Readiness Score */}
              <div className="p-4 rounded-xl bg-[var(--surface-ai)] border border-[#d7e8cb] flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-[var(--primary)] font-display text-2xl font-bold border border-[#d7e8cb] shadow-2xs">
                  %{aiReport.readinessScore}
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-[var(--muted)] block">
                    Hedef Hazırlık Skoru
                  </span>
                  <span className="font-display text-sm font-bold text-[var(--ink)]">
                    {aiReport.readinessScore >= 70
                      ? "Yüksek Hedef Uyumu"
                      : aiReport.readinessScore >= 40
                      ? "Gelişme Aşamasında"
                      : "Başlangıç Seviyesi"}
                  </span>
                </div>
              </div>

              {/* Projected Net Range */}
              <div className="p-4 rounded-xl bg-[#fbf9f5] border border-[var(--outline)] flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-[var(--primary)] font-display text-xl font-bold border border-[var(--outline)] shadow-2xs">
                  <TrendingUp size={24} />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-[var(--muted)] block">
                    Öngörülen Net Potansiyeli
                  </span>
                  <span className="font-display text-base font-bold text-[var(--ink)]">
                    {aiReport.projectedNet}
                  </span>
                </div>
              </div>

              {/* Tempo Evaluation */}
              <div className="p-4 rounded-xl bg-[#fbf9f5] border border-[var(--outline)] flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-amber-600 font-display text-xl font-bold border border-[var(--outline)] shadow-2xs">
                  <Zap size={24} />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-[var(--muted)] block">
                    Çalışma Temposu
                  </span>
                  <span className="text-xs font-semibold text-[var(--ink)] line-clamp-2">
                    {aiReport.tempoEvaluation}
                  </span>
                </div>
              </div>
            </div>

            {/* Executive Summary */}
            <div className="p-4 rounded-xl bg-[#f4f8f2] border border-[#d7e8cb] text-sm text-[var(--ink)] leading-relaxed">
              <span className="font-bold text-[var(--primary)] mr-1.5 flex items-center gap-1 inline-flex">
                <Lightbulb size={16} /> Yapay Zeka Değerlendirmesi:
              </span>
              {aiReport.executiveSummary}
            </div>

            {/* Strengths & Bottlenecks 2-Col Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Strengths */}
              <div className="p-5 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-2.5">
                <h3 className="font-display text-sm font-bold text-emerald-950 flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-700" />
                  Güçlü Alanlar & İlerlemeler
                </h3>
                <ul className="space-y-1.5 text-xs text-emerald-900">
                  {aiReport.strengths.map((str, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold">•</span>
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Bottlenecks */}
              <div className="p-5 rounded-xl border border-amber-200 bg-amber-50/50 space-y-2.5">
                <h3 className="font-display text-sm font-bold text-amber-950 flex items-center gap-2">
                  <AlertCircle size={16} className="text-amber-700" />
                  Kritik Darboğazlar & Net Kayıpları
                </h3>
                <ul className="space-y-1.5 text-xs text-amber-900">
                  {aiReport.bottlenecks.map((btn, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-amber-600 font-bold">•</span>
                      <span>{btn}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Action Roadmap: Top 3 Moves */}
            <div className="space-y-3 pt-2">
              <h3 className="font-display text-sm font-bold text-[var(--ink)] flex items-center gap-2">
                <Target size={16} className="text-[var(--primary)]" />
                Net Artışı Sağlayacak Öncelikli 3 Hamle
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {aiReport.actionRoadmap.map((item) => (
                  <div
                    key={item.step}
                    className="p-4 rounded-xl border border-[var(--outline)] bg-white flex flex-col justify-between hover:border-[var(--primary)] transition-all shadow-2xs"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--primary-soft)] text-[var(--primary)] text-xs font-bold">
                          {item.step}
                        </span>
                        <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5">
                          {item.expectedGain}
                        </span>
                      </div>
                      <h4 className="font-display text-xs font-bold text-[var(--ink)]">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-[var(--muted)] mt-1 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </section>

      {/* Main Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr] mb-6">
        {/* Weekly Study Hours Bar Chart */}
        <section className="paper-card p-6 bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-bold text-[var(--ink)]">
                Haftalık Çalışma Süresi Dağılımı
              </h2>
              <p className="text-xs text-[var(--muted)] mt-0.5">Son 7 günün günlük çalışma yoğunluğu</p>
            </div>
            <span className="text-xs font-bold text-[var(--primary)] bg-[var(--surface-ai)] px-2.5 py-1 rounded-full border border-[#d7e8cb]">
              Toplam {profile?.totalHoursStudied ? `${profile.totalHoursStudied} saat` : "0 saat"}
            </span>
          </div>

          {profile && profile.totalHoursStudied > 0 ? (
            <>
              <div className="mt-8 flex h-48 items-end justify-between gap-3 border-b border-[var(--outline)] pb-2 px-2">
                {weeklyMinutes.map((item, index) => (
                  <div key={index} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5 group">
                    <span className="text-[10px] font-semibold text-[var(--muted)] opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      {Math.round(item.mins / 60)}s
                    </span>
                    <div
                      className={`w-full rounded-t-lg transition-all ${
                        index === 5 ? "bg-[var(--primary)]" : "bg-[#aeb8a4] hover:bg-[var(--primary)]"
                      }`}
                      style={{ height: `${item.percent}%` }}
                    />
                  </div>
                ))}
              </div>
              <div className="mt-3 flex justify-between text-xs font-semibold text-[var(--muted)] px-2">
                {weeklyMinutes.map((item) => (
                  <span key={item.day}>{item.day}</span>
                ))}
              </div>
            </>
          ) : (
            <div className="py-16 text-center text-xs text-[var(--muted)]">
              Henüz çalışma süresi kaydedilmedi. Çalıştıkça haftalık tempo grafiğin burada oluşacaktır.
            </div>
          )}
        </section>

        {/* Subject Progress Section */}
        <section className="paper-card p-6 bg-white shadow-xs">
          <h2 className="font-display text-lg font-bold text-[var(--ink)] mb-4">
            Ders Tamamlanma Oranları
          </h2>
          <div className="space-y-4">
            {subjectsList.slice(0, 5).map((subj) => (
              <Progress key={subj.id} label={subj.name} value={subj.progress} />
            ))}
          </div>
        </section>
      </div>

      {/* Bottom Grid: Question Distribution & Exam Progress */}
      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        {/* Question Distribution */}
        <section className="paper-card p-6 bg-white shadow-xs">
          <h2 className="font-display text-lg font-bold text-[var(--ink)] mb-1">
            Soru Çözüm Dağılımı
          </h2>
          <p className="text-xs text-[var(--muted)] mb-5">Derslere göre çözülen soru yüzdeleri</p>

          {profile && profile.totalQuestionsSolved > 0 ? (
            <div className="space-y-3.5">
              <Distribution label="TYT Matematik" value={40} color="bg-[var(--primary)]" />
              <Distribution label="TYT Türkçe" value={30} color="bg-[#8f9b85]" />
              <Distribution label="Fen Bilimleri" value={20} color="bg-[#b8c2ae]" />
              <Distribution label="Sosyal Bilimler" value={10} color="bg-[#d5d8d1]" />
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-[var(--muted)]">
              Henüz soru çözümü girilmedi. Çözülen sorular kaydedildikçe ders dağılımı burada hesaplanacaktır.
            </div>
          )}
        </section>

        {/* Exam Net Progression */}
        <section className="paper-card p-6 bg-white shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-lg font-bold text-[var(--ink)]">
                Deneme Net İlerlemesi
              </h2>
              <p className="text-xs text-[var(--muted)] mt-0.5">Son çözülen TYT denemeleri</p>
            </div>
            {latestExam && (
              <span className="font-display text-lg font-bold text-[var(--primary)]">
                Son: {formatNet(totalNet(latestExam))} Net
              </span>
            )}
          </div>

          {examsList.length === 0 ? (
            <div className="py-12 text-center text-xs text-[var(--muted)]">
              Henüz deneme kaydı girilmedi. Deneme ekledikçe net artış grafiğin burada görüntülenecektir.
            </div>
          ) : (
            <div className="mt-8 flex h-36 items-end gap-5 border-b border-[var(--outline)] px-4 pb-2">
              {examsList.slice(0, 5).map((exam, index) => {
                const net = totalNet(exam);
                const maxNet = 120;
                const heightPercent = Math.min(100, Math.round((net / maxNet) * 100));
                return (
                  <div key={exam.id} className="flex flex-1 flex-col items-center gap-2 group">
                    <span className="text-xs font-semibold text-[var(--primary)] opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      {formatNet(net)}
                    </span>
                    <div
                      className={`w-full max-w-[48px] rounded-t-lg transition-all ${
                        index === 0 ? "bg-[var(--primary)]" : "bg-[#aeb8a4] hover:bg-[var(--primary)]"
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                    <span className="text-[11px] font-medium text-[var(--muted)] truncate max-w-[60px]">
                      {exam.name.split(" ")[0]}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* 16-Week Activity Heatmap */}
        <StudyHeatmap streakDays={profile?.streakDays || 7} />

        {/* Mistakes & Weak Topics Tracker */}
        <MistakeTracker />
      </div>
    </div>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="paper-card p-4 bg-white flex items-center gap-3.5 shadow-xs">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--surface-muted)] text-[var(--primary)]">
        {icon}
      </div>
      <div>
        <p className="text-xs text-[var(--muted)]">{label}</p>
        <p className="font-display text-base md:text-lg font-bold text-[var(--ink)] mt-0.5">
          {value}
        </p>
      </div>
    </div>
  );
}

function Progress({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between text-xs font-medium text-[var(--ink)] mb-1.5">
        <span>{label}</span>
        <span className="font-bold text-[var(--primary)]">%{value}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-[#efeeea] overflow-hidden">
        <div
          className="h-full bg-[var(--primary)] rounded-full transition-all duration-300"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function Distribution({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs font-medium text-[var(--ink)] mb-1">
        <span>{label}</span>
        <span className="font-bold">{value}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-[#efeeea] overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
