"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { normalizePhone, isValidIndonesianPhone } from "@/lib/phone";

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Tidak diizinkan");

  const phone = normalizePhone(String(formData.get("phone") ?? ""));
  if (!isValidIndonesianPhone(phone)) {
    throw new Error("Nomor HP tidak valid");
  }

  await supabase
    .from("profiles")
    .update({
      full_name: String(formData.get("full_name") ?? ""),
      phone,
      address: String(formData.get("address") ?? "") || null,
    })
    .eq("id", user.id);

  revalidatePath("/murid/profil");
  revalidatePath("/guru/profil");
  revalidatePath("/admin/profil");
}
