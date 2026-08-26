"use client";

import { useEffect, useState } from "react";
import {
  Bell,
  CheckCircle2,
  Database,
  Download,
  RotateCcw,
  Save,
  Target,
} from "lucide-react";
import { defaultProfile } from "@/lib/mock-data";
import { getProfile, updateProfile } from "@/lib/study-store";

export function SettingsPage() {
  const [profile, setProfile] = useState({
    name: defaultProfile.name,
    targetDepartment: defaultProfile.targetDepartment,
    targetUniversity: defaultProfile.targetUniversity,
    dailyTargetHours: 5,
    weeklyTargetQuestions: 1200,
  });

  const [notifs, setNotifs] = useState({
    dailyReminder: true,
    paragraphAlert: true,
    weekendExam: true,
    aiTips: true,
  });

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const handleUpdate = () => {
      const p = getProfile();
      setProfile((prev) => ({
        ...prev,
        name: p.name,
        targetDepartment: p.targetDepartment,
        targetUniversity: p.targetUniversity,
      }));
    };

    const timer = setTimeout(handleUpdate, 0);
    window.addEventListener("study_store_change", handleUpdate);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("study_store_change", handleUpdate);
    };
  }, []);

  const handleSave = () => {
    updateProfile({
      name: profile.name,
      targetDepartment: profile.targetDepartment,
      targetUniversity: profile.targetUniversity,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleResetData = () => {
    if (window.confirm("Tüm yerel veriler varsayılan ayarlara döndürülecek. Emin misiniz?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleExportData = () => {
    const data = {
      profile: getProfile(),
      timestamp: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `yks_master_yedek_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  return (
    <div className="mx-auto max-w-[880px] px-4 py-6 md:px-10 md:py-10">
      <header className="mb-7 border-b border-[var(--outline)] pb-6">
        <h1 className="font-display text-3xl font-bold tracking-tight text-[var(--ink)]">
          Ayarlar
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Çalışma hedeflerini, bildirim tercihlerini ve veri bağlantılarını yapılandır.
        </p>
      </header>

      <div className="space-y-6">
        {/* Section 1: Study Goals */}
        <section className="paper-card p-6 bg-white shadow-xs">
          <h2 className="font-display text-lg font-bold text-[var(--ink)] flex items-center gap-2 mb-4">
            <Target size={18} className="text-[var(--primary)]" />
            <span>Çalışma Hedefleri</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--ink)] mb-1">
                Günlük Hedef Çalışma Süresi (Saat)
              </label>
              <input
                type="number"
                min={1}
                max={16}
                value={profile.dailyTargetHours}
                onChange={(e) =>
                  setProfile({ ...profile, dailyTargetHours: Number(e.target.value) })
                }
                className="w-full rounded-lg border border-[var(--outline)] p-2.5 text-sm outline-none focus:border-[var(--primary)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--ink)] mb-1">
                Haftalık Hedef Soru Sayısı
              </label>
              <input
                type="number"
                min={100}
                step={50}
                value={profile.weeklyTargetQuestions}
                onChange={(e) =>
                  setProfile({ ...profile, weeklyTargetQuestions: Number(e.target.value) })
                }
                className="w-full rounded-lg border border-[var(--outline)] p-2.5 text-sm outline-none focus:border-[var(--primary)]"
              />
            </div>
          </div>
        </section>

        {/* Section 2: Notifications */}
        <section className="paper-card p-6 bg-white shadow-xs">
          <h2 className="font-display text-lg font-bold text-[var(--ink)] flex items-center gap-2 mb-4">
            <Bell size={18} className="text-[var(--primary)]" />
            <span>Bildirimler ve Hatırlatıcılar</span>
          </h2>

          <div className="space-y-3">
            {[
              { key: "dailyReminder", label: "Günlük Çalışma Başlangıç Hatırlatıcısı", desc: "Her sabah günün planını hatırlatır" },
              { key: "paragraphAlert", label: "Düzenli Paragraf Pratiği Uyarısı", desc: "Günde 30 soru paragraf çözmeyi unutmamanı sağlar" },
              { key: "weekendExam", label: "Haftalık Deneme Sınavı Hatırlatması", desc: "Hafta sonu genel deneme günlerinde bildirim gönderir" },
              { key: "aiTips", label: "AI Koç Akıllı Tavsiyeleri", desc: "Yanlış yaptığın konular için anlık öneriler sunar" },
            ].map((item) => (
              <label
                key={item.key}
                className="flex items-center justify-between p-3 rounded-xl border border-[var(--outline)] hover:bg-[#fbf9f5] cursor-pointer transition-colors"
              >
                <div>
                  <p className="text-xs font-semibold text-[var(--ink)]">{item.label}</p>
                  <p className="text-[11px] text-[var(--muted)]">{item.desc}</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifs[item.key as keyof typeof notifs]}
                  onChange={(e) =>
                    setNotifs({ ...notifs, [item.key]: e.target.checked })
                  }
                  className="h-4 w-4 rounded accent-[var(--primary)]"
                />
              </label>
            ))}
          </div>
        </section>

        {/* Section 3: Data & Sync */}
        <section className="paper-card p-6 bg-white shadow-xs">
          <h2 className="font-display text-lg font-bold text-[var(--ink)] flex items-center gap-2 mb-4">
            <Database size={18} className="text-[var(--primary)]" />
            <span>Veri ve Senkronizasyon</span>
          </h2>

          <div className="p-4 rounded-xl bg-[var(--surface-ai)] border border-[#d7e8cb] mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#4E5D47] flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-[var(--primary)]" />
                Bulut Senkronizasyonu Aktif
              </p>
              <p className="text-[11px] text-[#596952] mt-0.5">
                Verileriniz yerel tarayıcıda ve Supabase bulut veritabanında güvenle saklanmaktadır.
              </p>
            </div>
            <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1">
              Bağlı
            </span>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleExportData}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--outline)] bg-white px-4 py-2 text-xs font-semibold text-[var(--ink)] hover:bg-[var(--surface-muted)] transition-all"
            >
              <Download size={14} />
              <span>Verileri Dışa Aktar (.json)</span>
            </button>

            <button
              onClick={handleResetData}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 transition-all"
            >
              <RotateCcw size={14} />
              <span>Tüm Verileri Sıfırla</span>
            </button>
          </div>
        </section>

        {/* Save Button */}
        <div className="flex items-center justify-between pt-2">
          {saved && (
            <span className="text-xs font-semibold text-[var(--primary)] flex items-center gap-1">
              <CheckCircle2 size={16} />
              Ayarlar başarıyla kaydedildi!
            </span>
          )}
          <button
            onClick={handleSave}
            className="ml-auto inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-white hover:bg-[var(--primary-strong)] active:scale-95 shadow-md transition-all"
          >
            <Save size={16} />
            <span>Değişiklikleri Kaydet</span>
          </button>
        </div>
      </div>
    </div>
  );
}
