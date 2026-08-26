"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { CheckCircle2, ChevronLeft, X } from "lucide-react";
import { createStudyRecord } from "@/lib/supabase/study-repository";
import { getSubjects } from "@/lib/study-store";
import {
  examSchema,
  mistakeSchema,
  studySessionSchema,
  subjectSchema,
  taskSchema,
  topicSchema,
} from "@/lib/validations/study";
import type { z } from "zod";

const options = [
  { label: "Görev ekle", desc: "Bugünün programına çalışma görevi ekle" },
  { label: "Ders ekle", desc: "Yeni bir TYT veya AYT dersi tanımla" },
  { label: "Konu ekle", desc: "Bir derse alt başlık veya konu ata" },
  { label: "Çalışma ekle", desc: "Çözdüğün soru sayısını ve süreni kaydet" },
  { label: "Deneme ekle", desc: "Yeni bir deneme sınavı sonucu gir" },
  { label: "Yanlış ekle", desc: "Hata defterine soru ve eksik notu düş" },
] as const;

type FormKind = typeof options[number]["label"];

export function QuickAddDialog({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved?: () => void;
}) {
  const [kind, setKind] = useState<FormKind | null>(null);
  const [saved, setSaved] = useState(false);
  const [availableSubjects, setAvailableSubjects] = useState<string[]>(() =>
    getSubjects().map((s) => s.name)
  );

  useEffect(() => {
    const handleUpdate = () =>
      setAvailableSubjects(getSubjects().map((s) => s.name));
    window.addEventListener("study_store_change", handleUpdate);
    return () => window.removeEventListener("study_store_change", handleUpdate);
  }, []);

  const finish = () => {
    setSaved(true);
    onSaved?.();
    window.setTimeout(onClose, 800);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Hızlı ekle"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 backdrop-blur-xs md:items-center"
      onMouseDown={onClose}
    >
      <section
        onMouseDown={(event) => event.stopPropagation()}
        className="w-full max-w-md rounded-2xl border border-[var(--outline)] bg-white p-6 shadow-2xl animate-in fade-in"
      >
        <div className="mb-5 flex items-center justify-between pb-3 border-b border-[var(--outline)]">
          <div className="flex items-center gap-2">
            {kind && (
              <button
                onClick={() => setKind(null)}
                aria-label="Seçimlere dön"
                className="app-focus rounded-lg p-1.5 hover:bg-[var(--surface-muted)] text-[var(--muted)] hover:text-[var(--ink)]"
              >
                <ChevronLeft size={20} />
              </button>
            )}
            <h2 className="font-display text-lg font-bold text-[var(--ink)]">
              {kind ?? "Hızlı Ekle"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="app-focus rounded-lg p-1.5 text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-muted)]"
          >
            <X size={18} />
          </button>
        </div>

        {saved ? (
          <div className="flex min-h-48 flex-col items-center justify-center text-center animate-in zoom-in-95">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--surface-ai)] text-[var(--primary)] mb-3">
              <CheckCircle2 size={36} />
            </div>
            <p className="font-display text-lg font-bold text-[var(--ink)]">Kaydedildi</p>
            <p className="mt-1 text-xs text-[var(--muted)]">Kayıt çalışma alanına başarıyla işlendi.</p>
          </div>
        ) : !kind ? (
          <div className="grid grid-cols-1 gap-2.5">
            {options.map((opt) => (
              <button
                key={opt.label}
                onClick={() => setKind(opt.label)}
                className="app-focus flex items-center justify-between p-3.5 rounded-xl border border-[var(--outline)] bg-white hover:border-[var(--primary)] hover:bg-[var(--surface-ai)] transition-all text-left group shadow-2xs"
              >
                <div>
                  <p className="text-sm font-semibold text-[var(--ink)] group-hover:text-[var(--primary)]">
                    {opt.label}
                  </p>
                  <p className="text-xs text-[var(--muted)] mt-0.5">{opt.desc}</p>
                </div>
                <span className="text-[var(--muted)] group-hover:text-[var(--primary)] group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </button>
            ))}
          </div>
        ) : (
          <QuickForm kind={kind} subjects={availableSubjects} onSuccess={finish} />
        )}

        {/* Global Datalist for subjects */}
        <datalist id="quick-subjects-list">
          {availableSubjects.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      </section>
    </div>
  );
}

