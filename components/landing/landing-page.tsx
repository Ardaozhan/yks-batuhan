"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  BarChart3,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Flame,
  ListTodo,
  Menu,
  Sparkles,
  Target,
  TrendingUp,
  X,
  Zap,
} from "lucide-react";
import { appConfig } from "@/lib/config";

function ScrollReveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        transitionDuration: "700ms",
        transitionDelay: `${delay}ms`,
        transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
      }}
      className={`transition-all ${
        isVisible
          ? "opacity-100 translate-y-0 scale-100 filter-none"
          : "opacity-0 translate-y-8 scale-[0.98] blur-[2px]"
      } ${className}`}
    >
      {children}
    </div>
  );
}

const rotatingWords = [
  "Yapay Zeka",
  "Akıllı Planlama",
  "Net Analizi",
  "Kişisel Koçluk",
];

const faqs = [
  {
    question: "YKS Odak tamamen ücretsiz mi?",
    answer:
      "Evet! YKS Odak'ın temel çalışma takip sistemi, ÖSYM müfredat takipçisi, AI koçluk ve günlük çalışma planlayıcısı tüm YKS adayları için tamamen ücretsiz olarak sunulmaktadır.",
  },
  {
    question: "2025/2026 YKS müfredatı ile uyumlu mu?",
    answer:
      "Evet. Tüm TYT ve AYT dersleri (Sayısal, Eşit Ağırlık, Sözel ve Yabancı Dil) MEB ve ÖSYM'nin güncel müfredatına ve geçmiş yıllardaki soru ağırlıklarına göre birebir hazırlanmıştır.",
  },
  {
    question: "AI Koç ve Günlük Planlayıcı nasıl çalışır?",
    answer:
      "Yapay zeka eksik kaldığınız dersleri, çözdüğünüz denemelerdeki yanlışlarınızı ve sınava kalan gün sayısını analiz ederek her sabah size özel odaklanmanız gereken konuları ve soru hedeflerini belirler.",
  },
  {
    question: "Verilerim güvende mi?",
    answer:
      "Kesinlikle. Çalışma verileriniz ve deneme notlarınız Supabase altyapısında güvenli bir şekilde saklanır. İster tarayıcıda yerel çalışabilir, isterseniz hesabınızla tüm cihazlardan senkronize kullanabilirsiniz.",
  },
  {
    question: "Mobil cihazlarda ve telefonda nasıl kullanılır?",
    answer:
      "YKS Odak, Progressive Web App (PWA) desteklidir. Safari veya Chrome üzerinden 'Ana Ekrana Ekle' diyerek telefonunuza mobil uygulama olarak yükleyebilir ve doğrudan kullanabilirsiniz.",
  },
];

const stats = [
  { value: "140+", label: "MEB / ÖSYM Konusu", icon: BookOpen },
  { value: "12", label: "TYT & AYT Dersi", icon: Target },
  { value: "7/24", label: "Yapay Zeka Koçu", icon: Sparkles },
  { value: "%100", label: "Ücretsiz & Reklamsız", icon: Zap },
];

