import { AppShell } from "@/components/navigation/app-shell";
import { ProfilePage } from "@/components/profile/profile-page";

export default function Page() {
  return (
    <AppShell>
      <ProfilePage />
    </AppShell>
  );
}
