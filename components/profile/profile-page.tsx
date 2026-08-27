"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Award,
  BookOpen,
  Clock3,
  Edit3,
  Flame,
  GraduationCap,
  Sparkles,
  Target,
  Trophy,
  X,
} from "lucide-react";
import { defaultProfile } from "@/lib/mock-data";
import { getExams, getProfile, getTopics, updateProfile } from "@/lib/study-store";
import type { UserProfile } from "@/types/study";
import { BadgeShowcase } from "@/components/profile/badge-showcase";
import { StudyHeatmap } from "@/components/analytics/study-heatmap";

export function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [editOpen, setEditOpen] = useState(false);
  const [examCount, setExamCount] = useState(3);
  const [completedTopicsCount, setCompletedTopicsCount] = useState(8);

  useEffect(() => {
    const handleUpdate = () => {
      setProfile(getProfile());
      setExamCount(getExams().length);
      setCompletedTopicsCount(getTopics().filter((t) => t.status === "completed").length);
    };
    const timer = setTimeout(handleUpdate, 0);
    window.addEventListener("study_store_change", handleUpdate);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("study_store_change", handleUpdate);
    };
  }, []);

  if (!profile) return null;

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8 md:px-10 space-y-8">
      {/* Header Profile Card */}
      <div className="paper-card p-6 md:p-8 bg-gradient-to-b from-white to-[#fbf9f5] border-[var(--outline)] relative overflow-hidden shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-[var(--primary-soft)] border-2 border-[var(--primary)] text-2xl font-bold font-display text-[var(--primary)] shadow-sm">
              {profile.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-2xl md:text-3xl font-bold text-[var(--ink)]">
                  {profile.name}
                </h1>
                <span className="rounded-full bg-[var(--surface-ai)] px-2.5 py-0.5 text-xs font-semibold text-[var(--primary)] border border-[#d7e8cb]">
                  {profile.examType} Adayı
                </span>
              </div>
              <p className="mt-1 text-sm text-[var(--muted)] flex items-center gap-2">
                <GraduationCap size={16} />
                <span>
                  Hedef: <strong>{profile.targetDepartment}</strong>
                  {profile.targetUniversity ? ` (${profile.targetUniversity})` : ""}
                </span>
              </p>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                Hedef Sıralama: <strong className="text-[var(--ink)]">#{profile.targetRank.toLocaleString("tr-TR")}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={() => setEditOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--outline)] bg-white px-4 py-2.5 text-xs font-semibold text-[var(--ink)] hover:bg-[var(--surface-muted)] transition-all shadow-2xs active:scale-95 touch-manipulation"
          >
            <Edit3 size={15} />
            <span>Hedefleri Düzenle</span>
          </button>
        </div>
      </div>

      {/* Stats 4-Card Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="paper-card p-5 bg-white shadow-2xs">
          <Clock3 size={20} className="text-[var(--primary)]" />
          <p className="mt-3 text-xs text-[var(--muted)]">Toplam Çalışma</p>
          <p className="mt-1 font-display text-2xl font-bold text-[var(--ink)]">
            {profile.totalHoursStudied}s
          </p>
        </div>

        <div className="paper-card p-5 bg-white shadow-2xs">
          <BookOpen size={20} className="text-[var(--primary)]" />
          <p className="mt-3 text-xs text-[var(--muted)]">Çözülen Soru</p>
          <p className="mt-1 font-display text-2xl font-bold text-[var(--ink)]">
            {profile.totalQuestionsSolved.toLocaleString("tr-TR")}
          </p>
        </div>

        <div className="paper-card p-5 bg-white shadow-2xs">
          <Flame size={20} className="text-[#ba1a1a]" />
          <p className="mt-3 text-xs text-[var(--muted)]">Aktif Seri</p>
          <p className="mt-1 font-display text-2xl font-bold text-[#ba1a1a]">
            {profile.streakDays} Gün
          </p>
        </div>

        <button
          type="button"
          onClick={() => setEditOpen(true)}
          className="paper-card p-5 bg-white shadow-2xs text-left hover:border-[var(--primary)] transition-all cursor-pointer group"
          title="Hedef Neti Düzenle"
        >
          <div className="flex items-center justify-between">
            <Target size={20} className="text-[var(--primary)]" />
            <span className="text-[10px] font-bold text-[var(--primary)] opacity-0 group-hover:opacity-100 transition-opacity">
              Düzenle ✎
            </span>
          </div>
          <p className="mt-3 text-xs text-[var(--muted)]">Hedef Net</p>
          <p className="mt-1 font-display text-2xl font-bold text-[var(--primary)]">
            {profile.examTargetNet} Net
          </p>
        </button>
      </div>

      {/* Activity Heatmap */}
      <StudyHeatmap streakDays={profile.streakDays} />

      {/* Achievement Badges Showcase */}
      <BadgeShowcase
        stats={{
          streakDays: profile.streakDays,
          totalQuestions: profile.totalQuestionsSolved,
          completedTopicsCount,
          examCount,
        }}
      />

      {/* Quick Settings & Help */}
      <div className="paper-card p-6 bg-[var(--surface-ai)] border-[#d7e8cb] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-display text-base font-bold text-[#4E5D47] flex items-center gap-2">
            <Sparkles size={18} className="text-[var(--primary)]" />
            YKS Hazırlık Yolculuğun
          </h3>
          <p className="text-xs text-[#596952] mt-1">
            Hedef bölümünü, netini veya çalışma tercihlerini ayarlamak için Ayarlar sayfasını kullanabilirsin.
          </p>
        </div>
        <Link
          href="/settings"
          className="rounded-xl bg-[var(--primary)] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[var(--primary-strong)] transition-all shrink-0"
        >
          Ayarlara Git
        </Link>
      </div>

      {/* Edit Profile Modal */}
      {editOpen && (
        <EditProfileModal profile={profile} onClose={() => setEditOpen(false)} />
      )}
    </div>
  );
}

