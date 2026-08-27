"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        setError("Şifre hatalı.");
        return;
      }

      // Replace the login entry instead of pushing it, then refresh server
      // components so the newly-created admin cookie is picked up immediately.
      router.replace("/admin");
      router.refresh();
    } catch {
      setError("Giriş sırasında bir hata oluştu. Tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] p-5">
      <form onSubmit={handleSubmit} className="paper-card w-full max-w-sm p-6">
        <h1 className="font-display text-2xl font-semibold">Yönetici Girişi</h1>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          Yönetim paneline devam etmek için şifrenizi girin.
        </p>
        <label htmlFor="admin-password" className="sr-only">Yönetici Şifresi</label>
        <input
          id="admin-password"
          aria-label="Yönetici Şifresi"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-6 h-12 w-full rounded-lg border border-[var(--outline)] bg-transparent px-3"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="mt-3 min-h-12 w-full rounded-lg bg-[var(--primary)] text-white disabled:cursor-wait disabled:opacity-70"
        >
          {loading ? "Giriş yapılıyor…" : "Giriş yap"}
        </button>
        {error && <p role="alert" className="mt-3 text-sm text-[var(--danger)]">{error}</p>}
      </form>
    </main>
  );
}
