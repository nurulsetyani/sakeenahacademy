"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createLesson(courseId: string, formData: FormData) {
  const supabase = await createClient();

  const title = String(formData.get("title") ?? "").trim();
  if (!title) throw new Error("Judul materi wajib diisi");

  const youtubeUrl = String(formData.get("youtube_url") ?? "").trim() || null;
  const pdfUrl = String(formData.get("pdf_url") ?? "").trim() || null;
  const summary = String(formData.get("summary_content") ?? "").trim() || null;
  const durationRaw = formData.get("estimated_duration_minutes");

  const { data: existing } = await supabase
    .from("lessons")
    .select("order_index")
    .eq("course_id", courseId)
    .order("order_index", { ascending: false })
    .limit(1);

  const nextOrder = (existing?.[0]?.order_index ?? -1) + 1;

  const { error } = await supabase.from("lessons").insert({
    course_id: courseId,
    title,
    youtube_url: youtubeUrl,
    pdf_url: pdfUrl,
    summary_content: summary,
    order_index: nextOrder,
    estimated_duration_minutes: durationRaw ? Number(durationRaw) : null,
  });

  if (error) throw new Error(error.message);

  revalidatePath(`/admin/kelas/${courseId}/edit`);
  redirect(`/admin/kelas/${courseId}/edit`);
}

export async function updateLesson(lessonId: string, courseId: string, formData: FormData) {
  const supabase = await createClient();

  const title = String(formData.get("title") ?? "").trim();
  if (!title) throw new Error("Judul materi wajib diisi");

  const youtubeUrl = String(formData.get("youtube_url") ?? "").trim() || null;
  const pdfUrl = String(formData.get("pdf_url") ?? "").trim() || null;
  const summary = String(formData.get("summary_content") ?? "").trim() || null;
  const durationRaw = formData.get("estimated_duration_minutes");

  const { error } = await supabase
    .from("lessons")
    .update({
      title,
      youtube_url: youtubeUrl,
      pdf_url: pdfUrl,
      summary_content: summary,
      estimated_duration_minutes: durationRaw ? Number(durationRaw) : null,
    })
    .eq("id", lessonId);

  if (error) throw new Error(error.message);

  revalidatePath(`/admin/kelas/${courseId}/materi/${lessonId}`);
  revalidatePath(`/admin/kelas/${courseId}/edit`);
}

export async function toggleLessonStatus(lessonId: string, courseId: string, currentStatus: string) {
  const supabase = await createClient();
  const nextStatus = currentStatus === "published" ? "draft" : "published";

  const { error } = await supabase.from("lessons").update({ status: nextStatus }).eq("id", lessonId);
  if (error) throw new Error(error.message);

  revalidatePath(`/admin/kelas/${courseId}/materi/${lessonId}`);
  revalidatePath(`/admin/kelas/${courseId}/edit`);
}
