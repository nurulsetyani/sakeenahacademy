import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PublicTopbar } from "@/components/landing/public-topbar";
import { enrollFreeCourse } from "@/lib/actions/enrollment";
import { registerPaidCourse } from "@/lib/actions/payments";

const ENROLLMENT_STATUS_LABEL: Record<string, string> = {
  pending_payment: "Menunggu Pembayaran",
  active: "Sudah Terdaftar",
  completed: "Sudah Selesai",
  rejected: "Pembayaran Ditolak",
  expired: "Pendaftaran Kedaluwarsa",
};

const ENROLLMENT_STATUS_DESCRIPTION: Record<string, string> = {
  pending_payment: "Lengkapi bukti transfer untuk mengaktifkan akses kelas.",
  active: "Anda sudah terdaftar di kelas ini.",
  completed: "Anda telah menyelesaikan kelas ini.",
  rejected: "Pembayaran sebelumnya ditolak. Klik untuk mengajukan ulang.",
  expired: "Pendaftaran Anda telah kedaluwarsa.",
};

const btnPrimaryV2 =
  "inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink-950 px-6 py-3 text-sm font-semibold text-white shadow-ink-soft transition-transform duration-200 ease-spring hover:-translate-y-0.5 hover:bg-ember-600 hover:shadow-ember-glow";

export default async function KelasDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: course } = await supabase
    .from("courses")
    .select("id, title, description, access_type, price, program_type, level, teacher:profiles!courses_teacher_id_fkey(full_name, bio)")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!course) notFound();

  const teacher = course.teacher as unknown as { full_name: string; bio: string | null } | null;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase.from("profiles").select("role").eq("id", user.id).single()
    : { data: null };

  const { data: enrollment } = user
    ? await supabase
        .from("enrollments")
        .select("id, status")
        .eq("student_id", user.id)
        .eq("course_id", course.id)
        .maybeSingle()
    : { data: null };

  const { data: pendingPayment } =
    enrollment && enrollment.status === "pending_payment"
      ? await supabase
          .from("payments")
          .select("id")
          .eq("enrollment_id", enrollment.id)
          .order("attempt_number", { ascending: false })
          .limit(1)
          .maybeSingle()
      : { data: null };

  return (
    <>
      <PublicTopbar />
      <main className="min-h-screen bg-ink-50">
        <div className="container-page py-14">
          <div className="grid gap-10 lg:grid-cols-[1.5fr,1fr]">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wide text-ember-600">
                {course.program_type} &middot; {course.level}
              </span>
              <h1 className="mt-2 font-display text-3xl font-semibold tracking-[-0.02em] text-ink-950 sm:text-4xl">
                {course.title}
              </h1>
              <p className="mt-4 whitespace-pre-line text-ink-600 leading-[1.7]">{course.description}</p>

              {teacher && (
                <div className="mt-8 rounded-2xl border border-ink-900/8 bg-white p-5 shadow-ink-soft">
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Pengajar</p>
                  <p className="mt-1 font-display font-semibold text-ink-950">{teacher.full_name}</p>
                  {teacher.bio && <p className="mt-1 text-sm text-ink-500">{teacher.bio}</p>}
                </div>
              )}
            </div>

            <div className="h-fit rounded-2xl border border-ink-900/8 bg-white p-6 shadow-ink-soft">
              <p className="font-display text-2xl font-semibold text-ink-950">
                {course.access_type === "berbayar" ? `Rp${Number(course.price).toLocaleString("id-ID")}` : "Gratis"}
              </p>
              {enrollment ? (
                <>
                  <Link
                    href={pendingPayment ? `/murid/pembayaran/${pendingPayment.id}` : "/murid/kelas-saya"}
                    className={`${btnPrimaryV2} mt-5`}
                  >
                    {ENROLLMENT_STATUS_LABEL[enrollment.status] ?? "Lihat di Kelas Saya"}
                  </Link>
                  <p className="mt-3 text-center text-xs text-ink-400">
                    {ENROLLMENT_STATUS_DESCRIPTION[enrollment.status] ?? "Anda sudah terdaftar di kelas ini."}
                  </p>
                </>
              ) : !user ? (
                <>
                  <Link href={`/login?redirect=/kelas/${slug}`} className={`${btnPrimaryV2} mt-5`}>
                    {course.access_type === "berbayar" ? "Daftar Kelas Ini" : "Ikuti Kelas Gratis"}
                  </Link>
                  <p className="mt-3 text-center text-xs text-ink-400">Masuk atau daftar akun untuk melanjutkan.</p>
                </>
              ) : profile?.role !== "murid" ? (
                <p className="mt-5 text-center text-sm text-ink-500">
                  Hanya akun murid yang dapat mendaftar kelas ini.
                </p>
              ) : course.access_type === "gratis" ? (
                <form action={enrollFreeCourse.bind(null, course.id, slug)}>
                  <button type="submit" className={`${btnPrimaryV2} mt-5`}>Ikuti Kelas Gratis</button>
                </form>
              ) : (
                <form action={registerPaidCourse.bind(null, course.id, slug)}>
                  <button type="submit" className={`${btnPrimaryV2} mt-5`}>Daftar Kelas Ini</button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
