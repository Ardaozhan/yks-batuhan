"use client";

import { createClient } from "@/lib/supabase/client";
import {
  addDailyTask,
  addExam,
  addSubject,
  addTopic,
  getExams,
  getSubjects,
  getTodayTasks,
  toggleTaskStatus,
} from "@/lib/study-store";
import type { Exam, ExamType, TaskPriority } from "@/types/study";

type RecordInput = Record<string, unknown>;
type RecordType = "subject" | "topic" | "task" | "study_session" | "exam" | "mistake";

export type DashboardTask = {
  id: string;
  title: string;
  status: "pending" | "active" | "completed";
  subject: string;
  topic: string;
  duration: string;
  description: string;
  priority?: TaskPriority;
  plannedQuestions?: number;
};

export type StudySubject = {
  id: string;
  name: string;
  examType: "TYT" | "AYT" | "Other";
  topicCount: number;
  completedTopics: number;
  progress: number;
  weeklyQuestions: number;
};

export type StudyExam = {
  id: string;
  name: string;
  type: "TYT" | "AYT";
  date: string;
  results: Array<{ section: string; correct: number; wrong: number; blank: number }>;
};

async function currentUserId() {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return null;
    return { supabase, userId: data.user.id };
  } catch {
    return null;
  }
}

const dateKey = () => new Date().toISOString().slice(0, 10);
const nestedName = (value: unknown) =>
  Array.isArray(value)
    ? typeof value[0]?.name === "string"
      ? value[0].name
      : ""
    : value && typeof value === "object" && typeof (value as { name?: unknown }).name === "string"
    ? (value as { name: string }).name
    : "";

export async function listTodayTasks(): Promise<DashboardTask[]> {
  const session = await currentUserId();
  if (session) {
    try {
      const { data, error } = await session.supabase
        .from("daily_tasks")
        .select("id,title,planned_questions,planned_minutes,status,priority,subjects(name),topics(name)")
        .eq("date", dateKey())
        .order("order");
      if (!error && data && data.length > 0) {
        return (data as Array<Record<string, unknown>>).map((task) => ({
          id: String(task.id),
          title: String(task.title),
          status: task.status as DashboardTask["status"],
          priority: (task.priority as TaskPriority) || "normal",
          subject: nestedName(task.subjects) || "Genel çalışma",
          topic: nestedName(task.topics),
          duration: task.planned_minutes ? `${task.planned_minutes} dk` : "30 dk",
          description: task.planned_questions
            ? `${task.planned_questions} soru hedefi`
            : "Bugünkü çalışma görevi",
          plannedQuestions: task.planned_questions as number | undefined,
        }));
      }
    } catch {
      // fallback
    }
  }

  // Fallback to local store
  const local = await getTodayTasks();
  return local.map((t) => ({
    id: t.id,
    title: t.topic ? `${t.subject}: ${t.topic}` : t.subject,
    status: t.status,
    priority: t.priority || "normal",
    subject: t.subject,
    topic: t.topic,
    duration: t.duration,
    description: t.description,
    plannedQuestions: t.plannedQuestions,
  }));
}

export async function updateTaskStatus(id: string, status: DashboardTask["status"]) {
  const session = await currentUserId();
  if (session) {
    try {
      await session.supabase.from("daily_tasks").update({ status }).eq("id", id);
    } catch {
      // fallback handled below
    }
  }
  await toggleTaskStatus(id);
}

export async function listSubjects(): Promise<StudySubject[]> {
  const session = await currentUserId();
  if (session) {
    try {
      const { data, error } = await session.supabase
        .from("subjects")
        .select("id,name,exam_type,topics(id,status),study_sessions(total_questions)")
        .order("position");
      if (!error && data && data.length > 0) {
        return (data as Array<Record<string, unknown>>).map((subject) => {
          const topics = Array.isArray(subject.topics)
            ? (subject.topics as Array<{ status?: string }>)
            : [];
          const sessions = Array.isArray(subject.study_sessions)
            ? (subject.study_sessions as Array<{ total_questions?: number }>)
            : [];
          const completedTopics = topics.filter((t) => t.status === "completed").length;
          return {
            id: String(subject.id),
            name: String(subject.name),
            examType: subject.exam_type as StudySubject["examType"],
            topicCount: topics.length,
            completedTopics,
            progress: topics.length ? Math.round((completedTopics / topics.length) * 100) : 0,
            weeklyQuestions: sessions.reduce((sum, s) => sum + (s.total_questions ?? 0), 0),
          };
        });
      }
    } catch {
      // fallback
    }
  }
  return getSubjects().map((s) => ({
    id: s.id,
    name: s.name,
    examType: s.examType,
    topicCount: s.topicCount,
    completedTopics: s.completedTopics,
    progress: s.progress,
    weeklyQuestions: s.weeklyQuestions || 0,
  }));
}

