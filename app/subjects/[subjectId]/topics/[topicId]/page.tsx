import { AppShell } from "@/components/navigation/app-shell";
import { TopicDetailPage } from "@/components/subjects/subject-pages";

export default async function Page({
  params,
}: PageProps<"/subjects/[subjectId]/topics/[topicId]">) {
  const { subjectId, topicId } = await params;
  return (
    <AppShell>
      <TopicDetailPage subjectId={subjectId} topicId={topicId} />
    </AppShell>
  );
}
