"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function registerPaidCourse(courseId: string, slug: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirect=/kelas/${slug}`);
  }

  const { data: course } = await supabase.from("courses").select("price, access_type").eq("id", courseId).single();

  if (course?.access_type !== "berbayar") {
    throw new Error("Kelas ini bukan kelas berbayar");
  }

  let { data: enrollment } = await supabase
    .from("enrollments")
    .select("id, status")
    .eq("student_id", user.id)
    .eq("course_id", courseId)
    .maybeSingle();

  if (!enrollment) {
    const { data: newEnrollment, error } = await supabase
      .from("enrollments")
      .insert({ student_id: user.id, course_id: courseId, status: "pending_payment" })
      .select("id, status")
      .single();
    if (error || !newEnrollment) throw new Error(error?.message ?? "Gagal mendaftar kelas");
    enrollment = newEnrollment;
  }

  const { data: latestPayment } = await supabase
    .from("payments")
    .select("id, status")
    .eq("enrollment_id", enrollment.id)
    .order("attempt_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latestPayment && (latestPayment.status === "pending" || latestPayment.status === "menunggu_verifikasi")) {
    redirect(`/murid/pembayaran/${latestPayment.id}`);
  }

  const { data: payment, error: paymentError } = await supabase
    .from("payments")
    .insert({
      enrollment_id: enrollment.id,
      student_id: user.id,
      course_id: courseId,
      amount: course.price,
    })
    .select("id")
    .single();

  if (paymentError || !payment) throw new Error(paymentError?.message ?? "Gagal membuat pembayaran");

  redirect(`/murid/pembayaran/${payment.id}`);
}

export async function uploadPaymentProof(paymentId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Tidak diizinkan");

  const channelId = String(formData.get("channel_id") ?? "").trim() || null;
  const proofFile = formData.get("proof");

  if (!(proofFile instanceof File) || proofFile.size === 0) {
    throw new Error("Bukti transfer wajib diunggah");
  }

  const extension = proofFile.name.split(".").pop() ?? "jpg";
  const objectPath = `${user.id}/${paymentId}-${Date.now()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from("payment-proofs")
    .upload(objectPath, proofFile, { upsert: true });

  if (uploadError) throw new Error(uploadError.message);

  const { error } = await supabase
    .from("payments")
    .update({
      channel_id: channelId,
      proof_image_url: objectPath,
      status: "menunggu_verifikasi",
      submitted_at: new Date().toISOString(),
    })
    .eq("id", paymentId);

  if (error) throw new Error(error.message);

  revalidatePath(`/murid/pembayaran/${paymentId}`);
  revalidatePath("/murid/pembayaran");
}
