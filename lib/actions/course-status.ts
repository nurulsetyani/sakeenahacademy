"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function toggleCourseStatus(courseId: string, currentStatus: string) {
  const supabase = await createClient();
  const nextStatus = currentStatus === "published" ? "draft" : "published";

  await supabase.from("courses").update({ status: nextStatus }).eq("id", courseId);

  revalidatePath("/guru/kelas");
  revalidatePath(`/guru/kelas/${courseId}/edit`);
}
