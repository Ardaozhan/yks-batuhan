import { redirect } from "next/navigation";
import { isAdminSession } from "@/lib/admin-session";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminDashboard } from "@/components/admin/admin-dashboard";

type Profile = {
  user_id: string;
  display_name: string | null;
  target_department: string | null;
  created_at: string;
};

export default async function AdminPage() {
  if (!(await isAdminSession())) redirect("/admin/login");

  const client = createAdminClient();
  let profiles: Profile[] = [];

  if (client) {
    try {
      const result = await client
        .from("profiles")
        .select("user_id, display_name, target_department, created_at")
        .order("created_at", { ascending: false });
      profiles = (result.data ?? []) as Profile[];
    } catch {
      profiles = [];
    }
  }

  return <AdminDashboard dbProfiles={profiles} />;
}
