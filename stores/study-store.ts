"use client";

import {
  defaultProfile,
  exams as defaultExams,
  mathTopics as defaultTopics,
  mistakes as defaultMistakes,
  subjects as defaultSubjects,
  todayTasks as defaultTasks,
} from "@/constants/mock-data";
import { createClient } from "@/lib/supabase/client";
import type { DailyTask, Exam, MistakeRecord, Subject, Topic, UserProfile } from "@/types/study";

const STORAGE_KEYS = {
  tasks: "yks_tasks_v5",
  subjects: "yks_subjects_v5",
  exams: "yks_exams_v5",
  profile: "yks_profile_v5",
  topics: "yks_topics_v5",
  mistakes: "yks_mistakes_v5",
};

let memoryProfile: UserProfile | null = null;
let memorySubjects: Subject[] | null = null;
let memoryTopics: Topic[] | null = null;
let memoryTasks: DailyTask[] | null = null;
let memoryExams: Exam[] | null = null;
let memoryMistakes: MistakeRecord[] | null = null;

function getLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setLocal<T>(key: string, val: T, shouldDispatch = true): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(val));
    if (shouldDispatch) {
      window.dispatchEvent(new Event("study_store_change"));
    }
  } catch (err) {
    console.error("Local storage error:", err);
  }
}

// PROFILE
export function getProfile(): UserProfile {
  if (!memoryProfile) {
    memoryProfile = getLocal<UserProfile>(STORAGE_KEYS.profile, defaultProfile);
  }
  return memoryProfile;
}

export function updateProfile(partial: Partial<UserProfile>): UserProfile {
  const current = getProfile();
  const updated = { ...current, ...partial };
  memoryProfile = updated;
  setLocal(STORAGE_KEYS.profile, updated);

  try {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        supabase
          .from("profiles")
          .upsert({
            id: data.user.id,
            user_id: data.user.id,
            display_name: updated.name,
            target_department: updated.targetDepartment,
            target_university: updated.targetUniversity,
            target_rank: updated.targetRank,
            updated_at: new Date().toISOString(),
          })
          .then();
      }
    });
  } catch {
    // Offline / Supabase unavailable fallback
  }

  return updated;
}

// TASKS
export async function getTodayTasks(): Promise<DailyTask[]> {
  try {
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (userData?.user) {
      const today = new Date().toISOString().slice(0, 10);
      const { data, error } = await supabase
        .from("daily_tasks")
        .select(
          "id, title, description, planned_questions, planned_minutes, status, priority, subjects(name), topics(name)"
        )
        .eq("date", today)
        .order("order");
      if (!error && data && data.length > 0) {
        return (data as Array<Record<string, unknown>>).map((d) => ({
          id: String(d.id),
          title: String(d.title),
          description:
            typeof d.description === "string" && d.description
              ? d.description
              : d.planned_questions
              ? `${d.planned_questions} Soru Hedefi`
              : "Günlük Görev",
          duration: d.planned_minutes ? `${d.planned_minutes} dk` : "45 dk",
          status: (d.status as DailyTask["status"]) || "pending",
          priority: (d.priority as DailyTask["priority"]) || "normal",
          plannedQuestions: Number(d.planned_questions) || 30,
          subject: (d.subjects as { name: string })?.name || "YKS",
          topic: (d.topics as { name: string })?.name || "Çalisma",
        }));
      }
    }
  } catch {
    // Supabase optional fallback
  }

  if (!memoryTasks) {
    memoryTasks = getLocal<DailyTask[]>(STORAGE_KEYS.tasks, defaultTasks);
  }
  return memoryTasks;
}

export async function toggleTaskStatus(taskId: string): Promise<DailyTask[]> {
  const current = await getTodayTasks();
  const nextStatusMap: Record<DailyTask["status"], DailyTask["status"]> = {
    pending: "active",
    active: "completed",
    completed: "pending",
  };

  const updated = current.map((t) =>
    t.id === taskId ? { ...t, status: nextStatusMap[t.status] } : t
  );
  memoryTasks = updated;
  setLocal(STORAGE_KEYS.tasks, updated);

  try {
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (userData?.user) {
      const task = updated.find((t) => t.id === taskId);
      if (task) {
        await supabase.from("daily_tasks").update({ status: task.status }).eq("id", taskId);
      }
    }
  } catch {
    // Ignore remote sync errors in offline mode
  }
  return updated;
}

