"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createLiveSession(formData: FormData) {
  const supabase = await createClient();

  const courseId = String(formData.get("course_id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const platform = String(formData.get("platform") ?? "zoom") as "zoom" | "google_meet";
  const meetingLink = String(formData.get("meeting_link") ?? "").trim() || null;
  const scheduledAtRaw = String(formData.get("scheduled_at") ?? "");
  const duration = Number(formData.get("duration_minutes") ?? 60);

  if (!courseId || !title || !scheduledAtRaw) {
    throw new Error("Semua field wajib diisi");
  }

  const { error } = await supabase.from("live_sessions").insert({
    course_id: courseId,
    title,
    platform,
    meeting_link: meetingLink,
    scheduled_at: new Date(scheduledAtRaw).toISOString(),
    duration_minutes: duration,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/admin/live-class");
}

export async function updateLiveSession(sessionId: string, formData: FormData) {
  const supabase = await createClient();

  const status = String(formData.get("status") ?? "terjadwal") as
    | "terjadwal"
    | "berlangsung"
    | "selesai"
    | "dibatalkan";
  const recordingUrl = String(formData.get("recording_url") ?? "").trim() || null;

  const { error } = await supabase
    .from("live_sessions")
    .update({ status, recording_url: recordingUrl })
    .eq("id", sessionId);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/live-class");
  revalidatePath(`/admin/live-class/${sessionId}`);
}

export async function saveLiveAttendance(sessionId: string, studentId: string, formData: FormData) {
  const supabase = await createClient();

  const status = String(formData.get("attendance_status") ?? "tidak_hadir") as
    | "hadir"
    | "tidak_hadir"
    | "izin"
    | "sakit";

  const { error } = await supabase
    .from("live_session_attendance")
    .upsert({ session_id: sessionId, student_id: studentId, status }, { onConflict: "session_id,student_id" });

  if (error) throw new Error(error.message);

  revalidatePath(`/admin/live-class/${sessionId}`);
}

export async function selfCheckIn(sessionId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Tidak diizinkan");

  const { error } = await supabase.from("live_session_attendance").upsert(
    { session_id: sessionId, student_id: user.id, status: "hadir", checked_in_at: new Date().toISOString() },
    { onConflict: "session_id,student_id" }
  );

  if (error) throw new Error(error.message);

  revalidatePath("/murid/jadwal");
}
