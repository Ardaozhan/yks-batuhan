"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Award,
  Calculator,
  Calendar,
  ChevronRight,
  Plus,
  Sparkles,
  TrendingUp,
  X,
} from "lucide-react";
import { calculateNet, formatNet, totalNet } from "@/lib/analytics";
import { EmptyExamsIllustration } from "@/components/ui/animated-illustrations";
import { addExam, getExams } from "@/lib/study-store";
import type { Exam, ExamResult, ExamType } from "@/types/study";

export function ExamsPage() {
  const [examsList, setExamsList] = useState<Exam[]>(() => getExams());
  const [filter, setFilter] = useState<"all" | "TYT" | "AYT">("all");
  const [addModalOpen, setAddModalOpen] = useState(false);

  useEffect(() => {
    const handleUpdate = () => setExamsList(getExams());
    window.addEventListener("study_store_change", handleUpdate);
    return () => window.removeEventListener("study_store_change", handleUpdate);
  }, []);

  const filtered = examsList.filter((e) => {
    if (filter === "all") return true;
    return e.type === filter;
  });

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-6 md:px-10 md:py-10">
      {/* Header */}
      <header className="mb-7 flex flex-col gap-4 border-b border-[var(--outline)] pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-[var(--ink)]">
            Denemelerim
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Tüm TYT ve AYT deneme sonuçlarını kaydet, net değişimini ve branş dağılımını incele.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Filter Pills */}
          <div className="inline-flex h-9 items-center rounded-xl border border-[var(--outline)] bg-[#fbf9f5] p-1 text-xs font-semibold">
            <button
              onClick={() => setFilter("all")}
              className={`rounded-lg px-3 py-1 transition-all ${
                filter === "all"
                  ? "bg-[var(--primary)] text-white shadow-xs"
                  : "text-[var(--muted)] hover:text-[var(--ink)]"
              }`}
            >
              Tümü
            </button>
            <button
              onClick={() => setFilter("TYT")}
              className={`rounded-lg px-3 py-1 transition-all ${
                filter === "TYT"
                  ? "bg-[var(--primary)] text-white shadow-xs"
                  : "text-[var(--muted)] hover:text-[var(--ink)]"
              }`}
            >
              TYT
            </button>
            <button
              onClick={() => setFilter("AYT")}
              className={`rounded-lg px-3 py-1 transition-all ${
                filter === "AYT"
                  ? "bg-[var(--primary)] text-white shadow-xs"
                  : "text-[var(--muted)] hover:text-[var(--ink)]"
              }`}
            >
              AYT
            </button>
          </div>

          <Link
            href="/simulator"
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-[#d7e8cb] bg-[var(--surface-ai)] px-3.5 text-xs font-bold text-[var(--primary)] hover:bg-[#d7e8cb] transition-all shadow-2xs active:scale-95 touch-manipulation"
          >
            <Calculator size={15} />
            <span>Sıralama Simülatörü ↗</span>
          </Link>

          <button
            onClick={() => setAddModalOpen(true)}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-[var(--primary)] px-4 text-xs font-bold text-white shadow-xs hover:bg-[var(--primary-strong)] active:scale-95 transition-all touch-manipulation"
          >
            <Plus size={16} />
            <span>Deneme Ekle</span>
          </button>
        </div>
      </header>

      {/* Exam Cards */}
      {filtered.length === 0 ? (
        <div className="paper-card p-6 sm:p-10 text-center bg-white shadow-xs">
          <EmptyExamsIllustration className="mb-2" />
          <h3 className="font-display text-lg font-bold text-[var(--ink)]">
            Henüz deneme sınavı eklenmedi
          </h3>
          <p className="mt-1 text-sm text-[var(--muted)] max-w-md mx-auto">
            Çözdüğün TYT ve AYT denemelerini kaydederek ders bazında net gelişimini ve yapay zeka analizlerini takip edebilirsin.
          </p>
          <div className="mt-5">
            <button
              onClick={() => setAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--primary)] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[var(--primary-strong)] active:scale-95 transition-all shadow-xs"
            >
              <Plus size={16} />
              <span>İlk Denemeni Ekle</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((exam) => (
            <ExamCard key={exam.id} exam={exam} />
          ))}
        </div>
      )}

      {addModalOpen && <AddExamModal onClose={() => setAddModalOpen(false)} />}
    </div>
  );
}

