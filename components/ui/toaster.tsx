"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

export interface ToastMessage {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

// Global toast emitter
type Listener = (toast: ToastMessage) => void;
const listeners: Listener[] = [];

export const toast = {
  success: (message: string, title = "Başarılı") => {
    emit({ id: Math.random().toString(), type: "success", title, message });
  },
  error: (message: string, title = "Hata Oluştu") => {
    emit({ id: Math.random().toString(), type: "error", title, message });
  },
  info: (message: string, title = "Bilgi") => {
    emit({ id: Math.random().toString(), type: "info", title, message });
  },
};

function emit(toastMsg: ToastMessage) {
  listeners.forEach((l) => l(toastMsg));
}

export function Toaster() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handler = (newToast: ToastMessage) => {
      setToasts((prev) => [...prev, newToast]);

      const timer = setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, newToast.duration || 4000);

      return () => clearTimeout(timer);
    };

    listeners.push(handler);
    return () => {
      const idx = listeners.indexOf(handler);
      if (idx !== -1) listeners.splice(idx, 1);
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-3">
      {toasts.map((t) => {
        const isSuccess = t.type === "success";
        const isError = t.type === "error";

        return (
          <div
            key={t.id}
            className={`pointer-events-auto rounded-2xl p-3.5 shadow-lg border backdrop-blur-md transition-all animate-in slide-in-from-top-2 duration-200 flex items-start gap-3 ${
              isSuccess
                ? "bg-emerald-900/90 text-white border-emerald-700/60"
                : isError
                ? "bg-rose-900/90 text-white border-rose-700/60"
                : "bg-stone-900/90 text-white border-stone-700/60"
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {isSuccess && <CheckCircle2 size={18} className="text-emerald-400" />}
              {isError && <AlertCircle size={18} className="text-rose-400" />}
              {!isSuccess && !isError && <Info size={18} className="text-sky-400" />}
            </div>

            <div className="flex-1 text-xs">
              {t.title && <h4 className="font-bold tracking-tight">{t.title}</h4>}
              <p className="opacity-90 mt-0.5 leading-snug">{t.message}</p>
            </div>

            <button
              type="button"
              onClick={() => removeToast(t.id)}
              className="shrink-0 text-white/60 hover:text-white transition-colors"
            >
              <X size={15} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
