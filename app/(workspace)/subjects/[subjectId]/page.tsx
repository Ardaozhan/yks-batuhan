import { SubjectDetailPage } from "@/components/subjects/subject-pages";

export default async function Page({
  params,
}: PageProps<"/subjects/[subjectId]">) {
  const { subjectId } = await params;
  return <SubjectDetailPage subjectId={subjectId} />;
}
