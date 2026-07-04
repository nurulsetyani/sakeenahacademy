"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createTahfidzTarget(courseId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Tidak diizinkan");

  const studentId = String(formData.get("student_id") ?? "");
  const surah = String(formData.get("surah") ?? "").trim();
  const ayatStart = Number(formData.get("ayat_start") ?? 0);
  const ayatEnd = Number(formData.get("ayat_end") ?? 0);
  const targetDate = String(formData.get("target_date") ?? "").trim() || null;

  if (!studentId || !surah || !ayatStart || !ayatEnd) {
    throw new Error("Semua field wajib diisi");
  }

  const { error } = await supabase.from("tahfidz_targets").insert({
    course_id: courseId,
    student_id: studentId,
    assigned_by: user.id,
    surah,
    ayat_start: ayatStart,
    ayat_end: ayatEnd,
    target_date: targetDate,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/guru/tahfidz");
}

export async function recordTahfidzSetoran(courseId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Tidak diizinkan");

  const studentId = String(formData.get("student_id") ?? "");
  const surah = String(formData.get("surah") ?? "").trim();
  const ayatStart = Number(formData.get("ayat_start") ?? 0);
  const ayatEnd = Number(formData.get("ayat_end") ?? 0);
  const status = String(formData.get("status") ?? "lancar") as "lancar" | "perlu_perbaikan" | "mengulang";
  const scoreRaw = formData.get("score");
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!studentId || !surah || !ayatStart || !ayatEnd) {
    throw new Error("Semua field wajib diisi");
  }

  const { error } = await supabase.from("tahfidz_setoran").insert({
    course_id: courseId,
    student_id: studentId,
    teacher_id: user.id,
    surah,
    ayat_start: ayatStart,
    ayat_end: ayatEnd,
    status,
    score: scoreRaw ? Number(scoreRaw) : null,
    notes,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/guru/tahfidz");
}
