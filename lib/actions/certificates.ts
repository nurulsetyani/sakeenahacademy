"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function toggleCertificateStatus(certificateId: string, currentStatus: string) {
  const supabase = await createClient();
  const nextStatus = currentStatus === "aktif" ? "revoked" : "aktif";

  const { error } = await supabase.from("certificates").update({ status: nextStatus }).eq("id", certificateId);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/sertifikat");
}

export async function createCertificateTemplate(formData: FormData) {
  const supabase = await createClient();

  const name = String(formData.get("name") ?? "").trim();
  const categoryId = String(formData.get("category_id") ?? "").trim() || null;

  if (!name) throw new Error("Nama template wajib diisi");

  const { error } = await supabase.from("certificate_templates").insert({ name, category_id: categoryId });
  if (error) throw new Error(error.message);

  revalidatePath("/admin/sertifikat/template");
}

export async function toggleCertificateTemplateActive(templateId: string, currentActive: boolean) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("certificate_templates")
    .update({ is_active: !currentActive })
    .eq("id", templateId);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/sertifikat/template");
}
