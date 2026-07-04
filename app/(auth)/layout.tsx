import Link from "next/link";
import { GeometricPattern } from "@/components/landing/geometric-pattern";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-brand-800 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <GeometricPattern className="pointer-events-none absolute inset-0 text-parchment-50/[0.06]" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-gold-400/20 blur-3xl" />

        <Link href="/" className="relative font-display text-xl font-semibold text-parchment-50">
          Sakeenah <span className="italic text-gold-300">Academy</span>
        </Link>

        <blockquote className="relative">
          <p className="font-display text-3xl font-medium italic leading-snug text-parchment-50">
            &ldquo;Menuntut ilmu adalah kewajiban atas setiap muslim.&rdquo;
          </p>
          <footer className="mt-4 text-sm text-parchment-300">HR. Ibnu Majah</footer>
        </blockquote>
      </div>

      <div className="flex items-center justify-center px-5 py-12 sm:px-8">
        <div className="w-full max-w-sm">
          <Link href="/" className="mb-10 block font-display text-lg font-semibold text-brand-800 lg:hidden">
            Sakeenah <span className="italic text-gold-600">Academy</span>
          </Link>
          {children}
        </div>
      </div>
    </div>
  );
}
