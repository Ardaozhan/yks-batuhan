"use client";

import { defaultProfile, exams as defaultExams, mathTopics as defaultTopics, mistakes as defaultMistakes, subjects as defaultSubjects, todayTasks as defaultTasks } from "@/lib/mock-data";
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

function getLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setLocal<T>(key: string, val: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(val));
    window.dispatchEvent(new Event("study_store_change"));
  } catch (err) {
    console.error("Local storage error:", err);
  }
}

// PROFILE
export function getProfile(): UserProfile {
  return getLocal<UserProfile>(STORAGE_KEYS.profile, defaultProfile);
}

export function updateProfile(partial: Partial<UserProfile>): UserProfile {
  const current = getProfile();
  const updated = { ...current, ...partial };
  setLocal(STORAGE_KEYS.profile, updated);
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
        .select("id, title, description, planned_questions, planned_minutes, status, priority, subjects(name), topics(name)")
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
          status: d.status as DailyTask["status"],
          priority: (d.priority as DailyTask["priority"]) || "normal",
          plannedQuestions: typeof d.planned_questions === "number" ? d.planned_questions : undefined,
          subject:
            Array.isArray(d.subjects) && typeof d.subjects[0]?.name === "string"
              ? d.subjects[0].name
              : d.subjects && typeof (d.subjects as { name?: unknown }).name === "string"
              ? ((d.subjects as { name: string }).name)
              : "Genel",
          topic:
            Array.isArray(d.topics) && typeof d.topics[0]?.name === "string"
              ? d.topics[0].name
              : d.topics && typeof (d.topics as { name?: unknown }).name === "string"
              ? ((d.topics as { name: string }).name)
              : "",
        }));
      }
    }
  } catch {
    // fallback to local
  }
  return getLocal<DailyTask[]>(STORAGE_KEYS.tasks, defaultTasks);
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
  setLocal(STORAGE_KEYS.tasks, updated);
  return updated;
}

export async function deleteTask(taskId: string): Promise<DailyTask[]> {
  const current = await getTodayTasks();
  const updated = current.filter((t) => t.id !== taskId);
  setLocal(STORAGE_KEYS.tasks, updated);
  return updated;
}

// SUBJECTS
export function getSubjects(): Subject[] {
  return getLocal<Subject[]>(STORAGE_KEYS.subjects, defaultSubjects);
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
  setLocal(STORAGE_KEYS.subjects, updated);
  return newSub;
}

export function getTopics(subjectId?: string): Topic[] {
  const topics = getLocal<Topic[]>(STORAGE_KEYS.topics, defaultTopics);
  if (subjectId) {
    return topics.filter((t) => !t.subjectId || t.subjectId === subjectId);
  }
  return topics;
}

export function toggleTopicStatus(topicId: string): Topic[] {
  const topics = getLocal<Topic[]>(STORAGE_KEYS.topics, defaultTopics);
  const target = topics.find((t) => t.id === topicId);
  if (!target) return topics;

  const nextStatus: Topic["status"] =
    target.status === "completed" ? "not_started" : "completed";
  const nextProgress = nextStatus === "completed" ? 100 : 0;

  const updated = topics.map((top) => {
    if (top.id === topicId) {
      return { ...top, status: nextStatus, progress: nextProgress };
    }
    return top;
  });
  setLocal(STORAGE_KEYS.topics, updated);

  // Automatically update parent subject's completed topics count and progress percentage
  if (target.subjectId) {
    const allSubjectTopics = updated.filter((t) => t.subjectId === target.subjectId);
    const completedCount = allSubjectTopics.filter((t) => t.status === "completed").length;
    const totalCount = allSubjectTopics.length;
    const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    const subjects = getSubjects();
    const subIdx = subjects.findIndex((s) => s.id === target.subjectId);
    if (subIdx !== -1) {
      subjects[subIdx].completedTopics = completedCount;
      subjects[subIdx].progress = progressPercent;
      setLocal(STORAGE_KEYS.subjects, [...subjects]);
    }
  }

  return updated;
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
  setLocal(STORAGE_KEYS.topics, updated);

  // Update topic count in subject
  const subjects = getSubjects();
  const subIdx = subjects.findIndex((s) => s.id === topic.subjectId);
  if (subIdx !== -1) {
    subjects[subIdx].topicCount += 1;
    setLocal(STORAGE_KEYS.subjects, [...subjects]);
  }

  return newTopic;
}

// EXAMS
export function getExams(): Exam[] {
  return getLocal<Exam[]>(STORAGE_KEYS.exams, defaultExams);
}

export function addExam(exam: Omit<Exam, "id">): Exam {
  const current = getExams();
  const newExam: Exam = {
    ...exam,
    id: "exam-" + Date.now(),
  };
  const updated = [newExam, ...current];
  setLocal(STORAGE_KEYS.exams, updated);
  return newExam;
}

// MISTAKES
export function getMistakes(): MistakeRecord[] {
  return getLocal<MistakeRecord[]>(STORAGE_KEYS.mistakes, defaultMistakes);
}

export function addMistake(mistake: Omit<MistakeRecord, "id">): MistakeRecord {
  const current = getMistakes();
  const newMistake: MistakeRecord = {
    ...mistake,
    id: "mistake-" + Date.now(),
  };
  const updated = [newMistake, ...current];
  setLocal(STORAGE_KEYS.mistakes, updated);
  return newMistake;
}

