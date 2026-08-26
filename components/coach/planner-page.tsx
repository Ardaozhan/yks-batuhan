"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Atom,
  BatteryFull,
  BatteryLow,
  BatteryMedium,
  BookOpen,
  Calculator,
  CheckCircle2,
  Hourglass,
  Lightbulb,
  Minus,
  Plus,
  RotateCcw,
  Sparkles,
  Target,
  Trash2,
  Zap,
} from "lucide-react";
import {
  addMultipleTasks,
  getExams,
  getMistakes,
  getProfile,
  getTopics,
} from "@/lib/study-store";
import { getNextCurriculumTopic } from "@/lib/curriculum-knowledge";
import type { DailyTask } from "@/types/study";

type EnergyLevel = "low" | "normal" | "high";
type StudyStyle = "balanced" | "weakness" | "speed";

export function PlannerPage() {
  const router = useRouter();
  const [hours, setHours] = useState<number>(4.5);
  const [energy, setEnergy] = useState<EnergyLevel>("normal");
  const [style, setStyle] = useState<StudyStyle>("balanced");
  const [focus, setFocus] = useState<string>("");

  const [step, setStep] = useState<"form" | "loading" | "result">("form");
  const [generatedTasks, setGeneratedTasks] = useState<Array<Omit<DailyTask, "id">>>([]);
  const [aiRationale, setAiRationale] = useState<string>("");
  const [aiTips, setAiTips] = useState<string[]>([]);
  const [loadingStep, setLoadingStep] = useState<number>(1);
  const [approving, setApproving] = useState<boolean>(false);

  const startGeneration = async () => {
    setStep("loading");
    setLoadingStep(1);

    const stepTimer1 = setTimeout(() => setLoadingStep(2), 600);
    const stepTimer2 = setTimeout(() => setLoadingStep(3), 1200);

    const profile = getProfile();
    const topics = getTopics();
    const completedTopics = topics.filter((t) => t.status === "completed").map((t) => t.name);
    const uncompletedTopics = topics.filter((t) => t.status !== "completed").map((t) => t.name);
    const mistakes = getMistakes();
    const exams = getExams();

    const nextMath = getNextCurriculumTopic("tyt-matematik", completedTopics);
    const nextPhysics = getNextCurriculumTopic("tyt-fizik", completedTopics);
    const nextAytMath = getNextCurriculumTopic("ayt-matematik", completedTopics);
    const nextAytPhysics = getNextCurriculumTopic("ayt-fizik", completedTopics);

    const curriculumNextSteps = [
      nextMath.nextTopic ? `TYT Matematik: ${nextMath.nextTopic.name} (Sıra: ${nextMath.nextTopic.order}, ÖSYM: ${nextMath.nextTopic.osymWeight})` : null,
      nextPhysics.nextTopic ? `TYT Fizik: ${nextPhysics.nextTopic.name} (Sıra: ${nextPhysics.nextTopic.order}, ÖSYM: ${nextPhysics.nextTopic.osymWeight})` : null,
      nextAytMath.nextTopic ? `AYT Matematik: ${nextAytMath.nextTopic.name} (Sıra: ${nextAytMath.nextTopic.order}, ÖSYM: ${nextAytMath.nextTopic.osymWeight})` : null,
      nextAytPhysics.nextTopic ? `AYT Fizik: ${nextAytPhysics.nextTopic.name} (Sıra: ${nextAytPhysics.nextTopic.order}, ÖSYM: ${nextAytPhysics.nextTopic.osymWeight})` : null,
    ].filter(Boolean);

    try {
      const res = await fetch("/api/planner/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hours,
          energy,
          style,
          focus,
          context: {
            profile,
            completedTopics,
            uncompletedTopics,
            curriculumNextSteps,
            mistakes,
            recentExams: exams.slice(0, 3).map((e) => ({
              name: e.name,
              type: e.type,
              totalNet: e.results?.reduce((acc, r) => acc + (r.correct - r.wrong / 4), 0),
            })),
          },
        }),
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      if (!res.ok) {
        throw new Error(`API hatası: ${res.status}`);
      }

      const data = await res.json();
      if (Array.isArray(data.tasks) && data.tasks.length > 0) {
        setGeneratedTasks(
          data.tasks.map((t: { subject: string; topic: string; description: string; duration: string; priority?: "high" | "normal" | "low"; plannedQuestions?: number }) => ({
            subject: t.subject || "Ders",
            topic: t.topic || "Konu Tekrarı",
            description: t.description || "Ders çalışması ve test çözümü",
            duration: t.duration || "45 dk",
            status: "pending" as const,
            priority: t.priority || "normal",
            plannedQuestions: t.plannedQuestions || 25,
          }))
        );
        setAiRationale(data.aiRationale || "");
        setAiTips(data.tips || []);
        setStep("result");
        return;
      }
      throw new Error("Boş görev listesi");
    } catch (err) {
      console.warn("DeepSeek planner fallback devreye girdi:", err);
      // Intelligent fallback using real curriculum topics
      const mathMins = Math.round(hours * 35);
      const secondMins = Math.round(hours * 25);
      const reviewMins = Math.max(30, Math.round(hours * 15));

      const tytMath = uncompletedTopics.find((t) => t.includes("Matematik") || t.includes("Denklem")) || uncompletedTopics[0] || "Temel Matematik";
      const scienceTopic = uncompletedTopics.find((t) => t.includes("Fizik") || t.includes("Kimya") || t.includes("Biyoloji")) || "Alan Dersi Çalışması";
      const turkishTopic = uncompletedTopics.find((t) => t.includes("Paragraf") || t.includes("Türkçe")) || "Paragraf Hız Kampı";

      const fallbackPlan: Array<Omit<DailyTask, "id">> = [
        {
          subject: focus ? "Öncelikli Odak" : "TYT Matematik",
          topic: focus || tytMath,
          description: "Konu özeti çıkarma ve soru bankasından odaklı test çözümü",
          duration: `${mathMins} dk`,
          status: "pending",
          priority: "high",
          plannedQuestions: Math.round(mathMins * 0.6),
        },
        {
          subject: "Fen & Alan Dersi",
          topic: scienceTopic,
          description: "Kavram haritası inceleme ve 2 adet pekiştirme testi",
          duration: `${secondMins} dk`,
          status: "pending",
          priority: "normal",
          plannedQuestions: Math.round(secondMins * 0.5),
        },
        {
          subject: "TYT Türkçe",
          topic: turkishTopic,
          description: "Süre tutarak odaklı soru pratiği",
          duration: `${reviewMins} dk`,
          status: "pending",
          priority: "normal",
          plannedQuestions: 25,
        },
      ];

      setGeneratedTasks(fallbackPlan);
      setAiRationale(
        `Müfredattaki eksik konuların ve ${energy === "low" ? "düşük enerjine uygun hafif ritim" : "verimli çalışma hedefin"} gözetilerek bugünkü ${hours} saatlik programın dengelendi.`
      );
      setAiTips([
        "Çalışmaya günün en dinç anında en zorlandığın dersle başla.",
        "45 dakika çalışma ve 10-15 dakika mola bloklarıyla odaklanma süreni koru.",
      ]);
      setStep("result");
    }
  };

  const handleApprove = async () => {
    if (generatedTasks.length === 0) return;
    setApproving(true);
    await addMultipleTasks(generatedTasks);
    setTimeout(() => {
      router.push("/today");
    }, 300);
  };

  const handleRemoveTask = (indexToRemove: number) => {
    setGeneratedTasks((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div className="mx-auto max-w-[1040px] px-4 py-6 md:px-10 md:py-10">
      {/* Header */}
      <header className="mb-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-[var(--surface-ai)] px-3.5 py-1 text-xs font-semibold text-[var(--primary)] border border-[#d7e8cb]">
          <Sparkles size={15} className="animate-pulse text-[var(--primary)]" />
          <span>DeepSeek AI Günlük Planlayıcı</span>
        </div>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-[var(--ink)] md:text-4xl">
          Bugünü birlikte planlayalım
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)] max-w-xl">
          Müfredatındaki eksik konuları, çalışma enerjini ve hedeflediğin sıralamayı analiz ederek en verimli günlük programı oluşturacağım.
        </p>
      </header>

      {/* STEP 1: FORM */}
      {step === "form" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Hours Picker */}
            <section className="paper-card p-6 bg-white flex flex-col justify-between shadow-xs">
              <div>
                <h2 className="font-display text-lg font-bold text-[var(--ink)]">Zaman Kapasitesi</h2>
                <p className="text-xs text-[var(--muted)] mt-1">Bugün toplam kaç saat çalışabilirsin?</p>
              </div>

              <div className="my-6 flex items-center justify-center gap-6">
                <button
                  type="button"
                  onClick={() => setHours((h) => Math.max(1, +(h - 0.5).toFixed(1)))}
                  aria-label="Süreyi azalt"
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--outline)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors active:scale-95"
                >
                  <Minus size={20} />
                </button>

                <div className="flex flex-col items-center min-w-[120px]">
                  <span className="font-display text-5xl font-extrabold text-[var(--primary)]">
                    {hours.toFixed(1)}
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mt-1">
                    Saat
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setHours((h) => Math.min(14, +(h + 0.5).toFixed(1)))}
                  aria-label="Süreyi artır"
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--outline)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors active:scale-95"
                >
                  <Plus size={20} />
                </button>
              </div>

              {/* Quick Hours Pills */}
              <div className="flex items-center justify-center gap-2">
                {[2, 4, 6, 8].map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setHours(h)}
                    className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
                      hours === h
                        ? "bg-[var(--primary)] text-white shadow-2xs"
                        : "bg-[#fbf9f5] border border-[var(--outline)] text-[var(--muted)] hover:text-[var(--ink)]"
                    }`}
                  >
                    {h} Saat
                  </button>
                ))}
              </div>
            </section>

            {/* Energy Level */}
            <section className="paper-card p-6 bg-white flex flex-col justify-between shadow-xs">
              <div>
                <h2 className="font-display text-lg font-bold text-[var(--ink)]">Enerji Durumu</h2>
                <p className="text-xs text-[var(--muted)] mt-1">Bugünkü odak ve motivasyon seviyen nasıl?</p>
              </div>

              <div className="my-6 grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setEnergy("low")}
                  className={`flex flex-col items-center justify-center gap-2 rounded-xl p-4 border transition-all ${
                    energy === "low"
                      ? "border-[var(--primary)] bg-[#d7e8cb]/30 text-[var(--primary)] font-semibold shadow-xs"
                      : "border-[var(--outline)] hover:bg-[var(--surface-muted)] text-[var(--muted)]"
                  }`}
                >
                  <BatteryLow size={28} />
                  <span className="text-xs">Düşük</span>
                </button>

                <button
                  type="button"
                  onClick={() => setEnergy("normal")}
                  className={`flex flex-col items-center justify-center gap-2 rounded-xl p-4 border transition-all ${
                    energy === "normal"
                      ? "border-[var(--primary)] bg-[#d7e8cb]/30 text-[var(--primary)] font-semibold shadow-xs"
                      : "border-[var(--outline)] hover:bg-[var(--surface-muted)] text-[var(--muted)]"
                  }`}
                >
                  <BatteryMedium size={28} />
                  <span className="text-xs">Normal</span>
                </button>

                <button
                  type="button"
                  onClick={() => setEnergy("high")}
                  className={`flex flex-col items-center justify-center gap-2 rounded-xl p-4 border transition-all ${
                    energy === "high"
                      ? "border-[var(--primary)] bg-[#d7e8cb]/30 text-[var(--primary)] font-semibold shadow-xs"
                      : "border-[var(--outline)] hover:bg-[var(--surface-muted)] text-[var(--muted)]"
                  }`}
                >
                  <BatteryFull size={28} />
                  <span className="text-xs">Yüksek</span>
                </button>
              </div>

              <div className="text-center text-xs text-[var(--muted)]">
                {energy === "low"
                  ? "Düşük enerjide konu videoları ve hafif soru çözümü planlanır."
                  : energy === "normal"
                  ? "Dengeli ders ve test ritmi optimize edilir."
                  : "Zorlayıcı konular, derin problem çözümleri ve mini denemeler dahil edilir."}
              </div>
            </section>
          </div>

          {/* Study Style & Focus */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Style Selector */}
            <section className="paper-card p-6 bg-white shadow-xs">
              <h2 className="font-display text-base font-bold text-[var(--ink)]">Çalışma Stili</h2>
              <p className="text-xs text-[var(--muted)] mt-1 mb-4">Günün ağırlık merkezi</p>

              <div className="space-y-2">
                {[
                  { key: "balanced", label: "Dengeli (TYT + AYT)", icon: BookOpen, desc: "Tüm dersler arasında orantılı dağılım" },
                  { key: "weakness", label: "Eksik Kapatma Odaklı", icon: Target, desc: "Hata defteri ve bitmemiş konular öncelikli" },
                  { key: "speed", label: "Hız & Soru Kampı", icon: Zap, desc: "Yoğun soru çözümü ve süre yönetimi" },
                ].map((s) => {
                  const Icon = s.icon;
                  const isSel = style === s.key;
                  return (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() => setStyle(s.key as StudyStyle)}
                      className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                        isSel
                          ? "border-[var(--primary)] bg-[var(--surface-ai)] text-[var(--ink)] shadow-2xs font-medium"
                          : "border-[var(--outline)] hover:bg-[#fbf9f5] text-[var(--muted)]"
                      }`}
                    >
                      <Icon size={16} className={`mt-0.5 shrink-0 ${isSel ? "text-[var(--primary)]" : ""}`} />
                      <div>
                        <p className="text-xs font-semibold text-[var(--ink)]">{s.label}</p>
                        <p className="text-[10px] text-[var(--muted)] mt-0.5">{s.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Focus Textarea */}
            <section className="paper-card p-6 bg-white md:col-span-2 shadow-xs flex flex-col justify-between">
              <div>
                <h2 className="font-display text-base font-bold text-[var(--ink)]">
                  Özel Odak veya İstek (İsteğe Bağlı)
                </h2>
                <p className="text-xs text-[var(--muted)] mt-1 mb-3">
                  Bugün mutlaka yer almasını istediğin özel bir konu, test veya çalışma var mı?
                </p>
                <textarea
                  value={focus}
                  onChange={(e) => setFocus(e.target.value)}
                  placeholder="Örn: Trigonometride toplam-fark formüllerine baştan bakmak istiyorum ve 30 paragraf çözmeliyim..."
                  className="w-full resize-none rounded-xl border border-[var(--outline)] bg-[var(--background)] p-3.5 text-sm outline-none focus:border-[var(--primary)] focus:bg-white transition-all min-h-[110px]"
                />
              </div>

              <div className="flex justify-end pt-3">
                <button
                  type="button"
                  onClick={startGeneration}
                  className="inline-flex min-h-12 w-full sm:w-auto items-center justify-center gap-2.5 rounded-xl bg-[var(--primary)] px-8 text-sm font-semibold text-white shadow-md hover:bg-[var(--primary-strong)] active:scale-95 transition-all"
                >
                  <Sparkles size={18} />
                  <span>DeepSeek ile Planımı Oluştur</span>
                </button>
              </div>
            </section>
          </div>
        </div>
      )}

      {/* STEP 2: LOADING STATE */}
      {step === "loading" && (
        <div className="paper-card p-12 bg-white flex flex-col items-center justify-center text-center animate-in fade-in shadow-xs">
          <div className="relative mb-6 flex h-20 w-20 items-center justify-center">
            <div className="absolute inset-0 animate-spin rounded-full border-4 border-[var(--surface-muted)] border-t-[var(--primary)]" />
            <Sparkles size={30} className="text-[var(--primary)] animate-pulse" />
          </div>

          <h3 className="font-display text-2xl font-bold text-[var(--ink)]">
            DeepSeek V3 Çalışma Planını Kurguluyor...
          </h3>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Eksik konuların, hedefin ve günün enerjisi pedagojik olarak dengeleniyor.
          </p>

          <div className="mt-8 w-full max-w-sm space-y-3 text-left">
            <div className="flex items-center gap-3 text-xs text-[var(--ink)]">
              <CheckCircle2 size={16} className="text-[var(--primary)] shrink-0" />
              <span>Öğrenci profili, hedef ve geçmiş denemeler tarandı</span>
            </div>
            <div
              className={`flex items-center gap-3 text-xs transition-opacity duration-300 ${
                loadingStep >= 2 ? "text-[var(--ink)] opacity-100" : "text-[var(--muted)] opacity-50"
              }`}
            >
              {loadingStep >= 2 ? (
                <CheckCircle2 size={16} className="text-[var(--primary)] shrink-0" />
              ) : (
                <Hourglass size={16} className="text-[var(--muted)] shrink-0 animate-spin" />
              )}
              <span>Müfredattaki eksik konular ve hata defteri ilişkilendirildi</span>
            </div>
            <div
              className={`flex items-center gap-3 text-xs transition-opacity duration-300 ${
                loadingStep >= 3 ? "text-[var(--ink)] opacity-100" : "text-[var(--muted)] opacity-50"
              }`}
            >
              {loadingStep >= 3 ? (
                <CheckCircle2 size={16} className="text-[var(--primary)] shrink-0" />
              ) : (
                <Hourglass size={16} className="text-[var(--muted)] shrink-0 animate-spin" />
              )}
              <span>{hours} saatlik optimum pomodoro blokları ve soru hedefleri yazılıyor</span>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: RESULT STATE */}
      {step === "result" && (
        <div className="space-y-6 animate-in fade-in">
          {/* Result Banner */}
          <div className="rounded-2xl border border-[#d7e8cb] bg-[#E9EEE6] p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
            <div>
              <div className="flex items-center gap-2 text-sm font-bold text-[#4E5D47] mb-1">
                <Sparkles size={18} className="text-[var(--primary)]" />
                <span>DeepSeek AI Planın Hazır</span>
              </div>
              <p className="text-xs text-[#596952]">
                {aiRationale || "Enerji seviyene ve hedeflerine göre optimize edildi."}
              </p>
            </div>

            <div className="flex items-center gap-4 rounded-xl border border-[#d7e8cb] bg-white px-5 py-3 shadow-xs shrink-0">
              <div>
                <span className="block text-[11px] font-medium text-[var(--muted)]">Toplam Süre</span>
                <span className="font-display text-base font-bold text-[var(--ink)]">
                  {hours} Saat
                </span>
              </div>
              <div className="h-8 w-px bg-[var(--outline)]"></div>
              <div>
                <span className="block text-[11px] font-medium text-[var(--muted)]">Hedef Soru</span>
                <span className="font-display text-base font-bold text-[var(--primary)]">
                  {generatedTasks.reduce((acc, t) => acc + (t.plannedQuestions || 0), 0)} Soru
                </span>
              </div>
            </div>
          </div>

          {/* AI Tips */}
          {aiTips.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-1.5 font-bold text-amber-800">
                <Lightbulb size={15} />
                <span>Bugün İçin AI Koç Taktikleri:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 pl-1">
                {aiTips.map((tip, idx) => (
                  <li key={idx}>{tip}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Generated Tasks Cards */}
          <div className="space-y-3">
            {generatedTasks.map((t, idx) => (
              <div
                key={idx}
                className="paper-card p-5 bg-white flex items-start gap-4 hover:border-[var(--primary)] transition-all shadow-xs group"
              >
                <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--surface-ai)] text-[var(--primary)]">
                  {t.subject.includes("Mat") ? (
                    <Calculator size={20} />
                  ) : t.subject.includes("Fizik") || t.subject.includes("Kimya") ? (
                    <Atom size={20} />
                  ) : (
                    <BookOpen size={20} />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-display text-base font-semibold text-[var(--ink)]">
                      {t.subject}: {t.topic}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="rounded-lg bg-[var(--surface-muted)] px-2.5 py-1 text-xs font-semibold text-[var(--muted)]">
                        {t.duration}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTask(idx)}
                        title="Bu görevi çıkar"
                        className="opacity-0 group-hover:opacity-100 p-1 text-[var(--muted)] hover:text-red-600 transition-opacity"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-[var(--muted)]">{t.description}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-md bg-[#d7e8cb]/50 px-2 py-0.5 text-[11px] font-semibold text-[#3d4b35]">
                      {t.plannedQuestions} Soru Hedefi
                    </span>
                    {t.priority === "high" && (
                      <span className="rounded-md bg-[#ffdad6]/60 px-2 py-0.5 text-[11px] font-semibold text-[#93000a]">
                        Öncelikli Blok
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={handleApprove}
              disabled={approving || generatedTasks.length === 0}
              className="flex-1 min-h-12 inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-6 text-sm font-semibold text-white shadow-md hover:bg-[var(--primary-strong)] active:scale-95 transition-all disabled:opacity-50"
            >
              <CheckCircle2 size={18} />
              <span>{approving ? "Plana Ekleniyor..." : "Planı Onayla ve Bugüne Aktar"}</span>
              <ArrowRight size={16} />
            </button>

            <button
              type="button"
              onClick={() => setStep("form")}
              className="min-h-12 inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--outline)] bg-white px-6 text-sm font-semibold text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-muted)] transition-all"
            >
              Parametreleri Değiştir
            </button>

            <button
              type="button"
              onClick={startGeneration}
              className="min-h-12 inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--outline)] bg-white px-6 text-sm font-semibold text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-muted)] transition-all"
            >
              <RotateCcw size={16} />
              <span>Yeniden Oluştur</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