function ExamCard({ exam }: { exam: Exam }) {
  const net = totalNet(exam);

  return (
    <Link
      href={`/exams/${exam.id}`}
      className="paper-card group relative flex flex-col sm:flex-row sm:items-center justify-between gap-5 p-5 bg-white transition-all hover:border-[var(--primary)] hover:shadow-[0_4px_20px_rgba(25,26,24,0.04)]"
    >
      <div className="flex items-start sm:items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--surface-ai)] text-[var(--primary)]">
          <Award size={24} />
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span
              className={`rounded-md px-2 py-0.5 text-xs font-bold ${
                exam.type === "TYT"
                  ? "bg-[var(--secondary-container)] text-[var(--on-secondary-container)]"
                  : "bg-[#E9EEE6] text-[#4E5D47]"
              }`}
            >
              {exam.type}
            </span>
            <span className="text-xs text-[var(--muted)]">{exam.date}</span>
          </div>
          <h2 className="font-display text-base font-bold text-[var(--ink)] group-hover:text-[var(--primary)] transition-colors">
            {exam.name}
          </h2>

          {/* Section mini badges */}
          <div className="mt-2 flex flex-wrap gap-2">
            {exam.results.map((res) => (
              <span
                key={res.section}
                className="rounded bg-[var(--surface-muted)] px-2 py-0.5 text-[11px] text-[var(--muted)]"
              >
                {res.section}:{" "}
                <strong className="text-[var(--ink)] font-semibold">
                  {formatNet(calculateNet(res))}
                </strong>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-[var(--outline)]">
        <div className="text-left sm:text-right">
          <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--muted)]">
            Toplam Net
          </p>
          <p className="font-display text-3xl font-extrabold text-[var(--primary)]">
            {formatNet(net)}
          </p>
        </div>
        <ChevronRight size={20} className="text-[var(--muted)] group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  );
}

export function ExamDetailPage({ examId }: { examId: string }) {
  const [allExams, setAllExams] = useState<Exam[]>(() => getExams());
  const [exam, setExam] = useState<Exam | null>(() => {
    const list = getExams();
    return list.find((e) => e.id === examId) || list[0] || null;
  });

  useEffect(() => {
    const handleUpdate = () => {
      const list = getExams();
      setAllExams(list);
      setExam(list.find((e) => e.id === examId) || list[0] || null);
    };
    window.addEventListener("study_store_change", handleUpdate);
    return () => window.removeEventListener("study_store_change", handleUpdate);
  }, [examId]);

  if (!exam) {
    return (
      <div className="mx-auto max-w-[800px] px-4 py-16 text-center">
        <h2 className="font-display text-2xl font-bold text-[var(--ink)]">Deneme Bulunamadı</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">Bu deneme kaydı henüz oluşturulmamış veya silinmiş olabilir.</p>
        <Link
          href="/exams"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[var(--primary-strong)]"
        >
          <ArrowLeft size={16} />
          <span>Denemelere Dön</span>
        </Link>
      </div>
    );
  }

  const currentNet = totalNet(exam);
  const sameType = allExams.filter((e) => e.type === exam.type);
  const examIndex = sameType.findIndex((e) => e.id === exam.id);
  const previous = examIndex < sameType.length - 1 ? sameType[examIndex + 1] : null;
  const difference = previous ? currentNet - totalNet(previous) : null;

  return (
    <div className="mx-auto max-w-[1000px] px-4 py-6 md:px-10 md:py-10">
      <Link
        href="/exams"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--muted)] hover:text-[var(--primary)] transition-colors mb-4"
      >
        <ArrowLeft size={16} />
        <span>Denemelerime Dön</span>
      </Link>

      {/* Header */}
      <header className="mb-6 border-b border-[var(--outline)] pb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="rounded-md bg-[var(--secondary-container)] px-2.5 py-0.5 text-xs font-bold text-[var(--on-secondary-container)]">
            {exam.type}
          </span>
          <span className="text-xs text-[var(--muted)] flex items-center gap-1">
            <Calendar size={13} />
            {exam.date}
          </span>
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-[var(--ink)]">
          {exam.name}
        </h1>
      </header>

      {/* Net & AI Bento */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_1.3fr] mb-6">
        {/* Total Net Card */}
        <section className="paper-card p-6 bg-white flex flex-col justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-[var(--muted)]">Toplam Net</p>
            <p className="font-display text-5xl font-extrabold text-[var(--primary)] mt-1">
              {formatNet(currentNet)}
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-[var(--outline)]">
            {difference !== null ? (
              <p
                className={`text-xs font-semibold flex items-center gap-1 ${
                  difference >= 0 ? "text-[var(--primary)]" : "text-[var(--danger)]"
                }`}
              >
                <TrendingUp size={15} />
                <span>
                  {difference >= 0 ? `+${formatNet(difference)}` : formatNet(difference)} net
                  (önceki denemeye göre)
                </span>
              </p>
            ) : (
              <p className="text-xs text-[var(--muted)]">İlk kaydedilen {exam.type} denemesi</p>
            )}
          </div>
        </section>

        {/* AI Analysis Card */}
        <section className="rounded-2xl border border-[#d7e8cb] bg-[#E9EEE6] p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#4E5D47] mb-2">
              <Sparkles size={16} className="text-[#526049]" />
              <span>Yapay Zeka Deneme Analizi</span>
            </div>
            <p className="text-xs leading-relaxed text-[#4E5D47]">
              {exam.type === "TYT"
                ? "Türkçe ve Sosyal bölümlerinde istikrarlı bir net yakaladın. Matematikte süre kontrolünü artırarak ve Geometriden 3-4 soru ekleyerek 85+ net bandına kolayca çıkabilirsin."
                : "Matematik temelin güçlü. Fizikteki hareket ve elektrik sorularındaki yanlışları kapatmak netini doğrudan 60 üzerine taşıyacaktır."}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-[#d7e8cb]">
            <Link
              href="/coach"
              className="text-xs font-semibold text-[var(--primary)] hover:underline inline-flex items-center gap-1"
            >
              Koçumla bu denemeyi konuş →
            </Link>
          </div>
        </section>
      </div>

      {/* Section Breakdown Table */}
      <section className="paper-card bg-white overflow-hidden mb-6 shadow-xs">
        <div className="p-5 border-b border-[var(--outline)]">
          <h2 className="font-display text-lg font-bold text-[var(--ink)]">Bölüm Dağılımı</h2>
        </div>

        <div className="divide-y divide-[var(--outline)]">
          {exam.results.map((res) => {
            const sectionNet = calculateNet(res);
            return (
              <div key={res.section} className="p-4 flex items-center justify-between hover:bg-[#fbf9f5] transition-colors">
                <div>
                  <h3 className="font-display font-semibold text-sm text-[var(--ink)]">
                    {res.section}
                  </h3>
                  <p className="text-xs text-[var(--muted)] mt-0.5">
                    {res.correct} Doğru • {res.wrong} Yanlış • {res.blank} Boş
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-display text-xl font-bold text-[var(--primary)]">
                    {formatNet(sectionNet)}
                  </p>
                  <span className="text-[10px] text-[var(--muted)]">Net</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Net Progression Chart */}
      <section className="paper-card p-6 bg-white shadow-xs">
        <h2 className="font-display text-base font-bold text-[var(--ink)] mb-4">
          Son {exam.type} Denemelerinde Net Gelişimi
        </h2>
        <div className="flex h-36 items-end gap-5 border-b border-[var(--outline)] px-4 pb-2">
          {sameType.slice(0, 4).reverse().map((e) => {
            const val = totalNet(e);
            const heightPercent = Math.min(100, Math.round((val / 120) * 100));
            const isCurrent = e.id === exam.id;

            return (
              <div key={e.id} className="flex flex-1 flex-col items-center justify-end gap-2">
                <span className={`text-xs font-bold ${isCurrent ? "text-[var(--primary)]" : "text-[var(--muted)]"}`}>
                  {formatNet(val)}
                </span>
                <div
                  className={`w-full rounded-t-lg transition-all ${
                    isCurrent ? "bg-[var(--primary)]" : "bg-[#c5c8be]"
                  }`}
                  style={{ height: `${heightPercent}%` }}
                />
                <span className="text-[10px] text-[var(--muted)] truncate max-w-[80px]">
                  {e.date.split(" ")[0]} {e.date.split(" ")[1]}
                </span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function AddExamModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [type, setType] = useState<ExamType>("TYT");
  const [date, setDate] = useState(
    new Intl.DateTimeFormat("tr-TR", { dateStyle: "long" }).format(new Date())
  );
  const [results, setResults] = useState<ExamResult[]>([
    { section: "Türkçe", correct: 0, wrong: 0, blank: 0 },
    { section: "Matematik", correct: 0, wrong: 0, blank: 0 },
    { section: "Sosyal", correct: 0, wrong: 0, blank: 0 },
    { section: "Fen", correct: 0, wrong: 0, blank: 0 },
  ]);

  const handleTypeChange = (newType: ExamType) => {
    setType(newType);
    if (newType === "AYT") {
      setResults([
        { section: "Matematik", correct: 0, wrong: 0, blank: 0 },
        { section: "Fizik", correct: 0, wrong: 0, blank: 0 },
        { section: "Kimya", correct: 0, wrong: 0, blank: 0 },
        { section: "Biyoloji", correct: 0, wrong: 0, blank: 0 },
      ]);
    } else {
      setResults([
        { section: "Türkçe", correct: 0, wrong: 0, blank: 0 },
        { section: "Matematik", correct: 0, wrong: 0, blank: 0 },
        { section: "Sosyal", correct: 0, wrong: 0, blank: 0 },
        { section: "Fen", correct: 0, wrong: 0, blank: 0 },
      ]);
    }
  };

  const updateResult = (index: number, field: keyof ExamResult, val: number) => {
    setResults((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: Math.max(0, val) };
      return next;
    });
  };

  const totalCalculatedNet = results.reduce(
    (sum, r) => sum + (r.correct - r.wrong / 4),
    0
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addExam({
      name,
      type,
      date,
      results,
    });
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-[var(--outline)] bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-[var(--outline)]">
          <h2 className="font-display text-xl font-bold text-[var(--ink)]">Yeni Deneme Kaydı</h2>
          <button onClick={onClose} className="text-[var(--muted)] hover:text-[var(--ink)]">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--ink)] mb-1">
              Deneme Adı / Yayın
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Örn: 3D Türkiye Geneli TYT Denemesi"
              className="w-full rounded-lg border border-[var(--outline)] p-2.5 text-sm outline-none focus:border-[var(--primary)]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--ink)] mb-1">
                Sınav Türü
              </label>
              <select
                value={type}
                onChange={(e) => handleTypeChange(e.target.value as ExamType)}
                className="w-full rounded-lg border border-[var(--outline)] p-2.5 text-sm outline-none focus:border-[var(--primary)]"
              >
                <option value="TYT">TYT</option>
                <option value="AYT">AYT</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--ink)] mb-1">Tarih</label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border border-[var(--outline)] p-2.5 text-sm outline-none focus:border-[var(--primary)]"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <label className="block text-xs font-semibold text-[var(--ink)]">
              Bölüm Sonuçları
            </label>
            {results.map((res, i) => (
              <div
                key={res.section}
                className="p-3 rounded-xl border border-[var(--outline)] bg-[#fbf9f5] flex items-center justify-between gap-3 text-xs"
              >
                <span className="font-semibold text-sm w-24 truncate">{res.section}</span>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1">
                    <span className="text-[var(--muted)]">D:</span>
                    <input
                      type="number"
                      min={0}
                      value={res.correct}
                      onChange={(e) => updateResult(i, "correct", parseInt(e.target.value) || 0)}
                      className="w-12 p-1 text-center bg-white border border-[var(--outline)] rounded"
                    />
                  </label>
                  <label className="flex items-center gap-1">
                    <span className="text-[var(--muted)]">Y:</span>
                    <input
                      type="number"
                      min={0}
                      value={res.wrong}
                      onChange={(e) => updateResult(i, "wrong", parseInt(e.target.value) || 0)}
                      className="w-12 p-1 text-center bg-white border border-[var(--outline)] rounded"
                    />
                  </label>
                  <label className="flex items-center gap-1">
                    <span className="text-[var(--muted)]">B:</span>
                    <input
                      type="number"
                      min={0}
                      value={res.blank}
                      onChange={(e) => updateResult(i, "blank", parseInt(e.target.value) || 0)}
                      className="w-12 p-1 text-center bg-white border border-[var(--outline)] rounded"
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>

          {/* Live Net Calculation Display */}
          <div className="p-4 rounded-xl bg-[var(--surface-ai)] border border-[#d7e8cb] flex items-center justify-between">
            <span className="text-xs font-semibold text-[#4E5D47]">Hesaplanan Toplam Net:</span>
            <span className="font-display text-2xl font-extrabold text-[var(--primary)]">
              {formatNet(totalCalculatedNet)}
            </span>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full rounded-xl bg-[var(--primary)] py-3 text-sm font-semibold text-white hover:bg-[var(--primary-strong)] active:scale-95 transition-all"
            >
              Denemeyi Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
