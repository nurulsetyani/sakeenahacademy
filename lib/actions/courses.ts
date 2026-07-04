"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function slugify(title: string) {
  return (
    title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-") +
    "-" +
    Math.random().toString(36).slice(2, 7)
  );
}

export async function createCourse(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Tidak diizinkan");

  const title = String(formData.get("title") ?? "");
  const accessType = String(formData.get("access_type") ?? "gratis");
  const price = accessType === "berbayar" ? Number(formData.get("price") ?? 0) : 0;

  const { data: course, error } = await supabase
    .from("courses")
    .insert({
      title,
      slug: slugify(title),
      description: String(formData.get("description") ?? "") || null,
      category_id: String(formData.get("category_id") ?? "") || null,
      teacher_id: user.id,
      program_type: String(formData.get("program_type") ?? "reguler") as "reguler" | "tahsin" | "tahfidz",
      access_type: accessType as "gratis" | "berbayar",
      price,
      status: "draft",
    })
    .select("id")
    .single();

  if (error || !course) {
    throw new Error(error?.message ?? "Gagal membuat kelas");
  }

  redirect(`/guru/kelas/${course.id}/edit`);
}