function Field({
  label,
  children,
  error,
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-[var(--ink)]">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-[var(--danger)]">{error}</span>}
    </label>
  );
}

const inputStyle =
  "app-focus h-11 w-full rounded-xl border border-[var(--outline)] bg-[#fbf9f5] px-3.5 text-sm text-[var(--ink)] outline-none focus:border-[var(--primary)] focus:bg-white transition-all placeholder:text-[var(--muted)]";

function FormFooter() {
  return (
    <button
      type="submit"
      className="app-focus mt-5 min-h-11 w-full rounded-xl bg-[var(--primary)] text-sm font-semibold text-white shadow-md hover:bg-[var(--primary-strong)] active:scale-95 transition-all"
    >
      Kaydet
    </button>
  );
}

async function persist(
  type: "subject" | "topic" | "task" | "study_session" | "exam" | "mistake",
  data: Record<string, unknown>,
  onSuccess: () => void
) {
  try {
    await createStudyRecord(type, data);
    onSuccess();
  } catch (error) {
    window.alert(error instanceof Error ? error.message : "Kayıt sırasında bir hata oluştu.");
  }
}

function QuickForm({
  kind,
  subjects,
  onSuccess,
}: {
  kind: FormKind;
  subjects: string[];
  onSuccess: () => void;
}) {
  if (kind === "Ders ekle") return <SubjectForm onSuccess={onSuccess} />;
  if (kind === "Konu ekle") return <TopicForm subjects={subjects} onSuccess={onSuccess} />;
  if (kind === "Görev ekle") return <TaskForm subjects={subjects} onSuccess={onSuccess} />;
  if (kind === "Çalışma ekle") return <StudyForm subjects={subjects} onSuccess={onSuccess} />;
  if (kind === "Deneme ekle") return <ExamForm onSuccess={onSuccess} />;
  return <MistakeForm subjects={subjects} onSuccess={onSuccess} />;
}