export async function addDailyTask(task: Omit<DailyTask, "id">): Promise<DailyTask> {
  const newTask: DailyTask = {
    ...task,
    id: "task-" + Date.now(),
  };
  const current = await getTodayTasks();
  const updated = [newTask, ...current];
  memoryTasks = updated;
  setLocal(STORAGE_KEYS.tasks, updated);

  try {
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (userData?.user) {
      await supabase.from("daily_tasks").insert({
        user_id: userData.user.id,
        title: task.subject + ": " + task.topic,
        description: task.description,
        status: task.status,
        priority: task.priority || "normal",
        planned_minutes: parseInt(task.duration) || 45,
        planned_questions: task.plannedQuestions || 30,
      });
    }
  } catch {
    // Local storage acts as backup
  }
  return newTask;
}

export async function addMultipleTasks(tasks: Array<Omit<DailyTask, "id">>): Promise<DailyTask[]> {
  const created: DailyTask[] = tasks.map((t, idx) => ({
    ...t,
    id: "task-" + (Date.now() + idx),
  }));
  const current = await getTodayTasks();
  const updated = [...created, ...current];
  memoryTasks = updated;
  setLocal(STORAGE_KEYS.tasks, updated);
  return updated;
}

export async function deleteTask(taskId: string): Promise<DailyTask[]> {
  const current = await getTodayTasks();
  const updated = current.filter((t) => t.id !== taskId);
  memoryTasks = updated;
  setLocal(STORAGE_KEYS.tasks, updated);
  return updated;
}

// SUBJECTS
export function getSubjects(): Subject[] {
  if (!memorySubjects) {
    const rawSubs = getLocal<Subject[]>(STORAGE_KEYS.subjects, defaultSubjects);
    const allTops = getTopics();
    memorySubjects = rawSubs.map((s) => {
      const sTopics = allTops.filter((t) => t.subjectId === s.id);
      const topicCount = sTopics.length > 0 ? sTopics.length : s.topicCount;
      const completedTopics = sTopics.filter((t) => t.status === "completed").length;
      const progress = topicCount > 0 ? Math.round((completedTopics / topicCount) * 100) : 0;
      return {
        ...s,
        topicCount,
        completedTopics,
        progress,
      };
    });
  }
  return memorySubjects;
}

export function addSubject(subject: Omit<Subject, "id" | "topicCount" | "completedTopics" | "progress">): Subject {
  const current = getSubjects();
  const newSub: Subject = {
    ...subject,
    id: "subj-" + Date.now(),
    topicCount: 0,
    completedTopics: 0,
    progress: 0,
    weeklyQuestions: 0,
  };
  const updated = [...current, newSub];
  memorySubjects = updated;
  setLocal(STORAGE_KEYS.subjects, updated);
  return newSub;
}

// TOPICS
export function getTopics(subjectId?: string): Topic[] {
  if (!memoryTopics) {
    memoryTopics = getLocal<Topic[]>(STORAGE_KEYS.topics, defaultTopics);
  }
  if (subjectId) {
    return memoryTopics.filter((t) => t.subjectId === subjectId);
  }
  return memoryTopics;
}

