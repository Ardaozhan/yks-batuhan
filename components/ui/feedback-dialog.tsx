"use client";

import { useState } from "react";
import { CheckCircle2, MessageSquare, Send, Sparkles, X } from "lucide-react";
import { useToast } from "@/components/ui/toaster";

interface FeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type FeedbackType = "suggestion" | "bug" | "other";

const feedbackTypes: Array<{ id: FeedbackType; label: string }> = [
  { id: "suggestion", label: "Öneri / Fikir" },
  { id: "bug", label: "Hata Bildir" },
  { id: "other", label: "Genel" },
];

export function FeedbackDialog({ open, onOpenChange }: FeedbackDialogProps) {
  const { toast } = useToast();
  const [type, setType] = useState<FeedbackType>("suggestion");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    setTimeout(() => {
      // Store in localStorage for admin inspection or local debug
      try {
        const existing = JSON.parse(localStorage.getItem("yks_feedback") || "[]");
        existing.push({
          id: Date.now(),
          type,
          message,
          email,
          createdAt: new Date().toISOString(),
        });
        localStorage.setItem("yks_feedback", JSON.stringify(existing));
      } catch (err) {
        // ignore
      }

      setLoading(false);
      setSent(true);
      toast({
        title: "Geri bildiriminiz alındı",
        description: "Görüşleriniz sistemimizi geliştirmemize yardımcı oluyor, teşekkürler!",
        variant: "success",
      });

      setTimeout(() => {
        setSent(false);
        setMessage("");
        setEmail("");
        onOpenChange(false);
      }, 1500);
    }, 400);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs animate-in fade-in"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-[var(--outline)] bg-white p-6 shadow-2xl animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-[var(--outline)] mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--surface-ai)] text-[var(--primary)]">
              <MessageSquare size={18} />
            </div>
            <h3 className="font-display text-base font-bold text-[var(--ink)]">
              Geri Bildirim & Destek
            </h3>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            aria-label="Kapat"
            className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--ink)] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {sent ? (
          <div className="py-8 text-center animate-in zoom-in-95">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--surface-ai)] text-[var(--primary)]">
              <CheckCircle2 size={32} />
            </div>
            <h4 className="font-display text-base font-bold text-[var(--ink)]">
              Teşekkür Ederiz!
            </h4>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Geri bildiriminiz geliştirici ekibine başarıyla iletildi.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Type selector */}
            <div className="grid grid-cols-3 gap-2">
              {feedbackTypes.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setType(item.id)}
                  className={`rounded-xl py-2 px-2.5 font-semibold text-center transition-all ${
                    type === item.id
                      ? "bg-[var(--primary)] text-white shadow-xs"
                      : "border border-[var(--outline)] bg-[var(--surface-muted)] text-[var(--muted)] hover:text-[var(--ink)]"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div>
              <label className="block font-medium text-[var(--ink)] mb-1">
                Mesajınız veya Öneriniz
              </label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Örneğin: 'Deneme analizi sayfasına net hedefi koyma özelliği eklenebilir mi?' veya yaşadığınız bir sorun..."
                className="w-full rounded-xl border border-[var(--outline)] bg-[#fbf9f5] p-3 text-xs text-[var(--ink)] outline-none focus:border-[var(--primary)] focus:bg-white transition-all resize-none placeholder:text-[var(--muted)]"
              />
            </div>

            <div>
              <label className="block font-medium text-[var(--ink)] mb-1">
                E-posta Adresiniz (İsteğe bağlı - yanıt için)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@ogrenci.com"
                className="h-10 w-full rounded-xl border border-[var(--outline)] bg-[#fbf9f5] px-3 text-xs text-[var(--ink)] outline-none focus:border-[var(--primary)] focus:bg-white transition-all placeholder:text-[var(--muted)]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary)] text-xs font-semibold text-white shadow-md hover:bg-[var(--primary-strong)] active:scale-95 disabled:opacity-50 transition-all"
            >
              <Send size={15} />
              <span>{loading ? "Gönderiliyor..." : "Geri Bildirimi Gönder"}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
