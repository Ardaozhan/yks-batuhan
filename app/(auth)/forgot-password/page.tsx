"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, KeyRound, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/settings`,
      });

      if (resetError) {
        setError(resetError.message);
      } else {
        setSent(true);
      }
    } catch {
      setError("Bağlantı hatası oluştu, lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] p-5">
      <section className="w-full max-w-md paper-card p-6 md:p-8 bg-[var(--surface)] shadow-lg">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--muted)] hover:text-[var(--ink)] mb-6 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Giriş Ekranına Dön</span>
        </Link>

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--surface-ai)] text-[var(--primary)] mb-4 border border-[var(--primary-soft)]">
          <KeyRound size={24} />
        </div>

        <h1 className="font-display text-2xl font-bold tracking-tight text-[var(--ink)]">
          Şifreni Sıfırla
        </h1>
        <p className="mt-1.5 text-xs text-[var(--muted)] leading-relaxed">
          Kayıtlı e-posta adresini gir. Şifreni sıfırlayabilmen için sana güvenli bir bağlantı göndereceğiz.
        </p>

        {sent ? (
          <div className="mt-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-5 text-center space-y-3">
            <CheckCircle2 size={32} className="mx-auto text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-display text-sm font-bold text-emerald-900 dark:text-emerald-200">
              Sıfırlama Bağlantısı Gönderildi!
            </h3>
            <p className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed">
              <strong>{email}</strong> adresine şifre sıfırlama linki ilettik. Lütfen gelen kutunu ve spam klasörünü kontrol et.
            </p>
            <Link
              href="/login"
              className="inline-block mt-2 text-xs font-bold text-emerald-900 dark:text-emerald-300 underline"
            >
              Giriş Ekranına Git
            </Link>
          </div>
        ) : (
          <form onSubmit={handleReset} className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-[var(--ink)] mb-1.5">
                E-posta Adresin
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-3.5 text-[var(--muted)]" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ornek@ogrenci.com"
                  className="h-11 w-full rounded-xl border border-[var(--outline)] bg-[var(--surface)] pl-10 pr-3 text-xs text-[var(--ink)] outline-none focus:border-[var(--primary)]"
                />
              </div>
            </div>

            {error && (
              <p className="text-xs font-medium text-[var(--danger)] bg-rose-50 dark:bg-rose-950/40 p-3 rounded-xl border border-rose-200 dark:border-rose-800">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="h-11 w-full rounded-xl bg-[var(--primary)] text-xs font-bold text-white shadow-xs hover:bg-[var(--primary-strong)] disabled:opacity-60 transition-all active:scale-95"
            >
              {loading ? "Bağlantı Gönderiliyor..." : "Sıfırlama Bağlantısı Gönder"}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
