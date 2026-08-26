"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Award,
  BarChart3,
  BookOpen,
  Calculator,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Command,
  ListTodo,
  Moon,
  Plus,
  Search,
  Settings,
  Shield,
  Sparkles,
  Sun,
  UserRound,
  X,
} from "lucide-react";
import { useTheme } from "../theme/theme-provider";
import { getSubjects, getTopics } from "@/lib/study-store";

interface CommandItem {
  id: string;
  title: string;
  category: "Sayfalar" | "Hızlı Aksiyonlar" | "Müfredat & Konular";
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badge?: string;
  action: () => void;
}

export function CommandMenu({
  open,
  onOpenChange,
  onOpenQuickAdd,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenQuickAdd?: () => void;
}) {
  const router = useRouter();
  const { toggleTheme, resolvedTheme } = useTheme();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Global keydown listener for Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenChange(!open);
      } else if (e.key === "Escape" && open) {
        onOpenChange(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  // Build items
  const items = useMemo<CommandItem[]>(() => {
    const list: CommandItem[] = [
      // Actions
      {
        id: "action-quick-add",
        title: "Yeni Çalışma Görevi Ekle",
        category: "Hızlı Aksiyonlar",
        icon: Plus,
        badge: "Kısayol",
        action: () => {
          onOpenChange(false);
          onOpenQuickAdd?.();
        },
      },
      {
        id: "action-theme",
        title: resolvedTheme === "dark" ? "Açık Temaya Geç" : "Koyu Temaya Geç (Dark Mode)",
        category: "Hızlı Aksiyonlar",
        icon: resolvedTheme === "dark" ? Sun : Moon,
        badge: "Tema",
        action: () => {
          toggleTheme();
          onOpenChange(false);
        },
      },
      // Pages
      {
        id: "page-today",
        title: "Bugün (Çalışma Alanı & Görevler)",
        category: "Sayfalar",
        icon: CalendarDays,
        action: () => {
          router.push("/today");
          onOpenChange(false);
        },
      },
      {
        id: "page-simulator",
        title: "YKS Sıralama & Net Simülatörü 2025/2026",
        category: "Sayfalar",
        icon: Calculator,
        badge: "Önemli",
        action: () => {
          router.push("/simulator");
          onOpenChange(false);
        },
      },
      {
        id: "page-planner",
        title: "AI Akıllı Çalışma Planlayıcısı",
        category: "Sayfalar",
        icon: ListTodo,
        badge: "AI",
        action: () => {
          router.push("/planner");
          onOpenChange(false);
        },
      },
      {
        id: "page-analytics",
        title: "Performans Teşhisi & Analitik",
        category: "Sayfalar",
        icon: BarChart3,
        badge: "AI",
        action: () => {
          router.push("/analytics");
          onOpenChange(false);
        },
      },
      {
        id: "page-subjects",
        title: "Tüm Dersler & MEB Müfredatı",
        category: "Sayfalar",
        icon: BookOpen,
        action: () => {
          router.push("/subjects");
          onOpenChange(false);
        },
      },
      {
        id: "page-exams",
        title: "Deneme Sınavları & Net Takibi",
        category: "Sayfalar",
        icon: Award,
        action: () => {
          router.push("/exams");
          onOpenChange(false);
        },
      },
      {
        id: "page-coach",
        title: "AI Koçum ile Sohbet",
        category: "Sayfalar",
        icon: Sparkles,
        badge: "AI",
        action: () => {
          router.push("/coach");
          onOpenChange(false);
        },
      },
      {
        id: "page-profile",
        title: "Profil & Sınav Hedefleri",
        category: "Sayfalar",
        icon: UserRound,
        action: () => {
          router.push("/profile");
          onOpenChange(false);
        },
      },
      {
        id: "page-settings",
        title: "Uygulama Ayarları",
        category: "Sayfalar",
        icon: Settings,
        action: () => {
          router.push("/settings");
          onOpenChange(false);
        },
      },
      {
        id: "page-admin",
        title: "Yönetici & Koç Paneli",
        category: "Sayfalar",
        icon: Shield,
        badge: "Yönetici",
        action: () => {
          router.push("/admin");
          onOpenChange(false);
        },
      },
    ];

    // Add search-filtered subjects & topics
    if (query.trim().length > 1) {
      const subjects = getSubjects();
      subjects.forEach((s) => {
        if (s.name.toLowerCase().includes(query.toLowerCase())) {
          list.push({
            id: `sub-${s.id}`,
            title: `${s.name} (${s.examType})`,
            category: "Müfredat & Konular",
            icon: BookOpen,
            action: () => {
              router.push(`/subjects/${s.id}`);
              onOpenChange(false);
            },
          });
        }
      });

      const topics = getTopics();
      topics.forEach((t) => {
        if (t.name.toLowerCase().includes(query.toLowerCase())) {
          list.push({
            id: `top-${t.id}`,
            title: `${t.name} (Konu)`,
            category: "Müfredat & Konular",
            icon: CheckCircle2,
            action: () => {
              router.push(`/subjects/${t.subjectId}/topics/${t.id}`);
              onOpenChange(false);
            },
          });
        }
      });
    }

    return list;
  }, [query, resolvedTheme, onOpenChange, onOpenQuickAdd, router, toggleTheme]);

  const filteredItems = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    );
  }, [items, query]);

  // Arrow key navigation
  useEffect(() => {
    const handleNav = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev === 0 ? Math.max(0, filteredItems.length - 1) : prev - 1
        );
      } else if (e.key === "Enter" && filteredItems[selectedIndex]) {
        e.preventDefault();
        filteredItems[selectedIndex].action();
      }
    };

    window.addEventListener("keydown", handleNav);
    return () => window.removeEventListener("keydown", handleNav);
  }, [open, filteredItems, selectedIndex]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 sm:pt-24 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl rounded-2xl border border-[var(--outline)] bg-[var(--surface)] shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 border-b border-[var(--outline)] px-4 py-3.5 bg-[var(--surface)]">
          <Search size={18} className="text-[var(--muted)] shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Sayfa, ders, konu veya komut ara... (örn: Simülatör, Türev)"
            className="w-full bg-transparent text-sm font-medium text-[var(--ink)] placeholder-[var(--muted)] outline-none"
          />
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-lg p-1 text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-muted)]"
          >
            <X size={16} />
          </button>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-2 divide-y divide-[var(--outline)]/40 divide-dashed">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-xs text-[var(--muted)]">
              "{query}" ile eşleşen bir sayfa veya konu bulunamadı.
            </div>
          ) : (
            <div className="space-y-1">
              {filteredItems.map((item, idx) => {
                const Icon = item.icon;
                const isSelected = selectedIndex === idx;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={item.action}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full flex items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 text-left text-xs transition-colors ${
                      isSelected
                        ? "bg-[var(--primary)] text-white font-semibold shadow-xs"
                        : "text-[var(--ink)] hover:bg-[var(--surface-muted)]"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${
                          isSelected
                            ? "border-white/30 bg-white/20 text-white"
                            : "border-[var(--outline)] bg-[var(--surface-muted)] text-[var(--muted)]"
                        }`}
                      >
                        <Icon size={14} />
                      </div>
                      <span className="truncate">{item.title}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {item.badge && (
                        <span
                          className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                            isSelected
                              ? "bg-white/25 text-white"
                              : "bg-[var(--surface-muted)] text-[var(--muted)] border border-[var(--outline)]"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                      <span
                        className={`text-[10px] ${
                          isSelected ? "text-white/80" : "text-[var(--muted)]"
                        }`}
                      >
                        {item.category}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Shortcut Hints */}
        <div className="flex items-center justify-between border-t border-[var(--outline)] bg-[var(--surface-muted)] px-4 py-2 text-[11px] text-[var(--muted)]">
          <div className="flex items-center gap-2">
            <span>Seçmek için: <strong className="font-mono text-[var(--ink)]">↵ Enter</strong></span>
            <span>Gezinmek için: <strong className="font-mono text-[var(--ink)]">↑ ↓</strong></span>
          </div>
          <span>Kapatmak için: <strong className="font-mono text-[var(--ink)]">Esc</strong></span>
        </div>
      </div>
    </div>
  );
}
