import { ExamDetailPage } from "@/components/exams/exam-pages";

export default async function Page({
  params,
}: PageProps<"/exams/[examId]">) {
  const { examId } = await params;
  return <ExamDetailPage examId={examId} />;
}
