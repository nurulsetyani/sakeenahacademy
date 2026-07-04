"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

// enrolled_at is a real, nullable column, but the generated Insert type omits it
// (it's normally only set by the payment-approval trigger for paid courses). Free
// courses have no such trigger, so we set it ourselves and bypass the stale type here.
type EnrollmentInsert = Database["public"]["Tables"]["enrollments"]["Insert"] & {
  enrolled_at?: string | null;
};

export async function enrollFreeCourse(courseId: string, slug: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirect=/kelas/${slug}`);
  }

  const { data: course } = await supabase
    .from("courses")
    .select("access_type")
    .eq("id", courseId)
    .single();

  if (course?.access_type !== "gratis") {
    throw new Error("Kelas ini bukan kelas gratis");
  }

  const { data: existing } = await supabase
    .from("enrollments")
    .select("id")
    .eq("student_id", user.id)
    .eq("course_id", courseId)
    .maybeSingle();

  if (!existing) {
    const payload: EnrollmentInsert = {
      student_id: user.id,
      course_id: courseId,
      status: "active",
      enrolled_at: new Date().toISOString(),
    };
    const { error } = await supabase
      .from("enrollments")
      .insert(payload as unknown as Database["public"]["Tables"]["enrollments"]["Insert"]);
    if (error) throw new Error(error.message);
  }

  redirect("/murid/kelas-saya");
}
