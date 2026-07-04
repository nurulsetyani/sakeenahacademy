import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { markLessonComplete } from "@/lib/actions/learning";

function toEmbedUrl(youtubeUrl: string) {
  const match = youtubeUrl.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

export default async function LihatMateriPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>;
}) {
  const { courseId, lessonId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("id, status")
    .eq("student_id", user!.id)
    .eq("course_id", courseId)
    .single();

  if (!enrollment || (enrollment.status !== "active" && enrollment.status !== "completed")) notFound();

  const { data: lesson } = await supabase
    .from("lessons")
    .select("id, title, youtube_url, pdf_url, summary_content")
    .eq("id", lessonId)
    .eq("course_id", courseId)
    .eq("status", "published")
    .single();

  if (!lesson) notFound();

  const { data: progressRow } = await supabase
    .from("lesson_progress")
    .select("status")
    .eq("enrollment_id", enrollment.id)
    .eq("lesson_id", lessonId)
    .maybeSingle();

  const { data: quiz } = await supabase
    .from("quizzes")
    .select("id, status")
    .eq("lesson_id", lessonId)
    .eq("status", "published")
    .maybeSingle();

  const isDone = progressRow?.status === "selesai";
  const embedUrl = lesson.youtube_url ? toEmbedUrl(lesson.youtube_url) : null;

  return (
    <div className="max-w-xl">
      <h1 className="font-display text-2xl font-semibold text-brand-900">{lesson.title}</h1>

      {embedUrl && (
        <div className="mt-5 aspect-video overflow-hidden rounded-2xl">
          <iframe src={embedUrl} className="h-full w-full" allowFullScreen title={lesson.title} />
        </div>
      )}

      {lesson.summary_content && (
        <p className="mt-5 whitespace-pre-line text-sm leading-[1.7] text-parchment-700">{lesson.summary_content}</p>
      )}

      {lesson.pdf_url && (
        <a href={lesson.pdf_url} target="_blank" rel="noreferrer" className="mt-4 inline-block text-sm font-semibold text-brand-700 underline hover:text-brand-600">
          Unduh PDF Materi
        </a>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-3">
        {isDone ? (
          <span className="rounded-full bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700">Materi Selesai</span>
        ) : (
          <form action={markLessonComplete.bind(null, lessonId, enrollment.id, courseId)}>
            <button type="submit" className="btn-primary !px-5 !py-2.5 text-sm">Tandai Selesai</button>
          </form>
        )}

        {quiz && (
          <Link href={`/murid/kelas-saya/${courseId}/quiz/${quiz.id}`} className="btn-secondary !px-5 !py-2.5 text-sm">
            Kerjakan Quiz
          </Link>
        )}
      </div>
    </div>
  );
}
