"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Award,
  CheckCircle2,
  ChevronRight,
  Flame,
  GraduationCap,
  Info,
  RotateCcw,
  Share2,
  Sliders,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";
import { calculateYksSimulation, type YksNetInputs } from "@/lib/yks-calculator";
import { getExams, getProfile } from "@/lib/study-store";
import { defaultProfile } from "@/lib/mock-data";
import { calculateNet } from "@/lib/analytics";
import type { UserProfile } from "@/types/study";
import { useToast } from "@/components/ui/toaster";

type FieldType = "SAY" | "EA" | "SOZ" | "DIL" | "TYT";

export function SimulatorPage() {
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [field, setField] = useState<FieldType>("SAY");

  // Net inputs state
  const [inputs, setInputs] = useState<YksNetInputs>({
    tytTurkce: 32,
    tytSosyal: 14,
    tytMatematik: 28,
    tytFen: 13,
    aytMatematik: 25,
    aytFizik: 9,
    aytKimya: 9,
    aytBiyoloji: 9,
    aytEdebiyat: 18,
    aytTarih1: 7,
    aytCografya1: 4,
    aytTarih2: 8,
    aytCografya2: 8,
    aytFelsefe: 9,
    aytDin: 5,
    aytDil: 65,
    diplomaGrade: 88,
    isBrokenObp: false,
  });

  const [hasLoadedLatestExam, setHasLoadedLatestExam] = useState(false);

  useEffect(() => {
    const prof = getProfile();
    setProfile(prof);
    if (prof.examType === "TYT") setField("TYT");
    else if (prof.examType === "AYT") setField("SAY");
  }, []);

  const handleInputChange = (key: keyof YksNetInputs, value: number | boolean) => {
    setInputs((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Run calculation
  const results = useMemo(() => {
    return calculateYksSimulation(inputs);
  }, [inputs]);

  // Active ranking according to field
  const currentRank = useMemo(() => {
    switch (field) {
      case "SAY":
        return results.sayRank;
      case "EA":
        return results.eaRank;
      case "SOZ":
        return results.sozRank;
      case "DIL":
        return results.dilRank;
      case "TYT":
      default:
        return results.tytRank;
    }
  }, [field, results]);

  const currentPlacementScore = useMemo(() => {
    switch (field) {
      case "SAY":
        return results.sayPlacementScore;
      case "EA":
        return results.eaPlacementScore;
      case "SOZ":
        return results.sozPlacementScore;
      case "DIL":
        return results.dilPlacementScore;
      case "TYT":
      default:
        return results.tytPlacementScore;
    }
  }, [field, results]);

  const currentRawScore = useMemo(() => {
    switch (field) {
      case "SAY":
        return results.sayRawScore;
      case "EA":
        return results.eaRawScore;
      case "SOZ":
        return results.sozRawScore;
      case "DIL":
        return results.dilRawScore;
      case "TYT":
      default:
        return results.tytRawScore;
    }
  }, [field, results]);

  // Load from latest exam
  const handleLoadLatestExam = () => {
    const exams = getExams();
    if (exams.length === 0) {
      alert("Henüz kayıtlı bir deneme sınavınız bulunmuyor.");
      return;
    }
    const latest = exams[0];
    const newInputs = { ...inputs };

    latest.results.forEach((res) => {
      const net = calculateNet(res);
      const s = res.section.toLowerCase();
      if (s.includes("türkçe")) newInputs.tytTurkce = Math.max(0, net);
      else if (s.includes("sosyal")) newInputs.tytSosyal = Math.max(0, net);
      else if (s.includes("tyt mat") || s.includes("matematik")) newInputs.tytMatematik = Math.max(0, net);
      else if (s.includes("fen")) newInputs.tytFen = Math.max(0, net);
      else if (s.includes("ayt mat")) newInputs.aytMatematik = Math.max(0, net);
      else if (s.includes("fizik")) newInputs.aytFizik = Math.max(0, net);
      else if (s.includes("kimya")) newInputs.aytKimya = Math.max(0, net);
      else if (s.includes("biyoloji")) newInputs.aytBiyoloji = Math.max(0, net);
      else if (s.includes("edebiyat")) newInputs.aytEdebiyat = Math.max(0, net);
    });

    setInputs(newInputs);
    setHasLoadedLatestExam(true);
  };

  const handleReset = () => {
    setInputs({
      tytTurkce: 30,
      tytSosyal: 13,
      tytMatematik: 25,
      tytFen: 12,
      aytMatematik: 22,
      aytFizik: 8,
      aytKimya: 8,
      aytBiyoloji: 8,
      aytEdebiyat: 18,
      aytTarih1: 6,
      aytCografya1: 4,
      aytTarih2: 8,
      aytCografya2: 8,
      aytFelsefe: 8,
      aytDin: 5,
      aytDil: 60,
      diplomaGrade: 85,
      isBrokenObp: false,
    });
    setHasLoadedLatestExam(false);
  };

  // Gap to target
  const targetRank = profile.targetRank || 10000;
  const isTargetAchieved = currentRank <= targetRank;
  const rankGap = Math.abs(currentRank - targetRank);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-10">
      {/* Top Header */}
      <header className="mb-8 flex flex-col gap-4 border-b border-[var(--outline)] pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="rounded-md bg-[var(--primary)] px-2.5 py-0.5 text-xs font-bold text-white">
              2025 / 2026 ÖSYM Motoru
            </span>
            <span className="text-xs font-semibold text-[var(--muted)]">
              YKS Sıralama & Net Simülatörü
            </span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-[var(--ink)]">
            Netlerini Simüle Et, Sıralamanı Gör
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)] max-w-2xl">
            Güncel ÖSYM katsayıları ve yığılma verileriyle TYT, AYT netlerinin ve OBP puanının yaklaşık Türkiye sıralamana etkisini anlık hesapla.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleLoadLatestExam}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--primary)] bg-[var(--surface-ai)] px-4 py-2.5 text-xs font-bold text-[var(--primary)] hover:bg-[#dce7d4] transition-all shadow-2xs active:scale-95"
          >
            <Zap size={15} />
            <span>{hasLoadedLatestExam ? "Son Deneme Aktarıldı ✓" : "Son Denememi Aktar"}</span>
          </button>
          <button
            type="button"
            onClick={handleReset}
            title="Netleri Sıfırla"
            className="inline-flex items-center gap-1 rounded-xl border border-[var(--outline)] bg-white px-3 py-2.5 text-xs font-semibold text-[var(--muted)] hover:text-[var(--ink)] transition-all active:scale-95"
          >
            <RotateCcw size={14} />
            <span>Sıfırla</span>
          </button>
        </div>
      </header>

      {/* Field Selector Tabs */}
      <div className="mb-8 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { key: "SAY", label: "Sayısal (SAY)", badge: "TYT + SAY" },
          { key: "EA", label: "Eşit Ağırlık (EA)", badge: "TYT + EA" },
          { key: "SOZ", label: "Sözel (SÖZ)", badge: "TYT + SÖZ" },
          { key: "DIL", label: "Yabancı Dil (DİL)", badge: "TYT + YDT" },
          { key: "TYT", label: "Yalnızca TYT", badge: "2 Yıllık / Ön Lisans" },
        ].map((tab) => {
          const isSelected = field === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setField(tab.key as FieldType)}
              className={`inline-flex shrink-0 min-h-[44px] items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all touch-manipulation active:scale-95 ${
                isSelected
                  ? "bg-[var(--primary)] text-white shadow-xs"
                  : "border border-[var(--outline)] bg-white text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[#fbf9f5]"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                  isSelected ? "bg-white/25 text-white" : "bg-[var(--surface-muted)] text-[var(--muted)]"
                }`}
              >
                {tab.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* Mobile Live Quick Rank Banner (Sticky on small screens) */}
      <div className="lg:hidden sticky top-[60px] z-10 -mx-4 px-4 py-2 bg-[var(--background)]/90 backdrop-blur-md border-b border-[var(--outline)] mb-6">
        <div className="rounded-2xl bg-gradient-to-r from-[var(--primary)] to-[#3a4933] p-4 text-white shadow-md flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-white/80 block">
              Tahmini {field} Sıralaması
            </span>
            <span className="font-display text-2xl font-black tracking-tight">
              #{currentRank.toLocaleString("tr-TR")}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-white/80 block">Yerleştirme</span>
            <span className="font-display text-base font-bold">
              {currentPlacementScore} P
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Inputs, Right Simulation Display */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
        {/* Left Column: Net Inputs */}
        <div className="space-y-6">
          {/* SECTION 1: TYT Netleri */}
          <section className="paper-card p-6 bg-white shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--outline)] pb-3">
              <div>
                <h2 className="font-display text-lg font-bold text-[var(--ink)]">
                  TYT (Temel Yeterlilik Testi)
                </h2>
                <p className="text-xs text-[var(--muted)]">120 Soru • Genel Başarı Katsayısı %40</p>
              </div>
              <span className="rounded-full bg-[var(--surface-ai)] px-3 py-1 text-xs font-bold text-[var(--primary)] border border-[#d7e8cb]">
                Toplam: {results.totalTytNet} / 120 Net
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <NetSlider
                label="Türkçe"
                max={40}
                value={inputs.tytTurkce}
                onChange={(v) => handleInputChange("tytTurkce", v)}
                coefficient="~3.30 Puan"
              />
              <NetSlider
                label="Temel Matematik"
                max={40}
                value={inputs.tytMatematik}
                onChange={(v) => handleInputChange("tytMatematik", v)}
                coefficient="~3.30 Puan"
              />
              <NetSlider
                label="Sosyal Bilimler"
                max={20}
                value={inputs.tytSosyal}
                onChange={(v) => handleInputChange("tytSosyal", v)}
                coefficient="~3.40 Puan"
              />
              <NetSlider
                label="Fen Bilimleri"
                max={20}
                value={inputs.tytFen}
                onChange={(v) => handleInputChange("tytFen", v)}
                coefficient="~3.40 Puan"
              />
            </div>
          </section>

          {/* SECTION 2: AYT Netleri (Dinamik Alana Göre) */}
          {field !== "TYT" && (
            <section className="paper-card p-6 bg-white shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--outline)] pb-3">
                <div>
                  <h2 className="font-display text-lg font-bold text-[var(--ink)]">
                    AYT ({field === "SAY" ? "Sayısal" : field === "EA" ? "Eşit Ağırlık" : field === "SOZ" ? "Sözel" : "Yabancı Dil"})
                  </h2>
                  <p className="text-xs text-[var(--muted)]">Alan Başarı Katsayısı %60</p>
                </div>
                <span className="rounded-full bg-[var(--surface-ai)] px-3 py-1 text-xs font-bold text-[var(--primary)] border border-[#d7e8cb]">
                  Toplam AYT:{" "}
                  {field === "SAY"
                    ? results.totalAytSayNet
                    : field === "EA"
                    ? results.totalAytEaNet
                    : results.totalAytSozNet}{" "}
                  / 80 Net
                </span>
              </div>

              {/* SAYISAL */}
              {field === "SAY" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <NetSlider
                    label="AYT Matematik"
                    max={40}
                    value={inputs.aytMatematik}
                    onChange={(v) => handleInputChange("aytMatematik", v)}
                    coefficient="~3.00 Puan"
                  />
                  <NetSlider
                    label="Fizik"
                    max={14}
                    value={inputs.aytFizik}
                    onChange={(v) => handleInputChange("aytFizik", v)}
                    coefficient="~2.85 Puan"
                  />
                  <NetSlider
                    label="Kimya"
                    max={13}
                    value={inputs.aytKimya}
                    onChange={(v) => handleInputChange("aytKimya", v)}
                    coefficient="~3.07 Puan"
                  />
                  <NetSlider
                    label="Biyoloji"
                    max={13}
                    value={inputs.aytBiyoloji}
                    onChange={(v) => handleInputChange("aytBiyoloji", v)}
                    coefficient="~3.07 Puan"
                  />
                </div>
              )}

              {/* EŞİT AĞIRLIK */}
              {field === "EA" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <NetSlider
                    label="AYT Matematik"
                    max={40}
                    value={inputs.aytMatematik}
                    onChange={(v) => handleInputChange("aytMatematik", v)}
                    coefficient="~3.00 Puan"
                  />
                  <NetSlider
                    label="Türk Dili ve Edebiyatı"
                    max={24}
                    value={inputs.aytEdebiyat}
                    onChange={(v) => handleInputChange("aytEdebiyat", v)}
                    coefficient="~3.00 Puan"
                  />
                  <NetSlider
                    label="Tarih-1"
                    max={10}
                    value={inputs.aytTarih1}
                    onChange={(v) => handleInputChange("aytTarih1", v)}
                    coefficient="~2.80 Puan"
                  />
                  <NetSlider
                    label="Coğrafya-1"
                    max={6}
                    value={inputs.aytCografya1}
                    onChange={(v) => handleInputChange("aytCografya1", v)}
                    coefficient="~3.33 Puan"
                  />
                </div>
              )}

              {/* SÖZEL */}
              {field === "SOZ" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <NetSlider
                    label="Edebiyat"
                    max={24}
                    value={inputs.aytEdebiyat}
                    onChange={(v) => handleInputChange("aytEdebiyat", v)}
                    coefficient="~3.00 Puan"
                  />
                  <NetSlider
                    label="Tarih-1"
                    max={10}
                    value={inputs.aytTarih1}
                    onChange={(v) => handleInputChange("aytTarih1", v)}
                    coefficient="~2.80 Puan"
                  />
                  <NetSlider
                    label="Coğrafya-1"
                    max={6}
                    value={inputs.aytCografya1}
                    onChange={(v) => handleInputChange("aytCografya1", v)}
                    coefficient="~3.33 Puan"
                  />
                  <NetSlider
                    label="Tarih-2"
                    max={11}
                    value={inputs.aytTarih2}
                    onChange={(v) => handleInputChange("aytTarih2", v)}
                    coefficient="~2.91 Puan"
                  />
                  <NetSlider
                    label="Coğrafya-2"
                    max={11}
                    value={inputs.aytCografya2}
                    onChange={(v) => handleInputChange("aytCografya2", v)}
                    coefficient="~2.91 Puan"
                  />
                  <NetSlider
                    label="Felsefe Grubu"
                    max={12}
                    value={inputs.aytFelsefe}
                    onChange={(v) => handleInputChange("aytFelsefe", v)}
                    coefficient="~3.00 Puan"
                  />
                  <NetSlider
                    label="Din Kültürü"
                    max={6}
                    value={inputs.aytDin}
                    onChange={(v) => handleInputChange("aytDin", v)}
                    coefficient="~3.00 Puan"
                  />
                </div>
              )}

              {/* DİL */}
              {field === "DIL" && (
                <div className="space-y-4">
                  <NetSlider
                    label="Yabancı Dil Testi (YDT)"
                    max={80}
                    value={inputs.aytDil}
                    onChange={(v) => handleInputChange("aytDil", v)}
                    coefficient="~3.00 Puan"
                  />
                </div>
              )}
            </section>
          )}

          {/* SECTION 3: OBP & Okul Başarısı */}
          <section className="paper-card p-6 bg-white shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--outline)] pb-3">
              <div>
                <h2 className="font-display text-lg font-bold text-[var(--ink)]">
                  OBP (Ortaöğretim Başarı Puanı)
                </h2>
                <p className="text-xs text-[var(--muted)]">Lise Diploma Notu (50 - 100 Arası)</p>
              </div>
              <span className="rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 text-xs font-bold">
                +{results.obpContribution} Yerleştirme Puanı
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div>
                <label className="text-xs font-bold text-[var(--ink)] block mb-1">
                  Diploma Notu: <strong className="text-[var(--primary)] text-base">{inputs.diplomaGrade}</strong>
                </label>
                <input
                  type="range"
                  min={50}
                  max={100}
                  step={0.5}
                  value={inputs.diplomaGrade}
                  onChange={(e) => handleInputChange("diplomaGrade", parseFloat(e.target.value))}
                  className="w-full accent-[var(--primary)] cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-[var(--muted)] mt-1">
                  <span>50 (Min)</span>
                  <span>OBP: {results.obpValue}</span>
                  <span>100 (Max)</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-[var(--outline)] bg-[#fbf9f5] flex items-center justify-between gap-3">
                <div>
                  <label htmlFor="broken-obp" className="text-xs font-bold text-[var(--ink)] block cursor-pointer">
                    Kırık OBP Uygulansın
                  </label>
                  <p className="text-[11px] text-[var(--muted)]">
                    Önceki yıl üniversiteye yerleştiyseniz katsayı yarıya düşer (*0.06).
                  </p>
                </div>
                <input
                  id="broken-obp"
                  type="checkbox"
                  checked={inputs.isBrokenObp}
                  onChange={(e) => handleInputChange("isBrokenObp", e.target.checked)}
                  className="h-5 w-5 accent-[var(--primary)] rounded cursor-pointer shrink-0"
                />
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Live Results & Strategy */}
        <aside className="space-y-6">
          {/* Main Predicted Rank Card */}
          <div className="paper-card p-6 bg-gradient-to-b from-white to-[#fbf9f5] border-2 border-[var(--primary)] shadow-md text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-[var(--primary)] text-white text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-bl-xl">
              2025/2026 Tahmini
            </div>

            <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
              {field} Tahmini Türkiye Sıralaması
            </span>

            <div className="font-display text-5xl font-black text-[var(--primary)] tracking-tight mt-3">
              #{currentRank.toLocaleString("tr-TR")}
            </div>

            <p className="text-xs font-medium text-[var(--muted)] mt-2">
              Yaklaşık Aralık: #{(Math.round(currentRank * 0.88)).toLocaleString("tr-TR")} - #{(Math.round(currentRank * 1.15)).toLocaleString("tr-TR")}
            </p>

            <div className="mt-5 pt-4 border-t border-[var(--outline)] grid grid-cols-2 gap-3 text-left">
              <div className="p-2.5 rounded-xl bg-white border border-[var(--outline)]">
                <span className="text-[10px] text-[var(--muted)] block">Yerleştirme Puanı</span>
                <span className="font-display text-base font-bold text-[var(--ink)]">
                  {currentPlacementScore}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-[var(--outline)]">
                <span className="text-[10px] text-[var(--muted)] block">Ham Puan</span>
                <span className="font-display text-base font-bold text-[var(--muted)]">
                  {currentRawScore}
                </span>
              </div>
            </div>

            {/* Social Share Buttons */}
            <div className="mt-4 pt-3 border-t border-[var(--outline)] flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const text = `🎯 2025 YKS Simülatöründe ${field} sıralama tahminim: #${currentRank.toLocaleString("tr-TR")}! Netlerini sen de hesapla: https://yks-batuhan.vercel.app/simulator`;
                  window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
                }}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50/80 px-3 py-2 text-[11px] font-bold text-emerald-800 hover:bg-emerald-100 transition-colors shadow-2xs"
              >
                <span>WhatsApp&apos;ta Paylaş</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  const text = `🎯 2025 YKS Simülatöründe ${field} tahmini sıralamam: #${currentRank.toLocaleString("tr-TR")}! @yksodak ile hesapla: https://yks-batuhan.vercel.app/simulator`;
                  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank");
                }}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-[var(--outline)] bg-white px-3 py-2 text-[11px] font-bold text-[var(--ink)] hover:bg-[var(--surface-muted)] transition-colors shadow-2xs"
              >
                <span>X (Twitter)</span>
              </button>
            </div>
          </div>

          {/* Target Comparison & AI Strategy Recommendation */}
          <div className="paper-card p-6 bg-white shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--outline)]">
              <div className="flex items-center gap-2">
                <Target size={18} className="text-[var(--primary)]" />
                <h3 className="font-display text-base font-bold text-[var(--ink)]">
                  Hedef Karşılaştırması
                </h3>
              </div>
              <span className="text-xs font-bold text-[var(--primary)]">
                #{targetRank.toLocaleString("tr-TR")}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-[var(--muted)]">Hedef Bölüm:</span>
                <strong className="text-[var(--ink)]">{profile.targetDepartment || "Mühendislik / Tıp"}</strong>
              </div>

              {isTargetAchieved ? (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs leading-relaxed flex items-start gap-2.5">
                  <CheckCircle2 size={18} className="text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold">Harika Gidiyorsun!</strong>
                    <p className="mt-0.5">
                      Bu netlerle hedefin olan ilk #{targetRank.toLocaleString("tr-TR")} diliminin içerisindesin. Bu tempoyu koru ve deneme sınavlarıyla süreni pekiştir.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed space-y-2">
                  <div className="flex items-center gap-2 font-bold">
                    <Flame size={16} className="text-amber-700" />
                    <span>Hedefe Kalan Sıralama Farkı: ~{rankGap.toLocaleString("tr-TR")} kişi</span>
                  </div>
                  <p>
                    {field === "SAY"
                      ? "AYT Matematik netini +4, AYT Fen netini +3 artırdığında hedef sıralamana doğrudan ulaşıyorsun."
                      : field === "EA"
                      ? "AYT Matematik netini +3, Edebiyat netini +4 artırdığında hedef dilimine rahatça yerleşebilirsin."
                      : "TYT Paragraf rutiniyle Türkçe netini +4 ve alan netlerini +5 artırarak hedefine ulaşabilirsin."}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-2">
              <Link
                href="/coach"
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--primary)] text-white p-3 text-xs font-bold shadow-xs hover:bg-[#34402e] transition-colors"
              >
                <Sparkles size={16} />
                <span>Bu Netleri AI Koçum ile Tartış</span>
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>

          {/* Quick Info Box */}
          <div className="p-4 rounded-xl border border-[var(--outline)] bg-[#fbf9f5] text-[11px] text-[var(--muted)] leading-relaxed flex items-start gap-2">
            <Info size={16} className="text-[var(--primary)] shrink-0 mt-0.5" />
            <p>
              Hesaplamalar 2024 ÖSYM resmi standart sapma, test ağırlıkları ve yığılma verileri referans alınarak 2025/2026 sınav projeksiyonu olarak simüle edilmektedir.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function NetSlider({
  label,
  max,
  value,
  onChange,
  coefficient,
}: {
  label: string;
  max: number;
  value: number;
  onChange: (val: number) => void;
  coefficient: string;
}) {
  return (
    <div className="p-4 rounded-xl border border-[var(--outline)] bg-[#fbf9f5] hover:border-[var(--primary)]/50 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <div>
          <span className="text-xs font-bold text-[var(--ink)] block">{label}</span>
          <span className="text-[10px] text-[var(--muted)]">Katsayı {coefficient}</span>
        </div>
        <div className="flex items-center gap-1">
          <input
            type="number"
            min={0}
            max={max}
            step={0.25}
            value={value}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              onChange(isNaN(val) ? 0 : Math.max(0, Math.min(max, val)));
            }}
            className="w-16 rounded-lg border border-[var(--outline)] bg-white px-2 py-1 text-center font-display text-sm font-bold text-[var(--primary)] outline-none focus:border-[var(--primary)]"
          />
          <span className="text-xs text-[var(--muted)] font-semibold">/ {max}</span>
        </div>
      </div>

      <input
        type="range"
        min={0}
        max={max}
        step={0.25}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-[var(--primary)] cursor-pointer"
      />
    </div>
  );
}
