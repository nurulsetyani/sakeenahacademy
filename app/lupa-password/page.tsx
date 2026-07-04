"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LupaPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);
    if (resetError) {
      setError(resetError.message);
      return;
    }
    setSent(true);
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-5 py-12">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-10 block font-display text-lg font-semibold text-brand-800">
          Sakeenah <span className="italic text-gold-600">Academy</span>
        </Link>

        {sent ? (
          <div>
            <h1 className="font-display text-2xl font-semibold text-brand-900">Cek email Anda</h1>
            <p className="mt-3 text-sm leading-[1.7] text-parchment-600">
              Tautan untuk mengatur ulang kata sandi telah dikirim ke {email}.
            </p>
          </div>
        ) : (
          <>
            <h1 className="font-display text-2xl font-semibold text-brand-900">Lupa kata sandi</h1>
            <p className="mt-2 text-sm text-parchment-600">
              Masukkan email Anda, kami kirimkan tautan untuk mengatur ulang kata sandi.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label htmlFor="email" className="field-label">Email</label>
                <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="field-input" placeholder="nama@email.com" />
              </div>

              {error && <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700">{error}</p>}

              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? "Mengirim..." : "Kirim Tautan Reset"}
              </button>
            </form>
          </>
        )}

        <p className="mt-8 text-center text-sm text-parchment-600">
          <Link href="/login" className="font-semibold text-brand-700 hover:text-brand-600">Kembali ke Masuk</Link>
        </p>
      </div>
    </div>
  );
}
