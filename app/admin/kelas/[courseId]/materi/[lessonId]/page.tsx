import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateLesson, toggleLessonStatus } from "@/lib/actions/lessons";

export default async function AdminEditMateriPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>;
}) {
  const { courseId, lessonId } = await params;
  const supabase = await createClient();

  const { data: lesson } = await supabase
    .from("lessons")
    .select("id, title, youtube_url, pdf_url, summary_content, estimated_duration_minutes, status")
    .eq("id", lessonId)
    .eq("course_id", courseId)
    .single();

  if (!lesson) notFound();

  return (
    <div className="max-w-xl">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-brand-900">{lesson.title}</h1>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${lesson.status === "published" ? "bg-brand-50 text-brand-700" : "bg-parchment-200 text-parchment-600"}`}>
          {lesson.status}
        </span>
      </div>

      <form action={updateLesson.bind(null, lessonId, courseId)} className="card-surface mt-6 space-y-4 p-6">
        <div>
          <label htmlFor="title" className="field-label">Judul Materi</label>
          <input id="title" name="title" required defaultValue={lesson.title} className="field-input" />
        </div>
        <div>
          <label htmlFor="youtube_url" className="field-label">Link Video YouTube</label>
          <input id="youtube_url" name="youtube_url" type="url" defaultValue={lesson.youtube_url ?? ""} className="field-input" />
        </div>
        <div>
          <label htmlFor="pdf_url" className="field-label">Link PDF</label>
          <input id="pdf_url" name="pdf_url" type="url" defaultValue={lesson.pdf_url ?? ""} className="field-input" />
        </div>
        <div>
          <label htmlFor="estimated_duration_minutes" className="field-label">Estimasi Durasi (menit)</label>
          <input
            id="estimated_duration_minutes"
            name="estimated_duration_minutes"
            type="number"
            min={1}
            defaultValue={lesson.estimated_duration_minutes ?? ""}
            className="field-input"
          />
        </div>
        <div>
          <label htmlFor="summary_content" className="field-label">Ringkasan Materi</label>
          <textarea id="summary_content" name="summary_content" rows={5} defaultValue={lesson.summary_content ?? ""} className="field-input" />
        </div>
        <button type="submit" className="btn-primary !px-5 !py-2.5 text-sm">Simpan Perubahan</button>
      </form>

      <form action={toggleLessonStatus.bind(null, lessonId, courseId, lesson.status)} className="mt-4">
        <button type="submit" className="btn-secondary">
          {lesson.status === "published" ? "Jadikan Draft" : "Publish Materi"}
        </button>
      </form>
    </div>
  );
}
