export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface DatabaseProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  target_department: string | null;
  target_university: string | null;
  target_rank: number | null;
  exam_type: string | null;
  created_at: string;
  updated_at: string;
}
