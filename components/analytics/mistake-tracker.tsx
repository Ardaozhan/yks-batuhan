"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Plus, Trash2 } from "lucide-react";
import { EmptyMistakesIllustration } from "@/components/ui/animated-illustrations";
import { useToast } from "@/components/ui/toaster";

interface MistakeItem {
  id: string;
  subject: string;
  topic: string;
  note: string;
  resolved: boolean;
  createdAt: string;
}

export function MistakeTracker() {
  const { toast } = useToast();
  const [items, setItems] = useState<MistakeItem[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newSubject, setNewSubject] = useState("Matematik");
  const [newTopic, setNewTopic] = useState("");
  const [newNote, setNewNote] = useState("");

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      try {
        const saved = localStorage.getItem("yks_mistakes");
        if (!cancelled) {
          setItems(saved ? JSON.parse(saved) : []);
        }
      } catch {
        if (!cancelled) {
          setItems([]);
        }
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const saveItems = (updated: MistakeItem[]) => {
    setItems(updated);
    try {
      localStorage.setItem("yks_mistakes", JSON.stringify(updated));
    } catch {}
  };

  const handleToggle = (id: string) => {
    const updated = items.map((it) =>
      it.id === id ? { ...it, resolved: !it.resolved } : it
    );
    saveItems(updated);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = items.filter((it) => it.id !== id);
    saveItems(updated);
    toast({
      title: "Kayıt Silindi",
      description: "Hata defterinden kaldırıldı.",
      variant: "info",
    });
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopic.trim()) return;

    const newItem: MistakeItem = {
      id: "m_" + Date.now(),
      subject: newSubject,
      topic: newTopic.trim(),
      note: newNote.trim(),
      resolved: false,
      createdAt: new Date().toLocaleDateString("tr-TR"),
    };

    saveItems([newItem, ...items]);
    setNewTopic("");
    setNewNote("");
    setShowAdd(false);
    toast({
      title: "Eksik Konu Eklendi",
      description: "Tekrar listesine başarıyla kaydedildi.",
      variant: "success",
    });
  };

  return (
    <div className="paper-card p-5 sm:p-6 bg-white shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[var(--outline)]">
        <div>
          <h3 className="font-display text-base font-bold text-[var(--ink)] flex items-center gap-2">
            <AlertCircle size={18} className="text-amber-600" />
            <span>Yanlış Soru & Eksik Konu Defteri</span>
          </h3>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            Denemelerde hata yaptığınız veya pekiştirmeniz gereken konular
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAdd(!showAdd)}
          className="inline-flex items-center gap-1 rounded-xl bg-[var(--primary)] px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[var(--primary-strong)] active:scale-95 transition-all touch-manipulation"
        >
          <Plus size={15} />
          <span>Eksik Ekle</span>
        </button>
      </div>

      {/* Add Form */}
      {showAdd && (
        <form
          onSubmit={handleAdd}
          className="p-4 rounded-2xl border border-[var(--outline)] bg-[#fbf9f5] space-y-3 animate-in slide-in-from-top-2 text-xs"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[var(--ink)] mb-1">Ders</label>
              <select
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                className="h-10 w-full rounded-xl border border-[var(--outline)] bg-white px-3 text-xs outline-none focus:border-[var(--primary)]"
              >
                <option value="Matematik">Matematik</option>
                <option value="Geometri">Geometri</option>
                <option value="Fizik">Fizik</option>
                <option value="Kimya">Kimya</option>
                <option value="Biyoloji">Biyoloji</option>
                <option value="Türkçe">Türkçe</option>
                <option value="Edebiyat">Edebiyat</option>
                <option value="Tarih">Tarih</option>
                <option value="Coğrafya">Coğrafya</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-[var(--ink)] mb-1">Konu Başlığı</label>
              <input
                type="text"
                required
                placeholder="Örn: Logaritma, Vektörler..."
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                className="h-10 w-full rounded-xl border border-[var(--outline)] bg-white px-3 text-xs outline-none focus:border-[var(--primary)]"
              >
              </input>
            </div>
          </div>
          <div>
            <label className="block font-semibold text-[var(--ink)] mb-1">
              Hata Sebebi veya Hatırlatıcı Not
            </label>
            <input
              type="text"
              placeholder="Örn: 'İşlem hatası yapıldı, formül kağıdına bakılacak.'"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="h-10 w-full rounded-xl border border-[var(--outline)] bg-white px-3 text-xs outline-none focus:border-[var(--primary)]"
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              className="rounded-xl border border-[var(--outline)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--muted)] hover:text-[var(--ink)]"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              className="rounded-xl bg-[var(--primary)] px-4 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[var(--primary-strong)] active:scale-95"
            >
              Kaydet
            </button>
          </div>
        </form>
      )}

      {/* Items List */}
      <div className="space-y-2.5">
        {items.length === 0 ? (
          <div className="text-center py-5">
            <EmptyMistakesIllustration className="mb-2" />
            <p className="text-xs text-[var(--muted)]">
              Henüz kaydedilmiş eksik konu veya hata notu bulunmuyor.
            </p>
          </div>
        ) : (
          items.map((it) => (
            <div
              key={it.id}
              onClick={() => handleToggle(it.id)}
              className={`p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 cursor-pointer ${
                it.resolved
                  ? "bg-[#faf9f6] border-[var(--outline)] opacity-60"
                  : "bg-white border-[#ffdad6]/80 hover:border-amber-400 shadow-2xs"
              }`}
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggle(it.id);
                  }}
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition-colors mt-0.5 ${
                    it.resolved
                      ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                      : "border-[var(--outline)] bg-white text-transparent"
                  }`}
                >
                  <CheckCircle2 size={16} />
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-[var(--surface-muted)] px-2 py-0.5 text-[10px] font-bold text-[var(--ink)]">
                      {it.subject}
                    </span>
                    <h4
                      className={`text-xs font-bold truncate ${
                        it.resolved ? "line-through text-[var(--muted)]" : "text-[var(--ink)]"
                      }`}
                    >
                      {it.topic}
                    </h4>
                  </div>
                  {it.note && (
                    <p className="mt-1 text-xs text-[var(--muted)] line-clamp-1">{it.note}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] text-[var(--muted)] hidden sm:inline">
                  {it.createdAt}
                </span>
                <button
                  type="button"
                  onClick={(e) => handleDelete(it.id, e)}
                  aria-label="Sil"
                  className="text-[var(--muted)] hover:text-[#ba1a1a] p-1 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
