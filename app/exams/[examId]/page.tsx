import { AppShell } from "@/components/navigation/app-shell";
import { ExamDetailPage } from "@/components/exams/exam-pages";
export default async function Page({ params }: PageProps<"/exams/[examId]">) { const { examId } = await params; return <AppShell><ExamDetailPage examId={examId} /></AppShell>; }
