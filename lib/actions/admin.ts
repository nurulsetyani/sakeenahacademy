"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function approveTeacher(profileId: string) {
  const supabase = await createClient();
  await supabase.from("profiles").update({ account_status: "active" }).eq("id", profileId);

  await supabase.from("notifications").insert({
    user_id: profileId,
    type: "guru_disetujui",
    title: "Akun guru Anda disetujui",
    body: "Anda sekarang dapat mengelola kelas di Sakeenah Academy.",
    link_url: "/guru/dashboard",
  });

  revalidatePath("/admin/pengguna");
}

export async function rejectTeacher(profileId: string) {
  const supabase = await createClient();
  await supabase.from("profiles").update({ account_status: "suspended" }).eq("id", profileId);

  await supabase.from("notifications").insert({
    user_id: profileId,
    type: "guru_ditolak",
    title: "Pengajuan akun guru ditolak",
    body: "Hubungi admin untuk informasi lebih lanjut.",
  });

  revalidatePath("/admin/pengguna");
}

export async function approvePayment(paymentId: string, enrollmentId: string, studentId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase
    .from("payments")
    .update({ status: "approved", reviewed_by: user!.id, reviewed_at: new Date().toISOString() })
    .eq("id", paymentId);

  await supabase.from("notifications").insert({
    user_id: studentId,
    type: "payment_approved",
    title: "Pembayaran disetujui",
    body: "Akses kelas Anda sudah aktif.",
    link_url: "/murid/kelas-saya",
  });

  revalidatePath("/admin/pembayaran");
  void enrollmentId; // aktivasi enrollment ditangani trigger DB (apply_payment_approval), bukan di sini
}

export async function rejectPayment(paymentId: string, studentId: string, formData: FormData) {
  const reason = String(formData.get("reason") ?? "").trim();
  if (!reason) throw new Error("Alasan penolakan wajib diisi");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase
    .from("payments")
    .update({
      status: "rejected",
      reviewed_by: user!.id,
      reviewed_at: new Date().toISOString(),
      rejection_reason: reason,
    })
    .eq("id", paymentId);

  await supabase.from("notifications").insert({
    user_id: studentId,
    type: "payment_rejected",
    title: "Pembayaran ditolak",
    body: reason,
    link_url: "/murid/pembayaran",
  });

  revalidatePath("/admin/pembayaran");
}