function SubjectForm({ onSuccess }: { onSuccess: () => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.input<typeof subjectSchema>>({
    resolver: zodResolver(subjectSchema),
    defaultValues: { examType: "TYT" },
  });

  return (
    <form onSubmit={handleSubmit((data) => persist("subject", data, onSuccess))} className="space-y-3.5">
      <Field label="Ders Adı" error={errors.name?.message}>
        <input autoFocus className={inputStyle} placeholder="Örn: TYT Matematik" {...register("name")} />
      </Field>
      <Field label="Sınav Türü">
        <select className={inputStyle} {...register("examType")}>
          <option value="TYT">TYT</option>
          <option value="AYT">AYT</option>
          <option value="Other">Diğer</option>
        </select>
      </Field>
      <FormFooter />
    </form>
  );
}

function TopicForm({ subjects, onSuccess }: { subjects: string[]; onSuccess: () => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.input<typeof topicSchema>>({
    resolver: zodResolver(topicSchema),
    defaultValues: { subject: subjects[0] || "TYT Matematik" },
  });

  return (
    <form onSubmit={handleSubmit((data) => persist("topic", data, onSuccess))} className="space-y-3.5">
      <Field label="Konu Adı" error={errors.name?.message}>
        <input autoFocus className={inputStyle} placeholder="Örn: Problemler" {...register("name")} />
      </Field>
      <Field label="Ders" error={errors.subject?.message}>
        <input
          list="quick-subjects-list"
          className={inputStyle}
          placeholder="Ders seç veya yaz..."
          {...register("subject")}
        />
      </Field>
      <Field label="Soru Hedefi">
        <input type="number" min="0" placeholder="Örn: 50" className={inputStyle} {...register("questionTarget")} />
      </Field>
      <FormFooter />
    </form>
  );
}

function TaskForm({ subjects, onSuccess }: { subjects: string[]; onSuccess: () => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.input<typeof taskSchema>>({
    resolver: zodResolver(taskSchema),
    defaultValues: { subject: subjects[0] || "TYT Matematik" },
  });

  return (
    <form onSubmit={handleSubmit((data) => persist("task", data, onSuccess))} className="space-y-3.5">
      <Field label="Görev / Konu" error={errors.title?.message}>
        <input autoFocus className={inputStyle} placeholder="Örn: Paragraf soru çözümü" {...register("title")} />
      </Field>
      <Field label="Ders" error={errors.subject?.message}>
        <input
          list="quick-subjects-list"
          className={inputStyle}
          placeholder="Ders seç veya yaz..."
          {...register("subject")}
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Soru Hedefi">
          <input type="number" min="0" placeholder="30" className={inputStyle} {...register("plannedQuestions")} />
        </Field>
        <Field label="Süre (dk)">
          <input type="number" min="0" placeholder="45" className={inputStyle} {...register("plannedMinutes")} />
        </Field>
      </div>
      <FormFooter />
    </form>
  );
}

function StudyForm({ subjects, onSuccess }: { subjects: string[]; onSuccess: () => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.input<typeof studySessionSchema>>({
    resolver: zodResolver(studySessionSchema),
    defaultValues: { subject: subjects[0] || "TYT Matematik", totalQuestions: 30, duration: 45, correct: 25, wrong: 4, blank: 1 },
  });

  return (
    <form onSubmit={handleSubmit((data) => persist("study_session", data, onSuccess))} className="space-y-3">
      <Field label="Ders" error={errors.subject?.message}>
        <input
          list="quick-subjects-list"
          className={inputStyle}
          placeholder="Ders seç..."
          {...register("subject")}
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Toplam Soru" error={errors.totalQuestions?.message}>
          <input type="number" min="0" className={inputStyle} {...register("totalQuestions")} />
        </Field>
        <Field label="Süre (dk)" error={errors.duration?.message}>
          <input type="number" min="1" className={inputStyle} {...register("duration")} />
        </Field>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Field label="Doğru">
          <input type="number" min="0" className={inputStyle} {...register("correct")} />
        </Field>
        <Field label="Yanlış">
          <input type="number" min="0" className={inputStyle} {...register("wrong")} />
        </Field>
        <Field label="Boş">
          <input type="number" min="0" className={inputStyle} {...register("blank")} />
        </Field>
      </div>
      <FormFooter />
    </form>
  );
}

function ExamForm({ onSuccess }: { onSuccess: () => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.input<typeof examSchema>>({
    resolver: zodResolver(examSchema),
    defaultValues: {
      type: "TYT",
      date: new Intl.DateTimeFormat("tr-TR", { dateStyle: "long" }).format(new Date()),
    },
  });

  return (
    <form onSubmit={handleSubmit((data) => persist("exam", data, onSuccess))} className="space-y-3.5">
      <Field label="Deneme Adı" error={errors.name?.message}>
        <input autoFocus className={inputStyle} placeholder="Örn: 3D TYT Genel Deneme" {...register("name")} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Sınav Türü">
          <select className={inputStyle} {...register("type")}>
            <option value="TYT">TYT</option>
            <option value="AYT">AYT</option>
          </select>
        </Field>
        <Field label="Tarih" error={errors.date?.message}>
          <input type="text" className={inputStyle} {...register("date")} />
        </Field>
      </div>
      <FormFooter />
    </form>
  );
}

function MistakeForm({ subjects, onSuccess }: { subjects: string[]; onSuccess: () => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.input<typeof mistakeSchema>>({
    resolver: zodResolver(mistakeSchema),
    defaultValues: { reason: "concept", subject: subjects[0] || "TYT Matematik" },
  });

  return (
    <form onSubmit={handleSubmit((data) => persist("mistake", data, onSuccess))} className="space-y-3.5">
      <Field label="Ders" error={errors.subject?.message}>
        <input
          list="quick-subjects-list"
          className={inputStyle}
          placeholder="Ders seç..."
          {...register("subject")}
        />
      </Field>
      <Field label="Yanlış Nedeni">
        <select className={inputStyle} {...register("reason")}>
          <option value="concept">Konu eksiği</option>
          <option value="attention">Dikkat hatası</option>
          <option value="calculation">İşlem hatası</option>
          <option value="time">Süre yetmedi</option>
          <option value="other">Diğer</option>
        </select>
      </Field>
      <Field label="Hata Notu" error={errors.note?.message}>
        <textarea
          className={`${inputStyle} h-20 py-2.5 resize-none`}
          placeholder="Soruda neyi kaçırdın? Doğru yaklaşım neydi?"
          {...register("note")}
        />
      </Field>
      <FormFooter />
    </form>
  );
}
