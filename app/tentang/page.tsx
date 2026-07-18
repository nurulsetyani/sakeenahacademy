import { PublicTopbar } from "@/components/landing/public-topbar";

export default function TentangPage() {
  return (
    <>
      <PublicTopbar />
      <main className="min-h-screen bg-ink-50">
        <div className="container-page py-14">
          <h1 className="font-display text-3xl font-semibold tracking-[-0.02em] text-ink-950 sm:text-4xl">
            Tentang Sakeenah Academy
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-[1.7] text-ink-600">
            Sakeenah Academy adalah platform pembelajaran Islam yang menghadirkan kelas gratis ala HSI,
            kelas berbayar, kajian online live, Tahsin, dan Tahfidz dalam satu ekosistem yang sederhana —
            dirancang agar mudah digunakan oleh guru non-teknis dan santri dari berbagai usia.
          </p>
        </div>
      </main>
    </>
  );
}
