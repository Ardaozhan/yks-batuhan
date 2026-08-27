export type TaskStatus = "pending" | "active" | "completed";
export type TaskPriority = "high" | "normal" | "low";
export type TopicStatus = "not_started" | "in_progress" | "completed";
export type ExamType = "TYT" | "AYT";

export type DailyTask = {
  id: string;
  subject: string;
  topic: string;
  description: string;
  duration: string;
  status: TaskStatus;
  priority?: TaskPriority;
  plannedQuestions?: number;
};

export type Subject = {
  id: string;
  name: string;
  examType: "TYT" | "AYT" | "Other";
  topicCount: number;
  completedTopics: number;
  progress: number;
  weeklyQuestions?: number;
};

export type Topic = {
  id: string;
  name: string;
  subjectId?: string;
  completed: number;
  total: number;
  progress: number;
  status: TopicStatus;
  notes?: string;
  questionCount?: number;
  accuracy?: number;
};

export type ExamResult = {
  section: string;
  correct: number;
  wrong: number;
  blank: number;
};

export type Exam = {
  id: string;
  name: string;
  type: ExamType;
  date: string;
  results: ExamResult[];
};

export type UserProfile = {
  name: string;
  targetDepartment: string;
  targetUniversity: string;
  targetRank: number;
  examType: "TYT" | "AYT" | "TYT+AYT";
  dayCount: number;
  totalDays: number;
  streakDays: number;
  totalQuestionsSolved: number;
  totalHoursStudied: number;
  examTargetNet: number;
};

export type StudySession = {
  id: string;
  subject: string;
  topic?: string;
  totalQuestions: number;
  correct: number;
  wrong: number;
  blank: number;
  duration: number;
  studiedAt: string;
};

export type MistakeRecord = {
  id: string;
  subject: string;
  topic?: string;
  reason: "concept" | "attention" | "calculation" | "time" | "other";
  note: string;
  date: string;
};