export function toggleTopicStatus(topicId: string, filterSubjectId?: string): Topic[] {
  if (!memoryTopics) {
    memoryTopics = getLocal<Topic[]>(STORAGE_KEYS.topics, defaultTopics);
  }
  const target = memoryTopics.find((t) => t.id === topicId);
  if (!target) {
    return filterSubjectId ? memoryTopics.filter((t) => t.subjectId === filterSubjectId) : memoryTopics;
  }

  const nextStatus: Topic["status"] =
    target.status === "completed" ? "not_started" : "completed";
  const nextProgress = nextStatus === "completed" ? 100 : 0;

  const updatedTopics = memoryTopics.map((top) => {
    if (top.id === topicId) {
      return { ...top, status: nextStatus, progress: nextProgress };
    }
    return top;
  });

  memoryTopics = updatedTopics;

  // Automatically update parent subject's completed topics count and progress percentage
  const parentSubjectId = filterSubjectId || target.subjectId;
  if (parentSubjectId) {
    const allSubjectTopics = updatedTopics.filter((t) => t.subjectId === parentSubjectId);
    const completedCount = allSubjectTopics.filter((t) => t.status === "completed").length;
    const totalCount = allSubjectTopics.length;
    const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    const subjects = getSubjects();
    const subIdx = subjects.findIndex((s) => s.id === parentSubjectId);
    if (subIdx !== -1) {
      subjects[subIdx].completedTopics = completedCount;
      subjects[subIdx].progress = progressPercent;
      memorySubjects = [...subjects];
      try {
        localStorage.setItem(STORAGE_KEYS.subjects, JSON.stringify(memorySubjects));
      } catch {
        // Safe write
      }
    }
  }

  // Save topics and emit single event
  setLocal(STORAGE_KEYS.topics, updatedTopics, true);

  try {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        supabase
          .from("topics")
          .update({ status: nextStatus })
          .eq("id", topicId)
          .then();
      }
    });
  } catch {
    // Offline sync
  }

  if (filterSubjectId) {
    return updatedTopics.filter((t) => t.subjectId === filterSubjectId);
  }
  return updatedTopics;
}

export function addTopic(topic: { name: string; subjectId: string; total?: number }): Topic {
  const current = getTopics();
  const newTopic: Topic = {
    id: "topic-" + Date.now(),
    name: topic.name,
    completed: 0,
    total: topic.total || 5,
    progress: 0,
    status: "not_started",
    questionCount: 0,
    accuracy: 0,
  };
  const updated = [...current, newTopic];
  memoryTopics = updated;
  setLocal(STORAGE_KEYS.topics, updated);

  const subjects = getSubjects();
  const subIdx = subjects.findIndex((s) => s.id === topic.subjectId);
  if (subIdx !== -1) {
    subjects[subIdx].topicCount += 1;
    memorySubjects = [...subjects];
    setLocal(STORAGE_KEYS.subjects, memorySubjects);
  }

  return newTopic;
}

// EXAMS
export function getExams(): Exam[] {
  if (!memoryExams) {
    memoryExams = getLocal<Exam[]>(STORAGE_KEYS.exams, defaultExams);
  }
  return memoryExams;
}

export function addExam(exam: Omit<Exam, "id">): Exam {
  const current = getExams();
  const newExam: Exam = {
    ...exam,
    id: "exam-" + Date.now(),
  };
  const updated = [newExam, ...current];
  memoryExams = updated;
  setLocal(STORAGE_KEYS.exams, updated);

  try {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: userData }) => {
      if (userData?.user) {
        const { data: insertedExam } = await supabase
          .from("exams")
          .insert({
            user_id: userData.user.id,
            name: exam.name,
            exam_type: exam.type,
            exam_date: exam.date || new Date().toISOString().slice(0, 10),
          })
          .select("id")
          .single();

        if (insertedExam?.id && exam.results && exam.results.length > 0) {
          const resultsToInsert = exam.results.map((r) => ({
            user_id: userData.user.id,
            exam_id: insertedExam.id,
            section: r.section,
            correct: r.correct,
            wrong: r.wrong,
            blank: r.blank,
          }));
          await supabase.from("exam_results").insert(resultsToInsert);
        }
      }
    });
  } catch {
    // Offline sync
  }

  return newExam;
}

// MISTAKES
export function getMistakes(): MistakeRecord[] {
  if (!memoryMistakes) {
    memoryMistakes = getLocal<MistakeRecord[]>(STORAGE_KEYS.mistakes, defaultMistakes);
  }
  return memoryMistakes;
}

export function addMistake(mistake: Omit<MistakeRecord, "id">): MistakeRecord {
  const current = getMistakes();
  const newMistake: MistakeRecord = {
    ...mistake,
    id: "mistake-" + Date.now(),
  };
  const updated = [newMistake, ...current];
  memoryMistakes = updated;
  setLocal(STORAGE_KEYS.mistakes, updated);

  try {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: userData }) => {
      if (userData?.user) {
        await supabase.from("mistakes").insert({
          user_id: userData.user.id,
          reason: mistake.reason,
          note: mistake.note,
          review_date: mistake.date || new Date().toISOString().slice(0, 10),
        });
      }
    });
  } catch {
    // Offline sync
  }

  return newMistake;
}
