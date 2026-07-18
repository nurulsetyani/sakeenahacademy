import Link from "next/link";
import { PublicTopbar } from "@/components/landing/public-topbar";
import { DotGrid } from "@/components/landing/dot-grid";
import {
  HeroReveal,
  HeroMockup,
  FadeInStagger,
  FadeInItem,
  StepsReveal,
} from "@/components/landing/motion";

const PROGRAMS = [
  {
    title: "Kelas Gratis",
    desc: "Aqidah, Fiqih, Adab, dan Kajian Islam — terbuka untuk semua, ala HSI.",
    icon: <path d="M4 6.5C4 5.67 4.67 5 5.5 5H11v14H5.5A1.5 1.5 0 0 1 4 17.5v-11ZM20 6.5C20 5.67 19.33 5 18.5 5H13v14h5.5a1.5 1.5 0 0 0 1.5-1.5v-11Z" />,
  },
  {
    title: "Kelas Berbayar",
    desc: "Bahasa Arab, Kajian Kitab, dan Program Intensif untuk pendalaman serius.",
    icon: <path d="M12 3 3 7.5l9 4.5 9-4.5L12 3ZM3 12l9 4.5 9-4.5M3 16.5l9 4.5 9-4.5" />,
  },
  {
    title: "Kelas Online Live",
    desc: "Zoom & Google Meet dengan rekaman kelas untuk yang berhalangan hadir.",
    icon: <path d="M15 10.5 20 7v10l-5-3.5ZM4 6h9a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" />,
  },
  {
    title: "Tahsin",
    desc: "Jadwal rutin, presensi, dan penilaian makhraj-tajwid-kelancaran per santri.",
    icon: <path d="M12 3v12m0 0a3 3 0 1 1-3 3m3-3a3 3 0 1 0 3 3M6 10h.01M18 10h.01M6 14a6 6 0 0 0 12 0" />,
  },
  {
    title: "Tahfidz",
    desc: "Target hafalan, setoran, dan progres yang terlacak rapi setiap saat.",
    icon: <path d="M6 4h9a3 3 0 0 1 3 3v13l-7.5-4L3 20V7a3 3 0 0 1 3-3Z" />,
  },
];

const STEPS = [
  { n: "01", title: "Pilih kelas", desc: "Telusuri katalog, pilih kelas gratis atau berbayar sesuai kebutuhan." },
  { n: "02", title: "Belajar & setor", desc: "Ikuti materi, quiz, kelas live, atau setoran hafalan sesuai jadwal." },
  { n: "03", title: "Raih sertifikat", desc: "Sertifikat otomatis terbit dengan QR verifikasi setelah lulus." },
];

