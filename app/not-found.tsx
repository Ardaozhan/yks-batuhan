import Link from "next/link";
import { Compass, Home, Sparkles } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-[var(--background)] text-center">
      <div className="paper-card max-w-md p-8 shadow-lg bg-[var(--surface)] text-center space-y-6">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-[var(--surface-ai)] border-2 border-[var(--primary-soft)] text-[var(--primary)] shadow-xs animate-bounce">
          <Compass size={40} />
        </div>

        <div className="space-y-2">
          <span className="rounded-full bg-[var(--surface-muted)] px-3 py-1 text-xs font-bold text-[var(--muted)]">
            Hata 404 • Sayfa Bulunamadı
          </span>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[var(--ink)]">
            Bu Konu Henüz Müfredatta Yok!
          </h1>
          <p className="text-xs text-[var(--muted)] leading-relaxed">
            Aradığınız sayfa silinmiş, taşınmış veya henüz ÖSYM tarafından sınav kapsamına alınmamış olabilir.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            href="/today"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[var(--primary-strong)] transition-all active:scale-95"
          >
            <Home size={15} />
            <span>Bugün&apos;e Dön</span>
          </Link>
          <Link
            href="/coach"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--outline)] bg-[var(--surface)] px-4 py-2.5 text-xs font-semibold text-[var(--ink)] hover:bg-[var(--surface-muted)] transition-all"
          >
            <Sparkles size={15} className="text-[var(--primary)]" />
            <span>AI Koç&apos;a Danış</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
