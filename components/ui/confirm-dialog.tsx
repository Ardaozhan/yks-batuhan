"use client";

import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmText = "Onayla",
  cancelText = "Vazgeç",
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs animate-in fade-in"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-[var(--outline)] bg-white p-6 shadow-2xl animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
              danger
                ? "bg-[#fff5f4] text-[#ba1a1a] border border-[#ffdad6]"
                : "bg-[var(--surface-ai)] text-[var(--primary)] border border-[#d7e8cb]"
            }`}
          >
            <AlertTriangle size={20} />
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-[var(--ink)]">{title}</h3>
          </div>
        </div>

        <p className="text-xs leading-relaxed text-[var(--muted)] mb-6">{description}</p>

        <div className="flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-[var(--outline)] bg-[var(--surface-muted)] px-4 py-2 text-xs font-semibold text-[var(--ink)] hover:bg-[#e9eee6] transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`rounded-xl px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors active:scale-95 ${
              danger
                ? "bg-[#ba1a1a] hover:bg-[#93000a]"
                : "bg-[var(--primary)] hover:bg-[var(--primary-strong)]"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
