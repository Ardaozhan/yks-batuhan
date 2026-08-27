import { AppShell } from "@/components/navigation/app-shell";

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
