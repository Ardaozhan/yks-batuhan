"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Award,
  BarChart3,
  Bell,
  BookOpen,
  Calculator,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CirclePlus,
  ListTodo,
  Menu,
  MessageSquare,
  Plus,
  Search,
  Settings,
  Shield,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import { appConfig } from "@/lib/config";
import { defaultProfile } from "@/lib/mock-data";
import { getProfile } from "@/lib/study-store";
import type { UserProfile } from "@/types/study";
import { QuickAddDialog } from "@/components/forms/quick-add-dialog";
import { CommandMenu } from "@/components/ui/command-menu";
import { FeedbackDialog } from "@/components/ui/feedback-dialog";

const primaryNav = [
  { href: "/today", label: "Bugün", icon: CalendarDays },
  { href: "/subjects", label: "Dersler", icon: BookOpen },
  { href: "/exams", label: "Denemeler", icon: Award },
  { href: "/simulator", label: "Simülatör", icon: Calculator },
  { href: "/planner", label: "Planlayıcı", icon: ListTodo },
  { href: "/analytics", label: "Analiz", icon: BarChart3 },
  { href: "/coach", label: "AI Koçum", icon: Sparkles },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [quickOpen, setQuickOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);

  useEffect(() => {
    const handleStoreChange = () => {
      setProfile(getProfile());
    };
    const timer = setTimeout(handleStoreChange, 0);
    window.addEventListener("study_store_change", handleStoreChange);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("study_store_change", handleStoreChange);
    };
  }, []);

  const isActive = (href: string) => {
    if (href === "/today") return pathname === "/today" || pathname === "/";
    if (href === "/subjects") return pathname.startsWith("/subjects");
    if (href === "/exams") return pathname.startsWith("/exams");
    return pathname === href;
  };

  return (
    <div className="min-h-screen bg-[var(--background)] pb-24 md:pb-0">
      {/* Desktop Sidebar (280px) with custom vertical scrollbar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[280px] flex-col border-r border-[var(--outline)] bg-[var(--background)]/95 px-4 py-5 backdrop-blur-sm md:flex overflow-y-auto custom-scrollbar">
        {/* Brand */}
        <Link
          href="/today"
          className="app-focus mb-4 flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-[var(--surface-muted)]"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--outline)] bg-white shadow-xs">
            <Sparkles size={20} className="text-[var(--primary)]" />
          </div>
          <div>
            <span className="font-display text-lg font-bold tracking-tight text-[var(--primary)]">
              {appConfig.name}
            </span>
            <p suppressHydrationWarning className="text-[11px] text-[var(--muted)] truncate max-w-[170px]">
              {profile.targetDepartment || "Hedef Belirle"}
            </p>
          </div>
        </Link>

        {/* Student Mini Card */}
        <Link
          href="/profile"
          className="app-focus mb-4 flex items-center gap-3 rounded-xl border border-[var(--outline)] bg-white p-3 shadow-2xs hover:border-[var(--primary)] transition-all"
        >
          <div suppressHydrationWarning className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--outline)] bg-[var(--primary-soft)] font-display text-sm font-semibold text-[var(--primary)]">
            {profile.name.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <p suppressHydrationWarning className="font-display text-sm font-semibold truncate text-[var(--ink)]">
              {profile.name}
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-[var(--muted)]">
              <span suppressHydrationWarning>Gün {profile.dayCount}/365</span>
              <span className="h-1 w-1 rounded-full bg-[var(--outline)]"></span>
              <span suppressHydrationWarning className="text-[var(--primary)] font-medium truncate max-w-[90px]">
                {profile.targetDepartment || "Hedef Belirle"}
              </span>
            </div>
          </div>
        </Link>

        {/* Quick Search / Command Palette Trigger */}
        <button
          type="button"
          onClick={() => setCommandOpen(true)}
          className="mb-4 flex w-full items-center justify-between rounded-xl border border-[var(--outline)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--muted)] hover:border-[var(--primary)] hover:text-[var(--ink)] transition-all shadow-2xs group"
        >
          <span className="flex items-center gap-2">
            <Search size={15} className="group-hover:text-[var(--primary)]" />
            <span>Hızlı Arama...</span>
          </span>
          <kbd className="rounded bg-[var(--surface-muted)] px-1.5 py-0.5 font-mono text-[10px] font-bold text-[var(--muted)] border border-[var(--outline)]">
            ⌘K
          </kbd>
        </button>

        {/* Main Navigation */}
        <div className="mb-1.5 px-3 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[#777a73]">
          <span>Menü</span>
        </div>
        <nav className="space-y-1">
          {primaryNav.slice(0, 3).map(({ href, label, icon: Icon }) => (
            <NavLink key={href} href={href} label={label} Icon={Icon} active={isActive(href)} />
          ))}

          {/* Quick Add Button */}
          <button
            onClick={() => setQuickOpen(true)}
            className="app-focus flex min-h-10 w-full items-center gap-3.5 rounded-r-full px-4 text-left text-sm font-medium text-[var(--primary)] hover:bg-[var(--surface-ai)] transition-colors group"
          >
            <CirclePlus size={19} className="transition-transform group-hover:scale-110" />
            <span>Hızlı Ekle</span>
          </button>

          {primaryNav.slice(3).map(({ href, label, icon: Icon }) => (
            <NavLink key={href} href={href} label={label} Icon={Icon} active={isActive(href)} />
          ))}
        </nav>

        {/* Bottom Section: Account */}
        <div className="mt-4 space-y-1 pt-3 border-t border-[var(--outline)]">
          <div className="mb-1.5 px-3 text-[11px] font-bold uppercase tracking-wider text-[#777a73]">
            Hesap
          </div>
          <NavLink href="/profile" label="Profil" Icon={UserRound} active={isActive("/profile")} />
          <NavLink href="/settings" label="Ayarlar" Icon={Settings} active={isActive("/settings")} />
          <button
            onClick={() => setFeedbackOpen(true)}
            className="app-focus flex min-h-10 w-full items-center gap-3.5 rounded-r-full px-4 text-left text-sm font-medium text-[var(--muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--ink)] transition-colors"
          >
            <MessageSquare size={17} />
            <span>Geri Bildirim</span>
          </button>
        </div>
      </aside>

      {/* Mobile Sticky Header */}
      <header className="sticky top-0 z-20 flex h-[60px] items-center justify-between border-b border-[var(--outline)] bg-[var(--background)]/90 px-4 backdrop-blur-md md:hidden">
        <Link href="/today" className="app-focus flex items-center gap-2.5">
          <div suppressHydrationWarning className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--outline)] bg-[var(--primary-soft)] font-display text-xs font-semibold text-[var(--primary)]">
            {profile.name.charAt(0)}
          </div>
          <span className="font-display text-lg font-bold text-[var(--primary)]">
            {appConfig.name}
          </span>
        </Link>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setCommandOpen(true)}
            aria-label="Komut Menüsü (Ara)"
            className="app-focus flex h-11 w-11 items-center justify-center rounded-full text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-muted)] transition-colors"
          >
            <Search size={20} />
          </button>

          <button
            onClick={() => setNotifOpen(!notifOpen)}
            aria-label="Bildirimler"
            className="app-focus relative flex h-11 w-11 items-center justify-center rounded-full text-[var(--primary)] hover:bg-[var(--surface-muted)] transition-colors"
          >
            <Bell size={20} />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-[var(--surface)]"></span>
          </button>

          <button
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Tüm Menüyü Aç"
            className="app-focus flex h-11 w-11 items-center justify-center rounded-full border border-[var(--outline)] bg-[var(--surface)] text-[var(--ink)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors shadow-2xs"
          >
            <Menu size={20} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="md:ml-[280px] pb-32 md:pb-12 min-h-screen">{children}</main>

      {/* Mobile Slide-Over Menu Drawer */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs md:hidden animate-in fade-in"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="flex h-full w-[85%] max-w-[340px] flex-col justify-between bg-[var(--surface)] p-5 shadow-2xl animate-in slide-in-from-right duration-250 overflow-y-auto custom-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              {/* Drawer Top */}
              <div className="flex items-center justify-between pb-4 border-b border-[var(--outline)]">
                <div className="flex items-center gap-2.5">
                  <div suppressHydrationWarning className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--outline)] bg-[var(--primary-soft)] font-display text-sm font-bold text-[var(--primary)]">
                    {profile.name.charAt(0)}
                  </div>
                  <div>
                    <p suppressHydrationWarning className="font-display text-sm font-bold text-[var(--ink)]">
                      {profile.name}
                    </p>
                    <p suppressHydrationWarning className="text-xs text-[var(--muted)] truncate max-w-[170px]">
                      {profile.targetDepartment || "Hedef Belirle"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-full p-2 text-[var(--muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--ink)]"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Drawer Links */}
              <nav className="mt-4 space-y-1">
                {[
                  { href: "/today", label: "Bugün (Çalışma Alanı)", icon: CalendarDays },
                  { href: "/simulator", label: "Sıralama Simülatörü", icon: Calculator, badge: "2025" },
                  { href: "/planner", label: "AI Planlayıcı", icon: ListTodo, badge: "AI" },
                  { href: "/analytics", label: "Analiz & Raporlar", icon: BarChart3, badge: "AI" },
                  { href: "/subjects", label: "Dersler & Müfredat", icon: BookOpen },
                  { href: "/exams", label: "Deneme Sınavları", icon: Award },
                  { href: "/coach", label: "AI Koçum", icon: Sparkles, badge: "AI" },
                ].map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex min-h-[44px] items-center justify-between rounded-xl px-3.5 text-xs font-semibold transition-all ${
                        active
                          ? "bg-[var(--surface-ai)] text-[var(--primary)] font-bold border border-[#d7e8cb]"
                          : "text-[var(--ink)] hover:bg-[#fbf9f5]"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <Icon size={18} className={active ? "text-[var(--primary)]" : "text-[var(--muted)]"} />
                        <span>{item.label}</span>
                      </span>
                      {item.badge ? (
                        <span className="rounded bg-[var(--primary)] text-white text-[10px] px-1.5 py-0.2 font-bold">
                          {item.badge}
                        </span>
                      ) : (
                        <ChevronRight size={14} className="text-[var(--muted)]" />
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Drawer Bottom (Settings, Profile, Admin) */}
            <div className="space-y-1 border-t border-[var(--outline)] pt-4">
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex min-h-[44px] items-center gap-3 rounded-xl px-3.5 text-xs font-semibold text-[var(--muted)] hover:bg-[#fbf9f5] hover:text-[var(--ink)]"
              >
                <UserRound size={18} />
                <span>Profilim</span>
              </Link>
              <Link
                href="/settings"
                onClick={() => setMobileMenuOpen(false)}
                className="flex min-h-[44px] items-center gap-3 rounded-xl px-3.5 text-xs font-semibold text-[var(--muted)] hover:bg-[#fbf9f5] hover:text-[var(--ink)]"
              >
                <Settings size={18} />
                <span>Ayarlar</span>
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setFeedbackOpen(true);
                }}
                className="flex min-h-[44px] w-full items-center gap-3 rounded-xl px-3.5 text-xs font-semibold text-[var(--muted)] hover:bg-[#fbf9f5] hover:text-[var(--ink)]"
              >
                <MessageSquare size={18} />
                <span>Geri Bildirim & Destek</span>
              </button>
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex min-h-[44px] items-center justify-between rounded-xl border border-amber-200 bg-amber-50/60 px-3.5 text-xs font-semibold text-amber-900 mt-2"
              >
                <span className="flex items-center gap-2">
                  <Shield size={16} className="text-amber-700" />
                  <span>Yönetici Paneli</span>
                </span>
                <ChevronRight size={14} className="text-amber-700" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar — with iPhone safe area support */}
      <nav
        aria-label="Mobil navigasyon"
        style={{
          paddingBottom: "max(8px, env(safe-area-inset-bottom))",
          height: "calc(68px + env(safe-area-inset-bottom, 0px))",
        }}
        className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around border-t border-[var(--outline)] bg-[var(--background)]/95 px-2 backdrop-blur-md md:hidden shadow-lg"
      >
        {primaryNav.slice(0, 2).map(({ href, label, icon: Icon }) => {
          const isAct = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center gap-1 rounded-xl px-3 py-1.5 transition-colors touch-manipulation min-w-[56px] min-h-[48px] ${
                isAct ? "text-[var(--primary)] font-bold" : "text-[var(--muted)]"
              }`}
            >
              <Icon size={20} strokeWidth={isAct ? 2.5 : 2} />
              <span className="text-[10px] tracking-tight">{label}</span>
            </Link>
          );
        })}

        {/* Center Quick Add Action */}
        <button
          onClick={() => setQuickOpen(true)}
          aria-label="Hızlı ekle"
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--primary)] text-white shadow-md active:scale-95 transition-transform touch-manipulation -mt-4 border-2 border-white"
        >
          <Plus size={24} />
        </button>

        {primaryNav.slice(2, 4).map(({ href, label, icon: Icon }) => {
          const isAct = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center gap-1 rounded-xl px-3 py-1.5 transition-colors touch-manipulation min-w-[56px] min-h-[48px] ${
                isAct ? "text-[var(--primary)] font-bold" : "text-[var(--muted)]"
              }`}
            >
              <Icon size={20} strokeWidth={isAct ? 2.5 : 2} />
              <span className="text-[10px] tracking-tight">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Notification Popover Panel */}
      {notifOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center md:justify-end bg-black/20 p-4 backdrop-blur-xs animate-in fade-in"
          onClick={() => setNotifOpen(false)}
        >
          <div
            className="mt-14 w-full max-w-sm rounded-2xl border border-[var(--outline)] bg-white p-4 shadow-xl animate-in zoom-in-95 max-h-[70vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[var(--outline)] pb-3">
              <span className="font-display text-sm font-bold text-[var(--ink)]">Bildirimler</span>
              <button
                onClick={() => setNotifOpen(false)}
                aria-label="Bildirimleri kapat"
                className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--ink)] transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <div className="mt-3 space-y-3">
              <div className="p-3 rounded-xl bg-[var(--surface-ai)] border border-[#d7e8cb] text-xs space-y-1">
                <p className="font-semibold text-[var(--primary)] flex items-center gap-1.5">
                  <Sparkles size={13} />
                  AI Koç Hatırlatıcısı
                </p>
                <p className="text-[#4E5D47]">
                  Bugünkü hedeflerini tamamladıktan sonra çözdüğün soruları sisteme kaydetmeyi unutma!
                </p>
              </div>
              <div className="p-3 rounded-xl bg-[var(--surface-muted)] text-xs space-y-1">
                <p className="font-semibold text-[var(--ink)] flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-[var(--primary)]" />
                  {profile.streakDays > 0 ? "Seri Devam Ediyor" : "Yeni Bir Gün"}
                </p>
                <p className="text-[var(--muted)]">
                  {profile.streakDays > 0
                    ? `Tebrikler! ${profile.streakDays} günlük kesintisiz çalışma serisini koruyorsun.`
                    : "Bugünkü görevlerini tamamlayarak çalışma serini başlatabilirsin."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Add Dialog */}
      {quickOpen && <QuickAddDialog onClose={() => setQuickOpen(false)} />}

      {/* Global Command Palette (Ctrl+K) */}
      <CommandMenu
        open={commandOpen}
        onOpenChange={setCommandOpen}
        onOpenQuickAdd={() => setQuickOpen(true)}
      />

      {/* User Feedback & Support Dialog */}
      <FeedbackDialog open={feedbackOpen} onOpenChange={setFeedbackOpen} />
    </div>
  );
}

function NavLink({
  href,
  label,
  Icon,
  active,
}: {
  href: string;
  label: string;
  Icon: React.ElementType;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`app-focus flex min-h-11 items-center gap-3.5 rounded-r-full border-l-4 px-4 text-sm font-medium transition-all ${
        active
          ? "border-[var(--primary)] bg-[#d7e8cb]/40 font-semibold text-[var(--primary)]"
          : "border-transparent text-[var(--muted)] hover:bg-[#e9e8e4] hover:text-[var(--ink)]"
      }`}
    >
      <Icon size={19} />
      <span>{label}</span>
    </Link>
  );
}
