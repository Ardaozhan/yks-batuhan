export type CoachMode = "strategy" | "tutor" | "motivation" | "planner";

export interface CoachCard {
  title: string;
  desc?: string;
  action?: string;
  badge?: string;
  type?: "task" | "topic" | "exam" | "tip";
  payload?: Record<string, unknown>;
}

export interface CoachMessage {
  id: string;
  sender: "user" | "coach";
  text: string;
  cards?: CoachCard[];
  quickReplies?: string[];
  timestamp?: string;
}

export interface CoachChatRequest {
  message: string;
  mode?: CoachMode;
  context?: {
    profile?: Record<string, unknown>;
    streakDays?: number;
    targetNet?: number;
    recentExams?: Array<Record<string, unknown>>;
  };
}

export interface CoachChatResponse {
  reply: string;
  cards?: CoachCard[];
  quickReplies?: string[];
}
