"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  GraduationCap,
  School,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { updateProfile } from "@/lib/study-store";

export function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState<number>(1);
  const [examType, setExamType] = useState<"TYT" | "TYT+AYT">("TYT+AYT");
  const [department, setDepartment] = useState("");
  const [university, setUniversity] = useState("");
  const [rank, setRank] = useState<number | "">("");
  const [name, setName] = useState("");

  const handleFinish = () => {
    setStep(4);
    updateProfile({
      name: name.trim() || "Öğrenci",
      targetDepartment: department.trim() || "Hedef Belirle",
      targetUniversity: university.trim(),
      targetRank: Number(rank) || 10000,
      examType,
    });

    setTimeout(() => {
      router.push("/today");
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--ink)] flex flex-col justify-center px-4 py-8">
      {/* STEP 1: WELCOME */}
      {step === 1 && (
        <div className="w-full max-w-xl mx-auto text-center space-y-6 animate-in fade-in">
          <div>
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-[var(--surface-ai)] text-[var(--primary)] mb-4 border border-[#d7e8cb] shadow-sm">
              <Sparkles size={34} />
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-[var(--primary)]">
              YKS OS
            </h1>
          </div>

          <h2 className="font-display text-2xl sm:text-3xl font-bold text-[var(--ink)]">
            YKS yolculuğunu tek yerde yönet.
          </h2>

          <p className="text-base text-[var(--muted)] max-w-md mx-auto leading-relaxed">
            Çalışmalarını planla, gelişimini takip et ve AI koçunla neye odaklanman gerektiğini keşfet.
          </p>

          <div className="flex flex-col w-full max-w-xs gap-3 mx-auto pt-4">
            <button
              onClick={() => setStep(2)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--primary)] py-4 px-6 text-sm font-semibold text-white shadow-md hover:bg-[var(--primary-strong)] active:scale-95 transition-all"
            >
              <span>Başlayalım</span>
              <ArrowRight size={18} />
            </button>

            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-xl border border-[var(--outline)] bg-white py-3.5 px-6 text-sm font-semibold text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-muted)] transition-all"
            >
              Zaten bir hesabın var mı? Giriş Yap
            </Link>
          </div>
        </div>
      )}

      {/* STEP 2: EXAM TYPE */}
      {step === 2 && (
        <div className="w-full max-w-xl mx-auto space-y-6 animate-in fade-in">
          <button
            onClick={() => setStep(1)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--muted)] hover:text-[var(--primary)]"
          >
            <ArrowLeft size={16} />
            <span>Geri</span>
          </button>

          {/* Progress bar */}
          <div className="h-1.5 w-full bg-[#efeeea] rounded-full overflow-hidden">
            <div className="h-full bg-[var(--primary)] w-1/3 rounded-full transition-all" />
          </div>

          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[var(--ink)]">
              Bu yıl hangi sınava hazırlanıyorsun?
            </h2>
            <p className="text-xs text-[var(--muted)] mt-1">
              Sana uygun konu ve deneme dağılımını belirlememiz için sınav türünü seç.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            <label
              onClick={() => setExamType("TYT")}
              className={`flex items-center justify-between p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                examType === "TYT"
                  ? "border-[var(--primary)] bg-[#E9EEE6] shadow-xs"
                  : "border-[var(--outline)] bg-white hover:bg-[#fbf9f5]"
              }`}
            >
              <div>
                <p className="font-display text-base font-bold text-[var(--ink)]">Sadece TYT</p>
                <p className="text-xs text-[var(--muted)] mt-1">
                  Önlisans programları ve temel yeterlilik sınavı için
                </p>
              </div>
              <div
                className={`h-6 w-6 rounded-full border-2 flex items-center justify-center ${
                  examType === "TYT"
                    ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                    : "border-[var(--outline)]"
                }`}
              >
                {examType === "TYT" && <Check size={14} strokeWidth={3} />}
              </div>
            </label>

            <label
              onClick={() => setExamType("TYT+AYT")}
              className={`flex items-center justify-between p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                examType === "TYT+AYT"
                  ? "border-[var(--primary)] bg-[#E9EEE6] shadow-xs"
                  : "border-[var(--outline)] bg-white hover:bg-[#fbf9f5]"
              }`}
            >
              <div>
                <p className="font-display text-base font-bold text-[var(--ink)]">TYT + AYT</p>
                <p className="text-xs text-[var(--muted)] mt-1">
                  4 yıllık lisans programları ve alan yeterliliği için (Sayısal, Eşit Ağırlık, Sözel, Dil)
                </p>
              </div>
              <div
                className={`h-6 w-6 rounded-full border-2 flex items-center justify-center ${
                  examType === "TYT+AYT"
                    ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                    : "border-[var(--outline)]"
                }`}
              >
                {examType === "TYT+AYT" && <Check size={14} strokeWidth={3} />}
              </div>
            </label>
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={() => setStep(3)}
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] py-3 px-8 text-sm font-semibold text-white shadow-md hover:bg-[var(--primary-strong)] active:scale-95 transition-all"
            >
              <span>Devam Et</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: TARGET GOAL */}
      {step === 3 && (
        <div className="w-full max-w-xl mx-auto space-y-6 animate-in fade-in">
          <button
            onClick={() => setStep(2)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--muted)] hover:text-[var(--primary)]"
          >
            <ArrowLeft size={16} />
            <span>Geri</span>
          </button>

          {/* Progress bar */}
          <div className="h-1.5 w-full bg-[#efeeea] rounded-full overflow-hidden">
            <div className="h-full bg-[var(--primary)] w-2/3 rounded-full transition-all" />
          </div>

          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[var(--ink)]">
              Hedefin nedir?
            </h2>
            <p className="text-xs text-[var(--muted)] mt-1">
              Yapay zeka koçun planlamanı ve gereken netleri bu hedefe göre optimize edecek.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-[var(--ink)] mb-1">
                Adın / Takma Adın
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Örn: Ahmet, Zeynep..."
                className="w-full rounded-xl border border-[var(--outline)] bg-white p-3 text-sm outline-none focus:border-[var(--primary)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--ink)] mb-1">
                Hedef Bölüm
              </label>
              <div className="relative flex items-center">
                <GraduationCap size={18} className="absolute left-3.5 text-[var(--primary)]" />
                <input
                  type="text"
                  required
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="Örn: Bilgisayar Mühendisliği, Hukuk, Tıp..."
                  className="w-full rounded-xl border border-[var(--outline)] bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-[var(--primary)]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--ink)] mb-1">
                Hedef Üniversite (İsteğe Bağlı)
              </label>
              <div className="relative flex items-center">
                <School size={18} className="absolute left-3.5 text-[var(--muted)]" />
                <input
                  type="text"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  placeholder="Örn: Boğaziçi Üniversitesi, ODTÜ, İTÜ..."
                  className="w-full rounded-xl border border-[var(--outline)] bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-[var(--primary)]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--ink)] mb-1">
                Hedef Sıralama
              </label>
              <div className="relative flex items-center">
                <TrendingUp size={18} className="absolute left-3.5 text-[var(--muted)]" />
                <input
                  type="number"
                  min={1}
                  value={rank}
                  onChange={(e) => setRank(Number(e.target.value))}
                  placeholder="Örn: 5000"
                  className="w-full rounded-xl border border-[var(--outline)] bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-[var(--primary)]"
                />
              </div>
            </div>

            <div className="rounded-xl border border-[#d7e8cb] bg-[#E9EEE6] p-4 text-xs leading-relaxed text-[#4E5D47] flex items-start gap-2.5">
              <Sparkles size={16} className="text-[#526049] shrink-0 mt-0.5" />
              <span>
                AI Koç, hedefine ulaşman için gereken TYT ve AYT netlerini hesaplayacak ve çalışma
                planını bu hedefe göre yönlendirecektir.
              </span>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={handleFinish}
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] py-3.5 px-8 text-sm font-semibold text-white shadow-md hover:bg-[var(--primary-strong)] active:scale-95 transition-all"
            >
              <span>Çalışma Alanımı Oluştur</span>
              <Check size={18} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: PROCESSING & REDIRECT */}
      {step === 4 && (
        <div className="w-full max-w-md mx-auto text-center space-y-6 animate-in fade-in">
          <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
            <div className="absolute inset-0 animate-spin rounded-full border-4 border-[var(--surface-muted)] border-t-[var(--primary)]" />
            <Sparkles size={32} className="text-[var(--primary)] animate-pulse" />
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold text-[var(--ink)]">
              Çalışma alanın hazırlanıyor...
            </h2>
            <p className="text-xs text-[var(--muted)] mt-1.5">
              Yapay zeka hedeflerini ve ders listesini optimize ediyor.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