export default function HomePage() {
  return (
    <>
      <PublicTopbar />

      <main className="bg-ink-50">
        {/* Hero */}
        <section className="relative overflow-hidden bg-ink-950">
          <DotGrid className="pointer-events-none absolute inset-0 text-white/[0.12]" />
          <div className="pointer-events-none absolute -right-40 -top-40 h-[36rem] w-[36rem] rounded-full bg-ember-500/25 blur-[120px]" />
          <div className="pointer-events-none absolute -left-32 bottom-0 h-80 w-80 rounded-full bg-white/[0.06] blur-3xl" />

          <div className="container-page relative grid gap-14 py-24 sm:py-32 lg:grid-cols-[1.1fr,0.9fr] lg:items-center">
            <HeroReveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-ember-300">
                Belajar Islam, Terarah &amp; Terukur
              </span>

              <h1 className="mt-6 font-display text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-white sm:text-5xl lg:text-[3.75rem]">
                Menuntut ilmu,
                <br />
                <span className="text-ember-400">dalam ketenangan</span> yang terjaga.
              </h1>

              <p className="mt-6 max-w-lg text-lg leading-[1.7] text-white/60">
                Satu platform untuk kelas gratis, kelas berbayar, kajian live, Tahsin, dan Tahfidz —
                dirancang sederhana untuk santri segala usia dan guru non-teknis.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-4">
                <Link
                  href="/kelas"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-ember-500 px-6 py-3 text-sm font-semibold text-white shadow-ember-glow transition-transform duration-200 ease-spring hover:-translate-y-0.5 hover:bg-ember-400"
                >
                  Lihat Katalog Kelas
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition-transform duration-200 ease-spring hover:-translate-y-0.5 hover:bg-white/10"
                >
                  Daftar Sekarang
                </Link>
              </div>
            </HeroReveal>

            <HeroMockup>
              <div className="relative mx-auto w-full max-w-sm pb-20 pr-10">
                <div className="-rotate-1 rounded-2xl border border-ink-900/8 bg-white p-6 shadow-ink-raised">
                  <p className="font-display text-xs font-semibold uppercase tracking-wider text-ember-600">Progress Tahfidz</p>
                  <p className="mt-2 font-display text-3xl font-semibold text-ink-950">Juz 29 &middot; 68%</p>
                  <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-ink-100">
                    <div className="h-full w-[68%] rounded-full bg-gradient-to-r from-ember-500 to-ember-400" />
                  </div>
                  <p className="mt-3 text-sm text-ink-500">Setoran terakhir: QS. Al-Mulk ayat 1&ndash;10</p>
                </div>

                <div className="absolute bottom-0 right-0 w-48 rotate-3 rounded-2xl border border-ink-900/8 bg-white p-4 shadow-ink-raised">
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Sertifikat</p>
                  <p className="mt-1 font-display text-base font-semibold text-ink-950">Bahasa Arab Dasar</p>
                  <p className="mt-1 text-xs text-ink-400">No. SA/2026/07/000123</p>
                </div>
              </div>
            </HeroMockup>
          </div>
        </section>

        {/* Programs */}
        <section className="border-t border-ink-900/8 bg-white py-20 sm:py-24">
          <div className="container-page">
            <div className="max-w-xl">
              <h2 className="font-display text-3xl font-semibold tracking-[-0.02em] text-ink-950 sm:text-4xl">
                Lima jalur belajar, satu tujuan.
              </h2>
              <p className="mt-4 text-lg leading-[1.7] text-ink-500">
                Setiap program dirancang dengan alurnya sendiri — tetap dalam satu dashboard yang sama.
              </p>
            </div>

            <FadeInStagger className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {PROGRAMS.map((p) => (
                <FadeInItem
                  key={p.title}
                  className="group rounded-2xl border border-ink-900/8 bg-white p-6 shadow-ink-soft transition-transform duration-300 ease-spring hover:-translate-y-1 hover:shadow-ink-raised"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink-950/[0.04] text-ink-800 transition-colors group-hover:bg-ember-500 group-hover:text-white">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                      {p.icon}
                    </svg>
                  </div>
                  <h3 className="mt-4 font-display text-lg font-semibold text-ink-950">{p.title}</h3>
                  <p className="mt-2 text-sm leading-[1.7] text-ink-500">{p.desc}</p>
                </FadeInItem>
              ))}
            </FadeInStagger>
          </div>
        </section>

        {/* How it works */}
        <section className="py-20 sm:py-24">
          <div className="container-page">
            <h2 className="font-display text-3xl font-semibold tracking-[-0.02em] text-ink-950 sm:text-4xl">
              Mulai dalam tiga langkah.
            </h2>

            <StepsReveal className="mt-12 grid gap-10 sm:grid-cols-3">
              {STEPS.map((s, i) => (
                <div key={s.n} className="relative">
                  <span className="font-display text-5xl font-semibold text-ember-300">{s.n}</span>
                  <h3 className="mt-3 font-display text-xl font-semibold text-ink-950">{s.title}</h3>
                  <p className="mt-2 text-sm leading-[1.7] text-ink-500">{s.desc}</p>
                  {i < STEPS.length - 1 && (
                    <span className="absolute right-[-1.25rem] top-6 hidden text-ink-300 sm:block" aria-hidden>
                      &rarr;
                    </span>
                  )}
                </div>
              ))}
            </StepsReveal>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 sm:py-24">
          <div className="container-page">
            <div className="relative overflow-hidden rounded-3xl bg-ink-950 px-8 py-16 text-center shadow-ink-raised sm:px-16">
              <DotGrid className="pointer-events-none absolute inset-0 text-white/[0.1]" />
              <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-ember-500/30 blur-[100px]" />
              <h2 className="relative font-display text-3xl font-semibold tracking-[-0.02em] text-white sm:text-4xl">
                Siap memulai perjalanan belajar Anda?
              </h2>
              <p className="relative mx-auto mt-4 max-w-md text-white/60">
                Bergabung gratis hari ini, tingkatkan ke kelas premium kapan saja.
              </p>
              <div className="relative mt-8">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-ember-500 px-7 py-3 font-semibold text-white shadow-ember-glow transition-transform duration-200 ease-spring hover:-translate-y-0.5 hover:bg-ember-400"
                >
                  Daftar Gratis Sekarang
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-ink-900/8 bg-white py-10">
        <div className="container-page flex flex-col items-center justify-between gap-4 text-sm text-ink-400 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} Sakeenah Academy.</p>
          <div className="flex gap-6">
            <Link href="/tentang" className="hover:text-ink-900">Tentang</Link>
            <Link href="/verifikasi-sertifikat" className="hover:text-ink-900">Verifikasi Sertifikat</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