function EditProfileModal({
  profile,
  onClose,
}: {
  profile: UserProfile;
  onClose: () => void;
}) {
  const [name, setName] = useState(profile.name);
  const [targetDepartment, setTargetDepartment] = useState(profile.targetDepartment);
  const [targetUniversity, setTargetUniversity] = useState(profile.targetUniversity);
  const [targetRank, setTargetRank] = useState(profile.targetRank);
  const [examType, setExamType] = useState(profile.examType);
  const [examTargetNet, setExamTargetNet] = useState(profile.examTargetNet || 85);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name,
      targetDepartment,
      targetUniversity,
      targetRank: Number(targetRank) || 10000,
      examType,
      examTargetNet: Number(examTargetNet) || 85,
    });
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-[var(--outline)] bg-white p-6 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto custom-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-[var(--outline)]">
          <h2 className="font-display text-lg font-bold text-[var(--ink)]">Hedefleri & Bilgileri Düzenle</h2>
          <button onClick={onClose} aria-label="Kapat" className="text-[var(--muted)] hover:text-[var(--ink)]">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--ink)] mb-1">İsim</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-[var(--outline)] p-2.5 text-sm outline-none focus:border-[var(--primary)]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--ink)] mb-1">Hedef Bölüm</label>
            <input
              type="text"
              required
              placeholder="Örn: Bilgisayar Mühendisliği, Tıp..."
              value={targetDepartment}
              onChange={(e) => setTargetDepartment(e.target.value)}
              className="w-full rounded-lg border border-[var(--outline)] p-2.5 text-sm outline-none focus:border-[var(--primary)]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--ink)] mb-1">Hedef Üniversite (İsteğe Bağlı)</label>
            <input
              type="text"
              placeholder="Örn: ODTÜ, İTÜ, Boğaziçi..."
              value={targetUniversity}
              onChange={(e) => setTargetUniversity(e.target.value)}
              className="w-full rounded-lg border border-[var(--outline)] p-2.5 text-sm outline-none focus:border-[var(--primary)]"
            />
          </div>

          {/* Hedef Net Input & Presets */}
          <div className="p-3.5 rounded-xl bg-[var(--surface-ai)] border border-[#d7e8cb] space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-[#3d4b35] flex items-center gap-1.5">
                <Target size={15} className="text-[var(--primary)]" />
                <span>Hedef Net (Sınav Hedefi)</span>
              </label>
              <span className="font-display font-bold text-[var(--primary)] text-base">
                {examTargetNet} Net
              </span>
            </div>
            <input
              type="number"
              min={10}
              max={160}
              step={1}
              required
              value={examTargetNet}
              onChange={(e) => setExamTargetNet(Number(e.target.value))}
              className="w-full rounded-lg border border-[var(--outline)] bg-white p-2.5 text-sm font-semibold outline-none focus:border-[var(--primary)]"
            />
            <div className="flex items-center gap-1.5 pt-1">
              {[60, 75, 90, 105, 120].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setExamTargetNet(val)}
                  className={`flex-1 rounded-md py-1 text-[11px] font-semibold transition-all ${
                    examTargetNet === val
                      ? "bg-[var(--primary)] text-white shadow-2xs"
                      : "bg-white border border-[var(--outline)] text-[var(--muted)] hover:text-[var(--ink)]"
                  }`}
                >
                  {val} Net
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--ink)] mb-1">Hedef Sıralama</label>
              <input
                type="number"
                min={1}
                value={targetRank}
                onChange={(e) => setTargetRank(Number(e.target.value))}
                className="w-full rounded-lg border border-[var(--outline)] p-2.5 text-sm outline-none focus:border-[var(--primary)]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--ink)] mb-1">Sınav Tercihi</label>
              <select
                value={examType}
                onChange={(e) => setExamType(e.target.value as UserProfile["examType"])}
                className="w-full rounded-lg border border-[var(--outline)] p-2.5 text-sm outline-none focus:border-[var(--primary)]"
              >
                <option value="TYT">Sadece TYT</option>
                <option value="TYT+AYT">TYT + AYT</option>
                <option value="AYT">Sadece AYT</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full rounded-xl bg-[var(--primary)] py-3 text-sm font-bold text-white shadow-xs hover:bg-[var(--primary-strong)] active:scale-95 transition-all touch-manipulation"
            >
              Hedefleri Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
