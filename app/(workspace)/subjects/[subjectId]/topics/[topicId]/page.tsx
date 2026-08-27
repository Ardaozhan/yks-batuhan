import { TopicDetailPage } from "@/components/subjects/subject-pages";

export default async function Page({
  params,
}: PageProps<"/subjects/[subjectId]/topics/[topicId]">) {
  const { subjectId, topicId } = await params;
  return <TopicDetailPage subjectId={subjectId} topicId={topicId} />;
}
