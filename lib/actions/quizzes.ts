"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createLessonQuiz(courseId: string, lessonId: string) {
  const supabase = await createClient();

  const { data: lesson } = await supabase.from("lessons").select("title").eq("id", lessonId).single();

  const { data: quiz, error } = await supabase
    .from("quizzes")
    .insert({
      course_id: courseId,
      lesson_id: lessonId,
      title: `Quiz — ${lesson?.title ?? "Materi"}`,
      quiz_type: "quiz_materi",
    })
    .select("id")
    .single();

  if (error || !quiz) throw new Error(error?.message ?? "Gagal membuat quiz");

  redirect(`/guru/kelas/${courseId}/quiz/${quiz.id}`);
}

export async function createExamQuiz(courseId: string, formData: FormData) {
  const supabase = await createClient();

  const title = String(formData.get("title") ?? "").trim();
  if (!title) throw new Error("Judul ujian wajib diisi");

  const { data: quiz, error } = await supabase
    .from("quizzes")
    .insert({
      course_id: courseId,
      lesson_id: null,
      title,
      quiz_type: "ujian_akhir",
    })
    .select("id")
    .single();

  if (error || !quiz) throw new Error(error?.message ?? "Gagal membuat ujian");

  redirect(`/guru/kelas/${courseId}/quiz/${quiz.id}`);
}

export async function updateQuizSettings(quizId: string, courseId: string, formData: FormData) {
  const supabase = await createClient();

  const title = String(formData.get("title") ?? "").trim();
  const passingGrade = Number(formData.get("passing_grade") ?? 70);
  const timeLimitRaw = formData.get("time_limit_minutes");
  const maxAttempts = Number(formData.get("max_attempts") ?? 1);

  if (!title) throw new Error("Judul wajib diisi");

  const { error } = await supabase
    .from("quizzes")
    .update({
      title,
      passing_grade: passingGrade,
      time_limit_minutes: timeLimitRaw ? Number(timeLimitRaw) : null,
      max_attempts: maxAttempts,
    })
    .eq("id", quizId);

  if (error) throw new Error(error.message);

  revalidatePath(`/guru/kelas/${courseId}/quiz/${quizId}`);
}

export async function toggleQuizStatus(quizId: string, courseId: string, currentStatus: string) {
  const supabase = await createClient();
  const nextStatus = currentStatus === "published" ? "draft" : "published";

  const { error } = await supabase.from("quizzes").update({ status: nextStatus }).eq("id", quizId);
  if (error) throw new Error(error.message);

  revalidatePath(`/guru/kelas/${courseId}/quiz/${quizId}`);
  revalidatePath(`/guru/kelas/${courseId}`);
}

export async function addQuizQuestion(quizId: string, courseId: string, formData: FormData) {
  const supabase = await createClient();

  const questionText = String(formData.get("question_text") ?? "").trim();
  const points = Number(formData.get("points") ?? 1);
  const correctIndex = String(formData.get("correct_option") ?? "0");

  if (!questionText) throw new Error("Pertanyaan wajib diisi");

  const options = [0, 1, 2, 3]
    .map((i) => ({ text: String(formData.get(`option_${i}`) ?? "").trim(), isCorrect: String(i) === correctIndex }))
    .filter((opt) => opt.text.length > 0);

  if (options.length < 2) throw new Error("Minimal 2 opsi jawaban");

  const { data: existing } = await supabase
    .from("quiz_questions")
    .select("order_index")
    .eq("quiz_id", quizId)
    .order("order_index", { ascending: false })
    .limit(1);

  const nextOrder = (existing?.[0]?.order_index ?? -1) + 1;

  const { data: question, error: questionError } = await supabase
    .from("quiz_questions")
    .insert({
      quiz_id: quizId,
      question_text: questionText,
      question_type: "pilihan_tunggal",
      points,
      order_index: nextOrder,
    })
    .select("id")
    .single();

  if (questionError || !question) throw new Error(questionError?.message ?? "Gagal menambah soal");

  const { error: optionsError } = await supabase.from("quiz_options").insert(
    options.map((opt, i) => ({
      question_id: question.id,
      option_text: opt.text,
      is_correct: opt.isCorrect,
      order_index: i,
    }))
  );

  if (optionsError) throw new Error(optionsError.message);

  revalidatePath(`/guru/kelas/${courseId}/quiz/${quizId}`);
}

export async function deleteQuizQuestion(questionId: string, quizId: string, courseId: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("quiz_questions").delete().eq("id", questionId);
  if (error) throw new Error(error.message);

  revalidatePath(`/guru/kelas/${courseId}/quiz/${quizId}`);
}