export async function listExams(): Promise<StudyExam[]> {
  const session = await currentUserId();
  if (session) {
    try {
      const { data, error } = await session.supabase
        .from("exams")
        .select("id,name,exam_type,exam_date,exam_results(section,correct,wrong,blank)")
        .order("exam_date", { ascending: false });
      if (!error && data && data.length > 0) {
        return (data as Array<Record<string, unknown>>).map((exam) => ({
          id: String(exam.id),
          name: String(exam.name),
          type: exam.exam_type as StudyExam["type"],
          date: new Intl.DateTimeFormat("tr-TR", { dateStyle: "long" }).format(
            new Date(String(exam.exam_date))
          ),
          results: Array.isArray(exam.exam_results)
            ? (exam.exam_results as StudyExam["results"])
            : [],
        }));
      }
    } catch {
      // fallback
    }
  }
  return getExams().map((e) => ({
    id: e.id,
    name: e.name,
    type: e.type,
    date: e.date,
    results: e.results,
  }));
}

export async function createStudyRecord(type: RecordType, input: RecordInput) {
  const session = await currentUserId();

  if (session) {
    try {
      let subjectId: string | undefined;
      if (typeof input.subject === "string" && input.subject.trim()) {
        const { data } = await session.supabase
          .from("subjects")
          .select("id")
          .eq("name", input.subject.trim())
          .maybeSingle();
        subjectId = data?.id;
      }

      const payloads: Record<RecordType, { table: string; value: RecordInput }> = {
        subject: {
          table: "subjects",
          value: { user_id: session.userId, name: input.name, exam_type: input.examType },
        },
        topic: {
          table: "topics",
          value: {
            user_id: session.userId,
            subject_id: subjectId,
            name: input.name,
            question_target: input.questionTarget,
          },
        },
        task: {
          table: "daily_tasks",
          value: {
            user_id: session.userId,
            subject_id: subjectId,
            title: input.title,
            planned_questions: input.plannedQuestions,
            planned_minutes: input.plannedMinutes,
            date: dateKey(),
          },
        },
        study_session: {
          table: "study_sessions",
          value: {
            user_id: session.userId,
            subject_id: subjectId,
            total_questions: input.totalQuestions,
            correct: input.correct,
            wrong: input.wrong,
            blank: input.blank,
            duration_minutes: input.duration,
            studied_at: dateKey(),
          },
        },
        exam: {
          table: "exams",
          value: {
            user_id: session.userId,
            name: input.name,
            exam_type: input.type,
            exam_date: input.date,
          },
        },
        mistake: {
          table: "mistakes",
          value: {
            user_id: session.userId,
            reason: input.reason,
            note: input.note,
          },
        },
      };

      const target = payloads[type];
      const { data, error } = await session.supabase
        .from(target.table)
        .insert(target.value)
        .select("id")
        .single();
      if (!error && data) return data;
    } catch {
      // fallback to local below
    }
  }

  // Local fallback persistence
  if (type === "task") {
    return addDailyTask({
      subject: String(input.subject || "Genel"),
      topic: String(input.title || "Çalışma"),
      description: input.plannedQuestions ? `${input.plannedQuestions} soru hedefi` : "Günlük görev",
      duration: input.plannedMinutes ? `${input.plannedMinutes} dk` : "45 dk",
      status: "pending",
      priority: "normal",
      plannedQuestions: Number(input.plannedQuestions) || 30,
    });
  } else if (type === "subject") {
    return addSubject({
      name: String(input.name),
      examType: (input.examType as StudySubject["examType"]) || "TYT",
    });
  } else if (type === "topic") {
    return addTopic({
      name: String(input.name),
      subjectId: String(input.subjectId || "tyt-matematik"),
      total: Number(input.questionTarget) || 5,
    });
  } else if (type === "exam") {
    return addExam({
      name: String(input.name),
      type: (input.type as ExamType) || "TYT",
      date: String(input.date || "Bugün"),
      results: Array.isArray(input.results) ? (input.results as Exam["results"]) : [],
    });
  }

  return { id: "local-" + Date.now() };
}
