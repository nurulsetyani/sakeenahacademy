"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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
    const { error } = await supabase.from("enrollments").insert({
      student_id: user.id,
      course_id: courseId,
      status: "active",
      enrolled_at: new Date().toISOString(),
    });
    if (error) throw new Error(error.message);
  }

  redirect("/murid/kelas-saya");
}
