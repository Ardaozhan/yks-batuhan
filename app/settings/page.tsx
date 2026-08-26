import { AppShell } from "@/components/navigation/app-shell";
import { SettingsPage } from "@/components/settings/settings-page";

export default function Page() {
  return (
    <AppShell>
      <SettingsPage />
    </AppShell>
  );
}
