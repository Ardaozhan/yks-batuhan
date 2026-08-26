"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { appConfig } from "@/lib/config";

const credentialsSchema = z.object({
  email: z.string().email("Geçerli bir e-posta adresi gir."),
  password: z.string().min(8, "Şifre en az 8 karakter olmalı."),
});

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const configured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );
  const isLogin = mode === "login";

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");
    const parsed = credentialsSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Bilgileri kontrol et.");
      return;
    }
    if (!configured) {
      setError("Supabase bağlantısı henüz yapılandırılmadı.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const result = isLogin
      ? await supabase.auth.signInWithPassword(parsed.data)
      : await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
        });
    setLoading(false);
    if (result.error) {
      setError(result.error.message);
      return;
    }
    setMessage(
      isLogin
        ? "Giriş başarılı. Yönlendiriliyorsun..."
        : "Kaydı tamamlamak için e-posta adresini doğrula."
    );
    if (isLogin) router.push("/today");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] p-5">
      <section className="w-full max-w-md paper-card p-6 md:p-8 bg-[var(--surface)] shadow-lg">
        <Link href="/" className="font-display text-2xl font-bold text-[var(--primary)] tracking-tight">
          {appConfig.name}
        </Link>
        <h1 className="mt-6 font-display text-2xl md:text-3xl font-bold text-[var(--ink)]">
          {isLogin ? "Tekrar Hoş Geldin" : "Çalışma Alanını Oluştur"}
        </h1>
        <p className="mt-1.5 text-xs text-[var(--muted)] leading-relaxed">
          {isLogin
            ? "YKS hazırlığına ve hedeflerine kaldığın yerden devam et."
            : "Kişisel YKS çalışma ve AI koçluk sistemini kurmaya başla."}
        </p>

        <form onSubmit={submit} className="mt-6 space-y-3.5">
          <label className="block">
            <span className="mb-1 block text-xs font-bold text-[var(--ink)]">E-posta</span>
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="ogrenci@example.com"
              className="app-focus h-11 w-full rounded-xl border border-[var(--outline)] bg-[var(--surface)] px-3 text-xs text-[var(--ink)] outline-none focus:border-[var(--primary)]"
            />
          </label>

          <label className="block">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-[var(--ink)]">Şifre</span>
              {isLogin && (
                <Link
                  href="/forgot-password"
                  className="text-[11px] font-semibold text-[var(--primary)] hover:underline"
                >
                  Şifremi unuttum
                </Link>
              )}
            </div>
            <input
              type="password"
              autoComplete={isLogin ? "current-password" : "new-password"}
              required
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="app-focus h-11 w-full rounded-xl border border-[var(--outline)] bg-[var(--surface)] px-3 text-xs text-[var(--ink)] outline-none focus:border-[var(--primary)]"
            />
          </label>

          {error && <p role="alert" className="text-xs text-[var(--danger)]">{error}</p>}
          {message && <p role="status" className="text-xs text-[var(--primary)] font-bold">{message}</p>}

          <button
            disabled={loading}
            className="app-focus h-11 w-full rounded-xl bg-[var(--primary)] text-xs font-bold text-white shadow-xs hover:bg-[var(--primary-strong)] disabled:cursor-wait disabled:opacity-60 transition-all active:scale-95"
          >
            {loading ? "Bekleyin..." : isLogin ? "Giriş Yap" : "Kayıt Ol"}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-[var(--muted)]">
          {isLogin ? "Hesabın yok mu?" : "Zaten hesabın var mı?"}{" "}
          <Link className="font-bold text-[var(--primary)] underline" href={isLogin ? "/register" : "/login"}>
            {isLogin ? "Hemen Kaydol" : "Giriş Yap"}
          </Link>
        </p>
      </section>
    </main>
  );
}
