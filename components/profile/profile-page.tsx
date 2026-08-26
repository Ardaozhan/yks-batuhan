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
import { getProfile, updateProfile } from "@/lib/study-store";
import type { UserProfile } from "@/types/study";

export function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    const handleUpdate = () => setProfile(getProfile());
    const timer = setTimeout(handleUpdate, 0);
    window.addEventListener("study_store_change", handleUpdate);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("study_store_change", handleUpdate);
    };
  }, []);

  if (!profile) return null;

  const badges = [
    {
      title: "Başlangıç Rozeti",
      desc: "YKS Master çalışma alanını oluşturdun",
      icon: Sparkles,
      color: "text-[var(--primary)] bg-[var(--surface-ai)]",
      earned: true,
    },
    {
      title: "7 Gün Seri",
      desc: "Kesintisiz 7 gün çalıştın",
      icon: Flame,
      color: "text-[#ba1a1a] bg-[#ffdad6]/60",
      earned: profile.streakDays >= 7,
    },
    {
      title: "1.000+ Soru",
      desc: "Soru bankalarında ilk bin barajı",
      icon: Trophy,
      color: "text-amber-600 bg-amber-50",
      earned: profile.totalQuestionsSolved >= 1000,
    },
    {
      title: "Deneme Analisti",
      desc: "Tüm deneme yanlışlarını kategoriledin",
      icon: Award,
      color: "text-blue-600 bg-blue-50",
      earned: false,
    },
  ];

  return (
    <div className="mx-auto max-w-[1040px] px-4 py-6 md:px-10 md:py-10">
      {/* Profile Card */}
      <section className="paper-card p-6 md:p-8 bg-white mb-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border-2 border-[var(--primary)] bg-[var(--primary-soft)] font-display text-3xl font-bold text-[var(--primary)] shadow-sm">
              {profile.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="font-display text-2xl md:text-3xl font-bold text-[var(--ink)]">
                  {profile.name}
                </h1>
                <span className="rounded-full bg-[var(--surface-ai)] px-3 py-0.5 text-xs font-bold text-[var(--primary)] border border-[#d7e8cb]">
                  {profile.examType}
                </span>
              </div>
              <p className="mt-1 text-sm text-[var(--muted)] flex items-center gap-1.5">
                <GraduationCap size={16} className="text-[var(--primary)]" />
                <span>
                  Hedef: <strong>{profile.targetDepartment}</strong>
                  {profile.targetUniversity ? ` • ${profile.targetUniversity}` : ""}
                </span>
              </p>
              <div className="mt-2 flex items-center gap-3 text-xs text-[var(--muted)]">
                <span>Gün {profile.dayCount} / {profile.totalDays}</span>
                <span>•</span>
                <span className="text-[var(--primary)] font-semibold">Hedef Sıralama: #{profile.targetRank.toLocaleString("tr-TR")}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setEditOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--outline)] bg-white px-4 py-2.5 text-xs font-semibold text-[var(--ink)] hover:border-[var(--primary)] hover:bg-[var(--surface-muted)] transition-all active:scale-95 self-start sm:self-center"
          >
            <Edit3 size={15} />
            <span>Hedefleri Düzenle</span>
          </button>
        </div>
      </section>

      {/* Stats Bento Grid */}
      <h2 className="font-display text-lg font-bold text-[var(--ink)] mb-4">
        Genel Çalışma İstatistikleri
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
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

        <div className="paper-card p-5 bg-white shadow-2xs">
          <Target size={20} className="text-[var(--primary)]" />
          <p className="mt-3 text-xs text-[var(--muted)]">Hedef Net</p>
          <p className="mt-1 font-display text-2xl font-bold text-[var(--primary)]">
            {profile.examTargetNet} Net
          </p>
        </div>
      </div>

      {/* Achievement Badges */}
      <h2 className="font-display text-lg font-bold text-[var(--ink)] mb-4">
        Başarı Rozetleri
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {badges.map((b) => {
          const Icon = b.icon;
          return (
            <div
              key={b.title}
              className="paper-card p-5 bg-white flex items-center gap-4 hover:border-[var(--primary)] transition-all shadow-2xs"
            >
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${b.color}`}>
                <Icon size={24} />
              </div>
              <div>
                <h3 className="font-display text-sm font-bold text-[var(--ink)]">{b.title}</h3>
                <p className="text-xs text-[var(--muted)] mt-0.5">{b.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Settings & Help */}
      <div className="paper-card p-6 bg-[var(--surface-ai)] border-[#d7e8cb] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-display text-base font-bold text-[#4E5D47] flex items-center gap-2">
            <Sparkles size={18} className="text-[var(--primary)]" />
            YKS Hazırlık Yolculuğun
          </h3>
          <p className="text-xs text-[#596952] mt-1">
            Hedef bölümünü değiştirmek veya çalışma tercihlerini ayarlamak için Ayarlar sayfasını kullanabilirsin.
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name,
      targetDepartment,
      targetUniversity,
      targetRank: Number(targetRank) || 10000,
      examType,
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
        className="w-full max-w-md rounded-2xl border border-[var(--outline)] bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-[var(--outline)]">
          <h2 className="font-display text-lg font-bold text-[var(--ink)]">Hedefleri Düzenle</h2>
          <button onClick={onClose} className="text-[var(--muted)] hover:text-[var(--ink)]">
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
              value={targetDepartment}
              onChange={(e) => setTargetDepartment(e.target.value)}
              className="w-full rounded-lg border border-[var(--outline)] p-2.5 text-sm outline-none focus:border-[var(--primary)]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--ink)] mb-1">Hedef Üniversite</label>
            <input
              type="text"
              value={targetUniversity}
              onChange={(e) => setTargetUniversity(e.target.value)}
              className="w-full rounded-lg border border-[var(--outline)] p-2.5 text-sm outline-none focus:border-[var(--primary)]"
            />
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

          <div className="pt-3">
            <button
              type="submit"
              className="w-full rounded-xl bg-[var(--primary)] py-3 text-sm font-semibold text-white hover:bg-[var(--primary-strong)] active:scale-95 transition-all"
            >
              Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
