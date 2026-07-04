"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createTahsinSchedule(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Tidak diizinkan");

  const courseId = String(formData.get("course_id") ?? "");
  const sessionDate = String(formData.get("session_date") ?? "");
  const startTime = String(formData.get("start_time") ?? "");
  const endTime = String(formData.get("end_time") ?? "");
  const location = String(formData.get("location_or_link") ?? "").trim() || null;

  if (!courseId || !sessionDate || !startTime || !endTime) {
    throw new Error("Semua field wajib diisi");
  }

  const { error } = await supabase.from("tahsin_schedules").insert({
    course_id: courseId,
    teacher_id: user.id,
    session_date: sessionDate,
    start_time: startTime,
    end_time: endTime,
    location_or_link: location,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/guru/tahsin");
}

export async function saveTahsinSession(scheduleId: string, studentId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Tidak diizinkan");

  const attendanceStatus = String(formData.get("attendance_status") ?? "tidak_hadir") as
    | "hadir"
    | "tidak_hadir"
    | "izin"
    | "sakit";

  const { error: attendanceError } = await supabase
    .from("tahsin_attendance")
    .upsert(
      { schedule_id: scheduleId, student_id: studentId, status: attendanceStatus },
      { onConflict: "schedule_id,student_id" }
    );
  if (attendanceError) throw new Error(attendanceError.message);

  const makhraj = formData.get("makhraj_score");
  const tajwid = formData.get("tajwid_score");
  const kelancaran = formData.get("kelancaran_score");
  const overallGrade = String(formData.get("overall_grade") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;

  const hasAssessment = makhraj || tajwid || kelancaran || overallGrade || notes;

  if (hasAssessment) {
    const { error: assessmentError } = await supabase.from("tahsin_assessments").upsert(
      {
        schedule_id: scheduleId,
        student_id: studentId,
        teacher_id: user.id,
        makhraj_score: makhraj ? Number(makhraj) : null,
        tajwid_score: tajwid ? Number(tajwid) : null,
        kelancaran_score: kelancaran ? Number(kelancaran) : null,
        overall_grade: overallGrade,
        notes,
      },
      { onConflict: "schedule_id,student_id" }
    );
    if (assessmentError) throw new Error(assessmentError.message);
  }

  revalidatePath(`/guru/tahsin/${scheduleId}`);
}
