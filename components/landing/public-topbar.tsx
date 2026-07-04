import Link from "next/link";

export function PublicTopbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-parchment-200/70 bg-parchment-50/85 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between sm:h-20">
        <Link href="/" className="font-display text-lg font-semibold tracking-tight text-brand-800 sm:text-xl">
          Sakeenah <span className="italic text-gold-600">Academy</span>
        </Link>

        <nav className="hidden items-center gap-8 sm:flex">
          <Link href="/kelas" className="text-sm font-medium text-parchment-700 transition-colors hover:text-brand-700">
            Katalog Kelas
          </Link>
          <Link href="/tentang" className="text-sm font-medium text-parchment-700 transition-colors hover:text-brand-700">
            Tentang
          </Link>
          <Link href="/verifikasi-sertifikat" className="text-sm font-medium text-parchment-700 transition-colors hover:text-brand-700">
            Verifikasi Sertifikat
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden text-sm font-semibold text-brand-800 hover:text-brand-600 sm:inline-block">
            Masuk
          </Link>
          <Link href="/register" className="btn-primary !px-5 !py-2.5 text-sm">
            Daftar Gratis
          </Link>
        </div>
      </div>
    </header>
  );
}
