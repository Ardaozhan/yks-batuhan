"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie, ShieldCheck, X } from "lucide-react";

export function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      try {
        const consent = localStorage.getItem("yks_cookie_consent");
        if (!cancelled && !consent) {
          setShow(true);
        }
      } catch {
        // Ignore unavailable local storage.
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem("yks_cookie_consent", "accepted");
    } catch {}
    setShow(false);
  };

  const handleDecline = () => {
    try {
      localStorage.setItem("yks_cookie_consent", "declined");
    } catch {}
    setShow(false);
  };

  if (!show) return null;

  return (
    <aside
      aria-label="Çerez bilgilendirmesi"
      className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 rounded-2xl border border-[var(--outline)] bg-white/95 p-4 sm:p-5 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-4 duration-300"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--surface-ai)] text-[var(--primary)] mt-0.5">
          <Cookie size={18} />
        </div>
        <div className="flex-1 text-xs">
          <h4 className="font-display font-bold text-[var(--ink)] flex items-center gap-1.5">
            <span>Çerez ve Gizlilik Bildirimi</span>
            <ShieldCheck size={14} className="text-[var(--primary)]" />
          </h4>
          <p className="mt-1 text-[var(--muted)] leading-relaxed">
            YKS Odak, çalışma ilerlemenizi kaydetmek ve kullanıcı deneyiminizi geliştirmek için yerel
            çerezleri (localStorage) kullanır. Detaylar için{" "}
            <Link href="/privacy" className="font-semibold text-[var(--primary)] underline">
              Gizlilik Politikamızı
            </Link>{" "}
            inceleyebilirsiniz.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={handleAccept}
              className="flex-1 rounded-xl bg-[var(--primary)] py-2 text-center text-xs font-bold text-white shadow-xs hover:bg-[var(--primary-strong)] active:scale-95 transition-all touch-manipulation"
            >
              Kabul Et
            </button>
            <button
              type="button"
              onClick={handleDecline}
              className="rounded-xl border border-[var(--outline)] bg-[var(--surface-muted)] px-3 py-2 text-center text-xs font-semibold text-[var(--muted)] hover:text-[var(--ink)] active:scale-95 transition-all touch-manipulation"
            >
              Yalnızca Zorunlu
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={handleDecline}
          aria-label="Kapat"
          className="shrink-0 text-[var(--muted)] hover:text-[var(--ink)] p-1 -mr-1 -mt-1"
        >
          <X size={16} />
        </button>
      </div>
    </aside>
  );
}
