"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Uygulama İstemci Hatası:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-[var(--background)] text-center">
      <div className="paper-card max-w-md p-8 shadow-lg bg-[var(--surface)] text-center space-y-6">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-rose-50 border-2 border-rose-200 text-rose-600 shadow-xs">
          <AlertTriangle size={36} />
        </div>

        <div className="space-y-2">
          <span className="rounded-full bg-rose-100 text-rose-800 px-3 py-1 text-xs font-bold">
            Beklenmedik Bir Hata Oluştu
          </span>
          <h1 className="font-display text-xl font-bold tracking-tight text-[var(--ink)]">
            Bir Şeyler Ters Gitti
          </h1>
          <p className="text-xs text-[var(--muted)] leading-relaxed">
            İşlem sırasında bir hata ile karşılaşıldı. Sayfayı yenileyerek tekrar deneyebilirsiniz.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[var(--primary-strong)] transition-all active:scale-95"
          >
            <RefreshCw size={15} />
            <span>Tekrar Dene</span>
          </button>
          <Link
            href="/today"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--outline)] bg-[var(--surface)] px-4 py-2.5 text-xs font-semibold text-[var(--ink)] hover:bg-[var(--surface-muted)] transition-all"
          >
            <Home size={15} />
            <span>Ana Sayfaya Dön</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
