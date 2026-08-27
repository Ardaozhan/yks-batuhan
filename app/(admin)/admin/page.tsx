import { redirect } from "next/navigation";
import { isAdminSession } from "@/lib/admin-session";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminDashboard } from "@/components/admin/admin-dashboard";

type Profile = {
  user_id: string;
  email?: string | null;
  display_name: string | null;
  target_department: string | null;
  created_at: string;
  last_sign_in_at?: string | null;
};

export default async function AdminPage() {
  if (!(await isAdminSession())) redirect("/admin/login");

  const client = createAdminClient();
  let profiles: Profile[] = [];

  if (client) {
    try {
      // 1. Fetch all registered users from Supabase Auth GoTrue API
      const { data: authData } = await client.auth.admin.listUsers();
      const authUsers = authData?.users ?? [];

      // 2. Try fetching from public.profiles table
      const profileMap: Record<string, { display_name?: string; target_department?: string }> = {};
      try {
        const tableRes = await client
          .from("profiles")
          .select("user_id, display_name, target_department");
        if (tableRes.data) {
          tableRes.data.forEach((p) => {
            if (p.user_id) profileMap[p.user_id] = p;
          });
        }
      } catch {
        // Safe fallback if table permissions are restricted
      }

      // 3. Map Auth users into student accounts
      if (authUsers.length > 0) {
        profiles = authUsers.map((u) => {
          const p = profileMap[u.id];
          const meta = (u.user_metadata ?? {}) as Record<string, unknown>;
          const emailPrefix = u.email ? u.email.split("@")[0] : null;
          const formattedName = emailPrefix
            ? emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1)
            : "Öğrenci";

          const displayName =
            p?.display_name ||
            (meta.display_name as string) ||
            (meta.name as string) ||
            formattedName;

          return {
            user_id: u.id,
            email: u.email ?? null,
            display_name: displayName,
            target_department:
              p?.target_department ||
              (meta.target_department as string) ||
              "YKS Sayısal / Eşit Ağırlık",
            created_at: u.created_at,
            last_sign_in_at: u.last_sign_in_at ?? null,
          };
        });
      } else if (Object.keys(profileMap).length > 0) {
        profiles = Object.entries(profileMap).map(([id, p]) => ({
          user_id: id,
          email: null,
          display_name: p.display_name || "Öğrenci",
          target_department: p.target_department || "YKS",
          created_at: new Date().toISOString(),
        }));
      }
    } catch (err) {
      console.error("Admin student fetching error:", err);
      profiles = [];
    }
  }

  return <AdminDashboard dbProfiles={profiles} />;
}
