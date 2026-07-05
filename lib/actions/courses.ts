"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
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

  const title = String(formData.get("title") ?? "");
  const accessType = String(formData.get("access_type") ?? "gratis");
  const price = accessType === "berbayar" ? Number(formData.get("price") ?? 0) : 0;
  const teacherId = String(formData.get("teacher_id") ?? "");

  if (!teacherId) throw new Error("Guru penanggung jawab wajib dipilih");

  const { data: course, error } = await supabase
    .from("courses")
    .insert({
      title,
      slug: slugify(title),
      description: String(formData.get("description") ?? "") || null,
      category_id: String(formData.get("category_id") ?? "") || null,
      teacher_id: teacherId,
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

  redirect(`/admin/kelas/${course.id}/edit`);
}

export async function updateCourse(courseId: string, formData: FormData) {
  const supabase = await createClient();

  const title = String(formData.get("title") ?? "").trim();
  if (!title) throw new Error("Judul kelas wajib diisi");

  const accessType = String(formData.get("access_type") ?? "gratis") as "gratis" | "berbayar";
  const price = accessType === "berbayar" ? Number(formData.get("price") ?? 0) : 0;
  const teacherId = String(formData.get("teacher_id") ?? "");

  if (!teacherId) throw new Error("Guru penanggung jawab wajib dipilih");

  const { error } = await supabase
    .from("courses")
    .update({
      title,
      description: String(formData.get("description") ?? "").trim() || null,
      category_id: String(formData.get("category_id") ?? "") || null,
      teacher_id: teacherId,
      program_type: String(formData.get("program_type") ?? "reguler") as "reguler" | "tahsin" | "tahfidz",
      access_type: accessType,
      price,
    })
    .eq("id", courseId);

  if (error) throw new Error(error.message);

  revalidatePath(`/admin/kelas/${courseId}/edit`);
  revalidatePath("/admin/kelas");
}
