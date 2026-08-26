"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./theme-provider";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={resolvedTheme === "dark" ? "Açık Moda Geç" : "Koyu Moda Geç"}
      aria-label="Temayı Değiştir"
      className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--outline)] bg-[var(--surface)] text-[var(--ink)] hover:bg-[var(--surface-muted)] transition-all active:scale-90 ${className}`}
    >
      {resolvedTheme === "dark" ? (
        <Sun size={17} className="text-amber-400 animate-in spin-in-180 duration-200" />
      ) : (
        <Moon size={17} className="text-[var(--primary)] animate-in spin-in-180 duration-200" />
      )}
    </button>
  );
}
