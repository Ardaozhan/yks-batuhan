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
  const [googleLoading, setGoogleLoading] = useState(false);
  const configured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );
  const isLogin = mode === "login";

  async function handleGoogleLogin() {
    setError("");
    setGoogleLoading(true);
    try {
      const supabase = createClient();
      const { error: gError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/today`,
        },
      });
      if (gError) setError(gError.message);
    } catch {
      setError("Google ile giriş başlatılamadı.");
    } finally {
      setGoogleLoading(false);
    }
  }

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

        {/* Social Login Button */}
        <div className="mt-6">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="flex h-11 w-full items-center justify-center gap-3 rounded-xl border border-[var(--outline)] bg-[var(--surface)] text-xs font-semibold text-[var(--ink)] hover:bg-[var(--surface-muted)] transition-all active:scale-95 shadow-2xs"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{googleLoading ? "Yönlendiriliyor..." : "Google ile Devam Et"}</span>
          </button>
        </div>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-[var(--outline)]" />
          <span className="text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wider">veya</span>
          <div className="h-px flex-1 bg-[var(--outline)]" />
        </div>

        <form onSubmit={submit} className="space-y-3.5">
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
