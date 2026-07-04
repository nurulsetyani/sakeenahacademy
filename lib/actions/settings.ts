"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createBankChannel(formData: FormData) {
  const supabase = await createClient();

  const bankName = String(formData.get("bank_name") ?? "").trim();
  const accountNumber = String(formData.get("account_number") ?? "").trim();
  const accountHolder = String(formData.get("account_holder") ?? "").trim();

  if (!bankName || !accountNumber || !accountHolder) {
    throw new Error("Semua field wajib diisi");
  }

  const { error } = await supabase.from("payment_channels").insert({
    type: "transfer_bank",
    bank_name: bankName,
    account_number: accountNumber,
    account_holder: accountHolder,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/admin/pengaturan");
}

export async function createQrisChannel(formData: FormData) {
  const supabase = await createClient();

  const file = formData.get("qris_image");
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Gambar QRIS wajib diunggah");
  }

  const extension = file.name.split(".").pop() ?? "png";
  const objectPath = `qris-${Date.now()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from("qris-assets")
    .upload(objectPath, file, { upsert: true });
  if (uploadError) throw new Error(uploadError.message);

  const {
    data: { publicUrl },
  } = supabase.storage.from("qris-assets").getPublicUrl(objectPath);

  const { error } = await supabase.from("payment_channels").insert({
    type: "qris",
    qris_image_url: publicUrl,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/admin/pengaturan");
}

export async function togglePaymentChannelActive(channelId: string, currentActive: boolean) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("payment_channels")
    .update({ is_active: !currentActive })
    .eq("id", channelId);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/pengaturan");
}

export async function deletePaymentChannel(channelId: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("payment_channels").delete().eq("id", channelId);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/pengaturan");
}
