import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PublicTopbar } from "@/components/landing/public-topbar";

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

  return (
    <>
      <PublicTopbar />
      <main className="container-page py-14">
        <div className="grid gap-10 lg:grid-cols-[1.5fr,1fr]">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wide text-gold-600 capitalize">
              {course.program_type} &middot; {course.level}
            </span>
            <h1 className="mt-2 font-display text-3xl font-semibold tracking-[-0.02em] text-brand-900 sm:text-4xl">
              {course.title}
            </h1>
            <p className="mt-4 whitespace-pre-line text-parchment-700 leading-[1.7]">{course.description}</p>

            {teacher && (
              <div className="card-surface mt-8 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-parchment-400">Pengajar</p>
                <p className="mt-1 font-display font-semibold text-brand-900">{teacher.full_name}</p>
                {teacher.bio && <p className="mt-1 text-sm text-parchment-600">{teacher.bio}</p>}
              </div>
            )}
          </div>

          <div className="card-surface h-fit p-6">
            <p className="font-display text-2xl font-semibold text-brand-900">
              {course.access_type === "berbayar" ? `Rp${Number(course.price).toLocaleString("id-ID")}` : "Gratis"}
            </p>
            <Link href="/login" className="btn-primary mt-5 w-full">
              {course.access_type === "berbayar" ? "Daftar Kelas Ini" : "Ikuti Kelas Gratis"}
            </Link>
            <p className="mt-3 text-center text-xs text-parchment-400">Masuk atau daftar akun untuk melanjutkan.</p>
          </div>
        </div>
      </main>
    </>
  );
}