export function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);
  const [fadeAnim, setFadeAnim] = useState(true);

  // Rotating word interval
  useEffect(() => {
    const interval = setInterval(() => {
      setFadeAnim(false);
      setTimeout(() => {
        setWordIndex((prev) => (prev + 1) % rotatingWords.length);
        setFadeAnim(true);
      }, 250);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--ink)] selection:bg-[var(--primary)] selection:text-white">
      {/* 1. Header / Navigation */}
      <header className="sticky top-0 z-40 border-b border-[var(--outline)] bg-[#fbf9f5]/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5 touch-manipulation">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-[var(--outline)] bg-white shadow-xs">
              <Sparkles size={18} className="text-[var(--primary)]" />
            </div>
            <span className="font-display text-lg sm:text-xl font-bold tracking-tight text-[var(--primary)]">
              {appConfig.name}
            </span>
          </Link>

          {/* Nav links (Desktop) */}
          <nav className="hidden items-center gap-8 md:flex text-sm font-medium text-[var(--muted)]">
            <a href="#features" className="hover:text-[var(--ink)] transition-colors">
              Özellikler
            </a>
            <a href="#how-it-works" className="hover:text-[var(--ink)] transition-colors">
              Nasıl Çalışır?
            </a>
            <a href="#faq" className="hover:text-[var(--ink)] transition-colors">
              SSS
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="text-xs sm:text-sm font-semibold text-[var(--ink)] hover:text-[var(--primary)] px-2.5 sm:px-3 py-2 transition-colors touch-manipulation"
            >
              Giriş Yap
            </Link>
            <Link
              href="/today"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--primary)] px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-[var(--primary-strong)] active:scale-95 transition-all touch-manipulation"
            >
              <span>Çalışma Alanı</span>
              <ChevronRight size={15} />
            </Link>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menüyü aç/kapat"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--outline)] bg-white text-[var(--ink)] md:hidden touch-manipulation active:scale-95 ml-1"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="border-b border-[var(--outline)] bg-white px-4 py-4 md:hidden animate-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col space-y-3 text-sm font-semibold text-[var(--ink)]">
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-[var(--surface-muted)] transition-colors"
              >
                Özellikler
              </a>
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-[var(--surface-muted)] transition-colors"
              >
                Nasıl Çalışır?
              </a>
              <a
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-[var(--surface-muted)] transition-colors"
              >
                Sıkça Sorulan Sorular
              </a>
              <div className="pt-2 border-t border-[var(--outline)] flex gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2.5 rounded-xl border border-[var(--outline)] bg-[var(--surface-muted)] text-xs font-semibold"
                >
                  Giriş Yap
                </Link>
                <Link
                  href="/today"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2.5 rounded-xl bg-[var(--primary)] text-white text-xs font-semibold"
                >
                  Başla
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden pt-10 pb-16 sm:pt-16 sm:pb-24 md:pt-20 md:pb-28">
        {/* Soft Animated Ambient Aura */}
        <div className="absolute inset-0 pointer-events-none -z-10 flex items-center justify-center">
          <div className="h-[350px] w-[500px] sm:h-[480px] sm:w-[700px] rounded-full bg-[var(--surface-ai)]/75 blur-3xl animate-pulse-glow" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#d7e8cb] bg-[var(--surface-ai)] px-3.5 py-1 text-[11px] sm:text-xs font-semibold text-[var(--primary)] shadow-2xs mb-5 sm:mb-6 animate-float">
              <Sparkles size={13} className="text-[var(--primary)]" />
              <span>2025 & 2026 ÖSYM Müfredatı ile %100 Uyumlu</span>
            </div>

            {/* Main Headline with Rotating Word Animation */}
            <h1 className="font-display text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[var(--ink)] leading-[1.18] sm:leading-[1.15]">
              YKS Hazırlığında{" "}
              <span className="inline-block min-w-[190px] sm:min-w-[310px] text-center sm:text-left">
                <span
                  className={`inline-block text-[var(--primary)] underline decoration-[var(--primary)]/30 underline-offset-4 transition-all duration-300 transform ${
                    fadeAnim
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 -translate-y-2"
                  }`}
                >
                  {rotatingWords[wordIndex]}
                </span>
              </span>
              <br className="hidden sm:inline" />
              ile Zamanı ve Netlerini Yönet
            </h1>

            {/* Subtitle */}
            <p className="mt-4 sm:mt-6 text-sm sm:text-lg md:text-xl text-[var(--muted)] leading-relaxed max-w-2xl mx-auto px-2">
              Kişiselleştirilmiş günlük çalışma planı, ÖSYM konu takibi, net gelişim analizleri ve
              7/24 yapay zeka koçluğu tek bir sade platformda.
            </p>

            {/* CTA Buttons */}
            <div className="mt-7 sm:mt-9 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto sm:max-w-none">
              <Link
                href="/today"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-8 py-3.5 text-sm font-bold text-white shadow-md hover:bg-[var(--primary-strong)] active:scale-95 hover:shadow-lg hover:-translate-y-0.5 transition-all touch-manipulation relative overflow-hidden group"
              >
                <span className="relative z-10">Hemen Ücretsiz Başla</span>
                <ChevronRight size={18} className="relative z-10 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--outline)] bg-white px-7 py-3.5 text-sm font-semibold text-[var(--ink)] shadow-xs hover:bg-[var(--surface-muted)] hover:border-[var(--primary)] active:scale-95 transition-all touch-manipulation"
              >
                <span>Mevcut Hesaba Giriş</span>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="mt-7 sm:mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-[var(--muted)]">
              <div className="flex items-center gap-1.5 hover:text-[var(--ink)] transition-colors">
                <CheckCircle2 size={15} className="text-[var(--primary)]" />
                <span>Kredi Kartı Gerekmez</span>
              </div>
              <div className="flex items-center gap-1.5 hover:text-[var(--ink)] transition-colors">
                <CheckCircle2 size={15} className="text-[var(--primary)]" />
                <span>PWA Mobil Uygulama</span>
              </div>
              <div className="flex items-center gap-1.5 hover:text-[var(--ink)] transition-colors">
                <CheckCircle2 size={15} className="text-[var(--primary)]" />
                <span>ÖSYM Müfredat Güvencesi</span>
              </div>
            </div>
          </div>

          {/* Clean & Minimalist Bento UI Showcase */}
          <div className="mt-10 sm:mt-14 max-w-4xl mx-auto rounded-2xl border border-[var(--outline)] bg-white p-4 sm:p-6 shadow-lg relative transition-all hover:shadow-xl">
            {/* Window Top Header */}
            <div className="flex items-center justify-between border-b border-[var(--outline)] pb-3.5 mb-5">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                </div>
                <span className="text-xs font-semibold text-[var(--muted)] ml-1.5">
                  {appConfig.name} — Günlük Çalışma Alanı
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[var(--muted)] font-medium">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>Canlı Çalışma Durumu</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {/* Card 1: Today Plan */}
              <div className="paper-card p-4 sm:p-5 flex flex-col justify-between bg-[#fbf9f5] hover-lift">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-[var(--ink)]">
                      Bugünkü Plan
                    </span>
                    <span className="rounded bg-[var(--primary)] text-white text-[10px] px-2 py-0.5 font-bold">
                      %67 Tamamlandı
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2 rounded-lg p-2 bg-white/80 border border-[var(--outline)] text-[var(--muted)]">
                      <CheckCircle2 size={15} className="text-[var(--primary)] shrink-0" />
                      <span className="line-through">Türkçe: 30 Paragraf Sorusu</span>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg p-2 bg-white/80 border border-[var(--outline)] text-[var(--muted)]">
                      <CheckCircle2 size={15} className="text-[var(--primary)] shrink-0" />
                      <span className="line-through">Matematik: Fonksiyonlar</span>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg p-2 bg-white border-l-4 border-l-[var(--primary)] border-[var(--outline)] font-semibold shadow-2xs text-[var(--ink)]">
                      <div className="h-3.5 w-3.5 rounded-full border-2 border-[var(--primary)] shrink-0" />
                      <span>Fizik: Vektörler & Bağıl</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-2.5 border-t border-[var(--outline)] flex items-center justify-between text-[11px] text-[var(--muted)]">
                  <span>Kalan Hedef</span>
                  <span className="font-semibold text-[var(--ink)]">1 Görev (45 Dk)</span>
                </div>
              </div>

              {/* Card 2: AI Coach */}
              <div className="rounded-xl border border-[#d7e8cb] bg-[#E9EEE6] p-4 sm:p-5 flex flex-col justify-between hover-lift">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#4E5D47] mb-2.5">
                    <Sparkles size={16} className="text-[var(--primary)] shrink-0" />
                    <span>AI Koç Tavsiyesi</span>
                  </div>
                  <p className="text-xs text-[#4E5D47] leading-relaxed">
                    &quot;Son 3 denemede AYT Matematik netlerin %18 arttı. Bu hafta planlanan konuları
                    tamamlarsan hedefindeki net dilimine rahatça ulaşacaksın.&quot;
                  </p>
                </div>

                <div className="mt-4 pt-2.5 border-t border-[#d7e8cb] flex items-center justify-between text-[11px] text-[#4E5D47] font-semibold">
                  <span className="truncate">Hedef: ODTÜ Bilgisayar</span>
                  <span className="shrink-0 flex items-center gap-1">
                    <Flame size={13} className="text-[#ba1a1a]" /> 15 Gün Seri
                  </span>
                </div>
              </div>

              {/* Card 3: Exam Analytics */}
              <div className="paper-card p-4 sm:p-5 flex flex-col justify-between bg-white hover-lift">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[var(--ink)]">Son TYT Denemesi</span>
                    <TrendingUp size={16} className="text-[var(--primary)]" />
                  </div>
                  <div className="font-display text-2xl sm:text-3xl font-extrabold text-[var(--primary)]">
                    98.75 Net
                  </div>
                  <p className="text-[11px] text-emerald-700 font-semibold mt-1">
                    ↑ Önceki denemeye göre +4.25 Net
                  </p>
                </div>

                <div className="mt-4 pt-2.5 border-t border-[var(--outline)] flex justify-between text-[11px] text-[var(--muted)]">
                  <span>Tr: 34.5</span>
                  <span>Mat: 31.25</span>
                  <span>Fen: 18.0</span>
                  <span>Sos: 15.0</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Live Statistics Grid Section */}
      <section id="stats" className="py-10 sm:py-14 border-y border-[var(--outline)] bg-white overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <ScrollReveal key={stat.label} delay={index * 100}>
                  <div className="paper-card p-4 sm:p-6 text-center hover-lift flex flex-col items-center justify-center bg-[#fbf9f5] h-full">
                    <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--surface-ai)] text-[var(--primary)]">
                      <Icon size={18} />
                    </div>
                    <div className="font-display text-2xl sm:text-3xl font-extrabold text-[var(--ink)]">
                      {stat.value}
                    </div>
                    <div className="text-xs sm:text-sm text-[var(--muted)] font-medium mt-0.5">
                      {stat.label}
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Core Features Section */}
      <section id="features" className="py-14 sm:py-20 md:py-24 bg-[var(--background)] overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--primary)] bg-[var(--surface-ai)] px-3 py-1 rounded-full border border-[#d7e8cb]">
                Tüm İhtiyaçların Tek Yerde
              </span>
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[var(--ink)] mt-3">
                YKS Maratonunu Şansa Bırakmayın
              </h2>
              <p className="mt-3 text-xs sm:text-sm md:text-base text-[var(--muted)]">
                Rastgele ders çalışmayı bırakın. Veriye dayalı planlama ve yapay zeka rehberliği ile
                zamanınızı en yüksek net artışını getirecek konulara harcayın.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {/* Feature 1: AI Coach */}
            <ScrollReveal delay={100}>
              <div className="paper-card p-5 sm:p-6 flex flex-col justify-between hover-lift bg-white h-full">
                <div>
                  <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-[var(--surface-ai)] text-[var(--primary)] mb-4">
                    <Sparkles size={22} />
                  </div>
                  <h3 className="font-display text-base sm:text-lg font-bold text-[var(--ink)]">AI Koçum</h3>
                  <p className="mt-2 text-xs text-[var(--muted)] leading-relaxed">
                    Çalışma durumunuza ve deneme analizlerinize göre size özel strateji üreten 7/24
                    yapay zeka rehberi.
                  </p>
                </div>
                <Link
                  href="/coach"
                  className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[var(--primary)] hover:underline group"
                >
                  <span>Koçla Konuş</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </div>
            </ScrollReveal>

            {/* Feature 2: Smart Daily Planner */}
            <ScrollReveal delay={200}>
              <div className="paper-card p-5 sm:p-6 flex flex-col justify-between hover-lift bg-white h-full">
                <div>
                  <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-[#fff5f4] text-[#ba1a1a] mb-4">
                    <ListTodo size={22} />
                  </div>
                  <h3 className="font-display text-base sm:text-lg font-bold text-[var(--ink)]">Akıllı Planlayıcı</h3>
                  <p className="mt-2 text-xs text-[var(--muted)] leading-relaxed">
                    Eksik konularınıza ve haftalık hedeflerinize göre her güne özel soru ve konu çalışma
                    çizelgesi.
                  </p>
                </div>
                <Link
                  href="/planner"
                  className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[var(--primary)] hover:underline group"
                >
                  <span>Planı İncele</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </div>
            </ScrollReveal>

            {/* Feature 3: ÖSYM Topic Tracking */}
            <ScrollReveal delay={300}>
              <div className="paper-card p-5 sm:p-6 flex flex-col justify-between hover-lift bg-white h-full">
                <div>
                  <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-[#E9EEE6] text-[#4E5D47] mb-4">
                    <BookOpen size={22} />
                  </div>
                  <h3 className="font-display text-base sm:text-lg font-bold text-[var(--ink)]">ÖSYM Konu Takibi</h3>
                  <p className="mt-2 text-xs text-[var(--muted)] leading-relaxed">
                    Sayısal, EA, Sözel ve Dil derslerinin tüm konuları, soru ağırlıkları ve tamamlanma
                    yüzdeleri.
                  </p>
                </div>
                <Link
                  href="/subjects"
                  className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[var(--primary)] hover:underline group"
                >
                  <span>Müfredatı Gör</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </div>
            </ScrollReveal>

            {/* Feature 4: Exam Analytics */}
            <ScrollReveal delay={400}>
              <div className="paper-card p-5 sm:p-6 flex flex-col justify-between hover-lift bg-white h-full">
                <div>
                  <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-[#f4f7fa] text-[#1c3d5a] mb-4">
                    <BarChart3 size={22} />
                  </div>
                  <h3 className="font-display text-base sm:text-lg font-bold text-[var(--ink)]">Deneme Analitiği</h3>
                  <p className="mt-2 text-xs text-[var(--muted)] leading-relaxed">
                    Çözdüğünüz tüm genel ve branş denemelerinin ders bazında net artış ve gelişim
                    grafikleri.
                  </p>
                </div>
                <Link
                  href="/analytics"
                  className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[var(--primary)] hover:underline group"
                >
                  <span>Raporları Gör</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* 5. How It Works Section */}
      <section id="how-it-works" className="py-14 sm:py-20 md:py-24 border-t border-[var(--outline)] bg-white overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[var(--ink)]">
                3 Adımda Hedeflediğin Üniversiteye Ulaş
              </h2>
              <p className="mt-3 text-xs sm:text-sm md:text-base text-[var(--muted)]">
                YKS sürecinde karmaşık defterlere veya excel tablolarına ihtiyacınız yok.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-3">
            <ScrollReveal delay={100}>
              <div className="paper-card p-5 sm:p-6 text-center hover-lift bg-[#fbf9f5] h-full">
                <div className="mx-auto mb-4 flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-[var(--primary)] text-white font-display font-bold text-base sm:text-lg shadow-sm">
                  1
                </div>
                <h3 className="font-display text-base sm:text-lg font-bold text-[var(--ink)]">Hedefini Belirle</h3>
                <p className="mt-2 text-xs text-[var(--muted)] leading-relaxed">
                  İstediğin bölümü, üniversiteyi ve alanını (SAY/EA/SÖZ/DİL) seçerek profilini oluştur.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={250}>
              <div className="paper-card p-5 sm:p-6 text-center hover-lift bg-[#fbf9f5] h-full">
                <div className="mx-auto mb-4 flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-[var(--primary)] text-white font-display font-bold text-base sm:text-lg shadow-sm">
                  2
                </div>
                <h3 className="font-display text-lg font-bold text-[var(--ink)]">AI Planını Takip Et</h3>
                <p className="mt-2 text-xs text-[var(--muted)] leading-relaxed">
                  Yapay zeka eksik konularına ve kalan gün sayısına göre her sabah sana özel bir plan
                  çıkarsın.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={400}>
              <div className="paper-card p-5 sm:p-6 text-center hover-lift bg-[#fbf9f5] h-full">
                <div className="mx-auto mb-4 flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-[var(--primary)] text-white font-display font-bold text-base sm:text-lg shadow-sm">
                  3
                </div>
                <h3 className="font-display text-lg font-bold text-[var(--ink)]">Netlerini Katla</h3>
                <p className="mt-2 text-xs text-[var(--muted)] leading-relaxed">
                  Denemelerini kaydet, zayıf olduğun konuları tespit et ve sınav gününe en yüksek
                  özgüvenle gir.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* 6. FAQ Section with Animated Accordions */}
      <section id="faq" className="py-14 sm:py-20 md:py-24 border-t border-[var(--outline)] bg-[var(--background)] overflow-hidden">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--primary)] bg-[var(--surface-ai)] px-3 py-1 rounded-full border border-[#d7e8cb]">
                Merak Edilenler
              </span>
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[var(--ink)] mt-3">
                Sıkça Sorulan Sorular
              </h2>
            </div>
          </ScrollReveal>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <ScrollReveal key={faq.question} delay={index * 70}>
                  <div
                    className={`rounded-xl border transition-all ${
                      isOpen
                        ? "border-[var(--primary)] shadow-sm bg-white"
                        : "border-[var(--outline)] bg-white hover:border-[var(--outline)]/80"
                    }`}
                  >
                    <button
                      onClick={() => toggleFaq(index)}
                      className="flex w-full items-center justify-between p-4 sm:p-4.5 text-left font-display text-xs sm:text-sm font-semibold text-[var(--ink)] hover:text-[var(--primary)] transition-colors min-h-[48px] touch-manipulation cursor-pointer"
                    >
                      <span className="pr-4">{faq.question}</span>
                      <ChevronDown
                        size={18}
                        className={`text-[var(--muted)] shrink-0 transition-transform duration-300 ${
                          isOpen ? "rotate-180 text-[var(--primary)]" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 pt-1 text-xs leading-relaxed text-[var(--muted)] border-t border-[var(--outline)]/40 animate-in fade-in slide-in-from-top-1 duration-200">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. Big CTA Banner */}
      <section className="py-14 sm:py-16 border-t border-[var(--outline)] bg-[#E9EEE6] relative overflow-hidden">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8 relative z-10">
          <ScrollReveal>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-[#4E5D47]">
              Hedefindeki Üniversite İçin İlk Adımı Bugün At
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-[#4E5D47] max-w-xl mx-auto leading-relaxed">
              Tamamen ücretsiz başla, planını yap ve 2025/2026 YKS maratonunu profesyonelce yönet.
            </p>
            <div className="mt-6 flex justify-center">
              <Link
                href="/today"
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-8 py-3.5 text-sm font-bold text-white shadow-md hover:bg-[var(--primary-strong)] active:scale-95 hover:shadow-xl hover:-translate-y-0.5 transition-all touch-manipulation group"
              >
                <span>Çalışma Alanını Aç</span>
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="border-t border-[var(--outline)] bg-white py-10 sm:py-12 text-xs text-[var(--muted)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--outline)] bg-[var(--surface-muted)]">
                <Sparkles size={16} className="text-[var(--primary)]" />
              </div>
              <span className="font-display font-bold text-[var(--ink)]">{appConfig.name}</span>
              <span>— YKS Takip & AI Koçluk Sistemi</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-6">
              <Link href="/privacy" className="hover:text-[var(--ink)] transition-colors">
                Gizlilik Politikası
              </Link>
              <Link href="/terms" className="hover:text-[var(--ink)] transition-colors">
                Kullanım Şartları
              </Link>
              <Link href="/admin/login" className="hover:text-[var(--ink)] transition-colors">
                Yönetici
              </Link>
            </div>
          </div>

          <div className="mt-8 border-t border-[var(--outline)] pt-6 text-center text-[11px] text-[var(--muted)]">
            © {new Date().getFullYear()} {appConfig.name}. Tüm hakları saklıdır. ÖSYM ve MEB ile resmi bir bağlantısı bulunmamaktadır.
          </div>
        </div>
      </footer>
    </div>
  );
}
