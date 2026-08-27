import type { ExamType } from "./study";

export type { ExamType };

export interface ExamSectionResult {
  section: string;
  correct: number;
  wrong: number;
  blank: number;
  net?: number;
}

export interface ExamRecord {
  id: string;
  name: string;
  type: ExamType;
  date: string;
  results: ExamSectionResult[];
  totalNet?: number;
  score?: number;
  durationMinutes?: number;
  notes?: string;
}
