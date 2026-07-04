"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function markLessonComplete(lessonId: string, enrollmentId: string, courseId: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("lesson_progress").upsert(
    { enrollment_id: enrollmentId, lesson_id: lessonId, status: "selesai", completed_at: new Date().toISOString() },
    { onConflict: "enrollment_id,lesson_id" }
  );
  if (error) throw new Error(error.message);

  revalidatePath(`/murid/kelas-saya/${courseId}`);
  revalidatePath(`/murid/kelas-saya/${courseId}/materi/${lessonId}`);
}

export async function startQuizAttempt(quizId: string, redirectPath: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Tidak diizinkan");

  const { error } = await supabase.from("quiz_attempts").insert({
    quiz_id: quizId,
    student_id: user.id,
  });
  if (error) throw new Error(error.message);

  revalidatePath(redirectPath);
  redirect(redirectPath);
}

export async function submitQuizAnswers(attemptId: string, quizId: string, redirectPath: string, formData: FormData) {
  const supabase = await createClient();

  const { data: questions } = await supabase.from("quiz_questions").select("id").eq("quiz_id", quizId);

  for (const q of questions ?? []) {
    const selectedOptionId = String(formData.get(q.id) ?? "").trim() || null;
    const { error } = await supabase.from("quiz_attempt_answers").upsert(
      { attempt_id: attemptId, question_id: q.id, selected_option_id: selectedOptionId },
      { onConflict: "attempt_id,question_id" }
    );
    if (error) throw new Error(error.message);
  }

  const { error: submitError } = await supabase.rpc("submit_quiz_attempt", { p_attempt_id: attemptId });
  if (submitError) throw new Error(submitError.message);

  revalidatePath(redirectPath);
  redirect(redirectPath);
}
