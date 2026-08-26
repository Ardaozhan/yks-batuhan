import { AppShell } from "@/components/navigation/app-shell";
import { SubjectDetailPage } from "@/components/subjects/subject-pages";
export default async function Page({ params }: PageProps<"/subjects/[subjectId]">) { const { subjectId } = await params; return <AppShell><SubjectDetailPage subjectId={subjectId} /></AppShell>; }
