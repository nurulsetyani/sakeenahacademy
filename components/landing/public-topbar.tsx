"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const NAV_LINKS = [
  { href: "/kelas", label: "Katalog Kelas" },
  { href: "/tentang", label: "Tentang" },
  { href: "/verifikasi-sertifikat", label: "Verifikasi Sertifikat" },
];

export function PublicTopbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-ink-900/8 bg-ink-50/80 backdrop-blur-xl">
      <div className="container-page flex h-16 items-center justify-between sm:h-20">
        <Link href="/" className="flex items-center gap-2 font-display text-lg font-semibold tracking-tight text-ink-900 sm:text-xl">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink-900 text-sm font-bold text-white">S</span>
          Sakeenah<span className="text-ember-500">.</span>
        </Link>

        <nav className="hidden items-center gap-8 sm:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-ink-600 transition-colors hover:text-ink-950"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 sm:flex">
          <Link href="/login" className="text-sm font-semibold text-ink-700 hover:text-ink-950">
            Masuk
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-ink-950 px-5 py-2.5 text-sm font-semibold text-white shadow-ink-soft transition-transform duration-200 ease-spring hover:-translate-y-0.5 hover:bg-ember-600 hover:shadow-ember-glow"
          >
            Daftar Gratis
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Tutup menu" : "Buka menu"}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-ink-700 sm:hidden"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="h-5 w-5">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.34, 1.56, 0.64, 1] }}
            className="overflow-hidden border-t border-ink-900/8 bg-ink-50 sm:hidden"
          >
            <div className="container-page flex flex-col gap-1 py-4">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-900/5"
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-2 flex gap-3 border-t border-ink-900/8 pt-4">
                <Link href="/login" className="flex-1 rounded-full border border-ink-900/15 py-2.5 text-center text-sm font-semibold text-ink-800">
                  Masuk
                </Link>
                <Link href="/register" className="flex-1 rounded-full bg-ink-950 py-2.5 text-center text-sm font-semibold text-white">
                  Daftar
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
